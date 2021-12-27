(function (exports) {

    'use strict';

    var Talk = function () {

        var _instance = null,
            _this = this;

        Talk = function () {
            return _instance;
        }
        Talk.prototype = this;
        _instance = new Talk();
        _instance.constructor = Talk();

        _this.$el = {
            $BALLOON: $('#balloon'),
            $SERVICEINFO: $('.service-info'),
            $SERVICES: $('#services'),
            $STATUS: $('#status'),
            $FORM: $('.form'),
            $CHAT: $('.chat_wrapper')
        };
        _this.CONSTS = {
            SERVICE_STEP: {
                MAIN: [

                    {
                        id: 'service_request',
                        type: 'button',
                        text: '추가 A/S접수',
                        class: 'btn btn-success btn-block',
                        event: function () {
                            // CreateMessage($(this).text(), 'out');
                            // CheckServiceStatus()
                            // .CreateStep('SERVICE_STATUS');
                            nSocket.fn.LeaveSocket();
                            location.href = '/service/hospital';
                        }
                    },
                    {
                        id: 'service_histroy',
                        type: 'button',
                        text: 'A/S 상태조회 및 취소',
                        class: 'btn btn-success btn-block',
                        event: function () {
                            // CreateMessage($(this).text(), 'out');
                            _this.fn.CheckServiceStatusAll()
                                .CreateStep('SERVICE_STATUS');
                            // CreateStep('');
                        }
                    }
                ],
                SERVICE_STATUS: [{
                        id: 'service_cancel_id',
                        type: 'number',
                        value: '',
                        placeholder: '접수취소할 접수번호를 입력해주세요.',
                        class: 'form-control'
                    },
                    {
                        id: 'service_cancel_comment',
                        type: 'text',
                        value: '',
                        placeholder: '취소사유를 입력해주세요.',
                        class: 'form-control'
                    },
                    {
                        id: 'service_cancel',
                        type: 'button',
                        text: '접수취소',
                        class: 'btn btn-danger btn-block',
                        event: function () {
                            var service_id = $('#service_cancel_id').val().trim();
                            var service_comment = $('#service_cancel_comment').val().trim();
                            var services = _this.$el.$SERVICES.val().trim();
                            services = services.split('|');
                            if (!service_id.length) {
                                _this.fn.CreateMessage('ERROR_SERVICE_CANCEL_ID_BLANK', "in");
                                $('#service_cancel_id').focus();
                            } else if (!$.isNumeric(service_id)) {
                                _this.fn.CreateMessage('ERROR_SERVICE_CANCEL_ID_NAN', "in");
                                $('#service_cancel_id').focus();
                            } else if (!service_comment.length) {
                                _this.fn.CreateMessage('ERROR_SERVICE_CANCEL_COMMENT', "in");
                                $('#service_cancel_comment').focus();
                            } else if (!services.some(function (service) {
                                    return parseInt(service) === parseInt(service_id);
                                })) {
                                _this.fn.CreateMessage('ERROR_SERVICE_CANCEL_ID_UNEXIST', "in");
                                $('#service_cancel_id').focus();
                            } else {
                                _this.fn.CancelService({
                                    index: service_id,
                                    comment: service_comment
                                });
                                $('#service_cancel_comment').val('');
                                $('#service_cancel_id').val('').focus();
                            }
                        }
                    },
                    {
                        id: 'service_main',
                        type: 'button',
                        text: '메인으로',
                        class: 'btn btn-success btn-block',
                        event: function () {
                            if (window.params.notLoad === 0) {
                                _this.fn.CreateStep('MAIN', {
                                    SERVICE_INDEX: params.service['인덱스'],
                                    SERVICE_COUNT: params.count['처리건수'],
                                    SERVICE_TIMEOUT: (params.count['처리건수'] * 5) + '분'
                                });
                                _this.$el.$SERVICES.val(params.service['인덱스']);
                            } else {
                                _this.fn.CreateStep('MAIN');
                            }
                        }
                    }
                ]
            },
            SERVICE_MESSAGE: {
                MAIN: [
                    'A/S가 접수되었습니다.<br>접수번호: {{SERVICE_INDEX}}<br><br><b class="red">현재 담당자에게 접수되어 처리중인 A/S는 총 {{SERVICE_COUNT}}건입니다.<br>순차적으로 처리되오니 잠시만 기다려 주시면 확인 후 처리해 드리겠습니다. 전화보다 빠른 AS처리를 위해 노력하겠습니다. 감사합니다.',
                    '<b class="red">02-866-4582</b>번호로 피드백이 갑니다. 꼭 받아주세요.',
                    '[도움말]<br><br><button class="btn btn-success btn-xs">추가 A/S접수</button><br>다른 A/S를 추가로 접수할 수 있습니다.<br><br><button class="btn btn-success btn-xs">A/S 상태조회 및 취소</button><br>이전에 접수된 A/S의 진행상황을 확인하거나 접수취소할 수 있습니다.'
                ],
                SERVICE_STATUS: ['[도움말]<br><br><i class="fa fa-hand-o-right"></i> 접수취소 방법<br>1. 취소하려는 A/S 하단에 <button class="btn btn-danger btn-xs">접수 취소하기</button>를 클릭해주세요.<br>3. 화면하단에 취소사유를 입력하고 <button class="btn btn-danger btn-xs">접수취소</button>을 클릭합니다.'],
                ERROR_SERVICE_CANCEL_ID_BLANK: ["취소하려는 A/S 접수번호를 입력해주세요."],
                ERROR_SERVICE_CANCEL_ID_NAN: ["A/S 접수번호는 숫자로 입력해주세요."],
                ERROR_SERVICE_CANCEL_ID_UNEXIST: ["접수번호가 잘못되었습니다. 위의 접수번호를 다시 화인해주세요."],
                ERROR_SERVICE_CANCEL_COMMENT: ["접수취소 사유를 입력해주세요."]
            }
        };

        _this.data = {
            services: []
        };

        _this.fn = {
            SetSize: function () {
                var HEIGHT = $(document).height();

                $('.container, .main_container').css('height', '100%');
                $('.chat_wrapper').height(HEIGHT - _this.$el.$FORM.parent().outerHeight());
            },
            CreateStep: function (step, parseData) {

                step = step || 'MAIN';

                _this.$el.$FORM.empty();
                var $FOCUS = null;
                _this.CONSTS.SERVICE_STEP[step].forEach(function (item) {
                    var $GROUP = $('<div />').addClass('form-group');
                    var $ITEM;

                    switch (item.type) {
                        case 'button':
                            $ITEM = $('<button/>');
                            $ITEM.addClass(item.class);
                            $ITEM.attr({
                                type: 'button',
                                id: item.id
                            });
                            $ITEM.text(item.text);

                            if (item.hasOwnProperty('value')) {
                                $ITEM.attr('data-value', item.value);
                            }

                            if (item.hasOwnProperty('event')) {
                                $ITEM.bind('click', item.event);
                            }
                            break;
                        case 'textarea':
                            $ITEM = $('<textarea/>');
                            $ITEM.addClass('form-control');
                            $ITEM.attr({
                                id: item.id
                            });
                            if (item.hasOwnProperty('placeholder')) {
                                $ITEM.attr('placeholder', item.placeholder)
                            }
                            $FOCUS = $ITEM;
                            break;
                        case 'file':
                            $ITEM = $('<label />');
                            $ITEM.addClass('btn btn-success btn-block');
                            $ITEM.append(item.text)
                                .append('<input id="' + item.id + '" type="file" accept="image/*" multiple="true" style="display:none;">');

                            break;
                        case 'text':
                        case 'number':
                        case 'tel':
                            $ITEM = $('<input />');
                            $ITEM.attr({
                                type: item.type,
                                id: item.id,
                                class: 'form-control'
                            });
                            if (item.hasOwnProperty('value')) {

                                if (typeof item.value !== 'string') {
                                    $ITEM.attr('value', item.value.val().trim());
                                } else {
                                    $ITEM.attr('value', item.value);
                                }
                            }
                            if (item.hasOwnProperty('placeholder')) {
                                $ITEM.attr('placeholder', item.placeholder)
                            }
                            $FOCUS = $ITEM;
                            break;
                    }

                    $ITEM.appendTo($GROUP);
                    $GROUP.appendTo(_this.$el.$FORM);

                });
                if ($FOCUS && $FOCUS.length) {
                    $FOCUS.focus();
                }
                _this.fn.SetSize();
                _this.fn.CreateMessage(step, 'in', parseData);
            },
            CreateMessage: function (step, where, parseData) {
                var messages = _this.CONSTS.SERVICE_MESSAGE[step] || [step];
                /*
                if (message.indexOf('${SERVICE_TYPE}') >= 0) {
                    message = message.replace('${SERVICE_TYPE}', service.type === 0 ? '사용법' : '장애');
                }
                */

                messages.forEach(function (message) {
                    if (parseData) {
                        Object.keys(parseData).forEach(function (key) {
                            message = message.replace('{{' + key + '}}', parseData[key]);
                        });
                    } else {
                        if (message.indexOf('{{') >= 0) {
                            message = '';
                        }
                    }

                    if (message.indexOf('070-8852-8100') >= 0) {
                        if (params.hospital.hasOwnProperty('area') && params.hospital.area.trim() === '0000') {

                        } else {
                            message = '';
                        }
                    }

                    if (message.length) {
                        var $CONTAINER = $('<div/>').addClass('messageContainer clearfix ' + where + 'MessageContainer');
                        var $OWNER = $('<div />').addClass('ownerNameContainer').append(
                            '<div class="ownerName ' + where + '">' +
                            (where === 'in' ? 'NeoSoftBank ' : '') + moment().format('a hh:mm') +
                            '</div>'
                        );
                        $CONTAINER.append($OWNER).append('<div class="clearfix"></div>');

                        var $MESSAGEBODY = $('<div/>').addClass('messageBody clearfix');
                        var $MESSAGEWRAPPER = $('<div />').addClass('messageWrapper');
                        var $MESSAGE = $('<div />').addClass('message').html(message);
                        $MESSAGEWRAPPER.append($MESSAGE).append('<div class="clear"></div>');
                        $MESSAGEBODY.append($MESSAGEWRAPPER);

                        $CONTAINER.append($MESSAGEBODY);
                        $CONTAINER.appendTo(_this.$el.$CHAT);
                    }
                })


                _this.$el.$CHAT.animate({
                    scrollTop: _this.$el.$CHAT.prop('scrollHeight')
                }, 'fast');

            },
            CheckServiceStatusAll: function () {
                var services = _this.$el.$SERVICES.val().trim();
                if (!services.length) {
                    _this.fn.CreateMessage('이전에 접수된 A/S를 조회할 수 없습니다. <br>하단의 <button class="btn btn-success btn-xs">추가 A/S접수</button>을 눌러 A/S를 접수해주세요.', "in");
                    return {
                        CreateStep: function () {}
                    }
                } else {
                    _this.data.services = services.split('|');
                    _this.data.services.forEach(function (service, index) {
                        $.ajax({
                            url: API.SERVICE.STATUS,
                            data: {
                                index: service
                            },
                            dataType: 'json',
                            async: true,
                            success: function (result) {
                                switch (result['상태']) {
                                    case CONSTS.SERVICE_STATUS.ACCEPT:
                                        _this.fn.CreateMessage("접수번호: " + service + "<br>접수된 AS를 확인중입니다.<br>잠시만 기다려주세요.<br><br><button class='btn btn-danger btn-sm btn-block service-cancel' data-index='" + service + "'>접수 취소하기</button>", "in");
                                        break;
                                    case CONSTS.SERVICE_STATUS.SHARE:
                                    case CONSTS.SERVICE_STATUS.PROCESS:
                                        _this.fn.CreateMessage(
                                            "접수번호: " + service + "<br><br>" +
                                            "접수된 AS를 확인하고 처리중입니다.<br>" +
                                            "AS확인자: " + result['공유자명'] || result['처리자명'] + "<br><br>" +
                                            "<button class='btn btn-danger btn-sm btn-block service-cancel' data-index='" + service + "'>접수 취소하기</button>", "in");
                                        break;
                                    case CONSTS.SERVICE_STATUS.DONE:
                                        _this.fn.CreateMessage("접수번호: " + service + "<br>접수된 AS가 처리완료되었습니다.<br>감사합니다.", "in");
                                        _this.fn.CreateMessage(
                                            "접수번호: " + service + "<br><br>" +
                                            "접수된 AS가 처리완료되었습니다.<br>" +
                                            "완료 후 피드백은 전화가 필요한 경우만 연락드립니다.<br>" +
                                            "감사합니다.<br>" +
                                            "AS확인자: " + result['공유자명'] || result['처리자명'], "in");
                                        nSocket.fn.RemoveService(service, true);
                                        _this.fn.RemoveServiceId(null, index);
                                        break;
                                    case CONSTS.SERVICE_STATUS.HOLD:
                                        break;
                                    case CONSTS.SERVICE_STATUS.CANCEL:
                                        _this.fn.RemoveServiceId(null, index);
                                        break;
                                }
                            }
                        });
                    })
                    return {
                        CreateStep: _this.fn.CreateStep
                    }
                }


            },
            CancelService: function (data) {
                axios.put(API.SERVICE.CANCEL, data)
                    .then(function () {
                        _this.fn.CreateMessage("접수번호: " + data.index + "<br>A/S 접수가 취소되었습니다.", "in");
                        //CreateStep("MAIN");
                        nSocket.fn.RemoveService(data.index);
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
            },
            FeedBackService: function (data) {
                axios.put(API.SERVICE.FEEDBACK, data)
                    .then(function () {

                        //CreateStep("MAIN");
                        //nSocket.fn.RemoveService(data.index);
                        nSocket.fn.RemoveService(data.index);
                        _this.fn.RemoveServiceId(data.index);

                        var $feedbackBtns = $('.btn-group')
                        $feedbackBtns = $feedbackBtns.filter('[data-index="' + data.index + '"]')
                        if ($feedbackBtns.length) {
                            $feedbackBtns.before('참여해주셔서 감사합니다.')
                            $feedbackBtns.remove()
                        }

                    })
                    .catch(function (error) {
                        console.log(error);
                    })
            },
            UpdateService: function (data) {
                var message = '';

                _this.$el.$STATUS.val(data.index + '|' + data.status)

                switch (data['status']) {
                    case CONSTS.SERVICE_STATUS.ACCEPT:
                        //_this.fn.CreateMessage("접수번호: " + service + "<br>접수된 AS를 확인중입니다.<br>잠시만 기다려주세요.", "in");
                        break;
                    case CONSTS.SERVICE_STATUS.SHARE:
                    case CONSTS.SERVICE_STATUS.PROCESS:
                        if (parseInt(data['prev_status']) === CONSTS.SERVICE_STATUS.ACCEPT) {
                            message += "접수번호: " + data.index + "<br><br>";
                            message += "접수된 AS를 확인하고 처리중입니다.<br>";
                            message += "AS확인자: " + data.user['이름'] + "<br><br>";
                            message += "<button class='btn btn-danger btn-sm btn-block service-cancel' data-index='" + data.index + "'>접수 취소하기</button>";
                            break;
                        }
                        break;
                    case CONSTS.SERVICE_STATUS.DONE:
                        message += "접수번호: " + data.index + "<br><br>";
                        message += "접수된 AS가 처리완료되었습니다.<br>";
                        message += "완료 후 피드백은 전화가 필요한 경우만 연락드립니다.<br>";
                        message += "감사합니다.<br>";
                        message += "AS확인자: " + data.user['이름'];
                        break;
                    case CONSTS.SERVICE_STATUS.FEEDBACK:
                        message += "접수번호: " + data.index + "<br><br>";
                        message += "접수된 AS의 피드백 내용 전달을 완료하였습니다.<br>";
                        message += "이번 AS서비스를 평가해주세요.<br><br>";
                        message += '<div class="btn-group" data-index="' + data.index + '">';
                        message += '    <button type="button" class="bg-green btn btn-app service-feedback" data-index="' + data.index + '" data-value="1"><i class="fa fa-smile-o"></i>만족</button>';
                        message += '    <button type="button" class="bg-orange btn btn-app service-feedback" data-index="' + data.index + '" data-value="2"><i class="fa fa-meh-o"></i>보통</button>';
                        message += '    <button type="button" class="bg-red btn btn-app service-feedback" data-index="' + data.index + '" data-value="3"><i class="fa fa-frown-o"></i>불만족</button>';
                        message += '</div>';
                        break;
                }
                if (message.length) {
                    _this.fn.CreateMessage(message, "in");
                    _this.$el.$BALLOON.val(message.replace(/<br>/gim, '\n'));
                    _this.$el.$BALLOON[0].click();
                    // if (data['status'] === CONSTS.SERVICE_STATUS.FEEDBACK) {
                    //     nSocket.fn.RemoveService(data.index);
                    //     _this.fn.RemoveServiceId(data.index);
                    // }
                }
            },
            RemoveServiceId: function (id, index) {
                if (index !== null) {
                    _this.data.services.splice(index, 1);
                    _this.$el.$SERVICES.val(_this.data.services.join('|')).trigger('change').trigger('onchange').trigger('onChange');
                    document.getElementById('services').click();
                } else {
                    _this.data.services.some(function (service, idx) {
                        if (parseInto(service) === parseInt(id)) {
                            index = idx;
                            return true;
                        }
                    });
                    _this.data.services.splice(index, 1);
                    _this.$el.$SERVICES.val(_this.data.services.join('|')).trigger('change').trigger('onchange').trigger('onChange');
                    document.getElementById('services').click();
                    // _this.fn.RemoveServiceId(null, index);
                }
            },
            CallMissedPopup: function (index, data) {
                var message = '';
                var popMsg = '';
                message = '접수번호: ' + index + '<br>'
                popMsg = '접수번호: ' + index + '\n'
                message += '<b class="red">접수된 AS를 확인하기위해 2회 연락을 드렸으나 부재중 연결불가로 AS종료되니 재접수 바랍니다.</b> <br>'
                popMsg += '접수된 AS를 확인하기위해 2회 연락을 드렸으나 부재중 연결불가로 AS종료되니 재접수 바랍니다. \n'
                _this.fn.CreateMessage(message, "in");
                message = "[부재중 기록]<br>";
                popMsg += '[부재중 기록]\n';
                _this.fn.CreateMessage(message, "in");
                data.forEach(function (message, index) {
                    // alert(JSON.stringify(message))
                    // _this.fn.CreateMessage(" " + (index + 1) + ". " + message['수정일자'], "in");
                    popMsg += " " + (index + 1) + ". " + moment(message['수정일자']).calendar() + '\n';
                    _this.fn.CreateMessage(" " + (index + 1) + ". " + moment(message['수정일자']).calendar(), "in");
                })

                alert(popMsg)
                // if (message.length) {
                // _this.fn.CreateMessage(message, "in");
                _this.$el.$BALLOON.val(message.replace(/<br>/gim, '\n'));
                _this.$el.$BALLOON[0].click();
                // }
            }
        }

        $(window).bind('resize', function () {
            _this.fn.SetSize();
        });

        $(document).ready(function (event) {
            _this.$el.$CHAT.bind('click', function (event) {
                if (event.target.tagName === 'BUTTON') {
                    var $THIS = $(event.target);
                    if ($THIS.hasClass('service-cancel')) {
                        $('#service_cancel_id').val($THIS.data('index'));
                        $('#service_cancel_comment').focus();
                    } else if ($THIS.hasClass('service-feedback')) {
                        var data = {
                            index: $THIS.data('index'),
                            value: $THIS.data('value')
                        }
                        _this.fn.FeedBackService(data)
                    }
                } else if (event.target.tagName === 'I') {
                    var $THIS = $(event.target).parent();
                    if ($THIS.hasClass('service-feedback')) {
                        var data = {
                            index: $THIS.data('index'),
                            value: $THIS.data('value')
                        }
                        _this.fn.FeedBackService(data)
                    }
                }
            })
        });

        if (window.params.notLoad === 0) {
            _this.fn.CreateStep('MAIN', {
                SERVICE_INDEX: params.service['인덱스'],
                SERVICE_COUNT: params.count['처리건수'],
                SERVICE_TIMEOUT: (params.count['처리건수'] * 5) + '분'
            });
            _this.$el.$SERVICES.val(params.service['인덱스']);
        } else {
            _this.fn.CreateStep('MAIN');
        }

        var socketTimer = setInterval(function () {
            if (_this.$el.$SERVICES.val().trim() !== '') {
                nSocket.fn.SetInfo({
                    services: _this.$el.$SERVICES.val().trim()
                }).JoinSocket();

                clearInterval(socketTimer);
            }
        }, 500);

        return _instance;
    }

    exports.Talk = new Talk();


})(window);
