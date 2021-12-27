var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var rfs = require('rotating-file-stream');
var session = require('express-session');
var cors = require('cors'); //CROSS BROWSER
var helmet = require('helmet');

// process.setMaxListeners(15);
// process.setMaxListeners(0);
require('events').EventEmitter.prototype._maxListeners = 100;

global.moment = require('moment');
moment.locale('ko');
global.marked = require('marked');
global.Server = require('./src/index.js');

// var routes = require('./routes/index');
// var users = require('./routes/user');
var pageRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';
if (app.locals.ENV_DEVELOPMENT) {
    global.LIVERELOAD = 'http://localhost:35730/livereload.js' // http://localhost:35729/livereload.js
    for (var i = 0; i < 9; i++) {
        console.log('::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::');
    }
    console.log('TEST MODE                                      :::::::::::::::::::::::::');
    for (var i = 0; i < 9; i++) {
        console.log('::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::');
    }
} else {
    console.log('BUILD MODE');
}

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
var logPath = path.join(__dirname, 'public', 'log');
if (!fs.existsSync(logPath)) fs.mkdirSync(logPath);
var accessLogStream = rfs('access.log', {
    interval: '1d',
    path: logPath
});
app.use(logger('dev', {
    stream: accessLogStream
}));
app.use(logger('dev'));
app.use(bodyParser.json({
    limit: '100mb'
}));
app.use(bodyParser.urlencoded({
    limit: '100mb',
    extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'ambc@!vsmkv#!&*!#EDNAnsv#!$()_*#@',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: null
    }
}));
app.use(cors());
app.use(helmet.frameguard())

// app.use('/', routes);
// app.use('/users', users);
app.use('/', pageRouter);
app.use('/api', apiRouter);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (req, res, next) {
    if (req.originalUrl.indexOf('api') >= 0) {
        console.log('::::::::::::::::::::::::::::::::::::::::::::::::::::::');
        console.log('API 요청', req.originalUrl);
        console.log('::::::::::::::::::::::::::::::::::::::::::::::::::::::');
    }
    next();
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});

function scheduleGc() {
    if (!global.gc) {
        console.log('Garbage collection is not exposed');
        return;
    }

    // schedule next gc within a random interval (e.g. 15-45 minutes)
    // tweak this based on your app's memory usage
    // var nextMinutes = Math.random() * 30 + 15;

    setTimeout(function () {
        global.gc();
        // console.log('Manual gc', process.memoryUsage());
        scheduleGc();
    }, 30000);
}

// call this in the startup script of your app (once per process)
scheduleGc();

module.exports = app;
