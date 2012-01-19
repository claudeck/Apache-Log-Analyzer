var UUID = require('uuid-js');
var Utils = require('./services/utils');
var ReadLine = require('./utils/readline');
var fs = require('fs');
var util = require('util');

var filePath = 'C:/tmp/2012-01-06/www_ehealthinsurance_com.20111230.log';

var outStream = fs.createWriteStream('c:/tmp/1.josn');

var readline = new ReadLine();

readline.on('start', function(){
  outStream.write("[\n");
});

readline.on('end', function(){
  outStream.write("]\n");
});

readline.on('line', function(err, line){
  var LINE_PATTERN = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) - - \[(\d{1,2}\/[a-zA-Z]{3}\/\d{4}:\d{2}:\d{2}:\d{2} -\d{4})\] "([A-Z]+) (.+?) HTTP\/1\.1" (\d{3}) (\d+) "(.+?)" "(.+?)"/

  if (result = line.match(LINE_PATTERN)) {
    var responseCode = result[5];
    if(responseCode == 500){
      var log = {
          id:UUID.create().toString(),
          logFileName: filePath,
          ipString:result[1],
          ipInteger:Utils.ipToInteger(result[1]),
          accessTime:Utils.formatSolrTime(Utils.parseApacheTime(result[2])),
          method:result[3],
          uri:result[4],
          responseCode:responseCode,
          responseBytes:new Number(result[6]),
          referrer:result[7],
          userAgent:result[8]
      };

      outStream.write(util.inspect(log) + ",\n");
    }
  }
});

readline.on('progress', function(readBytes, totalBytes){
  var percent = parseInt(readBytes / totalBytes * 100);
  if(percent > readline.progress){
    console.log("Finish: %d, %d / %d", percent, readBytes, totalBytes);
    readline.progress = percent;
  }
})

readline.readFile(filePath);
