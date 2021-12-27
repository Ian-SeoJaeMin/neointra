var CONSTS = require('./config').CONSTS;
var moment = require('moment');

var report = function (database) {
    var _database = database;
    var sQuery = '';

    var cFind = (function () {

        function GetReportDepart(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        -- 부서 리스트 조회
                        SELECT 부서, CASE 부서  WHEN 0 THEN '기타'
                                                WHEN 1 THEN '개발실'
                                                WHEN 2 THEN '영업팀'
                                                WHEN 3 THEN 'QC'
                                                WHEN 4 THEN '부가서비스'
                                                WHEN 5 THEN '총무' END AS 부서명
                        FROM ${CONSTS.DB_NEOAS}.N_업무보고
                        WHERE CONVERT(CHAR(10), 보고일자, 120) = '${params.date}'
                        AND   ISNULL(삭제, 0) = 0
                        GROUP BY 부서
                    `;
                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        })
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetReporter(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = JSON.parse(JSON.stringify(req.query));

                    if (params.area.match(/0023|0028/gim)) {
                        params.area = `'0023', '0028'`;
                    } else if (params.area.match(/0034|0046/gim)) {
                        params.area = `'0000', '0034', '0046'`;
                    } else {
                        params.area = `'${params.area}'`;
                    }

                    sQuery = `
                        -- 보고자 리스트 조회
                        SELECT R.작성자, RM.USER_NAME AS 작성자명
                        FROM ${CONSTS.DB_NEOAS}.N_업무보고 AS R
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS RM
                        ON R.작성자 = RM.USER_ID
                        WHERE CONVERT(CHAR(10), R.보고일자, 120) = '${params.date}'
                        AND   ISNULL(R.삭제, 0) = 0
                        AND   RM.USER_AREA IN (${params.area})
                        GROUP BY R.작성자, RM.USER_NAME;

                        -- 미보고자 리스트 조회
                        SELECT M.USER_ID AS ID, M.USER_NAME AS 이름
                        FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        LEFT JOIN ${CONSTS.DB_NEOAS}.N_업무보고 AS R
                        ON M.USER_ID = R.작성자
                        WHERE 1 = 1
                        AND R.작성자 NOT IN (
                            SELECT R.작성자
                            FROM ${CONSTS.DB_NEOAS}.N_업무보고 AS R
                            INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS RM
                            ON R.작성자 = RM.USER_ID
                            WHERE CONVERT(CHAR(10), R.보고일자, 120) = '${params.date}'
                            AND   ISNULL(R.삭제, 0) = 0
                            GROUP BY R.작성자, RM.USER_NAME
                        )
                        AND M.USER_AREA IN (${params.area})
                        AND ISNULL(M.USER_RETIRE, 0) = 0
                        GROUP BY M.USER_ID, M.USER_NAME
                    `;
                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordsets);
                        })
                        .catch(function (error) {
                            reject(error);
                        })
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetReportList(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = JSON.parse(JSON.stringify(req.query));
                    if (params.search && params.search.length) {
                        sQuery = `
                            SELECT T.*
                            FROM (
                                SELECT  R.인덱스, CONVERT(NVARCHAR(MAX), R.기타업무) AS 기타업무, R.작성자, RM.USER_NAME AS 작성자명,
                                        CONVERT(CHAR(10), 보고일자, 120) AS 보고일자,
                                        CONVERT(CHAR(19), 작성일자, 120) AS 작성일자,
                                        R.부서, R.부서명 AS 팀명,
                                        CASE 부서  WHEN 0 THEN '기타'
                                                    WHEN 1 THEN '개발실'
                                                    WHEN 2 THEN '영업팀'
                                                    WHEN 3 THEN 'QC'
                                                    WHEN 4 THEN '부가서비스'
                                                    WHEN 5 THEN '총무' END AS 부서명
                                FROM ${CONSTS.DB_NEOAS}.N_업무보고 AS R
                                INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS RM
                                ON R.작성자 = RM.USER_ID
                                WHERE 1 = 1
                                AND ISNULL(R.삭제, 0) = 0
                            ) AS T
                            WHERE (
                                T.기타업무 LIKE '%${params.search}%'
                                OR T.작성자명 = '${params.search}'
                            )
                            ORDER BY T.작성일자 DESC
                        `
                    } else {

                        if (params.area.match(/0023|0028/gim)) {
                            params.area = `'0023', '0028'`;
                        } else if (params.area.match(/0034|0046/gim)) {
                            params.area = `'0000', '0034', '0046'`;
                        } else {
                            params.area = `'${params.area}'`;
                        }

                        sQuery = `
                            -- 업무보고 조회
                            SELECT  R.인덱스, R.기타업무, R.작성자, RM.USER_NAME AS 작성자명,
                                    CONVERT(CHAR(10), 보고일자, 120) AS 보고일자,
                                    CONVERT(CHAR(19), 작성일자, 120) AS 작성일자,
                                    R.부서, R.부서명 AS 팀명,
                                    CASE 부서  WHEN 0 THEN '기타'
                                                WHEN 1 THEN '개발실'
                                                WHEN 2 THEN '영업팀'
                                                WHEN 3 THEN 'QC'
                                                WHEN 4 THEN '부가서비스'
                                                WHEN 5 THEN '총무' END AS 부서명
                            FROM ${CONSTS.DB_NEOAS}.N_업무보고 AS R
                            INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS RM
                            ON R.작성자 = RM.USER_ID
                            WHERE CONVERT(CHAR(10), 보고일자, 120) = '${params.date}'
                            AND ISNULL(R.삭제, 0) = 0
                            AND RM.USER_AREA IN (${params.area})
                            ORDER BY {{SORT}} 작성일자 DESC
                        `;
                    }

                    if (params.user) {
                        sQuery = sQuery.replace('{{SORT}}', 'CASE R.작성자 WHEN ' + params.user + ' THEN 1 ELSE 0 END DESC, ');
                    } else {
                        sQuery = sQuery.replace('{{SORT}}', '');
                    }

                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordset);
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
            Departments: GetReportDepart,
            Reporters: GetReporter,
            Reports: GetReportList
        };


    })();

    var cUpdate = (function () {
        function UpdateReport(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;

                    params['기타업무'] = JSON.stringify(params['기타업무']);
                    params['기타업무'] = params['기타업무'].replace(/'/gim, "''");

                    sQuery = `
                        -- 업무보고서 수정
                        UPDATE ${CONSTS.DB_NEOAS}.N_업무보고
                        SET 기타업무 = '${JSON.stringify(params['기타업무'])}',
                            작성자 = ${params['작성자']},
                            작성일자 = GETDATE(),
                            보고일자 = '${params['보고일자']}',
                            부서 = ${params['부서']},
                            부서명 = '${params['팀명']}'
                        WHERE 인덱스 = ${params['인덱스']}
                    `;

                    console.log(sQuery);
                    _database.Execute(sQuery)
                        .then(function (result) {
                            resolve(result);
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
            Report: UpdateReport
        }
    })();

    var cInsert = (function () {
        function InsertReport(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        -- 업무보고 저장
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_업무보고
                        ( 기타업무, 작성자, 작성일자, 보고일자, 부서, 부서명, 삭제 )
                        VALUES
                        ( '${params['기타업무']}', ${params['작성자']}, GETDATE(), '${params['보고일자']}', ${params['부서']}, '${params['팀명']}', 0)

                    `;

                    console.log(sQuery);
                    _database.Execute(sQuery)
                        .then(function (result) {
                            resolve(result);
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
            Report: InsertReport
        }
    })();

    var cDelete = (function () {
        function DeleteReport(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        -- 업무보고 삭제
                        UPDATE ${CONSTS.DB_NEOAS}.N_업무보고
                        SET 삭제 = 1
                        WHERE 인덱스 = ${params['인덱스']}
                    `;

                    console.log(sQuery);
                    _database.Execute(sQuery)
                        .then(function (result) {
                            resolve(result);
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
            Report: DeleteReport
        }
    })();

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    };
}

module.exports = report;
