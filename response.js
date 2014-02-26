module.exports = function(res) {
    var utils = require('./utils');
    res.get = function(field) {
        return res.headers[field.toLowerCase()];
    }

    res.status = function(code) {
        res.statusCode = code;
        return res;
    }

    res.set = function(field, value) {
        if (value) {
            res.headers[field] = value;
        }
        else {
            utils.miniQueryString(field.toString(), res.headers, ',', ':');
        }
    }

    res.header = res.set;

    res.json = function(status, body){
        if (!body) {
            if (typeof status === 'number') {
                res.set('Content-Length', utils.getMessage(status).length);
                res.set('Content-Type', 'application/json');
                res.writeHead(status);
                res.end(status);
            }
            else {
                body = status;
                status = 200;
            }
        }
        if (!res.get('Content-Length')) {
            res.set('Content-Length', JSON.stringify(body).length);
        }
        if (!res.get('Content-Type')) {
            res.set('Content-Type', 'application/json');
        }
        res.writeHead(status);
        res.write(JSON.stringify(body));
    }

    res.send = function(status, body) {
        if (!body) {
            if (typeof status === 'number') {
                res.set('Content-Length', utils.getMessage(status).length);
                res.set('Content-Type', 'text/plain');
                res.writeHead(status);
                res.end(utils.getMessage(status));
            }
            else {
                body = status;
                status = 200;
            }
        }
        if (typeof body === 'object' || Array.isArray(body)) {
            res.json(status, body);
        }
        if (typeof body === 'string') {
            if (!res.get('Content-Length')) {
                res.set('Content-Length', body.length);
            }
            if (!res.get('Content-Type')) {
                res.set('Content-Type', 'text/plain');
            }
            res.writeHead(status);
            res.write(body);
        }
    }
    
    res.cookie = function(name, value, options) {
        if (!res.headers['set-cookie']) {
            res.headers['set-cookie'] = [];
        }
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }
        var optionsString = "";        
        if (options) {
            options.path = options.path || '/';
            optionsString += ";";
            for (option in options) {
                if (typeof option === 'boolean' && options[option]) {
                    optionsString += option + ';';
                }
                else {
                    optionsString += option + '=' + options[option] + ';';                    
                }
            }
            optionsString = optionsString.substring(0, optionsString.length - 1);
        }
        res.headers['set-cookie'].push(name + "=" + value + optionsString);
    }
}