var imageResizer = {},
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    sharp = require('sharp'),
    _ = require('lodash');

module.exports = imageResizer;

imageResizer.convert = function (options, callback) {
    mkdirp(path.dirname(options.dst), function (err) {
        if (err) return callback(err);

        let s = sharp(options.src);

        if (options.width || options.height) {
            s = s.resize(options.width, options.height);
        }

        s = s.rotate();

        s.toFile(options.dst, (err, info) => {
            if (err) return callback(err);

            callback(null, options.dst);
        });
    });
};


imageResizer.static = function (root, options) {
    root = path.normalize(root);
    options = _.extend({ cacheDir: path.join(root, '.cache') }, options);

    return function (req, res, next) {
        var file = decodeURI(req.url.replace(/\?.*/, '')),
            w = req.query.w || null,
            h = req.query.h || null,
            orig = path.normalize(root + file),
            dst = path.join(options.cacheDir, `${w || ''}_${h || ''}`, file);
        if (!w && !h) {
            send_if_exists(orig, orig, res, next);
        } else {
            send_if_exists(dst, orig, res, function () {
                let opts = {
                        src: orig,
                        dst: dst,
                        width: w ? parseInt(w) : null,
                        height: h ? parseInt(h) : null
                    };

                if(w && !Number.isInteger(opts.width)) {
                    console.error(`${w} is not a valid wdith for image resizing`);
                    return next();
                }

                if(h && !Number.isInteger(opts.height)) {
                    console.error(`${h} is not a valid height for image resizing`);
                    return next();
                }

                imageResizer.convert(opts, function (err, dst) {
                    if (err) {
                        console.error(err);
                        return next();
                    }
                    res.sendFile(dst);
                });
            });
        }
    };
};

function send_if_exists(file, orig, res, callback) {
    fs.exists(file, function (exists) {
        if (!exists) {
            return callback();
        }

        fs.stat(file, function (err, stats) {
            if (err) return callback(err);

            if (stats.isFile()) {
                // Check if the original image has been changed since the cache file
                // was created and if so, recreate it, otherwise send cached file.
                fs.stat(orig, function (err, origStats) {
                    if (err) {
                        console.error(err);
                    } else if (origStats.mtime.getTime() > stats.mtime.getTime()) {
                        return callback();
                    }

                    return res.sendFile(file);
                });
            }
            else {
                return callback();
            }
        });
    });
}