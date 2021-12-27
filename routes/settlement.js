var express = require('express');
var router = express.Router();
var config = require('../src/config');

// var Admin = require('../src/index').Admin;

router.get('/:target', function (req, res, next) {
    res.render('settlement/' + req.params.target, {
        title: config.web.title,
        user: req.session.user,
        useBoards: req.boards,
        setting: req.setting
    });
});

module.exports = router;