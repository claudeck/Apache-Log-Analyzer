var fs = require('fs');
var path = require('path');
var Lazy = require('lazy');
var async = require('async');
var solr = require('./solr');
var Util = require('./util');
var UUID = require('uuid-js');
var util = require('util');

var LINE_PATTERN = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) - - \[(\d{1,2}\/[a-zA-Z]{3}\/\d{4}:\d{2}:\d{2}:\d{2} -\d{4})\] "([A-Z]+) (.+?) HTTP\/1\.1" (\d{3}) (\d+) "(.+?)" "(.+?)"/


function importToSolr(logFile, done) {
    console.log("Processing " + logFile.fileName);
    var tmpFileName = '/tmp/' + logFile.fileName + ".json";
    new Lazy(fs.createReadStream(logFile.logFilePath))
        .lines
        .map(function (line) {
            var result = null;
            if (result = line.toString().match(LINE_PATTERN)) {
                return {
                    id:UUID.create().toString(),
                    logFileName:logFile.fileName,
                    ipString:result[1],
                    ipInteger:Util.ipToInteger(result[1]),
                    accessTime:Util.formatSolrTime(Util.parseApacheTime(result[2])),
                    method:result[3],
                    uri:result[4],
                    responseCode:result[5],
                    responseBytes:new Number(result[6]),
                    referrer:result[7],
                    userAgent:result[8]
                };
            } else {
                return {};
            }
        })
        .filter(function (log) {
            return log.responseCode == '500';
        })
        .join(function (logs) {

            function submitRecordToSolr(err) {
                solr.upload(tmpFileName,
                    function (err, res, body) {
                        console.log('success import!');
                        done();
                    });
            }

            fs.open(tmpFileName, 'w', 0666, function (err, fd) {
                var buf = new Buffer(util.inspect(logs));
                fs.write(fd, buf, 0, buf.length, null, submitRecordToSolr);
            });
        });
}

exports.importToSolr = importToSolr;

/*
 function main() {
 importToSolr({
 fileName : 'log1.log',
 logFilePath : '/home/administrator/node/ala/importer/test_log/1.ssl_access_log'
 }, function(){});
 }

 main()
 */