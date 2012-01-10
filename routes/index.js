/*
 * GET home page.
 */

exports.index = function (req, res) {
    res.render('index', { title:'Apache Logs Analyzer', activeMenu:'Home' })
};

exports.upload = function (req, res) {
    res.render('upload', {title:'Upload', activeMenu:'Upload'})
};
