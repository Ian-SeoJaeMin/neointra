var express = require('express');
var router = express.Router();
var config = require('../src/config');

var Service = Server.Service;

router.get('/', function (req, res, next) {
    res.render('service_data', {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.AS,
        useBoards: req.boards,
        setting: req.setting
    });
});

module.exports = router;
