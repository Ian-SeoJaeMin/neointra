var express = require('express');
var router = express.Router();
var config = require('../src/config');


router.get('/', function (req, res, next) {

    var sheetLink = config.CONSTS.DOCS[req.query.sheet]; 

    res.render('sheet', {
        title: config.web.title,
        user: req.session.user,        
        useBoards: req.boards,
        name: req.query.name,
        sheet: sheetLink
    });
});


module.exports = router;