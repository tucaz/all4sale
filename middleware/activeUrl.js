module.exports = function() {
    let url = require("url"),
        urls = [
            { href: "/", key: "home" },
            { href: "/about", key: "about" }
        ];
    
    return (req, res, next) => {
        let pathName = url.parse(req.url).pathname;
        
        urls.forEach((menuUrl) => {
           menuUrl.active = menuUrl.href === pathName;
           menuUrl.text = res.p.t(`global.menu.${menuUrl.key}`); 
        });
        
        req.links = urls;
        
        next();  
    }; 
}
