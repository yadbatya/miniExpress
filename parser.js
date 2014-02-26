/**
 * parsing a request
 * @param data - the data from the socket
 * @returns {{method: string, version: Number, url: string}} the request object parsed from the data
 */
function parse(data) {
    var bodyStr = data.substring(data.indexOf("\r\n\r\n"));
    var bodyIdx = data.indexOf(bodyStr) || data.length;
    var headers = data.substring(0, bodyIdx).split("\n");
    var httpIdx = headers[0].indexOf("HTTP");
    if (httpIdx === -1) {
        throw "bad request";
    }
    var req = {
        method: headers[0].substring(0, headers[0].indexOf(" ")),
        httpVersion: parseFloat(headers[0].substring(httpIdx + 5)),
        url: headers[0].substring(headers[0].indexOf(" "), httpIdx).replace(/\s/g, ""),
        headers: {}
    }
    if (bodyStr.replace(/\s/g, '') !== '') req.body = bodyStr;
    delete headers[0];
    for (x in headers) {
        var key = headers[x].substring(0, headers[x].indexOf(":")).replace(/\s/g, "").toLowerCase();
        var value = headers[x].substring(headers[x].indexOf(":") + 1).replace(/\s/g, "");
        //since the last line may be empty dont save an empty key=value
        if (key !== "") {
            req.headers[key]=value;
        }
    }
    return req;
}


exports = module.exports = parse;
