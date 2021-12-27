var express = require('express');
var router = express.Router();
var config = require('../src/config');

router.get('/', function (req, res, next) {
    res.render('service_finder', {
        title: config.web.title,
        user: req.session.user,
    });
});

module.exports = router;