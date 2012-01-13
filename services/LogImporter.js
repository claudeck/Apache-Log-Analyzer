var fs = require('fs');
var path = require('path');
var Lazy = require('lazy');
var async = require('async');
var solr = require('./Solr');
var util = require('./Util');
var UUID = require('uuid-js');

var LINE_PATTERN = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) - - \[(\d{1,2}\/[a-zA-Z]{3}\/\d{4}:\d{2}:\d{2}:\d{2} -\d{4})\] "([A-Z]+) (.+?) HTTP\/1\.1" (\d{3}) (\d+) "(.+?)" "(.+?)"/

function collectLogFiles(logPaths, processCallback) {
    async.filter(logPaths, path.exists,
        function (existsPaths) {
            async.map(existsPaths, fs.stat, function (err, stats) {
                var logFiles = [];
                for (var i = 0; i < stats.length; i++) {
                    if (stats[i].isFile()) {
                        logFiles.push(logPaths[i]);
                    }
                }
                processCallback(logFiles);
            });
        }
    )
}

function importToSolrFromLogFiles(logFiles) {
    async.forEach(logFiles, importToSolr, function (err) {
        console.log(err);
    })
}

function lineToResponse(line) {
    var result = null;
    if (result = line.toString().match(LINE_PATTERN)) {
        return {
            id:UUID.create().toString(),
            ipString:result[1],
            ipInteger:util.ipToInteger(result[1]),
            accessTime:util.formatSolrTime(util.parseApacheTime(result[2])),
            method:result[3],
            uri:result[4],
            responseCode: result[5],
            responseBytes: new Number(result[6]),
            referrer:result[7],
            userAgent:result[8]
        };
    } else {
        return {};
    }
}

function submitRecordToSolr(log) {
    solr.update([log],
        function (err, res, body) {
            console.log('success import a record');
        })
}

function importToSolr(logFile) {
    console.log("Processing " + logFile);
    new Lazy(fs.createReadStream(logFile))
        .lines
        .map(lineToResponse)
        .filter(function(log) {
            return log.responseCode == '500';
        })
        .map(submitRecordToSolr)
}

function importLogFromPaths(logPaths) {
    collectLogFiles(logPaths, importToSolrFromLogFiles);
}

function usage() {
    console.log('Please input some log dir or files.');
    process.exit();
}

function main() {
    if (process.argv.length <= 2) {
        usage();
    } else {
        importLogFromPaths(process.argv.slice(2, process.argv.length + 1));
    }
}

main()
