var request = require('request');
var fs = require('fs');
var url = require('url');
var SolrServer = require('config').Solr;

exports.upload = function (jsonFile, callback) {
    fs.createReadStream(jsonFile).pipe(
        request({
                uri: SolrServer.url + '/update/json?commit=true',
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
            start: queryOptions.start,
            rows:10,
            wt:'json'
        }
    });
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