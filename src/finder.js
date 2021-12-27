var CONSTS = require('./config').CONSTS
var SERVICE_STATUS = CONSTS.SERVICE_STATUS

var finder = function (database, fm) {
    var _database = database
    var sQuery = ''

    var cFind = (function () {
        function Search(req) {
            return new Promise(function (resolve, reject) {
                loadMap(req)
                    .then(function (maps) {
                        resolve(maps)
                    })
                    .catch(function (error) {
                        reject(error)
                    })
                // var _tokens = null

                // getComments(req)
                // .then(function(comment) {
                //     return tokenizeComment(comment)
                // })
                // .then(function (conmment) {
                // _tokens = tokens
                // return loadMap(req, conmment)
                // })
                // .then(function (maps) {
                // return fusing(maps, _tokens)
                // // resolve({
                // //     maps: maps,
                // //     tokens: _tokens.tokens,
                // //     tags: _tokens.tags
                // // })
                // })
                // .then(function(result) {
                // resolve(maps)
                // })
                // .catch(function (error) {
                // console.log(error)
                // reject(error)
                // })
            })
        }

        function getComments(req) {
            return new Promise(function (resolve, reject) {
                var params = req.query
                console.log(params)
                if (params.search) {
                    return resolve({
                        상태: 0,
                        문의내용: params.search
                    })
                }

                sQuery = `
                    SELECT 문의내용, 프로그램, ISNULL(실행파일, '') AS 실행파일, 기관코드
                    FROM ${CONSTS.DB_NEOAS}.N_서비스
                    WHERE 인덱스 = ${params.index}
                `
                console.log(sQuery)
                try {
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            // console.log(result)
                            resolve(result.recordset[0])
                        })
                        .catch(function (error) {
                            reject(error)
                        })
                } catch (error) {
                    reject(error)
                }
            })
        }

        function loadMap(req, comment) {
            var params = req.query
            var user = req.session.user
            if (params.search) {
                params.exe = '기타'
                params.comment = params.search
            }



            return new Promise(function (resolve, reject) {
                try {
                    if (params.comment.substr(0, 1) == "#") {

                        sQuery = `
                        SELECT *
                        FROM (
                            SELECT 인덱스, ISNULL(문의내용, '') AS 문의내용, 처리구분,
                                    ISNULL(확인내용, '') AS 확인내용,
                                    ISNULL(처리내용, '') AS 처리내용,
                                    ISNULL(보류내용, '') AS 보류내용,
                                    프로그램, ISNULL(실행파일, '') AS 실행파일, ISNULL(실행메뉴, '') AS 실행메뉴, ISNULL(세부화면, '') AS 세부화면,
                                    기관코드, 기관명칭, 상태, CONVERT(CHAR(10), 접수일자, 120) AS 접수일자,
                                    ISNULL(C.USER_NAME, '') AS 확인자, ISNULL(CONVERT(CHAR(10), 확인일자, 120), '') AS 확인일자,
                                    ISNULL(D.USER_NAME, '') AS 처리자, ISNULL(CONVERT(CHAR(10), 처리일자, 120), '') AS 처리일자,
                                    ISNULL(H.USER_NAME, '') AS 보류자, ISNULL(CONVERT(CHAR(10), 보류일자, 120), '') AS 보류일자,
                                    ( SELECT COUNT(*) FROM ${CONSTS.DB_NEOAS}.N_서비스LIKE WHERE 서비스ID = N.인덱스 ) AS Likes,
                                    ( SELECT COUNT(*) FROM ${CONSTS.DB_NEOAS}.N_서비스LIKE WHERE 서비스ID = N.인덱스 AND USER_ID = ${user['인덱스']} AND 서비스ID_S = ${params.index || '서비스ID_S'}) AS myLike
                            FROM ${CONSTS.DB_NEOAS}.N_서비스 AS N                                
                                Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS C
                                    On ISNULL(N.확인자,0) = C.USER_ID
                                Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS D
                                    On ISNULL(N.처리자,0) = D.USER_ID
                                Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS H
                                    On ISNULL(N.보류자,0) = H.USER_ID
                            WHERE 1 = 1 
                            ${params.index ? 'AND N.인덱스 <> ' + params.index : ''}
                            AND N.인덱스 IN ('${params.comment.replace('#', '').split(' ').join("','")}')
                        ) AS T
                        WHERE ISNULL(( SELECT COUNT(*) FROM ${CONSTS.DB_NEOAS}.N_서비스DISLIKE WHERE 서비스ID = T.인덱스), 0) = 0
                        ORDER BY T.접수일자 DESC
                    `
                    } else if (params.exe === '기타') {
                        sQuery = `
                            SELECT *
                            FROM (
                                SELECT FT.RANK, 인덱스, ISNULL(문의내용, '') AS 문의내용, 처리구분,
                                        ISNULL(확인내용, '') AS 확인내용,
                                        ISNULL(처리내용, '') AS 처리내용,
                                        ISNULL(보류내용, '') AS 보류내용,
                                        프로그램, ISNULL(실행파일, '') AS 실행파일, ISNULL(실행메뉴, '') AS 실행메뉴, ISNULL(세부화면, '') AS 세부화면,
                                        기관코드, 기관명칭, 상태, CONVERT(CHAR(10), 접수일자, 120) AS 접수일자,
                                        ISNULL(C.USER_NAME, '') AS 확인자, ISNULL(CONVERT(CHAR(10), 확인일자, 120), '') AS 확인일자,
                                        ISNULL(D.USER_NAME, '') AS 처리자, ISNULL(CONVERT(CHAR(10), 처리일자, 120), '') AS 처리일자,
                                        ISNULL(H.USER_NAME, '') AS 보류자, ISNULL(CONVERT(CHAR(10), 보류일자, 120), '') AS 보류일자,
                                        ( SELECT COUNT(*) FROM ${CONSTS.DB_NEOAS}.N_서비스LIKE WHERE 서비스ID = N.인덱스 ) AS Likes,
                                        ( SELECT COUNT(*) FROM ${CONSTS.DB_NEOAS}.N_서비스LIKE WHERE 서비스ID = N.인덱스 AND USER_ID = ${user['인덱스']} AND 서비스ID_S = ${params.index || '서비스ID_S'}) AS myLike
                                FROM ${CONSTS.DB_NEOAS}.N_서비스 AS N
                                    INNER JOIN freetexttable(${CONSTS.DB_NEOAS}.N_서비스, 문의내용, '"${
                            params.comment
                            }"', LANGUAGE N'Korean') AS FT
                                    ON N.인덱스 = FT.[KEY]
                                    Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS C
                                        On ISNULL(N.확인자,0) = C.USER_ID
                                    Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS D
                                        On ISNULL(N.처리자,0) = D.USER_ID
                                    Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS H
                                        On ISNULL(N.보류자,0) = H.USER_ID
                                WHERE N.상태 in (${CONSTS.SERVICE_STATUS.HOLD +
                            ',' +
                            CONSTS.SERVICE_STATUS.DONE +
                            ',' + CONSTS.SERVICE_STATUS.FEEDBACK})
                                ${params.index ? 'AND N.인덱스 <> ' + params.index : ''}
                            ) AS T
                            WHERE ISNULL(( SELECT COUNT(*) FROM ${CONSTS.DB_NEOAS}.N_서비스DISLIKE WHERE 서비스ID = T.인덱스), 0) = 0
                            ORDER BY T.RANK DESC, T.접수일자 DESC
                        `
                    } else {
                        sQuery = `
                            SELECT *
                            FROM (
                                SELECT 인덱스, ISNULL(문의내용, '') AS 문의내용, 처리구분,
                                        ISNULL(확인내용, '') AS 확인내용,
                                        ISNULL(처리내용, '') AS 처리내용,
                                        ISNULL(보류내용, '') AS 보류내용,
                                        프로그램, ISNULL(실행파일, '') AS 실행파일, ISNULL(실행메뉴, '') AS 실행메뉴, ISNULL(세부화면, '') AS 세부화면,
                                        기관코드, 기관명칭, 상태, CONVERT(CHAR(10), 접수일자, 120) AS 접수일자,
                                        ISNULL(C.USER_NAME, '') AS 확인자, ISNULL(CONVERT(CHAR(10), 확인일자, 120), '') AS 확인일자,
                                        ISNULL(D.USER_NAME, '') AS 처리자, ISNULL(CONVERT(CHAR(10), 처리일자, 120), '') AS 처리일자,
                                        ISNULL(H.USER_NAME, '') AS 보류자, ISNULL(CONVERT(CHAR(10), 보류일자, 120), '') AS 보류일자,
                                        (
                                            SELECT COUNT(*)
                                            FROM ${CONSTS.DB_NEOAS}.N_서비스LIKE
                                            WHERE 서비스ID = N.인덱스
                                        ) AS Likes,
                                        (
                                            SELECT COUNT(*)
                                            FROM ${CONSTS.DB_NEOAS}.N_서비스LIKE
                                            WHERE 서비스ID = N.인덱스
                                            AND USER_ID = ${user['인덱스']}
                                            AND 서비스ID_S = ${params.index}
                                        ) AS myLike
                                FROM ${CONSTS.DB_NEOAS}.N_서비스 AS N
                                    Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS C
                                        On ISNULL(N.확인자,0) = C.USER_ID
                                    Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS D
                                        On ISNULL(N.처리자,0) = D.USER_ID
                                    Left Join ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS H
                                        On ISNULL(N.보류자,0) = H.USER_ID
                                WHERE N.상태 in (${CONSTS.SERVICE_STATUS.HOLD +
                            ',' +
                            CONSTS.SERVICE_STATUS.DONE +
                            ',' +
                            CONSTS.SERVICE_STATUS.FEEDBACK})
                                ${params.index ? 'AND N.인덱스 <> ' + params.index : ''}
                                AND N.실행파일 = '${params.exe}'
                                ${params.mainCategory !== '' ? "AND ISNULL(N.실행메뉴, '') = '" + params.mainCategory + "'" : ""}
                                ${params.subCategory !== '' ? "AND ISNULL(N.세부화면, '') = '" + params.subCategory + "'" : ""}
                                ${params.program ? "AND 프로그램 = " + params.program : ""}
                            ) AS T
                            WHERE ISNULL(( SELECT COUNT(*) FROM ${CONSTS.DB_NEOAS}.N_서비스DISLIKE WHERE 서비스ID = T.인덱스), 0) = 0
                            ORDER BY T.Likes DESC, T.접수일자 DESC
                        `
                    }
                    console.log(sQuery)
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve({
                                similarity: result.recordset,
                                source: comment
                            })
                        })
                        .catch(function (error) {
                            // console.log(error)
                            reject(error)
                        })
                } catch (error) {
                    // console.log(error)
                    reject(error)
                }
            })
        }

        function matchingCount(req) {
            var params = req.query
            // var user = req.session.user

            return new Promise(function (resolve, reject) {
                try {

                    if (params.mainCategory.length && params.subCategory.length) {
                        sQuery = `
                            SELECT COUNT(인덱스) AS 건수
                            FROM ${CONSTS.DB_NEOAS}.N_서비스
                            WHERE 상태 in (${CONSTS.SERVICE_STATUS.HOLD + ',' + CONSTS.SERVICE_STATUS.DONE + ',' + CONSTS.SERVICE_STATUS.FEEDBACK})
                            ${params.index ? 'AND 인덱스 <> ' + params.index : ''}
                            AND 실행파일 = '${params.exe}'
                            ${params.mainCategory !== '' ? "AND ISNULL(실행메뉴, '') = '" + params.mainCategory + "'" : ""}
                            ${params.subCategory !== '' ? "AND ISNULL(세부화면, '') = '" + params.subCategory + "'" : ""}
                            ${params.program ? "AND 프로그램 = " + params.program : ""}
                            AND ISNULL(( SELECT COUNT(*) FROM ${CONSTS.DB_NEOAS}.N_서비스DISLIKE WHERE 서비스ID = 인덱스), 0) = 0
                        `
                    } else {
                        sQuery = `
                            SELECT 0 AS 건수
                        `
                    }

                    console.log(sQuery)
                    _database
                        .RecordSet(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve({
                                similarity: result.recordset
                            })
                        })
                        .catch(function (error) {
                            // console.log(error)
                            reject(error)
                        })
                } catch (error) {
                    // console.log(error)
                    reject(error)
                }
            })
        }

        return {
            Mapping: loadMap,
            Search: Search,
            MatchingCount: matchingCount
        }
    })()

    var cInsert = (function () {
        function InsertLike(req) {
            var params = req.body
            sQuery = `
                INSERT INTO ${CONSTS.DB_NEOAS}.N_서비스LIKE( 서비스ID, USER_ID, 서비스ID_S, 선택일자)
                VALUES (${params.index}, ${params.user_id}, ${params.index_s}, GETDATE())
            `
            console.log(sQuery)
            return new Promise(function (resolve, reject) {
                try {
                    _database
                        .Execute(sQuery)
                        .then(function (result) {
                            resolve(result)
                        })
                        .catch(function (error) {
                            reject(error)
                        })
                } catch (error) {
                    reject(error)
                }
            })
        }

        function InsertDisLike(req) {
            var params = req.body
            sQuery = `
                IF NOT EXISTS ( SELECT * FROM ${CONSTS.DB_NEOAS}.N_서비스DISLIKE WHERE 서비스ID = ${params.index} )
                    BEGIN
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_서비스DISLIKE(서비스ID, USER_ID, 선택일자)
                        VALUES(${params.index}, ${params.user_id}, GETDATE())
                    END
            `

            console.log(sQuery)
            return new Promise(function (resolve, reject) {
                try {
                    _database
                        .Execute(sQuery)
                        .then(function (result) {
                            sQuery = null
                            params = null
                            resolve(result)
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

        return {
            Like: InsertLike,
            DisLike: InsertDisLike
        }
    })()

    var cUpdate = (function () {
        return {}
    })()

    var cDelete = (function () {
        function DeleteLike(req) {
            var params = req.body
            sQuery = `
                DELETE FROM ${CONSTS.DB_NEOAS}.N_서비스LIKE
                WHERE 서비스ID = ${params.index} AND USER_ID = ${params.user_id} AND 서비스ID_S = ${params.index_s}
            `
            console.log(sQuery)
            return new Promise(function (resolve, reject) {
                try {
                    _database
                        .Execute(sQuery)
                        .then(function (result) {
                            resolve(result)
                        })
                        .catch(function (error) {
                            reject(error)
                        })
                } catch (error) {
                    reject(error)
                }
            })
        }

        return {
            Like: DeleteLike
        }
    })()

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    }
}

module.exports = finder
