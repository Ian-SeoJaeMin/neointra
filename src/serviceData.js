var CONSTS = require('./config').CONSTS;
var moment = require('moment');

var serviecData = function (database) {
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

                        // var date = params.date ? JSON.parse(params.date) : {
                        //     start: moment().subtract(30, 'day').format('YYYY-MM-DD'),
                        //     end: moment().format('YYYY-MM-DD')
                        // }

                        // var dateRange = `CONVERT(VARCHAR(10), N.접수일자, 120) BETWEEN '${date.start}' AND '${date.end}'`

                        sQuery = `
                            -- AS 리스트 조회                            
                            Select N.인덱스, N.기관코드,
                                ISNULL(N.기관명칭, '') AS 기관명칭, 
                                N.상태, CONVERT(CHAR(19), N.접수일자, 120) AS 접수일자, ISNULL(이미지, '[]') AS 이미지 
                            FROM ${CONSTS.DB_NEOAS}.N_서비스 AS N WITH(NOLOCK)
                            WHERE 1 = 1
                            --AND   N.상태 = ${params.status}
                            AND   N.상태 IN (${params.status.join(',')})
                            AND   CONVERT(CHAR(7), N.접수일자, 120) = '${params.date}'
                            Order By N.접수일자 ASC;
                        `;

                        console.log(sQuery);
                        _database.RecordSet(sQuery)
                            .then(function (result) {
                                sQuery = null
                                select = null
                                where = null
                                sort = null
                                params = null
                                // user = null
                                resolve(result.recordsets[0]);
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
        return {
            Services: GetServiceList
        };
    })();

    var cUpdate = (function () {


        return {
        };
    })();

    var cInsert = (function () {

        return {
        };
    })();

    var cDelete = (function () {

        return {

        }
    })();

    return {
        Find: cFind,
        Update: cUpdate,
        Insert: cInsert,
        Delete: cDelete
    };
};

module.exports = serviecData;
