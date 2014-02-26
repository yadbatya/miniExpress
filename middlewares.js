var utils = require('./utils');

exports.static = function(pathname) {
    var fs = require('fs');
    var path = require('path');
    pathname = (pathname === "" || !pathname) ? __dirname : pathname;
    var modPath = path.resolve(path.normalize(pathname));
    return function(req, res, next) {
        if (req.method !== 'GET' || res.body) {
            next();
        }
        else {
            fs.readFile(modPath + req.modifiedUrl, function(err, file) {
                if (err) {
                    if (!next) {
                        res.send(404);
                    }
                    else {
                        next();
                    }
                }
                else {
                    fs.stat(modPath + req.modifiedUrl, function(err, stats) {
                        res.statusCode = 200;
                        res.headers['content-length'] = stats.size;
                        res.body = file;
                        res.writeHead(res.statusCode, res.headers);
                        res.write(res.body);
                        if (next) {
                            next();
                        }
                    });
                }
            });
        }

    }
}

exports.cookieParser = function() {
    return function(req, res, next) {
        if(req.headers.cookie) {
            utils.miniQueryString(req.headers.cookie, req.cookies, ';');
        }
        next();
    }
}

exports.json = function() {
    return function(req, res, next) {
        if (req.get('content-type')) {
            if (req.flag) return next();
            var idx = req.get('content-type').indexOf('application/json');
            if (idx === -1) {
                return next();
            }
            req.flag = true;
            req.body = JSON.parse(req.body);
            next();
        }
        else {
            next();
        }
    }
}

exports.urlencoded = function() {
    return function(req, res, next) {
        if (req.get('content-type')) {
            var idx = req.get('content-type').indexOf('application/x-www-form-urlencoded');
            if (req.flag || idx === -1) {
                //in order to not ruin the asynchronous calls, and not to call next twice, we did this.
                if (req.bodyParse) {
                    return exports.json()(req, res, next);
                }
            }
            req.flag = true;
            var query = req.body;
            req.body = {};
            utils.miniQueryString(query, req.body);
            next();
        }
        else {
            next();
        }
    }
}

exports.bodyParser = function() {
    return function(req, res, next) {
        if ('string' === typeof req.body) {
            if ((req.body = req.body.replace(/\r\n/g, '')) === '') {
                req.body = undefined;
            }
        }
        req.bodyParse = true;
        if (req.body) {
            exports.urlencoded()(req, res, next);
        }
        else {
            req.body = {};
            next();
        }
    }
}
