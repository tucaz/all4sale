module.exports = new(function(){
    const   glob = require('glob'),
            fs = require('fs'),
            path = require('path'),
            _ = require('lodash'),
            Polyglot = require('node-polyglot');

    this.loadDefaults = function(localePath) {
        let files = glob.sync(localePath);
        let r = {};
        
        _.each(files, file => {
            let locale = path.basename(file, '.json');
            let content = fs.readFileSync(file);
            content = JSON.parse(content);
            
            r[locale] = new Polyglot({locale, phrases: content});
        });

        return r;
    }

    this.filterAvailable = function(defaults, available) {
        let r = {};
        
        Object.keys(defaults).forEach(key => {
            if(available.indexOf(key) > -1)
                r[key] = defaults[key];
        });

        return r;
    }
})