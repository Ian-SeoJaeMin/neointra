(function (exports) {

    'use strict';
    exports.params = parent.params || {};

    var nfSocket = function () {
        var _instance = null,
            _this = this;

        var PNotify = parent.PNotify;

        nfSocket = function () {
            return _instance;
        }
        nfSocket.prototype = this;
        _instance = new nfSocket();
        _instance.constructor = nfSocket();

        // var socket = _this.socket = io.connect('http://115.68.13.187:3001', {
        //     reconnectionDelay: 1000,
        //     reconnection: true,
        //     reconnectionAttempts: 10,
        //     transports: ['websocket'],
        //     agent: false, // [2] Please don't set this to true
        //     upgrade: false,
        //     rejectUnauthorized: false
        // });
        var socket = _this.socket = io.connect('http://115.68.13.187:3001');


        _this.mySocket = null;
        _this.data = {
            connected: false
        }

        _this.fn = {
            handler: function (packet) {
                // console.log(typeof packet)
                switch (packet.type) {
                    case server.JOIN:
                        _this.mySocket.userList = packet.payload.userList;
                        // console.log(_this.mySocket.userList);
                        break;
                    case server.TRANSFER:
                        _this.fn.downLoadFiles(packet.payload);
                        break;

                    case server.SUCCESS.TRANSFER:
                        parent.swal('파일전송 완료', '', 'success');
                        break;
                    default:
                        console.error('[SOCKET] Received invalid response from server');
                }
            },
            setUserInfo: function (packet) {
                // _this.mySocket = packet.payload;
                _this.mySocket = {
                    _id: packet.id,
                    data: {
                        _id: packet.id
                    }
                }
                if (params.user) {
                    _this.mySocket.data.userType = userType.MEMBER;
                    _this.mySocket.data.userInfo = params.user;
                } else {
                    _this.mySocket.data.userType = userType.CUSTOMER;

                    _this.mySocket.data.userInfo = {
                        user: $('input[name="client_name"]').val()
                    };
                    _this.mySocket.data.hospitalInfo = {
                        code: $('input[name="hospnum"]').val(),
                        name: $('input[name="hospname"]').val(),
                        area: $('input[name="area"]').val(),
                        program: $('input[name="program"]').val()
                    }
                    _this.mySocket.data.computerInfo = {
                        name: $('input[name="pcinfo"]').val().split('#')[0],
                        ip: $('input[name="pcinfo"]').val().split('#')[1],
                        macAddress: $('input[name="macaddress"]').val() //"98:83:89:82:8F:D1" //
                    }

                }

                socket.emit('message', {
                    type: client.AUTH,
                    payload: _this.mySocket.data
                });

            },
            transferFile: function (macAddr, payload) {
                console.log(macAddr, payload);
                parent.swal('파일전송', payload.files.length + '개의 파일을 전송합니다.', 'info')
                // _this.fn.SendMessage(createAction(client.TRANSFER, {
                //     macAddress: macAddr,
                //     savePath: payload.savePath,
                //     execute: payload.execute,
                //     files: payload.files,
                //     sender: _this.mySocket.data
                // }));
                socket.emit('message', {
                    type: client.TRANSFER,
                    payload: {
                        macAddress: macAddr,
                        savePath: payload.savePath,
                        execute: payload.execute,
                        files: payload.files,
                        sender: _this.mySocket.data
                    }
                })
            },
            downLoadFiles: function (payload) {
                var files = '';
                payload.files.forEach(function (file, index) {
                    files += file.name + '=' + file.oPath;
                    if (index < payload.files.length - 1) {
                        files += '|';
                    }
                })

                $('input#save-path').val(payload.savePath);
                $('input#execute-files').val(payload.execute);
                $('input#transfer-files').val(files);
                $('button#downTransferFiles')[0].click();

                var feedback = setInterval(function () {
                    var _files = $('input#transfer-files').val() + '';

                    if (!_files.length) {
                        // _this.fn.SendMessage(createAction(client.SUCCESS.TRANSFER, {
                        //     sender: payload.sender
                        // }));
                        socket.emit('message', {
                            type: client.SUCCESS.TRANSFER,
                            payload: {
                                sender: payload.sender
                            }
                        })
                        clearInterval(feedback);
                    }
                }, 1000)

            },
            disconnect: function () {
                socket.emit('disconnect');
            }
        }

        socket.on('connect', function () {
            console.log('connected');
            _this.data.connected = true;
            $('#socketid').val(socket.id);
            _this.fn.setUserInfo(socket);
        });
        socket.on('disconnect', function (data) {
            console.log('disconnect', data);
            socket.connect();
        })
        socket.on('error', function () {
            console.log('error');
            // socket.connect();
        });
        socket.on('connect_error', function (data) {
            console.log('connection_error');
            socket.connect();
        });
        socket.on('message', function (packet) {
            // console.log(packet);
            _this.fn.handler(packet);
        });

    }



    // exports.nfSocket = new nfSocket();
    parent.nfSocket = new nfSocket();

})(window);
