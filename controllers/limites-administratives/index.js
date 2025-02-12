import { Router } from 'express';
import cors from 'cors';
import { check, matchedData, oneOf } from 'express-validator';
import validateParams from '../../middlewares/validateParams.js';
import isGeometry from '../../checker/isGeometry.js';
import gppWfsClient from '../../middlewares/gppWfsClient.js';
import _ from 'lodash';
import NodeCache from 'node-cache';

const myCache = new NodeCache();

var router = new Router();
/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} featureTypeName le nom de la couche WFS
 */
function createAdminExpressProxy(featureTypeName){
    return [
        gppWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);
            params = _.omit(params,'apikey');
            // Tranformation de la géométrie dans le réferentiel 3857
           
            /* Value default pour _limit an _start */
            if ( typeof params._start == 'undefined' ) { params._start = 0;}
            if( typeof params._limit == 'undefined') {params._limit = 1000;}

            if(params.lon && params.lat) {
                params.geom = '{"type": "Point","coordinates":[' + params.lon + ',' + params.lat + ']}';
            }
            params = _.omit(params,'lon');
            params = _.omit(params,'lat');
            
            //recherche dans le cache
            if(myCache.get(featureTypeName)) {
                req.gppWfsClient.defaultGeomFieldName = myCache.get(featureTypeName)[0];
                req.gppWfsClient.defaultCRS = myCache.get(featureTypeName)[1];

                //récupération des features
                getFeat(req, res, featureTypeName, params);
            }
            else {
                /* requête WFS GPP*/
                req.gppWfsClient.getDescribeFeatureType(featureTypeName, params)
                /* uniformisation des attributs en sortie */
                    .then(function(featureCollection){
                        var nom_geom = false;
                        for(var i in featureCollection.featureTypes[0].properties) {
                            if(featureCollection.featureTypes[0].properties[i].name == 'geom'
                            || featureCollection.featureTypes[0].properties[i].name == 'the_geom')
                            {
                                nom_geom = featureCollection.featureTypes[0].properties[i].name;
                                break;
                            }
                        }
                        if(!nom_geom) {
                            for(var i in featureCollection.featureTypes[0].properties) {
                                if(featureCollection.featureTypes[0].properties[i].type.match('Point')
                                || featureCollection.featureTypes[0].properties[i].type.match('Polygon')
                                || featureCollection.featureTypes[0].properties[i].type.match('LineString'))
                                {
                                    nom_geom = featureCollection.featureTypes[0].properties[i].name;
                                }
                            }    
                        }

                        req.gppWfsClient.defaultGeomFieldName = nom_geom;

                        //récupération du CRS
                        req.gppWfsClient.getCapabilities()
                            .then(function(response){
                                var crs = 'urn:ogc:def:crs:EPSG::4326';
                                var regexp = new RegExp('<Name>' + featureTypeName + '.*?<\/DefaultCRS>');
                                if(response.match(regexp)) {
                                    var feat = response.match(regexp)[0];
                                    if(feat.match(/EPSG::[0-9]{4,5}/)) {
                                        crs = feat.match(/EPSG::[0-9]{4,5}/)[0].replace('::',':');
                                    }
                                }
                                if(crs == 'EPSG:4326') {
                                    crs = 'urn:ogc:def:crs:EPSG::4326';
                                }
                                req.gppWfsClient.defaultCRS = crs;

                                //maj du cache
                                myCache.set(featureTypeName, [nom_geom, crs]);

                                //récupération des features
                                getFeat(req, res, featureTypeName, params);
                            })
                            .catch(function(err) {
                                res.status(500).json(err);
                            });
                    })
                    .catch(function(err) {
                        res.status(500).json(err);
                    });
            }   
        }
    ];
}

var getFeat = function(req, res, featureTypeName, params) {
    req.gppWfsClient.getFeatures(featureTypeName, params)
        /* uniformisation des attributs en sortie */
        .then(function(featureCollection){
            if(featureCollection.links && featureCollection.links.length) {
                for(let i in featureCollection.links) {
                    if(featureCollection.links[i].href && featureCollection.links[i].href.match(/STARTINDEX\=[0-9]*/)) {
                        let num = featureCollection.links[i].href.match(/STARTINDEX\=[0-9]*/)[0].replace('STARTINDEX=','');
                        let href = req.gppWfsClient.headers.Referer.replace(/\/api.*/, '') + req.originalUrl;
                        if(href.match('_start')) {
                            href = href.replace(/_start\=[0-9]*/, '_start=' + num);
                        } else {
                            href += '&_start=' + num;
                        }
                        featureCollection.links[i].href = href;
                    }
                }
            }
            return featureCollection;
        })
        .then(function(featureCollection) {
            featureCollection = format(featureTypeName, featureCollection);
            if(featureTypeName.match('commune')) {
                getDepartmentAndRegionName(req, res, featureCollection);
            }
            else {
                res.json(featureCollection);
            }
            
        })
        .catch(function(err) {
            res.status(500).json(err);
        })
    ;
};

