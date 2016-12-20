module.exports = function(productImagesUrl, resizeProductImage) {
    let path = require('path'),
        ViewHelper = require(path.resolve(__dirname, "../viewHelpers.js"));
    
    return (req, res, next) => {
        res.locals.helpers = new ViewHelper(res.p, productImagesUrl, resizeProductImage); 

        next();  
    }; 
}
    
