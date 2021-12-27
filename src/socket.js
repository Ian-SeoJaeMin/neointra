var extend = require('util-extend');

var nSocket = function (database, io) {
    var _instance = null,
        _this = this;

    nSocket = function () {
        return _instance;
    }

    nSocket.prototype = this;
    _instance = new nSocket();
    _instance.constructor = nSocket();

    _this.Pockets = {
        client: new Pocket(),
        member: new Pocket()
    };
    _this.fn = {
        FindPocketSide: function (id) {
            var pocket;
            pocket = _this.Pockets.client.fn.GetPocket(id);
            if (pocket !== null) {
                return 'client';
            } else {
                pocket = _this.Pockets.member.fn.GetPocket(id);
                if (pocket !== null) {
                    return 'member';
                } else {
                    return null;
                }
            }
        }
    };

    io.on('connection', function (socket) {
        console.log('socket connected');
        // socket.emit('ready');

        socket.on('join', function (data) {
            // console.log('socket join', data);
            _this.Pockets[data.side].fn.AddPocket(socket.id, data);
        });
        socket.on('disconnect', function (reason) {
            // console.log('disconnect', reason);
            var side = _this.fn.FindPocketSide(socket.id);
            if (side) {
                _this.Pockets[side].fn.RemovePocket(socket.id);
            }
        });
        socket.on('error', function (error) {
            // console.log('error', error);
        });
        socket.on('status', function (data) {
            // console.log('status', data);
            var pocket = _this.Pockets[data.to].fn.FindPocketByService(data.info.service);
            socket.emit('status', pocket);
        });

        socket.on('update', function (data) {
            // console.log('update', data);
            // io.emit('update', data);
            socket.broadcast.emit('update', data);
        });

        socket.on('message', function (data) {
            socket.broadcast.emit('message', data);
        })

        /**
         * 사용자
         * 1. A/S 상태 조회
         *  완료 = > service id 지우기
         *  접수취소 = > service id 지우기
         */

        socket.on('remove', function (data) {
            // console.log('remove', data);
            _this.Pockets[data.side].fn.UpdateService(socket.id, data);
        })

        /**
         * 사원
         * 1. A/S 상태 변경
         *   인덱스로 Pocket 찾아서 변경됬다 알려주기
         *   완료 => service id 지우기
         */

    });



    return _instance;

}

var Pocket = function () {
    var _instance = null,
        _this = this;

    Pocket = function () {
        return _instance;
    }

    Pocket.prototype = this;
    _instance = new Pocket();
    _instance.constructor = Pocket();

    _this.template = {
        client: {
            socket_id: '',
            services: []

        },
        member: {
            socket_id: '',
            user_id: 0,
            area: ''
        }
    };

    _this.Pocket = [];
    _this.fn = {
        AddPocket: function (id, data) {
            var pocket = null;
            if (data.side === 'client') {
                pocket = extend(_this.template[data.side], data.info);
                pocket.socket_id = id;
                if (pocket.hospnum !== '') {
                    _this.Pocket.push(pocket);
                }
            } else {
                pocket = _this.fn.FindPocketByUserId(data.info.user_id);
                if (pocket) {
                    pocket.socket_id = id;
                } else {
                    _this.Pocket.push(extend(_this.template[data.side], data.info));
                }
            }
            return _this.fn;
        },
        GetPocket: function (id) {
            var pocket = _this.Pocket.find(function (pkt) {
                return pkt.socket_id = id;
            });
            return pocket || null;
        },
        FindPocketByService: function (index) {
            var pocket = _this.Pocket.find(function (pkt) {
                return pkt.services.some(function (service) {
                    return parseInt(service) === parseInt(index);
                })
            })
            return pocket || null;
        },
        FindPocketByUserId: function (id) {
            var pocket = _this.Pocket.find(function (pkt) {
                return parseInt(pkt.user_id) === parseInt(id);
            })
            return pocket || null;
        },
        RemovePocket: function (id) {
            _this.Pocket.forEach(function (pkt, index) {
                if (pkt.socket_id === id) {
                    _this.Pocket.splice(index, 1);
                }
            });
            return _this.fn;
        },
        UpdateService: function (id, data) {
            var pocket = _this.fn.GetPocket(id);
            if (pocket) {
                pocket.services = data.info;
            }
        }
    }

    return _instance;

}

module.exports = nSocket;
