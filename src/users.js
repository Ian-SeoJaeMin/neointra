var CONSTS = require('./config').CONSTS;

var users = function (database) {
    var _database = database;
    var sQuery = '';

    var cFind = (function () {

        function GetUser(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;

                    sQuery = `
                                Select U.USER_ID AS 인덱스, U.USER_LOGIN_ID AS 아이디, U.USER_PW AS 비밀번호,
                                        U.USER_NAME AS 이름, A.AREA_ID AS 지사코드, A.AREA_NAME AS 소속,
                                        P.코드이름 AS 부서, I.INFO_TEL AS 전화번호, I.INFO_HP AS 휴대폰번호,
                                        ISNULL(U.USER_RETIRE, 0) AS 상태, ISNULL(S.설정, '') AS 설정
                                From ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS U
                                Inner Join ${CONSTS.DB_NEOCOMPANY}.NC_N_INFO AS I
                                On U.USER_ID = I.INFO_USER_ID
                                Inner Join (Select 코드이름, 데이터1 From ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE Where 코드구분 = '부서코드') AS P
                                On P.데이터1 = U.USER_POSITION_ID
                                Inner Join ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A
                                On A.AREA_ID = U.USER_AREA
                                LEFT JOIN ${CONSTS.DB_NEOAS}.N_사용자설정 AS S
                                On S.USER_ID = U.USER_ID
                                Where U.USER_LOGIN_ID = '${params['username']}'
                                And   U.USER_PW = '${params['password']}'
                            `;

                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordset[0]);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetUsers(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    var sWhere = '';
                    sQuery = `
                        SELECT 
                            U.USER_ID AS 인덱스, U.USER_LOGIN_ID AS 아이디, U.USER_NAME AS 이름, U.USER_PW AS 비밀번호,
                            U.USER_AREA AS 지사코드, UA.AREA_NAME AS 소속,
                            U.USER_POSITION_ID AS 부서코드, UP.코드이름 AS 부서,
                            UI.INFO_TEL AS 전화번호, UI.INFO_HP AS 휴대폰번호, ISNULL(S.설정, '') AS 설정
                        FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS U
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_INFO AS UI
                        ON U.USER_ID = UI.INFO_USER_ID
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS UA
                        ON U.USER_AREA = UA.AREA_ID
                        INNER JOIN (SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '부서코드') AS UP
                        ON U.USER_POSITION_ID = UP.데이터1
                        LEFT JOIN ${CONSTS.DB_NEOAS}.N_사용자설정 AS S
                        On S.USER_ID = U.USER_ID
                        WHERE ISNULL(U.USER_RETIRE, 0) = 0
                        {{OPTIONS}}
                        ORDER BY U.USER_AREA, UP.데이터1, U.USER_NAME
                    `;

                    if (params.hasOwnProperty('search')) {
                        sWhere += `
                            AND (
                                    U.USER_LOGIN_ID LIKE '%${params['search']}%'
                                OR  U.USER_NAME LIKE '%${params['search']}%'
                            )
                        `
                    }

                    sQuery = sQuery.replace('{{OPTIONS}}', sWhere);

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
            Users: GetUsers,
            User: GetUser
        }

    })();

    var cUpdate = (function () {

    })();

    var cInsert = (function () {

    })();

    var cDelete = (function () {

    })();

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    };
}

module.exports = users;

