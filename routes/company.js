var express = require('express');
var router = express.Router();
var config = require('../src/config');

var project = require('./project');

router.use('/project', project);


module.exports = router;