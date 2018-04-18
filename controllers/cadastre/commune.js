module.exports = function (req, res, next) {
    req.gppWfsClient.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:commune", req.cadastreParams)
        .then(function(featureCollection) {
            res.json(featureCollection);
        })
        .catch(function(err) {
            res.status(500).json(err);
		})
    ;
};
