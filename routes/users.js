var express = require('express');
var router = express.Router();
var config = require('../src/config');

router.get('/', function (req, res, next) {

});

router.get('/login', function (req, res, next) {
    var user = req.session.user;
    if (user) {
        res.redirect('/');
    } else {
        res.render('users/login', {
            title: config.web.title,
            autoLogin: req.query.autologin || 1,
            redirect: req.query.redirect
        });
    }
});

router.get('/logout', function (req, res, next) {
    req.session.destroy();
    res.redirect('/users/login?autologin=0');
});

router.get('/mypage', function (req, res, next) {
    var user = req.session.user;
    if (user) {
        res.render('users/mypage', {
            title: config.web.title,
            user: req.session.user,
            useBoards: req.boards
        });
    } else {
        res.render('users/login', {
            title: config.web.title,
            autoLogin: req.query.autologin || 1,
            redirect: req.query.redirect
        });
    }
});

module.exports = router;