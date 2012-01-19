var UUID = require('uuid-js');

var listeners = module.exports.listeners = {};

module.exports.addListener = function(socket){
  var listenerId = UUID.create().toString();
  socket.listenerId = listenerId;
  listeners[listenerId] = socket;
};

module.exports.removeListener = function(socket){
  delete listeners[socket.listenerId];
};

module.exports.progress = function(progress){
  for(var lid in listeners){
    listeners[lid].emit('JOB_LISTEN', progress);
  }
}