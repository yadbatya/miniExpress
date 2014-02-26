
exports.miniQueryString = function (qs, fieldsObj, splitChar, sepChar) {
    splitChar = splitChar || '&';
    sepChar = sepChar || '=';
    var fields = qs.split(splitChar);
    for (i in fields) {
        var temp = fields[i].replace(/\s/, '');
        fieldsObj[fields[i].substring(0, fields[i].indexOf(sepChar))] = fields[i].substring(fields[i].indexOf(sepChar) + 1);
    }
}


exports.getMessage = function (statusCode) {
    switch(statusCode) {
        case 200:
            return 'OK';
        case 400:
            return 'Bad Request';
        case 404:
            return 'Not Found';
        case 405:
            return 'Method Not Allowed';
        case 500:
            return 'Internal Server Error';
        default:
            return '';
    }
}

exports.getType = function(pathname, res) {
    if (/\.(css)$/.test(pathname)) {
        res.headers['Content-Type'] = "text/css";
    }
    else if (/\.(js)$/.test(pathname)) {
        res.headers['Content-Type'] = "application/javascript";
    }
    else if (/\.(html)$/.test(pathname)) {
        res.headers['Content-Type'] = "text/html";
    }
    else if (/\.(txt)$/.test(pathname)) {
        res.headers['Content-Type'] = "text/plain";
    }
    else if (/\.(gif)$/.test(pathname)) {
        res.headers['Content-Type'] = "image/gif";
    }
    else if (/\.(jpeg)$/.test(pathname)) {
        res.headers['Content-Type'] = "image/jpeg";
    }
}