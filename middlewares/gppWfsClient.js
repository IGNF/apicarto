import GeoportalWfsClient from 'geoportal-wfs-client';

/*
 * Middleware pour la création du client WFS geoportail
 * 
 */
var gppWfsClient = function(req, res, next) {
    /* gestion des variables d'environnement et valeur par défaut */
    var options = {
        'defaultGeomFieldName': 'geom',
        url: 'https://data.geopf.fr/wfs/ows',
        headers:{
            'User-Agent': 'apicarto',
            'Referer': 'http://localhost'
        }
    };

    if ( req.headers.referer ){
        options.headers.Referer = req.headers.referer ;
    }
    if ( process.env.GEOPORTAL_REFERER ){
        options.headers.Referer = process.env.GEOPORTAL_REFERER ;
    }

    req.gppWfsClient = new GeoportalWfsClient(options);

    next();
};

export default gppWfsClient;