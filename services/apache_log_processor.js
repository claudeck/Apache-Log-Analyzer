var fs = require('fs');
var solr = require('./solr');
var Utils = require('../utils/utils');
var ReadLine = require('../utils/readline');
var UUID = require('uuid-js');
var util = require('util');
var useragent = require('useragent');

var LINE_PATTERN = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) - - \[(\d{1,2}\/[a-zA-Z]{3}\/\d{4}:\d{2}:\d{2}:\d{2} -\d{4})\] "([A-Z]+) (.+?) HTTP\/1\.1" (\d{3}) (\d+) "(.+?)" "(.+?)"/

function importToSolr(job, done) {
  var logFile = job.data;
  var outFileName = '/tmp/' + logFile.fileName + ".json"
  var outStream = fs.createWriteStream(outFileName);

  var readline = new ReadLine();

  readline.on('start', function() {
    outStream.write("[\n");
  });

  readline.on('progress', function(readBytes, totalBytes) {
    var percent = parseInt(readBytes / totalBytes * 100);
    if (percent > readline.progress) {
      console.log("Finish: %d, %d / %d", percent, readBytes, totalBytes);
      job.progress(readBytes, totalBytes);
      readline.progress = percent;
    }
  })

  var firstLine =true;

  readline.on('line', function(err, line) {
    if (result = line.match(LINE_PATTERN)) {
      var responseCode = result[5];
      if (responseCode == 500) {
        var userAgentString = result[8];
        var agent = useragent.lookup(userAgentString);
        var log = {
          id: UUID.create().toString(),
          logFileName: logFile.fileName,
          jobId: job.id,
          ipString: result[1],
          ipInteger: Utils.ipToInteger(result[1]),
          accessTime: Utils.formatSolrTime(Utils.parseApacheTime(result[2])),
          method: result[3],
          uri: result[4],
          responseCode: responseCode,
          responseBytes: parseInt(result[6]),
          referrer: result[7],
          userAgent: userAgentString,
          browserFamily: agent.family,
          browserMainVersion: agent.major,
          browserVersion: agent.toAgent(),
          os: agent.os
        };
        if(firstLine){
          outStream.write(JSON.stringify(log) + '\n');
          firstLine = false;
        }else{
          outStream.write("," + JSON.stringify(log) + '\n');
        }
      }
    }
  });

  readline.on('end', function() {
    outStream.write("]\n");
  });

  readline.on('close', function() {
    solr.upload(outFileName, function(err, res, body) {
      console.log('success import!');
      done();
    });
  })

  readline.readFile(logFile.logFilePath);
}

exports.importToSolr = importToSolr;