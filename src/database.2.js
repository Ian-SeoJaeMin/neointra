var mssql = require('mssql');
var config = require('./config').server;
var env = process.env.NODE_ENV || 'development';
var ENV_DEVELOPMENT = env == 'development';


var database = function () {
    // var p;

    // pool.connect().then(function (_p) { p = _p; }).catch(function (error) { console.log(error); })

    function RecordSet(query) {
        return new Promise(function (resolve, reject) {
            try {
                let pool = new mssql.ConnectionPool(ENV_DEVELOPMENT ? config.test : config.ocs);
                pool.connect().then(function (p) {
                    var request = new mssql.Request(p);
                    request.multiple = query.split(';').length > 1;

                    var rs = request.query(query);
                    rs.then(function (result) {
                        p.close();
                        resolve(result);
                    });
                    rs.catch(function (error) {
                        p.close();
                        reject(error);
                    })
                });
            } catch (error) {
                // pool.close();
                reject(error);
            }
        })
    }

    return {
        // pool: pool,
        // sql: pool,
        // fn: {
        // Connect: Connect,
        // ConnectCheck: ConnectCheck,
        // Execute: Execute,
        RecordSet: RecordSet
        // }
    }
};

module.exports = database();