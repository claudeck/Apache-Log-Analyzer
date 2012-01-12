var CLIENT_EVENTS = exports.CLIENT_EVENTS = {
    'SERVER_PREPARED' : 'UP_SERVER_PREPARED',
    'PROGRESS' : 'UP_PROGRESS'
};

exports.SERVER_EVENTS = {
    'START' : 'UP_START'
};

var taskStore = module.exports.taskStore = {};

module.exports.addTask = function(taskId, socket){
    taskStore[taskId] = new UploadTask(socket);
    socket._up_taskId = taskId;
    socket.emit(CLIENT_EVENTS.SERVER_PREPARED);
};

module.exports.removeTask = function(socket){
    if(socket.taskId != null){
        delete taskStore[socket.taskId];
    }
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

