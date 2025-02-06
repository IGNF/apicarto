import { Router } from 'express';
import cors from 'cors';
import * as turf from '@turf/turf';
import { check, matchedData, oneOf } from 'express-validator';
import validateParams from '../../middlewares/validateParams.js';
import isGeometry from '../../checker/isGeometry.js';
import bduniWfsClient from '../../middlewares/bduniWfsClient.js';
import _ from 'lodash';
import NodeCache from 'node-cache';

const myCache = new NodeCache();

var router = new Router();
/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} featureTypeName le nom de la couche WFS
 */
function createBduniProxy(featureTypeName){
    return [
        bduniWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);
            
            /*Valeur par défaut du paramètre distance*/
            if ( typeof params.distance == 'undefined' ) { params.distance = 100;}
           
            /* Value default pour _limit an _start */
            if ( typeof params._start == 'undefined' ) { params._start = 0;}
            if( typeof params._limit == 'undefined') {params._limit = 1000;}

            if(params.lon && params.lat) {
                params.geom = '{"type": "Point","coordinates":[' + params.lon + ',' + params.lat + ']}';
            }
            params = _.omit(params,'lon');
            params = _.omit(params,'lat');

            /* requête WFS GPP*/
            req.bduniWfsClient.getFeatures(featureTypeName, params)
                .then(function(featureCollection) {
                    featureCollection = format(featureCollection, params.geom);
                    getDepartmentName(req, res, featureCollection);
                    //res.json(format(featureCollection, params.geom));
                })
                .catch(function(err) {
                    res.status(500).json(err);
                });   
        }
    ];
}

var format = function(featureCollection, geom) {
    let features = featureCollection.features;
    let formated_features = [];
    
    for(let i in features) {
        let neo_feat = new Object();
        neo_feat.type = features[i].type;
        neo_feat.id = features[i].id;
        neo_feat.geometry_name = features[i].geometry_name;
        neo_feat.properties = {
            cleabs : features[i].properties.cleabs,
            cl_admin : features[i].properties.cpx_classement_administratif,
            nature : features[i].properties.nature,
            pos_sol : features[i].properties.position_par_rapport_au_sol,
            importance : features[i].properties.importance,
            nb_voies : features[i].properties.nombre_de_voies,
            sens : features[i].properties.sens_de_circulation,
            largeur : features[i].properties.largeur_de_chaussee,
            gestion : features[i].properties.cpx_gestionnaire,
            numero : features[i].properties.cpx_numero
        };
        if(neo_feat.properties.nb_voies) {
            neo_feat.properties.nb_voies = neo_feat.properties.nb_voies.toString();
        }

        let nearestPoint = getNearestPoint(features[i].geometry.coordinates, JSON.parse(geom).coordinates);
        neo_feat.geometry = nearestPoint.geometry;
        if(neo_feat.geometry.coordinates.length > 2) {
            neo_feat.geometry.coordinates.pop();
        }
        neo_feat.properties.distance = nearestPoint.properties.dist;

        formated_features.push(neo_feat);       
    }
    featureCollection.features = formated_features;
    return featureCollection;
};

var getNearestPoint = function(line, point) {
    return turf.nearestPointOnLine(turf.lineString(line), turf.point(point),{units: 'meters'});
};

var getDepartmentName = function(req, res, featureCollection) {
    let setDepName = function(featureCollection, depList) {
        for(let i in featureCollection.features) {
            for(let j in depList) {
                if(featureCollection.features[i].properties.gestion == depList[j].nom) {
                    featureCollection.features[i].properties.gestion = depList[j].insee_dep;
                    break;
                }
            }
        }
        return featureCollection;
    };

    if(myCache.get('departmentsList')) {
        featureCollection = setDepName(featureCollection, myCache.get('departmentsList'));
        return res.json(featureCollection);
    } else {
        req.bduniWfsClient.getFeatures('ADMINEXPRESS-COG-CARTO.LATEST:departement', {'_propertyNames':  ['insee_dep', 'nom']})
            .then(function(featureCollectionDep) {
                let list = [];
                for(let i in featureCollectionDep.features) {
                    let feat = featureCollectionDep.features[i];
                    list.push({'nom' : feat.properties.nom, 'insee_dep' : feat.properties.insee_dep});
                }
                featureCollection = setDepName(featureCollection, list);
                myCache.set('departmentsList', list);
                return res.json(featureCollection);
            })
            .catch(function(err) {
                res.status(500).json(err);
            });
    }
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

var isPoint = function(geom) {
    if(JSON.parse(geom).type == 'Point' &&  JSON.parse(geom).coordinates.length == 2) {
        return true;
    } else {
        return false;
    }
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
    check('geom').optional().custom(isPoint).withMessage('La géométrie doit être un Point.'),
    check('_limit').optional().isNumeric().withMessage('Le champ "_limit" doit être un entier'),
    check('_start').optional().isNumeric().withMessage('Le champ "_start" doit être un entier'),
    check('lon').optional().isNumeric().withMessage('La longitude est invalide'),
    check('lat').optional().isNumeric().withMessage('La latitude est invalide')
];

/**
* Récupération des couches
*
*/

router.get('/troncon', cors(corsOptionsGlobal),moduleValidators, createBduniProxy('BDTOPO_V3:troncon_de_route'));
router.post('/troncon', cors(corsOptionsGlobal),moduleValidators, createBduniProxy('BDTOPO_V3:troncon_de_route'));

export {router};
