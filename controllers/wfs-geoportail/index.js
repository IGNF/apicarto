import { Router } from 'express';
import cors from 'cors';
import { check, matchedData } from 'express-validator';
import validateParams from '../../middlewares/validateParams.js';
import isGeometry from '../../checker/isGeometry.js';
import gppWfsClient from '../../middlewares/gppWfsClient.js';
import _ from 'lodash';


var router = new Router();

/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} valeurSearch du chemin le nom de la couche WFS
 */
function createWfsProxy() {
    return [
        gppWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);
            var featureTypeName= params.source;
            params = _.omit(params,'source');
            /* Value default pour _limit an _start */
            if ( typeof params._start == 'undefined' ) {params._start = 0;}
            if( typeof params._limit == 'undefined') {params._limit = 1000;}
           
            /* requête WFS GPP*/
            req.gppWfsClient.getDescribeFeatureType(featureTypeName)
                //récupération du geomFieldName
                .then(function(featureCollection) {
                    var nom_geom = false;
                    for(var i in featureCollection.featureTypes[0].properties) {
                        if(featureCollection.featureTypes[0].properties[i].name == "geom"
                        || featureCollection.featureTypes[0].properties[i].name == "the_geom")
                        {
                            nom_geom = featureCollection.featureTypes[0].properties[i].name;
                            break;
                        }
                    }
                    if(!nom_geom) {
                        for(var i in featureCollection.featureTypes[0].properties) {
                            if(featureCollection.featureTypes[0].properties[i].type.match("Point")
                            || featureCollection.featureTypes[0].properties[i].type.match("Polygon")
                            || featureCollection.featureTypes[0].properties[i].type.match("LineString"))
                            {
                                nom_geom = featureCollection.featureTypes[0].properties[i].name;
                            }
                        }    
                    }

                    req.gppWfsClient.defaultGeomFieldName = nom_geom;

                    //récupération du CRS
                    req.gppWfsClient.getCapabilities()
                        .then(function(response){
                            var crs = "urn:ogc:def:crs:EPSG::4326";
                            var regexp = new RegExp("<Name>" + featureTypeName + ".*?<\/DefaultCRS>");
                            if(response.match(regexp)) {
                                var feat = response.match(regexp)[0];
                                if(feat.match(/EPSG::[0-9]{4,5}/)) {
                                    crs = feat.match(/EPSG::[0-9]{4,5}/)[0].replace("::",":");
                                }
                            }
                            req.gppWfsClient.defaultCRS = crs;

                            //récupération des features
                            req.gppWfsClient.getFeatures(featureTypeName, params)
                            /* uniformisation des attributs en sortie */
                            .then(function(featureCollection){
                                featureCollection.features.forEach(function(feature){
                                    if ( ! feature.properties.code_insee ){
                                        feature.properties.code_insee = feature.properties.code_dep+feature.properties.code_com;
                                    }
                                });
                                return featureCollection;
                            })
                            .then(function(featureCollection) {
                                res.json(featureCollection);
                            })
                            .catch(function(err) {
                                res.status(500).json(err);
                            })
                            ;
                        })
                        .catch(function(err) {
                            res.status(500).json(err);
                        })
                    ;

                    
                })
                .catch(function(err) {
                    res.status(500).json(err);
                })
            ;
        }
    ];
}


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
var moduleValidator = [
    check('source').exists().withMessage('Le paramètre source pour le nom de la couche WFS géoportail  est obligatoire'),
    check('geom').optional().custom(isGeometry),
    check('_limit').optional().isNumeric(),
    check('_start').optional().isNumeric()
];


 
router.get('/search', cors(corsOptionsGlobal),moduleValidator, createWfsProxy());



export {router};
