var express = require('express');
var router = express.Router();
var config = require('../src/config');

router.get('/', function (req, res, next) {
    res.render('service_emergen', {
        title: config.web.title,
        user: req.session.user,
        setting: req.setting,
        useBoards: req.boards
    });
});

router.get('/view', function (req, res, next) {
    res.render('service_emergen/view', {
        title: config.web.title,
        user: req.session.user,
        setting: req.setting,
        // menus: config.web.menu,
        // menu: config.web.menu.AS,
        useBoards: req.boards
    })
});

// router.get('/edit', function (req, res, next) {
//     res.render('quoteorder/edit', {
//         title: config.web.title,
//         user: req.session.user,
//         setting: req.setting,
//         // menus: config.web.menu,
//         // menu: config.web.menu.AS,
//         useBoards: req.boards
//     })
// });

module.exports = router;
