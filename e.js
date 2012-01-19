var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var UUID = require('uuid-js');
var Utils = require('./services/utils');

function ProcessFileLine(){
  EventEmitter.call(this);
}

util.inherits(ProcessFileLine, EventEmitter);

ProcessFileLine.prototype.readFile = function(filePath){
  var $this = this;
  console.log(filePath);
  fs.stat(filePath, function(err, stats){
    if(err){
      console.log(err);
    }else{
      $this.readLine(filePath, stats);
    }
  });
}

ProcessFileLine.prototype.readLine = function(filePath, stats){
  var start = new Date();

  var stream = fs.createReadStream(filePath, {
    encoding: 'UTF-8'
  });

  var $this = this;

  $this.progress = 0;

  stream.on('open', function(){
    stream.readLength = 0;
    stream.size = stats.size;
    $this.emit('start');
  });

  stream.on('data', function(data){
    
    var dataLength = data.length;
    var newLine = '\n';
    stream.readLength += dataLength;
    $this.emit('progress', stream.readLength, stream.size);

    var line = '';
    if(stream.remainder != null){
      line += stream.remainder.toString();
    }

    var lineStart = 0;
    for(var i = 0; i < dataLength; i++){
      if(data[i] == newLine){
        line += data.slice(lineStart, i).toString();
        $this.emit('line', null, line);
        lineStart = i+1;
        line = '';
      }
    }
    if(lineStart < dataLength){
      stream.remainder = data.slice(lineStart, dataLength);
    }else{
      stream.remainder = null;
    }
  });

  stream.on('error', function(){
    console.log('error');
  });

  stream.on('end', function(){
    if(stream.remainder){
      $this.emit('line', null, stream.remainder.toString());
    }
    $this.emit('end');
  });

  stream.on('close', function(){
    console.log('close');

    console.log(new Date() - start);
  });

}

var filePath = 'C:/tmp/2012-01-06/www_ehealthinsurance_com.20111230.log';

var outStream = fs.createWriteStream('c:/tmp/1.josn');

var pfl = new ProcessFileLine();

pfl.on('start', function(){
  outStream.write("[\n");
});

pfl.on('end', function(){
  outStream.write("]\n");
});

pfl.on('line', function(err, line){
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

pfl.on('progress', function(readBytes, totalBytes){
  var percent = parseInt(readBytes / totalBytes * 100);
  if(percent > pfl.progress){
    console.log("Finish: %d, %d / %d", percent, readBytes, totalBytes);
    pfl.progress = percent;
  }
})

pfl.readFile(filePath);
