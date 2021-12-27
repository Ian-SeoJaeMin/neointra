var express = require('express');
var router = express.Router();

// var server = require('../../src/index');
var Board = Server.Board;
var Reply = Server.Reply;
var FileManager = Server.FileManager;
var Kakao = Server.Kakao;


router.get('/', function (req, res, next) {
    Board.Find.Articles(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
})

router.post('/', function (req, res, next) {
    Board.Insert.Article(req)
        .then(function (result) {
            var params = req.body;
            var message = '';
            message += params['게시판명칭'] + ' 게시판에 새로운 글이 등록되었습니다. \n';
            message += req.protocol + '://' + req.get('host') + '/board/view?index=' + params['게시판ID'] + '&article=' + result['인덱스'];
            if (req.body['그룹방명칭'] && req.body['그룹방명칭'].length) {

                if (process.env.NODE_ENV === 'build') {
                    Kakao.Insert.PushGroup(message, req.body['그룹방명칭']);
                } else {
                    Kakao.Insert.Push(message, '서재민');
                }
            }
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
});

router.put('/', function (req, res, next) {
    Board.Update.Article(req)
        .then(function (result) {
            // res.json(result);
            if (req.body['로그']['메세지'].length) {
                return Reply.Insert.Reply({
                    body: {
                        table: 'N_리플',
                        article: req.body['게시글ID'],
                        category: req.body['게시판ID'],
                        message: req.body['로그']['메세지'],
                        writer: 19,
                        files: []
                    }
                })
            } else {
                res.json(result);
            }
        })
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
});

router.delete('/', function (req, res, next) {
    Board.Delete.Article(req)
        .then(function (articleFiles) {
            return FileManager.DeleteFile(articleFiles);
        })
        .then(function () {
            return Reply.Delete.Replys(req)
        })
        .then(function (replyFiles) {
            return FileManager.DeleteFile(replyFiles);
        })
        .then(function () {
            res.json({});
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })

})

router.post('/manage', function (req, res, next) {
    Board.Insert.Board(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.put('/manage', function (req, res, next) {
    Board.Update.Board(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
});

router.put('/manage/sort', function (req, res, next) {
    Board.Update.BoardSort(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})

router.delete('/manage', function (req, res, next) {
    Board.Delete.Board(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

module.exports = router;
