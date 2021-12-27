var express = require('express');
var router = express.Router();
var config = require('../src/config');

var Customer = require('../src/index').Customer;
var Users = require('../src/index').Users;

router.get('/', function (req, res, next) {
    if (req.query.hasOwnProperty('id') && req.query.hasOwnProperty('hospnum')) {
        Customer.Find.Customer(req)
            .then(function (result) {
                res.render('customer/detail', {
                    title: config.web.title,
                    user: req.session.user,
                    // menus: config.web.menu,
                    // menu: config.web.menu.CUSTOMER_MANAGE_DETAIL,
                    hospital: result,
                    useBoards: req.boards
                });
            })
            .catch(function (error) {
                console.log(error);
                res.render('error', {
                    title: '500',
                    message: '병원정보를 찾지 못하였습니다.',
                    detail: error
                });
            });
    } else {
        res.render('customer', {
            title: config.web.title,
            user: req.session.user,
            // menus: config.web.menu,
            // menu: config.web.menu.CUSTOMER_MANAGE,
            useBoards: req.boards
        });
    }
});


router.get('/visit', function (req, res, next) {
    Customer.Find.VisttWriters(req)
        .then(function (writers) {
            res.render('visit', {
                title: config.web.title,
                user: req.session.user,
                // menus: config.web.menu,
                // menu: config.web.menu.CUSTOMER_VISIT,
                visitors: writers,
                useBoards: req.boards
            });
        })
        .catch(function (error) {
            console.log(error);
            res.render('error', {
                title: '500',
                message: '오류가 발생하였습니다.',
                detail: error
            });
        })

});

router.get('/visit/write', function (req, res, next) {
    res.render('visit/write', {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.CUSTOMER_VISIT_ADD,
        useBoards: req.boards
    });
});

router.get('/visit/view', function (req, res, next) {
    Customer.Find.Visit(req)
        .then(function (result) {
            console.log(result);
            var sess = req.session;
            console.log(result[0]['첨부파일']);
            result[0]['첨부파일'] = JSON.parse(result[0]['첨부파일'])

            if (sess.user['인덱스'] === result[0]['작성자']) {
                res.render('visit/edit', {
                    title: config.web.title,
                    user: req.session.user,
                    // menus: config.web.menu,
                    // menu: config.web.menu.CUSTOMER_VISIT,
                    useBoards: req.boards,
                    // submenu: config.web.menu.CUSTOMER_VISI,
                    visit: result[0]
                });
            } else {
                res.render('visit/view', {
                    title: config.web.title,
                    user: req.session.user,
                    // menus: config.web.menu,
                    // menu: config.web.menu.CUSTOMER_VISIT,
                    useBoards: req.boards,
                    // submenu: config.web.menu.CUSTOMER_CALL_VIEW,
                    visit: result[0]
                });
            }
        })
        .catch(function (error) {
            console.log(error);
            res.render('error', {
                title: '500',
                message: '방문일지를 찾지 못하였습니다.',
                detail: error
            });
        })

});

router.get('/call', function (req, res, next) {
    Customer.Find.CallWriters(req)
        .then(function (writers) {
            res.render('call', {
                title: config.web.title,
                user: req.session.user,
                // menus: config.web.menu,
                // menu: config.web.menu.CUSTOMER_CALL,
                writers: writers,
                useBoards: req.boards
            });
        })
        .catch(function (error) {
            console.log(error);
            res.render('error', {
                title: '500',
                message: '오류가 발생하였습니다.',
                detail: error
            });
        })

});

router.get('/call/write', function (req, res, next) {
    Users.Find.Users(req)
        .then(function (users) {
            res.render('call/write', {
                title: config.web.title,
                user: req.session.user,
                // menus: config.web.menu,
                // menu: config.web.menu.CUSTOMER_CALL,
                // submenu: config.web.menu.CUSTOMER_CALL_EDIT,
                useBoards: req.boards,
                users: users
            });
        })
        .catch(function (error) {
            console.log(error);
            res.render('error', {
                title: '500',
                message: '페이지에 오류가 있습니다.',
                detail: error
            });
        })
})

router.get('/call/view', function (req, res, next) {
    var _users
    Users.Find.Users(req)
        .then(function (users) {
            _users = users
            return Customer.Find.Calls(req)
        })
        .then(function (result) {
            console.log(result[0]);

            if (result[0]['내용'].length > 0 && (result[0]['문의내용'].length === 0 && result[0]['처리내용'].length === 0)) {
                var comment = ParseCommentToPart(result[0]['내용']);
                result[0]['문의내용'] = comment[1];
                result[0]['처리내용'] = comment[2];
                result[0]['기타'] = comment[3];
            }

            var sess = req.session;
            if (sess.user['인덱스'] === result[0]['작성자']) {
                res.render('call/edit', {
                    title: config.web.title,
                    user: req.session.user,
                    // menus: config.web.menu,
                    // menu: config.web.menu.CUSTOMER_CALL,
                    // submenu: config.web.menu.CUSTOMER_CALL_EDIT,
                    useBoards: req.boards,
                    call: result[0],
                    users: _users
                });
            } else {
                res.render('call/view', {
                    title: config.web.title,
                    user: req.session.user,
                    // menus: config.web.menu,
                    // menu: config.web.menu.CUSTOMER_CALL,
                    // submenu: config.web.menu.CUSTOMER_CALL_VIEW,
                    useBoards: req.boards,
                    call: result[0],
                    users: _users
                });
            }
        })
        .catch(function (error) {
            console.log(error);
            res.render('error', {
                title: '500',
                message: '상담일지를 찾지 못하였습니다.',
                detail: error
            });
        });


    function ParseCommentToPart(comment) {
        var QUESTION = 'Q. 문의내용';
        var TREAT = 'A. 처리내용';
        var ETC = 'E.기타';
        var txtCmnt, _txtCmnt

        txtCmnt = strip_html_tags(comment);

        txtCmnt = txtCmnt.replace(/&nbsp;/gim, ' ');

        if (txtCmnt.indexOf(QUESTION) >= 0) {

        } else if (txtCmnt.indexOf('Q.') >= 0) {
            QUESTION = 'Q.';
            TREAT = 'A.';
            ETC = 'E.';
        } else if (txtCmnt.indexOf('Q : ') >= 0) {
            QUESTION = 'Q : ';
            TREAT = 'A : ';
            ETC = 'E : ';
        }

        _txtCmnt = txtCmnt.replace(QUESTION, '|')
            .replace(TREAT, '|')
            .replace(ETC, '|');

        _txtCmnt = _txtCmnt.split('|');

        return _txtCmnt;

    }

    function strip_html_tags(str) {
        if ((str === null) || (str === ''))
            return false;
        else
            str = str.toString();
        return str.replace(/<[^>]*>/g, '');
    }
})


module.exports = router;
