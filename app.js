/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var form = require('connect-form');
var io = require('socket.io');
var up = require('./utils/upload_progress');
var solr = require('./services/solr').setserverPath('http://localhost:8080/solr');

delete express.bodyParser.parse['multipart/form-data'];

var app = module.exports = express.createServer(
    form({ keepExtensions: true })
);

var socket = io.listen(app);

// Configuration

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', {layout: false});
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({secret: 'keyboard cat'}));
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/upload', routes.upload);
app.get('/jobs/:id?', routes.jobs);
app.post('/upload', routes.uploadLogFile);
app.post('/search', routes.search);

app.listen(3333);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Socket IO events
socket.sockets.on('connection', function(socket){
    socket.on(up.SERVER_EVENTS.START, function(data){
        up.addTask(socket);
    });
});
