import httpClient from './httpClient.js';
import buildBduniCqlFilter from './buildBduniCqlFilter.js';

/**
 * @classdesc
 * WFS access client for the geoportal
 * @constructor
 */
var ClientBduni = function (options) {
    // should be removed to allow user/password?
    this.url = options.url || 'https://data.geopf.fr/wfs/ows';
    this.headers = options.headers || {};

};

/**
 * Get WFS URL
 */
ClientBduni.prototype.getUrl = function () {
    return this.url;
};


/**
 * @private
 * @returns {Object}
 */
ClientBduni.prototype.getDefaultParams = function () {
    return {
        service: 'WFS',
        version: '2.0.0'
    };
};

/**
 * @private
 * @returns {Object}
 */
ClientBduni.prototype.getDefaultHeaders = function () {
    return this.headers;
};

/**
 * Get features for a given type
 *
 * @param {string} typeName - name of type
 * @param {object} params - define cumulative filters (bbox, geom) and to manage the pagination
 * @param {number} [params._start=0] index of the first result (STARTINDEX on the WFS)
 * @param {number} [params._limit] maximum number of result (COUNT on the WFS)
 * @param {object} [params.geom] search geometry intersecting the resulting features.
 * @param {string} [defaultCRS="urn:ogc:def:crs:EPSG::4326"] default data CRS (required in cql_filter)
 *
 * @return {Promise}
 */
ClientBduni.prototype.getFeatures = function (typeName, params) {
    params = params || {};

    var headers = this.getDefaultHeaders();
    headers['Accept'] = 'application/json';

    /*
     * GetFeature params
     */
    var queryParams = this.getDefaultParams();
    queryParams['request'] = 'GetFeature';
    queryParams['typename'] = typeName;
    queryParams['outputFormat'] = 'application/json';
    queryParams['srsName'] = 'CRS:84';
    if (typeof params._limit !== 'undefined') {
        queryParams['count'] = params._limit;
    }
    if (typeof params._start !== 'undefined') {
        queryParams['startIndex'] = params._start;
    }

    var cql_filter = buildBduniCqlFilter(params);
    var body = (cql_filter !== null) ? 'cql_filter=' + encodeURI(cql_filter) : '';
    return httpClient.post(this.getUrl(), body, {
        params: queryParams,
        headers: headers,
        responseType: 'text',
        transformResponse: function (body) {
            try {
                return JSON.parse(body);
            } catch (err) {
                // forward xml errors
                throw {
                    'type': 'error',
                    'message': body
                };
            }
        }
    }).then(function (response) {
        return response.data;
    });
};

export {ClientBduni};
