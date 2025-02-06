import { ClientBduni as GeoportalWfsClientBduni } from '../lib/ClientBduni.js';


/*
 * Middleware pour la création du client WFS geoportail
 * 
 * TODO permettre la définition de la clé au niveau du serveur
 */
var bduniWfsClient = function(req, res, next) {
    /* gestion des variables d'environnement et valeur par défaut */
    var options = {
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
    req.bduniWfsClient = new GeoportalWfsClientBduni(options);

    next();
};

export default bduniWfsClient;