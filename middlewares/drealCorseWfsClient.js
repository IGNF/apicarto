import GeoportalWfsClient from 'geoportal-wfs-client';

/*
 * middleware pour la création du client geoportail
 */
var drealCorseWfsClient = function(req, res, next) {
    var referer = 'http://localhost';

    /* forward du referer du client */
    if ( req.headers.referer ){
        referer = req.headers.referer ;
    }

    req.drealCorseWfsClient = new GeoportalWfsClient({
        'defaultGeomFieldName': 'geom',
        'apiKey':  'geoserver',
        'url' : 'https://georchestra.ac-corse.fr/{apiKey}/wfs',
        'headers':{
            Referer: referer,
            'User-Agent': 'apicarto'
        }
    });
    next();
};

export default drealCorseWfsClient;