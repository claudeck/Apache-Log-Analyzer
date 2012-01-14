var request = require('request');
var fs = require('fs');
var url = require('url');

var solrUrl = 'http://localhost:8080/solr';

module.exports.setServerPath = function(serverPath){
    solrUrl = serverPath;
};

exports.upload = function (jsonFile, callback) {
    fs.createReadStream(jsonFile).pipe(
        request({
                uri: solrUrl + '/update/json?commit=true',
                json:true
            },
            function (error, response, body) {
                if (response.statusCode != 200) {
                    console.log(body);
                }
                if (callback != null) {
                    callback(error, response, body);
                }
            })
    );
};

exports.search = function (queryOptions, callback) {
    var searchUrl = url.format({
        protocol: 'http',
        hostname: 'localhost',
        port: 8080,
        pathname: '/solr/select/',
        query: {
            q:queryOptions.q,
            version:2.2,
            start:0,
            rows:10,
            wt:'json'
        }
    });
    console.log(searchUrl);
    request(
        {
            uri:searchUrl
        },
        function (error, response, body) {
            if (error) {
                callback(error);
            } else {
                callback(null, JSON.parse(body));
            }
        }
    );
};