var express = require('express');
var router = express.Router();
var config = require('../src/config');

// var Admin = require('../src/index').Admin;

router.get('/', function (req, res, next) {
    res.render('amount', {
        title: config.web.title,
        user: req.session.user,
        useBoards: req.boards,
        setting: req.setting
    });
});

module.exports = router;