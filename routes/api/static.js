var express = require('express');
var router = express.Router();

// var server = require('../../src/index');
var Static = Server.Static;
var Users = Server.Users;

router.get('/', function (req, res, next) {

});

router.get('/status', function (req, res, next) {
    Static.Find.Status(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
});

router.get('/program', function (req, res, next) {
    Static.Find.Program(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.get('/area', function (req, res, next) {
    Static.Find.Area(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
});

router.get('/exe', function (req, res, next) {
    Static.Find.Exe(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
});

router.get('/exedetail', function (req, res, next) {
    Static.Find.ExeDetail(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
});

router.get('/fee', function (req, res, next) {
    Static.Find.Fee(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.put('/fee', function (req, res, next) {
    Static.Update.ServiceFee(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})

router.post('/fee', function (req, res, next) {
    Static.Find.FeeLock(req)
        .then(function (result) {
            if (result) {
                return Static.Delete.FeeLock(req)
            } else {
                return Static.Insert.FeeLock(req)
            }
        })
        .then(function (result2) {
            res.json(result2)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})

router.get('/fee2020', function (req, res, next) {
    
    var sendData = {
        data: {},
        closed: 0
    }
    Static.Find.Fee2020(req)
        .then(function (result) {
            sendData.data = result;
            if (result.length > 1) {
                console.log(result[0]);
                console.log(result[0]['마감']);
                if (result[0]['마감'] !== "") {
                    sendData.closed = 1
                }
            }            
           return Users.Find.Users({query:{}})
        }).then(function(users){            
            sendData.data.forEach(element => {                
                var userIdx = users.findIndex(user => user['인덱스'] == element['공유자']);
                if (userIdx >= 0) {
                    element['공유자명'] = users[userIdx]['이름'];
                    element['공유자지사'] = users[userIdx]['지사코드'];
                } else {
                    element['공유자명'] = '';
                    element['공유자지사'] = '';
                }               
                userIdx = users.findIndex(user => user['인덱스'] == element['완료자']);
                if (userIdx >= 0) {
                    element['완료자명'] = users[userIdx]['이름'];
                    element['완료자지사'] = users[userIdx]['지사코드'];
                    element['부서'] = users[userIdx]['부서코드'];
                } else {
                    element['완료자명'] = '';
                    element['완료자지사'] = '';
                    element['부서'] = '';
                }             
            });
            res.json(sendData);
        })        
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.post('/fee2020', function (req, res, next) {
    Static.Find.FeeLock2020(req)
        .then(function (result) {
            if (result) {
                return Static.Delete.FeeLock2020(req)
            } else {
                return Static.Insert.FeeLock2020(req)
            }
        })
        .then(function (result2) {
            res.json(result2)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})

router.get('/acceptdays', function (req, res, next) {
    Static.Find.AcceptDays(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.get('/asfinder', function (req, res, next) {
    Static.Find.ASFinderUsage(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.get('/categorys', function (req, res, next) {
    Static.Find.Categorys(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.get('/finder/:level', function (req, res, next) {
    console.log(req.params)
    var level = req.params.level
    var fn = (function () {
        switch (level) {
            case 'menu':
                return Static.Find.FinderMenu
            case 'btn':
                return Static.Find.FinderBtn
            case 'list':
                return Static.Find.FinderList
        }
    })()

    fn(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})

router.get('/caution', function (req, res, next) {
    Static.Find.CautionList(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
});

module.exports = router;
