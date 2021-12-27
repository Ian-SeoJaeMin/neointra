var express = require('express');
var router = express.Router();
var config = require('../src/config');

var Project = require('../src/index').Project;
var Users = require('../src/index').Users;

router.get('/', function (req, res, next) {
    res.render('project', {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.PROJECT,
        useBoards: req.boards
    });
});

router.get('/view', function (req, res, next) {
    Project.Find.Project(req)
        .then(function (result) {
            res.render('project/view', {
                title: config.web.title,
                user: req.session.user,
                // menus: config.web.menu,
                // menu: config.web.menu.PROJECT,
                useBoards: req.boards,
                project: result
            });
        })
        .catch(function (error) {
            console.log(error);
            res.render('error', {
                title: '500',
                message: '프로젝트정보를 찾지 못하였습니다.',
                detail: error
            });
        })
});

router.get('/write', function (req, res, next) {
    Users.Find.Users(req)
        .then(function (users) {
            res.render('project/write', {
                title: config.web.title,
                user: req.session.user,
                // menus: config.web.menu,
                // menu: config.web.menu.PROJECT,
                useBoards: req.boards,
                users: users
            });
        })
        .catch(function (error) {
            console.log(error);
            res.render('error', {
                title: '500',
                message: '프로젝트정보를 찾지 못하였습니다.',
                detail: error
            });
        })

})

router.get('/edit', function (req, res, next) {
    var project = null;
    Project.Find.Project(req)
        .then(function (result) {
            project = result;
            return Users.Find.Users(req);
        })
        .then(function (users) {
            res.render('project/edit', {
                title: config.web.title,
                user: req.session.user,
                // menus: config.web.menu,
                // menu: config.web.menu.PROJECT,
                useBoards: req.boards,
                project: project,
                users: users
            });
        })
        .catch(function (error) {
            console.log(error);
            res.render('error', {
                title: '500',
                message: '프로젝트정보를 찾지 못하였습니다.',
                detail: error
            });
        })
})

module.exports = router;