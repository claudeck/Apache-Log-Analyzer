/*
 * GET home page.
 */
var events = require('events');
var util = require('util');
var up = require('../utils/upload_progress');

var kue = require('kue');
var alp = require('../services/apache_log_processor');

// Kue job queue process
var jobs = kue.createQueue();

jobs.process('logfile', 2, function(job, done){
    alp.importToSolr(job.data, done);
});

exports.index = function (req, res) {
    res.render('index', { title:'Apache Logs Analyzer', activeMenu:'Home' })
};

exports.upload = function (req, res) {
    res.render('upload', {title:'Upload', activeMenu:'Upload'})
};

exports.uploadLogFile = function(req, res, next){
    var taskId = req.query.taskId;
    req.form.complete(function(err, fields, files){
        if(err){
            next(err);
        } else {
            var job = jobs.create('logfile', {
                fileName : files.logFile.filename,
                logFilePath : files.logFile.path
            });

            (function(job, taskId){
                job.save(function(err){
                    up.finish(taskId, {
                        jobId : job.id
                    });
                });
            })(job, taskId);

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

};


