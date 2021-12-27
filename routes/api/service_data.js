var express = require('express')
var router = express.Router()

router.get('/', function (req, res, next) { })

router.get('/list', function (req, res, next) {
    var ServiceData = Server.ServiceData
    ServiceData.Find.Services(req)
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



module.exports = router
