var express = require('express');
var router = express.Router();

// var server = require('../../src/index');
var Report = Server.Report;
var Customer = Server.Customer;
var Service = Server.Service;

router.get('/', function (req, res, next) {
    var report = {
        depart: null,
        reporter: null,
        reports: null,
        visit: null,
        call: null,
        service: null
    };
    Report.Find.Departments(req)
        .then(function (departs) {
            report.depart = departs;
            return Report.Find.Reporters(req);
        })
        .then(function (reporters) {
            report.reporter = reporters;
            return Report.Find.Reports(req);
        })
        .then(function (reports) {
            report.reports = reports;
            return Customer.Find.Visits({
                query: {
                    date: {
                        date: req.query.date
                    }
                }
            })
        })
        .then(function (visits) {
            report.visit = visits;
            return Customer.Find.Calls({
                query: {
                    date: {
                        date: req.query.date
                    }
                }
            })
        })
        .then(function (calls) {

            calls.forEach(function (element) {
                if (element['내용'].length > 0 && (element['문의내용'].length === 0 && element['처리내용'].length === 0)) {
                    var comment = ParseCommentToPart(element['내용']);
                    element['문의내용'] = comment[1];
                    element['처리내용'] = comment[2];
                    element['기타'] = comment[3];
                }
            });

            report.call = calls;
            return Service.Find.Report(req);
            // res.json(report);
        })
        .then(function (services) {
            report.service = services;
            res.json(report);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })

    function ParseCommentToPart(comment) {
        var QUESTION = 'Q. 문의내용';
        var TREAT = 'A. 처리내용';
        var ETC = 'E.기타';
        var txtCmnt, _txtCmnt

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

router.post('/', function (req, res, next) {
    Report.Insert.Report(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
});

router.put('/', function (req, res, next) {
    Report.Update.Report(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
});

router.delete('/', function (req, res, next) {
    Report.Delete.Report(req)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (error) {
            console.log(error);
            res.status(500).json(error);
        })
});


module.exports = router;