
exports.createServer = function(handler) {
    var net = require('net');
    var closed = false;
    var request, response;
    var server = {
        __proto__: require('events').EventEmitter.prototype,
        listen: function(port, cb) {
            netServer.listen(port, cb);
        }
    };
    server.addListener('close', function(){
        if (!closed) {
            closed = true;
            netServer.close();
        }
    });
    var netServer = net.createServer(function(socket) {
        var parse = require('./parser');
        socket.setTimeout(2000, function() {
            socket.end();
        });
        socket.on('error', function(err) {
            socket.end();
        });
        socket.on('data', function(data) {
            try {
                request = parse(data);
            } catch (err) {
                request = 'error';
            }
            response = {
                write: function(data) {
                    socket.write(data);
                },
                end: function(data) {
                    socket.end(data);
                },
                writeHead: function(statusCode, options) {
                    var utils = require('./utils');
                    options = options || response.headers;
                    var spacer = '\r\n';
                    var head = 'HTTP/' + request.httpVersion + ' ' + statusCode + ' '
                     + utils.getMessage(statusCode) + spacer;
                    for (option in options) {
                        if (Array.isArray(options[option])) {
                            for (i in options[option]) {
                                head += option + ':' + options[option][i] + spacer;
                            }
                        }
                        else {
                            head += option + ': ' + options[option] + spacer;
                        }
                    }
                    head += spacer;
                    socket.write(head);
                },
                headers: {}
            };
            handler(request, response);
        });

    });
    netServer.on('close', function() {
        if (!closed) {
            closed = true;
            server.emit('close');
        }
    })
    return server;
}

