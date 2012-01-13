/*
 * GET home page.
 */
var events = require('events');
var up = require('../utils/upload_progress');
/*
var kue = require('kue');

// Kue job queue process
var jobs = kue.createQueue();

jobs.process('logfile', 2, function(job, done){

});
*/

exports.index = function (req, res) {
    res.render('index', { title:'Apache Logs Analyzer', activeMenu:'Home' })
};

exports.upload = function (req, res) {
    var sessionId = req.sessionID;
    res.render('upload', {title:'Upload', activeMenu:'Upload', sessionId: sessionId})
};

exports.uploadLogFile = function(req, res, next){
    var taskId = req.query.taskId;
    req.form.complete(function(err, fields, files){
        if(err){
            next(err);
        } else {
            up.progress(taskId, 100, 100);
            console.log('\nuploaded %s to %s', files.logFile.filename, files.logFile.path);
            res.send('uploaded ' + files.logFile.filename + ' to ' + files.logFile.path,
                {'Content-Type': 'text/plain'},
                200
            );
            /*
            jobs.create('logfile', {
                fileName : files.logFile.filename,
                logFilePath : files.logFile.path
            }).save();
            */
        }
    });

    req.form.on('progress', function(bytesReceived, bytesExpected){
        up.progress(taskId, bytesReceived, bytesExpected);
    });

};


