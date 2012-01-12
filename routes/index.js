/*
 * GET home page.
 */
var events = require('events');
var up = require('../utils/upload_progress');

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
        }
    });

    req.form.on('progress', function(bytesReceived, bytesExpected){
        up.progress(taskId, bytesReceived, bytesExpected);
    });

}