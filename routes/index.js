/*
 * GET home page.
 */

exports.index = function (req, res) {
    res.render('index', { title:'Apache Logs Analyzer', activeMenu:'Home' })
};

exports.upload = function (req, res) {
    var message = req.flash('info');
    res.render('upload', {title:'Upload', activeMenu:'Upload', message : message})
};

exports.uploadLogFile = function(req, res, next){
    req.form.complete(function(err, fields, files){
        if(err){
            next(err);
        } else {
            console.log('\nuploaded %s to %s', files.logFile.filename, files.logFile.path);
            req.flash('info', 'uploaded ' + files.logFile.filename + ' to ' + files.logFile.path);
            res.redirect('back');
        }
    });
    /*
    req.form.on('progress', function(bytesReceived, bytesExpected){
        var percent = (bytesReceived / bytesExpected * 100) | 0;
        process.stdout().write('Uploading: %' + percent + '\r');
    });
    */
}