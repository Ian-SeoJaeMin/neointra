var CONSTS = require('./config').CONSTS;
var moment = require('moment');

var Kakao = function (database) {
    var _database = database;
    var _instance = null,
        _this = this;

    var sQuery = '';

    Kakao = function () {
        return _instance;
    }

    Kakao.prototype = this;
    _instance = new Kakao();
    _instance.constructor = Kakao();

    _this.Insert = {
        Push: InsertKakao,
        PushGroup: InsertKakaoGroup
    };

    function InsertKakao(message, to) {
        return new Promise(function (resolve, reject) {
            try {

                sQuery = `
                    -- 카카오톡발송 저장
                    INSERT INTO ${CONSTS.DB_OCS}.TB_카카오톡발송
                    (
                        발송내용, 전송구분, 전송이름 
                    )
                    VALUES
                    (
                        '${message}', 0, '${to}'
                    )
                `;

                _database.Execute(sQuery)
                    .then(function (result) {
                        resolve(result);
                    })
                    .catch(function (error) {
                        reject(error);
                    })

            } catch (err) {
                reject(err);
            }
        })
    }

    function InsertKakaoGroup(message, group) {
        return new Promise(function (resolve, reject) {
            try {

                sQuery = `
                    -- 카카오톡 그룹톡 발송 저장
                    INSERT INTO ${CONSTS.DB_OCS}.TB_카카오톡발송
                    (
                        발송내용, 전송구분, 그룹발송 
                    )
                    VALUES
                    (
                        '${message}', 0, '${group}'
                    )
                `;

                _database.Execute(sQuery)
                    .then(function (result) {
                        resolve(result);
                    })
                    .catch(function (error) {
                        reject(error);
                    })

            } catch (err) {
                reject(err);
            }
        })
    }

    return _instance;
}

module.exports = Kakao;