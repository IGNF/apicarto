import { Router } from 'express';
import cors from 'cors';
import { check, matchedData } from 'express-validator';
import validateParams from '../../middlewares/validateParams.js';
import isGeometry from '../../checker/isGeometry.js';
import erWfsClient from '../../middlewares/erWfsClient.js';
import _ from 'lodash';


var router = new Router();

/**
 * Creation d'une chaîne de proxy sur le geoportail
 * @param {String} featureTypeName le nom de la couche WFS
 */
function createErProxy(featureTypeName,typeSearch){
    return [
        erWfsClient,
        validateParams,
        function(req,res){
            var params = matchedData(req);
            
            /** Gestion affichage des valeurs avec has_geometrie
             * si true : affichage uniquement des résultats avec géométrie
             * si false: affichage des résultats avec ou sans géométrie
             */

            if((typeSearch == 'product') || (typeSearch == 'category')) {
                if(params.admin == 'Y') {
                    params.has_geometry=false;
                } else {
                    params.has_geometry=true;
                }
            }

            params = _.omit(params,'admin');

            /** Gestion de la requete product */
            if (typeSearch == 'product') {
                //For module Product utilisation parametre name pour la recherche
                if (params.name) {
                    params.namepr = params.name.toUpperCase();
                    params = _.omit(params,'name');
                }
                if((params.date_maj_deb) && (params.date_maj_fin)) {
                    params.field_date = params.date_maj_deb +'T00:00:00Z;'+ params.date_maj_fin+'T23:59:59Z';
                    params = _.omit(params,'date_maj_deb');
                    params = _.omit(params,'date_maj_fin');
                } else {
                    if((params.date_maj_deb) || (params.date_maj_fin)) {
                        return res.status(400).send({
                            code: 400,
                            message: 'Utilisation des dates avec une date de fin et une date de debut avec moins de 6 mois entre les 2 dates.'
                        });
                    }
                }

                // For params publication_date select between 2 dates
                
                if((params.publi_date_deb) && (params.publi_date_fin)) {
                    params.field_publication_date = params.publi_date_deb +'T00:00:00Z;'+ params.publi_date_fin+'T23:59:59Z';
                    params = _.omit(params,'publi_date_deb');
                    params = _.omit(params,'publi_date_fin');
                } else {
                    if((params.publi_date_deb) || (params.publi_date_fin)) {
                        return res.status(400).send({
                            code: 400,
                            message: 'Utilisation des dates de publication avec une date de fin et une date de debut avec moins de 6 mois entre les 2 dates.'
                        });
                    }
                }

                // For params depublication_date select between 2 dates
                
                if((params.depubli_date_deb) && (params.depubli_date_fin)) {
                    params.field_depublication_date = params.depubli_date_deb +'T00:00:00Z;'+ params.depubli_date_fin+'T23:59:59Z';
                    params = _.omit(params,'depubli_date_deb');
                    params = _.omit(params,'depubli_date_fin');
                } else {
                    if((params.depubli_date_deb) || (params.depubli_date_fin)) {
                        return res.status(400).send({
                            code: 400,
                            message: 'Utilisation des dates de depublication avec une date de fin et une date de debut avec moins de 6 mois entre les 2 dates.'
                        });
                    }
                }
            } 

            //For _propertyNames, we need to transform the string in Array
            if(params._propertyNames) {
                params._propertyNames = params._propertyNames.split(';');    
            }
            // For module Category Gestion du parametre name
            if (typeSearch == 'category')  {
                if (params.name && params.type) {
                    if(params.type == 's') { 
                        // Recherche sur segment_title
                        params.segment_title = params.name;
                    } else if (params.type == 't') {
                        //Recherche sur theme_title
                        params.theme_title = params.name;
                    }else if (params.type == 'c') {
                        // Recherche sur collection_title
                        params.collection_title = params.name;
                    } else {
                        return res.status(400).send({
                            code: 400,
                            message: 'Le champ type contient uniquement les valeurs t, c ou s'
                        });
                    } 
                    /* Suppression des paramètres après transformations */
                    params = _.omit(params,'name');
                    params = _.omit(params,'type');
                } else {
                    if(params.name || params.type) {
                        return res.status(400).send({
                            code: 400,
                            message: 'Les 2 champs name et type doivent être renseignés pour cette recherche spécfique. Pour Le champ type les valeurs acceptées sont t,c ou s'
                        });
                    }
                }    
            }

            /** Gestion de la requete Grid */
            if (typeSearch == 'grid') {
                if (params.title) {
                    params.title = params.title.toUpperCase();
                }
                if (params.zip_codes) {
                    params.zip_codes = '"[\\"'+ params.zip_codes.replace(',' , ',\\"') + '\\"]"';
                }
            }
            /* Value default pour _limit an _start */
            if ( typeof params._start == 'undefined' ) {params._start = 0;}
            if( typeof params._limit == 'undefined') {params._limit = 1000;}
           
            /* requête WFS GPP*/
            req.erWfsClient.getFeatures(featureTypeName, params)
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

/**
 * Récuperation des produits de l'espace revendeur
 * 
 */


var erValidators = [
    check('geom').optional().custom(isGeometry),
    check('_limit').optional().isNumeric(),
    check('_start').optional().isNumeric(),
    check('_propertyNames').optional().isString()
];

var productValidators = erValidators.concat([
    check('is_manufactured').optional().isBoolean(),
    check('code_ean').optional().isAlphanumeric(),
    check('code_article').optional().isString(),
    check('name').optional().isString(),
    check('type').optional().isString(),
    check('publication_date').optional().isString(),
    check('date_maj_deb').optional().isString(), // Param ne servant que pour admin
    check('date_maj_fin').optional().isString(), // Param ne servant que pour admin
    check('admin').optional().isAlphanumeric().isLength({min:1,max:1}).withMessage('Le champ admin doit être Y ou N'),
    check('publi_date_deb').optional().isString(), // Param ne servant que pour admin
    check('publi_date_fin').optional().isString(), // Param ne servant que pour admin
    check('depubli_date_deb').optional().isString(), // Param ne servant que pour admin
    check('depubli_date_fin').optional().isString() // Param ne servant que pour admin
    
]);

router.get('/product', cors(corsOptionsGlobal),productValidators, createErProxy('espace_revendeurs:product','product'));
router.post('/product',cors(corsOptionsGlobal),productValidators, createErProxy('espace_revendeurs:product','product'));

/**
 * Récupération des information sur les category dans le flux product_view
 * 
 */

var categoryValidators = erValidators.concat([
    check('name').optional().isString(),
    check('type').optional().isAlphanumeric().isLength({min:1,max:1}).withMessage('Le type est sur 1 caractère'),
    check('category_id').optional().isString(),
    check('admin').optional().isAlphanumeric().isLength({min:1,max:1}).withMessage('Le champ admin doit être Y ou N')
]);

router.get('/category', cors(corsOptionsGlobal),categoryValidators, createErProxy('espace_revendeurs:product' ,'category'));
router.post('/category', cors(corsOptionsGlobal),categoryValidators, createErProxy('espace_revendeurs:product','category'));


/**
* Récuperation des informations sur le flux espace_revendeurs:grid_view
*
*/

var gridValidators = erValidators.concat([
    check('name').optional().isString(),
    check('title').optional().isString(),
    check('type').optional().isString(),
    check('zip_codes').optional().isString()
]);

router.get('/grid', cors(corsOptionsGlobal),gridValidators, createErProxy('espace_revendeurs:grid','grid'));
router.post('/grid', cors(corsOptionsGlobal),gridValidators, createErProxy('espace_revendeurs:grid','grid'));


export {router};