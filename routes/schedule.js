var express = require('express');
var router = express.Router();
var config = require('../src/config');

router.get('/', function (req, res, next) {
    var sendData = {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.BOARD,
        useBoards: req.boards
    };

    res.render('schedule', sendData);

});

module.exports = router;
