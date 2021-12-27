var express = require('express');
var router = express.Router();

// var server = require('../../src/index');
var Users = Server.Users;

router.get('/', function (req, res, next) {

});

router.get('/login', function (req, res, next) {
    Users.Find.User(req)
        .then(function (result) {
            if (result) {
                console.log(result);
                if (result['상태'] === 0) {
                    result['설정'] = result['설정'].length ? JSON.parse(result['설정']) : {};
                    req.session.user = result;
                }

                res.json(result);
            } else {
                res.status(404).json(result);
            }
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.get('/users', function (req, res, next) {
    Users.Find.Users(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        })
})


module.exports = router;