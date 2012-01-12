/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var form = require('connect-form');
var io = require('socket.io');

delete express.bodyParser.parse['multipart/form-data'];

var app = module.exports = express.createServer(
    form({ keepExtensions: true })
);

io.listen(app);

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
app.post('/upload', routes.uploadLogFile);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Socket IO events
io.sockets.on('connection', function(socket){
    
});