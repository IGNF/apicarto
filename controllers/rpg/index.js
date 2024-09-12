import { Router } from 'express';
import cors from 'cors';
import { check, matchedData } from 'express-validator';
import validateParams from '../../middlewares/validateParams.js';
import isGeometry from '../../checker/isGeometry.js';
import gppWfsClient from '../../middlewares/gppWfsClient.js';
import _ from 'lodash';


var router = new Router();
const lastYearRPG = 2022;
const firstYearRPG = 2010;

/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} valeurSearch du chemin le nom de la couche WFS
 */
function createRpgProxy(valeurSearch) {
    return [
        gppWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);
            var featureTypeName= '';
            params = _.omit(params,'apikey');
            /*  Modification année dans le flux */
            if (valeurSearch == 'v1') {
                if ((params.annee >= firstYearRPG) && (params.annee <= 2014))  {
                    featureTypeName = 'RPG.' + params.annee + ':rpg_' + params.annee;
                } else {
                    return res.status(400).send({
                        code: 400,
                        message: 'Année Invalide : Valeur uniquement entre ' + firstYearRPG + ' et 2014'
                    });  
                }
            } else {
                if ((params.annee >= 2015) && (params.annee <= lastYearRPG)) {
                    featureTypeName = 'RPG.' + params.annee + ':parcelles_graphiques';
                } else {
                    return res.status(400).send({
                        code: 400,
                        message: 'Année Invalide : Valeur uniquement entre 2015 et ' + lastYearRPG
                    });

                }
            }
            /* Supprimer annee inutile ensuite de params */
            params = _.omit(params,'annee');

            /* Value default pour _limit an _start */
            if ( typeof params._start == 'undefined' ) {params._start = 0;}
            if( typeof params._limit == 'undefined') {params._limit = 1000;}
           
            /* requête WFS GPP*/
            req.gppWfsClient.getFeatures(featureTypeName, params)
                /* uniformisation des attributs en sortie */
                .then(function(featureCollection){
                    featureCollection.features.forEach(function(feature){
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
var rpgValidators = [
    check('annee').exists().isNumeric().isLength({min:4,max:4}).withMessage('Année sur 4 chiffres'),
    check('code_cultu').optional().isString(),
    check('geom').exists().custom(isGeometry).withMessage('La géométrie est invalide.'),
    check('_limit').optional().isNumeric(),
    check('_start').optional().isNumeric()
];

/** Nous avons 2 requetes identiques mais il y a une difference dans les champs 
 * Possibilité de traiter différement par la suite.
 * /v1 : corresponds aux années avant 2015
 * /v2 : corresponds aux années à partir de 2015
 */
router.get('/v1', cors(corsOptionsGlobal),rpgValidators, createRpgProxy('v1'));
router.post('/v1', cors(corsOptionsGlobal),rpgValidators, createRpgProxy('V1'));

router.get('/v2', cors(corsOptionsGlobal),rpgValidators, createRpgProxy('v2'));
router.post('/v2', cors(corsOptionsGlobal),rpgValidators, createRpgProxy('V2'));



export {router};
