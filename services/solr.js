var request = require('request');
var fs = require('fs');
var url = require('url');

exports.upload = function (jsonFile, callback) {
    fs.createReadStream(jsonFile).pipe(
        request({
                uri:'http://localhost:8080/solr/update/json?commit=true',
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
}

/*
 var UUID = require('uuid-js');
 var Util = require('./Util');

 var time = Util.parseApacheTime("13/Dec/2011:00:00:22 -0800");

 exports.update([{
 id: UUID.create().toString(),
 ipString: '8.8.8.8',
 ipInteger: Util.ipToInteger('8.8.8.8'),
 accessTime: Util.formatSolrTime(time),
 method: 'GET',
 uri: '/ehi/Alliance',
 responseCode: "200",
 responseBytes: 1234,
 referrer: "http://www.cobra-info.com/thank-you.php",
 userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:8.0) Gecko/20100101 Firefox/8.0'
 }],null);
 */
