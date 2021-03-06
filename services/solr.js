var request = require('request');
var fs = require('fs');
var url = require('url');
var SolrServer = require('config').Solr;

exports.upload = function (jsonFile, callback) {
    fs.createReadStream(jsonFile).pipe(
        request({
                uri: url.format(SolrServer.url) + '/update/json?commit=true',
                json:true,
                method: 'post'
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
        protocol: SolrServer.url.protocol,
        hostname: SolrServer.url.hostname,
        port: SolrServer.url.port,
        pathname: SolrServer.url.pathname + '/select/',
        query: {
            q:queryOptions.q,
            version:2.2,
            start: queryOptions.start,
            rows:10,
            wt:'json',
            facet: true,
            'facet.field': ['browserFamily', 'os'],
            'facet.mincount': 1
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