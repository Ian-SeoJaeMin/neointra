var CONSTS = require('./config').CONSTS
var database = require('./database')
var users = require('./users')
var customer = require('./customer')
var company = require('./company')
var service = require('./service')
var static = require('./static')
var project = require('./project')
var report = require('./report')
var board = require('./board')
var reply = require('./reply')
var amount = require('./amount')
var settlement = require('./settlement')
var finder = require('./finder')
var quoteorder = require('./quoteorder')
var serviceEmergen = require('./serviceEmergen.js')
var serviceData = require('./serviceData.js')
var drafting = require('./drafting')

var FileManager = require('./filemanager')
var Kakao = require('./kakao')

var Server = (function () {
    // database.company.fn.Connect();
    // database.ocs.fn.Connect();

    var nSocket = require('./socket')
    var neoSocket
    // var neoSocket = new nSocket(global.io);

    function Setting() {
        return new Promise(function (resolve, reject) {
            try {
                var sQuery = ''
                sQuery = `
                    -- 설정 조회
                    SELECT 설정 FROM ${CONSTS.DB_NEOAS}.N_설정
                `
                database
                    .RecordSet(sQuery)
                    .then(function (result) {
                        resolve(result.recordset)
                    })
                    .catch(function (error) {
                        reject(error)
                    })
            } catch (error) {
                reject(error)
            }
        })
    }

    function SaveSetting(req) {
        return new Promise(function (resolve, reject) {
            try {
                var params = req.body
                sQuery = `
                    -- 설정 저장
                    TRUNCATE TABLE ${CONSTS.DB_NEOAS}.N_설정;
                    INSERT INTO ${CONSTS.DB_NEOAS}.N_설정
                    VALUES ('${JSON.stringify(params['setting'])}')
                `
                database
                    .Execute(sQuery)
                    .then(function (result) {
                        resolve()
                    })
                    .catch(function (error) {
                        reject(error)
                    })
            } catch (error) {
                reject(error)
            }
        })
    }

    function SaveUserSetting(req) {
        return new Promise(function (resolve, reject) {
            try {
                var params = req.body
                sQuery = `
                    -- 사용자 설정 저장
                    IF EXISTS ( SELECT USER_ID FROM ${CONSTS.DB_NEOAS
                    }.N_사용자설정 WHERE USER_ID = ${params['인덱스']})
                        BEGIN
                            DELETE FROM ${CONSTS.DB_NEOAS
                    }.N_사용자설정 WHERE USER_ID = ${params['인덱스']}
                        END

                    INSERT INTO ${CONSTS.DB_NEOAS}.N_사용자설정(USER_ID, 설정)
                    VALUES(${params['인덱스']}, '${params['설정']}')
                `
                database
                    .Execute(sQuery)
                    .then(function (result) {
                        resolve()
                    })
                    .catch(function (error) {
                        reject(error)
                    })
            } catch (error) {
                reject(error)
            }
        })
    }

    return {
        Users: users(database),
        Customer: customer(database),
        Company: company(database),
        Service: service(database, FileManager),
        Static: static(database),
        Project: project(database, FileManager),
        Report: report(database),
        Board: board(database),
        Reply: reply(database),
        Amount: amount(database),
        Settlement: settlement(database),
        Finder: finder(database, FileManager),
        QuoteOrder: quoteorder(database),
        ServiceEmergen: serviceEmergen(database),
        ServiceData: serviceData(database),
        Drafting: drafting(database),
        FileManager: FileManager,
        Kakao: new Kakao(database),
        NeoSocket: neoSocket,
        fn: {
            Setting: Setting,
            SaveSetting: SaveSetting,
            SaveUserSetting: SaveUserSetting,
            LoadSocket: function () {
                neoSocket = new nSocket(database, global.io)
            }
        }
    }
})()

module.exports = Server
