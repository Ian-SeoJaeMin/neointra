var express = require('express')
var router = express.Router()

var Finder = Server.Finder

router.get('/map', function (req, res) {
    Finder.Find.Mapping(req)
        .then(function (resp) {
            res.json(resp)
        })
        .catch(function (error) {
            res.status(500).json(error)
        })
})

router.get('/search', function (req, res) {
    Finder.Find.Search(req)
        .then(function (resp) {
            res.json(resp)
        })
        .catch(function (error) {
            res.status(500).json(error)
        })
})

router.get('/matching', function (req, res) {
    Finder.Find.MatchingCount(req)
        .then(function (resp) {
            res.json(resp)
        })
        .catch(function (error) {
            res.status(500).json(error)
        })
})

router.post('/like', function (req, res) {
    Finder.Insert.Like(req)
        .then(function (resp) {
            res.json(resp)
        })
        .catch(function (error) {
            res.status(500).json(error)
        })
})

router.delete('/like', function (req, res) {
    Finder.Delete.Like(req)
        .then(function (resp) {
            res.json(resp)
        })
        .catch(function (error) {
            res.status(500).json(error)
        })
})

router.post('/dislike', function (req, res) {
    Finder.Insert.DisLike(req)
        .then(function (resp) {
            res.json(resp)
        })
        .catch(function (error) {
            res.status(500).json(error)
        })
})

module.exports = router
