var CONSTS = require('./config').CONSTS;
var moment = require('moment');

var quoteorder = function (database) {
    var _database = database;
    var sQuery = '';

    var cFind = (function () {

        function GetProductPackage(req) {
            return new Promise(function (resolve, reject) {
                try {
                    sQuery = `
                        SELECT DISTINCT 패키지 FROM ${CONSTS.DB_NEOAS}.N_물품관리 WHERE 패키지 IS NOT NULL
                    `
                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        })
                } catch (error) {
                    reject(error)
                } finally {
                    sQuery = null
                }
            })
        }

        function GetProductList(req) {
            return new Promise(function (resolve, reject) {
                try {
                    sQuery = `
                        SELECT
                            물품ID, 품목, 모델, 구매처,
                            공급단가, 소비자가,
                            비고, ISNULL(패키지, '') AS 패키지,
                            CONVERT(CHAR(10), 등록일자, 120) AS 등록일자,
                            CONVERT(CHAR(10), 수정일자, 120) AS 수정일자
                        FROM ${CONSTS.DB_NEOAS}.N_물품관리
                    `
                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        })
                } catch (error) {
                    reject(error)
                } finally {
                    sQuery = null
                }
            })
        }

        function GetProductSubjects(req) {
            return new Promise(function (resolve, reject) {
                try {
                    sQuery = `
                        SELECT distinct 품목 FROM ${CONSTS.DB_NEOAS}.N_물품관리
                    `
                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        })
                } catch (error) {
                    reject(error)
                }
            })
        }

        function GetProductModels(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.query
                    sQuery = `
                        SELECT 물품ID, 품목, 모델, 구매처,
                        공급단가, 소비자가,
                        비고, ISNULL(패키지, '') AS 패키지,
                        CONVERT(CHAR(10), 등록일자, 120) AS 등록일자,
                        CONVERT(CHAR(10), 수정일자, 120) AS 수정일자 FROM ${CONSTS.DB_NEOAS}.N_물품관리
                        WHERE 품목 = '${params.subject}'
                    `
                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        })
                } catch (error) {
                    reject(error)
                }
            })
        }

        function GetOuoteOrder(req) {
            return new Promise(function (resolve, reject) {
                var params = req.query
                params.date = JSON.parse(params.date)
                try {
                    sQuery = `
                        SELECT Q.견적서ID, Q.유형, Q.거래처, Q.작성자, CONVERT(CHAR(10), Q.작성일자, 120) AS 작성일자,
                        Q.발행여부, Q.상태, Q.수신자, Q.수신자연락처, Q.기관명칭 AS 기관명칭2,
                        CASE Q.상태 WHEN 0 THEN '미선택'
                                    WHEN 1 THEN '요청'
                                    WHEN 2 THEN '발주중'
                                    WHEN 3 THEN '취소'
                                    ELSE '완료'
                        END AS 상태명,
                        H.USER_MED_NAME AS 기관명칭, H.USER_MED_ID AS 기관코드,
                        W.USER_NAME AS 작성자명
                        FROM ${CONSTS.DB_NEOAS}.N_견적발주 AS Q
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                        ON Q.거래처 = H.USER_ID
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS W
                        ON Q.작성자 = W.USER_ID
                        WHERE CONVERT(CHAR(10), 작성일자, 120) BETWEEN '${params.date.start}' AND '${params.date.end}'
                        ORDER BY 작성일자 DESC;

                        SELECT QP.견적서ID, P.품목, P.모델 FROM ${CONSTS.DB_NEOAS}.N_견적발주물품 AS QP
                        LEFT JOIN ${CONSTS.DB_NEOAS}.N_물품관리 P
                        ON P.물품ID = QP.물품ID
                        WHERE QP.견적서ID IN ( SELECT 견적서ID FROM ${CONSTS.DB_NEOAS}.N_견적발주 WHERE CONVERT(CHAR(10), 작성일자, 120) BETWEEN '${params.date.start}' AND '${params.date.end}')

                    `
                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordsets);
                        })
                        .catch(function (error) {
                            reject(error);
                        })
                } catch (error) {
                    reject(error)
                } finally {
                    params = null
                    sQuery = null
                }

            })
        }

        function GetOuoteOrderDetail(req) {
            return new Promise(function (resolve, reject) {
                var params = req.query
                try {
                    sQuery = `
                        SELECT Q.견적서ID, Q.유형, Q.거래처, Q.작성자, CONVERT(CHAR(10), Q.작성일자, 120) AS 작성일자,
                        CASE Q.유형 WHEN 0 THEN '견적'
                                    ELSE '발주' END AS 유형명,
                        Q.발행여부,
                        CASE Q.발행여부 WHEN 0 THEN '미발행'
                                        ELSE '발행' END AS 발행여부명,
                        Q.상태,
                        CASE Q.상태 WHEN 0 THEN '미선택'
                                    WHEN 1 THEN '요청'
                                    WHEN 2 THEN '발주중'
                                    WHEN 3 THEN '취소'
                                    ELSE '완료'
                        END AS 상태명,
                        Q.발행처, Q.수신자, Q.수신자연락처,
                        CASE Q.발행처
                                    WHEN 0 THEN '거래처(병원)'
                                    WHEN 1 THEN '지사'
                                    WHEN 2 THEN '기타'
                                    ELSE '선택없음' END AS 발행처명,
                        H.USER_MED_NAME AS 기관명칭, H.USER_MED_ID AS 기관코드,
                        W.USER_NAME AS 작성자명, Q.이메일, Q.담당자, Q.연락처, Q.기관명칭 AS 기관명칭2
                        FROM ${CONSTS.DB_NEOAS}.N_견적발주 AS Q
                        LEFT JOIN ${CONSTS.DB_NEOCOMPANY}.NC_H_USER AS H
                        ON Q.거래처 = H.USER_ID
                        INNER JOIN ${CONSTS.DB_NEOCOMPANY}.NC_N_USER AS W
                        ON Q.작성자 = W.USER_ID
                        WHERE Q.견적서ID = ${params.index}
                        ORDER BY 작성일자 DESC;

                        SELECT
                            QP.견적서ID, QP.물품ID, P.품목, P.모델,
                            P.공급단가, QP.수량, QP.소비자가, QP.제안가
                        FROM ${CONSTS.DB_NEOAS}.N_견적발주물품 AS QP
                        LEFT JOIN ${CONSTS.DB_NEOAS}.N_물품관리 P
                        ON P.물품ID = QP.물품ID
                        WHERE QP.견적서ID = ${params.index}

                    `
                    console.log(sQuery);
                    _database.RecordSet(sQuery)
                        .then(function (result) {
                            resolve(result.recordsets);
                        })
                        .catch(function (error) {
                            reject(error);
                        })
                } catch (error) {
                    reject(error)
                } finally {
                    params = null
                    sQuery = null
                }

            })
        }

        return {
            Packages: GetProductPackage,
            Products: GetProductList,
            ProductSubjects: GetProductSubjects,
            ProductModels: GetProductModels,
            Order: GetOuoteOrder,
            OrderDetail: GetOuoteOrderDetail
        };
    })();

    var cUpdate = (function () {
        function UpdateProduct(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body
                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_물품관리
                        SET 수정일자 = GETDATE(),
                            품목 = '${params['품목']}',
                            모델 = '${params['모델']}',
                            구매처 = '${params['구매처']}',
                            공급단가 = ${params['공급단가']},
                            소비자가 = ${params['소비자가']},
                            비고 = '${params['비고']}',
                            패키지 = '${params['패키지']}'
                        WHERE 물품ID = ${params['물품ID']}
                    `
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
                    reject(error)
                }
            })
        }

        function UpdateOrder(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body
                    //var user = req.session.user
                    sQuery = `
                        UPDATE ${CONSTS.DB_NEOAS}.N_견적발주
                        SET 작성일자 = GETDATE(),
                            유형 = ${params['order-type']},
                            작성자 = ${params['order-writer']},
                            거래처 = ${params['order-hospital'] && params['order-hospital'].length ? params['order-hospital'].split('|')[0] : -1},
                            발행처 = ${params['order-client']},
                            이메일 = '${params['order-email']}',
                            담당자 = '${params['order-manager']}',
                            연락처 = '${params['order-contact']}',
                            상태 = ${params['order-status']},
                            발행여부 = ${params['order-send']},
                            수신자 = '${params['order-to']}',
                            수신자연락처 = '${params['order-to-contact']}',
                            기관명칭 = '${params['order-unreg-hospital']}'
                        WHERE 견적서ID = ${params['order-id']}
                    `
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
                    reject(error)
                }
            })
        }
        return {
            Product: UpdateProduct,
            Order: UpdateOrder
        }
    })();

    var cInsert = (function () {

        function InsertProduct(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body
                    sQuery = `
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_물품관리
                        (
                            품목, 모델, 구매처, 공급단가, 소비자가, 사용, 비고, 패키지, 등록일자, 수정일자
                        )
                        VALUES
                        (
                            '${params.subject}', '${params.model}', '${params.wheretobuy}', ${params.unitprice || 0}, ${params.consumerprice || 0}, 0, '${params.memo}', '${params.package}', GETDATE(), GETDATE()
                        )
                    `
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
                    reject(error)
                }
            })
        }

        function InsertOrder(req) {
            return new Promise(function (resolve, reject) {
                var params = req.body
                // var user = req.session.user
                try {
                    sQuery = `
                        INSERT INTO ${CONSTS.DB_NEOAS}.N_견적발주 (
                            유형, 작성자, 거래처, 발행처, 이메일, 담당자, 연락처, 상태, 발행여부, 작성일자, 수신자, 수신자연락처, 기관명칭
                        )
                        VALUES (
                            ${params['order-type']}, ${params['order-writer']}, ${params['order-hospital'] ? params['order-hospital'].split('|')[0] : '-1'},
                            ${params['order-client']}, '${params['order-email']}', '${params['order-manager']}', '${params['order-contact']}',
                            ${params['order-status'] || 0}, ${params['order-send'] || 0}, GETDATE(),
                            '${params['order-to']}', '${params['order-to-contact']}', '${params['order-unreg-hospital'] ? params['order-unreg-hospital'] : ''}'
                        );

                        SELECT MAX(견적서ID) AS 견적서ID FROM ${CONSTS.DB_NEOAS}.N_견적발주
                    `

                    console.log(sQuery);

                    _database.Execute(sQuery)
                        .then(function (result) {
                            // console.log(result);
                            resolve(result.recordset[0]);
                            // resolve(result.recordset);
                        })
                        .catch(function (error) {
                            reject(error);
                        });

                } catch (error) {
                    reject(error)
                } finally {
                    params = null
                    sQuery = null
                }
            })
        }

        function InsertOrderProduct(req) {
            return new Promise(function (resolve, reject) {
                var params = req.body
                var products = params.products
                try {
                    sQuery = ''
                    products.forEach(function (element) {
                        sQuery += `
                            INSERT INTO ${CONSTS.DB_NEOAS}.N_견적발주물품 (
                                견적서ID, 물품ID, 수량, 소비자가, 제안가
                            )
                            VALUES (
                                ${params['order-id']}, ${element['물품ID']}, ${element['수량']}, ${element['소비자가']}, ${element['제안가']}
                            );
                        `
                    })
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
                    reject(error)
                } finally {
                    params = null
                    products = null
                    sQuery = null
                }
            })
        }

        return {
            Product: InsertProduct,
            Order: InsertOrder,
            OrderProducts: InsertOrderProduct
        }
    })();

    var cDelete = (function () {
        function DeleteProduct(req) {
            return new Promise(function (resolve, reject) {
                try {
                    var params = req.body
                    sQuery = `
                        Delete From ${CONSTS.DB_NEOAS}.N_물품관리
                        where 물품ID = ${params.id}
                    `
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
                    reject(error)
                }
            })
        }

        function DeleteOrder(req) {
            return new Promise(function (resolve, reject) {
                var params = req.body
                // var products = params.products
                try {
                    sQuery = `
                        DELETE FROM ${CONSTS.DB_NEOAS}.N_견적발주
                        WHERE 견적서ID = ${params['order-id']}
                    `

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
                    reject(error)
                } finally {
                    params = null
                    sQuery = null
                }
            })
        }

        function DeleteOrderProducts(req) {
            return new Promise(function (resolve, reject) {
                var params = req.body
                // var products = params.products
                try {
                    sQuery = `
                        DELETE FROM ${CONSTS.DB_NEOAS}.N_견적발주물품
                        WHERE 견적서ID = ${params['order-id']}
                    `

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
                    reject(error)
                } finally {
                    params = null
                    sQuery = null
                }
            })
        }

        return {
            Product: DeleteProduct,
            Order: DeleteOrder,
            OrderProducts: DeleteOrderProducts
        }
    })();

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    };
};

module.exports = quoteorder;
