var express = require('express');
var router = express.Router();

// var server = require('../../src/index');
var Customer = Server.Customer;


router.get('/list', function (req, res, next) {
    Customer.Find.Customers(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});

router.get('/detail', function (req, res, next) {
    Customer.Find.Customer(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});

router.get('/misu', function (req, res, next) {
    Customer.Find.Misu(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});

router.get('/visits', function (req, res, next) {
    Customer.Find.Visits(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});

router.get('/visit', function (req, res, next) {
    Customer.Find.Visit(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});

router.post('/visit', function (req, res, next) {
    Customer.Insert.Visit(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});

router.put('/visit', function (req, res, next) {
    Customer.Update.Visit(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
});

router.delete('/visit', function (req, res, next) {
    Customer.Delete.Visit(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
});

router.put('/visit/time', function (req, res, next) {
    Customer.Update.VisitTime(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
});

router.get('/calls', function (req, res, next) {
    Customer.Find.Calls(req)
        .then(function (result) {

            result.forEach(function (element) {
                if (element['내용'].length > 0 && (element['문의내용'].length === 0 && element['처리내용'].length === 0)) {
                    var comment = ParseCommentToPart(element['내용']);
                    element['문의내용'] = comment[1];
                    element['처리내용'] = comment[2];
                    element['기타'] = comment[3];
                }
            });

            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });

    function ParseCommentToPart(comment) {
        var QUESTION = 'Q. 문의내용';
        var TREAT = 'A. 처리내용';
        var ETC = 'E.기타';
        var txtCmnt, _txtCmnt;

        txtCmnt = strip_html_tags(comment);

        txtCmnt = txtCmnt.replace(/&nbsp;/gim, ' ');

        if (txtCmnt.indexOf(QUESTION) >= 0) {

        } else if (txtCmnt.indexOf('Q.') >= 0) {
            QUESTION = 'Q.';
            TREAT = 'A.';
            ETC = 'E.';
        } else if (txtCmnt.indexOf('Q : ') >= 0) {
            QUESTION = 'Q : ';
            TREAT = 'A : ';
            ETC = 'E : ';
        }

        _txtCmnt = txtCmnt.replace(QUESTION, '|')
            .replace(TREAT, '|')
            .replace(ETC, '|');

        _txtCmnt = _txtCmnt.split('|');

        return _txtCmnt;

    }

    function strip_html_tags(str) {
        if ((str === null) || (str === ''))
            return false;
        else
            str = str.toString();
        return str.replace(/<[^>]*>/g, '');
    }
});

router.post('/calls', function (req, res, next) {
    Customer.Insert.Call(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
});

router.put('/calls', function (req, res, next) {
    Customer.Update.Call(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
});

router.delete('/calls', function (req, res, next) {
    Customer.Delete.Call(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
});

router.get('/services', function (req, res, next) {
    Customer.Find.Services(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});

router.post('/remote', function (req, res, next) {
    Customer.Find.UniqInfo({
        query: {
            USER_ID: req.body['user_id']
        }
    }).then(function (result) {
        if (result.length) {
            return Customer.Update.RemoteInfo(req);
        } else {
            return Customer.Insert.RemoteInfo(req);
        }
    }).then(function (result) {
        res.json(result);
    }).catch(function (error) {
        res.status(500).json(error);
    });
});

router.post('/specific', function (req, res, next) {
    Customer.Find.UniqInfo({
        query: {
            USER_ID: req.body['user_id']
        }
    }).then(function (result) {
        if (result.length) {
            return Customer.Update.UniqInfo(req);
        } else {
            return Customer.Insert.UniqInfo(req);
        }
    }).then(function (result) {
        res.json(result);
    }).catch(function (error) {
        res.status(500).json(error);
    });
});

router.get('/fee', function (req, res, next) {
    Customer.Find.CustomerFee(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});

router.put('/fee', function (req, res, next) {
    Customer.Update.CustomerFee(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});

router.get('/hospitalinfo', function (req, res, next) {
    Customer.Find.HospitalInfoByHospNum(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});

router.get('/detail/hospnum', function(req, res, next) {
    Customer.Find.HospitalInfoByHospNum(req)
    .then(function(result){
        if (result.length >= 1) {                   
            return Customer.Find.Customer({query: {id: result[0]['user_id'], hospnum: result[0]['user_med_id']}})
        } else {
            res.json({});
        }
    })
    .then(function(result){
        try {
            console.log(req.query)
            if (req.query.type==1) {
                var resultText = ''
                Object.keys(result.info).forEach(function(key) {
                    if(resultText.length > 0) {resultText += '|';}
                    resultText += `${key}=${result.info[key]}`;
                });
                resultText += '^';
                Object.keys(result.uniq).forEach(function(key) {
                    if(resultText.length > 0) {resultText += '|';}
                    resultText += `${key}=${result.uniq[key]}`;
                });
                resultText += '^';
                Object.keys(result.backup).forEach(function(key) {
                    if(resultText.length > 0) {resultText += '|';}
                    resultText += `${key}=${result.backup[key]}`;
                });
                resultText += '^부가서비스=' + result.extra;
                resultText += '^Pacs=' + result.pacs;
                resultText += '^Out=' + result.out;
                // result.extra.forEach(function(item,index){
                //     resultText += item['부가서비스'];
                //     if (index < result.extra.length){
                //         resultText += ',';
                //     }
                // })


                resultText = resultText.replace(/(<([^>]+)>)/gi, "")

                res.send(resultText);
            } else{
                res.json(result);
            }
        } catch (error) {
            console.log(error)
        }

    })
    .catch(function(error){
        res.status(500).json(error);
    })
});

//센스서버에서 버전정보 요청
router.get('/get/version', function (req, res, nex) {
    Customer.Find.Version(req)
        .then(function (result) {
            res.send(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).send('error');
        })
});

router.get('/version', function (req, res, next) {
    Customer.Update.Version(req)
        .then(function (result) {
            //res.json(result);
            if (result.rowsAffected[0] === 1) {
                res.send('200');
            } else {
                res.send('500');
            }
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
});

module.exports = router;
