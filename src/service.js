var CONSTS = require('./config').CONSTS;
var fs = require('fs');
var path = require('path');
var SERVICE_STATUS = CONSTS.SERVICE_STATUS;

var service = function (database, fm) {

    var _database = database;
    var sQuery = '';

    var cFind = (function () {

        function GetServiceList(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var select = '',
                        where = '',
                        sort = '',
                        params = req.query,
                        user = req.session.user;

                    if (!user) {
                        params = null
                        throw new Error('session expired');
                    } else {

                        var date = params.date ? JSON.parse(params.date) : {
                            start: moment().subtract(30, 'day').format('YYYY-MM-DD'),
                            end: moment().format('YYYY-MM-DD')
                        }

                        var dateRange = `CONVERT(VARCHAR(10), N.접수일자, 120) BETWEEN '${date.start}' AND '${date.end}'`

                        // var area = user['지사코드'].trim() === '0000' || user['지사코드'].trim() === '0030' ? "'0000', '0030', '0031', '0026', '0034', '0023'" : "'" + user['지사코드'].trim() + "'";
                        //var area = user['지사코드'].trim() === '0000' || user['지사코드'].trim() === '0030' ? "'0000', '0030', '0031', '0026', '0034', '0045'" : "'" + user['지사코드'].trim() + "'";
                        var area = user['지사코드'].trim() === '0000' || user['지사코드'].trim() === '0030' ? "'0000', '0030', '0031', '0026', '0034', '0045', '0046'" : "'" + user['지사코드'].trim() + "'";
                        // area = user['지사코드'].trim() === '0028' ? "'0028', '0042', '0003', '0023'" : area; // 최종용 + 충청 + 경기남부 + 강동 - 최종용
                        // area = user['지사코드'].trim() === '0023' ? "'0023', '0043'" : area; // 강동 + 충청 + 최종용 - 강동
                        area = user['지사코드'].trim().match(/0023|0028/gim) ? "'0003','0023','0028','0042','0043'" : area; //강동과 경기동부 AS 공유
                        area = user['지사코드'].trim() === '0025' ? "'0025', '0045', '0036'" : area; // 서울서부 + 서울서부2

                        // if (moment().format('dddd') === '토요일') {
                            if (user['지사코드'].trim().match(/0000|0030|0034|0046/)) {
                                //area = "'0000', '0030', '0031', '0026', '0034', '0023', '0043'" // 충청-강동 추가 (0043)
                                //area = "'0000', '0030', '0031', '0026', '0034', '0045'" // 강동, 충청-강동 제외
                                area = "'0000', '0030', '0031', '0026', '0034', '0045', '0046'" // 김찬희(0046) 지사 추가
                            }
                        // } 


                        sQuery = `
                            -- AS 리스트 조회
                            SELECT T.*
                            FROM (
                                Select N.인덱스, N.기관코드,
                                    CASE WHEN ISNULL(N.기관명칭, '') = '' THEN H.USER_MED_NAME ELSE N.기관명칭 END AS 기관명칭,
                                    ISNULL(H.USER_담당자, 0) AS 담당자, ISNULL(M.USER_NAME, '') AS 담당자명, ISNULL(H.USER_ID, 0) AS USER_ID,
                                    N.지사코드, A.AREA_NAME AS 지사,
                                    --ISNULL(HI.INFO_CONTRACT_DATE, '') AS 계약일,
                                    ISNULL(SS.실가동일, '') AS 계약일,
                                    CASE WHEN ISNULL(H.USER_PROGRAM, 0) = 0 THEN N.프로그램 ELSE H.USER_PROGRAM END AS 프로그램, N.상태, N.접수자, N.연락처, CONVERT(CHAR(19), N.접수일자, 120) AS 접수일자,
                                    ISNULL(N.타입, 1) AS 타입, ISNULL(U.병원유형, 1) AS 병원유형, ISNULL(N.컨버전, 0) AS 컨버전,
                                    ISNULL(N.실행파일, '') AS 실행파일, ISNULL(N.응급, 0) AS 응급, ISNULL(N.본사, 1) AS 본사,
                                    N.확인자, ISNULL(C.USER_NAME, '') AS 확인자명, CONVERT(CHAR(19), N.확인일자, 120) AS 확인일자,
                                    N.공유자, ISNULL(S.USER_NAME, '') AS 공유자명, CONVERT(CHAR(19), N.공유일자, 120) AS 공유일자,
                                    N.처리자, ISNULL(P.USER_NAME, '') AS 처리자명, CONVERT(CHAR(19), N.처리일자, 120) AS 처리일자,
                                    N.보류자, ISNULL(HD.USER_NAME, '') AS 보류자명, CONVERT(CHAR(19), N.보류일자, 120) AS 보류일자,
                                    N.완료자, ISNULL(D.USER_NAME, '') AS 완료자명, CONVERT(CHAR(19), N.완료일자, 120) AS 완료일자,
                                    N.피드백자, ISNULL(D.USER_NAME, '') AS 피드백자명, CONVERT(CHAR(19), N.피드백일자, 120) AS 피드백일자,
                                    ISNULL(CONVERT(VARCHAR(10), N.처리예정일, 120), '') AS 처리예정일,
                                    ISNULL(N.만족도, 0) AS 만족도,
                                    ISNULL(N.전달자, 0) AS 전달자, ISNULL(PS.USER_NAME, '') AS 전달자명, CONVERT(CHAR(19), N.전달일자, 120) AS 전달일자,
                                    ISNULL(SD.파일전달, 0) AS 파일전달,
                                    ISNULL(SD.업데이트버전, '') AS 버전,
                                    CASE WHEN LEN(ISNULL(N.개발로그, '')) > 0 THEN 1 ELSE 0 END 개발로그,
                                    ISNULL(
                                        (
                                            SELECT COUNT(인덱스)
                                            FROM ${CONSTS.DB_NEOAS}.N_서비스리플
                                            WHERE 서비스키 = N.인덱스
                                            AND ISNULL(구분, 0) = 0), 0
                                    ) AS 리플수,
                                    '0' + CONVERT(VARCHAR(1000), ROW_NUMBER() OVER( ORDER BY N.접수일자 DESC)) AS desc정렬
                                FROM ${CONSTS.DB_NEOAS}.N_서비스 AS N WITH(NOLOCK)
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H WITH(NOLOCK)
                                ON H.USER_MED_ID = N.기관코드
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_INFO AS HI WITH(NOLOCK)
                                ON H.USER_ID = HI.INFO_USER_ID
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A WITH(NOLOCK)
                                ON A.AREA_ID = N.지사코드
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M WITH(NOLOCK)
                                ON M.USER_ID = ISNULL(N.담당자, 0)
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS S WITH(NOLOCK)    -- 공유
                                ON S.USER_ID = ISNULL(N.공유자, 0)
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS P WITH(NOLOCK)    -- 처리
                                ON P.USER_ID = ISNULL(N.처리자, 0)
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS HD WITH(NOLOCK)   -- 보류
                                ON HD.USER_ID = ISNULL(N.보류자, 0)
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS D WITH(NOLOCK)    -- 완료
                                ON D.USER_ID = ISNULL(N.완료자, 0)
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS PS WITH(NOLOCK)    -- 전달
                                
                                ON PS.USER_ID = ISNULL(N.전달자, 0)
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS F WITH(NOLOCK)    -- 피드백
                                ON F.USER_ID = ISNULL(N.피드백자, 0)
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS C WITH(NOLOCK)    -- 확인
                                ON C.USER_ID = ISNULL(N.확인자, 0)
                                LEFT JOIN ${CONSTS.DB_NEOAS}.N_병원특이사항 AS U WITH(NOLOCK)
                                ON U.기관코드 = N.기관코드
                                LEFT JOIN ${CONSTS.DB_OCS}.SS_기관정보 AS SS WITH(NOLOCK)
                                ON SS.요양기관코드 = N.기관코드
                                LEFT JOIN ${CONSTS.DB_NEOAS}.N_서비스DEV AS SD WITH(NOLOCK)
                                ON N.인덱스 = SD.서비스ID
                                WHERE 1 = 1
                                AND   N.상태 = ${params.status}
                                {{CONDITION}}
                            ) AS T
                            {{SORT}};

                            SELECT
                                {{SELECT}}
                            FROM ${CONSTS.DB_NEOAS}.N_서비스 AS N
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H WITH(NOLOCK)
                            ON H.USER_MED_ID = N.기관코드
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M WITH(NOLOCK)
                            ON M.USER_ID = ISNULL(N.담당자, 0)
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS S WITH(NOLOCK)    -- 공유
                            ON S.USER_ID = ISNULL(N.공유자, 0)
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS P WITH(NOLOCK)    -- 처리
                            ON P.USER_ID = ISNULL(N.처리자, 0)
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS HD WITH(NOLOCK)   -- 보류
                            ON HD.USER_ID = ISNULL(N.보류자, 0)
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS D WITH(NOLOCK)    -- 완료
                            ON D.USER_ID = ISNULL(N.완료자, 0)
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS F WITH(NOLOCK)    -- 피드백
                            ON F.USER_ID = ISNULL(N.피드백자, 0)
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS C WITH(NOLOCK)    -- 확인
                            ON C.USER_ID = ISNULL(N.확인자, 0)
                            WHERE 1 = 1
                            {{CONDITION2}}
                        `;
                        params.group = parseInt(params.group)
                        if (params.group === 0) {
                            select = `
                                SUM(CASE WHEN N.상태 = 0 AND N.지사코드 IN (${area}) AND ${dateRange} THEN 1 ELSE 0 END) AS '0',
                                SUM(CASE WHEN N.상태 = 1 AND ${dateRange} THEN 1 ELSE 0 END) AS '1',
                                SUM(CASE WHEN N.상태 = 1 AND ISNULL(N.응급, 0) = 1 AND ${dateRange} THEN 1 ELSE 0 END) AS '응급',
                                SUM(CASE WHEN N.상태 = 2 AND (ISNULL(N.처리자, 0) = ${user['인덱스']} OR ISNULL(N.공유자, 0) = ${user['인덱스']}) THEN 1 ELSE 0 END) AS '2',
                                SUM(CASE WHEN N.상태 = 4 AND (ISNULL(N.완료자, 0) = ${user['인덱스']} OR ISNULL(N.공유자, 0) = ${user['인덱스']}) AND ${dateRange} THEN 1 ELSE 0 END) AS '4',
                                SUM(CASE WHEN N.상태 = 3 AND N.지사코드 IN (${area}) AND ${dateRange} THEN 1 ELSE 0 END) AS '3',
                                SUM(CASE WHEN N.상태 = 5 AND N.지사코드 IN (${area}) AND ${dateRange} THEN 1 ELSE 0 END) AS '5',
                                SUM(CASE WHEN N.상태 = 6 AND (ISNULL(N.완료자, 0) = ${user['인덱스']} OR ISNULL(N.공유자, 0) = ${user['인덱스']} OR ISNULL(N.피드백자, 0) = ${user['인덱스']}) AND ${dateRange} THEN 1 ELSE 0 END) AS '6',
                                SUM(CASE WHEN N.상태 = 7 AND N.지사코드 IN (${area}) AND ${dateRange} THEN 1 ELSE 0 END) AS '7'
                            `;
                        } else if (params.group === 1) {
                            select = `
                                SUM(CASE WHEN N.상태 = 0 AND N.지사코드 IN (${area}) AND ${dateRange} THEN 1 ELSE 0 END) AS '0',
                                SUM(CASE WHEN N.상태 = 1 AND ${dateRange} THEN 1 ELSE 0 END) AS '1',
                                SUM(CASE WHEN N.상태 = 1 AND ISNULL(N.응급, 0) = 1 AND ${dateRange} THEN 1 ELSE 0 END) AS '응급',
                                SUM(CASE WHEN N.상태 = 2 AND N.지사코드 IN (${area}) THEN 1 ELSE 0 END) AS '2',
                                SUM(CASE WHEN N.상태 = 4 AND N.지사코드 IN (${area}) AND ${dateRange} THEN 1 ELSE 0 END) AS '4',
                                SUM(CASE WHEN N.상태 = 3 AND N.지사코드 IN (${area}) AND ${dateRange} THEN 1 ELSE 0 END) AS '3',
                                SUM(CASE WHEN N.상태 = 5 AND N.지사코드 IN (${area}) AND ${dateRange} THEN 1 ELSE 0 END) AS '5',
                                SUM(CASE WHEN N.상태 = 6 AND N.지사코드 IN (${area}) AND ${dateRange} THEN 1 ELSE 0 END) AS '6',
                                SUM(CASE WHEN N.상태 = 7 AND N.지사코드 IN (${area}) AND ${dateRange} THEN 1 ELSE 0 END) AS '7'
                            `;
                        } else if (params.group === 2) {
                            select = `
                                SUM(CASE WHEN N.상태 = 0 AND N.지사코드 IN (${area}) AND ${dateRange} THEN 1 ELSE 0 END) AS '0',
                                SUM(CASE WHEN N.상태 = 1 AND  ISNULL(N.공유자, 0) = ${user['인덱스']} AND ${dateRange} THEN 1 ELSE 0 END) AS '1',
                                SUM(CASE WHEN N.상태 = 1 AND ISNULL(N.공유자, 0) = ${user['인덱스']} AND ISNULL(N.응급, 0) = 1 AND ${dateRange} THEN 1 ELSE 0 END) AS '응급',
                                SUM(CASE WHEN N.상태 = 2 AND (ISNULL(N.처리자, 0) = ${user['인덱스']} OR ISNULL(N.공유자, 0) = ${user['인덱스']}) THEN 1 ELSE 0 END) AS '2',
                                SUM(CASE WHEN N.상태 = 4 AND (ISNULL(N.완료자, 0) = ${user['인덱스']} OR ISNULL(N.공유자, 0) = ${user['인덱스']}) AND ${dateRange} THEN 1 ELSE 0 END) AS '4',
                                SUM(CASE WHEN N.상태 = 3 AND (ISNULL(N.처리자, 0) = ${user['인덱스']} OR ISNULL(N.공유자, 0) = ${user['인덱스']} OR ISNULL(N.보류자, 0) = ${user['인덱스']}) AND ${dateRange} THEN 1 ELSE 0 END) AS '3',
                                SUM(CASE WHEN N.상태 = 5 AND N.지사코드 IN (${area}) AND ${dateRange} THEN 1 ELSE 0 END) AS '5',
                                SUM(CASE WHEN N.상태 = 6 AND (ISNULL(N.완료자, 0) = ${user['인덱스']} OR ISNULL(N.공유자, 0) = ${user['인덱스']} OR ISNULL(N.피드백자, 0) = ${user['인덱스']}) AND ${dateRange} THEN 1 ELSE 0 END) AS '6',
                                SUM(CASE WHEN N.상태 = 7 AND N.지사코드 IN (${area}) AND ${dateRange} THEN 1 ELSE 0 END) AS '7'
                            `;
                        }
                        sQuery = sQuery.replace('{{SELECT}}', select);

                        if (params.hospnum) {
                            where += " AND N.기관코드 = '" + params.hospnum + "' "
                        }

                        if (params.program > 0) {
                            where += ' AND N.프로그램 = ' + params.program;
                        }
                        if (params.exe !== '') {
                            where += " AND N.실행파일 = '" + params.exe + "' ";
                        }

                        if (params.menu !== '') {
                            where += " AND N.실행메뉴 = '" + params.menu + "' ";
                        }
                        if (params.button !== '') {
                            where += " AND N.세부화면 = '" + params.button + "' ";
                        }

                        if (params.type > 0) {
                            where += ' AND ISNULL(N.타입, 1) = ' + params.type;
                        }
                        if (params.search !== '') {
                            where += `
                                AND (
                                    CONTAINS((N.문의내용, N.확인내용, N.처리내용), '"${params.search}*"')
                                    OR N.기관코드 LIKE '%${params.search}%'
                                    OR ISNULL(N.기관명칭, H.USER_MED_NAME) LIKE '%${params.search}%'
                                    OR N.접수자 LIKE '%${params.search}%'
                                    OR ISNULL(M.USER_NAME, '') LIKE '%${params.search}%'
                                    OR ISNULL(S.USER_NAME, '') LIKE '%${params.search}%'
                                    OR ISNULL(P.USER_NAME, '') LIKE '%${params.search}%'
                                    OR ISNULL(D.USER_NAME, '') LIKE '%${params.search}%'
                                    OR ISNULL(HD.USER_NAME, '') LIKE '%${params.search}%'
                                    OR ISNULL(F.USER_NAME, '') LIKE '%${params.search}%'
                                    OR CONVERT(VARCHAR, N.인덱스) = '${params.search}'
                                )
                            `;
                        }

                        sQuery = sQuery.replace('{{CONDITION2}}', where);

                        if (params.search == '') {
                            if (parseInt(params.status) !== SERVICE_STATUS.PROCESS) {
                                where += ' AND ' + dateRange
                            }
                        }

                        switch (parseInt(params.status)) {
                            case SERVICE_STATUS.ACCEPT:
                                where += ' AND N.지사코드 IN (' + area + ') ';
                                // sort += ' ORDER BY 접수일자 DESC ';
                                sort += `
                                    ORDER BY
                                        CONVERT(VARCHAR(10), T.접수일자, 120) DESC,
                                        CASE WHEN CONVERT(VARCHAR(10), T.접수일자, 120) = CONVERT(VARCHAR(10), GETDATE(), 120) THEN RIGHT('0000' + CONVERT(NVARCHAR, T.DESC정렬), 4) ELSE T.접수일자 END DESC
                                `;
                                break;
                            case SERVICE_STATUS.CONFIRM:
                                where += ' AND N.지사코드 IN (' + area + ') ';
                                // sort += ' ORDER BY 접수일자 DESC ';
                                sort += `
                                        ORDER BY
                                            CONVERT(VARCHAR(10), T.접수일자, 120) DESC,
                                            CASE WHEN CONVERT(VARCHAR(10), T.접수일자, 120) = CONVERT(VARCHAR(10), GETDATE(), 120) THEN RIGHT('0000' + CONVERT(NVARCHAR, T.DESC정렬), 4) ELSE T.접수일자 END DESC
                                    `;
                                break;
                            case SERVICE_STATUS.SHARE:
                                if (params.group === 2) {
                                    where += ' AND ISNULL(N.공유자, 0) = ' + user['인덱스']
                                }
                                // sort += ' ORDER BY ISNULL(T.응급, 0) DESC, CASE ISNULL(T.공유자, 0) WHEN ' + user['인덱스'] + ' THEN 0 ELSE 1 END ASC, CASE T.지사코드 WHEN ' + user['지사코드'] + ' THEN 0 ELSE 1 END ASC, T.공유일자 ASC ';
                                sort += ' ORDER BY ISNULL(T.응급, 0) DESC, CASE ISNULL(T.공유자, 0) WHEN ' + user['인덱스'] + ' THEN 0 ELSE 1 END ASC, T.공유일자 ASC ';
                                break;
                            case SERVICE_STATUS.PROCESS:
                                if (params.group === 0 || params.group === 2) {
                                    where += `
                                        AND (ISNULL(N.처리자, 0) = ${user['인덱스']} OR ISNULL(N.공유자, 0) = ${user['인덱스']})
                                    `;
                                } else {
                                    where += ' AND N.지사코드 IN (' + area + ') ';
                                }
                                sort = ' ORDER BY CASE ISNULL(T.처리자, 0) WHEN ' + user['인덱스'] + ' THEN 0 ELSE 1 END ASC, T.처리일자 DESC ';
                                break;
                            case SERVICE_STATUS.HOLD:
                                if (params.group === 0 || params.group === 1) {
                                    where += ' AND ( N.지사코드 IN (' + area + ') OR N.보류자 = ' + user['인덱스'] + ') ';
                                } else if (params.group === 2) {
                                    where += ` AND (ISNULL(N.처리자, 0) = ${user['인덱스']} OR ISNULL(N.공유자, 0) = ${user['인덱스']} OR ISNULL(N.보류자, 0) = ${user['인덱스']}) `;
                                }
                                sort = ' ORDER BY CASE ISNULL(T.보류자, 0) WHEN ' + user['인덱스'] + ' THEN 0 ELSE 1 END ASC, T.보류일자 DESC ';
                                break;
                            case SERVICE_STATUS.DONE:
                                if (params.group === 0 || params.group === 2) {
                                    where += `
                                        AND (ISNULL(N.완료자, 0) = ${user['인덱스']} OR ISNULL(N.공유자, 0) = ${user['인덱스']})
                                    `;
                                } else {
                                    where += ' AND N.지사코드 IN (' + area + ') ';
                                }
                                // sort = ' ORDER BY CASE ISNULL(T.완료자, 0) WHEN ' + user['인덱스'] + ' THEN 0 ELSE 1 END ASC, T.완료일자 DESC ';
                                sort = 'ORDER BY T.완료일자 DESC';
                                break;
                            case SERVICE_STATUS.FEEDBACK:
                                if (params.group === 0 || params.group === 2) {
                                    where += `
                                        AND (ISNULL(N.완료자, 0) = ${user['인덱스']} OR ISNULL(N.공유자, 0) = ${user['인덱스']} OR ISNULL(N.피드백자, 0) = ${user['인덱스']})
                                    `;
                                } else {
                                    where += ' AND N.지사코드 IN (' + area + ') ';
                                }
                                break;
                            default:
                                break;
                        }

                        sQuery = sQuery.replace('{{CONDITION}}', where).replace('{{SORT}}', sort);
                        console.log(sQuery);
                        _database.RecordSet(sQuery)
                            .then(function (result) {
                                sQuery = null
                                select = null
                                where = null
                                sort = null
                                params = null
                                // user = null
                                resolve(result.recordsets);
                            })
                            .catch(function (error) {
                                sQuery = null
                                select = null
                                where = null
                                sort = null
                                params = null
                                console.log(error);
                                reject(error);
                            })

                    }
                } catch (error) {
                    console.log(error);
                    reject(error);
                }
            });
        }

        function GetServiceDetail(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;

                    if (params.key) {
                        sQuery = `
                            -- AS 상세정보 조회
                            Select
                                N.공유자, ISNULL(S.USER_NAME, '') AS 공유자명,
                                N.보류자, ISNULL(HD.USER_NAME, '') AS 보류자명,
                                N.처리자, ISNULL(P.USER_NAME, '') AS 처리자명,
                                N.완료자, ISNULL(D.USER_NAME, '') AS 완료자명,
                                N.피드백자, ISNULL(F.USER_NAME, '') AS 피드백자명
                            From ${CONSTS.DB_NEOAS}.N_서비스 AS N
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS S --공유
                            On ISNULL(N.공유자,0) = S.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS P --처리
                            On ISNULL(N.처리자,0) = P.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS D --완료
                            On ISNULL(N.완료자,0) = D.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS HD --보류
                            On ISNULL(N.보류자,0) = HD.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS F --피드백
                            On ISNULL(N.피드백자,0) = F.USER_ID
                            Where N.인덱스 = ${params.key};

                            Select R.작성자, MR.USER_NAME AS 작성자명
                            From ${CONSTS.DB_NEOAS}.N_서비스리플 AS R
                            INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS MR
                            ON R.작성자 = MR.USER_ID
                            Where 서비스키 = ${params.key}
                            Group By 작성자, MR.USER_NAME
                        `;
                    } else {
                        sQuery = `
                            -- AS 상세정보 조회
                            Select
                                N.인덱스, ISNULL(N.실행파일, '') AS 실행파일, ISNULL(N.응급, 0) AS 응급, ISNULL(N.본사, 0) AS 본사,
                                N.접수자, N.연락처, Convert(char(19), N.접수일자 , 120) AS 접수일자, CASE WHEN ISNULL(H.USER_PROGRAM, 0) = 0 THEN N.프로그램 ELSE H.USER_PROGRAM END AS 프로그램,
                                ISNULL(N.확인자, 0) AS 확인자, Convert(char(19), N.확인일자 , 120) AS 확인일자, ISNULL(C.USER_NAME, '') AS 확인자명,
                                ISNULL(N.공유자, 0) AS 공유자, Convert(char(19), N.공유일자 , 120) AS 공유일자, ISNULL(S.USER_NAME, '') AS 공유자명,
                                ISNULL(N.보류자, 0) AS 보류자, Convert(char(19), N.보류일자 , 120) AS 보류일자, ISNULL(HD.USER_NAME, '') AS 보류자명,
                                ISNULL(N.처리자, 0) AS 처리자, Convert(char(19), N.처리일자 , 120) AS 처리일자, ISNULL(P.USER_NAME, '') AS 처리자명,
                                ISNULL(N.완료자, 0) AS 완료자, Convert(char(19), N.완료일자 , 120) AS 완료일자, ISNULL(D.USER_NAME, '') AS 완료자명,
                                ISNULL(N.피드백자, 0) AS 피드백자, Convert(char(19), N.피드백일자 , 120) AS 피드백일자, ISNULL(F.USER_NAME, '') AS 피드백자명,
                                N.문의내용, ISNULL(N.확인내용, '') AS 확인내용, ISNULL(N.처리내용, '') AS 처리내용, ISNULL(N.보류내용, '') AS 보류내용, ISNULL(N.컨버전, 0) AS 컨버전,
                                ISNULL(N.취소사유, '') AS 취소내용,
                                ISNULL(N.이미지, '') AS 이미지, ISNULL(N.내선번호, '') AS 내선번호, N.상태, ISNULL(N.처리구분, 0) AS 처리구분, ISNULL(N.실행메뉴, '') AS 실행메뉴, ISNULL(N.세부화면, '') AS 세부화면,
                                ISNULL(N.만족도, 0) AS 만족도,
                                ISNULL(N.연결AS, '') AS 연결AS,
                                ISNULL(SD.파일전달, 0) AS 파일전달,
                                ISNULL(SD.파일테스트, 0) AS 파일테스트,
                                ISNULL(FT.USER_NAME, '') AS 파일테스터,
                                ISNULL(SD.업데이트버전, '') AS 버전,
                                ISNULL(SD.업데이트테스트, 0) AS 테스트,
                                ISNULL(UT.USER_NAME, '') AS 테스터,
                                ISNULL(N.전달내용, '') AS 전달내용,
                                ISNULL(N.맥주소, '') AS 맥주소,
                                ISNULL(N.개발로그, '') AS 개발로그,
                                ISNULL(CONVERT(VARCHAR(10), N.처리예정일, 120), '') AS 처리예정일
                            From ${CONSTS.DB_NEOAS}.N_서비스 AS N WITH(NOLOCK)
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS C WITH(NOLOCK) --확인
                            On ISNULL(N.확인자,0) = C.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS S WITH(NOLOCK) --공유
                            On ISNULL(N.공유자,0) = S.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS P WITH(NOLOCK) --처리
                            On ISNULL(N.처리자,0) = P.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS D WITH(NOLOCK) --완료
                            On ISNULL(N.완료자,0) = D.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS HD WITH(NOLOCK) --보류
                            On ISNULL(N.보류자,0) = HD.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS F WITH(NOLOCK) --피드백
                            On ISNULL(N.피드백자,0) = F.USER_ID
                            LEFT JOIN ${CONSTS.DB_NEOAS}.N_서비스DEV AS SD WITH(NOLOCK)
                            ON N.인덱스 = SD.서비스ID
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS FT WITH(NOLOCK)
                            ON ISNULL(SD.파일테스트, 0) = FT.USER_ID
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS UT WITH(NOLOCK)
                            ON ABS(ISNULL(SD.업데이트테스트, 0)) = UT.USER_ID
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H WITH(NOLOCK)
                            ON N.기관코드 = H.USER_MED_ID
                            Where N.인덱스 = ${params.index};

                            Select R.인덱스, R.서비스키, R.내용, R.작성자, U.USER_NAME AS 작성자명, CONVERT(char(19), R.작성일자, 120) AS 작성일자
                            From ${CONSTS.DB_NEOAS}.N_서비스리플 AS R WITH(NOLOCK)
                            Inner Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS U WITH(NOLOCK)
                            On R.작성자 = U.USER_ID
                            Where 서비스키 = ${params.index}
                            Order By 작성일자 ASC;

                            Select CASE ISNULL(H.USER_CLOSED, 0) WHEN 0 THEN '운영중' ELSE '폐업' END AS 운영상태,
                            H.USER_ID AS ID,
                            H.USER_MED_ID AS 기관기호, H.user_med_name AS  기관명칭,
                            HK.코드이름 AS 병원구분, G.코드이름 AS 진료과목,
                            P.코드이름 AS 프로그램, H.user_program AS 프로그램ID, HI.info_president AS 대표자,
                            HI.INFO_TEL AS 전화번호, HI.INFO_HP AS 이동전화,
                            HI.info_post AS 우편번호, HI.INFO_JUSO AS 주소,
                            ISNULL(A.AREA_NAME, '미정') + '(' + ISNULL(U.USER_NAME, '미정') + ')' AS 담당,
                            ISNULL(HI.INFO_특이사항, '') AS 특이사항,
                            ISNULL(S.실가동일, '') AS 실가동일
                            From ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H WITH(NOLOCK)
                            Inner Join ${CONSTS.DB_NEOCOMPANY}.NC_H_INFO AS HI WITH(NOLOCK)
                            On H.USER_ID = HI.INFO_USER_ID
                            LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '과별코드' ) AS G
                            ON H.user_gwa = G.데이터1
                            LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '병원구분' ) AS HK
                            ON H.user_gubun = HK.데이터1
                            LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '프로그램' ) AS P
                            ON H.user_program = P.데이터1
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A WITH(NOLOCK)
                            ON HI.INFO_AREA = A.AREA_ID
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS U WITH(NOLOCK)
                            ON H.USER_담당자 = U.USER_ID
                            Left Join ${CONSTS.DB_OCS}.SS_기관정보 AS S WITH(NOLOCK)
                            On H.USER_MED_ID = S.요양기관코드
                            Where H.USER_ID = ${params.id ? params.id : "(SELECT TOP 1 USER_ID FROM " + CONSTS.DB_NEOCOMPANY + ".NC_H_USER WITH(NOLOCK) WHERE USER_MED_ID = '" + params.hospnum + "' )"};


                            Select
                            CASE ISNULL(병원유형,0) WHEN 1 THEN '우수' WHEN 2 THEN '주의' ELSE '보통' END AS 병원유형, 전산담당,
                            결제담당, 메모2 AS 메모, 메모 AS 메모2, M.USER_NAME AS 수정자, CONVERT(CHAR(10), 수정일자, 120) AS 수정일자,
                            ISNULL(원격서버, '') AS 원격서버,
                            ISNULL(원격아이디, '') AS 원격아이디,
                            ISNULL(원격비번, '') AS 원격비번,
                            ISNULL(스탠바이이름, '') AS 스탠바이이름,
                            ISNULL(스탠바이비번, '') AS 스탠바이비번
                            From ${CONSTS.DB_NEOAS}.N_병원특이사항 AS U WITH(NOLOCK)
                            Inner Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M WITH(NOLOCK)
                            On U.수정자 = M.USER_ID
                            Where U.USER_ID = ${params.id ? params.id : "(SELECT TOP 1 USER_ID FROM " + CONSTS.DB_NEOCOMPANY + ".NC_H_USER WITH(NOLOCK) WHERE USER_MED_ID = '" + params.hospnum + "' )"};

                            SELECT
                            ISNULL(B.백업일시, '') AS 백업일시, CASE ISNULL(B.로그축소사용, 0) WHEN 1 THEN '사용' ELSE '미사용' END AS 로그축소,
                            ISNULL(B.자동백업시간, '') AS 자동백업시간,
                            ISNULL(B.백업경로용량, 0) AS 백업경로용량,
                            ISNULL(B.백업경로, '') AS 백업경로, ISNULL(B.정품여부, 0) 정품여부,
                            ISNULL(B.SQL버전, '') AS SQL버전,
                            REPLACE(ISNULL(B.기타수가현황, ''), '-', '') AS 백업수가, REPLACE(ISNULL(B.기타약가현황, ''), '-', '') AS 백업약가, REPLACE(ISNULL(B.기타재료현황, ''), '-', '') AS 백업재료,
                            REPLACE(ISNULL(S.마스터버젼_수가, ''), '-', '') AS 센스수가, REPLACE(ISNULL(S.마스터버젼_약품, ''), '-', '') AS 센스약가, REPLACE(ISNULL(S.마스터버젼_재료, ''), '-', '') AS 센스재료,
                            REPLACE(ISNULL(ML.수가업데이트버젼, ''), '-', '') AS 메디수가, REPLACE(ISNULL(ML.약가업데이트버젼, ''), '-', '') AS 메디약가, REPLACE(ISNULL(ML.재료업데이트버젼, ''), '-', '') AS 메디재료,
                            ( SELECT 업데이트 FROM MEDICHART.DBO.TB_마스터업데이트 WITH(NOLOCK) WHERE 마스터ID = 2) AS M수가,
                            ( SELECT 업데이트 FROM MEDICHART.DBO.TB_마스터업데이트 WITH(NOLOCK) WHERE 마스터ID = 1) AS M약가,
                            ( SELECT 업데이트 FROM MEDICHART.DBO.TB_마스터업데이트 WITH(NOLOCK) WHERE 마스터ID = 3) AS M재료,
                            ISNULL(B.메인데이터경로, '') AS 메인데이터경로,
                            ISNULL(B.보조PC명칭, '') AS 보조PC명칭
                            FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H WITH(NOLOCK)
                            LEFT JOIN ${CONSTS.DB_OCS}.TB_백업솔루션현황 AS B WITH(NOLOCK)
                            ON H.USER_MED_ID = B.요양기관기호
                            LEFT JOIN ${CONSTS.DB_OCS}.SS_기관정보 AS S WITH(NOLOCK)
                            ON H.USER_MED_ID = S.요양기관코드
                            LEFT JOIN ${CONSTS.DB_OCS}.TB_Live승인버전 AS L WITH(NOLOCK)
                            ON L.요양기관기호 = H.USER_MED_ID
                            LEFT JOIN ${CONSTS.DB_OCS}.TB_MEDI서버정보 AS ML WITH(NOLOCK)
                            ON ML.요양기관기호 = H.USER_MED_ID
                            WHERE H.USER_MED_ID = '${params.hospnum}';

                            Select C.코드이름 + ' (' + C.데이터3 + ')' AS 부가서비스
                            From (
                                Select A.코드이름, A.데이터1, A.데이터3, Convert(Int, B.데이터1) AS 분류코드
                                From (
                                    Select * From ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WITH(NOLOCK) Where 코드구분 = '부가서비스'
                                ) AS A
                                Left Join (
                                    Select * From ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WITH(NOLOCK) Where 코드구분 = '부가서비스분류'
                                ) AS B
                                On A.데이터2 = B.데이터1
                            ) AS C
                            Left Join (
                                Select * From ${CONSTS.DB_NEOCOMPANY}.NC_H_부가서비스 WITH(NOLOCK) Where 거래처ID = ${params.id ? params.id : "(SELECT TOP 1 USER_ID FROM " + CONSTS.DB_NEOCOMPANY + ".NC_H_USER WITH(NOLOCK) WHERE USER_MED_ID = '" + params.hospnum + "' )"}
                            ) AS D
                            On D.서비스ID = Convert(Int, C.데이터1)
                            Where GETDATE() BETWEEN D.시작일자 AND D.종료일자
                            Order By C.분류코드;

                            SELECT 서비스ID, 로그, CONVERT(CHAR(19), 수정일자, 120) AS 수정일자, 처리자 FROM ${CONSTS.DB_NEOAS}.N_서비스로그 WITH(NOLOCK) WHERE 서비스ID = ${params.index};

                            SELECT S.USER_NAME AS 선택자명, CONVERT(CHAR(19), F.선택일자, 120) AS 선택일자
                            FROM ${CONSTS.DB_NEOAS}.N_서비스LIKE AS F WITH(NOLOCK)
                            INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS S WITH(NOLOCK)
                            ON F.USER_ID = S.USER_ID
                            WHERE 서비스ID = ${params.index};

                            Select dbo.fP_GetSenseConfig(S.공통_텍스트, 20, '^') AS Pacs, S.수탁검사정보
                            From ${CONSTS.DB_OCS}.SS_기관정보 AS S
                            Inner Join ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                            On S.요양기관코드 = H.USER_MED_ID
                            Where H.USER_ID = ${params.id ? params.id : "(SELECT TOP 1 USER_ID FROM " + CONSTS.DB_NEOCOMPANY + ".NC_H_USER WITH(NOLOCK) WHERE USER_MED_ID = '" + params.hospnum + "' )"}
                        `;
                    }


                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            sQuery = null
                            params = null
                            resolve(result.recordsets);
                        })
                        .catch(function (error) {
                            console.log(error);
                            sQuery = null
                            params = null
                            reject(error);
                        })
                } catch (error) {
                    console.log(error);
                    reject(error);
                }
            })
        }

        function GetServiceReport(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        -- AS 보고서용 조회

                        SELECT  S.인덱스, S.기관코드, S.기관명칭, S.프로그램,
                                S.문의내용, S.확인내용, S.처리내용, ISNULL(S.완료자, 0) AS 완료자, ISNULL(H.USER_NAME, '') AS 공유자명, 
                                ISNULL(S.공유자, 0) AS 공유자, ISNULL(S.처리자, 0) AS 처리자, ISNULL(S.피드백자, 0) AS 피드백자,
                                ISNULL(CONVERT(VARCHAR(19), S.완료일자, 120), '') AS 완료일자,
                                CASE S.상태 WHEN ${CONSTS.SERVICE_STATUS.SHARE} THEN '공유'
                                            WHEN ${CONSTS.SERVICE_STATUS.PROCESS} THEN '처리중'
                                            WHEN ${CONSTS.SERVICE_STATUS.DONE} THEN '완료'
                                            WHEN ${CONSTS.SERVICE_STATUS.FEEDBACK} THEN '피드백' END AS 상태, S.상태 AS '상태ID'
                                --(CASE WHEN S.상태 IN (${CONSTS.SERVICE_STATUS.DONE}, ${CONSTS.SERVICE_STATUS.FEEDBACK}) THEN 0
                                  --   ELSE 1 END) AS SortKey
                        FROM    ${CONSTS.DB_NEOAS}.N_서비스 AS S WITH(NOLOCK)
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS H WITH(NOLOCK)
                        ON S.공유자 = H.USER_ID
                        WHERE   1 = 1
                        AND ( 
                                (ISNULL(CONVERT(CHAR(10), S.완료일자, 120), '') = '${params.date}'
                                AND S.상태 = ${CONSTS.SERVICE_STATUS.DONE})
                            OR  (ISNULL(CONVERT(CHAR(10), S.피드백일자, 120), '') = '${params.date}'
                                AND S.상태 = ${CONSTS.SERVICE_STATUS.FEEDBACK})
                            OR  (ISNULL(CONVERT(CHAR(10), S.공유일자, 120), '') = '${params.date}'
                                AND S.상태 = ${CONSTS.SERVICE_STATUS.SHARE})
                            OR  (ISNULL(CONVERT(CHAR(10), S.처리일자, 120), '') = '${params.date}'
                                AND S.상태 = ${CONSTS.SERVICE_STATUS.PROCESS})    
                        )
                        
                        ORDER BY S.상태 DESC, S.완료일자 ASC
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
                        });

                } catch (error) {
                    reject(error);
                }
            })
        }

        function GetServiceHistory(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    console.log(params);
                    sQuery = `
                        -- AS 내역 조회
                        SELECT  S.인덱스, S.기관코드, S.기관명칭, S.프로그램, P.프로그램명,
                                S.지사코드, A.AREA_NAME AS 지사명, ISNULL(S.담당자, 0) AS 담당자, ISNULL(M.USER_NAME, '') AS 담당자명,
                                S.상태, ISNULL(H.USER_ID, 0) AS USER_ID,
                                ISNULL(S.응급, 0) AS 응급,
                                CASE S.상태 WHEN 0 THEN '접수'
                                            WHEN 1 THEN '공유'
                                            WHEN 2 THEN '처리'
                                            WHEN 3 THEN '보류'
                                            WHEN 4 THEN '완료'
                                            WHEN 6 THEN '피드백'
                                            WHEN 7 THEN '확인'
                                            ELSE '취소' END AS 상태명,
                                ISNULL(U.병원유형, 1) AS 병원유형, ISNULL(DATEDIFF(mm, SS.실가동일, GETDATE()), 4) AS 신규,
                                CONVERT(CHAR(10), S.접수일자, 120) AS 접수일,
                                CONVERT(VARCHAR(19), S.접수일자, 120) AS 접수일자,
                                ISNULL(CONVERT(VARCHAR(19), S.확인일자, 120), '') AS 확인일자,
                                ISNULL(CONVERT(VARCHAR(19), S.공유일자, 120), '') AS 공유일자,
                                ISNULL(CONVERT(VARCHAR(19), S.처리일자, 120), '') AS 처리일자,
                                ISNULL(CONVERT(VARCHAR(19), S.완료일자, 120), '') AS 완료일자,
                                ISNULL(CONVERT(VARCHAR(19), S.보류일자, 120), '') AS 보류일자,
                                ISNULL(CONVERT(VARCHAR(19), S.피드백일자, 120), '') AS 피드백일자,
                                ISNULL(S.확인자, 0) AS 확인자, ISNULL(MC.USER_NAME, '') AS 확인자명,
                                ISNULL(S.공유자, 0) AS 공유자, ISNULL(MS.USER_NAME, '') AS 공유자명,
                                ISNULL(S.처리자, 0) AS 처리자, ISNULL(MP.USER_NAME, '') AS 처리자명,
                                ISNULL(S.완료자, 0) AS 완료자, ISNULL(MD.USER_NAME, '') AS 완료자명,
                                ISNULL(S.보류자, 0) AS 보류자, ISNULL(MH.USER_NAME, '') AS 보류자명,
                                ISNULL(S.피드백자, 0) AS 피드백자, ISNULL(MH.USER_NAME, '') AS 피드백자명,
                                ISNULL(CONVERT(VARCHAR(10), S.처리예정일, 120), '') AS 처리예정일,
                                ISNULL(S.만족도, 0) AS 만족도,
                                ISNULL(S.실행파일, '') AS 실행파일,
                                ISNULL(CONVERT(NVARCHAR(MAX), S.문의내용), '') AS 문의내용,
                                ISNULL(CONVERT(NVARCHAR(MAX), S.확인내용), '') AS 확인내용,
                                ISNULL(CONVERT(NVARCHAR(MAX), S.처리내용), '') AS 처리내용,
                                ISNULL(CONVERT(NVARCHAR(MAX), S.보류내용), '') AS 보류내용,
                                ISNULL(SD.파일전달, 0) AS 파일전달,
                                ISNULL(SD.파일테스트, 0) AS 파일테스트,
                                ISNULL(FT.USER_NAME, '') AS 파일테스터,
                                ISNULL(SD.업데이트버전, '') AS 버전,
                                ISNULL(SD.업데이트테스트, 0) AS 테스트,
                                ISNULL(UT.USER_NAME, '') AS 테스터,
                                ISNULL(S.실행메뉴, '') AS 실행메뉴, ISNULL(S.세부화면, '') AS 세부화면,
                                ISNULL(S.전달내용, '') AS 전달내용,
                                ISNULL(
                                    (
                                        SELECT COUNT(인덱스)
                                        FROM ${CONSTS.DB_NEOAS}.N_서비스리플
                                        WHERE 서비스키 = S.인덱스
                                        AND ISNULL(구분, 0) = 0), 0
                                ) AS 댓글수,
                                ISNULL(처리구분, 0) AS 처리구분
                        FROM ${CONSTS.DB_NEOAS}.N_서비스 AS S WITH(NOLOCK)
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H WITH(NOLOCK)
                        ON H.USER_MED_ID = S.기관코드
                        INNER JOIN ( SELECT 데이터1, 코드이름 AS 프로그램명 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '프로그램') AS P
                        ON S.프로그램 = P.데이터1
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A WITH(NOLOCK)
                        ON S.지사코드 = A.AREA_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M WITH(NOLOCK)
                        ON ISNULL(S.담당자, 0) = M.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS MS WITH(NOLOCK)
                        ON ISNULL(S.공유자, 0) = MS.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS MP WITH(NOLOCK)
                        ON ISNULL(S.처리자, 0) = MP.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS MD WITH(NOLOCK)
                        ON ISNULL(S.완료자, 0) = MD.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS MH WITH(NOLOCK)
                        ON ISNULL(S.보류자, 0) = MH.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS MC WITH(NOLOCK)
                        ON ISNULL(S.확인자, 0) = MC.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS F WITH(NOLOCK)
                        ON ISNULL(S.피드백자, 0) = F.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOAS}.N_서비스DEV AS SD WITH(NOLOCK)
                        ON S.인덱스 = SD.서비스ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS FT WITH(NOLOCK)
                        ON ISNULL(SD.파일테스트, 0) = FT.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS UT WITH(NOLOCK)
                        ON ABS(ISNULL(SD.업데이트테스트, 0)) = UT.USER_ID
                        LEFT JOIN (SELECT 기관코드, 병원유형 FROM ${CONSTS.DB_NEOAS}.N_병원특이사항 WITH(NOLOCK)) AS U
                            ON U.기관코드 = S.기관코드
                        LEFT JOIN (SELECT 요양기관코드, 실가동일 FROM ${CONSTS.DB_OCS}.SS_기관정보 WITH(NOLOCK)) AS SS
                            ON SS.요양기관코드 = S.기관코드

                        WHERE   1 = 1
                        --AND     S.상태 <> 5
                    `;

                    if (params.search.substr(0, 1) === "#") {
                        sQuery += `AND S.인덱스 IN ('${params.search.replace("#", "").split(" ").join("','")}')`
                    } else {
                        if (params.area && params.area.length > 0) {
                            if (params.area === '0026' || params.area === '0000') {
                                sQuery += `
                                    AND S.지사코드 IN ('0000', '0030', '0031', '0026', '0034', '0045', '0046')
                                `;
                            } else {
                                sQuery += `
                                    AND     S.지사코드 = '${params['area']}'
                                `;
                            }
                        }

                        if (params.date) {
                            params.date = JSON.parse(params.date);
                            if (params.date.start == params.date.end) {
                                sQuery += ` AND CONVERT(CHAR(10), ${params.dev ? 'S.완료일자' : 'S.접수일자'}, 120) = '${params.date.start}' `;
                            } else {
                                sQuery += `
                                    -- AND CONVERT(CHAR(10), S.접수일자, 120) BETWEEN '${params['date']['start']}' AND '${params['date']['end']}'
                                    --AND ( ${params.dev ? 'S.완료일자' : 'S.접수일자'} >= '${params.date.start}' AND ${params.dev ? 'S.완료일자' : 'S.접수일자'} <= '${params.date.end}' )
                                    AND CONVERT(CHAR(10), ${params.dev ? 'S.완료일자' : 'S.접수일자'}, 120) BETWEEN '${params['date']['start']}' AND '${params['date']['end']}'
                                `;
                            }
                        }

                        if (params.dev) {
                            sQuery += `
                                AND ISNULL(S.공유일자, '') <> ''
                                AND ( MD.USER_POSITION_ID = 3 OR MD.USER_ID = 149 )
                            `
                        }

                        if (params.emr && params.emr.length) {
                            sQuery += `
                                AND S.프로그램 IN (${params.emr.join(',')})
                            `
                        }

                        if (params.status && params.status.length) {
                            sQuery += `
                                AND S.상태 IN (${params.status.join(',')})
                            `
                        }

                        if (params.share && params.share.length && params.share !== "") {
                            sQuery += `
                                AND ISNULL(S.공유자, 0) = ${params.share}
                            `
                        }

                        if (params.done && params.done.length && params.done !== "") {
                            sQuery += `
                                AND ISNULL(S.완료자, 0) = ${params.done}
                            `
                        }

                        if (params.hospital && params.hospital.length && params.hospital !== "") {
                            sQuery += `
                                AND S.기관코드 = '${params.hospital}'
                            `
                        }
                        if (params.exe && params.exe.length && params.exe !== "") {
                            sQuery += `
                                AND ISNULL(S.실행파일, '') IN ( ${params.exe} )
                            `
                        }

                        if (params.menu && params.menu.length && params.menu !== "") {
                            sQuery += `                                
                                AND   ISNULL(S.실행메뉴, '') = '${params.menu}'                                
                            `
                        }
                        if (params.button && params.button.length && params.button !== "") {
                            sQuery += `                                
                                AND   ISNULL(S.세부화면, '') = '${params.button}'                                
                            `
                        }

                        if (params.search && params.search.length && params.search !== "") {
                            sQuery += `
                                    AND (
                                        CONTAINS((S.문의내용, S.확인내용, S.처리내용), '"${params.search}*"')
                                        OR S.기관코드 LIKE '%${params.search}%'
                                        OR ISNULL(S.기관명칭, H.USER_MED_NAME) LIKE '%${params.search}%'
                                        OR S.접수자 LIKE '%${params.search}%'
                                        OR ISNULL(MS.USER_NAME, '') LIKE '%${params.search}%'
                                        OR ISNULL(MP.USER_NAME, '') LIKE '%${params.search}%'
                                        OR ISNULL(MD.USER_NAME, '') LIKE '%${params.search}%'
                                        OR ISNULL(MH.USER_NAME, '') LIKE '%${params.search}%'
                                        OR ISNULL(MC.USER_NAME, '') LIKE '%${params.search}%'
                                        OR ISNULL(F.USER_NAME, '') LIKE '%${params.search}%'
                                        OR CONVERT(VARCHAR, S.인덱스) = '${params.search}'
                                    )
                                `;
                        }
                    }

                    sQuery += `
                        ORDER BY 접수일자 ASC
                    `;

                    console.log(sQuery);

                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            sQuery = null
                            // params = null

                            resolve((function () {
                                return (result.recordset.filter(function (item) {
                                    if (params.new == 1) {
                                        if (params.relation) {
                                            return item['신규'] <= 3 && item['병원유형'] == params.relation;
                                        } else {
                                            return item['신규'] <= 3;
                                        }
                                    } else {
                                        if (params.relation) {
                                            return item['병원유형'] == params.relation;
                                        } else {
                                            return true;
                                        }
                                    }
                                }));
                            })());
                        })
                        .catch(function (error) {
                            sQuery = null
                            params = null
                            reject(error);
                        })
                } catch (error) {
                    reject(error);
                }
            })
        }

        function GetServiceStatus(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        -- AS 상태 조회
                        SELECT
                            S.상태,
                            ISNULL(S.공유자, 0) AS 공유자,
                            ISNULL(S.처리자, 0) AS 처리자,
                            ISNULL(S.완료자, 0) AS 완료자,
                            ISNULL(S.피드백자, 0) AS 피드백자,
                            ISNULL(MS.USER_NAME, '') AS 공유자명,
                            ISNULL(MP.USER_NAME, '') AS 처리자명,
                            ISNULL(MD.USER_NAME, '') AS 완료자명,
                            ISNULL(F.USER_NAME, '') AS 피드백자명
                        From ${CONSTS.DB_NEOAS}.N_서비스 AS S WITH(NOLOCK)
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS MS WITH(NOLOCK)
                        ON S.공유자 = MS.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS MP WITH(NOLOCK)
                        ON S.처리자 = MP.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS MD WITH(NOLOCK)
                        ON S.완료자 = MD.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS F WITH(NOLOCK)
                        ON S.완료자 = F.USER_ID
                        Where S.인덱스 = ${params.index};
                    `;
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            sQuery = null
                            params = null
                            // console.log(result)
                            resolve(result.recordset[0])
                        })
                        .catch(function (error) {
                            sQuery = null
                            params = null
                            reject(error);
                        })
                } catch (error) {
                    reject(error);
                }
            })
        }

        function GetTags(req) {
            return new Promise(function (resolve, reject) {
                var params = req ? req.query : {}
                sQuery = `
                    SELECT 태그 AS tags FROM ${CONSTS.DB_NEOAS}.N_서비스태그 WITH(NOLOCK)
                    WHERE ${params.exe ? `실행파일 = '${params.exe}'` : `실행파일 = '통합'`}
                `
                try {
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            sQuery = null
                            params = null
                            resolve(result.recordset[0])
                        })
                        .catch(function (error) {
                            sQuery = null
                            params = null
                            reject(error);
                        })
                } catch (error) {
                    reject(error)
                }
            })
        }

        function GetDevServiceInfo(req) {
            return new Promise(function (resolve, reject) {
                var params = req.body
                sQuery = `
                    SELECT * FROM ${CONSTS.DB_NEOAS}.N_서비스DEV WITH(NOLOCK)
                    WHERE 서비스ID = ${params.index}
                `;
                try {
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            sQuery = null
                            params = null
                            resolve(result.recordset)
                        })
                        .catch(function (error) {
                            sQuery = null
                            params = null
                            reject(error)
                        })
                } catch (error) {
                    reject(error)
                }
            })
        }

        function GetServiceReply(req) {
            return new Promise(function (resolve, reject) {
                var params = req.query
                sQuery = `
                    Select R.인덱스, R.서비스키, R.내용, R.작성자, U.USER_NAME AS 작성자명, CONVERT(char(19), R.작성일자, 120) AS 작성일자
                    From ${CONSTS.DB_NEOAS}.N_서비스리플 AS R WITH(NOLOCK)
                    Inner Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS U
                    On R.작성자 = U.USER_ID
                    Where 서비스키 = ${params.index}
                    Order By 작성일자 ASC;
                `;
                console.log(sQuery)
                try {
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            sQuery = null
                            params = null
                            resolve(result.recordset)
                        })
                        .catch(function (error) {
                            sQuery = null
                            params = null
                            reject(error);
                        })
                } catch (error) {
                    reject(error)
                }
            })
        }

        return {
            Services: GetServiceList,
            Service: GetServiceDetail,
            Report: GetServiceReport,
            History: GetServiceHistory,
            Status: GetServiceStatus,
            DevServiceInfo: GetDevServiceInfo,
            Tags: GetTags,
            Replys: GetServiceReply
        }
    })();

    var cInsert = (function () {

        function InsertService(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    // console.log(params)                    
                    var images = JSON.parse(params['captures'].trim().length ? params['captures'] : '[]');
                    images = images.map(function (image) {
                        return image['oPath'];
                    });

                    images = images.filter(function (image) {
                        return fs.existsSync(path.join(__dirname, '..', 'public', image))
                    })

                    console.log(images)

                    params['captures'] = JSON.stringify(images);
                    params['area'] = params['area'].trim() === '' ? '0000' : params['area'].trim();

                    params['exe'] = params['exe'] === '문서추가' ? '문서관리' : params['exe']

                    var serviceStatus = params['astype'] == 3 ? SERVICE_STATUS.SHARE : SERVICE_STATUS.ACCEPT;
                    if (params['astype'] == 3) {
                        if (!params['area'].match(/0000|0030|0031|0026|0034|0045|0046/gim) || params['program'] == 1) { //eplus 금액관련은 공유로 안넘어가게 
                            serviceStatus = SERVICE_STATUS.ACCEPT;
                        } else {
                            serviceStatus = SERVICE_STATUS.SHARE;
                        }
                        params['astype'] = 1;
                    } else {
                        serviceStatus = SERVICE_STATUS.ACCEPT;
                    }

                    if (!params.comment) params.comment = ''
                    sQuery = `
                        -- AS 등록
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_서비스
                        (
                            거래처ID, 기관코드, 기관명칭, 지사코드, 프로그램, 담당자,
                            타입, 상태, 접수자, 연락처, 내선번호, 접수일자,
                            문의내용,  이미지,
                            컴퓨터정보, 현재버전,
                            보험규정, 병원전화, 팍스, 서버이름, 서버아이디,
                            서버비밀번호, 데이터베이스, SQL버전, 인증서암호,
                            오픈담당자, 수탁기관, 운영체제, 수가, 약가, 치료재료,
                            실행파일, 실행메뉴, 본사, 맥주소 ${serviceStatus === SERVICE_STATUS.SHARE ? ', 공유일자, 공유자' : ''}
                        )
                        VALUES
                        (
                            ${params['userid']}, '${params['hospnum']}', '${params['hospname']}', '${params['area']}', '${params['program']}', '${params['manager']}',
                            '${params['astype']}', ${serviceStatus}, '${params['client_name']}', '${params['client_contact']}', '${params['client_contact2']}', GETDATE(),
                            '${params['comment']}', '${params['captures']}',
                            '${params['pcinfo']}', '${params['curversion']}',
                            '${params['bohum']}', '${params['hosp_contact']}', '${params['pacs']}', '${params['servername']}', '${params['serverid']}',
                            '${params['serverpw']}', '${params['dbname']}', '${params['sqlversion']}', '${params['certpw']}',
                            '${params['openperson']}', '${params['sutak']}', '${params['os']}', '${params['masterSuga']}', '${params['masterDrug']}', '${params['masterMaterial']}',
                            '${params['exe'] || ''}', '${params['tag'] || ''}', 1, '${params['macaddress'] || ''}' ${serviceStatus === SERVICE_STATUS.SHARE ? ', GETDATE(), 19' : ''}
                        );

                        Select TOP 1 S.인덱스, S.기관명칭, S.지사코드, A.AREA_NAME AS 지사,
                        ISNULL(S.담당자, 0) AS 담당자, ISNULL(M.USER_NAME, '') AS 담당자명, S.문의내용, S.접수자, S.연락처, S.내선번호,
                        S.이미지, ISNULL(S.실행메뉴,'') AS 실행메뉴, S.실행파일
                        From ${CONSTS.DB_NEOAS}.N_서비스 AS S
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A
                        ON S.지사코드 = A.AREA_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON S.담당자 = M.USER_ID
                        Where S.기관코드 = '${params['hospnum']}'
                        AND S.접수자 = '${params['client_name']}'
                        AND S.연락처 = '${params['client_contact']}'
                        ORDER BY S.인덱스 DESC;
                    `;

                    if (params['manager'] != 0) {
                        sQuery += `
                            SELECT COUNT(*) AS 처리건수
                            FROM ${CONSTS.DB_NEOAS}.N_서비스
                            WHERE 상태 IN (0, 1, 2)
                            AND   담당자 = ${params['manager']}
                            AND CONVERT(CHAR(10), 접수일자, 120) = CONVERT(CHAR(10), GETDATE(), 120)
                        `;
                    } else {
                        sQuery += `
                            SELECT COUNT(*) AS 처리건수
                            FROM ${CONSTS.DB_NEOAS}.N_서비스
                            WHERE 상태 IN (0, 1, 2)
                            AND   지사코드 = ${params['area']}
                            AND CONVERT(CHAR(10), 접수일자, 120) = CONVERT(CHAR(10), GETDATE(), 120)
                        `;
                    }

                    console.log(sQuery);
                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            images = null
                            sQuery = null
                            resolve(result.recordsets);
                        })
                        .catch(function (error) {
                            params = null
                            sQuery = null
                            images = null
                            reject(error);
                        })
                    // fm.MoveFile({
                    //         path: '/service/' + params['hospnum']
                    //     }, images)
                    //     .then(function (imgs) {

                    //     })
                    //     .catch(function (error) {
                    //         reject(error);
                    //     })



                    // console.log(params);

                } catch (error) {
                    reject(error);
                }
            })
        }

        function InsertReply(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    params.comment = params.comment.replace(/'/gim, '&#39;').replace(/"/gim, '&#34;');
                    sQuery = `
                        -- AS 댓글 등록
                        BEGIN TRY

                            Insert Into ${CONSTS.DB_NEOAS}.N_서비스리플(
                                서비스키, 내용, 작성자, 작성일자, 구분
                            )
                            values (
                                ${params.key}, '${params.comment}', ${params.user['인덱스']}, GETDATE(), 0
                            );

                            Select R.인덱스, R.서비스키, R.내용, R.작성자, M.USER_NAME AS 작성자명, CONVERT(CHAR(19), R.작성일자, 120) AS 작성일자
                            From ${CONSTS.DB_NEOAS}.N_서비스리플 AS R
                            Inner Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                            On R.작성자 = M.USER_ID
                            Where 서비스키 = ${params.key}
                            And   작성자 = ${params.user['인덱스']}
                            Order By 인덱스 DESC

                        END TRY
                        BEGIN CATCH
                            ${CONSTS.SQL_ERROR}
                        END CATCH
                    `;

                    console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            sQuery = null
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            params = null
                            sQuery = null
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            })
        }

        function InsertTags(req) {
            return new Promise(function (resolve, reject) {
                var params = req.body
                sQuery = `
                    INSERT INTO ${CONSTS.DB_NEOAS}.N_서비스태그
                    VALUES (
                        '${params.exe}', '${params.tags}'
                    )
                `
                try {
                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            sQuery = null
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            params = null
                            sQuery = null
                            reject(error);
                        });
                } catch (error) {
                    reject(error)
                }
            })
        }

        function InsertEmergenService(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body
                    sQuery = `
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_업무외서비스
                        ( 기관코드, 기관명칭, 접수자, 연락처, 유형, 문의내용, 접수시간, 상태 )
                        VALUES
                        ( '${params.hospitalNum}', '${params.hospitalName}', '${params.name}', '${params.phone}', '${params.type}', '${params.comment}', GETDATE(), 0)
                    `
                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            sQuery = null
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            params = null
                            sQuery = null
                            reject(error);
                        });
                } catch (error) {
                    reject(error)
                }
            })
        }

        function InsertAwayFromService(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body,
                        user = req.session.user
                    console.log(params)
                    sQuery = `
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_서비스로그
                        ( 서비스ID, 로그, 처리자, 수정일자 )
                        VALUES
                        ( '${params['인덱스']}', '부재중', ${user['인덱스']}, GETDATE());

                        SELECT 서비스ID, 로그, 처리자,CONVERT(CHAR(19), 수정일자, 120) AS 수정일자 FROM ${CONSTS.DB_NEOAS}.N_서비스로그
                        WHERE 서비스ID = ${params['인덱스']}
                    `
                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            sQuery = null
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            params = null
                            sQuery = null
                            reject(error);
                        });
                } catch (error) {
                    reject(error)
                }
            })
        }

        function InsertDevServiceInfo(req) {
            return new Promise(function (resolve, reject) {
                var params = req.body
                sQuery = `
                    INSERT INTO ${CONSTS.DB_NEOAS}.N_서비스DEV ( 서비스ID, ${params.field} )
                    VALUES ( ${params.index}, '${params.data}' )
                `;
                try {
                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            sQuery = null
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            params = null
                            sQuery = null
                            reject(error);
                        });
                } catch (error) {
                    reject(error)
                }
            })
        }

        return {
            Service: InsertService,
            Reply: InsertReply,
            Tags: InsertTags,
            EmergenService: InsertEmergenService,
            AwayFromService: InsertAwayFromService,
            DevServiceInfo: InsertDevServiceInfo
        }
    })();

    var cUpdate = (function () {

        function UpdateService(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    var sUpdate = '';

                    if (params.nextStatus === '4|6') { //한번에 피드백으로
                        params.nextStatus = 6
                    }

                    sQuery = `
                        -- AS 업데이트
                        BEGIN TRY
                            Update ${CONSTS.DB_NEOAS}.N_서비스
                            Set 상태 = ${params.nextStatus},
                                실행파일 = '${params.exe}',
                                응급 = ${params.emergency},
                                본사 = ${params.internal},
                                처리구분 = ${params.gubun},
                                확인내용 = '${params.comment.confirm.replace(/'/gim, '&#39;').replace(/"/gim, '&#34;')}',
                                처리내용 = '${params.comment.process.replace(/'/gim, '&#39;').replace(/"/gim, '&#34;')}',
                                보류내용 = '${params.comment.hold.replace(/'/gim, '&#39;').replace(/"/gim, '&#34;')}',
                                실행메뉴 = '${params.mainCategory}',
                                세부화면 = '${params.subCategory}'
                                {{UPDATE}}
                            Where 인덱스 = ${params.index};

                            Select
                                200 as status, 'SUCCESS' as message,
                                N.인덱스, ISNULL(N.실행파일, '') AS 실행파일, ISNULL(N.응급, 0) AS 응급, ISNULL(N.본사, 0) AS 본사,
                                N.지사코드, A.AREA_NAME AS 지사, N.기관명칭,
                                ISNULL(N.담당자, 0) AS 담당자, ISNULL(M.USER_NAME, '') AS 담당자명,
                                N.접수자, N.연락처, Convert(char(19), N.접수일자 , 120) AS 접수일자,
                                N.공유자, Convert(char(19), N.공유일자 , 120) AS 공유일자, ISNULL(S.USER_NAME, '') AS 공유자명,
                                N.보류자, Convert(char(19), N.보류일자 , 120) AS 보류일자, ISNULL(HD.USER_NAME, '') AS 보류자명,
                                N.처리자, Convert(char(19), N.처리일자 , 120) AS 처리일자, ISNULL(P.USER_NAME, '') AS 처리자명,
                                N.완료자, Convert(char(19), N.완료일자 , 120) AS 완료일자, ISNULL(D.USER_NAME, '') AS 완료자명,
                                N.피드백자, Convert(char(19), N.피드백일자 , 120) AS 피드백일자, ISNULL(D.USER_NAME, '') AS 피드백자명,
                                N.문의내용, ISNULL(N.확인내용, '') AS 확인내용, ISNULL(N.처리내용, '') AS 처리내용, ISNULL(N.보류내용, '') AS 보류내용, ISNULL(N.컨버전, 0) AS 컨버전,
                                ISNULL(N.취소사유, '') AS 취소내용,
                                ISNULL(N.이미지, '') AS 이미지, ISNULL(N.내선번호, '') AS 내선번호, N.상태
                            From ${CONSTS.DB_NEOAS}.N_서비스 AS N
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS S --공유
                            On ISNULL(N.공유자,0) = S.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS P --처리
                            On ISNULL(N.처리자,0) = P.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS D --완료
                            On ISNULL(N.완료자,0) = D.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS HD --보류
                            On ISNULL(N.보류자,0) = HD.USER_ID
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A
                            ON N.지사코드 = A.AREA_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                            On ISNULL(N.담당자,0) = M.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS F
                            On ISNULL(N.피드백자,0) = F.USER_ID
                            Where N.인덱스 = ${params.index};

                        END TRY
                        BEGIN CATCH
                            ${CONSTS.SQL_ERROR}
                        END CATCH
                    `;

                    switch (params.curStatus) {

                        case SERVICE_STATUS.ACCEPT:
                            sUpdate += ',\n 확인자 = ' + params.user['인덱스'];
                            sUpdate += ',\n 확인일자 = GETDATE()';
                            switch (params.nextStatus) {
                                case SERVICE_STATUS.SHARE:
                                    sUpdate += ',\n 공유자 = ' + params.user['인덱스'];
                                    sUpdate += ',\n 공유일자 = GETDATE()';
                                    break;
                                case SERVICE_STATUS.PROCESS:
                                    sUpdate += ',\n 처리자 = ' + params.user['인덱스'];
                                    sUpdate += ',\n 처리일자 = GETDATE()';
                                    break;
                                case SERVICE_STATUS.HOLD:
                                    sUpdate += ',\n 보류자 = ' + params.user['인덱스'];
                                    sUpdate += ',\n 보류일자 = GETDATE()';
                                    break;
                                case SERVICE_STATUS.CONFIRM:
                                    sUpdate += ",\n 연결AS = '" + params.linkedService + "'"
                                    sUpdate += ",\n 전달내용 = '" + params.comment.pass + "'"
                            }
                            break;
                        case SERVICE_STATUS.CONFIRM:
                            switch (params.nextStatus) {
                                case SERVICE_STATUS.SHARE:
                                    sUpdate += ',\n 공유자 = ' + params.user['인덱스'];
                                    sUpdate += ',\n 공유일자 = GETDATE()';
                                    break;
                                case SERVICE_STATUS.PROCESS:
                                    sUpdate += ',\n 처리자 = ' + params.user['인덱스'];
                                    sUpdate += ',\n 처리일자 = GETDATE()';
                                    break;
                                case SERVICE_STATUS.HOLD:
                                    sUpdate += ',\n 보류자 = ' + params.user['인덱스'];
                                    sUpdate += ',\n 보류일자 = GETDATE()';
                                    break;
                            }
                            break;
                        case SERVICE_STATUS.SHARE:
                            if (params.nextStatus === SERVICE_STATUS.ACCEPT) {
                                sUpdate += ',\n 공유자 = 0, 공유일자 = null ';
                            } else {
                                sUpdate += ',\n 처리자 = ' + params.user['인덱스'];
                                sUpdate += ',\n 처리일자 = GETDATE()';
                            }
                            break;
                        case SERVICE_STATUS.PROCESS:
                            switch (params.nextStatus) {
                                case SERVICE_STATUS.DONE:
                                    sUpdate += ',\n 완료자 = ' + params.user['인덱스'];
                                    sUpdate += ',\n 완료일자 = GETDATE()';
                                    break;
                                case SERVICE_STATUS.HOLD:
                                    sUpdate += ',\n 보류자 = ' + params.user['인덱스'];
                                    sUpdate += ',\n 보류일자 = GETDATE()';
                                    break;
                                case SERVICE_STATUS.SHARE:
                                    sUpdate += ',\n 공유자 = ' + params.user['인덱스'];
                                    sUpdate += ',\n 공유일자 = GETDATE()';
                                    sUpdate += ',\n 처리자 = null';
                                    sUpdate += ',\n 처리일자 = null';
                                    break;
                                case SERVICE_STATUS.FEEDBACK:
                                    sUpdate += ',\n 완료자 = ' + params.user['인덱스'];
                                    sUpdate += ',\n 완료일자 = GETDATE()';
                                    sUpdate += ',\n 피드백자 = ' + params.user['인덱스'];
                                    sUpdate += ',\n 피드백일자 = GETDATE()';
                                    break;
                            }
                            break;
                        case SERVICE_STATUS.HOLD:
                            sUpdate += ',\n 처리자 = ' + params.user['인덱스'];
                            sUpdate += ',\n 처리일자 = GETDATE()';
                            break;
                        case SERVICE_STATUS.DONE:
                            if (params.nextStatus === SERVICE_STATUS.FEEDBACK) {
                                sUpdate += ',\n 피드백자 = ' + params.user['인덱스'];
                                sUpdate += ',\n 피드백일자 = GETDATE()';
                            }
                            break;
                    }

                    sQuery = sQuery.replace('{{UPDATE}}', sUpdate);
                    console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            sQuery = null
                            sUpdate = null
                            resolve(result.recordset[0]);
                        })
                        .catch(function (error) {
                            params = null
                            sQuery = null
                            sUpdate = null
                            reject(error);
                        })


                } catch (error) {
                    reject(error);
                }
            })
        }

        function UpdateServicePart(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    var sUpdate = '';

                    sUpdate = (function () {
                        var _update = '';
                        Object.keys(params).forEach(function (key, index) {
                            if (key !== '인덱스') {
                                if (_update.length) {
                                    _update += ', ';
                                }
                                if (params[key] === 'GETDATE()') {
                                    _update += key + " = GETDATE()";
                                } else if (key === '처리예정일' && params[key] === '') {
                                    _update += key + " = null";
                                } else {
                                    _update += key + " = '" + params[key] + "'";
                                }
                            }
                        });
                        return _update;
                    })();

                    sQuery = `
                        -- AS 업데이트 2 (Part)
                        BEGIN TRY
                            Update ${CONSTS.DB_NEOAS}.N_서비스
                            Set 기관코드 = 기관코드,
                            ${sUpdate}
                            Where 인덱스 = ${params['인덱스']};

                            Select
                                200 as status, 'SUCCESS' as message,
                                N.인덱스, ISNULL(N.실행파일, '') AS 실행파일, ISNULL(N.응급, 0) AS 응급, ISNULL(N.본사, 0) AS 본사,
                                N.지사코드, A.AREA_NAME AS 지사, N.기관명칭,
                                ISNULL(N.담당자, 0) AS 담당자, ISNULL(M.USER_NAME, '') AS 담당자명,
                                N.접수자, N.연락처, Convert(char(19), N.접수일자 , 120) AS 접수일자,
                                ISNULL(N.확인자, 0) AS 확인자, Convert(char(19), N.확인일자 , 120) AS 확인일자, ISNULL(C.USER_NAME, '') AS 확인자명,
                                ISNULL(N.공유자, 0) AS 공유자, Convert(char(19), N.공유일자 , 120) AS 공유일자, ISNULL(S.USER_NAME, '') AS 공유자명,
                                ISNULL(N.보류자, 0) AS 보류자, Convert(char(19), N.보류일자 , 120) AS 보류일자, ISNULL(HD.USER_NAME, '') AS 보류자명,
                                ISNULL(N.처리자, 0) AS 처리자, Convert(char(19), N.처리일자 , 120) AS 처리일자, ISNULL(P.USER_NAME, '') AS 처리자명,
                                ISNULL(N.완료자, 0) AS 완료자, Convert(char(19), N.완료일자 , 120) AS 완료일자, ISNULL(D.USER_NAME, '') AS 완료자명,
                                N.문의내용, ISNULL(N.확인내용, '') AS 확인내용, ISNULL(N.처리내용, '') AS 처리내용, ISNULL(N.보류내용, '') AS 보류내용, ISNULL(N.컨버전, 0) AS 컨버전,
                                ISNULL(N.취소사유, '') AS 취소내용,
                                ISNULL(N.이미지, '') AS 이미지, ISNULL(N.내선번호, '') AS 내선번호, N.상태
                            From ${CONSTS.DB_NEOAS}.N_서비스 AS N
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS C --확인
                            On ISNULL(N.확인자,0) = C.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS S --공유
                            On ISNULL(N.공유자,0) = S.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS P --처리
                            On ISNULL(N.처리자,0) = P.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS D --완료
                            On ISNULL(N.완료자,0) = D.USER_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS HD --보류
                            On ISNULL(N.보류자,0) = HD.USER_ID
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A
                            ON N.지사코드 = A.AREA_ID
                            Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                            On ISNULL(N.담당자,0) = M.USER_ID
                            Where N.인덱스 = ${params['인덱스']};

                        END TRY
                        BEGIN CATCH
                            ${CONSTS.SQL_ERROR}
                        END CATCH
                    `;
                    console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            sQuery = null
                            sUpdate = null
                            resolve(result.recordset[0]);
                        })
                        .catch(function (error) {
                            params = null
                            sQuery = null
                            sUpdate = null
                            reject(error);
                        })


                } catch (error) {
                    reject(error);
                }
            })
        }

        function CancelService(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        -- AS 취소
                        UPDATE ${CONSTS.DB_NEOAS}.N_서비스
                        SET 상태 = ${CONSTS.SERVICE_STATUS.CANCEL},
                        취소사유 = '${params['comment']}'
                        WHERE 인덱스 = ${params['index']}
                        AND 상태 <> ${CONSTS.SERVICE_STATUS.DONE};

                    `;
                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            sQuery = null
                            resolve(result);
                        })
                        .catch(function (error) {
                            params = null
                            sQuery = null
                            reject(error);
                        })
                } catch (error) {
                    reject(error);
                }
            })
        }

        function UpdateServiceTag(req) {
            return new Promise(function (resolve, reject) {
                try {
                    // var params = req.body;

                    // sQuery = `
                    //     UPDATE ${CONSTS.DB_NEOAS}.N_서비스
                    //     SET 태그 = '${params.tags}'
                    //     WHERE 인덱스 = ${params.index}
                    // `;

                    // //console.log(sQuery);

                    // _database.Execute(sQuery)
                    //     .then(function (result) {
                    //         params = null
                    //         sQuery = null
                    //         resolve(result);
                    //     })
                    //     .catch(function (error) {
                    //         params = null
                    //         sQuery = null
                    //         reject(error);
                    //     })
                    reject(new Error('removed api'))
                } catch (error) {
                    reject(error);
                }
            })
        }

        function UpdateTag(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_서비스태그
                        SET 태그 = '${params.tags}'
                        WHERE 실행파일 = '${params.exe}'
                    `;

                    //console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            resolve(result);
                        })
                        .catch(function (error) {
                            params = null
                            reject(error);
                        })
                } catch (error) {
                    reject(error);
                }
            })
        }

        function UpdateFeedbackService(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;

                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_서비스
                        SET 만족도 = '${params.value}'
                        WHERE 인덱스 = ${params.index}
                    `;

                    //console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            sQuery = null
                            resolve(result);
                        })
                        .catch(function (error) {
                            params = null
                            sQuery = null
                            reject(error);
                        })
                } catch (error) {
                    reject(error);
                }
            })
        }

        function UpdateDevServiceInfo(req) {
            return new Promise(function (resolve, reject) {
                var params = req.body
                sQuery = `
                    UPDATE ${CONSTS.DB_NEOAS}.N_서비스DEV
                    SET ${params.field} = '${params.data}'
                    WHERE 서비스ID = ${params.index}
                `;
                try {
                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            sQuery = null
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            params = null
                            sQuery = null
                            reject(error);
                        });
                } catch (error) {
                    reject(error)
                }
            })
        }

        return {
            Service: UpdateService,
            ServicePart: UpdateServicePart,
            ServiceTag: UpdateServiceTag,
            Tags: UpdateTag,
            Cancel: CancelService,
            FeedbackService: UpdateFeedbackService,
            DevServiceInfo: UpdateDevServiceInfo
        }

    })();

    var cDelete = (function () {
        function DeleteReply(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        -- AS 리플 삭제
                        Delete From ${CONSTS.DB_NEOAS}.N_서비스리플
                        Where 인덱스 = ${params.index};
                    `;

                    console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            sQuery = null
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            params = null
                            sQuery = null
                            reject(error);
                        })

                } catch (error) {
                    reject(error);
                }
            });
        }

        function DeleteAwayFromService(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body
                    sQuery = `
                        Delete From ${CONSTS.DB_NEOAS}.N_서비스로그
                        WHERE 서비스ID = ${params.index}
                    `
                    _database.Execute(sQuery)
                        .then(function (result) {
                            params = null
                            sQuery = null
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            params = null
                            sQuery = null
                            reject(error);
                        });
                } catch (error) {
                    reject(error)
                }
            })
        }

        return {
            Reply: DeleteReply,
            AwayFromService: DeleteAwayFromService
        }
    })();

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    };
}

module.exports = service;
