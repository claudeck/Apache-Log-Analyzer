var UUID = require('uuid-js');

var CLIENT_EVENTS = exports.CLIENT_EVENTS = {
    'SERVER_PREPARED' : 'UP_SERVER_PREPARED',
    'PROGRESS' : 'UP_PROGRESS'
};

exports.SERVER_EVENTS = {
    'START' : 'UP_START'
};

var taskStore = module.exports.taskStore = {};

var removeTask = function(socket){
    if(socket._up_taskId != null){
        delete taskStore[socket._up_taskId];
    }
};

module.exports.addTask = function(socket){
    var taskId = UUID.create().toString();
    taskStore[taskId] = new UploadTask(socket);
    socket._up_taskId = taskId;
    socket.emit(CLIENT_EVENTS.SERVER_PREPARED, {taskId: taskId});

    socket.on('disconnect', function(){
        removeTask(socket);
    });
};

module.exports.progress = function(taskId, bytesReceived, bytesExpected){
    var percent = (bytesReceived / bytesExpected * 100) | 0;
    taskStore[taskId].progress({
        percent : percent,
        bytesReceived : bytesReceived,
        bytesExpected : bytesExpected
    });
};

var UploadTask = function(socket){
    this.socket = socket;
    this.percent = 0;
};

UploadTask.prototype.progress = function(data){
    if(this.percent < data.percent){
        this.socket.emit(CLIENT_EVENTS.PROGRESS, data);
        this.percent = data.percent;
    }
}

