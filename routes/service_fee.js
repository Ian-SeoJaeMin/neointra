var express = require('express');
var router = express.Router();
var config = require('../src/config');

router.get('/', function (req, res, next) {
    res.render('service_fee', {
        title: config.web.title,
        user: req.session.user,
        setting: req.setting,
        // menus: config.web.menu,
        // menu: config.web.menu.AS,
        useBoards: req.boards
    });
});

module.exports = router;