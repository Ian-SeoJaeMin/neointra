var express = require('express')
var router = express.Router()

// var server = require('../../src/index');
// var CONSTS = require('../../src/config').CONSTS
// var Service = Server.ServiceEmergen
// var Kakao = Server.Kakao
// var FileManager = Server.FileManager

router.get('/', function (req, res, next) {})

router.get('/list', function (req, res, next) {
    var Service = Server.ServiceEmergen
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
    var Service = Server.ServiceEmergen
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

router.put('/detail', function (req, res, next) {
    var Service = Server.ServiceEmergen


    Service.Update.Service(req)
        .then(function (result) {
            // console.log(result);
            var params = req.body
            if (params['상태'] != 0) {
                var Kakao = Server.Kakao;
                var message = ''
                const NEWLINE = '\n'
                message += '병원명: ' + params['기관명칭'] + ' / ' + params['기관코드'] + NEWLINE
                message += 'AS유형: ' + params['유형'] + NEWLINE + NEWLINE
                message += '문의내용:' + NEWLINE + params['문의내용'] + NEWLINE
                message += '-------------------------------' + NEWLINE + NEWLINE
                message += '처리자: ' + params['처리자명'] + NEWLINE
                message += '상태: '
                if (params['상태'] == 0) {
                    message += '접수' + NEWLINE;
                } else if (params['상태'] == 1) {
                    message += '처리중' + NEWLINE;
                } else if (params['상태'] == 2) {
                    message += '완료' + NEWLINE;
                } else if (params['상태'] == 3) {
                    message += '보류' + NEWLNE;
                } else if (params['상태'] == 4) {
                    message += '취소' + NEWLINE;
                }

                message += '처리내용:' + NEWLINE + params['처리내용'] + NEWLINE + NEWLINE
                message += '처리일: ' + params['처리시간']

                Kakao.Insert.PushGroup(message, '응급서비스')
                params = null
                Kakao = null
            }

            res.json(result)

        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error)
        })

    Service = null

})


module.exports = router
