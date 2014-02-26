var middlewares = require('./middlewares');

var queue = [];

/**
 *
 * @returns {{use: Function, listen: Function, close: Function}} an app mini express object.
 */
function miniExpress() {
    function app(req, res) {
        getResponse(req, res);
    }
    /**
     * adds a route and a function to the middleware stack.
     * @param route the url path that the middleware need to be applied to.
     * @param fn the middleware to add to the middleware stack
     * @returns {*} the app object
     */
    app.use = function(route, fn) {
        if (!fn) {
            fn = route;
            route = '';
        }
        queue.push({path: route, method: 'use', callbacks: fn});
        return this;
    };

    app.get = function(route, fn) {
        app.use(route ,fn);
        queue[queue.length - 1].method = 'get';
        if (!app.route.get) app.route.get = [];
        app.route.get.push(queue[queue.length - 1]);
        return this;
    };

    app.post = function(route, fn) {
        app.use(route ,fn);
        queue[queue.length - 1].method = 'post';
        if (!app.route.post) app.route.post = [];
        app.route.post.push(queue[queue.length - 1]);
        return this;
    };

    app.put = function(route, fn) {
        app.use(route ,fn);
        queue[queue.length - 1].method = 'put';
        if (!app.route.put) app.route.put = [];
        app.route.put.push(queue[queue.length - 1]);
        return this;
    };

    app.delete = function(route, fn) {
        app.use(route ,fn);
        queue[queue.length - 1].method = 'delete';
        if (!app.route.delete) app.route.delete = [];
        app.route.delete.push(queue[queue.length - 1]);
        return this;
    };

    app.route = {};

    /**
     * listens to a port.
     * @param port the port to listen
     * @param cb a callback
     */
    app.listen = function(port, cb) {
        var miniHttp = require('./miniHttp');
        var server = miniHttp.createServer(this);
        server.listen(port, cb);
        return server;
    };
    return app;

}
/**
 * returns a middleware that fixes the pathname for the static page. Used by the use method.
 * @param pathname - path of the folder that the page requested will be looked in. pathname can be given
 * either as a relative path or as an absolute path. Notice not to give a relative path that starts with a
 * "/" since it is actually an absolute path.
 * @returns {Function} the middleware for static pages.
 */
miniExpress.static = middlewares.static;

miniExpress.cookieParser = middlewares.cookieParser;

miniExpress.json = middlewares.json;

miniExpress.urlencoded = middlewares.urlencoded;

miniExpress.bodyParser = middlewares.bodyParser;



/**
 * parsing the response, according to the given request.
 */
function getResponse(req, res) {
    var path = require('path');
    var handler = {
        val: 0
    };
    var errors = require('./errors');
    if (req === 'error') {
        errors.err(res, 500);
        handler.val = queue.length;
    }
    else {
        if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
            errors.err(res, 405);
            handler.val = queue.length;
        }
        //create express request object
        require('./request')(req, function() {
            //create express response object
            require('./response')(res);

            require('./utils').getType(req.path, res);
        });
    }
    handler.next = function() {
        var cur, pathReg;
        if (handler.val === queue.length) {
            if (!res.body) {
                res.send(404);
            }
            if (req==='error') {
                res.end();            
            }
            else if ((req.headers['connection'] !== 'keep alive' && req.httpVersion === 1.0) || req.headers['connection'] === 'close') {
                res.end();
            }
        }

        if (handler.val < queue.length) {
            cur = handler.val++;
            if(queue[cur].method === req.method.toLowerCase() || queue[cur].method === 'use') {
                var check = req.path;
                if ((colonIndex = queue[cur].path.indexOf(':')) !== -1) {
                    var substrEnd = (queue[cur].path.indexOf('/', colonIndex) === -1) ?
                        queue[cur].path.length : queue[cur].path.indexOf('/', colonIndex);
                    var param = queue[cur].path.substring(colonIndex + 1, substrEnd);
                    substrEnd = (req.path.indexOf('/', colonIndex) === -1) ? req.path.length : req.path.indexOf('/', colonIndex);
                    var paramVal = req.path.substring(colonIndex, substrEnd);
                    req.params[param] = paramVal;
                    check = req.path.replace(paramVal, ":" + param);
                }
                pathReg = new RegExp('^/?' + queue[cur].path);

                if (pathReg.test(check)) {
                    req.modifiedUrl = '/' + check.replace(queue[cur].path, '');
                    req.modifiedUrl = path.normalize(req.modifiedUrl);
                    queue[cur].callbacks(req, res, handler.next);
                }
                else {
                    handler.next();
                }
            }
            else {
                handler.next();
            }

        }
    };
    //start running through the queue.
    handler.next();
}

exports = module.exports = miniExpress;
