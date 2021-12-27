var CONSTS = require ('./config').CONSTS;
var moment = require ('moment');

var reply = function (database) {
  var _database = database;
  var sQuery = '';

  var cFind = (function () {
    return {};
  }) ();

  var cUpdate = (function () {
    function UpdateReply (req) {
      return new Promise (function (resolve, reject) {
        try {
          var params = req.body;

          sQuery = `
                    `;

          _database
            .Execute (sQuery)
            .then (function (result) {})
            .catch (function (error) {
              reject (error);
            });
        } catch (error) {
          reject (error);
        }
      });
    }

    return {};
  }) ();

  var cInsert = (function () {
    function InsertReply (req) {
      return new Promise (function (resolve, reject) {
        try {
          var params = req.body;
          if (params['table'] === 'N_프로젝트HIS') {
            sQuery = `
                            -- 댓글 등록
                            INSERT INTO ${CONSTS.DB_NEOAS}.${params['table']}
                            (
                                구분, 프로젝트ID, 내용, 작성자, 작성일자, 첨부파일
                            )
                            VALUES
                            (
                                ${params['category']}, ${params['article']}, '${params['message']}', ${params['writer']}, GETDATE(), '${JSON.stringify (params['files'])}'
                            );

                        `;
            sQuery += `
                        SELECT DISTINCT T.작성자, M.USER_NAME AS 작성자명
                        FROM (

                            SELECT * FROM ${CONSTS.DB_NEOAS}.${params.table}
                            WHERE 프로젝트ID = ${params.article}

                        ) AS T
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON T.작성자 = M.USER_ID
                        WHERE T.작성자 <> ${params.writer}
                        `;
          } else {
            sQuery = `
                            -- 댓글 등록
                            INSERT INTO ${CONSTS.DB_NEOAS}.${params['table']}
                            (
                                카테고리, 게시글ID, 내용, 작성자, 작성일자, 첨부파일
                            )
                            VALUES
                            (
                                ${params['category']}, ${params['article']}, '${params['message']}', ${params['writer']}, GETDATE(), '${JSON.stringify (params['files'])}'
                            );

                        `;
            sQuery += `
                        SELECT DISTINCT T.작성자, M.USER_NAME AS 작성자명
                        FROM (
                            ${parseInt (params.category) > 0 ? `

                            SELECT * FROM ${CONSTS.DB_NEOAS}.${params.table}
                            WHERE 게시글ID = ${params.article}
                            UNION ALL
                            SELECT * FROM ${CONSTS.DB_NEOAS}.${params.table}
                            WHERE 게시글ID IN (SELECT 인덱스 FROM ${CONSTS.DB_NEOAS}.${params.table} WHERE 게시글ID = ${params.article})
                            AND 카테고리 = -1

                            ` : `
                            SELECT * FROM ${CONSTS.DB_NEOAS}.${params.table}
                            WHERE 인덱스 = ${params.article}
                            UNION ALL
                            SELECT * FROM ${CONSTS.DB_NEOAS}.${params.table}
                            WHERE 게시글ID = ${params.article}
                            AND 카테고리 = -1
                            `}

                        ) AS T
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS M
                        ON T.작성자 = M.USER_ID
                        WHERE T.작성자 <> ${params.writer}


                    `;
          }

          console.log (sQuery);
          _database
            .Execute (sQuery)
            .then (function (result) {
              resolve (result);
            })
            .catch (function (error) {
              reject (error);
            });
        } catch (error) {
          reject (error);
        }
      });
    }

    return {
      Reply: InsertReply,
    };
  }) ();

  var cDelete = (function () {
    function DeleteReply (req) {
      return new Promise (function (resolve, reject) {
        try {
          var params = req.body;
          sQuery = `
                        -- 댓글 삭제
                        SELECT ISNULL(첨부파일 , '[]') AS 첨부파일
                        FROM ${CONSTS.DB_NEOAS}.${params['table']}
                        WHERE 인덱스 = ${params['index']};

                        DELETE FROM ${CONSTS.DB_NEOAS}.${params['table']}
                        WHERE 인덱스 = ${params['index']}
                    `;
          console.log (sQuery);
          _database
            .Execute (sQuery)
            .then (function (result) {
              resolve (result.recordset[0]);
            })
            .catch (function (error) {
              reject (error);
            });
        } catch (error) {
          reject (error);
        }
      });
    }

    function DeleteReplys (req) {
      return new Promise (function (resolve, reject) {
        try {
          var params = req.body;
          sQuery = `
                        -- 댓글 전체 삭제
                        SELECT ISNULL(첨부파일, '[]') AS 첨부파일
                        FROM ${CONSTS.DB_NEOAS}.N_리플
                        WHERE 카테고리 = ${params['category']}
                        AND   게시글ID = ${params['article']};

                        DELETE
                        FROM ${CONSTS.DB_NEOAS}.N_리플
                        WHERE 카테고리 = ${params['category']}
                        AND   게시글ID = ${params['article']};
                    `;
          _database
            .Execute (sQuery)
            .then (function (result) {
              var replyDatas = result.recordset;
              var replyFiles = [];
              replyDatas.forEach (function (element) {
                element['첨부파일'] = JSON.parse (element['첨부파일']);
                replyFiles = replyFiles.concat (element['첨부파일']);
              }, this);
              resolve (replyFiles);
            })
            .catch (function (error) {
              reject (error);
            });
        } catch (error) {
          reject (error);
        }
      });
    }

    return {
      Reply: DeleteReply,
      Replys: DeleteReplys,
    };
  }) ();

  return {
    Find: cFind,
    Update: cUpdate,
    Insert: cInsert,
    Delete: cDelete,
  };
};

module.exports = reply;
