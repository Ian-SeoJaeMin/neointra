var express = require('express');
var router = express.Router();
var config = require('../src/config');

var Report = require('../src/index').Report;


router.get('/', function (req, res, next) {
    res.render('report', {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.REPORT,
        useBoards: req.boards
    });
});


module.exports = router;