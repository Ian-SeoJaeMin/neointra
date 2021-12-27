(function (exports) {
    'use strict';

    var nSocket = function () {
        var _instance = null,
            _this = this;

        nSocket = function () {
            return _instance;
        }

        nSocket.prototype = this;
        _instance = new nSocket();
        _instance.constructor = nSocket();

        var socket = _this.socket = io.connect();
        var connectTimer = null;

        _this.data = {
            socketConnected: false,
            info: {
                services: []
            }
        };

        _this.fn = {
            SetInfo: function (info) {
                info.services = info.services.split('|');
                _this.data.info = info;
                return _this.fn;
            },
            JoinSocket: function () {
                connectTimer = setInterval(function () {
                    if (_this.data.socketConnected) {
                        socket.emit('join', {
                            side: 'client',
                            info: _this.data.info
                        });
                        clearInterval(connectTimer);
                    }
                }, 1000);
            },
            RemoveService: function (service, unemit) {
                _this.data.info.services = _this.data.info.services.filter(function (_service) {
                    return _service !== service;
                });
                if (!unemit) {
                    socket.emit('update', {
                        side: 'client',
                        info: _this.data.info
                    });
                }
            },
            LeaveSocket: function () {
                socket.close();
            },
            UpdateService: function (data) {
                if (_this.data.info.services.some(function (service) {
                        return parseInt(service) === parseInt(data.index);
                    })) {
                    if (window.Talk) {
                        window.Talk.fn.UpdateService(data);
                    }
                }
            },
            ReceiveMessage: function (data) {
                if (_this.data.info.services.some(function (service) {
                        return parseInt(service) === parseInt(data.index);
                    })) {
                    if (window.Talk) {
                        if (data.type === '부재중') {
                            window.Talk.fn.CallMissedPopup(data.index, data.messages);
                        }
                    }
                }
            }
        }


        socket.on('connect', function () {
            if (!_this.data.socketConnected) {
                _this.data.socketConnected = true;
            }
        });
        socket.on('ready', function () {
            // _this.fn.JoinSocket();
        });
        socket.on('update', function (data) {
            _this.fn.UpdateService(data);
        });
        socket.on('message', function (data) {
            _this.fn.ReceiveMessage(data);
        })
        socket.on('disconnect', function () {})

        return _instance;
    }

    exports.nSocket = new nSocket();



})(window);
