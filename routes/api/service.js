var express = require('express')
var router = express.Router()

// var server = require('../../src/index');
var CONSTS = require('../../src/config').CONSTS

router.get('/', function (req, res, next) { })

router.get('/list', function (req, res, next) {
    var Service = Server.Service
    Service.Find.Services(req)
        .then(function (result) {
            // console.log(result);
            res.json(result)
        })
        .catch(function (error) {
            // console.log(error);
            res.status(500).json(error)
        })
    Service = null
})

router.get('/detail', function (req, res, next) {
    var Service = Server.Service
    Service.Find.Service(req)
        .then(function (result) {
            // console.log(result);
            res.json(result)
        })
        .catch(function (error) {
            // console.log(error);
            res.status(500).json(error)
        })
    Service = null
})

router.get('/history', function (req, res, next) {
    var Service = Server.Service
    Service.Find.History(req)
        .then(function (result) {
            // console.log(result);
            res.json(result)
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error)
        })
    Service = null
})

router.put('/detail', function (req, res, next) {
    var Service = Server.Service
    Service.Update.Service(req)
        .then(function (result) {
            var Kakao = Server.Kakao
            var message = ''
            try {

                if (result['상태'] === CONSTS.SERVICE_STATUS.DONE) {

                    message += `[ A/S가 완료되었습니다. ]\n\n`
                    message += `접수번호: ${result['인덱스']}\n`
                    message += `병원명: ${result['기관명칭']}\n`
                    message += `접수자: ${result['접수자']}\n`
                    message += `연락처: ${result['연락처'] +
                        (result['내선번호'] !== ''
                            ? '(' + result['내선번호'] + ')'
                            : '')}\n\n`
                    message += `문의내용\n`
                    message += `${result['문의내용']}\n`
                    message += `확인내용\n`
                    message += `${result['확인내용']}\n`
                    message += `처리내용\n`
                    message += `${result['처리내용']}\n\n`

                    if (result['공유자'] > 0) {
                        message += `공유자: ${result['공유자명']}\n`
                    }
                    if (result['처리자'] > 0) {
                        message += `처리자: ${result['처리자명']}\n`
                    }
                    if (result['완료자'] > 0) {
                        message += `완료자: ${result['완료자명']}\n`
                    }

                    if (result['담당자'] !== 0) {
                        Kakao.Insert.Push(message, result['담당자명'])
                    } else if (result['지사코드'] !== '0000') {

                        if (result['지사코드'] === '0028' || result['지사코드'] === '0042') {
                            result['지사'] = '경기동부'
                        } else if (result['지사코드'] === '0043') {
                            result['지사'] = '서울강동'
                        }

                        Kakao.Insert.Push(
                            message,
                            result['지사']
                        )
                    }

                    if (
                        result['공유자'] > 0 &&
                        result['공유자'] !== result['완료자']
                    ) {
                        Kakao.Insert.Push(message, result['공유자명'])
                    }
                } else if (result['상태'] === CONSTS.SERVICE_STATUS.HOLD) {

                    message += `[ A/S가 보류상태로 변경되었습니다. ]\n\n`
                    message += `접수번호: ${result['인덱스']}\n`
                    message += `병원명: ${result['기관명칭']}\n`
                    message += `접수자: ${result['접수자']}\n`
                    message += `연락처: ${result['연락처'] +
                        (result['내선번호'] !== ''
                            ? '(' + result['내선번호'] + ')'
                            : '')}\n\n`
                    message += `문의내용\n`
                    message += `${result['문의내용']}\n`
                    message += `확인내용\n`
                    message += `${result['확인내용']}\n`
                    message += `보류내용\n`
                    message += `${result['보류내용']}\n\n`

                    if (result['공유자'] > 0) {
                        message += `공유자: ${result['공유자명']}\n`
                    }
                    if (result['처리자'] > 0) {
                        message += `처리자: ${result['처리자명']}\n`
                    }
                    if (result['보류자'] > 0) {
                        message += `보류자: ${result['보류자명']}\n`
                    }

                    if (result['담당자'] !== 0) {
                        Kakao.Insert.Push(message, result['담당자명'])
                    } else if (result['지사코드'] !== '0000') {
                        Kakao.Insert.Push(
                            message,
                            result['지사코드'] === '0028' ?
                                '경기동부' :
                                result['지사']
                        )
                    }

                    if (
                        result['공유자'] > 0 &&
                        result['공유자'] !== result['보류자']
                    ) {
                        Kakao.Insert.Push(message, result['공유자명'])
                    }
                }
            } catch (error) {
                console.log(error)
            } finally {
                Kakao = null
                message = null
                res.json(result)
            }
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error)
        })
    Service = null
})
router.put('/save', function (req, res, next) {
    var Service = Server.Service
    Service.Update.ServicePart(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            // console.log(error);
            res.status(500).json(error)
        })
    Service = null
})

