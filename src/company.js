var CONSTS = require('./config').CONSTS;

var company = function (database) {
    var _database = database;
    var sQuery = '';
    var cFind = (function () {

        function GetSchedules(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        -- 스케줄 조회
                        Select N.NOTICE_WRITER AS 등록자, CONVERT(CHAR(19), N.NOTICE_DATE, 120) AS 시작일자, 
                            CONVERT(CHAR(19), N.NOTICE_DATE, 120) AS 종료일자, 
                            N.NOTICE_TITLE AS 제목, N.NOTICE_CONTENT AS 내용, N.NOTICE_AREA AS 지사코드,
                            ISNULL(U.USER_NAME, '-') AS 등록자명, 6 AS 구분
                        From ${CONSTS.DB_NEOCOMPANY}.NC_N_NOTICE AS N
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS U
                        On N.NOTICE_WRITER = U.USER_ID
                        Where CONVERT(CHAR(10), N.NOTICE_DATE , 120) BETWEEN '${params['start']}' AND '${params['end']}'
                        Order By N.NOTICE_DATE DESC;
        
                        Select CONVERT(CHAR(10), 시작일자, 120) AS 시작일자, CONVERT(CHAR(10), 종료일자, 120) AS 종료일자,
                                제목, 내용, 구분
                        FROM ${CONSTS.DB_NEOCOMPANY}.NT_스케줄
                        WHERE CONVERT(CHAR(10), 시작일자, 120) >= '${params['start']}'
                        AND   CONVERT(CHAR(10), 종료일자, 120) <= '${params['end']}'
                    `;

                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result.recordsets);
                        })
                        .catch(function (error) {
                            // console.log(error);
                            reject(error);
                        })

                } catch (error) {
                    console.log(error);
                    reject(error);
                }

            });

        }

        function GetAreas(req) {
            return new Promise(function (resolve, reject) {
                try {
                    sQuery = `
                        -- 지사리스트 조회
                        Select AREA_ID AS '지사코드', AREA_NAME AS '지사명',
                                AREA_PRESIDENT AS '대표', AREA_TEL AS '연락처'
                        From ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA
                        WHERE area_close_date is null
                    `;

                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result.recordsets);
                        })
                        .catch(function (error) {
                            // console.log(error);
                            reject(error);
                        })

                } catch (error) {
                    console.log(error);
                    reject(error);
                }
            })
        }

        function GetManagers(req) {
            return new Promise(function (resolve, reject) {
                try {
                    sQuery = `
                        -- 담당자 리스트 조회
                        Select U.USER_ID, U.USER_NAME, US.설정
                        From ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS U
                        Inner Join (
                            Select USER_담당자 From ${CONSTS.DB_NEOCOMPANY}.NC_H_USER
                            Where ISNULL(USER_담당자, 0) <> 0
                            Group By USER_담당자
                        ) AS M
                        On U.USER_ID = M.USER_담당자
                        Left Join ${CONSTS.DB_NEOAS}.N_사용자설정 AS US
                        On U.USER_ID = US.USER_ID
                        Where U.USER_AREA In ('0000', '0030', '0031', '0026')
                        And ISNULL(U.USER_RETIRE, 0) = 0
                        AND U.USER_ID NOT IN (17, 149, 13)
                        Order By USER_NAME
                    `;

                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result.recordsets);
                        })
                        .catch(function (error) {
                            // console.log(error);
                            reject(error);
                        })

                } catch (error) {
                    // console.log(error);
                    reject(error);
                }
            })
        }

        function GetMember(req){
            return new Promise(function(resolve, reject){
                try{
                    sQuery = `
                        -- 사원 정보 조회
                        SELECT 
                            U.USER_ID AS 인덱스, U.USER_LOGIN_ID AS 아이디, U.USER_NAME AS 이름, 
                            U.USER_AREA AS 지사코드, UA.AREA_NAME AS 소속,
                            U.USER_POSITION_ID AS 부서코드, UP.코드이름 AS 부서,
                            UI.INFO_TEL AS 전화번호, UI.INFO_HP AS 휴대폰번호
                        FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS U
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_INFO AS UI
                        ON U.USER_ID = UI.INFO_USER_ID
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS UA
                        ON U.USER_AREA = UA.AREA_ID
                        INNER JOIN (SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '부서코드') AS UP
                        ON U.USER_POSITION_ID = UP.데이터1
                        WHERE ISNULL(U.USER_RETIRE, 0) = 0
                        AND U.USER_ID = ${params['id']}
                        
                    `;
                    _database.RecordSet(sQuery)
                    .then(function(result){
                        resolve(result.recordset[0]);
                    })
                    .catch(function(error){
                        reject(error);
                    })
                }catch(error){
                    reject(error);
                }
            })
        }

        return {
            Schedules: GetSchedules,
            Areas: GetAreas,
            Managers: GetManagers,
            Member: GetMember
        }

    })();

    var cInsert = (function () {

    })();

    var cUpdate = (function () {

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

module.exports = company;

