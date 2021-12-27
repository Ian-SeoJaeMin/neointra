var express = require('express');
var router = express.Router();
var config = require('../src/config');

// var Server = require('../src/index');
var Board = Server.Board;
var Company = Server.Company;
var Users = Server.Users;

router.get('/', function (req, res, next) {
    var sendData = {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.BOARD,
        useBoards: req.boards
    };

    Board.Find.Board(req)
        .then(function (board) {
            board[0]['입력필드'] = board[0]['입력필드'] === '' || board[0]['입력필드'] === 'undefined' ? [] : JSON.parse(board[0]['입력필드']);
            sendData.board = board[0];
            sendData.header = board[0]['입력필드'].filter(function (field) {
                return field['header'] === true;
            });
            sendData.finder = board[0]['입력필드'].filter(function (field) {
                console.log(field);
                return field['finder'] === true;
            });


            res.render('board', sendData);
        })
        .catch(function (error) {
            res.render('error', {
                title: '500',
                message: '오류가 발생하였습니다.',
                detail: error
            });
        })

});

router.get('/write', function (req, res, next) {
    Board.Find.Board(req)
        .then(function (result) {
            result[0]['입력필드'] = result[0]['입력필드'] === '' ? [] : JSON.parse(result[0]['입력필드']);
            result[0]['입력필드'].forEach(function (element) {
                if (element['type'].match(/프로그램선택|실행파일선택|직원선택|부서선택|지사선택/)) {
                    element['ejs'] = '../elements/드롭박스.ejs';
                } else {
                    element['ejs'] = '../elements/' + element['type'] + '.ejs';
                }

            }, this);
            res.render('board/write', {
                title: config.web.title,
                user: req.session.user,
                // menus: config.web.menu,
                // menu: config.web.menu.BOARD,
                board: result[0],
                useBoards: req.boards
            });
        })
        .catch(function (error) {
            res.render('error', {
                title: '500',
                message: '오류가 발생하였습니다.',
                detail: error
            });
        })
});

