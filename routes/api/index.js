var express = require('express')
var router = express.Router()

var users = require('./users')
var customer = require('./customer')
var company = require('./company')
var service = require('./service')
var static = require('./static')
var project = require('./project')
var report = require('./report')
var board = require('./board')
var schedule = require('./schedule')
var reply = require('./reply')
var fm = require('./filemanager')
var amount = require('./amount')
var settlement = require('./settlement')
var finder = require('./finder')
var quoteorder = require('./quoteorder')
var serviceEmergen = require('./service_emergen')
var serviceData = require('./service_data')
var drafting = require('./drafting')

router.use('/users', users)
router.use('/customer', customer)
router.use('/company', company)
router.use('/service', service)
router.use('/static', static)
router.use('/project', project)
router.use('/report', report)
router.use('/board', board)
router.use('/schedule', schedule)
router.use('/reply', reply)
router.use('/fm', fm)
router.use('/amount', amount)
router.use('/settlement', settlement)
router.use('/finder', finder)
router.use('/quoteorder', quoteorder)
router.use('/emergen', serviceEmergen)
router.use('/servicedata', serviceData)
router.use('/drafting', drafting)
router.post('/admin', function (req, res, next) {
    Server.fn
        .SaveSetting(req)
        .then(function (result) {
            console.log(result)
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})

router.post('/admin/user', function (req, res, next) {
    Server.fn
        .SaveUserSetting(req)
        .then(function (result) {
            console.log(result)
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})

// router.post('/kakao', function (req, res, next) {
//     var Kakao = Server.Kakao

//     Kakao.Insert.PushGroup(req.body.message, req.body.to)
//         .then(function (result) {
//             res.json(result)
//         })
//         .catch(function (error) {
//             console.log(error)
//             res.status(500).json(error)
//         })

// })

module.exports = router
