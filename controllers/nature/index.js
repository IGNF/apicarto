import { Router } from 'express';
import cors from 'cors';
import { check, matchedData } from 'express-validator';
import validateParams from '../../middlewares/validateParams.js';
import isGeometry from '../../checker/isGeometry.js';
import gppWfsClient from '../../middlewares/naturegppWfsClient.js';
import _ from 'lodash';


var router = new Router();
/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} featureTypeName le nom de la couche WFS
 */
function createNaturaProxy(featureTypeName){
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
           
            /* requête WFS GPP*/
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
                    if(featureCollection.features && featureCollection.features.length) {
                        featureCollection.features = format(featureCollection.features, featureTypeName);
                    }
                    return featureCollection;
                })
                .then(function(featureCollection) {
                    res.json(featureCollection);
                })
                .catch(function(err) {
                    res.status(500).json(err);
                })
            ;
        }
    ];
}

let format = function(features, featureTypeName) {
    if( featureTypeName != 'patrinat_rncfs:rncfs') {
        for(let i in features) {
            features[i].properties.url = features[i].properties.url_fiche;
            delete features[i].properties.url_fiche;

            if(featureTypeName == 'patrinat_sic:sic' || featureTypeName == 'patrinat_zps:zps') {
                features[i].properties.sitecode = features[i].properties.id_mnhn;
                features[i].properties.sitename = features[i].properties.nom_site;
                delete features[i].properties.id_mnhn;
                delete features[i].properties.nom_site;
            } else {
                features[i].properties.nom = features[i].properties.nom_site;
                delete features[i].properties.nom_site;
            }
        }
    }
    return features;

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


var natureValidators = [
    check('geom').optional().custom(isGeometry),
    check('_limit').optional().isNumeric(),
    check('_start').optional().isNumeric()
];

/**
 * Récupération des couches natura 2000 suivant au titre la directive Habitat
 * 
 */

var naturaValidators = natureValidators.concat([
    check('sitecode').optional().isString(),
    check('sitename').optional().isString()
]);

router.get('/natura-habitat', cors(corsOptionsGlobal),naturaValidators, createNaturaProxy('patrinat_sic:sic'));
router.post('/natura-habitat',cors(corsOptionsGlobal),naturaValidators, createNaturaProxy('patrinat_sic:sic'));

/**
 * Récupération des couches natura 2000 suivant au titre de la directive Oiseaux
 * 
 */

router.get('/natura-oiseaux', cors(corsOptionsGlobal),naturaValidators, createNaturaProxy('patrinat_zps:zps'));
router.post('/natura-oiseaux', cors(corsOptionsGlobal),naturaValidators, createNaturaProxy('patrinat_zps:zps'));

/**
* Récupération des couches sur les réserves naturelle Corse
*/

var reserveValidators = natureValidators.concat([
    check('id_mnhn').optional().isAlphanumeric(),
    check('nom').optional().isString()
]);

/**
* Récupération des couches reserves naturelles Corse
*
*/

router.get('/rnc', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_rnc:pnm'));
router.post('/rnc', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_rnc:pnm'));

/**
* Récupération des couches reserves naturelles hors Corse
*
*/

router.get('/rnn', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_rnn:rnn'));
router.post('/rnn', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_rnn:rnn'));

/**
* Récupération des couches Zones écologiques de nature remarquable
*
*/
router.get('/znieff1',cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_znieff1:znieff1'));
router.post('/znieff1', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_znieff1:znieff1'));

router.get('/znieff2', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_znieff2:znieff2'));
router.post('/znieff2', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_znieff2:znieff2'));

/**
* Récupération des couches Parcs naturels
*
*/

router.get('/pn', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_pn2:pn'));
router.post('/pn', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_pn2:pn'));

/**
* Récupération des couches Parcs naturels régionaux
*
*/

router.get('/pnr', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_pnr:pnr'));
router.post('/pnr', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_pnr:pnr'));

/**
* Récupération des couches réserves nationales de chasse et de faune sauvage
*
*/

router.get('/rncf', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_rncfs:rncfs'));
router.post('/rncf', cors(corsOptionsGlobal),reserveValidators, createNaturaProxy('patrinat_rncfs:rncfs'));

export {router};
