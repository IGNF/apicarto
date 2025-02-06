import { geojsonToWKT } from '@terraformer/wkt';
import flip from '@turf/flip';

/*
 * WARNING: Despite the use of WGS84, you need to do a flip on the coordinates
 */

/**
 * Build cql_filter parameter for GeoServer according to user params.
 *
 * @param {object} params
 * @param {object} [params.geom] search geometry intersecting the resulting features.
 * @param {number} [distance=100] rayon de recherche par défaut
 * @param {string} [geomDefaultCRS=constants.defaultCRS="urn:ogc:def:crs:EPSG::4326"] default data CRS (required in cql_filter)
 * @returns {string}
 */
function buildBduniCqlFilter(params) {
  
    var parts = [] ;
    for ( var name in params ){
        // ignore _limit, _start, etc.
        if ( name.charAt(0) === '_' || name === 'distance'){
            continue;
        }
        
        if ( name == 'geom' ){
            var geom = params[name] ;
            if ( typeof geom !== 'object' ){
                geom = JSON.parse(geom) ;
            }
            var wkt = geojsonToWKT(flip(geom));
            parts.push('DWITHIN(geometrie,' + wkt + ', ' + params.distance + ', meters)');
        }else {
            parts.push(name+'=\''+ params[name]+'\'');
        }
    }
    if ( parts.length === 0 ){
        return null;
    }
    return parts.join(' and ') ;
}

export default buildBduniCqlFilter;
