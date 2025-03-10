import {geoportailConfig} from './geoportail/config.js';
import {gpuConfig}from './gpu/config.js';
import {banConfig} from './base-adresse-nationale/config.js';
//import {aocConfig} from './appellations-viticoles/config.js';


var datasets = {
    'Géoportail': geoportailConfig,
    'GPU': gpuConfig,
    'Base adresse nationale': banConfig
    //'Base des appellations viticoles' : aocConfig
};

export {datasets};