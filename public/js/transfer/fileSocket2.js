(function (exports) {

    'use strict';
    exports.params = parent.params || {};
    // parent.PNotify.desktop.permission();

    var nfSocket = function () {
        var _instance = null,
            _this = this;

        // var PNotify = parent.PNotify;

        nfSocket = function () {
            return _instance;
        }
        nfSocket.prototype = this;
        _instance = new nfSocket();
        _instance.constructor = nfSocket();

        var socket = _this.socket = io.connect('http://115.68.13.187:3001');

        _this.data = {
            connected: false
        }

        _this.fn = {
            SendMessage: function (message) {
                socket.emit('message', message);
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
                _this.fn.SendMessage(createAction(client.AUTH, _this.mySocket.data));
            },
            transferFile: function (macAddr, payload) {
                console.log(macAddr, payload);
                parent.swal('파일전송', payload.files.length + '개의 파일을 전송합니다.', 'info')
                _this.fn.SendMessage(createAction(client.TRANSFER, {
                    macAddress: macAddr,
                    savePath: payload.savePath,
                    execute: payload.execute,
                    files: payload.files,
                    sender: _this.mySocket.data
                }));
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
                        _this.fn.SendMessage(createAction(client.SUCCESS.TRANSFER, {
                            sender: payload.sender
                        }));
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
            $('#socketid').val(socket.id);
            _this.fn.setUserInfo(socket);
        });
        socket.on('disconnect', function () {
            console.log('disconnect');
        });
        socket.on('error', function () {
            console.log('error');
        });
        socket.on('message', function (packet) {
            // console.log(packet);
            handler(packet);
        });

    }

    var handler = function (packet) {
        var oPacket = tryParseJSON(packet);
        if (oPacket) {
            switch (oPacket.type) {
                // 소켓 커넥션에 성공했으니 너의 정보를 채워서 다시 보내라
                // userType: null, // 거래처냐 직원이냐
                // userInfo: null, // 사용자 정보
                // computerInfo: null, // 컴퓨터 정보
                // hospitalInfo: null // 병원정보
                case server.SUCCESS.ENTER:
                    parent.nfSocket.fn.setUserInfo(oPacket);
                    break;
                case server.SUCCESS.AUTH:
                    parent.nfSocket.mySocket.userList = oPacket.payload.userList;
                    // console.log(parent.nfSocket.mySocket.userList);
                    break;
                case server.JOIN:
                    parent.nfSocket.mySocket.userList = oPacket.payload.userList;
                    console.log(parent.nfSocket.mySocket.userList);
                    break;
                case server.TRANSFER:
                    parent.nfSocket.fn.downLoadFiles(oPacket.payload);
                    break;
                    // case server.LEAVE:
                    //     parent.nfSocket.fn.removeUserList()
                    // case server.JOIN:
                    //     parent.nfSocket.fn.setUserList(oPacket);
                    //break;
                case server.SUCCESS.TRANSFER:
                    parent.swal('파일전송 완료', '', 'success');
                    break;
                default:
                    console.error('[SOCKET] Received invalid response from server');

            }
        }
    }



    function tryParseJSON(jsonString) {
        try {
            if (typeof jsonString === 'object') {
                return jsonString
            } else {
                return JSON.parse(jsonString)
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    function createAction(type, payload) {
        return {
            type: type,
            payload: payload
        }
    }

    // exports.nSocket = new nSocket();
    parent.nfSocket = new nfSocket();

})(window);
