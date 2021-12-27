var CONSTS = require('./config').CONSTS;
var moment = require('moment');

var settlement = function (database) {
    var _database = database;
    var sQuery = '';

    var cFind = (function () {

        function SettlementMember(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    params.date = JSON.parse(params.date);
                    sQuery = `
                        IF EXISTS ( SELECT * FROM ${CONSTS.DB_NEOAS}.N_직원정산 WHERE 직원ID = ${params.member} AND 정산일 = '${params.date.start.substr(0, 7)}' )
                            BEGIN
                                SELECT 정산서 FROM ${CONSTS.DB_NEOAS}.N_직원정산 WHERE 직원ID = ${params.member} AND 정산일 = '${params.date.start.substr(0, 7)}'
                            END
                        ELSE
                            BEGIN
                                SELECT  T.ID, T.기관코드, T.기관명칭,
                                        T.프로그램,
                                        T.유지보수총액,
                                        T.월입금,
                                        CASE    WHEN (T.월입금 - T.유지보수총액) >= 0
                                                THEN  T.유지보수총액
                                                WHEN (T.월입금 - T.유지보수총액) < 0 AND T.출금 - T.입금 = 0
                                                THEN T.월입금
                                                ELSE 0 END AS 유지보수입금,
                                        CASE    WHEN (T.월입금 - T.유지보수총액) > 0
                                                THEN T.월입금 - T.유지보수총액
                                                ELSE 0 END AS 유지보수외,
                                        T.출금 - T.입금 AS 미수금,
                                        T.메모,
                                        T.연유지,
                                        T.관리수당
                                FROM (

                                    SELECT H.USER_ID AS ID, H.USER_MED_ID AS 기관코드, H.USER_MED_NAME AS 기관명칭,
                                            ISNULL(P.코드이름, '') AS 프로그램,
                                            ( SELECT ISNULL(SUM(유지보수총액), 0) FROM NEO_COMPANY.NEO_COMPANY.DBO.NC_H_유지보수 WHERE 거래처ID = H.USER_ID AND 프로그램ID NOT IN (12, 18, 19, 22) ) AS 유지보수총액,
                                            ( SELECT ISNULL(SUM(GUMAK_GUMAK), 0) FROM NEO_COMPANY.NEO_COMPANY.DBO.NC_N_GUMAK WHERE DATEDIFF("n", GUMAK_DATE, '${params.date.misu}') >= 0 AND GUMAK_GUBUN = 1 AND GUMAK_USERID = H.USER_ID ) AS 입금,
                                            ( SELECT ISNULL(SUM(OUT_DANGA * OUT_AMT), 0) FROM NEO_COMPANY.NEO_COMPANY.DBO.NC_C_OUT WHERE DATEDIFF("n", OUT_DATE, '${params.date.misu}') >= 0 AND OUT_GUBUN = 1 AND OUT_USER = H.USER_ID ) AS 출금,
                                            ( SELECT ISNULL(SUM(GUMAK_GUMAK), 0) FROM NEO_COMPANY.NEO_COMPANY.DBO.NC_N_GUMAK WHERE CONVERT(CHAR(10), GUMAK_DATE, 120) BETWEEN '${params.date.start}' AND '${params.date.end}' AND GUMAK_GUBUN = 1 AND GUMAK_USERID = H.USER_ID ) AS 월입금,
                                            ISNULL(HS.정산메모, '') AS 메모,
                                            HI.INFO_CARE AS 연유지,
                                            ISNULL(H.USER_CLOSED, 0) AS 폐업,
                                            ISNULL(HM.관리수당, 0) AS 관리수당
                                    FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                                    INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_INFO AS HI
                                    ON H.USER_ID = HI.INFO_USER_ID
                                    LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '프로그램' ) AS P
                                    ON H.USER_PROGRAM = P.데이터1
                                    LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                                    ON ISNULL(H.USER_담당자, 0) = M.USER_ID
                                    LEFT JOIN ${CONSTS.DB_NEOAS}.N_병원특이사항 AS HS
                                    ON H.USER_ID = HS.USER_ID
                                    LEFT JOIN ${CONSTS.DB_NEOAS}.N_관리수당 AS HM
                                    ON H.USER_ID = HM.거래처ID
                                    WHERE 1 = 1
                                    --AND ISNULL(H.USER_CLOSED, 0) = 1
                                    AND ISNULL(H.USER_담당자, 0) = ${params.member}

                                    {{UNION}}

                                ) AS T
                                WHERE 1 = 1
                                AND ( T.폐업 = 0 Or (T.폐업 = 1 AND T.월입금 > 0) )
                                ORDER BY T.기관명칭;

                                --AS 인계
                                SELECT COUNT(A.인덱스) AS 인계건
                                FROM ${CONSTS.DB_NEOAS}.N_서비스 AS A
                                WHERE   1 = 1
                                AND             A.상태 = 4
                                AND             A.담당자 <> A.완료자
                                AND CONVERT(CHAR(7), A.완료일자, 120) = '${params.date.end.substr(0, 7)}'
                                AND ISNULL(A.본사, 0) = 0
                                AND A.담당자 = ${params.member}
                            END
                    `;

                    var sUion = '';
                    if (params.member == 185) {
                        sUion = `
                            UNION ALL
                            SELECT H.USER_ID AS ID, H.USER_MED_ID AS 기관코드, H.USER_MED_NAME AS 기관명칭,
                                    ISNULL(P.코드이름, '') AS 프로그램,
                                    ( SELECT ISNULL(SUM(유지보수총액), 0) FROM NEO_COMPANY.NEO_COMPANY.DBO.NC_H_유지보수 WHERE 거래처ID = H.USER_ID AND 프로그램ID NOT IN (12, 18, 19, 22) ) AS 유지보수총액,
                                    ( SELECT ISNULL(SUM(GUMAK_GUMAK), 0) FROM NEO_COMPANY.NEO_COMPANY.DBO.NC_N_GUMAK WHERE DATEDIFF("n", GUMAK_DATE, '${params.date.misu}') >= 0 AND GUMAK_GUBUN = 1 AND GUMAK_USERID = H.USER_ID ) AS 입금,
                                    ( SELECT ISNULL(SUM(OUT_DANGA * OUT_AMT), 0) FROM NEO_COMPANY.NEO_COMPANY.DBO.NC_C_OUT WHERE DATEDIFF("n", OUT_DATE, '${params.date.misu}') >= 0 AND OUT_GUBUN = 1 AND OUT_USER = H.USER_ID ) AS 출금,
                                    ( SELECT ISNULL(SUM(GUMAK_GUMAK), 0) FROM NEO_COMPANY.NEO_COMPANY.DBO.NC_N_GUMAK WHERE CONVERT(CHAR(10), GUMAK_DATE, 120) BETWEEN '${params.date.start}' AND '${params.date.end}' AND GUMAK_GUBUN = 1 AND GUMAK_USERID = H.USER_ID ) AS 월입금,
                                    ISNULL(HS.정산메모, '') AS 메모,
                                    HI.INFO_CARE AS 연유지,
                                    ISNULL(H.USER_CLOSED, 0) AS 폐업,
                                    ISNULL(HM.관리수당, 0) AS 관리수당
                            FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                            INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_INFO AS HI
                            ON H.USER_ID = HI.INFO_USER_ID
                            LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '프로그램' ) AS P
                            ON H.USER_PROGRAM = P.데이터1
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                            ON ISNULL(H.USER_담당자, 0) = M.USER_ID
                            LEFT JOIN ${CONSTS.DB_NEOAS}.N_병원특이사항 AS HS
                            ON H.USER_ID = HS.USER_ID
                            LEFT JOIN ${CONSTS.DB_NEOAS}.N_관리수당 AS HM
                            ON H.USER_ID = HM.거래처ID
                            WHERE 1 = 1
                            --AND ISNULL(H.USER_CLOSED, 0) = 1
                            AND ISNULL(H.USER_담당자, 0) = 58
                            AND H.USER_PROGRAM = 7
                        `;
                    }

                    sQuery = sQuery.replace('{{UNION}}', sUion);

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

        function SettlementArea(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    params.date = JSON.parse(params.date);
                    params.settlementArea = params.area;
                    if (params.area === '0025') {
                        params.area = `0025','0045`;
                    }

                    sQuery = `
                        IF EXISTS ( SELECT * FROM ${CONSTS.DB_NEOAS}.N_지사정산 WHERE 지사코드 = '${params.settlementArea}' AND 정산일 = '${params.date.start.substr(0, 7)}')
                            BEGIN
                                SELECT 정산서 FROM ${CONSTS.DB_NEOAS}.N_지사정산 WHERE 지사코드 = '${params.settlementArea}' AND 정산일 = '${params.date.start.substr(0, 7)}';
                                SELECT * FROM ${CONSTS.DB_NEOAS}.N_지사정산메모 WHERE 지사코드 = '${params.settlementArea}' AND 정산일 = '${params.date.start.substr(0, 7)}'
                            END
                        ELSE
                            BEGIN
                                SELECT  T.ID, T.기관코드, T.기관명칭, T.연락처, T.대표자, T.프로그램,
                                        T.유지보수금액, T.월입금, T.관리수당, T.출금 - T.입금 AS 미수금, 0 AS 유지보수,
                                        T.메모, T.청구방식, T.연유지, T.병원구분, T.병원구분명칭, T.프로그램ID
                                FROM (
                                        SELECT  H.USER_ID AS ID, H.USER_MED_ID AS 기관코드, H.USER_MED_NAME AS 기관명칭, ISNULL(HI.INFO_TEL, '') AS 연락처, ISNULL(INFO_PRESIDENT, '') AS 대표자, ISNULL(P.코드이름, '') AS 프로그램,
                                                ( SELECT ISNULL(SUM(유지보수총액), 0) FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_유지보수 WHERE 거래처ID = H.USER_ID AND 프로그램ID NOT IN (12, 18, 19, 22) ) AS 유지보수금액,
                                                ( SELECT ISNULL(SUM(GUMAK_GUMAK), 0) FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_GUMAK WHERE CONVERT(CHAR(10), GUMAK_DATE, 120) BETWEEN '${params.date.start}' AND '${params.date.end}' AND GUMAK_GUBUN = 1 AND GUMAK_USERID = H.USER_ID ) AS 월입금,
                                                (SELECT ISNULL(SUM(GUMAK_GUMAK),0) FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_GUMAK WHERE GUMAK_GUBUN = 1 AND GUMAK_USERID = H.USER_ID AND DATEDIFF("D", '1990-01-01', GUMAK_DATE) >= 0 AND DATEDIFF("D", '${params.date.misu}', GUMAK_DATE) <= 0) AS 입금,
                                                (SELECT ISNULL(SUM(OUT_DANGA * OUT_AMT), 0) FROM ${CONSTS.DB_NEOCOMPANY}.NC_C_OUT WHERE OUT_GUBUN = 1 AND OUT_H_USERID = H.USER_ID AND DATEDIFF("D", '1990-01-01', OUT_DATE) >= 0 AND DATEDIFF("D", '${params.date.misu}', OUT_DATE) <= 0) AS 출금,

                                                ISNULL(HS.정산메모, '') AS 메모,
                                                HI.INFO_BSCHUNGGU AS 청구방식,
                                                HI.INFO_CARE AS 연유지,
                                                ISNULL(HH.관리수당, 0) AS 관리수당,
                                                H.USER_GUBUN AS 병원구분, ISNULL(HK.코드이름, '') AS 병원구분명칭, H.USER_PROGRAM AS 프로그램ID
                                        FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_INFO AS HI
                                        ON H.USER_ID = HI.INFO_USER_ID
                                        LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '프로그램' ) AS P
                                        ON H.USER_PROGRAM = P.데이터1
                                        LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '병원구분' ) AS HK
                                        ON H.USER_GUBUN = HK.데이터1
                                        LEFT JOIN ${CONSTS.DB_NEOAS}.N_관리수당 AS HH
                                        ON H.USER_ID = HH.거래처ID
                                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A
                                        ON HI.INFO_AREA = A.AREA_ID
                                        LEFT JOIN ${CONSTS.DB_NEOAS}.N_병원특이사항 AS HS
                                        ON H.USER_ID = HS.USER_ID
                                        WHERE 1 = 1
                                        AND A.AREA_ID IN ('${params.area}')
                                        AND ISNULL(H.USER_CLOSED, 0) = 0
                                    ) AS T
                                ORDER BY CASE T.병원구분 WHEN 0 THEN 100 ELSE T.병원구분 END ASC,
                                CASE T.프로그램ID  WHEN 20 THEN 0
                                                                WHEN 8 THEN 1
                                                                WHEN 1 THEN 2 ELSE T.프로그램ID END ASC,
                                T.기관명칭;

                                SELECT * FROM ${CONSTS.DB_NEOAS}.N_지사정산메모
                                WHERE 지사코드 IN ('${params.area}')
                                AND 정산일 = '${params.date.start.substr(0, 7)}'
                            END
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
            })
        }

        function SettlementAreaStatic(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;

                    sQuery = `
                        select S.지사코드, A.AREA_NAME AS 지사명,
                        right(S.정산일, 2) AS 정산월, S.정산서
                        from ${CONSTS.DB_NEOAS}.N_지사정산 AS S
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A
                        ON S.지사코드 = A.AREA_ID
                        where left(S.정산일, 4) = '${params.year}'
                        order by S.지사코드
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
            })
        }

        function SettlementAreaMemo(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;

                    sQuery = `
                        SELECT *
                        FROM ${CONSTS.DB_NEOAS}.N_지사정산메모
                        WHERE 지사코드 = '${params['AREA_ID']}'
                        AND 정산일 = '${params['SDATE']}'
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
            })
        }

        function SaleProduct(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        SELECT *
                        FROM ${CONSTS.DB_NEOAS}.N_직원정산
                        WHERE 직원ID = ${params.member}
                        AND   거래처ID = ${params.hospid}
                        AND   정산일   = '${params.date}'
                        AND   구분 = 1
                    `;
                    _database.RecordSet(sQuery)
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

        function GetSales(req) {
            return new Promise(function (resolve, reject) {
                var params = req.query;

                sQuery = `
                    SELECT  S.인덱스, S.기관명칭, S.진료과, S.주프로그램, S.프로그램,
                            S.지사, ISNULL(A.AREA_NAME, '') AS 지사명, S.담당자, ISNULL(M.USER_NAME, '') AS 담당자명,
                            S.매출월, CONVERT(CHAR(10), S.계약일, 120) AS 계약일, S.설치비, S.유지보수, S.하드웨어,
                            S.비고
                    FROM ${CONSTS.DB_NEOAS}.N_매출현황 AS S
                    LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A
                    ON S.지사 = A.AREA_ID
                    LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                    ON S.담당자 = M.USER_ID
                    -- WHERE   매출월 = '${params.saleMonth}'
                    WHERE 1 = 1
                    ${params.type === 'sales-date' ? "AND 매출월 = '" + params.saleMonth + "' " : "AND CONVERT(CHAR(7), S.계약일, 120) = '" + params.saleMonth + "' "}
                    ${params.area !== '' ? "AND     지사 = '" + params.area + "' " : ''}
                    ${params.manager !== '' ? "AND     담당자 = '" + params.manager + "' " : ''}
                `;

                console.log(sQuery);

                _database.RecordSet(sQuery)
                    .then(function (result) {
                        resolve(result.recordset);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            });
        }

        function GetSalesAll(req) {
            return new Promise(function (resolve, reject) {
                var params = req.query;
                sQuery = `
                    SELECT RIGHT(S.매출월, 2) AS 매출월, S.주프로그램, S.진료과, S.기관명칭, S.프로그램,
                    CONVERT(CHAR(10), S.계약일, 120) AS 계약일, S.설치비, S.유지보수, S.하드웨어, ISNULL(A.AREA_NAME, '') AS 지사명
                    FROM ${CONSTS.DB_NEOAS}.N_매출현황 AS S
                    LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A
                    ON S.지사 = A.AREA_ID
                    WHERE  LEFT(S.매출월, 4) = '${params.year}'
                    ${params.area !== '' ? "AND     S.지사 = '" + params.area + "' " : ''}
                `;

                console.log(sQuery);

                _database.RecordSet(sQuery)
                    .then(function (result) {
                        resolve(result.recordset);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            })
        }

        return {
            SettlementArea: SettlementArea,
            SettlementMember: SettlementMember,
            SettlementAreaStatic: SettlementAreaStatic,
            SettlementAreaMemo: SettlementAreaMemo,
            SaleProduct: SaleProduct,
            Sale: GetSales,
            SaleStatic: GetSalesAll
        }
    })();

    var cUpdate = (function () {
        function UpdateSaleProduct(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_직원정산
                        SET 직원ID     = ${params.member},
                            거래처ID   = ${params.id},
                            정산일     = '${params.date}',
                            구분       = ${params.type},,
                            거래처명   = '${params.name}',
                            품목       = '${params.product}',
                            금액       = ${params.price},
                            원가금액    = ${params.originprice}
                        WHERE 직원ID = ${params.member}
                        AND   거래처ID = ${params.id}
                        AND   정산일   = '${params.date}'
                        AND   구분 = 1
                    `;
                    _database.Execute(sQuery)
                        .then(function (result) {
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

        function UpdateNewSale(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_직원정산
                        SET 직원ID     = ${params.member},
                            거래처ID   = ${params.id},
                            정산일     = '${params.date}',
                            구분       = ${params.type},
                            거래처명   = '${params.name}',
                            품목       = '${params.product}',
                            금액       = ${params.price},
                            입금액     = ${params.saleprice},
                            순수익    = ${params.pureprice}
                        WHERE 인덱스 = ${params.index}
                    `;
                    _database.Execute(sQuery)
                        .then(function (result) {
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

        function UpdateSale(req) {
            return new Promise(function (resolve, reject) {
                var params = req.body;
                sQuery = `
                    UPDATE ${CONSTS.DB_NEOAS}.N_매출현황
                    SET 기관명칭 = '${params.hospname}'
                    ,진료과 = '${params.jingwa}'
                    ,주프로그램 = '${params.program}'
                    ,프로그램 = '${params.subProgram}'
                    ,지사 = '${params.area}'
                    ,담당자 = ${params.manager}
                    ,매출월 = '${params.saleMonth}'
                    ,계약일 = '${params.contractDate}'
                    ,설치비 = ${params.installFee}
                    ,유지보수 = ${params.asFee}
                    ,하드웨어 = ${params.hwFee}
                    ,비고 = '${params.bigo}'
                    WHERE 인덱스 = ${params.index}
                `;

                console.log(sQuery);
                _database.Execute(sQuery)
                    .then(function (result) {
                        resolve(result);
                    })
                    .catch(function (error) {
                        reject(error);
                    });

            })
        }

        function UpdateSettlementAreaMemo(req) {
            return new Promise(function (resolve, reject) {
                var params = req.body;
                sQuery = `
                    UPDATE ${CONSTS.DB_NEOAS}.N_지사정산메모
                    SET 메모 = '${params.memo}'
                    WHERE 지사코드 = '${params.area}'
                    AND 정산일 = '${params.sDate}'
                `;

                console.log(sQuery);
                _database.Execute(sQuery)
                    .then(function (result) {
                        resolve(result);
                    })
                    .catch(function (error) {
                        reject(error);
                    });

            })

        }

        function UpdateClosedAreaSettlement(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    console.log(params);
                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_지사정산
                        SET 정산서 = '${JSON.stringify(params['정산서'])}'
                        WHERE 지사코드 = '${params['지사코드']}'
                        AND 정산일 = '${params['정산일']}'
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
            });
        }

        return {
            SaleProduct: UpdateSaleProduct,
            NewSale: UpdateNewSale,
            Sale: UpdateSale,
            SettlementAreaMemo: UpdateSettlementAreaMemo,
            ClosedAreaSettlement: UpdateClosedAreaSettlement
        };
    })();

    var cInsert = (function () {
        function InsertSaleProduct(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_직원정산
                        (
                            직원ID, 거래처ID, 정산일, 구분,
                            거래처명, 품목, 금액, 원가금액
                        )
                        VALUES
                        (
                            ${params.member}, ${params.id}, '${params.date}', ${params.type},
                            '${params.name}', '${params.product}', ${params.price}, ${params.originprice}
                        )
                    `;
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
            });
        }

        function InsertNewSale(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    console.log(params);
                    sQuery = `
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_직원정산
                        (
                            직원ID, 거래처ID, 정산일, 구분,
                            거래처명, 품목, 금액,
                            입금액, 순수익
                        )
                        VALUES
                        (
                            ${params.member}, ${params.id}, '${params.date}', 0,
                            '${params.name}', '${params.product}', ${params.price},
                            ${params.saleprice}, ${params.pureprice}
                        )
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
            });
        }

        function InsertCloseMember(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    console.log(params);
                    sQuery = `
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_직원정산 ( 직원ID, 정산일, 정산서 )
                        VALUES
                        ( ${params['직원ID']}, '${params['정산일']}', '${JSON.stringify(params['정산서'])}')
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
            });
        }

        function InsertCloseArea(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    console.log(params);
                    sQuery = `
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_지사정산 ( 지사코드, 정산일, 정산서 )
                        VALUES
                        ( '${params['지사코드']}', '${params['정산일']}', '${JSON.stringify(params['정산서'])}')
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
            });
        }

        function InsertSales(req) {
            return new Promise(function (resolve, reject) {
                var params = req.body;
                sQuery = `
                    INSERT INTO ${CONSTS.DB_NEOAS}.N_매출현황 (
                        기관명칭, 진료과, 주프로그램, 프로그램,
                        지사, 담당자, 매출월, 계약일,
                        설치비, 유지보수, 하드웨어, 비고
                    )
                    VALUES (
                        '${params.hospname}', '${params.jingwa}', '${params.program}', '${params.subProgram}',
                        '${params.area}', ${params.manager}, '${params.saleMonth}', '${params.contractDate}',
                        ${params.installFee == '' ? 0 : params.installFee }, ${params.asFee == '' ? 0 : params.asFee}, ${params.hwFee == 0 ? 0 : params.hwFee}, '${params.bigo}'
                    )
                `;

                console.log(sQuery);
                _database.Execute(sQuery)
                    .then(function (result) {
                        resolve(result);
                    })
                    .catch(function (error) {
                        reject(error);
                    });

            });
        }

        function InsertSettlementAreaMemo(req) {
            return new Promise(function (resolve, reject) {
                var params = req.body;
                sQuery = `
                    INSERT INTO ${CONSTS.DB_NEOAS}.N_지사정산메모 (
                        지사코드, 메모, 정산일
                    )
                    VALUES (
                        '${params.area}', '${params.memo}', '${params.sDate}'
                    )
                `;

                console.log(sQuery);
                _database.Execute(sQuery)
                    .then(function (result) {
                        resolve(result);
                    })
                    .catch(function (error) {
                        reject(error);
                    });

            });
        }

        return {
            SaleProduct: InsertSaleProduct,
            NewSale: InsertNewSale,
            CloseMember: InsertCloseMember,
            CloseArea: InsertCloseArea,
            Sale: InsertSales,
            SettlementAreaMemo: InsertSettlementAreaMemo
        }
    })();

    var cDelete = (function () {
        function DeleteNewSale(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        DELETE FROM ${CONSTS.DB_NEOAS}.N_직원정산
                        WHERE 인덱스 = ${params.index}
                    `;
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

        function DeleteSale(req) {
            return new Promise(function (resolve, reject) {

                var params = req.body;

                sQuery = `
                    DELETE FROM ${ CONSTS.DB_NEOAS}.N_매출현황
                    Where 인덱스 = ${ params.index}
                `;

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

            })
        }

        return {
            NewSale: DeleteNewSale,
            Sale: DeleteSale
        }
    })();

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    };
}

module.exports = settlement;
