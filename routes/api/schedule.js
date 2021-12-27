var express = require('express');
var router = express.Router();

var Customer = Server.Customer;

router.get('/', function (req, res, next) {

    Customer.Find.Visits(req)
        .then(function (visits) {
            res.json(visits);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })

});

module.exports = router;