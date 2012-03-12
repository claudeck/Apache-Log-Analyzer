/*
 * GET home page.
 */
var events = require('events');
var util = require('util');
var up = require('../utils/upload_progress');

var kue = require('kue');
var alp = require('../services/apache_log_processor');
var solr = require('../services/solr');
var StringUtils = require('../utils/string_utils');
var jobListeners = require('../services/job_listen');
var Job = kue.Job;

// Kue job queue process
var jobs = kue.createQueue();

jobs.process('logfile', 2, function (job, done) {
    alp.importToSolr(job, done);
});

exports.index = function (req, res) {
    res.render('index', 
        { 
            title:'Apache Logs Analyzer', 
            activeMenu:'Log Search', 
            responseJson: null,
            params: {} 
        }
    );
};

exports.jobs = function (req, res) {
    Job.range(0, 10, 'desc', function(err, jobs){
        if (err) return res.send({ error: err.message });
        res.render('jobs', 
            {
                title: 'Job Processing', 
                activeMenu: 'Jobs',
                jobs : jobs
            }
        );
    });

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
                fileName: files.logFile.filename,
                logFilePath: files.logFile.path,
                startTime: new Date()
            });

            (function (job, taskId) {
                job.save(function (err) {
                    up.finish(taskId, {
                        jobId:job.id
                    });
                });
                    
                job.on('progress', function(progress){
                    jobListeners.progress({
                        jobId: job.id,
                        progress: progress
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

function buildAccessTime(dateStart, dateEnd){
    var dateRange = [];
    if(StringUtils.isNotBlank(dateStart)){
        dateRange.push(dateStart);
    }
    if(StringUtils.isNotBlank(dateEnd)){
        dateRange.push(dateEnd);
    }

    if(dateRange.length == 0){
        return null;
    }else if(dateRange.length == 1){
        return dateRange[0];
    }else{
        return '[' + dateRange[0] + ' TO ' + dateRange[1] + ']';
    }
}

function createQuery(req){
    var keywords = {
      keyword: req.params.keyword,
      accessTime: buildAccessTime(req.params.dateStart, req.params.dataEnd),
      uri: req.params.uriKeyword,
      referrer: req.params.referrer,
      userAgent: req.params.userAgent,
      browserFamily: req.params.browserFamily
    };

    var hasConditions = false;
    var clauses = [];
    for(var key in keywords){
        if(StringUtils.isNotBlank(keywords[key])){
            hasConditions = true;
            clauses.push('(' + key + ':' + keywords[key] + ')');
        }
    }
    var q = "*:*";
    if(hasConditions){
        q = clauses.join(' AND ');
    }
    return q;
}

exports.search = function(req, res, next){
    solr.search(
        {
            q: createQuery(req),
            start: req.params.start
        },
        function(err, responseJson){
            if(err){
                next(err);
            }else{
                res.render('index', 
                    { 
                        title:'Apache Logs Analyzer', 
                        activeMenu:'Log Search', 
                        responseJson: responseJson,
                        params: req.params 
                    }
                );
            }
        }
    );
}
