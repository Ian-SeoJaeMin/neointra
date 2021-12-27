var express = require('express');
var router = express.Router();

// var server = require('../../src/index');
var Drafting = Server.Drafting;
router.get('/list', function (req, res) {
    Drafting.Find.Draftings(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
})

router.post('/item', function (req, res) {
    Drafting.Insert.Drafting(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.put('/item', function (req, res) {
    Drafting.Update.Drafting(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.put('/approval', function (req, res) {
    Drafting.Update.ApprovalDate(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.delete('/item', function (req, res) {
    Drafting.Delete.Drafting(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.delete('/approval', function (req, res) {
    Drafting.Delete.ApprovalDate(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})
module.exports = router;
