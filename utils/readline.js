var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = ProcessFileLine = function(){
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

  stream.on('error', function(exception){
    $this.emit('error', exception);
  });

  stream.on('end', function(){
    if(stream.remainder){
      $this.emit('line', null, stream.remainder.toString());
    }
    $this.emit('end');
  });

  stream.on('close', function(){
    $this.emit('close');
  });

}
