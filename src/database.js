const mssql = require('mssql');
var config = require('./config').server;
var env = process.env.NODE_ENV || 'development';
var ENV_DEVELOPMENT = env == 'development';
// var pool_ocs = new mssql.ConnectionPool(ENV_DEVELOPMENT ? config.test : config.ocs);
// var pool_company = new mssql.ConnectionPool(config.company);

// pool_ocs.connect()
//     .then(function () {
//         console.log('Server is connect', ENV_DEVELOPMENT ? config.test.server : config.ocs.server);
//         // console.log(pool_ocs);
//     })
//     .catch(function (err) {
//         console.log('pool_ocs connect : Server connecting fail', ENV_DEVELOPMENT ? config.test.server : config.ocs.server, err);
//     });
// pool_company.connect()
//     .then(function () {
//         console.log('Server is connect', config.company.server);
//     })
//     .catch(function (err) {
//         console.log('pool_company connect : Server connecting fail', config.company.server, err);
//     });


var database = function () {
    var pool;
    var reConnector = null;
    var connector = Connect();

    function queryLogger(query) {
        var fs = require('fs');
        var path = require('path');
        fs.appendFileSync(path.join(__dirname, '..', 'public', 'log', moment().format('YYYYMMDD') + '-query.log'), '\n\n//////////////////////////////////////////////////////////////////////\n\n');
        fs.appendFileSync(path.join(__dirname, '..', 'public', 'log', moment().format('YYYYMMDD') + '-query.log'), query);

    }

    connector.then(function () {
        console.log('SQL Server connect');
        console.log(config);
        // rs = new mssql.Request(pool);
    });
    connector.catch(function (error) {
        console.log('SQL Server connect ERROR');
        console.error(error);
        reConnector = setInterval(Connect, 1000);
    });

    function Connect() {
        console.log('connect!!!!!!!!');
        return new Promise(function (resolve, reject) {
            pool = new mssql.ConnectionPool(config.ocs);
            pool.connect(function (error) {
                if (error) {
                    reject(error);
                } else {
                    if (reConnector) {
                        clearInterval(reConnector);
                    }
                    resolve();
                }
            });
        });
    }

    function ConnectCheck() {
        // return new Promise(function (resolve, reject) {
        //     if (pool._connected) { resolve(); }
        //     else {
        //         Connect()
        //             .then(function () {
        //                 resolve();
        //             })
        //             .catch(function (err) {
        //                 reject(err);
        //             })
        //     }
        // });
    }

    function Execute(query) {
        return new Promise(function (resolve, reject) {
            try {
                if (!ENV_DEVELOPMENT) {
                    queryLogger(query);
                }
                rs = new mssql.Request(pool)
                rs.multiple = query.split(';').length > 1;
                rs.query(query, function (err, result) {
                    // ... error checks
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });

                pool.on('error', function (err) {
                    // ... error handler
                    reject(err);
                });
            } catch (error) {
                reject(error);
            }
        })


    }

    function RecordSet(query, callback) {
        return new Promise(function (resolve, reject) {
            try {
                // mssql.connect(config, function (error) {
                //     // ... error checks
                //     if (error) {
                //         reject(error);
                //     }
                //     // Query
                if (!ENV_DEVELOPMENT) {
                    // queryLogger(query);
                }
                var rs = new mssql.Request(pool)
                rs.multiple = query.split(';').length > 1;
                rs.query(query, function (err, result) {
                    // ... error checks
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });

                // })


                pool.on('error', function (err) {
                    // ... error handler
                    reject(err);
                });


            } catch (error) {
                reject(error);
            }

        });
    }

    return {
        // pool: pool,
        sql: pool,
        // fn: {
        // Connect: Connect,
        // ConnectCheck: ConnectCheck,
        Execute: Execute,
        RecordSet: RecordSet
        // }
    }
};

module.exports = database();
// module.exports = {
//     ocs: database(ENV_DEVELOPMENT ? config.test : config.ocs),
//     company: database(config.company)
// };
