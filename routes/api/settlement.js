var express = require('express');
var router = express.Router();

// var server = require('../../src/index');
var Settlement = Server.Settlement;
var Customer = Server.Customer;

router.get('/member', function (req, res, next) {
    Settlement.Find.SettlementMember(req)
        .then(function (result) {

            var sendData = {
                cms: null,
                yearCms: null,
                bill: null,
                others: null,
                newSale: [],
                serviceCount: 0
            };

            if (result[0].length === 1 && result[0][0].hasOwnProperty('정산서')) {

                sendData.bill = JSON.parse(result[0][0]['정산서']);
            } else if (result[0].length >= 1) {
                sendData.cms = result[0].filter(function (item) {
                    return item['연유지'] !== 1;
                });
                sendData.yearCms = result[0].filter(function (item) {
                    return item['연유지'] === 1;
                });
                sendData.others = result[0].filter(function (item) {
                    return item['유지보수외'] > 0;
                });
                sendData.serviceCount = result[1];
            }

            // var sendData = {
            //     year_maintaince: [],
            //     sales: [],
            //     sales_details: result[0],
            //     newsales: result[1],
            //     salesSaved: result[2],
            //     serviceCount: result[3]
            // };

            // sendData.sales_details.forEach(function (item) {
            //     if (item['연유지'] === 1) {
            //         sendData.year_maintaince.push(item);
            //     }

            //     if (item['유지보수외'] > 0) {
            //         sendData.sales.push(item);
            //     }
            // });

            // sendData.year_maintaince.forEach(function (item) {
            //     sendData.sales_details.splice(sendData.sales_details.indexOf(item), 1);
            // });

            res.json(sendData);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
});

router.get('/area', function (req, res, next) {
    Settlement.Find.SettlementArea(req)
        .then(function (result) {

            var sendData = {
                year_maintaince: [],
                cms: [],
                account: []
            };
            console.log(result[0]);
            if (result[0] && result[0][0]['정산서']) {
                sendData = JSON.parse(result[0][0]['정산서']);
                sendData.closed = 1;
            } else if (result[0].length >= 1) {
                result[0].forEach(function (item) {
                    if (item['연유지'] === 1) {
                        sendData.year_maintaince.push(item);
                    } else if (item['청구방식'] === 1) {
                        sendData.cms.push(item);
                    } else {
                        sendData.account.push(item);
                    }
                });
            }
            // console.log(result[1], result[1][0]['메모'])
            sendData.memo = result[1].length && result[1][0]['메모'] ? result[1][0]['메모'] : ''


            res.json(sendData);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
});

router.get('/areastatic', function (req, res, next) {
    Settlement.Find.SettlementAreaStatic(req)
        .then(function (result) {
            result.forEach(function (stmt) {
                stmt['정산서'] = JSON.parse(stmt['정산서'])
                stmt['본사금액'] = stmt['정산서']['parentFee']
                stmt['지사금액'] = stmt['정산서']['areaFee']
                stmt['부가서비스'] = stmt['정산서']['extraServiceTotal'] || 0
                stmt['지사총액'] = stmt['정산서']['areaTotal'] || 0
            })
            res.json(result)
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
})

router.post('/memo', function (req, res, next) {
    Customer.Find.UniqInfo({
        query: {
            USER_ID: req.body['id']
        }
    }).then(function (result) {
        if (result.length) {
            return Customer.Update.SettleMemo(req);
        } else {
            return Customer.Insert.SettleMemo(req);
        }
    }).then(function (result) {
        res.json(result);
    }).catch(function (error) {
        res.status(500).json(error);
    });
});

router.post('/areamemo', function (req, res, next) {
    Settlement.Find.SettlementAreaMemo({
        query: {
            AREA_ID: req.body.area,
            SDATE: req.body.sDate
        }
    }).then(function (result) {
        if (result.length) {
            return Settlement.Update.SettlementAreaMemo(req);
        } else {
            return Settlement.Insert.SettlementAreaMemo(req);
        }
    }).then(function (result) {
        res.json(result);
    }).catch(function (error) {
        res.status(500).json(error);
    });
});

router.post('/saleproduct', function (req, res, next) {
    Settlement.Find.SaleProduct({
        query: {
            date: req.body.date,
            member: req.body.member,
            hospid: req.body.id
        }
    }).then(function (result) {
        if (result.length) {
            return Settlement.Update.SaleProduct(req);
        } else {
            return Settlement.Insert.SaleProduct(req);
        }
    }).then(function (result) {
        res.json(result);
    }).catch(function (error) {
        res.status(500).json(error);
    });
});

router.post('/newsale', function (req, res, next) {
    var newsale;
    if (req.body.index === 0) {
        newsale = Settlement.Insert.NewSale(req);
    } else {
        newsale = Settlement.Update.NewSale(req);
    }

    newsale.then(function (result) {
        res.json(result);
    }).catch(function (error) {
        res.status(500).json(error);
    });
});

router.delete('/newsale', function (req, res, next) {
    Settlement.Delete.NewSale(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        })
});

router.post('/close', function (req, res, next) {
    console.log(req.body)
    if (req.body.hasOwnProperty('지사코드')) {
        Settlement.Insert.CloseArea(req)
            .then(function (result) {
                res.json(result);
            })
            .catch(function (error) {
                res.status(500).json(error);
            });
    } else {
        Settlement.Insert.CloseMember(req)
            .then(function (result) {
                res.json(result);
            })
            .catch(function (error) {
                res.status(500).json(error);
            });
    }
});
router.put('/close', function (req, res, next) {
    console.log(req.body);
    if (req.body.hasOwnProperty('지사코드')) {
        Settlement.Update.ClosedAreaSettlement(req)
            .then(function (result) {
                res.json(result);
            })
            .catch(function (error) {
                console.log(error)
                res.status(500).json(error);
            });
    } else {

    }
});

router.post('/sale', function (req, res, next) {
    Settlement.Insert.Sale(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});
router.put('/sale', function (req, res, next) {
    Settlement.Update.Sale(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});
router.delete('/sale', function (req, res, next) {
    Settlement.Delete.Sale(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});
router.get('/sale', function (req, res, next) {
    Settlement.Find.Sale(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});
router.get('/salestatic', function (req, res, next) {
    Settlement.Find.SaleStatic(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            res.status(500).json(error);
        });
});








module.exports = router;
