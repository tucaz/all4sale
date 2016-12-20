module.exports = function(config) {
    return (req, res, next) => {
        res.locals.config = {
            siteAddress: config.siteAddress
        };

        next();  
    }; 
}