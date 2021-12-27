var CONSTS = require("./config").CONSTS;
var moment = require("moment");

var board = function(database) {
    var _database = database;
    var sQuery = "";

    var cFind = (function() {
        function FindBoardList(req) {
            return new Promise(function(resolve, reject) {
                try {
                    var params = req || {
                        use: false,
                        permission: null
                    };

                    sQuery = `
                        -- 게시판 리스트 조회
                        SELECT  B.게시판ID, B.명칭, B.사용, B.설명, B.아이콘, B.생성자, B.댓글, ISNULL(B.메인표시, 0) AS 메인표시, -- ISNULL(B.형식, 0) AS 형식,
                                CONVERT(CHAR(10), B.생성일자, 120) AS 생성일자, ISNULL(B.수정제한, 0) AS 수정제한,
                                M.USER_NAME AS 생성자명, ISNULL(B.권한, '') AS 권한, ISNULL(A.AREA_NAME, '전체') AS 권한지사,
                                CASE WHEN
									(	SELECT COUNT(*)
										FROM ${CONSTS.DB_NEOAS}.N_게시판
										WHERE 게시판ID = B.게시판ID
										AND CONVERT(CHAR(10), 작성일자, 120) = CONVERT(CHAR(10), GETDATE(), 120)
									)  > 0
									THEN
										1
									ELSE
										0
                                    END AS 새글,
                                ISNULL(B.순서, 0) AS 순서
                        FROM ${CONSTS.DB_NEOAS}.N_게시판관리 AS B
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON B.생성자 = M.USER_ID
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_AREA AS A
                        ON B.권한 = A.AREA_ID
                        WHERE   ISNULL(삭제, 0) = 0
                    `;

                    if (params.use) {
                        sQuery += " AND B.사용 = 0 ";
                    }

                    // if (params.permission) {
                    sQuery += ` AND (
                        ISNULL(B.권한, '') = '' OR ISNULL(B.권한, '') = '${
                            params.permission["지사코드"]
                        }'
                        ${
                            params.permission["지사코드"] === "0034"
                                ? " OR B.게시판ID = 20 "
                                : ""
                        }
                    ) `;
                    // }

                    sQuery += ` ORDER BY B.순서`;

                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function(result) {
                            resolve(result.recordset);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function FindBoard(req) {
            return new Promise(function(resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        -- 게시판 상세 정보
                        SELECT  B.게시판ID, B.명칭, B.권한, B.사용, B.댓글, ISNULL(B.댓글양식, '') AS 댓글양식, ISNULL(B.메인표시, 0) AS 메인표시, -- ISNULL(B.달력, 0) AS 달력, ISNULL(B.형식, 0) AS 형식,
                                B.아이콘, ISNULL(B.설명, '') AS 설명, ISNULL(B.수정제한, 0) AS 수정제한,
                                CONVERT(CHAR(10), B.생성일자, 120) AS 생성일자,
                                B.입력필드,  ISNULL(B.그룹방명칭, '') AS 그룹방명칭, ISNULL(B.그룹방링크, '') AS 그룹방링크,
                                M.USER_NAME AS 생성자명, B.생성자
                        FROM ${CONSTS.DB_NEOAS}.N_게시판관리 AS B
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON B.생성자 = M.USER_ID
                        WHERE   1 = 1
                    `;

                    if (params["게시판ID"]) {
                        sQuery += " AND B.게시판ID = " + params["게시판ID"];
                    }

                    if (params.index) {
                        sQuery += " AND B.게시판ID = " + params.index;
                    }

                    _database
                        .RecordSet(sQuery)
                        .then(function(result) {
                            // result.recordset[0]['입력필드'] = result.recordset[0]['입력필드'].replace(/"/gim,/'/);
                            // console.log(result.recordset);
                            resolve(result.recordset);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function FindArticleSummary(req) {
            return new Promise(function(resolve, reject) {
                try {
                    var params = req.query;

                    sQuery = `
                        SELECT *
                        FROM (
                            SELECT
                                ROW_NUMBER() OVER (PARTITION BY B.게시판ID ORDER BY B.작성일자 DESC) AS ROWNUM,
                                B.인덱스, B.게시판ID,
                                B.공지,
                                B.데이터, B.작성자,
                                CONVERT(CHAR(10), B.작성일자, 120) AS 작성일자,
                                B.삭제, W.USER_NAME AS 작성자명,
                                B.입력필드,
                                ( SELECT COUNT(*) FROM ${CONSTS.DB_NEOAS}.N_리플 WHERE 카테고리 = B.게시판ID AND 게시글ID = B.인덱스) AS 댓글
                            FROM ${CONSTS.DB_NEOAS}.N_게시판 AS B
                            INNER JOIN ${CONSTS.DB_NEOAS}.N_게시판관리 AS BM
                            ON B.게시판ID = BM.게시판ID
                            INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS W
                            ON B.작성자 = W.USER_ID
                            WHERE ISNULL(BM.메인표시, 0) = 1
                        ) AS T
                        WHERE T.ROWNUM <= 5
                    `;
                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function(result) {
                            var articles = result.recordset;
                            articles.forEach(function(element) {
                                element["데이터"] = JSON.parse(
                                    element["데이터"]
                                );
                            }, this);
                            resolve(articles);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function FindArticleList(req) {
            return new Promise(function(resolve, reject) {
                try {
                    var params = req.query;

                    // sQuery = `
                    //     -- 게시판 글 리스트 조회
                    //     SELECT  B.인덱스, B.게시판ID,
                    //             B.공지,
                    //             B.데이터, B.작성자,
                    //             CONVERT(CHAR(10), B.작성일자, 120) AS 작성일자,
                    //             B.삭제, W.USER_NAME AS 작성자명
                    //     , {{REPLYCOUNT}}
                    //     FROM ${CONSTS.DB_NEOAS}.N_게시판 AS B
                    //     INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS W
                    //     ON W.USER_ID = B.작성자
                    //     WHERE B.게시판ID = ${params['게시판ID'] || params.index}
                    //     AND B.삭제 = 0
                    //     AND B.공지 > 0
                    //     AND CASE B.공지 WHEN 9 THEN CONVERT(CHAR(10), GETDATE(), 120)
                    //         ELSE CONVERT(CHAR(10), DATEADD(D,B.공지,CONVERT(CHAR(10), B.작성일자, 120)), 120) END  >= CONVERT(CHAR(10), GETDATE(), 120)

                    //     UNION ALL

                    //     SELECT  B.인덱스, B.게시판ID,
                    //             B.공지,
                    //             B.데이터, B.작성자,
                    //             CONVERT(CHAR(10), B.작성일자, 120) AS 작성일자,
                    //             B.삭제, W.USER_NAME AS 작성자명
                    //     , {{REPLYCOUNT}}
                    //     FROM ${CONSTS.DB_NEOAS}.N_게시판 AS B
                    //     INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS W
                    //     ON W.USER_ID = B.작성자
                    //     WHERE B.게시판ID = ${params['게시판ID'] || params.index}
                    //     AND B.삭제 = 0
                    //     AND CASE WHEN B.공지 > 0 AND B.공지 <> 9 AND CONVERT(CHAR(10), DATEADD(D,B.공지,CONVERT(CHAR(10), B.작성일자, 120)), 120) < CONVERT(CHAR(10), GETDATE(), 120) THEN 0
                    //         ELSE B.공지 END = 0
                    // `;
                    sQuery = `
                        SELECT  B.인덱스, B.게시판ID,
                                B.공지,
                                B.데이터, B.작성자,
                                CONVERT(CHAR(10), B.작성일자, 120) AS 작성일자,
                                B.삭제, W.USER_NAME AS 작성자명
                        , {{REPLYCOUNT}}
                        FROM ${CONSTS.DB_NEOAS}.N_게시판 AS B
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS W
                        ON W.USER_ID = B.작성자
                        WHERE B.게시판ID = ${params["게시판ID"] || params.index}
                        AND B.삭제 = 0
                    `;

                    if (parseInt(params.useReply) === 0) {
                        //댓글 사용
                        sQuery = sQuery.replace(
                            /{{REPLYCOUNT}}/gim,
                            `
                        ( SELECT COUNT(*) FROM ${CONSTS.DB_NEOAS}.N_리플 WHERE 카테고리 = ${params["게시판ID"]} AND 게시글ID = B.인덱스) AS 댓글
                        `
                        );
                    } else {
                        sQuery = sQuery.replace(
                            /{{REPLYCOUNT}}/gim,
                            " -1 AS 댓글 "
                        );
                    }

                    // console.log(params);
                    // if (params.date) {
                    //     params.date = JSON.parse(params.date);
                    //     if (params.date.month) {
                    //         sQuery += `
                    //             AND CONVERT(CHAR(7), B.작성일자, 120) = '${params.date.month}'
                    //         `;
                    //     } else if (params.date.start && params.date.end) {
                    //         sQuery += `
                    //             AND CONVERT(CHAR(10), B.작성일자, 120) BETWEEN '${params.date.start}' AND '${params.date.end}'
                    //         `;
                    //     }
                    // }

                    sQuery += `ORDER BY 작성일자 DESC`;

                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function(result) {
                            var articles = result.recordset;
                            articles.forEach(function(element) {
                                element["데이터"] = JSON.parse(
                                    element["데이터"]
                                );
                            }, this);

                            resolve(articles);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function FindArticle(req) {
            return new Promise(function(resolve, reject) {
                try {
                    var params = req.query;
                    sQuery = `
                        -- 게시글 상세정보 조회
                        SELECT A.인덱스, A.게시판ID, A.데이터, A.작성자, CONVERT(CHAR(19), A.작성일자, 120) AS 작성일자, A.삭제, W.USER_NAME AS 작성자명,
                                B.명칭, B.아이콘, B.댓글, A.입력필드, A.공지, B.입력필드 AS 입력필드2, ISNULL(B.댓글양식, '') AS 댓글양식, ISNULL(B.수정제한, 0) AS 수정제한
                        FROM ${CONSTS.DB_NEOAS}.N_게시판 AS A
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS W
                        ON W.USER_ID = A.작성자
                        INNER JOIN ${CONSTS.DB_NEOAS}.N_게시판관리 AS B
                        ON A.게시판ID = B.게시판ID
                        WHERE A.게시판ID = ${params.index}
                        AND A.삭제 = 0
                        AND A.인덱스 = ${params.article};


                        SELECT R.인덱스, R.카테고리, R.게시글ID, R.내용, R.작성자, CONVERT(CHAR(19), R.작성일자, 120) AS 작성일자, W.USER_NAME AS 작성자명,
                                ISNULL(R.첨부파일, '[]') AS 첨부파일
                        FROM ${CONSTS.DB_NEOAS}.N_리플 AS R
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS W
                        ON W.USER_ID = R.작성자
                        WHERE 1 = 1
                        AND ( R.카테고리 = ${params.index} AND R.게시글ID = ${params.article} )
                        OR ( R.카테고리 = -1 AND R.게시글ID IN (SELECT 인덱스 FROM ${CONSTS.DB_NEOAS}.N_리플 WHERE 게시글ID = ${params.article}))
                        Order By R.작성일자 DESC;
                    `;
                    console.log(sQuery);
                    _database
                        .RecordSet(sQuery)
                        .then(function(result) {
                            resolve(result.recordsets);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        return {
            Boards: FindBoardList,
            Board: FindBoard,
            ArticlesSummary: FindArticleSummary,
            Articles: FindArticleList,
            Article: FindArticle
        };
    })();

    var cUpdate = (function() {
        function UpdateBoard(req) {
            return new Promise(function(resolve, reject) {
                try {
                    var params = req.body;

                    params["입력필드"] =
                        typeof params["입력필드"] === "object"
                            ? JSON.stringify(params["입력필드"])
                            : params["입력필드"];
                    params["권한"] =
                        typeof params["권한"] === "object"
                            ? params["권한"].join(",")
                            : params["권한"];

                    sQuery = `
                        -- 게시판 정보 업데이트
                        UPDATE ${CONSTS.DB_NEOAS}.N_게시판관리
                        SET 명칭 = '${params["명칭"]}',
                            사용 = ${params["사용"]},
                            메인표시 = ${params["메인표시"]},
                            수정제한 = ${params["수정제한"]},
                            댓글 = ${params["댓글"]},
                            권한 = '${params["권한"]}',
                            설명 = '${params["설명"]}',
                            아이콘 = '${params["아이콘"]}',
                            입력필드 = '${params["입력필드"]}',
                            그룹방명칭 = '${params["그룹방명칭"]}',
                            그룹방링크 = '${params["그룹방링크"]}',
                            댓글양식 = '${params["댓글양식"]}'
                        WHERE 게시판ID = ${params["게시판ID"]};

                        SELECT 게시판ID
                        FROM ${CONSTS.DB_NEOAS}.N_게시판관리
                        WHERE 명칭 = '${params["명칭"]}'
                        AND 생성자 = ${params["생성자"]}
                    `;
                    console.log(sQuery);
                    _database
                        .Execute(sQuery)
                        .then(function(result) {
                            resolve(result.recordset[0]);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function UpdateBoardSort(req) {
            return new Promise(function(resolve, reject) {
                try {
                    var params = req.body;
                    console.log(params);
                    params.forEach(function(board) {
                        sQuery += `
                        UPDATE ${CONSTS.DB_NEOAS}.N_게시판관리
                        SET 순서    = ${board["순서"]}
                        WHERE 게시판ID = ${board["게시판ID"]};
                        `;
                    });
                    console.log(sQuery);
                    _database
                        .Execute(sQuery)
                        .then(function(result) {
                            resolve(result);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function UpdateArticle(req) {
            return new Promise(function(resolve, reject) {
                try {
                    var params = req.body;

                    params["데이터"] =
                        typeof params["데이터"] !== "string"
                            ? JSON.stringify(params["데이터"])
                            : params["데이터"];
                    params["입력필드"] =
                        typeof params["입력필드"] !== "string"
                            ? JSON.stringify(params["입력필드"])
                            : params["입력필드"];

                    sQuery = `
                        -- 게시글 업데이트
                        UPDATE ${CONSTS.DB_NEOAS}.N_게시판
                        SET 게시판ID    = ${params["게시판ID"]},
                            데이터      = '${params["데이터"]}',
                            공지        = ${params["공지"]},
                            입력필드    = '${params["입력필드"]}'
                        WHERE 인덱스 = ${params["게시글ID"]}

                    `;
                    _database
                        .Execute(sQuery)
                        .then(function(result) {
                            resolve(result);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        return {
            Board: UpdateBoard,
            BoardSort: UpdateBoardSort,
            Article: UpdateArticle
        };
    })();

    var cInsert = (function() {
        function InsertBoard(req) {
            return new Promise(function(resolve, reject) {
                try {
                    var params = req.body;

                    params["입력필드"] =
                        typeof params["입력필드"] === "object"
                            ? JSON.stringify(params["입력필드"])
                            : params["입력필드"];
                    params["권한"] =
                        typeof params["권한"] === "object"
                            ? params["권한"].join(",")
                            : params["권한"];

                    sQuery = `
                        -- 게시판 등록
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_게시판관리
                        (
                            명칭, 입력필드,
                            권한, 생성자, 사용,
                            댓글, 설명, 아이콘,
                            그룹방명칭, 그룹방링크,
                            댓글양식, 메인표시, 수정제한
                        )
                        VALUES
                        (
                            '${params["명칭"]}', '${CONSTS.BOARD.DEFAULT_TEMPLATE}',
                            '${params["권한"]}', ${params["생성자"]}, ${params["사용"]},
                            ${params["댓글"]}, '${params["설명"]}', '${params["아이콘"]}',
                            '${params["그룹방명칭"]}','${params["그룹방링크"]}',
                            '${params["댓글양식"]}', ${params["메인표시"]}, ${params["메인표시"]}
                        );

                        SELECT 게시판ID
                        FROM ${CONSTS.DB_NEOAS}.N_게시판관리
                        WHERE 명칭 = '${params["명칭"]}'
                        AND 생성자 = ${params["생성자"]}
                    `;
                    console.log(sQuery);
                    _database
                        .Execute(sQuery)
                        .then(function(result) {
                            resolve(result.recordset[0]);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function InsertArticle(req) {
            return new Promise(function(resolve, reject) {
                try {
                    var params = req.body;

                    params["데이터"] =
                        typeof params["데이터"] !== "string"
                            ? JSON.stringify(params["데이터"])
                            : params["데이터"];
                    params["입력필드"] =
                        typeof params["입력필드"] !== "string"
                            ? JSON.stringify(params["입력필드"])
                            : params["입력필드"];

                    sQuery = `
                        -- 게시글 등록
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_게시판
                        (
                            게시판ID, 데이터, 작성자, 공지, 입력필드
                        )
                        VALUES
                        (
                            ${params["게시판ID"]}, '${params["데이터"]}', ${params["작성자"]}, ${params["공지"]}, '${params["입력필드"]}'
                        );

                        SELECT MAX(인덱스) AS 인덱스
                        FROM ${CONSTS.DB_NEOAS}.N_게시판
                        WHERE 게시판ID = ${params["게시판ID"]}
                        AND   작성자 = ${params["작성자"]}
                    `;
                    console.log(sQuery);
                    _database
                        .Execute(sQuery)
                        .then(function(result) {
                            resolve(result.recordset[0]);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        return {
            Board: InsertBoard,
            Article: InsertArticle
        };
    })();

    var cDelete = (function() {
        function DeleteBoard(req) {
            return new Promise(function(resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        --게시판 삭제
                        UPDATE ${CONSTS.DB_NEOAS}.N_게시판관리
                        SET 삭제 = 1
                        WHERE 게시판ID = ${params.index}
                    `;
                    _database
                        .Execute(sQuery)
                        .then(function(result) {
                            resolve(result);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }

        function DeleteArticle(req) {
            return new Promise(function(resolve, reject) {
                try {
                    var params = req.body;
                    sQuery = `
                        -- 게시글 삭제
                        SELECT 데이터
                        FROM ${CONSTS.DB_NEOAS}.N_게시판
                        WHERE 게시판ID = ${params.category}
                        AND 인덱스 = ${params.article};

                        DELETE FROM ${CONSTS.DB_NEOAS}.N_게시판
                        WHERE 게시판ID = ${params.category}
                        AND 인덱스 = ${params.article}
                    `;

                    console.log(sQuery);
                    _database
                        .Execute(sQuery)
                        .then(function(result) {
                            var articleData = JSON.parse(
                                result.recordset[0]["데이터"]
                            );
                            var articleFiles = [];
                            Object.keys(articleData).every(function(key) {
                                if (typeof articleData[key] === "object") {
                                    articleFiles = articleData[key];
                                    return false;
                                } else {
                                    return true;
                                }
                            });
                            resolve(articleFiles);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        }
        return {
            Board: DeleteBoard,
            Article: DeleteArticle
        };
    })();

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    };
};

module.exports = board;
