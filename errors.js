/**
 * generates responses for bad requests
 * @param res the response to generate
 * @param errNum the error number for the request.
 */
exports.err = function(res, errNum) {
    var errMsg;
    res.statusCode = errNum;
    res.headers['Content-Type'] = 'text/plain';
    switch(errNum) {
        case 404:
            errMsg = 'ERROR 404!\nPage not found.';
            res.headers['Content-Length'] = errMsg.length;
            res.body = errMsg;
            break;
        case 405:
            errMsg = 'ERROR 405!\nUnsupported method.';
            res.headers['Content-Length'] = errMsg.length;
            res.body = errMsg;
            break;
        case 500:
            errMsg = 'ERROR 500!\nBad request.';
            res.headers['Content-Length'] = errMsg.length;
            res.body = errMsg;
            break;
        default:
            throw "bad error";
    }
}