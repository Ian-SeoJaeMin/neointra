var CONSTS = require("./config").CONSTS;
var versions = {};
// var moment = require('moment');
// moment.locale('ko');

var customer = function (database) {
    var _database = database;
    var sQuery = "";


    var cFind = (function () {
        function GetCustomerFee(req) {
            return new Promise(function (resolve, reject) {
                var params = req.query;
                sQuery = `
                    SELECT  H.USER_ID AS ID, H.USER_MED_ID AS 기관코드, H.USER_MED_NAME AS 기관명칭,
                            ISNULL(P.코드이름, '') AS 프로그램,
                            ISNULL(HK.코드이름, '') AS 병원구분,
                            A.AREA_NAME AS 담당지사,
                            ISNULL(M.USER_NAME, '') AS 담당자,
                            ISNULL(HF.관리수당, 0) AS 관리수당
                    FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                    INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_INFO AS HI
                        ON H.USER_ID = HI.INFO_USER_ID
                    LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY
                    }.NC_N_CODE WHERE 코드구분 = '프로그램' ) AS P
                        ON H.USER_PROGRAM = P.데이터1
                    LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY
                    }.NC_N_CODE WHERE 코드구분 = '병원구분' ) AS HK
                        ON H.USER_GUBUN = HK.데이터1
                    INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A
                        ON HI.INFO_AREA = A.AREA_ID
                    LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON ISNULL(H.USER_담당자, 0) = M.USER_ID
                    LEFT JOIN ${CONSTS.DB_NEOAS}.N_관리수당 AS HF
                        ON ISNULL(HF.거래처ID, 0)  = H.USER_ID
                    WHERE 1 = 1
                    ${params.manager
                        ? " AND ISNULL(H.USER_담당자, 0) = " +
                        params.manager
                        : ""
                    }
                    ${params.area ? " AND A.AREA_ID = " + params.area : ""}
                    AND ISNULL(H.USER_CLOSED, 0) = 0
                    ORDER BY P.코드이름
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
            });
        }

        function GetCustomers(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query,
                        user = req.session.user,
                        sWhere = "";
                    params.sido = params.sido || "";
                    params.si = params.si || "";
                    sQuery = `
                        -- 거래처 리스트 조회
                        SELECT H.USER_ID AS ID, H.USER_MED_ID AS 기관코드, H.USER_MED_NAME AS 기관명칭,
                                A.AREA_NAME AS 담당지사, A.AREA_ID AS 담당지사코드, HI.info_juso as 주소,
                                CASE WHEN HI.INFO_AREA IN ('0000', '0026', '0030', '0031') THEN ISNULL(M.USER_NAME, '') ELSE '' END AS 담당자,
                                CASE WHEN HI.INFO_AREA IN ('0000', '0026', '0030', '0031') THEN ISNULL(M.USER_ID, 0) ELSE 0 END AS 담당자ID,
                                ISNULL(P.코드이름, '') AS 프로그램,
                                ISNULL(G.코드이름, '') AS 진료과,
                                CASE ISNULL(HM.병원유형, 0) WHEN 1 THEN '우수' WHEN 2 THEN '주의' ELSE '보통' END AS 병원유형,
                                ISNULL(HM.병원유형, 0) AS 병원유형ID,
                                CASE WHEN B.백업경로용량 IS NULL THEN 2
                                    WHEN B.백업경로용량 < 100 THEN 1
                                    ELSE 0 END AS 백업용량,
                                (Select 업데이트 From MEDICHART.DBO.TB_마스터업데이트 Where 마스터ID = 2) AS 마스터수가,
                                (Select 업데이트 From MEDICHART.DBO.TB_마스터업데이트 Where 마스터ID = 1) AS 마스터약가,
                                (Select 업데이트 From MEDICHART.DBO.TB_마스터업데이트 Where 마스터ID = 3) AS 마스터재료,
                                REPLACE(ISNULL(B.기타수가현황, ''), '-', '') AS 백업수가, REPLACE(ISNULL(B.기타약가현황, ''), '-', '') AS 백업약가, REPLACE(ISNULL(B.기타재료현황, ''), '-', '') AS 백업재료,
                                REPLACE(ISNULL(S.마스터버젼_수가, ''), '-', '') AS 센스수가, REPLACE(ISNULL(S.마스터버젼_약품, ''), '-', '') AS 센스약가, REPLACE(ISNULL(S.마스터버젼_재료, ''), '-', '') AS 센스재료,
                                REPLACE(ISNULL(ML.수가업데이트버젼, ''), '-', '') AS 메디수가, REPLACE(ISNULL(ML.약가업데이트버젼, ''), '-', '') AS 메디약가, REPLACE(ISNULL(ML.재료업데이트버젼, ''), '-', '') AS 메디재료,
                                CASE WHEN ISNULL(B.백업일시, '1991-01-01') < CONVERT(CHAR(10), DATEADD(d, -2, GETDATE()), 120) THEN 1 ELSE 0 END AS 백업일시,
                                ISNULL(H.USER_CLOSED, 0) AS '폐업',
                                ( SELECT ISNULL(SUM(유지보수총액), 0) FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_유지보수 WHERE 거래처ID = H.USER_ID AND 프로그램ID NOT IN (12, 18, 19, 22) ) AS 유지보수금액,
                                ISNULL(VD.최근방문일, '') AS 최근방문일,
                                ISNULL(CONVERT(VARCHAR(10), EL.LOCK_START, 120), '') AS 잠금일자,
                                --ISNULL(S.현재버전, ISNULL(L.현재버전, '')) AS 현재버전,
                                ISNULL(S.수동버전, ISNULL(L.수동버전, ISNULL(S.현재버전, ISNULL(L.현재버전, '')))) AS 현재버전,
                                ISNULL(S.상병차수, '') AS 상병차수
                        FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_INFO AS HI
                        ON H.USER_ID = HI.INFO_USER_ID
                        LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '프로그램' ) AS P
                        ON H.USER_PROGRAM = P.데이터1
                        LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '과별코드' ) AS G
                        ON H.USER_GWA = G.데이터1
                        LEFT JOIN ${CONSTS.DB_NEOAS}.N_병원특이사항 AS HM
                        ON H.USER_ID = HM.USER_ID
                        --LEFT JOIN ${CONSTS.DB_OCS}.TB_백업솔루션현황 AS B
                        
                        LEFT JOIN (
							SELECT AA.요양기관기호,
							백업일시, 백업경로용량, 
							기타수가현황, 기타약가현황, 기타재료현황
							From  ${CONSTS.DB_OCS}.TB_백업솔루션현황 AA
							INNER JOIN (
								SELECT MAX(백업일시) AS 최종일자, 요양기관기호
								FROM ${CONSTS.DB_OCS}.TB_백업솔루션현황
								GROUP BY 요양기관기호
							) BB
							ON AA.요양기관기호 = BB.요양기관기호
							AND AA.백업일시 = BB.최종일자
                        ) AS B
                        ON H.USER_MED_ID = B.요양기관기호
                        LEFT JOIN ${CONSTS.DB_OCS}.SS_기관정보 AS S
                        ON H.USER_MED_ID = S.요양기관코드
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A
                        ON HI.INFO_AREA = A.AREA_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON ISNULL(H.USER_담당자, 0) = M.USER_ID
                        LEFT JOIN (SELECT USER_ID, CONVERT(CHAR(10), MAX(실시작), 120) AS 최근방문일 FROM ${CONSTS.DB_NEOAS}.N_방문일지 GROUP BY USER_ID) AS VD
                        ON H.USER_ID = VD.USER_ID
                        LEFT JOIN (SELECT LOCK_ID, LOCK_START FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_EMRLOCK WHERE LOCK_PART= 2 AND LOCK_STAT = 1) AS EL
                        ON H.USER_ID = EL.LOCK_ID
                        LEFT JOIN ${CONSTS.DB_OCS}.TB_Live승인버전 AS L
                        ON L.요양기관기호 = H.USER_MED_ID
                        LEFT JOIN ${CONSTS.DB_OCS}.TB_MEDI서버정보 AS ML
                        ON ML.요양기관기호 = H.USER_MED_ID
                        WHERE 1 = 1
                        {{CONDITION}}
                        ORDER BY H.USER_PROGRAM, H.USER_MED_NAME
                    `;

                    params.status = params.status || "";
                    params.program = params.program || "";
                    params.area = params.area || "";
                    params.manager = params.manager || "";
                    params.search = params.search || "";
                    params.gwa = params.gwa || "";

                    if (params.status !== "") {
                        sWhere +=
                            " AND ISNULL(H.USER_CLOSED, 0) = " + params.status;
                    }

                    if (params.program !== "" && params.program !== "0") {
                        sWhere += " AND P.데이터1 = " + params.program;
                    }

                    if (params.gwa !== "" && params.gwa !== "0") {
                        sWhere += " AND H.USER_GWA = " + params.gwa;
                    }

                    if (params.area !== "") {
                        //sWhere += " AND HI.INFO_AREA IN (" + (params.area.match(/0000|0026|0030|0031/) ? "'0000', '0026', '0030', '0031'" : "'" + params.area + "'") + ") ";
                        if (params.area.match(/0000|0026|0030|0031/)) {
                            sWhere +=
                                " AND HI.INFO_AREA IN ('0000', '0026', '0030', '0031') ";
                        } else if (params.area.match(/0023|0043/)) {
                            //강동
                            sWhere += " AND HI.INFO_AREA IN ('0023', '0043') ";
                        } else if (params.area.match(/0028|0042/)) {
                            //최종용
                            sWhere += " AND HI.INFO_AREA IN ('0028', '0042') ";
                        } else {
                            sWhere +=
                                " AND HI.INFO_AREA IN ('" +
                                params.area.trim() +
                                "') ";
                        }
                    } else if (user['지사코드'].match(/0023|0028/)) {
                        sWhere += " AND HI.INFO_AREA IN ('0023', '0043', '0028', '0042') ";
                    }

                    if (params.manager !== "") {
                        sWhere +=
                            " AND ISNULL(H.USER_담당자, 0) = " + params.manager;
                    }

                    if (params.sido !== "") {
                        sWhere +=
                            " AND HI.info_juso like '" + params.sido + "%' ";
                        if (params.si !== "") {
                            sWhere +=
                                " AND HI.info_juso like '% " +
                                params.si +
                                "%' ";
                        }
                    }

                    if (params.search !== "") {
                        sWhere +=
                            " AND ( H.USER_MED_ID LIKE '%" +
                            params.search +
                            "%' ";
                        sWhere +=
                            "       OR H.USER_MED_NAME LIKE '%" +
                            params.search +
                            "%') ";
                    }

                    sQuery = sQuery.replace("{{CONDITION}}", sWhere);

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
                    console.log(error);
                    reject(error);
                }
            });
        }

        function GetCustomerInfo(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        -- 거래처 상세정보 조회
                        SELECT
                            H.USER_ID AS 인덱스,
                            H.USER_MED_ID AS 기관기호, H.USER_MED_NAME AS 기관명칭,
                            ISNULL(HK.코드이름, '') AS 병원구분, G.코드이름 AS 진료과목,
                            P.코드이름 AS 프로그램, HI.INFO_PRESIDENT AS 대표자,
                            HI.INFO_TEL AS 전화번호, HI.INFO_HP AS 이동전화,
                            HI.INFO_POST AS 우편번호, HI.INFO_JUSO AS 주소,
                            ISNULL(HI.INFO_CONTRACT_DATE, '') AS 계약일,
                            ISNULL(HI.INFO_특이사항, '') AS 특이사항,
                            ISNULL(CONVERT(VARCHAR(10), EL.LOCK_START, 120), '') AS 잠금일자,
                            ISNULL(S.실가동일, '') AS 실가동일,
                            ISNULL(HI.INFO_COMPANY_NUM, '') AS 사업자번호
                        FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_INFO AS HI
                        ON H.USER_ID = HI.INFO_USER_ID
                        LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '과별코드' ) AS G
                        ON H.USER_GWA = G.데이터1
                        LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '병원구분' ) AS HK
                        ON H.USER_GUBUN = HK.데이터1
                        LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '프로그램' ) AS P
                        ON H.USER_PROGRAM = P.데이터1
                        LEFT JOIN ( SELECT LOCK_ID, LOCK_START FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_EMRLOCK WHERE LOCK_PART = 2 AND LOCK_STAT = 1) AS EL
                        ON H.USER_ID = EL.LOCK_ID
                        LEFT JOIN ${CONSTS.DB_OCS}.SS_기관정보 AS S
                        ON H.USER_MED_ID = S.요양기관코드
                        WHERE H.USER_ID = ${params["id"]};

                        SELECT
                            ISNULL(병원유형, 0) AS 병원유형ID,
                            CASE ISNULL(병원유형, 0) WHEN 1 THEN '우수'
                                                    WHEN 2 THEN '주의'
                                                    ELSE '보통' END AS 병원유형,
                            전산담당, 결제담당, 메모, 메모2, M.USER_NAME AS 수정자, CONVERT(CHAR(19), 수정일자, 120) AS 수정일자,
                            ISNULL(원격서버, '') AS 원격서버,
                            ISNULL(원격아이디, '') AS 원격아이디,
                            ISNULL(원격비번, '') AS 원격비번,
                            ISNULL(스탠바이이름, '') AS 스탠바이이름,
                            ISNULL(스탠바이비번, '') AS 스탠바이비번
                        FROM ${CONSTS.DB_NEOAS}.N_병원특이사항 AS U
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON U.수정자 = M.USER_ID
                        WHERE U.USER_ID = ${params["id"]};

                        SELECT
                            ( SELECT 업데이트 FROM MEDICHART.DBO.TB_마스터업데이트 WHERE 마스터ID = 2) AS M수가,
                            ( SELECT 업데이트 FROM MEDICHART.DBO.TB_마스터업데이트 WHERE 마스터ID = 1) AS M약가,
                            ( SELECT 업데이트 FROM MEDICHART.DBO.TB_마스터업데이트 WHERE 마스터ID = 3) AS M재료,
                            REPLACE(ISNULL(B.기타수가현황, ''), '-', '') AS 백업수가, REPLACE(ISNULL(B.기타약가현황, ''), '-', '') AS 백업약가, REPLACE(ISNULL(B.기타재료현황, ''), '-', '') AS 백업재료,
                            REPLACE(ISNULL(S.마스터버젼_수가, ''), '-', '') AS 센스수가, REPLACE(ISNULL(S.마스터버젼_약품, ''), '-', '') AS 센스약가, REPLACE(ISNULL(S.마스터버젼_재료, ''), '-', '') AS 센스재료,
                            REPLACE(ISNULL(ML.수가업데이트버젼, ''), '-', '') AS 메디수가, REPLACE(ISNULL(ML.약가업데이트버젼, ''), '-', '') AS 메디약가, REPLACE(ISNULL(ML.재료업데이트버젼, ''), '-', '') AS 메디재료,
                            ISNULL(B.백업일시, '') AS 백업일시,
                            CASE ISNULL(B.로그축소사용, 0) WHEN 1 THEN '사용' ELSE '미사용' END AS 로그축소,
                            ISNULL(B.자동백업시간, '') AS 자동백업시간,
                            ISNULL(B.백업경로용량, 0) AS 백업경로용량,
                            ISNULL(B.백업경로, '') AS 백업경로, ISNULL(B.정품여부, 0) 정품여부,
                            ISNULL(B.SQL버전, '') AS SQL버전,

                            ISNULL(B.메인데이터경로, '') AS 메인데이터경로,
                            ISNULL(B.보조PC명칭, '') AS 보조PC명칭
                        FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                        LEFT JOIN ${CONSTS.DB_OCS}.TB_백업솔루션현황 AS B
                        ON H.USER_MED_ID = B.요양기관기호
                        LEFT JOIN ${CONSTS.DB_OCS}.SS_기관정보 AS S
                        ON H.USER_MED_ID = S.요양기관코드
                        LEFT JOIN ${CONSTS.DB_OCS}.TB_Live승인버전 AS L
                        ON L.요양기관기호 = H.USER_MED_ID
                        LEFT JOIN ${CONSTS.DB_OCS}.TB_MEDI서버정보 AS ML
                        ON ML.요양기관기호 = H.USER_MED_ID
                        WHERE H.USER_MED_ID = '${params["hospnum"]}';


                        SELECT C.코드이름 + ' (' + C.데이터3 + ')' AS 부가서비스
                        FROM (
                            SELECT A.코드이름, A.데이터1, A.데이터3, CONVERT(INT, B.데이터1) AS 분류코드
                            FROM (
                                SELECT * FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '부가서비스'
                            ) AS A
                            LEFT JOIN (
                                SELECT * FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '부가서비스분류'
                            ) AS B
                            ON A.데이터2 = B.데이터1
                        ) AS C
                        LEFT JOIN (
                            SELECT * FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_부가서비스 WHERE 거래처ID = ${params["id"]}
                        ) AS D
                        ON D.서비스ID = CONVERT(INT, C.데이터1)
                        WHERE GETDATE() BETWEEN D.시작일자 AND D.종료일자
                        ORDER BY C.분류코드;

                        Select dbo.fP_GetSenseConfig(S.공통_텍스트, 20, '^') AS Pacs, S.수탁검사정보
                        From ${CONSTS.DB_OCS}.SS_기관정보 AS S
                        Inner Join ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                        On S.요양기관코드 = H.USER_MED_ID
                        Where H.USER_ID = ${params['id']}
                    `;

                    console.log(sQuery);

                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            var hospital = {
                                info: result.recordsets[0][0] || {},
                                uniq: result.recordsets[1][0] || {},
                                backup: result.recordsets[2][0] || {},
                                extra: result.recordsets[3] || [],
                                link: result.recordsets[4][0] || {}
                            };
                            // console.log(hospital);
                            _parsing(hospital)
                                .then(function (hosp) {
                                    resolve(hosp);
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    reject(error);
                                });
                        })
                        .catch(function (error) {
                            console.log(error);
                            reject(error);
                        });

                    function _parsing(hosp) {
                        return new Promise(function (resolve, reject) {
                            try {
                                if (typeof hosp.uniq === "object") {
                                    if (hosp.uniq["병원유형ID"] === 1) {
                                        hosp.uniq["병원유형"] =
                                            '<span class="badge bg-blue">' +
                                            hosp.uniq["병원유형"] +
                                            "</span>";
                                    } else if (hosp.uniq["병원유형ID"] === 2) {
                                        hosp.uniq["병원유형"] =
                                            '<span class="badge bg-red">' +
                                            hosp.uniq["병원유형"] +
                                            "</span>";
                                    }

                                    if (hosp.uniq.hasOwnProperty("수정일자")) {
                                        hosp.uniq["수정일자"] = moment(
                                            hosp.uniq["수정일자"]
                                        ).format("LLL");
                                    }
                                }

                                if (typeof hosp.backup === "object") {
                                    if (
                                        hosp.backup.hasOwnProperty("백업일시")
                                    ) {
                                        hosp.backup["백업일시"] = _validate(
                                            hosp.backup["백업일시"],
                                            function (a) {
                                                return (
                                                    a <
                                                    moment()
                                                        .subtract(1, "days")
                                                        .format("YYYY-MM-DD")
                                                );
                                            }
                                        );
                                    }

                                    if (
                                        hosp.backup.hasOwnProperty("로그축소")
                                    ) {
                                        hosp.backup["로그축소"] = _validate(
                                            hosp.backup["로그축소"],
                                            function (a) {
                                                return a !== "사용";
                                            }
                                        );
                                    }

                                    if (
                                        hosp.backup.hasOwnProperty("정품여부")
                                    ) {
                                        hosp.backup["정품여부"] =
                                            hosp.backup["정품여부"] === 1
                                                ? "Standard"
                                                : "Express";
                                        hosp.backup["정품여부"] = _validate(
                                            hosp.backup["정품여부"],
                                            function (a) {
                                                return a !== "Standard";
                                            }
                                        );
                                    }

                                    hosp.backup["수가"] = Math.max(
                                        hosp.backup["백업수가"],
                                        hosp.backup["센스수가"],
                                        hosp.backup["메디수가"]
                                    ).toString();
                                    hosp.backup["수가"] =
                                        hosp.backup["수가"] == 0
                                            ? ""
                                            : hosp.backup["수가"];
                                    hosp.backup["약가"] = Math.max(
                                        hosp.backup["백업약가"],
                                        hosp.backup["센스약가"],
                                        hosp.backup["메디약가"]
                                    ).toString();
                                    hosp.backup["약가"] =
                                        hosp.backup["약가"] == 0
                                            ? ""
                                            : hosp.backup["약가"];
                                    hosp.backup["재료"] = Math.max(
                                        hosp.backup["백업재료"],
                                        hosp.backup["센스재료"],
                                        hosp.backup["메디재료"]
                                    ).toString();
                                    hosp.backup["재료"] =
                                        hosp.backup["재료"] == 0
                                            ? ""
                                            : hosp.backup["재료"];

                                    
                                    if (
                                        hosp.backup.hasOwnProperty("수가") &&
                                        hosp.backup["수가"]
                                    ) {
                                        hosp.backup["수가"] = _validate(
                                            hosp.backup["수가"],
                                            function (a, b) {
                                                a = a.replace(/-/gim, "");
                                                b = b.replace(/-/gim, "");
                                                return a !== b;
                                            },
                                            hosp.backup["M수가"]
                                        );
                                    }
                                    if (
                                        hosp.backup.hasOwnProperty("약가") &&
                                        hosp.backup["약가"]
                                    ) {
                                        hosp.backup["약가"] = _validate(
                                            hosp.backup["약가"],
                                            function (a, b) {
                                                a = a.replace(/-/gim, "");
                                                b = b.replace(/-/gim, "");
                                                return a !== b;
                                            },
                                            hosp.backup["M약가"]
                                        );
                                    }
                                    if (
                                        hosp.backup.hasOwnProperty("재료") &&
                                        hosp.backup["재료"]
                                    ) {
                                        hosp.backup["재료"] = _validate(
                                            hosp.backup["재료"],
                                            function (a, b) {
                                                a = a.replace(/-/gim, "");
                                                b = b.replace(/-/gim, "");
                                                return a !== b;
                                            },
                                            hosp.backup["M재료"]
                                        );
                                    }

                                    if (
                                        hosp.backup.hasOwnProperty(
                                            "백업경로용량"
                                        )
                                    ) {
                                        hosp.backup["백업경로용량"] =
                                            hosp.backup["백업경로용량"] + "GB";
                                        hosp.backup["백업경로용량"] = _validate(
                                            hosp.backup["백업경로용량"],
                                            function (a) {
                                                a = a.replace("GB", "");
                                                return a < 100;
                                            }
                                        );
                                    }

                                    var tempObj = {
                                        "Extra": "",
                                        "Pacs": "",
                                        "Out": ""
                                    };
                                    if(hosp.extra.length > 0 ) {
                                        hosp.extra.forEach(function(item){
                                            if (item.hasOwnProperty("부가서비스")){
                                                if (tempObj.Extra !== "") tempObj.Extra += "/"
                                                tempObj.Extra += item['부가서비스'];
                                            }
                                        })
                                    }

                                    if (hosp.link.hasOwnProperty("Pacs")) {
                                        switch (parseInt(hosp.link['Pacs'])) {
                                            case 1: tempObj.Pacs = "Infinity Pacs" 
                                                break;
                                            case 2: tempObj.Pacs = "PacsPlus" 
                                                break;
                                            case 3: tempObj.Pacs = "PPCLinic" 
                                                break;
                                            case 4: tempObj.Pacs = "iview" 
                                                break;
                                            case 5: tempObj.Pacs = "의료영상기술" 
                                                break;
                                            case 6: tempObj.Pacs = "제노레이" 
                                                break;
                                            case 7: tempObj.Pacs = "후지 GE PACS" 
                                                break;
                                            case 8: tempObj.Pacs = "태영" 
                                                break;
                                            case 9: tempObj.Pacs = "Infinity Pacs" 
                                                break;
                                            case 10: tempObj.Pacs = "PPClinic(신버전)" 
                                                break;
                                            case 11: tempObj.Pacs = "iview" 
                                                break;
                                            case 12: tempObj.Pacs = "메디엔" 
                                                break;
                                            case 13: tempObj.Pacs = "Infinity Pacs(신버전)" 
                                                break;
                                            case 14: tempObj.Pacs = "테크하임" 
                                                break;
                                            case 15: tempObj.Pacs = "메디엔(신버전)" 
                                                break;
                                            case 16: tempObj.Pacs = "UBCare" 
                                                break;
                                            case 21: tempObj.Pacs = "테크하임(신버전)" 
                                                break;
                                            case 23: tempObj.Pacs = "CLIT" 
                                                break;
                                            case 25: tempObj.Pacs = "제로팍스" 
                                                break;
                                            case 26: tempObj.Pacs = "후지 PACS" 
                                                break;
                                            case 27: tempObj.Pacs = "GE 팍스" 
                                                break;
                                            case 28: tempObj.Pacs = "Medical Standard KMI" 
                                                break;
                                            case 24: tempObj.Pacs = "DenteeView(M&P)" 
                                                break;
                                            case 29: tempObj.Pacs = "HIPacs" 
                                                break;
                                            case 30: tempObj.Pacs = "제타팍스" 
                                                break;
                                            case 31: tempObj.Pacs = "PacsPlus(신버전[HISIF])" 
                                                break;
                                            case 18: tempObj.Pacs = "Infinity Pacs(탄방엠블)" 
                                                break;
                                            case 32: tempObj.Pacs = "엠디팍스" 
                                                break;
                                        }
                                    }

                                    if (hosp.link.hasOwnProperty("수탁검사정보")) {
                                        tempObj.Out = hosp.link['수탁검사정보'];
                                    }

                                    hosp.extra = tempObj.Extra;
                                    hosp.pacs = tempObj.Pacs;
                                    hosp.out = tempObj.Out;
                                    
                                }

                                resolve(hosp);
                            } catch (error) {
                                reject(error);
                            }
                        });
                    }

                    function _validate(value, fn, to) {
                        if (fn(value, to)) {
                            value += ' <i class="fa fa-times-circle"></i>';
                            value = '<span class="red">' + value + "</span>";
                        } else {
                            value += ' <i class="fa fa-check-circle"></i>';
                            value = '<span class="blue">' + value + "</span>";
                        }
                        return value;
                    }
                } catch (error) {
                    console.log(error);
                    reject(error);
                }
            });
        }

        function GetCustomerUniqInfo(req) {
            return new Promise(function (resolve, reject) {
                try {
                    console.log(req);
                    var params = req.query;
                    sQuery = `
                        -- 거래처 특이사항 조회
                        SELECT * FROM ${CONSTS.DB_NEOAS}.N_병원특이사항
                        WHERE USER_ID = ${params["USER_ID"]}
                    `;
                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            console.log(result);
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

        function GetCustomerMisu(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        -- 거래처 병원 미수금 조회
                        SELECT *
                        FROM (
                            (
                                SELECT CONVERT(CHAR(10), O.OUT_DATE, 120) AS 날짜,
                                        CASE O.OUT_GOODS_ID WHEN 0 THEN '자동' ELSE G.GOODS_NAME END AS 구분명,
                                        ISNULL(D.DANGA_NAME, O.OUT_GOODS_NAME) AS 명칭, O.OUT_AMT AS 수량,
                                        REPLACE( CONVERT( VARCHAR, CONVERT( MONEY, O.OUT_DANGA ), 1 ), '.00', '' ) AS 단가,
                                        REPLACE( CONVERT( VARCHAR, CONVERT( MONEY, (O.OUT_AMT * O.OUT_DANGA) ), 1 ), '.00', '' ) AS 총금액,
                                        '0' AS 입금액,
                                        REPLACE( CONVERT( VARCHAR, CONVERT( MONEY, ${CONSTS.DB_NEOAS}.cf_getCustomerMisu(O.OUT_DATE, O.OUT_GUBUN, O.OUT_USER) ), 1 ), '.00', '' ) AS 미수총액,
                                        O.OUT_MEMO AS 메모,
                                        O.OUT_DATE AS 정렬날짜
                                FROM ${CONSTS.DB_NEOCOMPANY}.NC_C_OUT AS O
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_G_DANGA AS D
                                ON D.DANGA_IDX = O.OUT_GOODS_ID
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_G_GOODS AS G
                                ON D.DANGA_GOODS_ID = G.GOODS_ID
                                WHERE O.OUT_GUBUN = 1
                                AND CAST(ISNULL(O.OUT_H_USERID, '') + ISNULL(O.OUT_N_USERID, '') AS INT) = ${params.id}
                                AND CONVERT(CHAR(10), O.OUT_DATE, 120) BETWEEN '${params.startDate}' AND '${params.endDate}'
                                --AND DATEDIFF("D", '${params.startDate}', O.OUT_DATE) >= 0
                                --AND DATEDIFF("D", '${params.endDate}', O.OUT_DATE) <= 0
                            )
                            UNION
                            (
                                SELECT CONVERT(CHAR(10), I.GUMAK_DATE, 120) AS 날짜,
                                        G.GOODS_NAME AS 구분명,
                                        D.DANGA_NAME AS 명칭, 1 AS 수량,
                                        REPLACE( CONVERT( VARCHAR, CONVERT( MONEY, -1 * I.GUMAK_GUMAK ), 1 ), '.00', '' ) AS 단가,
                                        '0' AS 총금액,
                                        REPLACE( CONVERT( VARCHAR, CONVERT( MONEY, I.GUMAK_GUMAK ), 1 ), '.00', '' ) AS 입금액,
                                        REPLACE( CONVERT( VARCHAR, CONVERT( MONEY, ${CONSTS.DB_NEOAS}.cf_getCustomerMisu(I.GUMAK_DATE, I.GUMAK_GUBUN, I.GUMAK_USERID) ), 1 ), '.00', '' ) AS 미수총액,
                                        I.GUMAK_MEMO AS 메모,
                                        I.GUMAK_DATE AS 정렬날짜
                                FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_GUMAK AS I
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_G_DANGA AS D
                                ON D.DANGA_IDX = I.GUMAK_CODE
                                LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_G_GOODS AS G
                                ON G.GOODS_ID = D.DANGA_GOODS_ID
                                WHERE I.GUMAK_GUBUN = 1
                                AND I.GUMAK_USERID = ${params.id}
                                AND CONVERT(CHAR(10), I.GUMAK_DATE, 120) BETWEEN '${params.startDate}' AND '${params.endDate}'
                                --AND DATEDIFF("D", '${params.startDate}', I.GUMAK_DATE) >= 0
                                --AND DATEDIFF("D", '${params.endDate}', I.GUMAK_DATE) <= 0
                            )
                        ) AS MISU
                        ORDER BY MISU.정렬날짜
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

        function GetVisitList(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;

                    params.date =
                        typeof params.date === "object"
                            ? params.date
                            : JSON.parse(params.date);
                    sQuery = `
                        -- 거래처 방문일지 리스트 조회
                        SELECT V.인덱스, V.USER_ID, V.내용, V.방문유형, V.첨부파일,
                            CASE V.방문유형
                                WHEN 1 THEN '정기'
                                WHEN 2 THEN '요청'
                                WHEN 3 THEN '긴급'
                                WHEN 4 THEN '영업'
                                WHEN 6 THEN '내근'
                                WHEN 7 THEN '당직'
                                WHEN 8 THEN '오픈'
                                ELSE '기타' END 유형,
                            CONVERT(VARCHAR(19), V.시작, 120) AS 시작, CONVERT(VARCHAR(19), V.종료, 120) AS 종료,
                            CASE WHEN ISNULL(V.실시작, '') = '' THEN '' ELSE CONVERT(VARCHAR(19), V.실시작, 120) END AS 실시작,
                            CASE WHEN ISNULL(V.실종료, '') = '' THEN '' ELSE CONVERT(VARCHAR(19), V.실종료, 120) END AS 실종료,
                            ISNULL(V.회사차량, '') AS 법인차, V.작성자, M.USER_NAME AS 작성자명, CONVERT(CHAR(19), V.작성일자, 120) AS 작성일자, V.컨버전,
                            ISNULL(H.USER_MED_ID, '') AS 기관코드, ISNULL(H.USER_MED_NAME, V.기관명칭) AS 기관명칭
                        FROM ${CONSTS.DB_NEOAS}.N_방문일지 AS V
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                        ON V.USER_ID = H.USER_ID
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON V.작성자 = M.USER_ID
                        WHERE 1 = 1
                    `;

                    if (params.date) {
                        if (params.date.month) {
                            sQuery += `AND CONVERT(CHAR(7), 시작, 120) = '${params.date.month}' AND CONVERT(CHAR(7), 종료, 120) = '${params.date.month}' `;
                        } else if (params.date.date) {
                            sQuery += `AND CONVERT(CHAR(10), 시작, 120) = '${params.date.date}' AND CONVERT(CHAR(10), 종료, 120) = '${params.date.date}' `;
                        } else if (params.date.start && params.date.end) {
                            sQuery += `AND CONVERT(CHAR(10), 시작, 120) >= '${params.date.start}' AND CONVERT(CHAR(10), 종료, 120) <= '${params.date.end}' `;
                        }
                    }

                    if (params.writer) {
                        sQuery += " AND V.작성자 = " + params.writer;
                    }

                    if (params.hospid) {
                        sQuery += " AND V.USER_ID = " + params.hospid;
                    }

                    if (params.search && params.search !== "") {
                        sQuery += " AND ( ";
                        sQuery +=
                            "     ISNULL(H.USER_MED_ID, '') LIKE '%" +
                            params.search +
                            "%'";
                        sQuery +=
                            " OR  ISNULL(H.USER_MED_NAME, V.기관명칭) LIKE '%" +
                            params.search +
                            "%'";
                        sQuery += " ) ";
                    }

                    sQuery += " Order By V.시작 DESC, V.종료 DESC ";
                    console.log(sQuery);

                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
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

        function GetVisit(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        -- 거래처 방문일지 상세정보 조회
                        SELECT  V.인덱스, V.USER_ID, V.방문유형, V.회사차량, V.내용,
                                V.작성자, M.USER_NAME AS 작성자명, V.작성일자, ISNULL(V.컨버전, 0) AS 컨버전,
                                CONVERT(CHAR(10), V.시작, 120) AS 시작, CONVERT(CHAR(5), V.시작, 108) AS 시작시간,
                                CONVERT(CHAR(10), V.종료, 120) AS 종료, CONVERT(CHAR(5), V.종료, 108) AS 종료시간,
                                CASE WHEN ISNULL(V.실시작, '') = '' THEN '' ELSE CONVERT(VARCHAR(19), V.실시작, 120) END AS 실시작,
                                CASE WHEN ISNULL(V.실종료, '') = '' THEN '' ELSE CONVERT(VARCHAR(19), V.실종료, 120) END AS 실종료,
                                ISNULL(H.USER_MED_NAME, V.기관명칭) AS 기관명칭,
                                ISNULL(V.첨부파일, '[]') AS 첨부파일
                        FROM ${CONSTS.DB_NEOAS}.N_방문일지 AS V
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                        ON V.USER_ID = H.USER_ID
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON V.작성자 = M.USER_ID
                        WHERE V.인덱스 = ${params.index}
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

        function GetVisitWriters(req) {
            return new Promise(function (resolve, reject) {
                try {
                    sQuery = `
                        -- 거래처 방문일지 작성자 리스트 조회
                        SELECT V.작성자, M.USER_NAME AS 작성자명
                        FROM ${CONSTS.DB_NEOAS}.N_방문일지 AS V
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON V.작성자 = M.USER_ID
                        GROUP BY V.작성자, M.USER_NAME
                    `;
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

        function GetCallList(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;

                    sQuery = `
                            -- 거래처 전화일지 리스트 조회
                            SELECT C.인덱스, C.USER_ID, CONVERT(VARCHAR(19), C.처리일자, 120) AS 처리일자, CONVERT(VARCHAR, C.작성일자, 120) AS 작성일자, C.작성자,
                                    ISNULL(C.프로그램, ISNULL(P.코드이름, '')) AS 프로그램, ISNULL(C.상태, 0) AS 상태, ISNULL(C.내용, '') AS 내용,
                                    ISNULL(H.USER_MED_ID, '') AS 기관코드, ISNULL(H.USER_MED_NAME, C.기관명칭) AS 기관명칭, W.USER_NAME AS 작성자명,
                                    ISNULL(A.AREA_NAME, '') AS 지사, ISNULL(M.USER_NAME, '') AS 담당자,
                                    ISNULL(C.문의내용, '') AS 문의내용, ISNULL(C.처리내용, '') AS 처리내용, ISNULL(C.기타, '') AS 기타,
                                    ISNULL(C.카테고리, '') AS 카테고리, ISNULL(HI.INFO_CONTRACT_DATE, '') AS 계약일, ISNULL(C.AS전달, 0) AS AS전달, ISNULL(TM.USER_NAME, '') AS AS처리자명,
                                    ISNULL(CONVERT(VARCHAR(10), EL.LOCK_START, 120), '') AS 잠금일자
                            FROM ${CONSTS.DB_NEOAS}.N_전화일지 AS C
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                            ON C.USER_ID = H.USER_ID
                            LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '프로그램') AS P
                            ON H.USER_PROGRAM = P.데이터1
                            INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS W
                            ON C.작성자 = W.USER_ID
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_INFO AS HI
                            ON C.USER_ID = HI.INFO_USER_ID
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A
                            ON HI.INFO_AREA = A.AREA_ID
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                            ON H.USER_담당자 = M.USER_ID
                            LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS TM
                            ON ISNULL(C.AS전달,0) = TM.USER_ID
                            LEFT JOIN (SELECT LOCK_ID, LOCK_START FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_EMRLOCK WHERE LOCK_PART = 2 AND LOCK_STAT = 1) AS EL
                            ON C.USER_ID = EL.LOCK_ID
                            WHERE 1 = 1

                    `;

                    if (params.writer) {
                        sQuery += " And C.작성자 = " + params.writer;
                    }

                    if (params.hospid) {
                        sQuery += " AND C.USER_ID = " + params.hospid;
                    }

                    if (params.search) {
                        sQuery += " And ( ";
                        sQuery +=
                            "         H.USER_MED_NAME Like '%" +
                            params.search +
                            "%' ";
                        sQuery +=
                            "     Or  H.USER_MED_ID Like '%" +
                            params.search +
                            "%' ";
                        sQuery +=
                            "     Or  CONVERT(varchar, C.처리일자, 120) Like '%" +
                            params.search +
                            "%' ";
                        sQuery +=
                            "     Or  ISNULL(C.문의내용, '') LIKE '%" +
                            params.search +
                            "%' ";
                        sQuery +=
                            "     Or  ISNULL(C.처리내용, '') LIKE '%" +
                            params.search +
                            "%' ";
                        sQuery +=
                            "     Or  ISNULL(C.기타, '') LIKE '%" +
                            params.search +
                            "%' ";
                        //sCondition += "     Or
                        sQuery += " )";
                    }

                    if (params.program) {
                        //sQuery += ' AND H.USER_PROGRAM IN ( ' + params.program + ') ';
                        sQuery +=
                            " AND ISNULL(C.프로그램, ISNULL(P.코드이름, '')) IN ('" +
                            params.program.replace(/,/gim, "','") +
                            "') ";
                    }

                    if (params.index) {
                        sQuery += " AND C.인덱스 = " + params.index;
                    }

                    if (params.status) {
                        if (params.status !== "") {
                            sQuery +=
                                " AND ISNULL(C.상태, 0) = " + params.status;
                        }
                    }
                    console.log(params);
                    if (params.date) {
                        // params.date = JSON.parse(params.date);
                        params.date =
                            typeof params.date === "object"
                                ? params.date
                                : JSON.parse(params.date);
                        if (params.date.month) {
                            sQuery += ` AND CONVERT(CHAR(7), C.처리일자, 120) = '${params.date.month}' `;
                        } else if (params.date.date) {
                            sQuery += ` AND CONVERT(CHAR(10), C.처리일자, 120) = '${params.date.date}' `;
                        } else if (params.date.start && params.date.end) {
                            sQuery += ` AND CONVERT(CHAR(10), C.처리일자, 120) BETWEEN '${params.date.start}' AND '${params.date.end}' `;
                        }
                    } else if (params.start && params.end) {
                        sQuery += ` AND C.처리일자 BETWEEN '${params.start}' AND '${params.end}' `;
                    }
                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
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

        function GetCallWriters(req) {
            return new Promise(function (resolve, reject) {
                try {
                    sQuery = `
                        -- 거래처 전화일지 작성자 리스트 조회
                        SELECT C.작성자, W.USER_NAME AS 작성자명
                        FROM ${CONSTS.DB_NEOAS}.N_전화일지 AS C
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS W
                        ON C.작성자 = W.USER_ID
                        GROUP BY C.작성자, W.USER_NAME
                    `;
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

        // 이건.. Service.js 로 옮겨야하나..
        function GetServiceList(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    params.date = JSON.parse(params.date);

                    sQuery = `
                        -- 거래처 AS 리스트 조회

                        SELECT S.인덱스, S.접수자, S.연락처, CONVERT(CHAR(10), S.접수일자, 120) AS 접수일자, S.상태, S.타입,
                                CASE S.상태 WHEN 0 THEN '접수'
                                            WHEN 1 THEN '공유'
                                            WHEN 2 THEN '처리'
                                            WHEN 3 THEN '보류'
                                            WHEN 4 THEN '완료'
                                            WHEN 5 THEN '취소'
                                            WHEN 6 THEN '피드백'
                                            WHEN 7 THEN '확인'  END AS 상태명,

                                            ISNULL(S.확인자, 0) AS 확인자, Convert(char(19), S.확인일자 , 120) AS 확인일자, ISNULL(CC.USER_NAME, '') AS 확인자명,
                                            ISNULL(S.공유자, 0) AS 공유자, Convert(char(19), S.공유일자 , 120) AS 공유일자, ISNULL(C.USER_NAME, '') AS 공유자명,
                                            ISNULL(S.보류자, 0) AS 보류자, Convert(char(19), S.보류일자 , 120) AS 보류일자, ISNULL(H.USER_NAME, '') AS 보류자명,
                                            ISNULL(S.처리자, 0) AS 처리자, Convert(char(19), S.처리일자 , 120) AS 처리일자, ISNULL(P.USER_NAME, '') AS 처리자명,
                                            ISNULL(S.완료자, 0) AS 완료자, Convert(char(19), S.완료일자 , 120) AS 완료일자, ISNULL(D.USER_NAME, '') AS 완료자명,
                                            ISNULL(S.피드백자, 0) AS 피드백자, Convert(char(19), S.피드백일자 , 120) AS 피드백일자, ISNULL(F.USER_NAME, '') AS 피드백자명,

                                --ISNULL(C.USER_NAME, '') AS 공유자,
                                --CONVERT(VARCHAR, S.공유일자, 120) AS 공유일자,
                                --ISNULL(P.USER_NAME, '') AS 처리자,
                                --CONVERT(VARCHAR, S.처리일자, 120) AS 처리일자,
                                --ISNULL(D.USER_NAME, '') AS 완료자,
                                --CONVERT(VARCHAR, S.완료일자, 120) AS 완료일자,
                                --ISNULL(H.USER_NAME, '') AS 보류자,
                                --CONVERT(VARCHAR, S.보류일자, 120) AS 보류일자,
                                ISNULL(S.문의내용, '') AS 문의내용,
                                ISNULL(S.확인내용, '') AS 확인내용,
                                ISNULL(S.처리내용, '') AS 처리내용,
                                ISNULL(S.보류내용, '') AS 보류내용,
                                ISNULL(S.전달내용, '') AS 전달내용
                        FROM ${CONSTS.DB_NEOAS}.N_서비스 AS S
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS C
                        ON S.공유자 = C.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS P
                        ON S.처리자 = P.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS D
                        ON S.완료자 = D.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS F
                        ON S.피드백자 = F.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS H
                        ON S.보류자 = H.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS CC
                        ON S.확인자 = CC.USER_ID
                        WHERE S.기관코드 = '${params["hospnum"]}'
                        AND CONVERT(CHAR(10), S.접수일자, 120) BETWEEN '${params.date.start}' AND '${params.date.end}'
                        AND S.상태 <> ${CONSTS.SERVICE_STATUS.CANCEL}

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

        function GetHospitalInfoByHospNum(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        SELECT * FROM ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_INFO AS HI
                        ON H.USER_ID = HI.INFO_USER_ID
                        WHERE USER_MED_ID = '${params.hospitalNum}'
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

        function GetHospitalConfirmVersion(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    var isNeedUpdate = false;
                    var isMedi = false;

                    if (!params.force) {
                        params.force = 0;
                    }
                    
                    if (params.medi) {
                        isMedi = true;
                    }

                    if (versions[params.hospnum] && versions[params.hospnum].updateTime && params.force == 0) {
                        if (moment().diff(versions[params.hospnum].updateTime, "hours") >= 1) {
                            isNeedUpdate = true;
                        } else if (versions[params.hospnum].version['승인버전'].trim() != "" && versions[params.hospnum].version['현재버전'] != versions[params.hospnum].version['승인버전']) {
                            isNeedUpdate = true;
                        }
                    } else {
                        isNeedUpdate = true;
                    }

                    if (isNeedUpdate) {
                        if (isMedi) {
                            sQuery = `
                                Select 
                                    ISNULL(L.현재버전, '') AS 현재버전, ISNULL(L.승인버전, '') AS 승인버전, ISNULL(B.배포버전, '') AS 배포버전, 
                                    ISNULL(L.자동업데이트경로, '') AS 자동업데이트경로, 0 AS 긴급셋업,
                                    '' AS 긴급버전, '' AS 서버아이피, '' AS SQLNAME 
                                    FROM ${CONSTS.DB_OCS}.TB_Live승인버전 AS L
                                    LEFT JOIN ${CONSTS.DB_OCS}.TB_네오라이브 AS B
                                    ON L.승인버전 = B.배포버전
                                    WHERE L.요양기관기호 = '${params.hospnum}'                            
                            `;
                        } else {
                            sQuery = `
                                SELECT ISNULL(A.현재버전, '') AS 현재버전, ISNULL(A.승인버전, '') AS 승인버전, ISNULL(B.배포버전, '') AS 배포버전,
                                    ISNULL(A.자동업데이트경로, '') AS 자동업데이트경로, ISNULL(A.긴급셋업, 0) AS 긴급셋업,
                                    (Select Top 1 ISNULL(배포버전, '') AS 긴급버전 FROM ${CONSTS.DB_OCS}.TB_센스라이브 ORDER BY 배포버전 DESC)  AS 긴급버전,
                                    ISNULL(A.아이피, '') AS 서버아이피, ISNULL(A.SQLNAME, '') AS SQLNAME
                                FROM ${CONSTS.DB_OCS}.SS_기관정보 AS A
                                LEFT JOIN ${CONSTS.DB_OCS}.TB_센스라이브 AS B
                                ON A.승인버전 = B.배포버전
                                WHERE 요양기관코드 = '${params.hospnum}'                        
                            `;
                        }
                        console.log(sQuery);
                        _database
                            .RecordSet(sQuery)
                            .then(function (result) {
                                console.log(result.recordset);
                                if (result.recordset.length === 1) {
                                    versions[params.hospnum] = {
                                        version: result.recordset[0],
                                        updateTime: moment()
                                    };

                                    resolve(result.recordset[0]['현재버전'] + '|' +
                                        result.recordset[0]['승인버전'] + '|' +
                                        result.recordset[0]['긴급셋업'] + '|' +
                                        result.recordset[0]['자동업데이트경로'] + '|' +
                                        result.recordset[0]['배포버전'] + '|' +
                                        result.recordset[0]['긴급버전'] + '|' +
                                        result.recordset[0]['서버아이피'] + '|' +
                                        result.recordset[0]['SQLNAME']
                                    )
                                } else {
                                    resolve('');
                                }

                                // resolve(result.recordset);
                            })
                            .catch(function (error) {
                                reject(error);
                            });
                    } else {
                        var hospVersion = versions[params.hospnum].version;
                        resolve(
                            hospVersion['현재버전'] + '|' +
                            hospVersion['승인버전'] + '|' +
                            hospVersion['긴급셋업'] + '|' +
                            hospVersion['자동업데이트경로'] + '|' +
                            hospVersion['배포버전'] + '|' +
                            hospVersion['긴급버전'] + '|' +
                            hospVersion['서버아이피'] + '|' +
                            hospVersion['SQLNAME']
                        )
                    }


                } catch (error) {
                    reject(error);
                }
            });
        }

        return {
            Customers: GetCustomers,
            Customer: GetCustomerInfo,
            UniqInfo: GetCustomerUniqInfo,
            Misu: GetCustomerMisu,
            Visits: GetVisitList,
            VisttWriters: GetVisitWriters,
            Visit: GetVisit,
            Calls: GetCallList,
            CallWriters: GetCallWriters,
            Services: GetServiceList,
            CustomerFee: GetCustomerFee,
            HospitalInfoByHospNum: GetHospitalInfoByHospNum,
            Version: GetHospitalConfirmVersion
        };
    })();

    var cInsert = (function () {
        function InsertVisit(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;

                    var start =
                        params.start.date + " " + params.start.time + ":00";
                    var end = params.end.date + " " + params.end.time + ":00";

                    params.comment = params.comment.replace(/'/gim, "''");

                    if (params.uploads && params.uploads.length > 0) {
                        params.uploads = JSON.stringify(params.uploads);
                    } else {
                        params.uploads = "[]";
                    }


                    sQuery = `
                        -- 거래처 방문일지 작성
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_방문일지 (
                            USER_ID, 방문유형, 회사차량,
                            시작, 종료, 내용,
                            작성자, 작성일자,
                            기관명칭, 첨부파일
                        )
                        VALUES (
                            ${params["USER_ID"]}, ${params["type"]}, '${params["car"]}',
                            '${start}', '${end}', '${params["comment"]}',
                            ${params["writer"]}, GETDATE(),
                            '${params["hospital"]}', '${params['uploads']}'
                        )
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

        function InsertCall(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;

                    params.comment = params.comment.replace(/'/gim, "''");

                    sQuery = `
                        -- 거래처 전화일지 작성
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_전화일지 (
                            USER_ID, 기관명칭, 처리일자,
                            상태, --내용,
                            작성자, 작성일자,
                            문의내용, 처리내용, 기타,
                            프로그램, 카테고리, AS전달
                        )
                        VALUES (
                            ${params["USER_ID"]}, '${params["hospital"]}', '${params["date"]}',
                            ${params["status"]},
                            ${params["writer"]}, GETDATE(),
                            '${params["question"]}', '${params["treat"]}', '${params["etc"]}',
                            '${params["program"]}', '${params["category"]}', ${params["transferAS"]}
                        )
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

        function InsertCustomerRemoteInfo(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        -- 거래처 원격정보 저장
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_병원특이사항
                        (
                            USER_ID, 원격서버, 원격아이디,
                            원격비번, 스탠바이이름, 스탠바이비번,
                            수정자, 수정일자
                        )
                        VALUES (
                            ${params["user_id"]}, '${params["seetrol_server"]}', '${params["seetrol_id"]}',
                            '${params["seetrol_pwd"]}', '${params["seetrol_standby_id"]}', '${params["seetrol_standby_password"]}',
                            ${params["user"]["인덱스"]}, GETDATE()
                        )
                    `;
                    console.log(sQuery);
                    _database
                        .Execute(sQuery)
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

        function InsertCustomerUniqInfo(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        -- 거래처 특이사항 저장
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_병원특이사항
                        (
                            USER_ID, 병원유형, 전산담당,
                            결제담당, 메모, 기관코드, 메모2,
                            수정자, 수정일자
                        )
                        VALUES (
                            ${params["user_id"]}, '${params["specific-relation"]}', '${params["specific-electro"]}',
                            '${params["specific-account"]}', '${params["specific-memo1"]}', '${params["hospnum"]}', '${params["specific-memo2"]}',
                            ${params["user"]["인덱스"]}, GETDATE()
                        )
                    `;
                    console.log(sQuery);
                    _database
                        .Execute(sQuery)
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

        function InsertCustomerSettleMemo(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        -- 거래처 특이사항 저장
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_병원특이사항
                        (
                            USER_ID, 정산메모
                        )
                        VALUES (
                            ${params["id"]}, '${params["memo"]}'
                        )
                    `;
                    console.log(sQuery);
                    _database
                        .Execute(sQuery)
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

        function InsertCustomerFee(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_관리수당
                        VALUES ( ${params.id}, ${params.fee})
                    `;
                    console.log(sQuery);
                    _database
                        .Execute(sQuery)
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

        return {
            Visit: InsertVisit,
            Call: InsertCall,
            RemoteInfo: InsertCustomerRemoteInfo,
            UniqInfo: InsertCustomerUniqInfo,
            SettleMemo: InsertCustomerSettleMemo,
            CustomerFee: InsertCustomerFee
        };
    })();

    var cUpdate = (function () {
        function UpdateVisit(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    var start =
                        params.start.date + " " + params.start.time + ":00";
                    var end = params.end.date + " " + params.end.time + ":00";

                    if (params.uploads && params.uploads.length > 0) {
                        params.uploads = JSON.stringify(params.uploads);
                        params.uploads = params.uploads.replace(/\\/gim, "\\");
                    } else {
                        params.uploads = "[]";
                    }

                    params.comment = params.comment.replace(/'/gim, "''");

                    sQuery = `
                        -- 거래처 방문일지 수정
                        UPDATE ${CONSTS.DB_NEOAS}.N_방문일지
                        SET USER_ID = ${params["USER_ID"]},
                            회사차량 = '${params["car"]}',
                            방문유형 = ${params["type"]},
                            시작 = '${start}',
                            종료 = '${end}',
                            내용 = '${params["comment"]}',
                            작성자 = ${params["writer"]},
                            작성일자 = GETDATE(),
                            기관명칭 = '${params["hospital"]}',
                            첨부파일 = '${params["uploads"]}'
                        Where 인덱스 = ${params["index"]}
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

        function UpdateCall(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;

                    params.comment = params.comment.replace(/'/gim, "''");

                    sQuery = `
                        -- 거래처 전화일지 수정
                        UPDATE ${CONSTS.DB_NEOAS}.N_전화일지
                        SET USER_ID = ${params["USER_ID"]},
                            기관명칭 = '${params["hospital"]}',
                            처리일자 = '${params["date"]}',
                            상태 = ${params["status"]},
                            내용 = '',
                            문의내용 = '${params["question"]}',
                            처리내용 = '${params["treat"]}',
                            기타 = '${params["etc"]}',
                            프로그램 = '${params["program"]}',
                            카테고리 = '${params["category"]}',
                            -- 차트AS = ${params["chartAS"]},
                            AS전달 = ${params["transferAS"]},
                            작성일자 = GETDATE()
                        Where 인덱스 = ${params["index"]}
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

        function UpdateVisitTime(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;

                    sQuery = `
                        -- 거래처 실방문시간 저장
                        UPDATE ${CONSTS.DB_NEOAS}.N_방문일지
                        SET {{VISITTIME}}
                        Where 인덱스 = ${params["index"]}
                    `;

                    if (params.type === "start") {
                        sQuery = sQuery.replace(
                            "{{VISITTIME}}",
                            " 실시작 = '" + params.time + "' "
                        );
                    } else {
                        sQuery = sQuery.replace(
                            "{{VISITTIME}}",
                            " 실종료 = '" + params.time + "' "
                        );
                    }

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

        function UpdateCustomerRemoteInfo(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;

                    sQuery = `
                        -- 거래처 원격정보 수정
                        UPDATE ${CONSTS.DB_NEOAS}.N_병원특이사항
                        SET 원격서버 = '${params["seetrol_server"]}',
                            원격아이디 = '${params["seetrol_id"]}',
                            원격비번 = '${params["seetrol_pwd"]}',
                            스탠바이이름 = '${params["seetrol_standby_id"]}',
                            스탠바이비번 = '${params["seetrol_standby_password"]}',
                            수정자 = ${params["user"]["인덱스"]},
                            수정일자 = GETDATE()
                        WHERE USER_ID = '${params["user_id"]}'
                    `;

                    _database
                        .Execute(sQuery)
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

        function UpdateCustomerUniqInfo(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;

                    sQuery = `
                        -- 거래처  특이사항 수정
                        UPDATE ${CONSTS.DB_NEOAS}.N_병원특이사항
                        SET 기관코드 = '${params["hospnum"]}',
                            병원유형 = '${params["specific-relation"]}',
                            전산담당 = '${params["specific-electro"]}',
                            결제담당 = '${params["specific-account"]}',
                            메모 = '${params["specific-memo1"]}',
                            메모2 = '${params["specific-memo2"]}',
                            수정자 = ${params["user"]["인덱스"]},
                            수정일자 = GETDATE()
                        WHERE USER_ID = '${params["user_id"]}'
                    `;

                    _database
                        .Execute(sQuery)
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

        function UpdateCustomerSettleMemo(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;

                    sQuery = `
                        -- 거래처  특이사항 수정
                        UPDATE ${CONSTS.DB_NEOAS}.N_병원특이사항
                        SET 정산메모 = '${params.memo}'
                        WHERE USER_ID = '${params["id"]}'
                    `;

                    _database
                        .Execute(sQuery)
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

        function UpdateCustomerFee(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_관리수당
                        SET 관리수당 = ${params.fee}
                        WHERE 거래처ID = ${params.id}
                    `;
                    console.log(sQuery);
                    _database
                        .Execute(sQuery)
                        .then(function (result) {
                            if (result.rowsAffected[0] === 0) {
                                return cInsert.CustomerFee(req);
                            } else {
                                resolve(result);
                            }
                        })
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

        //거래처 승인버전 / 현재버전 바꾸기
        function UpdateCustomerVersion(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    var update = '';
                    // 현재버전
                    if (params['type'] == 1) {
                        update = '현재버전 '
                        // 승인버전
                    } else if (params['type'] == 2) {
                        update = '승인버전 '
                    } else {
                        throw 'type 값 오류'
                    }

                    if(params.medi) { 
                        sQuery = `
                            UPDATE ${CONSTS.DB_OCS}.TB_LIVE승인버전
                            SET ${update} = '${params.version}'
                            WHERE 요양기관기호 = '${params.hospnum}'
                        `;
                    } else {
                        sQuery = `
                            UPDATE ${CONSTS.DB_OCS}.SS_기관정보
                            SET ${update} = '${params.version}'
                            WHERE 요양기관코드 = '${params.hospnum}'
                        `;
                    }
                    console.log(sQuery);
                    _database
                        .Execute(sQuery)
                        .then(function (result) {
                            resolve(result);
                        })
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

        return {
            Visit: UpdateVisit,
            VisitTime: UpdateVisitTime,
            Call: UpdateCall,
            RemoteInfo: UpdateCustomerRemoteInfo,
            UniqInfo: UpdateCustomerUniqInfo,
            SettleMemo: UpdateCustomerSettleMemo,
            CustomerFee: UpdateCustomerFee,
            Version: UpdateCustomerVersion
        };
    })();

    var cDelete = (function () {
        function DeleteVisit(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;

                    sQuery = `
                        -- 거래처 방문일지 삭제
                        DELETE FROM ${CONSTS.DB_NEOAS}.N_방문일지
                        Where 인덱스 = ${params["index"]}
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

        function DeleteCall(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;

                    sQuery = `
                        -- 거래처 전화일지 삭제
                        DELETE FROM ${CONSTS.DB_NEOAS}.N_전화일지
                        Where 인덱스 = ${params["index"]}
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
            Visit: DeleteVisit,
            Call: DeleteCall
        };
    })();

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    };
};

module.exports = customer;
