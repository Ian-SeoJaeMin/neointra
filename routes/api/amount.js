var express = require('express');
var router = express.Router();

// var server = require('../../src/index');
var Amount = Server.Amount;

router.get('/', function (req, res, next) {
    Amount.Find.Amounts(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
});

router.post('/', function (req, res, next) {
    console.log(req.body)
    Amount.Find.AmountManage(req)
        .then(function (result) {
            if (result.length === 0) {
                return Amount.Insert.AmountManage(req)
            } else {
                return Amount.Update.AmountManage(req)
            }
        })
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
})


module.exports = router;
