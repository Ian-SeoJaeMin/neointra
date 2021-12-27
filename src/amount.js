var CONSTS = require('./config').CONSTS;
var moment = require('moment');

var amount = function (database) {
    var _database = database;
    var sQuery = '';

    var cFind = (function () {

        function GetOutAmountList(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        SELECT  T.ID, T.기관코드, T.기관명칭, T.지사코드, T.담당지사,
                                T.담당자, T.담당자명, T.프로그램, T.폐업,
                                T.유지보수총액,
                                T.출금 - T.입금 AS 미수금,
                                -- T.메모,
                                T.잠금, T.잠금일자, T.미수금관리, T.연유지
                        FROM (

                            SELECT H.USER_ID AS ID, H.USER_MED_ID AS 기관코드, H.USER_MED_NAME AS 기관명칭,
                                    A.AREA_NAME AS 담당지사, HI.INFO_AREA AS 지사코드,
                                    ISNULL(H.USER_담당자, 0) AS 담당자,
                                    CASE WHEN HI.INFO_AREA IN ('0000', '0026', '0030', '0031') THEN ISNULL(M.USER_NAME, '') ELSE '' END AS 담당자명,
                                    ISNULL(P.코드이름, '') AS 프로그램,
                                    ISNULL(H.USER_CLOSED, 0) AS '폐업',
                                    ( SELECT ISNULL(SUM(유지보수총액), 0) FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_유지보수 WHERE 거래처ID = H.USER_ID AND 프로그램ID <> 12 ) AS 유지보수총액,
                                    ( SELECT ISNULL(SUM(GUMAK_GUMAK), 0) FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_GUMAK WHERE DATEDIFF("n", GUMAK_DATE, '${params['date']}') >= 0 AND GUMAK_GUBUN = 1 AND GUMAK_USERID = H.USER_ID ) AS 입금,
                                    ( SELECT ISNULL(SUM(OUT_DANGA * OUT_AMT), 0) FROM ${CONSTS.DB_NEOCOMPANY}.NC_C_OUT WHERE DATEDIFF("n", OUT_DATE, '${params['date']}') >= 0 AND OUT_GUBUN = 1 AND OUT_USER = H.USER_ID ) AS 출금,
                                    --ISNULL(HS.정산메모, '') AS 메모,
                                    ISNULL(( SELECT LOCK_ID FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_EMRLOCK WHERE LOCK_ID = H.USER_ID AND LOCK_STAT = 1 GROUP BY LOCK_ID), 0) AS 잠금,
                                    ISNULL(( SELECT TOP 1 CONVERT(CHAR(10), LOCK_START, 120) FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_EMRLOCK WHERE LOCK_ID = H.USER_ID AND LOCK_STAT = 1 ORDER BY LOCK_START DESC), null) AS 잠금일자,
                                    ISNULL(HH.미수금관리, '{}') AS 미수금관리,
                                    HI.INFO_CARE AS 연유지
                            FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                            INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_INFO AS HI
                            ON H.USER_ID = HI.INFO_USER_ID
                            LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '프로그램' ) AS P
                            ON H.USER_PROGRAM = P.데이터1
                            INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A
                            ON HI.INFO_AREA = A.AREA_ID
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                            ON ISNULL(H.USER_담당자, 0) = M.USER_ID
                            -- LEFT JOIN NEOAS.DBO.N_병원특이사항 AS HS
                            -- ON H.USER_ID = HS.USER_ID
                            LEFT JOIN ${CONSTS.DB_NEOAS}.N_거래처 AS HH
                            ON H.USER_ID = HH.USER_ID
                            WHERE 1 = 1
                            {{CONDITION}}
                        ) AS T
                        WHERE T.출금 - T.입금 > 0
                    `;

                    var sWhere = '';
                    if (params.area !== '') {
                        if (params.area.match(/0000|0026|0030|0031/)) {
                            sWhere += `
                                AND HI.INFO_AREA IN ('0000', '0026', '0030', '0031')
                            `;
                        } else {
                            sWhere += `
                                AND HI.INFO_AREA = '${params.area}'
                            `;
                        }
                    }

                    if (params.manager !== '') {
                        sWhere += `
                            AND ISNULL(H.USER_담당자, 0) = ${params.manager}
                        `;
                    }

                    if (params.status !== '') {
                        sWhere += `
                            AND ISNULL(H.USER_CLOSED, 0) = ${params.status}
                        `;
                    }

                    if (params.search !== '') {
                        sWhere += `
                            AND (
                                H.USER_MED_ID LIKE '%${params.search}%'
                                OR  H.USER_MED_NAME LIKE '%${params.search}%'
                                OR  ISNULL(HS.정산메모, '')  LIKE '%${params.search}%'
                            )
                        `;
                    }

                    sQuery = sQuery.replace('{{CONDITION}}', sWhere);

                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            sQuery = null
                            sWhere = null
                            params = null
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            sQuery = null
                            sWhere = null
                            params = null
                            reject(error);
                        })
                } catch (error) {
                    sQuery = null
                    sWhere = null
                    params = null
                    reject(error);
                }
            });
        }

        function GetAmountManage(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        SELECT * FROM ${CONSTS.DB_NEOAS}.N_거래처
                        WHERE USER_ID = ${params['ID']}
                    `;

                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            sQuery = null
                            params = null
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            sQuery = null
                            params = null
                            reject(error);
                        })
                } catch (error) {
                    sQuery = null
                    params = null
                    reject(error);
                }
            });
        }

        return {
            Amounts: GetOutAmountList,
            AmountManage: GetAmountManage
        };
    })();

    var cUpdate = (function () {
        function UpdateAmountManage(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    var misu = JSON.stringify(params['미수금관리'])
                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_거래처
                        SET 미수금관리 = '${misu}'
                        WHERE USER_ID = ${params['ID']}
                    `;

                    console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            sQuery = null
                            params = null
                            misu = null
                            resolve(result);
                        })
                        .catch(function (error) {
                            sQuery = null
                            params = null
                            misu = null
                            reject(error);
                        });

                } catch (error) {
                    sQuery = null
                    params = null
                    misu = null
                    reject(error);
                }
            })
        }
        return {
            AmountManage: UpdateAmountManage
        }
    })();

    var cInsert = (function () {
        function InsertAmountManage(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    var misu = JSON.stringify(params['미수금관리'])
                    sQuery = `
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_거래처(USER_ID, 미수금관리)
                        VALUES (${params['ID']}, '${misu}')
                    `;

                    console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            sQuery = null
                            params = null
                            misu = null
                            resolve(result);
                        })
                        .catch(function (error) {
                            sQuery = null
                            params = null
                            misu = null
                            reject(error);
                        });

                } catch (error) {
                    sQuery = null
                    params = null
                    misu = null
                    reject(error);
                }
            })
        }
        return {
            AmountManage: InsertAmountManage
        }
    })();

    var cDelete = (function () {

        return {}
    })();

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    };
};

module.exports = amount;
