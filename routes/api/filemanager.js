var express = require('express');
var router = express.Router();
var multer = require('multer'),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, new Date().valueOf() + '_' + file.originalname);
        }
    })
upload = multer({ storage: storage });

// var server = require('../../src/index');
var FileManager = Server.FileManager;

router.get('/', function (req, res, next) {
    res.send('hello');
});

router.delete('/delete', function (req, res, next) {
    console.log(req.body);
    FileManager.DeleteFile(req.body.files)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })

});

router.post('/upload', upload.array('uploadfile'), function (req, res, next) {
    FileManager.AddFile(req.body, req.files)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
});

router.post('/capture', upload.array('uploadfile'), function (req, res, next) {
    console.log(req.body, req.files);
    FileManager.AddFile({
        savepath: 'service'
    }, req.files)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
});

module.exports = router;