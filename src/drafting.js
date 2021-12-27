var CONSTS = require('./config').CONSTS;
var moment = require('moment');

var quoteorder = function (database) {
    var _database = database;
    var sQuery = '';

    var cFind = (function () {
        // 실장님, 사장님, 총무부장님이 아니면 내꺼만 가져오게해야함

        function GetDraftings(req) {
            return new Promise(function (resolve, reject) {
                var user = req.session.user
                var date = req.query.date
                date = JSON.parse(date)
                try {
                    var isAllView = (user['인덱스'] == 13 || user['인덱스'] == 89 || user['인덱스'] == 5 || user['인덱스'] == 43)

                    sQuery = `
                        SELECT I.인덱스, I.사원ID, I.유형, I.부가세, I.퍼센트, I.공급가, I.인센티브, I.거래처ID,
                        I.상태, CONVERT(CHAR(10), I.기안일, 120) AS 기안일, CONVERT(CHAR(10), I.확인일, 120) AS 확인일,
                        CONVERT(CHAR(10), I.결재일, 120) AS 결재일,
                        CONVERT(CHAR(10), I.지급일, 120) AS 지급일,
                        I.비고,
                        M.USER_NAME,H.USER_MED_ID AS 기관코드 , H.USER_MED_NAME AS 기관명칭
                        FROM ${CONSTS.DB_NEOAS}.N_인센티브 AS I
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON I.사원ID = M.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                        ON I.거래처ID = H.USER_ID
                        WHERE ${!isAllView ? ' 사원ID = ' + user['인덱스'] : ' 1 = 1'}
                        AND CONVERT(CHAR(10), 기안일, 120) BETWEEN '${date.start}' AND '${date.end}'
                        ${isAllView ? 'AND ( 상태 = 1 OR 사원ID = ' + user['인덱스'] + ')' : ''}
                        ORDER BY I.사원ID
                    `
                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        })
                } catch (error) {
                    reject(error)
                } finally {
                    sQuery = null
                }
            })
        }


        return {
            Draftings: GetDraftings
        };
    })();

    var cUpdate = (function () {

        function UpdateDrafting(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body
                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_인센티브
                        SET 거래처ID = ${params['drafting-hospital']},
                            유형 = '${params['drafting-type']}',
                            부가세 = ${params['drafting-vat']},
                            퍼센트 = ${params['drafting-ratio']},
                            공급가 = ${params['drafting-price']},
                            인센티브 = ${params['drafting-incentive']},
                            상태 = ${params['drafting-status']},
                            기안일 = '${params['drafting-date']}',
                            비고 = '${params['drafting-bigo']}'
                        WHERE 인덱스 = ${params['drafting-index']}
                    `
                    console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result);
                            // resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error)
                }
            })
        }

        function UpdateApprovalDate(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body
                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_인센티브
                        SET ${params['drafting-key']} = ${params['drafting-date'] == 'null' ? 'null' : "'" +params['drafting-date'] + "'"}
                        WHERE 인덱스 = ${params['drafting-index']}
                    `
                    console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result);
                            // resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error)
                }
            })
        }

        return {
            Drafting: UpdateDrafting,
            ApprovalDate: UpdateApprovalDate
        }
    })();

    var cInsert = (function () {

        function InsertDrafting(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body
                    var user = req.session.user
                    console.log(params)
                    sQuery = `
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_인센티브
                        (사원ID, 거래처ID, 부가세, 퍼센트, 공급가, 인센티브, 상태, 기안일, 비고, 유형)
                        VALUES
                        (
                            ${user['인덱스']}, ${params['drafting-hospital']},
                            ${params['drafting-vat']}, ${params['drafting-ratio']},
                            ${params['drafting-price']}, ${params['drafting-incentive']},
                            ${params['drafting-status']}, '${params['drafting-date']}',
                            '${params['drafting-bigo']}', '${params['drafting-type']}'
                        )
                    `
                    console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result);
                            // resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error)
                }
            })
        }

        return {
            Drafting: InsertDrafting
        }
    })();

    var cDelete = (function () {

        function DeleteDrafting(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body

                    sQuery = `
                        DELETE FROM ${CONSTS.DB_NEOAS}.N_인센티브
                        WHERE 인덱스 = ${params['drafting-index']}
                    `
                    console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result);
                            // resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error)
                }
            })
        }

        function DeleteApprovalDate(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body

                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_인센티브
                        SET ${approval-key} = NULL
                        WHERE 인덱스 = ${params['drafting-index']}
                    `
                    console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result);
                            // resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error)
                }
            })
        }

        return {
            Drafting: DeleteDrafting,
            ApprovalDate: DeleteApprovalDate
        }
    })();

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    };
};

module.exports = quoteorder;
