import { Router } from 'express';
import cors from 'cors';
import { check, matchedData } from 'express-validator';
import validateParams from '../../middlewares/validateParams.js';
import isGeometry from '../../checker/isGeometry.js';
import isCodeInsee from '../../checker/isCodeInsee.js';
import gpuWfsClient from '../../middlewares/gpuWfsClient.js';
import _ from 'lodash';

var router = new Router();

/**
 * Creation d'une chaîne de proxy sur le GPU
 * @param {Object} typeName 
 */
function createGpuProxy(typeName){
    return [
        validateParams,
        gpuWfsClient,
        function(req,res){
            var params = matchedData(req);
            params._limit = 5000;

            //Si couche du type generateur ou assiette le champ categorie corresponds à suptype
            if (params.categorie) {
                if ((typeName.indexOf('generateur')) || (typeName.indexOf('assiette'))) {
                    params.suptype = params.categorie.toLowerCase();
                    params = _.omit(params,'categorie');
                }
            }

            req.gpuWfsClient.getFeatures(typeName, params)
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

/*--------------------------------------------------------------------------------------------
 * DU
 -------------------------------------------------------------------------------------------*/

const mapping = {
    'municipality': 'wfs_du:municipality',
    'document': 'wfs_du:document',
    'zone-urba': 'wfs_du:zone_urba',
    'secteur-cc': 'wfs_du:secteur_cc',
    'prescription-pct': 'wfs_du:prescription_pct',
    'prescription-lin': 'wfs_du:prescription_lin',
    'prescription-surf': 'wfs_du:prescription_surf',
    'info-pct': 'wfs_du:info_pct',
    'info-surf': 'wfs_du:info_surf',
    'info-lin': 'wfs_du:info_lin',
    'acte-sup': 'wfs_sup:acte_sup',
    'assiette-sup-p': 'wfs_sup:assiette_sup_p',
    'assiette-sup-l': 'wfs_sup:assiette_sup_l',
    'assiette-sup-s': 'wfs_sup:assiette_sup_s',
    'generateur-sup-p': 'wfs_sup:generateur_sup_p',
    'generateur-sup-l': 'wfs_sup:generateur_sup_l',
    'generateur-sup-s': 'wfs_sup:generateur_sup_s'
    
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
/* Définition des tests paramètres */
var legacyValidators = [
    check('geom').optional().custom(isGeometry)
];

var communeValidators = legacyValidators.concat([
    check('insee').optional().custom(isCodeInsee)
]);

var partitionValidators = legacyValidators.concat([
    check('partition').optional().isString()
]);

var categoriesValidators = partitionValidators.concat([
    check('categorie').optional().isString()
]);

router.get('/municipality', cors(corsOptionsGlobal),communeValidators, createGpuProxy(mapping['municipality']));
router.post('/municipality',cors(corsOptionsGlobal), communeValidators, createGpuProxy(mapping['municipality']));


router.get('/document',cors(corsOptionsGlobal),partitionValidators,createGpuProxy(mapping['document']));
router.post('/document',cors(corsOptionsGlobal),partitionValidators,createGpuProxy(mapping['document']));

router.get('/zone-urba', cors(corsOptionsGlobal),partitionValidators, createGpuProxy(mapping['zone-urba']));
router.post('/zone-urba', cors(corsOptionsGlobal),partitionValidators, createGpuProxy(mapping['zone-urba']));

router.get('/secteur-cc', cors(corsOptionsGlobal),partitionValidators, createGpuProxy(mapping['secteur-cc']));
router.post('/secteur-cc', cors(corsOptionsGlobal),partitionValidators, createGpuProxy(mapping['secteur-cc']));

router.get('/prescription-pct', cors(corsOptionsGlobal),partitionValidators, createGpuProxy(mapping['prescription-pct']));
router.post('/prescription-pct', cors(corsOptionsGlobal),partitionValidators, createGpuProxy(mapping['prescription-pct']));

router.get('/prescription-lin', cors(corsOptionsGlobal),partitionValidators,createGpuProxy(mapping['prescription-lin']));
router.post('/prescription-lin', cors(corsOptionsGlobal),partitionValidators,createGpuProxy(mapping['prescription-lin']));

router.get('/prescription-surf', cors(corsOptionsGlobal),partitionValidators ,createGpuProxy(mapping['prescription-surf']));
router.post('/prescription-surf', cors(corsOptionsGlobal),partitionValidators ,createGpuProxy(mapping['prescription-surf']));

router.get('/info-pct', cors(corsOptionsGlobal), partitionValidators,createGpuProxy(mapping['info-pct']));
router.post('/info-pct', cors(corsOptionsGlobal), partitionValidators,createGpuProxy(mapping['info-pct']));

router.get('/info-lin', cors(corsOptionsGlobal),partitionValidators, createGpuProxy(mapping['info-lin']));
router.post('/info-lin', cors(corsOptionsGlobal),partitionValidators, createGpuProxy(mapping['info-lin']));

router.get('/info-surf', cors(corsOptionsGlobal), partitionValidators, createGpuProxy(mapping['info-surf']));
router.post('/info-surf', cors(corsOptionsGlobal), partitionValidators, createGpuProxy(mapping['info-surf']));

/*--------------------------------------------------------------------------------------------
 * SUP
 -------------------------------------------------------------------------------------------*/

router.get('/acte-sup', cors(corsOptionsGlobal),partitionValidators,createGpuProxy(mapping['acte-sup']));
router.post('/acte-sup', cors(corsOptionsGlobal),partitionValidators,createGpuProxy(mapping['acte-sup']));

router.get('/assiette-sup-p', cors(corsOptionsGlobal),categoriesValidators , createGpuProxy(mapping['assiette-sup-p']));
router.post('/assiette-sup-p', cors(corsOptionsGlobal),categoriesValidators , createGpuProxy(mapping['assiette-sup-p']));

router.get('/assiette-sup-l', cors(corsOptionsGlobal),categoriesValidators , createGpuProxy(mapping['assiette-sup-l']));
router.post('/assiette-sup-l', cors(corsOptionsGlobal),categoriesValidators , createGpuProxy(mapping['assiette-sup-l']));

router.get('/assiette-sup-s', cors(corsOptionsGlobal),categoriesValidators, createGpuProxy(mapping['assiette-sup-s']));
router.post('/assiette-sup-s', cors(corsOptionsGlobal),categoriesValidators, createGpuProxy(mapping['assiette-sup-s']));

/*--------------------------------------------------------------------------------------------
 * Generateur sup
 -------------------------------------------------------------------------------------------*/

router.get('/generateur-sup-p', cors(corsOptionsGlobal),categoriesValidators,createGpuProxy(mapping['generateur-sup-p']));
router.post('/generateur-sup-p', cors(corsOptionsGlobal),categoriesValidators,createGpuProxy(mapping['generateur-sup-p']));

router.get('/generateur-sup-l', cors(corsOptionsGlobal),categoriesValidators, createGpuProxy(mapping['generateur-sup-l']));
router.post('/generateur-sup-l', cors(corsOptionsGlobal),categoriesValidators, createGpuProxy(mapping['generateur-sup-l']));

router.get('/generateur-sup-s', cors(corsOptionsGlobal),categoriesValidators, createGpuProxy(mapping['generateur-sup-s']));
router.post('/generateur-sup-s', cors(corsOptionsGlobal),categoriesValidators, createGpuProxy(mapping['generateur-sup-s']));

/*--------------------------------------------------------------------------------------------
 * Recherche dans toutes les tables par geom...
 -------------------------------------------------------------------------------------------*/
router.get('/all', cors(corsOptionsGlobal), [
    check('geom').optional().custom(isGeometry),
], validateParams, gpuWfsClient, function(req,res){
    /**
     * Récupération des paramètres
     */
    var params = matchedData(req);
    // Limite de 500 par type
    params._limit = 500;

    /**
     * Préparation d'une série de sous-requêtes
     */
    var promises = [];
    for ( var name in mapping ){
        var typeName = mapping[name];

        var promise = new Promise(function(resolve, reject) {
            req.gpuWfsClient.getFeatures(typeName, params)
                .then(function(featureCollection) {
                    featureCollection.featureType = name;
                    resolve(featureCollection);
                })
                .catch(function(err) {
                    err.featureType = typeName;
                    reject(err);
                })
            ;
        });

        promises.push(promise);
    }

    /**
     * Exécution des sous-requêtes et renvoi du résultat
     */
    Promise.all(promises).then(function(result){
        res.json(result);   
    }).catch(function(err){
        res.status(500).json(err);
    });
});


export {router};
