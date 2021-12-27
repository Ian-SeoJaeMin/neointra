var express = require('express');
var router = express.Router();
var config = require('../src/config');

var Service = Server.Service;

router.get('/', function (req, res, next) {
    var sendData = {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.AS        
    };

    res.render('hospital/download', sendData);

});

module.exports = router;
