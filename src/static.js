var CONSTS = require("./config").CONSTS;
var moment = require("moment");

var static = function (database) {
    var _database = database;
    var sQuery = "";

    var cFind = (function () {
        function GetServiceStatus(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    params.date = JSON.parse(params.date);

                    sQuery = `

                        SELECT C.작성자, M.USER_NAME AS 작성자명, M.USER_AREA AS 지사코드, COUNT(C.인덱스) AS 건수
                        FROM ${CONSTS.DB_NEOAS}.N_전화일지 AS C WITH(NOLOCK)
                        INNER JOIN NEO_COMPANY.NEO_COMPANY.DBO.NC_N_USER AS M WITH(NOLOCK)
                        ON C.작성자 = M.USER_ID
                        WHERE CONVERT(CHAR(10), C.처리일자, 120) BETWEEN '${params["date"]["start"]}' AND '${params["date"]["end"]}'
                        GROUP BY C.작성자, M.USER_NAME, M.USER_AREA;


                        SELECT V.작성자, M.USER_NAME AS 작성자명, M.USER_AREA AS 지사코드, COUNT(V.인덱스) AS 건수
                        FROM ${CONSTS.DB_NEOAS}.N_방문일지 AS V WITH(NOLOCK)
                        INNER JOIN NEO_COMPANY.NEO_COMPANY.DBO.NC_N_USER AS M WITH(NOLOCK)
                        ON V.작성자 = M.USER_ID
                        WHERE	CONVERT(CHAR(10), V.시작, 120) >= '${params["date"]["start"]}'
                            AND CONVERT(CHAR(10), V.종료, 120) <= '${params["date"]["end"]}'
                            AND ISNULL(V.실시작,'') <> ''
                            AND ISNULL(V.실종료,'') <> ''
                        GROUP BY V.작성자, M.USER_NAME, M.USER_AREA;

                        SELECT S.담당자 AS 담당자, M.USER_NAME AS 담당자명, COUNT(S.인덱스) AS 건수
                        FROM NEOAS.DBO.N_서비스 AS S WITH(NOLOCK)
                        INNER JOIN NEO_COMPANY.NEO_COMPANY.DBO.NC_N_USER AS M WITH(NOLOCK)
                        ON S.담당자 = M.USER_ID
                        WHERE ISNULL(S.담당자, 0) <> 0
                            AND CONVERT(CHAR(10), S.접수일자, 120) BETWEEN '${params["date"]["start"]}' AND '${params["date"]["end"]}'
                            AND ISNULL(S.상태,0) <> 5
                        GROUP BY S.담당자, M.USER_NAME;

                        SELECT S.지사코드, A.AREA_NAME AS 지사, COUNT(S.인덱스) AS 건수
                        FROM NEOAS.DBO.N_서비스 AS S WITH(NOLOCK)
                        INNER JOIN NEO_COMPANY.NEO_COMPANY.DBO.NC_N_AREA AS A WITH(NOLOCK)
                        ON S.지사코드 = A.AREA_ID
                        WHERE ISNULL(S.담당자, 0) = 0
                            AND CONVERT(CHAR(10), S.접수일자, 120) BETWEEN '${params["date"]["start"]}' AND '${params["date"]["end"]}'
                            AND ISNULL(S.상태,0) <> 5
                        GROUP BY S.지사코드, A.AREA_NAME;

                        SELECT S.담당자 AS 담당자, M.USER_NAME AS 담당자명,
                            SUM(CASE S.상태 WHEN 0 THEN 1 ELSE 0 END) AS 접수,
                            SUM(CASE S.상태 WHEN 1 THEN 1 ELSE 0 END) AS 공유,
                            SUM(CASE S.상태 WHEN 2 THEN 1 ELSE 0 END) AS 처리,
                            SUM(CASE S.상태 WHEN 3 THEN 1 ELSE 0 END) AS 보류,
                            SUM(CASE S.상태 WHEN 4 THEN 1 ELSE 0 END) AS 완료,
                            SUM(CASE S.상태 WHEN 5 THEN 1 ELSE 0 END) AS 취소,
                            SUM(CASE S.상태 WHEN 6 THEN 1 ELSE 0 END) AS 피드백
                        FROM NEOAS.DBO.N_서비스 AS S WITH(NOLOCK)
                        INNER JOIN NEO_COMPANY.NEO_COMPANY.DBO.NC_N_USER AS M WITH(NOLOCK)
                        ON S.담당자 = M.USER_ID
                        WHERE ISNULL(S.담당자, 0) <> 0
                            AND CONVERT(CHAR(10), S.접수일자, 120) BETWEEN '${params["date"]["start"]}' AND '${params["date"]["end"]}'
                        GROUP BY S.담당자, M.USER_NAME;

                        SELECT S.지사코드, A.AREA_NAME AS 지사,
                            SUM(CASE S.상태 WHEN 0 THEN 1 ELSE 0 END) AS 접수,
                            SUM(CASE S.상태 WHEN 1 THEN 1 ELSE 0 END) AS 공유,
                            SUM(CASE S.상태 WHEN 2 THEN 1 ELSE 0 END) AS 처리,
                            SUM(CASE S.상태 WHEN 3 THEN 1 ELSE 0 END) AS 보류,
                            SUM(CASE S.상태 WHEN 4 THEN 1 ELSE 0 END) AS 완료,
                            SUM(CASE S.상태 WHEN 5 THEN 1 ELSE 0 END) AS 취소,
                            SUM(CASE S.상태 WHEN 6 THEN 1 ELSE 0 END) AS 피드백
                        FROM NEOAS.DBO.N_서비스 AS S WITH(NOLOCK)
                        INNER JOIN NEO_COMPANY.NEO_COMPANY.DBO.NC_N_AREA AS A WITH(NOLOCK)
                        ON S.지사코드 = A.AREA_ID
                        WHERE ISNULL(S.담당자, 0) = 0
                            AND CONVERT(CHAR(10), S.접수일자, 120) BETWEEN '${params["date"]["start"]}' AND '${params["date"]["end"]}'
                        GROUP BY S.지사코드, A.AREA_NAME
                    `;

                    console.log(sQuery);

                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            return ParseServiceStatus(result.recordsets);
                        })
                        .then(function (parsedData) {
                            resolve(parsedData);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function ParseServiceStatus(data) {
            return new Promise(function (resolve, reject) {
                try {
                    // console.log(data);
                    var _data = {
                        c: data[0], //전화
                        v: data[1], // 방문
                        sp: data[2], //서비스 본사
                        sa: data[3], //서비스 지사
                        sdp: data[4], // 서비스 상세 본사
                        sda: data[5] // 서비스 상세 지사
                    };

                    var parsedData = [];
                    var obj = {},
                        index;

                    Object.keys(_data).forEach(function (key) {
                        _data[key].forEach(function (element) {
                            obj = {
                                id: 0,
                                name: "",
                                area: "",
                                service: 0,
                                call: 0,
                                visit: 0,
                                r: 0,
                                s: 0,
                                p: 0,
                                h: 0,
                                d: 0,
                                c: 0,
                                f: 0
                            };
                            index = -1;
                            //작성자가 있으면
                            if (element.hasOwnProperty("작성자")) {
                                //본사직원이면
                                if (
                                    element["지사코드"].match(
                                        /0000|0030|0031|0026/gim
                                    )
                                ) {
                                    parsedData.filter(function (item, pos) {
                                        if (
                                            parseInt(item.id) ===
                                            parseInt(element["작성자"])
                                        ) {
                                            index = pos;
                                            return true;
                                        }
                                    });

                                    if (index === -1) {
                                        obj.id = element["작성자"];
                                        obj.name = element["작성자명"];
                                        switch (key) {
                                            case "c":
                                                obj.call += element["건수"];
                                                break;
                                            case "v":
                                                obj.visit += element["건수"];
                                                break;
                                        }
                                        parsedData.push(obj);
                                        // uniqName.push(element['작성자']);
                                    } else {
                                        switch (key) {
                                            case "c":
                                                parsedData[index].call +=
                                                    element["건수"];
                                                break;
                                            case "v":
                                                parsedData[index].visit +=
                                                    element["건수"];
                                                break;
                                        }
                                    }
                                } else {
                                    parsedData.filter(function (item, pos) {
                                        if (item.area === element["지사코드"]) {
                                            index = pos;
                                            return true;
                                        }
                                    });
                                    if (index === -1) {
                                        obj.area = element["지사코드"];
                                        obj.name = "";
                                        switch (key) {
                                            case "c":
                                                obj.call += element["건수"];
                                                break;
                                            case "v":
                                                obj.visit += element["건수"];
                                                break;
                                        }
                                        parsedData.push(obj);
                                    } else {
                                        switch (key) {
                                            case "c":
                                                parsedData[index].call +=
                                                    element["건수"];
                                                break;
                                            case "v":
                                                parsedData[index].visit +=
                                                    element["건수"];
                                                break;
                                        }
                                    }
                                }

                                //담당자가 있으면
                            } else if (element.hasOwnProperty("담당자")) {
                                parsedData.filter(function (item, pos) {
                                    if (
                                        parseInt(item.id) ===
                                        parseInt(element["담당자"])
                                    ) {
                                        index = pos;
                                        return true;
                                    }
                                });

                                if (index === -1) {
                                    obj.id = element["담당자"];
                                    obj.name = element["담당자명"];

                                    switch (key) {
                                        case "sp":
                                            obj.service += element["건수"];
                                            break;
                                        case "sdp":
                                            obj.r += element["접수"];
                                            obj.s += element["공유"];
                                            obj.p += element["처리"];
                                            obj.h += element["보류"];
                                            obj.d += element["완료"];
                                            obj.c += element["취소"];
                                            obj.f += element["피드백"];
                                            break;
                                    }
                                    parsedData.push(obj);
                                } else {
                                    switch (key) {
                                        case "sp":
                                            parsedData[index].service +=
                                                element["건수"];
                                            break;
                                        case "sdp":
                                            parsedData[index].r +=
                                                element["접수"];
                                            parsedData[index].s +=
                                                element["공유"];
                                            parsedData[index].p +=
                                                element["처리"];
                                            parsedData[index].h +=
                                                element["보류"];
                                            parsedData[index].d +=
                                                element["완료"];
                                            parsedData[index].c +=
                                                element["취소"];
                                            parsedData[index].f +=
                                                element["피드백"];
                                            break;
                                    }
                                }
                            } else if (element.hasOwnProperty("지사코드")) {
                                parsedData.filter(function (item, pos) {
                                    if (item.area === element["지사코드"]) {
                                        index = pos;
                                        return true;
                                    }
                                });
                                if (index === -1) {
                                    obj.area = element["지사코드"];
                                    obj.name = element["지사"];

                                    switch (key) {
                                        case "sa":
                                            obj.service += element["건수"];
                                            break;
                                        case "sda":
                                            obj.r += element["접수"];
                                            obj.s += element["공유"];
                                            obj.p += element["처리"];
                                            obj.h += element["보류"];
                                            obj.d += element["완료"];
                                            obj.c += element["취소"];
                                            obj.f += element["피드백"];
                                            break;
                                    }
                                    parsedData.push(obj);
                                } else {
                                    parsedData[index].name = element["지사"];
                                    switch (key) {
                                        case "sa":
                                            parsedData[index].service +=
                                                element["건수"];
                                            break;
                                        case "sda":
                                            parsedData[index].r +=
                                                element["접수"];
                                            parsedData[index].s +=
                                                element["공유"];
                                            parsedData[index].p +=
                                                element["처리"];
                                            parsedData[index].h +=
                                                element["보류"];
                                            parsedData[index].d +=
                                                element["완료"];
                                            parsedData[index].c +=
                                                element["취소"];
                                            parsedData[index].f +=
                                                element["피드백"];
                                            break;
                                    }
                                }
                            }
                        }, this);
                    });

                    resolve(parsedData);
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetProgramStatic(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;

                    sQuery = `

                        Select S.프로그램, E.코드이름 AS '프로그램명', CONVERT(VARCHAR(7), S.접수일자, 120) AS 접수일자, COUNT(*) AS 'A/S'
                        FROM NEOAS..N_서비스 AS S WITH(NOLOCK)
                        INNER JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '프로그램') AS E
                        ON E.데이터1 = S.프로그램
                        WHERE S.상태 <> ${CONSTS.SERVICE_STATUS.CANCEL}
                        AND S.접수일자 Between '${params["year"]}-01-01' AND '${params["year"]}-12-31'
                        GROUP BY S.프로그램, E.코드이름, CONVERT(VARCHAR(7), S.접수일자, 120)
                        ORDER BY CONVERT(VARCHAR(7), S.접수일자, 120);

                    `;

                    console.log(sQuery);

                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            console.log(error);
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetAreaStatic() {
            return new Promise(function (resolve, reject) {
                try {
                    var this_start = moment()
                        .startOf("year")
                        .format("YYYY-MM-DD"),
                        this_end = moment()
                            .endOf("year")
                            .format("YYYY-MM-DD"),
                        prev_start = moment()
                            .subtract(1, "year")
                            .startOf("year")
                            .format("YYYY-MM-DD"),
                        prev_end = moment()
                            .subtract(1, "year")
                            .endOf("year")
                            .format("YYYY-MM-DD");

                    sQuery = `
                        Select T.지사코드, T.지사명, SUM(T.건수) AS 건수
                        From (
                            Select CASE WHEN S.지사코드 IN ( '0000', '0030', '0031', '0026' ) THEN '0000' ELSE S.지사코드 END AS 지사코드,
                                    CASE WHEN S.지사코드 IN ( '0000', '0030', '0031', '0026' ) THEN '본사' ELSE A.AREA_NAME END AS 지사명,
                                    Count(*) AS 건수
                            From NEOAS..N_서비스 AS S WITH(NOLOCK)
                            Inner Join ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A WITH(NOLOCK)
                            On A.AREA_ID = S.지사코드
                            Where S.상태 <> ${CONSTS.SERVICE_STATUS.CANCEL}
                            AND S.접수일자 BETWEEN '${prev_start}' AND '${prev_end}'
                            Group By S.지사코드, A.AREA_NAME
                        ) AS T
                        Group By T.지사코드, T.지사명
                        --Order By T.건수;

                        Select T.지사코드, T.지사명, SUM(T.건수) AS 건수
                        From (
                            Select CASE WHEN S.지사코드 IN ( '0000', '0030', '0031', '0026' ) THEN '0000' ELSE S.지사코드 END AS 지사코드,
                                    CASE WHEN S.지사코드 IN ( '0000', '0030', '0031', '0026' ) THEN '본사' ELSE A.AREA_NAME END AS 지사명,
                                    Count(*) AS 건수
                            From NEOAS..N_서비스 AS S WITH(NOLOCK)
                            Inner Join ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A WITH(NOLOCK)
                            On A.AREA_ID = S.지사코드
                            Where S.상태 <> ${CONSTS.SERVICE_STATUS.CANCEL}
                            AND S.접수일자 BETWEEN '${this_start}' AND '${this_end}'
                            Group By S.지사코드, A.AREA_NAME
                        ) AS T
                        Group By T.지사코드, T.지사명
                        --Order By T.건수;
                    `;
                    console.log(sQuery);

                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result.recordsets);
                        })
                        .catch(function (error) {
                            console.log(error);
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetExeStatic(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    if (params.hasOwnProperty("date")) {
                        params.date = JSON.parse(params.date);
                    }
                    var area = "";
                    if (params["area"] == 1) {
                        area +=
                            "AND 지사코드 IN ('0000', '0030', '0031', '0026')";
                    }
                    sQuery = `
                        SELECT
                            S.프로그램, P.프로그램명,
                            SUM(CASE S.실행파일 WHEN '데스크' THEN 1 ELSE 0 END) AS '데스크',
                            ISNULL(AVG(CASE WHEN S.실행파일 = '데스크' AND S.상태 > 0 THEN
								DATEDIFF(s, S.접수일자, S.확인일자) END), 0) AS '데스크확인T',
							ISNULL(AVG(CASE WHEN S.실행파일 = '데스크' AND S.상태 > 0 THEN
                                DATEDIFF(s, S.접수일자, S.완료일자) END), 0) AS '데스크완료T',

                            SUM(CASE S.실행파일 WHEN '입원수납' THEN 1 ELSE 0 END) AS '입원수납',
                            ISNULL(AVG(CASE WHEN S.실행파일 = '입원수납' AND S.상태 > 0 THEN
								DATEDIFF(s, S.접수일자, S.확인일자) END), 0) AS '입원수납확인T',
							ISNULL(AVG(CASE WHEN S.실행파일 = '입원수납' AND S.상태 > 0 THEN
                                DATEDIFF(s, S.접수일자, S.완료일자) END), 0) AS '입원수납완료T',

                            SUM(CASE S.실행파일 WHEN '청구심사' THEN 1 ELSE 0 END) AS '청구심사',
                            ISNULL(AVG(CASE WHEN S.실행파일 = '청구심사' AND S.상태 > 0 THEN
								DATEDIFF(s, S.접수일자, S.확인일자) END), 0) AS '청구심사확인T',
							ISNULL(AVG(CASE WHEN S.실행파일 = '청구심사' AND S.상태 > 0 THEN
                                DATEDIFF(s, S.접수일자, S.완료일자) END), 0) AS '청구심사완료T',

                            SUM(CASE S.실행파일 WHEN '진료실' THEN 1 ELSE 0 END) AS '진료실',
                            ISNULL(AVG(CASE WHEN S.실행파일 = '진료실' AND S.상태 > 0 THEN
								DATEDIFF(s, S.접수일자, S.확인일자) END), 0) AS '진료실확인T',
							ISNULL(AVG(CASE WHEN S.실행파일 = '진료실' AND S.상태 > 0 THEN
                                DATEDIFF(s, S.접수일자, S.완료일자) END), 0) AS '진료실완료T',

                            SUM(CASE S.실행파일 WHEN '병동' THEN 1 ELSE 0 END) AS '병동',
                            SUM(CASE S.실행파일 WHEN '진료지원' THEN 1 ELSE 0 END) AS '진료지원',
                            SUM(CASE S.실행파일 WHEN '병원관리' THEN 1 ELSE 0 END) AS '병원관리',
                            SUM(CASE S.실행파일 WHEN '문서관리' THEN 1 ELSE 0 END) AS '문서관리',
                            SUM(CASE S.실행파일 WHEN '통계' THEN 1 ELSE 0 END) AS '통계',
                            SUM(CASE S.실행파일 WHEN '메인' THEN 1 ELSE 0 END) AS '메인',
                            SUM(CASE S.실행파일 WHEN '부가서비스' THEN 1 ELSE 0 END) AS '부가서비스',
                            SUM(CASE S.실행파일 WHEN '기타' THEN 1 ELSE 0 END) AS '기타',
                            COUNT(*) AS 합계
                        FROM (
                            SELECT
                                ISNULL(실행파일, '기타') AS 실행파일, 프로그램, 접수일자,
                                확인일자, 완료일자, 상태
                            FROM NEOAS.DBO.N_서비스 WITH(NOLOCK)
                            WHERE	상태 NOT IN (0, 5)
                            AND (
                                CONVERT(CHAR(18), 접수일자, 120) BETWEEN '${params["date"]["start"]} 09:00:00' AND '${params["date"]["end"]} 17:59:59'
                            )
                            ${area}
                        ) AS S
                        INNER JOIN ( SELECT 데이터1, 코드이름 AS 프로그램명 FROM NEO_COMPANY.NEO_COMPANY.DBO.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '프로그램' ) AS P
                        ON S.프로그램 = P.데이터1
                        WHERE 1 = 1
                        AND SUBSTRING(CONVERT(CHAR(18), 접수일자, 120), 12, 2) <> '13'
                        GROUP BY  S.프로그램, P.프로그램명
                        ORDER BY S.프로그램 DESC;

                        SELECT
                            S.프로그램, P.프로그램명, S.처리구분,
                            SUM(CASE S.실행파일 WHEN '데스크' THEN 1 ELSE 0 END) AS '데스크',
                            SUM(CASE S.실행파일 WHEN '입원수납' THEN 1 ELSE 0 END) AS '입원수납',
                            SUM(CASE S.실행파일 WHEN '청구심사' THEN 1 ELSE 0 END) AS '청구심사',
                            SUM(CASE S.실행파일 WHEN '진료실' THEN 1 ELSE 0 END) AS '진료실',
                            SUM(CASE S.실행파일 WHEN '병동' THEN 1 ELSE 0 END) AS '병동',
                            SUM(CASE S.실행파일 WHEN '진료지원' THEN 1 ELSE 0 END) AS '진료지원',
                            SUM(CASE S.실행파일 WHEN '병원관리' THEN 1 ELSE 0 END) AS '병원관리',
                            SUM(CASE S.실행파일 WHEN '문서관리' THEN 1 ELSE 0 END) AS '문서관리',
                            SUM(CASE S.실행파일 WHEN '통계' THEN 1 ELSE 0 END) AS '통계',
                            SUM(CASE S.실행파일 WHEN '메인' THEN 1 ELSE 0 END) AS '메인',
                            SUM(CASE S.실행파일 WHEN '부가서비스' THEN 1 ELSE 0 END) AS '부가서비스',
                            SUM(CASE S.실행파일 WHEN '기타' THEN 1 ELSE 0 END) AS '기타',
                            COUNT(*) AS 합계
                        FROM (
                            SELECT ISNULL(실행파일, '기타') AS 실행파일, 프로그램, ISNULL(처리구분, 0) AS 처리구분, 접수일자
                            FROM NEOAS.DBO.N_서비스 WITH(NOLOCK)
                            WHERE	상태 NOT IN (0, 5)
                            --AND     CONVERT(CHAR(10), 접수일자, 120) BETWEEN '${params["date"]["start"]}' AND '${params["date"]["end"]}'
                            AND       CONVERT(CHAR(18), 접수일자, 120) BETWEEN '${params["date"]["start"]} 09:00:00' AND '${params["date"]["end"]} 17:59:59'
                            ${area}
                        ) AS S
                        INNER JOIN ( SELECT 데이터1, 코드이름 AS 프로그램명 FROM NEO_COMPANY.NEO_COMPANY.DBO.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '프로그램' ) AS P
                        ON S.프로그램 = P.데이터1
                        WHERE 1 = 1
                        AND SUBSTRING(CONVERT(CHAR(18), 접수일자, 120), 12, 2) <> '13'
                        GROUP BY  S.프로그램, P.프로그램명, S.처리구분
                        ORDER BY S.프로그램 DESC;
                    `;
                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordsets);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetExeDetail(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    var area = "";
                    if (params["area"] == 1) {
                        area +=
                            "AND 지사코드 IN ('0000', '0030', '0031', '0026')";
                    }
                    if (params.hasOwnProperty("date")) {
                        params.date = JSON.parse(params.date);
                    }

                    sQuery = `
                        SELECT	S.인덱스, S.기관코드, H.USER_ID, S.기관명칭, S.프로그램, P.프로그램명, S.실행파일, ISNULL(S.처리구분, 0) AS 처리구분, S.완료자, M.USER_NAME AS 완료자명,
                                S.문의내용, S.확인내용, S.처리내용
                        FROM	NEOAS.DBO.N_서비스 AS S WITH(NOLOCK)
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M WITH(NOLOCK)
                        ON		S.완료자 = M.USER_ID
                        INNER JOIN ( SELECT 데이터1, 코드이름 AS 프로그램명 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '프로그램' ) AS P
                        ON      S.프로그램 = P.데이터1
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H WITH(NOLOCK)
                        ON      S.기관코드 = H.USER_MED_ID
                        WHERE	1 = 1
                        AND		S.실행파일 = '${params["exe"]}'
                        AND     S.상태 NOT IN (0, 5)
                        AND     CONVERT(CHAR(10), S.접수일자, 120) BETWEEN '${params["date"]["start"]}' AND '${params["date"]["end"]}'
                        ${area}
                    `;

                    if (params.program !== "") {
                        sQuery += `
                            AND S.프로그램 = ${params["program"]}
                        `;
                    }

                    if (params.treat !== "") {
                        sQuery += `
                            AND ISNULL(S.처리구분, 0) = ${params["treat"]}
                        `;
                    }

                    sQuery += `
                        ORDER BY S.프로그램, ISNULL(S.처리구분, 0)
                    `;

                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetServiceFee(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;


                    sQuery = `
                        SELECT	A.인덱스, A.기관코드, A.기관명칭, A.지사코드, J.AREA_NAME AS 지사, A.접수자, ISNULL(H.USER_ID, 0) AS USER_ID,
                                CONVERT(CHAR(19), A.접수일자, 120) AS 접수일자,
                                CONVERT(CHAR(19), A.확인일자, 120) AS 확인일자,
                                CONVERT(CHAR(19), A.완료일자, 120) AS 완료일자,
                                A.확인자,
                                C.USER_NAME AS 확인자명, C.USER_AREA AS 확인자지사,
                                ISNULL(A.공유자, '') AS 공유자,
                                ISNULL(S.USER_NAME, '') AS 공유자명, S.USER_AREA AS 공유자지사,
                                A.완료자,
                                D.USER_NAME AS 완료자명, D.USER_AREA AS 완료자지사, DP.부서,
                                ISNULL(A.응급, 0) AS 응급,
                                ISNULL(A.본사, 0) AS 본사,
                                0 AS '수수료',
                                0 AS '확인수수료',
                                0 AS '완료수수료',
                                ISNULL(A.이의, 0) AS 이의,
                                ISNULL(FC.정산일, '') AS 정산,
                                ISNULL(FC.타입, 2) AS 정산타입
                                --CASE ISNULL(A.응급, 0) WHEN 0 THEN '' ELSE '응급' END AS 응급,

                                --CASE WHEN ISNULL(A.응급, 0) = 1 AND ISNULL(A.본사, 0) = 0 THEN '5000'
                                --    WHEN ISNULL(A.응급, 0) = 0 AND ISNULL(A.본사, 0) = 0 THEN '3000'
                                --    ELSE '' END 수수료

                        FROM NEOAS.DBO.N_서비스 AS A WITH(NOLOCK)
                        LEFT JOIN NEO_COMPANY.NEO_COMPANY.DBO.NC_N_USER AS C WITH(NOLOCK)
                            ON A.확인자 = C.USER_ID
                        LEFT JOIN NEO_COMPANY.NEO_COMPANY.DBO.NC_N_USER AS S WITH(NOLOCK)
                            ON A.공유자 = S.USER_ID
                        LEFT JOIN NEO_COMPANY.NEO_COMPANY.DBO.NC_N_USER AS D WITH(NOLOCK)
                            ON A.완료자 = D.USER_ID
                        INNER JOIN NEO_COMPANY.NEO_COMPANY.DBO.NC_N_AREA AS J WITH(NOLOCK)
                            ON A.지사코드 = J.AREA_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H WITH(NOLOCK)
                            ON A.기관코드 = H.USER_MED_ID
                        LEFT JOIN (SELECT 데이터1 AS 부서 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '부서코드') AS DP
                            ON DP.부서 = D.USER_POSITION_ID
                        LEFT JOIN ${CONSTS.DB_NEOAS}.N_수수료정산 AS FC WITH(NOLOCK)
                            --ON CONVERT(CHAR(7), A.완료일자, 120) = FC.정산일
                            ON (
                                    CONVERT(CHAR(7), A.완료일자, 120) = FC.정산일
                                OR  CONVERT(CHAR(7), A.확인일자, 120) = FC.정산일
                                )
                        WHERE	1 = 1
                                --AND     A.지사코드 NOT IN ('0000', '0030', '0031', '0026')
                                AND		A.상태 IN (4, 6, 7)
                                --AND		A.공유자 <> A.완료자
                                --AND		S.USER_AREA <> D.USER_AREA
                                --AND     A.지사코드 <> D.USER_AREA
                                --AND ( CONVERT(CHAR(10), A.완료일자, 120) BETWEEN '${params.date.start}' AND '${params.date.end}' OR CONVERT(CHAR(10), A.확인일자, 120) BETWEEN '${params.date.start}' AND '${params.date.end}')
                                --AND  CONVERT(CHAR(7), A.완료일자, 120)  = '${params.date}'
                                AND ( CONVERT(CHAR(7), A.완료일자, 120) = '${params.date}' OR CONVERT(CHAR(7), A.확인일자, 120) = '${params.date}')
                                --AND ISNULL(A.본사, 0) = 0
                        ORDER BY A.지사코드, A.공유자, A.완료자

                    `;

                    // if (params.month) {
                    //     sQuery = sQuery.replace(/{{DATERANGE}}/gim, `AND CONVERT(CHAR(7), A.완료일자, 120) = '${params['month']}'`);
                    // } else if (params.date) {
                    //     sQuery = sQuery.replace(/{{DATERANGE}}/gim, `AND CONVERT(CHAR(10), A.접수일자, 120) = '${params['date']}' AND CONVERT(CHAR(10), A.완료일자, 120) = '${params['date']}'`);
                    // }

                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {

                            var data = result.recordset
                            data = data.filter(function (item) {
                                // console.log(item);
                                return item['정산'].trim() === '' || item['정산'].trim() === params.date
                            })

                            resolve(data);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetServiceFeeLock(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        SELECT *
                        FROM ${CONSTS.DB_NEOAS}.N_수수료정산 WITH(NOLOCK)
                        WHERE 정산일 = '${params.endMonth}'
                    `;
                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            console.log(result);
                            resolve(result.rowsAffected[0] > 0);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetServiceFee2020(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;


                    sQuery = `
                        IF EXISTS ( SELECT * FROM ${CONSTS.DB_NEOAS}.N_수수료정산2020 WHERE 정산일 = '${params.date}')
                            BEGIN
                                SELECT	A.인덱스, A.기관코드, A.기관명칭, A.지사코드, J.AREA_NAME AS 지사, A.접수자, A.거래처ID AS USER_ID,
                                        CONVERT(CHAR(19), A.접수일자, 120) AS 접수일자,
                                        CONVERT(CHAR(19), A.공유일자, 120) AS 공유일자,
                                        CONVERT(CHAR(19), A.처리일자, 120) AS 처리일자,
                                        CONVERT(CHAR(19), A.완료일자, 120) AS 완료일자,                                        
                                        ISNULL(A.공유자, '') AS 공유자,
                                        A.완료자, 
                                        ISNULL(A.응급, 0) AS 응급,
                                        ISNULL(A.본사, 0) AS 본사,
                                        0 AS '수수료',                                        
                                        ISNULL(A.이의, 0) AS 이의,
                                        ISNULL(A.마감, '') AS 마감
                                FROM NEOAS.DBO.N_서비스 AS A                                
                                INNER JOIN NEO_COMPANY.NEO_COMPANY.DBO.NC_N_AREA AS J
                                    ON A.지사코드 = J.AREA_ID                                
                                WHERE	1 = 1
                                        AND A.마감 = '${params.date}'
                                ORDER BY A.지사코드, A.공유자, A.완료자
                            END
                        ELSE
                            BEGIN
                                SELECT	A.인덱스, A.기관코드, A.기관명칭, A.지사코드, J.AREA_NAME AS 지사, A.접수자, A.거래처ID AS USER_ID,
                                        CONVERT(CHAR(19), A.접수일자, 120) AS 접수일자,
                                        CONVERT(CHAR(19), A.공유일자, 120) AS 공유일자,
                                        CONVERT(CHAR(19), A.처리일자, 120) AS 처리일자,
                                        CONVERT(CHAR(19), A.완료일자, 120) AS 완료일자,                                        
                                        ISNULL(A.공유자, '') AS 공유자,
                                        A.완료자, 
                                        ISNULL(A.응급, 0) AS 응급,
                                        ISNULL(A.본사, 0) AS 본사,
                                        0 AS '수수료',                                        
                                        ISNULL(A.이의, 0) AS 이의,
                                        ISNULL(A.마감, '') AS 마감
                                FROM NEOAS.DBO.N_서비스 AS A                                
                                INNER JOIN NEO_COMPANY.NEO_COMPANY.DBO.NC_N_AREA AS J
                                    ON A.지사코드 = J.AREA_ID                                                                
                                WHERE	1 = 1
                                        AND		A.상태 IN (${CONSTS.SERVICE_STATUS.DONE} , ${CONSTS.SERVICE_STATUS.FEEDBACK})
                                        AND  CONVERT(CHAR(7), A.완료일자, 120)  = '${params.date}'                                                                          
                                ORDER BY A.지사코드, A.공유자, A.완료자
                            END
                    `;

                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            if (result.recordset[0]['마감'] == "") {
                                resolve(result.recordset.filter(item => {
                                    // console.log(moment(item['완료일자'].substr(0, 10)));
                                    return moment(item['완료일자'].substr(0, 10)).diff(moment(item['접수일자'].substr(0, 10)), 'days') <= 30
                                }));
                            }else {
                                resolve(result.recordset)
                            }
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetServiceFeeLock2020(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        SELECT *
                        FROM ${CONSTS.DB_NEOAS}.N_수수료정산2020
                        WHERE 정산일 = '${params.endMonth}'
                    `;
                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            console.log(result);
                            resolve(result.rowsAffected[0] > 0);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetAcceptDays(req) {
            return new Promise(function (resolve, reject) {
                try {
                    const startDate = moment()
                        .subtract(1, 'year')
                        .format('YYYY-MM-DD')
                    const endDate = moment().format('YYYY-MM-DD')
                    sQuery = `
                        SELECT CONVERT(CHAR(19), 접수일자, 120) AS 접수일자
                        FROM ${CONSTS.DB_NEOAS}.N_서비스 WITH(NOLOCK)
                        WHERE 상태 <> 5
                        AND CONVERT(CHAR(10), 접수일자, 120) BETWEEN '${startDate}' AND '${endDate}'
                    `;
                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            var result = result.recordset;
                            result = result.map(function (accept) {
                                return {
                                    접수일자: accept["접수일자"],
                                    요일: moment(accept["접수일자"]).format(
                                        "dddd"
                                    ),
                                    시간: moment(accept["접수일자"]).format(
                                        "HH"
                                    )
                                };
                            });

                            resolve(result);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetASFinderUsage(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    params.date = JSON.parse(params.date);

                    sQuery = `
                        SELECT F.USER_ID, U.USER_NAME, COUNT(*) AS 건수
                        FROM ${CONSTS.DB_NEOAS}.N_서비스LIKE AS F WITH(NOLOCK)
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS U WITH(NOLOCK)
                        ON F.USER_ID = U.USER_ID
                        WHERE CONVERT(CHAR(10), F.선택일자, 120) BETWEEN '${params.date.start}' AND '${params.date.end}'
                        GROUP BY F.USER_ID, U.USER_NAME
                    `;
                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            var result = result.recordset;

                            resolve(result);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetCategorys(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    params.date = JSON.parse(params.date);

                    sQuery = `
                        SELECT *, COUNT(*) AS 발생 FROM (
                            SELECT P.프로그램명,
                                    CASE WHEN 실행파일 = '' THEN '기타' ELSE ISNULL(실행파일, '기타') END  AS 실행파일,
                                    CASE WHEN 실행메뉴 = '' THEN '기타' ELSE ISNULL(실행메뉴, '기타') END  AS 대분류,
                                    CASE WHEN 세부화면 = '' THEN '기타' ELSE ISNULL(세부화면, '기타') END  AS 중분류
                            FROM ${CONSTS.DB_NEOAS}.N_서비스 AS N WITH(NOLOCK)
                            INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H WITH(NOLOCK)
                            ON N.기관코드 = H.USER_MED_ID
                            INNER JOIN ( SELECT 데이터1, 코드이름 AS 프로그램명 FROM ${CONSTS.DB_NEOCOMPANY
                        }.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '프로그램' ) AS P
                            ON      N.프로그램 = P.데이터1
                            WHERE CONVERT(CHAR(10), N.접수일자, 120) BETWEEN '${params.date.start
                        }' AND '${params.date.end}'
                            ${params.program
                            ? "AND N.프로그램 = " + params.program
                            : ""
                        }
                            ${params.exe
                            ? "AND 실행파일 = '" + params.exe + "' "
                            : ""
                        }
                            AND ISNULL(N.상태, 0) <> 5
                        ) AS T
                        GROUP BY T.프로그램명, T.실행파일, T.대분류, T.중분류
                        ORDER BY 발생 DESC;

                        SELECT *
                        FROM ${CONSTS.DB_NEOAS}.N_서비스 AS N WITH(NOLOCK)
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H WITH(NOLOCK)
                        ON N.기관코드 = H.USER_MED_ID
                        INNER JOIN ( SELECT 데이터1, 코드이름 AS 프로그램명 FROM ${CONSTS.DB_NEOCOMPANY
                        }.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '프로그램' ) AS P
                        ON      N.프로그램 = P.데이터1
                        WHERE CONVERT(CHAR(10), N.접수일자, 120) BETWEEN '${params.date.start
                        }' AND '${params.date.end}'
                        ${params.program
                            ? "AND N.프로그램 = " + params.program
                            : ""
                        }
                        ${params.exe
                            ? "AND 실행파일 = '" + params.exe + "' "
                            : ""
                        }
                        AND ISNULL(N.상태, 0) <> 5
                    `;
                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordsets);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetFinderMenu(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    params.date =
                        typeof params.date == "string"
                            ? JSON.parse(params.date)
                            : params.date;

                    sQuery = `
                        SELECT 실행메뉴, COUNT(*) AS 채택수
                        FROM ${CONSTS.DB_NEOAS}.N_서비스 A WITH(NOLOCK)
                        INNER JOIN ${CONSTS.DB_NEOAS}.N_서비스LIKE B WITH(NOLOCK)
                        ON A.인덱스 = B.서비스ID
                        INNER JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY
                        }.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '프로그램' ) AS P
                        ON A.프로그램 = P.데이터1
                        WHERE 1 = 1
                        {프로그램}                         
                        AND   ISNULL(실행파일, '') IN ('${params.exe}')
                        AND   ISNULL(실행메뉴, '') <> ''
                        AND   ISNULL(세부화면, '') <> ''
                        AND   CONVERT(CHAR(10), B.선택일자, 120) BETWEEN '${params.date.start
                        }' AND '${params.date.end}'
                        GROUP BY 실행메뉴
                        ORDER BY 2 DESC
                    `;

                    if (params.program) {
                        sQuery = sQuery.replace('{프로그램}',
                            (isNaN(params.program)
                                ? `AND P.코드이름 in ('${params.program}')`
                                : `AND A.프로그램 in ('${params.program}')`
                            ))
                    } else {
                        sQuery = sQuery.replace('{프로그램}', '')
                    }

                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetFinderBtn(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    params.date = JSON.parse(params.date);

                    sQuery = `
                        SELECT 세부화면, COUNT(*) AS 채택수
                        FROM ${CONSTS.DB_NEOAS}.N_서비스 A WITH(NOLOCK)
                        INNER JOIN ${CONSTS.DB_NEOAS}.N_서비스LIKE B WITH(NOLOCK)
                        ON A.인덱스 = B.서비스ID
                        INNER JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY
                        }.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '프로그램' ) AS P
                        ON A.프로그램 = P.데이터1
                        WHERE 1 = 1
                        {프로그램}                         
                        AND   ISNULL(실행파일, '') IN ('${params.exe}')
                        AND   ISNULL(실행메뉴, '') = '${params.menu}'
                        AND   ISNULL(세부화면, '') <> ''
                        AND   CONVERT(CHAR(10), B.선택일자, 120) BETWEEN '${params.date.start
                        }' AND '${params.date.end}'
                        GROUP BY 세부화면
                        ORDER BY 2 DESC
                    `;

                    if (params.program) {
                        sQuery = sQuery.replace('{프로그램}',
                            (isNaN(params.program)
                                ? `AND P.코드이름 in ('${params.program}')`
                                : `AND A.프로그램 in ('${params.program}')`
                            ))
                    } else {
                        sQuery = sQuery.replace('{프로그램}', '')
                    }

                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetFinderList(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    params.date = JSON.parse(params.date);

                    sQuery = `
                        SELECT
                            A.인덱스, A.기관코드, A.기관명칭, A.지사코드, A.프로그램, A.담당자, A.타입, A.상태,
                            A.연락처, A.접수자, CONVERT(CHAR(10), A.접수일자, 120) AS 접수일자,
                            A.응급, A.본사, A.실행파일, A.실행메뉴, A.세부화면, A.처리구분,
                            A.확인자, ISNULL(C.USER_NAME, '') AS 확인자명, ISNULL(CONVERT(CHAR(10), A.확인일자, 120), '') AS 확인일자,
                            A.공유자, ISNULL(S.USER_NAME, '') AS 공유자명, ISNULL(CONVERT(CHAR(10), A.공유일자, 120), '') AS 공유일자,
                            A.처리자, ISNULL(AP.USER_NAME, '') AS 처리자명, ISNULL(CONVERT(CHAR(10), A.처리일자, 120), '') AS 처리일자,
                            A.보류자, ISNULL(HD.USER_NAME, '') AS 보류자명, ISNULL(CONVERT(CHAR(10), A.보류일자, 120), '') AS 보류일자,
                            A.완료자, ISNULL(D.USER_NAME, '') AS 완료자명, ISNULL(CONVERT(CHAR(10), A.완료일자, 120), '') AS 완료일자,
                            A.피드백자, ISNULL(F.USER_NAME, '') AS 피드백자명, ISNULL(CONVERT(CHAR(10), A.피드백일자, 120), '') AS 피드백일자,
                            ISNULL(CONVERT(NVARCHAR(MAX), A.문의내용), '') AS 문의내용,
                            ISNULL(CONVERT(NVARCHAR(MAX), A.확인내용), '') AS 확인내용,
                            ISNULL(CONVERT(NVARCHAR(MAX), A.처리내용), '') AS 처리내용,
                            ISNULL(CONVERT(NVARCHAR(MAX), A.취소사유), '') AS 취소사유,
                            ISNULL(CONVERT(NVARCHAR(MAX), A.보류내용), '') AS 보류내용,
                            ISNULL(CONVERT(NVARCHAR(MAX), A.이미지), '') AS 이미지,
                            COUNT(*) AS 채택수
                        FROM ${CONSTS.DB_NEOAS}.N_서비스 A WITH(NOLOCK)
                        INNER JOIN ${CONSTS.DB_NEOAS}.N_서비스LIKE B WITH(NOLOCK)
                        ON A.인덱스 = B.서비스ID
                        INNER JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY
                        }.NC_N_CODE WITH(NOLOCK) WHERE 코드구분 = '프로그램' ) AS P
                        ON A.프로그램 = P.데이터1
                        Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS C WITH(NOLOCK) --확인
                        On ISNULL(A.확인자,0) = C.USER_ID
                        Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS S WITH(NOLOCK) --공유
                        On ISNULL(A.공유자,0) = S.USER_ID
                        Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS AP WITH(NOLOCK) --처리
                        On ISNULL(A.처리자,0) = AP.USER_ID
                        Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS D WITH(NOLOCK) --완료
                        On ISNULL(A.완료자,0) = D.USER_ID
                        Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS HD WITH(NOLOCK) --보류
                        On ISNULL(A.보류자,0) = HD.USER_ID
                        Left Join ${CONSTS.DB_NEOCOMPANY
                        }.NC_N_USER AS F WITH(NOLOCK) --피드백
                        On ISNULL(A.피드백자,0) = F.USER_ID
                        WHERE ${isNaN(params.program)
                            ? `P.코드이름 = '${params.program}'`
                            : `A.프로그램 = '${params.program}'`
                        }
                        AND   ISNULL(실행파일, '') = '${params.exe}'
                        AND   ISNULL(실행메뉴, '') = '${params.menu}'
                        AND   ISNULL(세부화면, '') = '${params.button}'
                        AND   CONVERT(CHAR(10), B.선택일자, 120) BETWEEN '${params.date.start
                        }' AND '${params.date.end}'
                        GROUP BY
                            A.인덱스, A.기관코드, A.기관명칭, A.지사코드, A.프로그램, A.담당자, A.타입, A.상태,
							A.연락처, A.접수자, A.접수일자,
							A.응급, A.본사, A.실행파일, A.실행메뉴, A.세부화면, A.처리구분,
							A.확인자, A.확인일자,
							A.공유자, A.공유일자,
							A.처리자, A.처리일자,
							A.보류자, A.보류일자,
							A.완료자, A.완료일자,
							A.피드백자, A.피드백일자,
							CONVERT(NVARCHAR(MAX), A.문의내용),
							CONVERT(NVARCHAR(MAX), A.확인내용),
							CONVERT(NVARCHAR(MAX), A.처리내용),
							CONVERT(NVARCHAR(MAX), A.취소사유),
							CONVERT(NVARCHAR(MAX), A.보류내용),
                            CONVERT(NVARCHAR(MAX), A.이미지),
                            C.USER_NAME, S.USER_NAME, AP.USER_NAME, HD.USER_NAME, D.USER_NAME, F.USER_NAME
                        ORDER BY 채택수 DESC, A.접수일자 DESC

                    `;
                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        // 서비스 공유건 전체 리스트
        function GetLabRawData(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    console.log(params);
                    params.date = JSON.parse(params.date);

                    sQuery = `
                        SELECT 인덱스, 상태, 프로그램, P.코드이름 AS 프로그램명, 실행파일, ISNULL(실행메뉴, '') AS 실행메뉴, ISNULL(세부화면, '') AS 세부화면,
                        ISNULL(CONVERT(CHAR(10), 공유일자, 120), '') AS 공유일자,
                        ISNULL(CONVERT(CHAR(10), 처리일자, 120), '') AS 처리일자,
                        ISNULL(CONVERT(CHAR(10), 보류일자, 120), '') AS 보류일자,
                        ISNULL(CONVERT(CHAR(10), 완료일자, 120), '') AS 완료일자,
                        ISNULL(CONVERT(CHAR(10), 피드백일자, 120), '') AS 피드백일자
                        FROM ${CONSTS.DB_NEOAS}.N_서비스 AS S
                        INNER JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '프로그램') AS P
                        ON S.프로그램 = P.데이터1
                        WHERE ISNULL(공유자, 0) > 0
                        AND 상태 <> ${CONSTS.SERVICE_STATUS.CANCEL}
                        AND CONVERT(CHAR(10), 접수일자, 120) BETWEEN '${params.date.start}' AND '${params.date.end}'
                    `;
                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function GetServiceCautionList(req) {
            return new Promise(function (resolve, reject) {
                try {
                    const params = req.query;
                    const thisDate = params.month + "-01";

                    sQuery = `
                        SELECT 
                            A.기관코드, A.기관명칭, A.상태, A.응급, A.실행파일, A.프로그램,
                            ISNULL(U.병원유형, 1) AS 병원유형, ISNULL(DATEDIFF(mm, SS.실가동일, GETDATE()), 4) AS 신규,
                            CONVERT(CHAR(19), A.접수일자, 120) AS 접수일자,
                            ISNULL(CONVERT(VARCHAR(19), A.완료일자, 120), '') AS 완료일자
                        FROM ${CONSTS.DB_NEOAS}.N_서비스 AS A WITH(NOLOCK)
                        LEFT JOIN (SELECT 기관코드, 병원유형 FROM ${CONSTS.DB_NEOAS}.N_병원특이사항 WITH(NOLOCK)) AS U
                            ON U.기관코드 = A.기관코드
                        LEFT JOIN (SELECT 요양기관코드, 실가동일 FROM ${CONSTS.DB_OCS}.SS_기관정보 WITH(NOLOCK)) AS SS
                            ON SS.요양기관코드 = A.기관코드
                        --WHERE CONVERT(CHAR(7), A.접수일자, 120) = '${params.month}'
                        WHERE A.접수일자 >= '${thisDate}'
						AND A.접수일자 < '${moment(thisDate).endOf('month').format('YYYY-MM-DD')}'
                        ${params.hospital ? `AND A.기관코드 = '${params.hospital}'` : ''}                                          
                        AND A.상태 NOT IN(${CONSTS.SERVICE_STATUS.HOLD}, ${CONSTS.SERVICE_STATUS.CANCEL})
                        ORDER BY A.기관코드, A.접수일자
                        `;
                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {

                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (err) {
                    console.log(error);
                    reject(error);
                }
            });
        }

        return {
            Status: GetServiceStatus,
            Program: GetProgramStatic,
            Area: GetAreaStatic,
            Exe: GetExeStatic,
            ExeDetail: GetExeDetail,
            Fee: GetServiceFee,
            FeeLock: GetServiceFeeLock,
            Fee2020: GetServiceFee2020,
            FeeLock2020: GetServiceFeeLock2020,
            AcceptDays: GetAcceptDays,
            ASFinderUsage: GetASFinderUsage,
            Categorys: GetCategorys,
            FinderMenu: GetFinderMenu,
            FinderBtn: GetFinderBtn,
            FinderList: GetFinderList,
            LabRawData: GetLabRawData,
            CautionList: GetServiceCautionList
        };
    })();

    var cUpdate = (function () {
        function UpdateServiceFee(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;

                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_서비스
                        SET 이의 = ${params["이의"]}
                        WHERE 인덱스 = ${params["인덱스"]}
                        `;

                    console.log(sQuery);

                    _database
                        .Execute(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result);
                            // resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        return {
            ServiceFee: UpdateServiceFee
        };
    })();

    var cInsert = (function () {
        function InsertServiceFeeLock(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_수수료정산(정산일, 마감일, 타입)
                        VALUES('${params.endMonth}', GETDATE(), ${params.lockType})
                            `;
                    console.log(sQuery);

                    _database
                        .Execute(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result);
                            // resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function InsertServiceFeeLock2020(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_수수료정산2020(정산일, 마감일, 정산서)
                        VALUES('${params.endMonth}', GETDATE(), '');

                        UPDATE ${CONSTS.DB_NEOAS}.N_서비스
                        SET 마감 = '${params.endMonth}'
                        Where 인덱스 In (${params.data})
                            `;
                    console.log(sQuery);

                    _database
                        .Execute(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result);
                            // resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        return {
            FeeLock: InsertServiceFeeLock,
            FeeLock2020: InsertServiceFeeLock2020
        };
    })();

    var cDelete = (function () {
        function DeleteServiceFeeLock(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        DELETE FROM ${CONSTS.DB_NEOAS}.N_수수료정산
                        WHERE 정산일 = '${params.endMonth}'
                        `;
                    console.log(sQuery);

                    _database
                        .Execute(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result);
                            // resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function DeleteServiceFeeLock2020(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        DELETE FROM ${CONSTS.DB_NEOAS}.N_수수료정산2020
                        WHERE 정산일 = '${params.endMonth}';

                        UPDATE  ${CONSTS.DB_NEOAS}.N_서비스
                        SET 마감 = ''
                        WHERE 마감 = '${params.endMonth}'
                        `;
                    console.log(sQuery);

                    _database
                        .Execute(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result);
                            // resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        return {
            FeeLock: DeleteServiceFeeLock,
            FeeLock2020: DeleteServiceFeeLock2020
        };
    })();

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    };
};

module.exports = static;
