var express = require('express');
var router = express.Router();
var config = require('../src/config');

var Service = Server.Service;

router.get('/', function (req, res, next) {
    res.render('service_history', {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.AS,
        useBoards: req.boards
    });
});

router.get('/detail', function (req, res, next) {
    Service.Find.Service(req)
        .then(function (result) {
            if (result[0][0]) {
                result[0][0]['이미지'] = JSON.parse(result[0][0]['이미지']).join(',');
            }
            res.render('service_history/view', {
                title: config.web.title,
                user: req.session.user,
                // menus: config.web.menu,
                // menu: config.web.menu.AS,
                setting: req.setting,
                service: result[0][0],
                replys: result[1],
                info: result[2][0],
                uniq: result[3][0] || {},
                backup: result[4][0] || {},
                extra: result[5],
                useBoards: req.boards
            });
        })
        .catch(function (error) {
            // console.log(error);
            res.render('error', {
                title: '500',
                message: '오류가 발생하였습니다.',
                detail: error
            });
        });
})

module.exports = router;