router.put('/cancel', function (req, res, next) {
    var Service = Server.Service
    Service.Update.Cancel(req)
        .then(function (result) {
            // console.log(result);
            res.json(result)
        })
        .catch(function (error) {
            // console.log(error);
            res.status(500).json(error)
        })
    Service = null
})

router.get('/status', function (req, res, next) {
    var Service = Server.Service
    Service.Find.Status(req)
        .then(function (result) {
            // console.log(result);
            res.json(result)
        })
        .catch(function (error) {
            // console.log(error);
            res.status(500).json(error)
        })
    Service = null
})
router.get('/reply', function (req, res, next) {
    var Service = Server.Service
    Service.Find.Replys(req)
        .then(function (result) {
            // console.log(result);
            res.json(result)
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error)
        })
    Service = null
})
router.post('/reply', function (req, res, next) {
    var Service = Server.Service
    var _result
    Service.Insert.Reply(req)
        .then(function (reply) {
            _result = reply
            return Service.Find.Service({
                query: {
                    key: req.body['key']
                }
            })
        })
        .then(function (service) {
            var Kakao = Server.Kakao
            var params = req.body
            var serviceStaff = service[0][0]
            var serviceReplyWriters = service[1]
            var message = ''
            message +=
                'A/S에 ' + params.user['이름'] + '님이 댓글을 등록하였습니다.'
            message += '\n 접수번호: ' + params.key
            message += '\n\n' + params.comment

            console.log(serviceStaff, serviceReplyWriters)
            // 공유자에게 톡
            if (
                serviceStaff['공유자'] > 0 &&
                serviceStaff['공유자'] !== params.user['인덱스']
            ) {
                serviceReplyWriters = serviceReplyWriters.filter(function (
                    writer
                ) {
                    return writer['작성자'] !== serviceStaff['공유자']
                })

                Kakao.Insert.Push(message, serviceStaff['공유자명'])
            }
            if (
                serviceStaff['보류자'] > 0 &&
                serviceStaff['보류자'] !== params.user['인덱스']
            ) {
                serviceReplyWriters = serviceReplyWriters.filter(function (
                    writer
                ) {
                    return writer['작성자'] !== serviceStaff['보류자']
                })
                Kakao.Insert.Push(message, serviceStaff['보류자명'])
            }
            if (
                serviceStaff['처리자'] > 0 &&
                serviceStaff['처리자'] !== params.user['인덱스']
            ) {
                serviceReplyWriters = serviceReplyWriters.filter(function (
                    writer
                ) {
                    return writer['작성자'] !== serviceStaff['처리자']
                })
                Kakao.Insert.Push(message, serviceStaff['처리자명'])
            }

            serviceReplyWriters.forEach(function (writer) {
                if (writer['작성자'] !== params.user['인덱스']) {
                    Kakao.Insert.Push(message, writer['작성자명'])
                }
            })

            Service = null
            Kakao = null
            params = null
            serviceStaff = null
            serviceReplyWriters = null
            message = null

            res.json(_result)
        })
        .catch(function (error) {
            Service = null
            _result = null
            console.log(error)
            res.status(500).json(error)
        })
    // Service = null
})

