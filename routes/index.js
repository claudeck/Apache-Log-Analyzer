/*
 * GET home page.
 */
var events = require('events');
var util = require('util');
var up = require('../utils/upload_progress');

var kue = require('kue');
var alp = require('../services/apache_log_processor');
var solr = require('../services/solr');

// Kue job queue process
var jobs = kue.createQueue();

jobs.process('logfile', 2, function (job, done) {
    alp.importToSolr(job.data, done);
});

exports.index = function (req, res) {
    res.render('index', { title:'Apache Logs Analyzer', activeMenu:'Log Search', responseJson: null });
};

exports.jobs = function (req, res) {
    res.render('jobs', {title: 'Job Processing', activeMenu: 'Jobs'});
};

exports.upload = function (req, res) {
    res.render('upload', {title:'Upload', activeMenu:'Upload'})
};

exports.uploadLogFile = function (req, res, next) {
    var taskId = req.query.taskId;
    req.form.complete(function (err, fields, files) {
        if (err) {
            next(err);
        } else {
            var job = jobs.create('logfile', {
                fileName:files.logFile.filename,
                logFilePath:files.logFile.path
            });

            (function (job, taskId) {
                job.save(function (err) {
                    up.finish(taskId, {
                        jobId:job.id
                    });
                });
            })(job, taskId);

            console.log('\nuploaded %s to %s', files.logFile.filename, files.logFile.path);
            res.send('uploaded ' + files.logFile.filename + ' to ' + files.logFile.path,
                {'Content-Type':'text/plain'},
                200
            );
        }
    });

    req.form.on('progress', function (bytesReceived, bytesExpected) {
        up.progress(taskId, bytesReceived, bytesExpected);
    });

};

exports.search = function(req, res, next){
    var keyword = req.body.keyword;
    console.log(keyword);
    solr.search(
        {q : 'uri:' + keyword},
        function(err, responseJson){
            if(err){
                next(err);
            }else{
                res.render('index', { title:'Apache Logs Analyzer', activeMenu:'Log Search', responseJson: responseJson });
            }
        }
    );
}
