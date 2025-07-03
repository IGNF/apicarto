import { Router } from 'express';
import cors from 'cors';
import { check, matchedData } from 'express-validator';
import validateParams from '../../middlewares/validateParams.js';
import isGeometry from '../../checker/isGeometry.js';
import aocWfsClient from '../../middlewares/aocWfsClient.js';
import gppWfsClient from '../../middlewares/gppWfsClient.js';
import GeoJSONParser from 'jsts/org/locationtech/jts/io/GeoJSONParser.js';
import RelateOp from 'jsts/org/locationtech/jts/operation/relate/RelateOp.js';
import _ from 'lodash';

var router = new Router();

/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} featureTypeName le nom de la couche WFS
 */
function createAocProxy(featureTypeName) {
    return [
        gppWfsClient,
        aocWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);
            //récupération des features
            getFeat(req, res, featureTypeName, params);
        }
    ];
};

var getFeat = function(req, res, featureTypeName, params) {

    req.aocWfsClient.headers.apikey = params.apikey;
    params = _.omit(params,'apikey');
    req.gppWfsClient.defaultGeomFieldName = 'geometrie';

    req.gppWfsClient.getFeatures('ADMINEXPRESS-COG.LATEST:commune', params)
        .then(function(featureCollectionCommune) {
            let codeInsee = [];
            let geomCom = [];
            for(let i in featureCollectionCommune.features) {
                codeInsee.push(featureCollectionCommune.features[i].properties.code_insee);
                geomCom.push(featureCollectionCommune.features[i].geometry);
            }
            let geom = params.geom;
            params = _.omit(params,'geom');
            params.insee = codeInsee;
            req.aocWfsClient.getFeatures(featureTypeName, params)
                .then(function(featureCollection){
                    for(let i in featureCollection.features) {

                        featureCollection.features[i].properties.id_uni = featureCollection.features[i].properties.iduni;
                        delete featureCollection.features[i].properties.iduni;

                        featureCollection.features[i].properties.appellation = featureCollection.features[i].properties.appellatio;
                        delete featureCollection.features[i].properties.appellatio;

                        if(isFalseGeometry(featureCollection.features[i].geometry)) {
                            featureCollection.features[i].geometry = null;
                            delete featureCollection.features[i].bbox;
                        }

                        if(featureCollection.features[i].properties.segment == 1) {
                            featureCollection.features[i].properties.granularite = 'exacte';
                        } else {
                            featureCollection.features[i].properties.granularite = 'commune';
                        }

                        if(featureCollection.features[i].properties.idapp == '1022') {
                            featureCollection.features[i].properties.instruction_obligatoire = true;
                        } else{
                            featureCollection.features[i].properties.instruction_obligatoire = false;
                        }

                        if(featureCollection.features[i].properties.granularite == 'commune' 
                        && featureCollection.features[i].properties.instruction_obligatoire == false) {
                            for(let j in codeInsee) {
                                if(featureCollection.features[i].properties.insee == codeInsee[j]) {
                                    featureCollection.features[i].geometry = geomCom[j];
                                    break;
                                }
                            }
                        }

                        if(featureCollection.features[i].geometry)
                        {
                            featureCollection.features[i].properties.contains = isContained(geom, featureCollection.features[i].geometry);
                        } else {
                            featureCollection.features[i].properties.contains = null;
                        }
                    }
                    res.json(featureCollection);
                })
                .catch(function(err) {
                    res.status(500).json(err);
                })
            ;
        })
        .catch(function(err) {
            res.status(500).json(err);
        });
};

var isFalseGeometry = function(geom) {
    let isFalseGeom = false;
    if(geom.coordinates 
        && geom.coordinates[0] 
        && geom.coordinates[0][0] 
        && geom.coordinates[0][0][0]
        && geom.coordinates[0][0][0][0] == 3 
        && geom.coordinates[0][0][0][1] == 49) {
        
        isFalseGeom = true;
    }
    return isFalseGeom;
};

var isContained = function(geom1, geom2) {

    let geoParser = new GeoJSONParser();

    let jstsGeom1 = geoParser.read(geom1);
    let jstsGeom2 = geoParser.read(geom2);

    return RelateOp.contains(jstsGeom1, jstsGeom2);
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
 * TODO Principe à valider (faire un middleware de renommage des paramètres screateCadastreProxyi l'approche est trop violente)
 */
var moduleValidator = [
    check('geom').exists().custom(isGeometry),
    check('apikey').exists()
];

 
router.post('/appellation-viticole', cors(corsOptionsGlobal),moduleValidator, createAocProxy('appellation_inao_fam_gpkg_wfs:appellation_inao_fam'));

export {router};
