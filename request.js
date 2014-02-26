
module.exports = function(req, cb) {
    var utils = require('./utils');
    req.headers = req.headers || {};
    req.cookies = req.headers.Cookie || {};
    req.params = {};
    if (req.url.indexOf('?') !== -1) {
        var qs = req.url.substring(req.url.indexOf('?') + 1);
    }
    req.query = {};
    if (qs) {
        utils.miniQueryString(qs, req.query);
    }
    req.protocol = 'http';
    req.host = req.headers['host'];
    req.path = req.url.substring(0 , req.url.indexOf('?')) || req.url;

    req.is = function(type) {
        var regEx = new RegExp(type);
        return regEx.test(req.headers['content-type']);
    }

    req.param = function(name) {
        return req.param[name] || req.body[name] || req.query[name];
    }

    req.get = function(field) {
        return req.headers[field.toLowerCase()];
    }
    cb();
}
