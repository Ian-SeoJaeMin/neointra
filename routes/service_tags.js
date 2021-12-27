var express = require('express');
var router = express.Router();
var config = require('../src/config');

router.get('/', function (req, res, next) {
    console.log('???')
    res.render('service_tags', {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.AS,
        useBoards: req.boards
    });
});

module.exports = router;
