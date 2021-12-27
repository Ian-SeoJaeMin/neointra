var express = require('express');
var router = express.Router();

// var server = require('../../src/index');
var Company = Server.Company;

router.get('/', function (req, res, next) {

});

router.get('/schedule', function (req, res, next) {
    Company.Find.Schedules(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        })
});

router.get('/areas', function (req, res, next) {
    Company.Find.Areas(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        })
});

router.get('/managers', function (req, res, next) {
    Company.Find.Managers(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        })
});

module.exports = router;