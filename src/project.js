var CONSTS = require('./config').CONSTS;

var project = function (database, fm) {
    var _database = database;
    var sQuery = '';

    var cFind = (function () {

        function FindProjectList(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    var date = JSON.parse(params.date)
                    sQuery = `
                        -- 프로젝트 리스트 조회
                        SELECT  P.인덱스, P.프로젝트명, P.프로그램, P.상태, P.등록자,
                                M.USER_NAME AS 등록자명, CONVERT(CHAR(19), P.등록일자, 120) AS 등록일자,
                                P.기대효과, p.상세내용, CONVERT(CHAR(19), P.수정일자, 120) AS 수정일자,
                                ISNULL( (SELECT COUNT(인덱스) FROM ${CONSTS.DB_NEOAS}.N_프로젝트HIS WHERE 프로젝트ID = P.인덱스), 0) AS 댓글,
                                ISNULL(P.정산, 0) AS 정산
                        FROM ${CONSTS.DB_NEOAS}.N_프로젝트 AS P
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON P.등록자 = M.USER_ID
                        WHERE 1 = 1
                        AND ISNULL(P.삭제, 0) = 0
                        AND CONVERT(CHAR(10), P.등록일자, 120) BETWEEN '${date.start}' AND '${date.end}'
                    `;

                    if (params.program) {
                        sQuery += ' AND P.프로그램 IN (' + params.program + ')';
                    }

                    if (params.status) {
                        sQuery += ' AND P.상태 = ' + params.status;
                    }

                    sQuery += `;
                        SELECT  PD.프로젝트ID, PD.개발자, M.USER_NAME AS 개발자명, PD.책임자
                        FROM    ${CONSTS.DB_NEOAS}.N_프로젝트DEV AS PD
                        INNER JOIN ${CONSTS.DB_NEOAS}.N_프로젝트 AS P
                        ON  PD.프로젝트ID = P.인덱스
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON  PD.개발자 = M.USER_ID
                        WHERE 1 = 1
                        AND ISNULL(P.삭제, 0) = 0
                    `;

                    if (params.program) {
                        sQuery += ' AND P.프로그램 IN (' + params.program + ')';
                    }

                    if (params.status) {
                        sQuery += ' AND P.상태 = ' + params.status;
                    }

                    sQuery += ' ORDER BY PD.책임자 DESC ';


                    console.log(sQuery);

                    _database.RecordSet(sQuery)
                        .then(function (result) {

                            var projects = result.recordsets[0];
                            var projectsDevelopers = result.recordsets[1];

                            projects.forEach(function (prj) {
                                prj['참여자'] = projectsDevelopers.filter(function (dev) {
                                    return dev['프로젝트ID'] === prj['인덱스'];
                                });
                            }, this);

                            resolve(projects);

                        })
                        .catch(function (error) {
                            console.log(error);
                            reject(error);
                        })

                } catch (error) {
                    console.log(error);
                    reject(error);
                }
            })
        }

        function FindDevelopers(req) {
            return new Promise(function (resolve, reject) {
                try {
                    sQuery = `
                        -- 개발자 리스트 조회
                        SELECT PD.개발자, M.USER_NAME AS 개발자명
                        FROM    ${CONSTS.DB_NEOAS}.N_프로젝트DEV AS PD
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON PD.개발자 = M.USER_ID
                        INNER JOIN ${CONSTS.DB_NEOAS}.N_프로젝트 AS P
                        ON PD.프로젝트ID = P.인덱스
                        AND ISNULL(P.삭제, 0) = 0
                        GROUP BY PD.개발자, M.USER_NAME
                    `;

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

        function FindWriters(req) {
            return new Promise(function (resolve, reject) {
                try {
                    sQuery = `
                        -- 프로젝트 작성자 리스트 조회
                        SELECT PW.등록자, M.USER_NAME AS 등록자명
                        FROM    ${CONSTS.DB_NEOAS}.N_프로젝트 AS PW
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON PW.등록자 = M.USER_ID
                        AND ISNULL(PW.삭제, 0) = 0
                        GROUP BY PW.등록자, M.USER_NAME
                        ORDER BY 등록자명
                    `;

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

        function FindProject(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        -- 프로젝트 상세정보 조회
                        SELECT  P.인덱스, P.프로젝트명, P.프로그램, P.요청거래처, P.상세내용, P.기대효과,
                                CONVERT(CHAR(19), P.등록일자, 120) AS 등록일자, CONVERT(CHAR(19), P.수정일자, 120) AS 수정일자, ISNULL(CONVERT(VARCHAR(10),P.개발종료일,120), '') AS 개발종료일,
                                CASE ISNULL(P.개발비용, 0)
                                    WHEN 1 THEN '해당병원만 데이터베이스 튜닝작업 (5,000원)'
                                    WHEN 2 THEN '해당병원만 필요로 하는 기능 (요양기관기호 적용하는 경우) (3,000원)'
                                    WHEN 3 THEN '기능요청으로 인한 폼, 클래스, 테이블, 필드 추가 작업 (10,000원)'
                                    WHEN 4 THEN '옵션추가 작업 (5,000원)'
                                    WHEN 5 THEN '출력기능 추가 (10,000원)'
                                    WHEN 6 THEN '새로운 프로그램 개발 (고객에게 견적서 제공이 필요할 정도) (50,000원 또는 견적금액의 5%)'
                                    WHEN 7 THEN '기타 추가 작업 (3,000원)' ELSE '' END AS 개발유형,
                                ISNULL(P.개발비용, 0) AS 개발유형ID,
                                CASE    P.상태  WHEN 0 THEN '접수'
                                                WHEN 1 THEN '회의중'
                                                WHEN 2 THEN '개발중'
                                                WHEN 3 THEN '개발테스트'
                                                WHEN 4 THEN '개발완료'
                                                WHEN 5 THEN '사용테스트'
                                                WHEN 6 THEN '완료'
                                                WHEN 7 THEN '보류'
                                                WHEN 10 THEN '취소' END AS 상태명,
                                P.상태,
                                P.등록자, PM.USER_NAME AS 등록자명,
                                PP.코드이름 AS 프로그램명,
                                ( SELECT 개발자 FROM ${CONSTS.DB_NEOAS}.N_프로젝트DEV WHERE 프로젝트ID = P.인덱스 AND 책임자 = 1) AS 책임자
                        FROM ${CONSTS.DB_NEOAS}.N_프로젝트 AS P
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS PM
                        ON P.등록자 = PM.USER_ID
                        LEFT JOIN ( SELECT 코드이름, 데이터1 FROM ${CONSTS.DB_NEOCOMPANY}.NC_N_CODE WHERE 코드구분 = '프로그램' ) AS PP
                        ON P.프로그램 = PP.데이터1
                        WHERE P.인덱스 = ${params['index']};

                        SELECT PD.*, PM.USER_NAME AS 개발자명
                        FROM ${CONSTS.DB_NEOAS}.N_프로젝트DEV PD
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS PM
                        ON PD.개발자 = PM.USER_ID
                        WHERE 프로젝트ID = ${params['index']};

                        SELECT PR.인덱스, PR.프로젝트ID, PR.구분, PR.내용, PR.작성자, CONVERT(CHAR(19), PR.작성일자, 120) AS 작성일자, PM.USER_NAME AS 작성자명, ISNULL(PR.첨부파일, '[]') AS 첨부파일
                        FROM ${CONSTS.DB_NEOAS}.N_프로젝트HIS AS PR
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS PM
                        ON PR.작성자 = PM.USER_ID
                        WHERE PR.프로젝트ID = ${params['index']}
                        OR ( 구분 = -1 AND PR.프로젝트ID IN ( SELECT 인덱스 FROM ${CONSTS.DB_NEOAS}.N_프로젝트HIS WHERE 프로젝트ID = ${params.index}) );

                    `;

                    console.log(sQuery);

                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            fm.GetFiles('project/' + result.recordset[0]['인덱스'])
                                .then(function (files) {
                                    // console.log(files);
                                    resolve({
                                        info: result.recordsets[0][0],
                                        dev: result.recordsets[1],
                                        replys: result.recordsets[2],
                                        files: files
                                    });
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    resolve({
                                        info: result.recordsets[0][0],
                                        dev: result.recordsets[1],
                                        replys: result.recordsets[2],
                                        files: []
                                    });
                                })

                        })
                        .catch(function (error) {
                            console.log(error);
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            })
        }

        return {
            Projects: FindProjectList,
            Project: FindProject,
            Developers: FindDevelopers,
            Writers: FindWriters
        }

    })();

    var cInsert = (function () {
        function InsertProject(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        -- 프로젝트 등록
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_프로젝트
                        (
                            프로젝트명, 프로그램, 요청거래처, 상세내용, 기대효과,
                            등록자, 등록일자, 수정일자, 삭제, 상태
                        )
                        VALUES
                        (
                            '${params['project-title']}', ${params['project-program']}, '${params['project-requester']}',
                            '${params['project-detail']}', '${params['project-effect']}',
                            ${params['project-writer']}, GETDATE(), GETDATE(), 0, 0
                        );

                    `;

                    console.log(sQuery);
                    _database.Execute(sQuery)
                        .then(function (result) {
                            sQuery = `
                            -- 신규 등록 프로젝트 인덱스 조회
                            SELECT MAX(인덱스) AS 인덱스 FROM ${CONSTS.DB_NEOAS}.N_프로젝트
                            WHERE 등록자 = ${params['project-writer']}
                            AND     CONVERT(DATE, 등록일자) = CONVERT(DATE, GETDATE())
                        `;
                            return _database.RecordSet(sQuery);
                        })
                        .then(function (result) {
                            console.log(result);
                            resolve(result.recordset[0]);
                        })
                        .catch(function (error) {
                            reject(error);
                        });

                } catch (error) {
                    reject(error);
                }
            })
        }

        return {
            Project: InsertProject
        }
    })();

    var cUpdate = (function () {

        function UpdateProject(req) {
            return new Promise(function (resolve, reject) {
                try {

                    var params = req.body;


                    sQuery = `
                        -- 프로젝트 수정
                        UPDATE ${CONSTS.DB_NEOAS}.N_프로젝트
                        SET 프로젝트명 = '${params['project-title']}',
                            프로그램 = ${params['project-program']},
                            요청거래처 = '${params['project-requester']}',
                            상세내용 = '${params['project-detail']}',
                            기대효과 = '${params['project-effect']}',
                            상태 = ${params['project-status']},
                            개발종료일 = '${ params['project-developer'].length ? params['project-development-period'] : ''}',
                            개발비용 = ${params['project-development-type'] ? params['project-development-type'] : 0},
                            수정일자 = GETDATE()
                        WhERE 인덱스 = ${params['project-index']};
                    `;

                    if (params['project-developer'].length) {
                        sQuery += `
                            DELETE FROM ${CONSTS.DB_NEOAS}.N_프로젝트DEV
                            WHERE 프로젝트ID = ${params['project-index']};
                        `;

                        params['project-developer'].forEach(function (dev) {
                            sQuery += `
                                INSERT INTO ${CONSTS.DB_NEOAS}.N_프로젝트DEV
                                (
                                    프로젝트ID, 개발자, 책임자
                                )
                                VALUES
                                (
                                    ${params['project-index']}, ${dev}, ${dev === params['project-manager'] ? 1 : 0}
                                );
                            `
                        });
                    }
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
                    reject(error);
                }
            })
        }

        function UpdateProjectIncentive(req) {
            return new Promise(function (resolve, reject) {
                try {

                    var params = req.body;
                    sQuery = `
                        -- 프로젝트 수정
                        UPDATE ${CONSTS.DB_NEOAS}.N_프로젝트
                        SET 정산 = '${params['incentive']}'
                        WhERE 인덱스 = ${params['index']};
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

                } catch (error) {
                    reject(error);
                }
            })
        }


        return {
            Project: UpdateProject,
            ProjectIncentive: UpdateProjectIncentive
        };

    })();

    var cDelete = (function () {
        function DeleteProject(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        -- 프로젝트 삭제
                        DELETE FROM ${CONSTS.DB_NEOAS}.N_프로젝트
                        WHERE 인덱스 = ${params['index']};

                        DELETE FROM ${CONSTS.DB_NEOAS}.N_프로젝트DEV
                        WHERE 프로젝트ID = ${params['index']};

                        DELETE FROM ${CONSTS.DB_NEOAS}.N_프로젝트HIS
                        WHERE 프로젝트ID = ${params['index']};

                    `;

                    _database.Execute(sQuery)
                        .then(function (result) {
                            resolve();
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
            Project: DeleteProject
        }

    })();

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    };
}

module.exports = project;
