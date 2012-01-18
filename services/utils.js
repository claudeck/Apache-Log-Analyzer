function parseApacheTime(str){
    var timePattern = /(\d+)\/([A-Za-z]+)\/(\d{4}):(\d{2}:\d{2}:\d{2} .+)/;
    var monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var monthLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var accessTime = null;
    var result = null;
    if(result = str.match(timePattern)){
        accessTime = new Date(monthLong[monthShort.indexOf(result[2])] + " " + result[1] + ", " + result[3] + " " + result[4]);
    }
    return accessTime;
}

function formatSolrTime(date){
    if(date == null) return "";
    return date.getFullYear() + "-" + fillZero((date.getMonth() + 1)) + "-" + fillZero(date.getDate())
        + "T" + fillZero(date.getHours()) + ":"
        + fillZero(date.getMinutes()) + ":" + fillZero(date.getSeconds()) + ".000Z";
}

function fillZero(num){
    if(num < 10) return "0" + num;
    return num;
}

function ipToInteger(ipString){
    var ipParts = ipString.split('.');
    return ipParts[3] << 24 | ipParts[2] | ipParts[1] | ipParts[0];
}

exports.parse = function(str, fmt){
    
}

exports.parseApacheTime = parseApacheTime;
exports.formatSolrTime = formatSolrTime;
exports.ipToInteger = ipToInteger;