router.delete('/reply', function (req, res, next) {
    var Service = Server.Service
    Service.Delete.Reply(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
    Service = null
})

router.get('/remote', function (req, res, next) {
    var FileManager = Server.FileManager
    FileManager.RemoteFile(req)
        .then(function (remotePath, remoteName) {
            res.download(remotePath, remoteName, function (err) {
                console.log(err)
            })
        })
        .catch(function (error) {
            console.log(error)
        })
    FileManager = null
})

router.put('/tag', function (req, res, next) {
    var Service = Server.Service
    Service.Update.ServiceTag(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
    Service = null
})

router.get('/tags', function (req, res, next) {
    var Service = Server.Service

    Service.Find.Tags(req)
        .then(function (result) {
            var search = req.query.search || ''
            var app = req.query.app || ''
            if (search.length) {
                var tags = result['tags']
                    .replace(/\\n/g, '\\n')
                    .replace(/\\'/g, "\\'")
                    .replace(/\\"/g, '\\"')
                    .replace(/\\&/g, '\\&')
                    .replace(/\\r/g, '\\r')
                    .replace(/\\t/g, '\\t')
                    .replace(/\\b/g, '\\b')
                    .replace(/\\f/g, '\\f')
                // remove non-printable and other non-valid JSON chars
                tags = tags.replace(/[\u0000-\u0019]+/g, '')
                tags = JSON.parse(tags)

                tags = tags.filter(function (tag) {
                    return tag.exe === app
                })
                var filtered = []
                var temp = ''
                // var selIndex = -1
                // 메뉴/버튼 검색기능 버튼검색에서 메뉴검색으로 바꿈
                // 버튼과 메뉴 둘다 검색되게 바꿈
                tags[0].mainCategory.forEach(function (item) {
                    console.log(item)
                    // console.log(item.subCategory)
                    temp = item.name.toUpperCase()
                    if (temp.indexOf(search.toUpperCase()) >= 0) {
                        item.subCategory.forEach(function (_item) {
                            // temp = _item.toUpperCase()
                            // if (temp.indexOf(search.toUpperCase()) >= 0) {
                            filtered.push(item.name + ' - ' + _item)
                            // }
                        })
                    } else {
                        item.subCategory.forEach(function (_item) {
                            temp = _item.toUpperCase()
                            if (temp.indexOf(search.toUpperCase()) >= 0) {
                                filtered.push(item.name + ' - ' + _item)
                            }
                        })
                    }
                })
                search = null
                app = null
                tags = null
                temp = null
                res.json(filtered)
            } else {
                search = null
                app = null
                temp = null
                res.json(result)
            }

        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
    Service = null
})

router.post('/tags', function (req, res, next) {
    var Service = Server.Service
    Service.Update.Tags(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
    Service = null
})

router.post('/emergen', function (req, res, next) {
    var Service = Server.Service
    var Kakao = Server.Kakao
    Service.Insert.EmergenService(req)
        .then(function (result) {
            return Kakao.Insert.PushGroup(req.body.message, req.body.to)
            //         .then(function (result) {
            //             res.json(result)
            //         })
            //         .catch(function (error) {
            //             console.log(error)
            //             res.status(500).json(error)
            //         })
        })
        .then(function (result) {
            Kakao = null
            res.json(result)
        })
        .catch(function (error) {
            Kakao = null
            console.log(error)
            res.status(500).json(error)
        })
    Service = null
})

router.post('/afk', function (req, res, next) {
    var Service = Server.Service
    Service.Insert.AwayFromService(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
    Service = null
})

router.delete('/afk', function (req, res, next) {
    var Service = Server.Service
    Service.Delete.AwayFromService(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
    Service = null
})

router.put('/feedback', function (req, res, next) {
    var Service = Server.Service
    Service.Update.FeedbackService(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
    Service = null
})

router.post('/dev', function (req, res) {
    var Service = Server.Service
    Service.Find.DevServiceInfo(req)
        .then(function (result) {
            if (result.length) {
                return Service.Update.DevServiceInfo(req)
            } else {
                return Service.Insert.DevServiceInfo(req)
            }
        }).then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})

module.exports = router
