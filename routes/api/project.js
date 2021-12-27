var express = require('express')
var router = express.Router()

// var server = require('../../src/index');
var Project = Server.Project
var FileManager = Server.FileManager
var Reply = Server.Reply
var Kakao = Server.Kakao

router.get('/', function (req, res, next) {})

router.get('/writer', function (req, res, next) {
    Project.Find.Writers(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            res.status(500).json(error)
        })
})

router.get('/developer', function (req, res, next) {
    Project.Find.Developers(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            res.status(500).json(error)
        })
})

router.get('/list', function (req, res, next) {
    Project.Find.Projects(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            res.status(500).json(error)
        })
})

router.put('/save', function (req, res, next) {
    Project.Update.Project(req)
        .then(function (result) {
            if (req.body['로그'] && req.body['로그'].length) {
                console.log(req.body)
                var message = ''
                message += '프로젝트 상태변경\n'
                message += '프로젝트 번호: ' + req.body['project-index'] + '\n'
                message +=
                    '프로젝트 명칭: ' + req.body['project-title'] + '\n\n'

                var to = ''
                var status = ''
                switch (parseInt(req.body['project-status'])) {
                    case 0:
                        status = '접수'
                        break
                    case 1:
                        status = '회의중'
                        break
                    case 2:
                        status = '개발중'
                        break
                    case 3:
                        status = '개발테스트'
                        break
                    case 4:
                        status = '개발완료'
                        to = req.body['project-writerName']
                        break
                    case 5:
                        status = '사용테스트'
                        break
                    case 6:
                        status = '완료'
                        to = req.body['project-managerName']
                        break
                    case 7:
                        status = '보류'
                        break
                    case 10:
                        status = '취소'
                        break
                }

                message += req.body['로그'].replace(
                    '상태를',
                    '프로젝트 상태를 ' + status + '로 '
                )

                if (to !== '') {
                    Kakao.Insert.Push(message, to);
                }

                return Reply.Insert.Reply({
                    body: {
                        table: 'N_프로젝트HIS',
                        category: 2,
                        article: req.body['project-index'],
                        message: req.body['로그'].replace(
                            '상태를',
                            '프로젝트 상태를 ' + status + '로 '
                        ),
                        writer: 19,
                        files: []
                    }
                })
            } else {
                res.json(result)
            }
        })
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})

router.post('/save', function (req, res, next) {
    Project.Insert.Project(req)
        .then(function (result) {
            // res.json(result);
            if (!req.body['project-uploadfiles']) {
                req.body['project-uploadfiles'] = []
            }

            FileManager.AddFile({
                    savepath: 'project/' + result['인덱스']
                },
                req.body['project-uploadfiles']
            )
        })
        .then(function () {
            res.json({})
        })
        .catch(function (error) {
            res.status(500).json(error)
        })
})

router.delete('/delete', function (req, res, next) {
    Project.Delete.Project(req)
        .then(function (result) {
            FileManager.DeleteFolder('/project/' + req.body.index)
        })
        .then(function () {
            res.json({})
        })
        .then(function () {
            res.status(500).json(error)
        })
})

router.put('/incen', function (req, res, next) {
    Project.Update.ProjectIncentive(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})


module.exports = router