router.get('/view', function (req, res, next) {
    var sendData = {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.BOARD,
        useBoards: req.boards
    };

    Board.Find.Article(req)
        .then(function (result) {
            result[0][0]['입력필드'] = result[0][0]['입력필드'] === '' ? [] : JSON.parse(result[0][0]['입력필드']);
            result[0][0]['입력필드2'] = result[0][0]['입력필드2'] === '' ? [] : JSON.parse(result[0][0]['입력필드2']);
            result[0][0]['데이터'] = JSON.parse(result[0][0]['데이터']);
            Object.keys(result[0][0]['데이터']).forEach(function (key) {
                if (typeof result[0][0]['데이터'][key] === 'string') {
                    result[0][0]['데이터'][key] = result[0][0]['데이터'][key].replace(/"/gim, "＂");
                    result[0][0]['데이터'][key] = result[0][0]['데이터'][key].replace(/'/gim, "′");
                }
            });

            result[0][0]['입력필드'].forEach(function (element) {
                if (element['type'].match(/프로그램선택|실행파일선택|직원선택|부서선택|지사선택/)) {
                    element['ejs'] = '../elements/드롭박스.ejs';
                } else {
                    element['ejs'] = '../elements/' + element['type'] + '.ejs';
                }

            }, this);
            result[0][0]['입력필드2'].forEach(function (element) {
                if (element['type'].match(/프로그램선택|실행파일선택|직원선택|부서선택|지사선택/)) {
                    element['ejs'] = '../elements/드롭박스.ejs';
                } else {
                    element['ejs'] = '../elements/' + element['type'] + '.ejs';
                }

            }, this);



            sendData.board = result[0][0];
            sendData.replys = result[1];
            sendData.replys.forEach(function (reply) {
                reply['첨부파일'] = JSON.parse(reply['첨부파일']);
                if (reply['첨부파일'].length) {
                    reply['첨부파일'] = reply['첨부파일'].sort(function (img1, img2) {
                        var _img1 = img1.name.substring(14, img1.name.length);
                        var _img2 = img2.name.substring(14, img1.name.length);
                        return (_img1 > _img2) ? 1 : (_img1 < _img2 ? -1 : 0);
                    });
                }
                reply['첨부파일'] = JSON.stringify(reply['첨부파일']);
            })


            res.render('board/view', sendData);
        })
        .catch(function (error) {
            res.render('error', {
                title: '500',
                message: '오류가 발생하였습니다.',
                detail: error
            });
        })

});


router.get('/edit', function (req, res, next) {
    var sendData = {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.BOARD,
        useBoards: req.boards
    };

    Board.Find.Article(req)
        .then(function (result) {
            result[0][0]['입력필드'] = result[0][0]['입력필드'] === '' ? [] : JSON.parse(result[0][0]['입력필드']);
            result[0][0]['입력필드2'] = result[0][0]['입력필드2'] === '' ? [] : JSON.parse(result[0][0]['입력필드2']);
            result[0][0]['데이터'] = JSON.parse(result[0][0]['데이터']);
            Object.keys(result[0][0]['데이터']).forEach(function (key) {
                if (typeof result[0][0]['데이터'][key] === 'string') {
                    result[0][0]['데이터'][key] = result[0][0]['데이터'][key].replace(/"/gim, "＂");
                    result[0][0]['데이터'][key] = result[0][0]['데이터'][key].replace(/'/gim, "′");
                }
            });

            result[0][0]['입력필드'].forEach(function (element) {
                if (element['type'].match(/프로그램선택|실행파일선택|직원선택|부서선택|지사선택/)) {
                    element['ejs'] = '../elements/드롭박스.ejs';
                } else {
                    element['ejs'] = '../elements/' + element['type'] + '.ejs';
                }

            }, this);

            result[0][0]['입력필드2'].forEach(function (element) {
                if (element['type'].match(/프로그램선택|실행파일선택|직원선택|부서선택|지사선택/)) {
                    element['ejs'] = '../elements/드롭박스.ejs';
                } else {
                    element['ejs'] = '../elements/' + element['type'] + '.ejs';
                }

            }, this);

            sendData.board = result[0][0];

            res.render('board/edit', sendData);
        })
        .catch(function (error) {
            res.render('error', {
                title: '500',
                message: '오류가 발생하였습니다.',
                detail: error
            });
        })

});

router.get('/manage', function (req, res, next) {
    Board.Find.Boards({
            use: false,
            permission: req.session.user
        })
        .then(function (result) {
            res.render('board/admin', {
                title: config.web.title,
                user: req.session.user,
                // menus: config.web.menu,
                // menu: config.web.menu.BOARD,
                boards: result,
                useBoards: req.boards
            });
        })
        .catch(function (error) {
            res.render('error', {
                title: '500',
                message: '오류가 발생하였습니다.',
                detail: error
            });
        })
});

router.get('/manage/new', function (req, res, next) {

    Company.Find.Areas(req)
        .then(function (result) {
            res.render('board/admin/write', {
                title: config.web.title,
                user: req.session.user,
                // menus: config.web.menu,
                // menu: config.web.menu.BOARD,
                areas: result[0],
                useBoards: req.boards
            });
        })
        .catch(function (error) {
            res.render('error', {
                title: '500',
                message: '오류가 발생하였습니다.',
                detail: error
            });
        })

});

router.get('/manage/edit', function (req, res, next) {
    var board;
    Board.Find.Board(req)
        .then(function (result) {

            result[0]['입력필드'] = result[0]['입력필드'] === '' || result[0]['입력필드'] === 'undefined' ? [] : JSON.parse(result[0]['입력필드']);
            board = result[0];
            return Company.Find.Areas(req);
        })
        .then(function (areas) {
            res.render('board/admin/edit', {
                title: config.web.title,
                user: req.session.user,
                // menus: config.web.menu,
                // menu: config.web.menu.BOARD,
                areas: areas[0],
                board: board,
                useBoards: req.boards
            });
        })
        .catch(function (error) {
            res.render('error', {
                title: '500',
                message: '오류가 발생하였습니다.',
                detail: error
            });
        })
});

router.get('/manage/input', function (req, res, next) {
    var sendData = {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.BOARD,
        useBoards: req.boards
    }
    Board.Find.Board(req)
        .then(function (result) {
            result[0]['입력필드'] = result[0]['입력필드'] === '' || result[0]['입력필드'] === 'undefined' ? [] : JSON.parse(result[0]['입력필드']);
            sendData['board'] = result[0];
            return Company.Find.Areas(req);
        })
        .then(function (areas) {
            sendData['areas'] = areas[0].map(function (area) {
                return area['지사명'];
            });
            return Users.Find.Users(req);
        })
        .then(function (users) {
            sendData['users'] = users.map(function (user) {
                return user['이름'];
            });
            res.render('board/admin/input', sendData);
        })
        .catch(function (error) {
            res.render('error', {
                title: '500',
                message: '오류가 발생하였습니다.',
                detail: error
            });
        })

});

module.exports = router;