var getDepartmentAndRegionName = function(req, res, featureCollection) {
    let setDepName = function(featureCollection, depList) {
        for(let i in featureCollection.features) {
            for(let j in depList) {
                if(featureCollection.features[i].properties.insee_dep == depList[j].insee_dep) {
                    featureCollection.features[i].properties.nom_dep = depList[j].nom;
                    break;
                }
            }
        }
        return featureCollection;
    };
    let setRegName = function(featureCollection, depList) {
        for(let i in featureCollection.features) {
            for(let j in depList) {
                if(featureCollection.features[i].properties.insee_reg == depList[j].insee_reg) {
                    featureCollection.features[i].properties.nom_reg = depList[j].nom;
                    break;
                }
            }
        }
        return featureCollection;
    };

    if(myCache.get('departmentsList') && myCache.get('regionsList')) {
        featureCollection = setDepName(featureCollection, myCache.get('departmentsList'));
        featureCollection = setRegName(featureCollection, myCache.get('regionsList'));
        return res.json(featureCollection);
    } else {
        req.gppWfsClient.getFeatures('ADMINEXPRESS-COG-CARTO.LATEST:departement', {'_propertyNames':  ['insee_dep', 'nom']})
            .then(function(featureCollectionDep) {
                let list = [];
                for(let i in featureCollectionDep.features) {
                    let feat = featureCollectionDep.features[i];
                    list.push({'nom' : feat.properties.nom, 'insee_dep' : feat.properties.insee_dep});
                }
                featureCollection = setDepName(featureCollection, list);
                myCache.set('departmentsList', list);
            })
            .then(function() {
                req.gppWfsClient.getFeatures('ADMINEXPRESS-COG-CARTO.LATEST:region', {'_propertyNames':  ['insee_reg', 'nom']})
                    .then(function(featureCollectionReg) {
                        let list = [];
                        for(let i in featureCollectionReg.features) {
                            let feat = featureCollectionReg.features[i];
                            list.push({'nom' : feat.properties.nom, 'insee_reg' : feat.properties.insee_reg});
                        }
                        featureCollection = setRegName(featureCollection, list);
                        myCache.set('regionsList', list);
                        return res.json(featureCollection);
                    });
            })
            .catch(function(err) {
                res.status(500).json(err);
            });
    }
};

var format = function(featureTypeName, featureCollection) {
    if(featureTypeName.match('commune')) {
        for(let i in featureCollection.features) {
            let feat = featureCollection.features[i];
            if(feat.properties.population) {
                feat.properties.population = feat.properties.population.toString();
            }
            if(feat.properties.nom) {
                feat.properties.nom_com = feat.properties.nom;
                delete feat.properties.nom;
            }
            if(feat.properties.nom_m) {
                feat.properties.nom_com_m = feat.properties.nom_m;
                delete feat.properties.nom_m;
            }
            if(feat.properties.siren_epci) {
                feat.properties.code_epci = feat.properties.siren_epci;
                delete feat.properties.siren_epci;
            }
            if(feat.properties.insee_can) {
                delete feat.properties.insee_can;
            }
        }
    } 
    else if (featureTypeName.match('departement')) {
        for(let i in featureCollection.features) {
            let feat = featureCollection.features[i];
            if(feat.properties.nom) {
                feat.properties.nom_dep = feat.properties.nom;
                delete feat.properties.nom;
            }
            if(feat.properties.nom_m) {
                delete feat.properties.nom_m;
            }
        }
    } 
    else {
        for(let i in featureCollection.features) {
            let feat = featureCollection.features[i];
            if(feat.properties.nom) {
                feat.properties.nom_reg = feat.properties.nom;
                delete feat.properties.nom;
            }
            if(feat.properties.nom_m) {
                delete feat.properties.nom_m;
            }
        }
    }
    return featureCollection;
};

var corsOptionsGlobal = function(origin,callback) {
    var corsOptions;
    if (origin) {
        corsOptions = {
            origin: origin,
            optionsSuccessStatus: 200,
            methods: 'GET,POST',
            credentials: true
        };
    } else {
        corsOptions = {
            origin : '*',
            optionsSuccessStatus : 200,
            methods:  'GET,POST',
            credentials: true
        };
    }
    callback(null, corsOptions);
};

/**
 * Permet d'alerter en cas de paramètre ayant changer de nom
 * 
 * TODO Principe à valider (faire un middleware de renommage des paramètres si l'approche est trop violente)
 */


var moduleValidators = [
    oneOf(
        [
            check('geom').exists(),
            [check('lon').exists(), check('lat').exists()]
        ], {message: 'Il faut renseigner soit le champ "geom", soit les champs "lon" et "lat".'}
    ),
    oneOf(
        [
            check('geom').isEmpty(),
            [check('lon').isEmpty(), check('lat').isEmpty()]
        ], {message: 'Si le champ "geom" est renseigné, les champs "lon" et "lat" ne doivent pas être renseignés.'}
    ),
    check('geom').optional().custom(isGeometry).withMessage('La géométrie est invalide.'),
    check('_limit').optional().isNumeric().withMessage('Le champ "_limit" doit être un entier'),
    check('_start').optional().isNumeric().withMessage('Le champ "_start" doit être un entier'),
    check('lon').optional().isNumeric().withMessage('La longitude est invalide'),
    check('lat').optional().isNumeric().withMessage('La latitude est invalide')
];

/**
* Récupération des couches
*
*/

router.get('/commune', cors(corsOptionsGlobal),moduleValidators, createAdminExpressProxy('ADMINEXPRESS-COG.LATEST:commune'));
router.post('/commune', cors(corsOptionsGlobal),moduleValidators, createAdminExpressProxy('ADMINEXPRESS-COG.LATEST:commune'));

router.get('/departement', cors(corsOptionsGlobal),moduleValidators, createAdminExpressProxy('ADMINEXPRESS-COG.LATEST:departement'));
router.post('/departement', cors(corsOptionsGlobal),moduleValidators, createAdminExpressProxy('ADMINEXPRESS-COG.LATEST:departement'));

router.get('/region', cors(corsOptionsGlobal),moduleValidators, createAdminExpressProxy('ADMINEXPRESS-COG.LATEST:region'));
router.post('/region', cors(corsOptionsGlobal),moduleValidators, createAdminExpressProxy('ADMINEXPRESS-COG.LATEST:region'));

export {router};
