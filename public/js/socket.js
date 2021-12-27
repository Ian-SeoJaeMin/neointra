(function (exports) {

    'use strict';
    exports.params = parent.params;
    parent.PNotify.desktop.permission();

    var nSocket = function () {
        var _instance = null,
            _this = this;

        var PNotify = parent.PNotify;

        nSocket = function () {
            return _instance;
        }
        nSocket.prototype = this;
        _instance = new nSocket();
        _instance.constructor = nSocket();

        var socket = _this.socket = io.connect();

        _this.data = {
            connected: false
        }

        _this.fn = {
            CheckConnection: function (index) {
                socket.emit('status', {
                    to: 'client',
                    from: 'member',
                    info: {
                        service: index
                    }
                });
            },
            UpdateService: function (info) {
                socket.emit('update', info);
                // socket.emit('update', {
                //     side: 'client',
                //     info: info
                // });
            },
            SendMessage: function (message) {
                socket.emit('message', message);
            }
        }

        socket.on('connect', function () {
            console.log('connected');
            _this.data.connected = true;
            socket.emit('join', {
                side: 'member',
                info: {
                    user_id: params.user['인덱스'],
                    area: params.user['지사코드']
                }
            })
        });
        socket.on('disconnect', function () {
            console.log('disconnect');
            // var innerNotice = new PNotify({
            //     title: '서버 연결이 끊어졌습니다.',
            //     text: '저를 클릭하시면 새로고침됩니다.',
            //     type: 'error',
            //     hide: true,
            //     buttons: {
            //         closer: true,
            //         sticker: false
            //     }
            // });
            // innerNotice.get().click(function (e) {
            //     // innerNotice.remove();
            //     parent.location.reload();
            // });
        })
        socket.on('error', function () {
            console.log('error');
        })
        socket.on('status', function (data) {
            console.log(data);
        });

        socket.on('new_service', function (data) {

            if (parent.location.pathname !== '/service' && parent.location.pathname !== '/service/accept' && parent.location.pathname !== '/service/accept/detail') {
                return false
            }

            if (params.user['지사코드'] === data['area']) {

                if (params.user['부서'] !== '개발실') {
                    (new PNotify({
                        title: '새로 접수된 A/S가 있습니다!!',
                        text: '접수번호: ' + data['index'] + '\n병원: ' + data['hospname'] + '\n\n저를 클릭하시면 A/S페이지로 이동합니다!!',
                        type: 'info',
                        // stack: {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25},
                        buttons: {
                            closer_hover: false,
                            sticker_hover: false
                        },
                        desktop: {
                            desktop: true
                        }
                    })).get().click(function (e) {
                        if (parent.location.pathname === '/service') {
                            parent.Service.fn.Load();
                        } else {
                            if (params.user['지사코드'].match(/0000|0030|0031|0026|0034|0023/gim)) {
                                parent.location.reload();
                            } else {
                                parent.location.href = '/service';
                            }
                        }
                    });

                    // var innerNotice = new PNotify({
                    //     title: '새로 접수된 A/S가 있습니다!!',
                    //     text: '접수번호: ' + data['index'] + '\n병원: ' + data['hospname'] + '\n\n저를 클릭하시면 A/S페이지로 이동합니다!!',
                    //     hide: false,

                    //     buttons: {
                    //         closer: true,
                    //         sticker: false
                    //     }
                    // });
                    // innerNotice.get().click(function (e) {
                    //     innerNotice.remove();
                    //     if (parent.location.pathname === '/service') {
                    //         parent.Service.fn.Load();
                    //     } else {
                    //         parent.location.href = '/service';
                    //     }
                    // });
                } else {
                    // if (parent.location.pathname === '/service') {
                    //     parent.Service.fn.Load();
                    // }
                }
            }
        });
        socket.on('update', function (data) {
            // alert(JSON.stringify(data, null, 4));

            if (parent.location.pathname !== '/service' && parent.location.pathname !== '/service/accept' && parent.location.pathname !== '/service/accept/detail') {
                return false
            } else {

                var innerNotice = new PNotify({
                    title: '상태가 변경된 A/S가 있습니다.',
                    text: 'A/S 업무를 보고 계시다면 작업중이던 내용을 저장하고 새로고침해주세요.\n\n저를 클릭하시면 새로고침됩니다.',
                    // stack: {"dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25},
                    buttons: {
                        closer_hover: false,
                        sticker_hover: false
                    }
                });
                innerNotice.get().click(function (e) {
                    innerNotice.remove();
                    if (parent.location.pathname === '/service') {
                        parent.Service.fn.Load();
                    } else {
                        parent.location.reload();
                    }
                });
            }
            // new PNotify({
            //     title: 'A/S 리스트가 변경되었습니다.',
            //     text: '작업중이던 내용을 저장하고 새로고침해주세요.',
            //     hide: false
            // });

            // new PNotify({
            //     title: 'A/S 리스트가 변경되었습니다.',
            //     text: '작업중이던 내용을 저장하고 새로고침해주세요.',
            //     type: 'info',
            //     desktop: {
            //         desktop: true
            //     }
            // });
        });

    }

    // exports.nSocket = new nSocket();
    parent.nSocket = new nSocket();

})(window);
