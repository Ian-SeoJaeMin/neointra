var CONSTS = require('./config').CONSTS;
var moment = require('moment');

var serviecEmergen = function (database) {
    var _database = database;
    var sQuery = '';

    var cFind = (function () {

        function GetEmergenServiceList(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query
                    params.date = JSON.parse(params.date)
                    sQuery = `
                        SELECT
                            서비스ID, 기관코드, 기관명칭, 접수자,
                            유형, 상태, CONVERT(CHAR(16), 접수시간, 120) AS 접수시간,
                            문의내용,
                            ISNULL(처리자, '') AS 처리자, ISNULL(M.USER_NAME, '') AS 처리자명,
                            ISNULL(CONVERT(VARCHAR(16), 처리시간, 120), '') AS 처리시간, ISNULL(처리내용, '') AS 처리내용
                        FROM ${CONSTS.DB_NEOAS}.N_업무외서비스 AS A
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON A.처리자 = M.USER_ID
                        WHERE CONVERT(CHAR(10), 접수시간, 120) BETWEEN '${params.date.start}' AND '${params.date.end}'
                        ORDER BY 접수시간 DESC
                    `
                    console.log(sQuery)
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            console.log(error);
                            reject(error);
                        })

                } catch (error) {
                    reject(error)
                }
            })
        }

        return {
            Services: GetEmergenServiceList
        };
    })();

    var cUpdate = (function () {

        function UpdateEmergenService(req) {
            return new Promise(function (resolve, reject) {
                try {

                    var params = req.body
                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_업무외서비스
                        SET 처리자 = ${params['상태'] != 0 ? params['처리자'] : 0},
                            처리내용 = '${params['상태'] != 0 ? params['처리내용'] : ''}',
                            처리시간 = ${params['상태'] != 0 ? 'GETDATE()' : 'null'},
                            상태 = ${params['상태']}
                        WHERE 서비스ID = ${params['서비스ID']}
                    `
                    console.log(sQuery);
                    _database.Execute(sQuery)
                        .then(function (result) {
                            resolve(result.recordsets);
                        })
                        .catch(function (error) {
                            reject(error);
                        })

                } catch (error) {
                    reject(error);
                }
            })
        }

        return {
            Service: UpdateEmergenService
        }
    })();

    var cInsert = (function () {

        return {

        }
    })();

    var cDelete = (function () {

        return {

        }
    })();

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    };
};

module.exports = serviecEmergen;
