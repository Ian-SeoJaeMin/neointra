var express = require('express');
var router = express.Router();
var config = require('../src/config');

var Service = Server.Service;

router.get('/', function (req, res, next) {
    res.render('service_accept', {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.AS,
        useBoards: req.boards,
        setting: req.setting
    });
});

router.get('/detail', function (req, res, next) {
    var sendData = {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.AS,
        useBoards: req.boards,
        setting: req.setting,
        service: req.query
    }

    res.render('service_accept/detail', sendData)
})


module.exports = router;
