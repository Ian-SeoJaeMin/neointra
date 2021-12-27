var express = require('express');
var url = require('url');
var router = express.Router();
// var server = require('../src');
var config = require('../src/config');

var service = require('./service');
var customer = require('./customer');
var users = require('./users');
var project = require('./project');
var report = require('./report');
var board = require('./board');
var schedule = require('./schedule');
var hospital = require('./hospital');
var sheet = require('./sheet');
var amount = require('./amount');
var settlement = require('./settlement');
var admin = require('./admin');
var quoteorder = require('./quoteorder');
var drafting = require('./drafting');
var serviceEmergen = require('./service_emergen')
var update = require('./update')

router.use(function CheckLogin(req, res, next) {
    if (req.originalUrl.indexOf('users/login') >= 0 || req.originalUrl.indexOf('filesocket') >= 0 || req.originalUrl.indexOf('uploads') >= 0 || req.originalUrl.indexOf('remote') >= 0) {
        next();
    } else if (req.originalUrl.indexOf('hospital') < 0 && req.originalUrl.indexOf('api') < 0 && req.originalUrl.indexOf('document') < 0) {
        var sess = req.session;
        if (!sess.user) {
            // res.redirect('/users/login');
            res.redirect(url.format({
                pathname: "/users/login",
                query: {
                    redirect: req.originalUrl
                }
            }));
        } else {
            next();
        }
    } else {
        next();
    }
});

router.use(function LoadSetting(req, res, next) {

    Server.fn.Setting()
        .then(function (result) {
            // console.log(result[0]);
            if (result[0] && result[0]['설정'] !== undefined) {
                // result[0]['설정'] = result[0]['설정'].replace(/\n/gim, '\\n');
                result = JSON.parse(result[0]['설정']);
            } else {
                result = {};
            }

            req.setting = result;
            next();
        }).catch(function (error) {
            console.log(error);
            next();
        });

});

router.use(function BoardList(req, res, next) {
    if (req.originalUrl.indexOf('api') >= 0 || req.originalUrl.indexOf('uploads') >= 0) {
        next();
    } else if (req.session.user) {
        Server.Board.Find.Boards({
            use: true,
            permission: req.session.user
        })
            .then(function (result) {
                req.boards = result;
                next();
            }).catch(function (error) {
                console.log(error);
                next();
            });
    } else {
        next();
    }
});


router.use('/service', service);
router.use('/customer', customer);
router.use('/users', users);
router.use('/project', project);
router.use('/report', report);
router.use('/board', board);
router.use('/schedule', schedule);
router.use('/hospital', hospital);
router.use('/sheet', sheet);
router.use('/amount', amount);
router.use('/settlement', settlement);
router.use('/admin', admin);
router.use('/quoteorder', quoteorder);
router.use('/serviceemergen', serviceEmergen);
router.use('/drafting', drafting);
router.use('/update', update);
/* GET home page. */

router.get('/', function (req, res) {
    Server.Board.Find.ArticlesSummary(req)
        .then(function (result) {
            res.render('home', {
                title: config.web.title,
                user: req.session.user,
                useBoards: req.boards,
                SummaryBoards: result
            });
        })
        .catch(function (error) {
            console.log(error);
            res.render('home', {
                title: config.web.title,
                user: req.session.user,
                useBoards: req.boards
            });
        });
});

router.get('/socket', function (req, res, next) {
    res.render('socket', {
        user: req.session.user
    });
});
router.get('/filesocket', function (req, res, next) {
    res.render('fileSocket');
});
router.get('/remote', function (req, res, next) {
    res.render('remote');
});

module.exports = router;
