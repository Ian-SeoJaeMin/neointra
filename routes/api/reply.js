var express = require ('express');
var router = express.Router ();
var multer = require ('multer'),
  storage = multer.diskStorage ({
    destination: function (req, file, cb) {
      cb (null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
      cb (null, new Date ().valueOf () + '_' + file.originalname);
    },
  });
upload = multer ({storage: storage});

// var server = require('../../src/index');
var FileManager = Server.FileManager;
var Reply = Server.Reply;
var Kakao = Server.Kakao;

router.get ('/', function (req, res, next) {
  res.send ('hello');
});

router.post ('/', upload.array ('uploadfile'), function (req, res, next) {
  console.log (req.body, req.files);
  FileManager.AddFile (
    {
      savepath: 'reply',
    },
    req.files
  )
    .then (function (savedFiles) {
      savedFiles = JSON.stringify (savedFiles);
      savedFiles = savedFiles.replace (/\\\\/gim, '/');
      savedFiles = JSON.parse (savedFiles);
      req.body.files = savedFiles;
      return Reply.Insert.Reply (req);
    })
    .then (function (replyResult) {
      console.log (replyResult);

      if (replyResult.recordset.length > 0) {
        var message = '';
        message += '등록하신 글에 댓글이 등록되었습니다. \n';
        if (req.body.redirect) {
          message += req.body.redirect;
        }
        replyResult.recordset.forEach (function (writer) {
          if (process.env.NODE_ENV === 'build') {
            Kakao.Insert.Push(message, writer['작성자명']);
          } else {
            Kakao.Insert.Push (message, '서재민');
          }
        });
      }

      if (req.body['redirect']) {
        res.redirect (req.body.redirect);
      } else {
        res.json (replyResult);
      }
    })
    .catch (function (error) {
      console.log (error);
      res.status (500).json (error);
    });
});

router.delete ('/', function (req, res, next) {
  Reply.Delete
    .Reply (req)
    .then (function (result) {
      var replyFiles = JSON.parse (result['첨부파일']);
      return FileManager.DeleteFile (replyFiles);
    })
    .then (function () {
      res.json ({});
    })
    .catch (function (error) {
      res.status (500).json (error);
    });
});

module.exports = router;
