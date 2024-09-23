import { Router } from 'express';
import cors from 'cors';
import { check, matchedData } from 'express-validator';
import validateParams from '../../middlewares/validateParams.js';
import isGeometry from '../../checker/isGeometry.js';
import isCodeInsee from '../../checker/isCodeInsee.js';
import parseInseeCode from '../../helper/parseInseeCode.js';
import gppWfsClient from '../../middlewares/gppWfsClient.js';
import _ from 'lodash';

var router = new Router();

/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} featureTypeName le nom de la couche WFS
 */
function createCadastreProxy(featureTypeName){
    return [
        gppWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);
            var featureTypeNameFinal = featureTypeName;
            params = _.omit(params,'apikey');
            if ((params.source_ign) && (featureTypeName != 'BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad') && (featureTypeName != 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS:feuille')) {
                if(params.source_ign.toUpperCase() == 'BDP') {
                    featureTypeNameFinal = featureTypeName.replace('CADASTRALPARCELS.PARCELLAIRE_EXPRESS','BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G');
                } else if(params.source_ign.toUpperCase() == 'PCI') {
                    featureTypeNameFinal = featureTypeName;
                }  else {
                    return res.status(400).send({
                        code: 400,
                        message: 'Pour une recherche sur la couche PCI EXPRESS : la valeur doit être PCI.Pour une recherche sur la couche BD Parcellaire: la valeur doit être BDP.'
                    });

                }
            }
            params = _.omit(params,'source_ign');

            /*  insee => code_dep et code_com */
            if ( params.code_insee ){
                var inseeParts = parseInseeCode(params.code_insee);
                params.code_dep = inseeParts.code_dep;
                params.code_com = inseeParts.code_com;
                params = _.omit(params,'code_insee');
            }

            /* hack du couple code_dep et code_com + limite réponse à 500 features dans le cas des communes  */
            if ( featureTypeNameFinal.endsWith('commune') ){
                if ( params.code_dep && params.code_com ){
                    params.code_insee = params.code_dep + params.code_com ;
                    params = _.omit(params,'code_com');
                    params = _.omit(params,'code_dep');
                }
                if( typeof params._limit == 'undefined') {params._limit = 500;}
                if( params._limit > 500) {
                    return res.status(400).send({
                        code: 400,
                        message: 'La valeur de l\'attribut "limit" doit être inférieur ou égal à 500.'
                    });
                }
            }

            /* Value default pour _limit an _start */
            if ( typeof params._start == 'undefined' ) {params._start = 0;}
            if( typeof params._limit == 'undefined') {params._limit = 1000;}
           
            /* requête WFS GPP*/
            req.gppWfsClient.getFeatures(featureTypeNameFinal, params)
                /* uniformisation des attributs en sortie */
                .then(function(featureCollection){
                    featureCollection.features.forEach(function(feature){
                        if ( ! feature.properties.code_insee ){
                            feature.properties.code_insee = feature.properties.code_dep+feature.properties.code_com;
                        }
                    });
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
                    res.json(featureCollection);
                })
                .catch(function(err) {
                    res.status(500).json(err);
                });
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

/**1000
 * Permet d'alerter en cas de paramètre ayant changer de nom
 * 
 * TODO Principe à valider (faire un middleware de renommage des paramètres si l'approche est trop violente)
 */


var legacyValidators = [
    check('codearr').optional().custom(function(){return false;}).withMessage('Le paramètre "codearr" a été remplacé par "code_arr" pour éviter des renommages dans les données et chaînage de requête'),
    check('dep').optional().custom(function(){return false;}).withMessage('Le paramètre "dep" a été remplacé par "code_dep" pour éviter des renommages dans les données et chaînage de requête'),
    check('insee').optional().custom(function(){return false;}).withMessage('Le paramètre "insee" a été remplacé par "code_insee" pour éviter des renommages dans les données et chaînage de requête'),
    check('source_ign').optional().isString().isLength({min:3,max:3}).withMessage('Les seules valeurs possibles sont: PCI pour utiliser les couches PCI-Express ou BDP pour utiliser les couches BD Parcellaires')
];

var communeValidators = legacyValidators.concat([
    check('code_insee').optional().custom(isCodeInsee),
    check('code_dep').optional().isAlphanumeric().isLength({min:2,max:2}).withMessage('Code département invalide'),
    check('code_com').optional().isNumeric().isLength({min:2,max:3}).withMessage('Code commune invalide'),
    check('nom_com').optional(),
    check('geom').optional().custom(isGeometry),
    check('_limit').optional().isNumeric(),
    check('_start').optional().isNumeric()
]);

router.get('/commune', cors(corsOptionsGlobal),communeValidators, createCadastreProxy('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:commune'));
router.post('/commune',cors(corsOptionsGlobal),communeValidators, createCadastreProxy('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:commune'));

/**
 * Récupération des divisions de la BDParcellaire
 * la valeur source_ign ne sera pas utilisée pour la recherche.
 * Nous avons la requête module pour faire directement une recherche sur PCI EXPRESS
 */

var divisionValidators = communeValidators.concat([
    check('section').optional().isAlphanumeric().isLength({min:2,max:2}).withMessage('Le numéro de section est sur 2 caractères'),
    check('code_arr').optional().isNumeric().isLength({min:3,max:3}).withMessage('Le code arrondissement est composé de 3 chiffres'),
    check('com_abs').optional().isNumeric().isLength({min:3,max:3}).withMessage('Le prefixe est composé de 3 chiffres obligatoires')
]);
router.get('/division', cors(corsOptionsGlobal),divisionValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad'));
router.post('/division', cors(corsOptionsGlobal),divisionValidators, createCadastreProxy('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:divcad'));


/**
* Récupération des parcelles pour une commune.
*
* Paramètres : code_dep=25 et code_com=349
*
*/
var parcelleValidators = divisionValidators.concat([
    check('numero').optional().matches(/\w{4}/).withMessage('Le numéro de parcelle est sur 4 caractères')
]);
router.get('/parcelle', cors(corsOptionsGlobal),parcelleValidators, createCadastreProxy('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle'));
router.post('/parcelle', cors(corsOptionsGlobal),parcelleValidators, createCadastreProxy('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle'));

/**
* Récupération des localisants
*
* Paramètres : une feature avec pour nom "geom"...
*
*/
router.get('/localisant',cors(corsOptionsGlobal),parcelleValidators, createCadastreProxy('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:localisant'));
router.post('/localisant', cors(corsOptionsGlobal),parcelleValidators, createCadastreProxy('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:localisant'));


/**
 * Récupérations des feuilles(divisions sur BDParcellaire) pour PCI Express
 * Les champs validator sont identiques aux divisions
 * 
 */

router.get('/feuille', cors(corsOptionsGlobal),divisionValidators, createCadastreProxy('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:feuille'));
router.post('/feuille', cors(corsOptionsGlobal),divisionValidators, createCadastreProxy('CADASTRALPARCELS.PARCELLAIRE_EXPRESS:feuille'));


export { router };
