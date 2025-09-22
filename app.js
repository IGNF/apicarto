import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { requestLogger } from './middlewares/request-logger.js';

import { router as cadastre } from './controllers/cadastre/index.js';
import { router as limites_administratives} from './controllers/limites-administratives/index.js';
import { router as aoc } from './controllers/aoc/index.js';
import { router as codes_postaux } from './controllers/codes-postaux/index.js';
import { router as gpu } from './controllers/gpu/index.js';
import { router as rpg } from './controllers/rpg/index.js';
import { router as nature } from './controllers/nature/index.js';
import { router as wfs_geoportail } from './controllers/wfs-geoportail/index.js';
import { router as er } from './controllers/er/index.js';
import { router as bduni } from './controllers/bduni/index.js';
import { router as corse } from './controllers/corse/index.js';

import { datasets } from './datasets/index.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);


var app = express();

/* Mentions légales */
app.get('/api/doc/mentions', function(req,res){
    res.render('mentions');
});

/*------------------------------------------------------------------------------
 * common middlewares
 ------------------------------------------------------------------------------*/

var env = process.env.NODE_ENV;

if (env === 'production') {
    // see http://expressjs.com/fr/guide/behind-proxies.html
    app.enable('trust proxy');
}

app.use(bodyParser.json());
app.use(cors());

app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

app.use(requestLogger());

/*------------------------------------------------------------------------------
 * /api/doc - expose documentation
 -----------------------------------------------------------------------------*/

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/doc/views'));
app.use(
    '/api/doc/vendor/swagger-ui',
    express.static(__dirname + '/node_modules/swagger-ui-dist')
);
app.use('/api/doc',  express.static(__dirname + '/doc'));
app.get('/api/doc',function(req,res){
    res.render('index',{datasets: datasets});
});
app.get('/api/doc/:moduleName', function(req,res){
    res.render('module',{moduleName: req.params.moduleName});
});

app.get('/', function (req, res) {
    res.redirect('/api/doc/');
});

app.get('/api/', function (req, res) {
    res.redirect('/api/doc/');
});
/* -----------------------------------------------------------------------------
 * Routes
 -----------------------------------------------------------------------------*/
/* Module cadastre */
app.use('/api/cadastre', cadastre);

/* Module Limites Administratives */
app.use('/api/limites-administratives', limites_administratives);

/* Module AOC */
app.use('/api/aoc',aoc);

/* Module code postaux */
app.use('/api/codes-postaux', codes_postaux);

/* Module GPU */
app.use('/api/gpu',gpu);

/* Module RPG */
app.use('/api/rpg',rpg);

/* Module Nature */
app.use('/api/nature',nature);

/* Module all module IGN */
app.use('/api/wfs-geoportail',wfs_geoportail);

/* Module Espace Revendeur */
app.use('/api/er',er);

/* Module BDUni */
app.use('/api/bduni',bduni);

/* Module Dreal Corse */
app.use('/api/corse/',corse);

export {app};
