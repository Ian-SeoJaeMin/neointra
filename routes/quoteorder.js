var express = require('express');
var router = express.Router();
var config = require('../src/config');

router.get('/', function (req, res, next) {
    res.render('quoteorder', {
        title: config.web.title,
        user: req.session.user,
        setting: req.setting,
        // menus: config.web.menu,
        // menu: config.web.menu.AS,
        useBoards: req.boards
    });
});

router.get('/manage', function (req, res, next) {
    res.render('quoteorder/manage', {
        title: config.web.title,
        user: req.session.user,
        setting: req.setting,
        // menus: config.web.menu,
        // menu: config.web.menu.AS,
        useBoards: req.boards
    });
});

router.get('/write', function (req, res, next) {
    res.render('quoteorder/write', {
        title: config.web.title,
        user: req.session.user,
        setting: req.setting,
        // menus: config.web.menu,
        // menu: config.web.menu.AS,
        useBoards: req.boards
    })
});

router.get('/view', function (req, res, next) {

    var QuoteOrder = Server.QuoteOrder;

    QuoteOrder.Find.OrderDetail(req)
        .then(function (result) {
            res.render('quoteorder/view', {
                title: config.web.title,
                user: req.session.user,
                setting: req.setting,
                // menus: config.web.menu,
                // menu: config.web.menu.AS,
                order: result[0][0],
                orderProducts: result[1],
                useBoards: req.boards
            })
        })
        .catch(function (error) {
            console.log(error);
            res.render('error', {
                title: '500',
                message: '견적서 정보를 찾지 못하였습니다.',
                detail: error
            });
        })
    QuoteOrder = null
});

router.get('/edit', function (req, res, next) {
    var QuoteOrder = Server.QuoteOrder;
    var Users = Server.Users;
    var _users = null
    Users.Find.Users(req)
        .then(function (result) {
            _users = result
            return QuoteOrder.Find.OrderDetail(req)
        })
        .then(function (result) {
            QuoteOrder = null
            Users = null
            res.render('quoteorder/edit', {
                title: config.web.title,
                user: req.session.user,
                setting: req.setting,
                // menus: config.web.menu,
                // menu: config.web.menu.AS,
                order: result[0][0],
                orderProducts: result[1],
                users: _users,
                useBoards: req.boards
            })
        })
        .catch(function (error) {
            console.log(error);
            res.render('error', {
                title: '500',
                message: '견적서 정보를 찾지 못하였습니다.',
                detail: error
            });
        })
    // QuoteOrder = null
    // Users = null
    _users = null
});

router.get('/estimate', function (req, res) {
    var QuoteOrder = Server.QuoteOrder;

    QuoteOrder.Find.OrderDetail(req)
        .then(function (result) {
            res.render('quoteorder/estimate', {
                title: config.web.title,
                user: req.session.user,
                order: result[0][0],
                orderProducts: result[1]
            })
        })
        .catch(function (error) {
            console.log(error);
            res.render('error', {
                title: '500',
                message: '견적서 정보를 찾지 못하였습니다.',
                detail: error
            });
        })
    QuoteOrder = null
})

module.exports = router;
