var express = require('express');
var router = express.Router();

// var server = require('../../src/index');
var QuoteOrder = Server.QuoteOrder;
router.get('/packages', function (req, res) {
    QuoteOrder.Find.Packages(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
})
router.get('/products', function (req, res) {
    QuoteOrder.Find.Products(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
});

router.get('/subjects', function (req, res) {
    QuoteOrder.Find.ProductSubjects(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
})

router.get('/models', function (req, res) {
    QuoteOrder.Find.ProductModels(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        });
})

router.post('/products', function (req, res) {
    QuoteOrder.Insert.Product(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.put('/products', function (req, res) {
    QuoteOrder.Update.Product(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.delete('/products', function (req, res) {
    QuoteOrder.Delete.Product(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
})

router.post('/order', function (req, res) {
    QuoteOrder.Insert.Order(req)
        .then(function (result) {
            req.body['order-id'] = result['견적서ID']
            return QuoteOrder.Insert.OrderProducts(req)
        })
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})
router.get('/order', function (req, res) {
    QuoteOrder.Find.Order(req)
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})
router.delete('/order', function (req, res) {
    QuoteOrder.Delete.Order(req)
        .then(function (result) {
            return QuoteOrder.Delete.OrderProducts(req)
        })
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})
router.put('/order', function (req, res) {
    QuoteOrder.Update.Order(req)
        .then(function (result) {
            return QuoteOrder.Delete.OrderProducts(req)
        })
        .then(function (result) {
            return QuoteOrder.Insert.OrderProducts(req)
        })
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})
module.exports = router;
