import GeoportalWfsClient from 'geoportal-wfs-client';


/*
 * Middleware pour la création du client WFS geoportail
 * 
 * TODO permettre la définition de la clé au niveau du serveur
 */
var gppWfsClient = function(req, res, next) {
    /* gestion des variables d'environnement et valeur par défaut */
    var options = {
        'defaultCRS': 'EPSG:3857',
        'defaultGeomFieldName': 'geom',
        url: 'https://data.geopf.fr/wfs/ows',
        headers:{
            'User-Agent': 'apicarto',
            'Referer': 'http://localhost'
        }
    };

    /* gestion du paramètre Referer */
    if ( req.headers.referer ){
        options.headers.Referer = req.headers.referer ;
    }
 
    req.gppWfsClient = new GeoportalWfsClient(options);

    next();
};

export default gppWfsClient;