module.exports = new(function () {
    const   fs = require('fs'),
            yaml = require('js-yaml');

    this.groupByN = function (collection, n) {
        let results = [],
            group = [];

        collection.forEach((item) => {
            if (group.length === n) {
                results.push(group);
                group = [];
            }
            group.push(item);
        });
        results.push(group);

        return results;
    };

    this.readYAML = (path, callback) => {
        fs.readFile(path, (err, contents) => {
            if (err) return callback(err);

            let o = yaml.safeLoad(contents);

            callback(null, o);
        });
    }
    
    this.slugfy = (text) => {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g, "")
            .replace(/ +/g, '-');
    }

    /*********** Sync IO methods ****************/

    this.readYAMLSync = (path, callback) => {
        let contents = fs.readFileSync(path),
            o = yaml.safeLoad(contents);
        
        return o;
    }
})();