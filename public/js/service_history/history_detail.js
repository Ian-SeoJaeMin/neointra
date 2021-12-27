(function (exports) {

    'use strict';

    var Service = function () {
        var _instance = null,
            _this = this;

        Service = function () {
            return _instance;
        }

        Service.prototype = this;
        _instance = new Service();
        _instance.constructor = Service();

        _this.data = {
            service: params.service,
            info: params.info,
            uniq: params.uniq,
            replys: params.replys,
            backup: params.backup,
            extra: params.extra
        };

        _this.el = {
            $info: $('.x_content#info'),
            $remote: $('.x_content#remote'),
            $backup: $('.x_content#backup'),
            $uniq: $('.x_content#uniq'),
            $replys: $('.x_content#replys'),
            $service: $('.x_content#service')
        }

        _this.fn = {
            SetFeedBackLabel: function (item, compare, to) {
                if (compare(item, to)) {
                    item += ' <i class="fa fa-items-circle"></i>';
                    item = '<span class="red">' + item + '</span>';
                } else {
                    item += ' <i class="fa fa-check-circle"></i>';
                    item = '<span class="blue">' + item + '</span>';
                }
                return item;
            },
            render: function () {
                $('#title').text('[' + _this.data.service['인덱스'] + '] ' + _this.data.info['기관명칭']);
                _this.fn.hospitalRender();
                _this.fn.workflowRender();
                _this.fn.serviceRender();
                _this.fn.imageRender();
                _this.fn.replysRender();
            },
            workflowRender: function () {
                var service = _this.data.service;
                var $el = _this.el.$service;
                var $WORKFLOW = '';
                $WORKFLOW += '<div>';

                if (service['상태'] >= CONSTS.SERVICE_STATUS.ACCEPT) {
                    $WORKFLOW += ' <b>접수자:</b> ' + service['접수자'];
                    $WORKFLOW += ' <b>연락처:</b> ' + service['연락처'] + (service['내선번호'] ? '(내선: ' + service['내선번호'] + ')' : '');
                    $WORKFLOW += ' <b>접수일:</b> <span class="red">' + moment(service['접수일자']).calendar() + '(' + moment(service['접수일자']).fromNow() + ')</span>';
                }

                if (service['확인자'] !== 0) {
                    $WORKFLOW += '<br>';
                    $WORKFLOW += ' <b>확인자:</b> <b class="blue">' + service['확인자명'] + '</b>';
                    $WORKFLOW += ' <b>확인일:</b><span class="red">' + service['확인일자'] + '</span>';
                }

                if (service['상태'] >= CONSTS.SERVICE_STATUS.SHARE && service['공유자'] !== 0) {
                    $WORKFLOW += '<br>';
                    $WORKFLOW += ' <b>공유자:</b> <b class="blue">' + (service['공유자'] !== 0 ? service['공유자명'] : Data.Service.info['담당'] || '') + '</b>';
                    $WORKFLOW += ' <b>공유일:</b><span class="red">' + (service['공유자'] !== 0 ? moment(service['공유일자']).calendar() : '15분 자동공유') + '(' + moment(service['공유일자']).fromNow() + ')</span>';
                }

                if (service['상태'] >= CONSTS.SERVICE_STATUS.PROCESS && service['처리자'] !== 0) {
                    $WORKFLOW += '<br>';
                    $WORKFLOW += ' <b>처리자:</b> <b class="blue">' + service['처리자명'] + '</b>';
                    $WORKFLOW += ' <b>처리일:</b><span class="red">' + moment(service['처리일자']).calendar() + '(' + moment(service['처리일자']).fromNow() + ')</span>';
                }

                if (service['상태'] >= CONSTS.SERVICE_STATUS.HOLD && service['보류자'] !== 0) {
                    $WORKFLOW += '<br>';
                    $WORKFLOW += ' <b>보류자:</b> <b class="blue">' + service['보류자명'] + '</b>';
                    $WORKFLOW += ' <b>보류일:</b><span class="red">' + moment(service['보류일자']).calendar() + '(' + moment(service['보류일자']).fromNow() + ')</span>';
                }

                if (service['상태'] >= CONSTS.SERVICE_STATUS.DONE && service['완료자'] !== 0) {
                    $WORKFLOW += '<br>';
                    $WORKFLOW += ' <b>완료자:</b> <b class="blue">' + service['완료자명'] + '</b>';
                    $WORKFLOW += ' <b>완료일:</b><span class="red">' + moment(service['완료일자']).calendar() + '(' + moment(service['완료일자']).fromNow() + ')</span>';
                }

                if (service['응급'] === 1) {
                    $WORKFLOW += '<br>';
                    $WORKFLOW += '<span class="badge bg-red">응급 A/S</span>';
                }
                if (service['본사'] === 1) {
                    $WORKFLOW += '<br>';
                    $WORKFLOW += '<span class="badge bg-blue">본사 A/S</span>';
                }

                $WORKFLOW += '<div class="ln_solid"></div>';
                $WORKFLOW += '<b>실행파일:</b> ' + service['실행파일'];
                $WORKFLOW += '<br>';
                $WORKFLOW += '<b class="red">버튼/메뉴: ' + service['실행메뉴'] + ' - ' + service['세부화면'] + "</b>";
                // $WORKFLOW += '<br>';
                // $WORKFLOW += '<b>중분류:</b> ' + service['세부화면'];


                $WORKFLOW += '</div>';

                $el.append($WORKFLOW);

            },
            serviceRender: function () {
                var service = _this.data.service;
                var $el = _this.el.$service;
                var images = service['이미지'].trim().length > 0 ? service['이미지'].split(',') : null;

                var $COMMENT = '',
                    $DIVIDELINE = '<div class="ln_solid"></div>',
                    $QUESTION_TITLE = '<h5 class="font-bold"><i class="fa fa-question-circle orange"></i> 문의내용</h5>',
                    $QUESTION_READ = exports.fn.urlify(service['문의내용'].replace(/\n/gim, '<br>')) || ' - ',
                    $CONFIRM_TITLE = '<h5 class="font-bold"><i class="fa fa-info-circle blue"></i> 확인내용</h5>',
                    $CONFIRM_READ = exports.fn.urlify(service['확인내용'].replace(/\n/gim, '<br>')) || ' - ',
                    $HOLD_TITLE = '<h5 class="font-bold"><i class="fa fa-pause-circle"></i> 보류내용</h5>',
                    $HOLD_READ = exports.fn.urlify(service['보류내용'].replace(/\n/gim, '<br>')) || ' - ',
                    $PROCESS_TITLE = '<h5 class="font-bold"><i class="fa fa-check-circle green"></i> 처리내용</h5>',
                    $PROCESS_READ = (service['처리구분'] > 0 ? '<h5 class="font-bold blue">처리구분: ' + params.setting.service['처리구분'][service['처리구분'] - 1]['구분명'] + '</h5>' : '') + exports.fn.urlify(service['처리내용'].replace(/\n/gim, '<br>')) || ' - ',
                    $CANCEL_TITLE = '<h5 class="font-bold"><i class="fa fa-times-circle red"></i> 취소내용</h5>',
                    $CANCEL_READ = exports.fn.urlify(service['취소내용'].replace(/\n/gim, '<br>')) || ' - ';
                //     $TAG_TITLE = '<h5 class="font-bold"><i class="fa fa-tag"> 태그</i></h5>';


                // var tags = service['태그'].length ? service['태그'].split('||') : [];
                // var $TAG = '';
                // if (tags.length) {
                //     tags.forEach(function (tag) {
                //         $TAG += '<div class="chip">#' + tag + '</div>'
                //     });
                // }


                $COMMENT += $DIVIDELINE + $QUESTION_TITLE + $QUESTION_READ +
                    $DIVIDELINE + $CONFIRM_TITLE + $CONFIRM_READ +
                    $DIVIDELINE + $PROCESS_TITLE + $PROCESS_READ +
                    $DIVIDELINE + $HOLD_TITLE + $HOLD_READ +
                    $DIVIDELINE + $CANCEL_TITLE + $CANCEL_READ;
                // $DIVIDELINE + $TAG_TITLE + $TAG;


                $el.append($COMMENT);

            },
            imageRender: function () {
                var service = _this.data.service;
                var $el = _this.el.$service;

                var $IMAGES = '';
                var $DIVIDELINE = '<div class="ln_solid"></div>';
                $IMAGES += $DIVIDELINE;

                $IMAGES += '<ul class="list-unstyled">';
                if (service['이미지'].trim().length > 0) {
                    var images = service['이미지'].split(',');
                    images.forEach(function (img) {
                        img = img.indexOf('/uploads/service') < 0 ? img.replace('/capture', '/uploads/service') : img;
                        img = img.indexOf('/uploads') < 0 ? '/uploads' + img : img;
                        $IMAGES += '<li>';
                        $IMAGES += '    <img style="width:100%;" data-imageviewer="true" src="' + img + '" data-high-src="' + img + '" data-tooltip="tooltip" title="이미지를 더블클릭하면 크게 볼 수 있습니다.">';
                        $IMAGES += '</li>';
                    });
                }

                $IMAGES += '</ul>';
                $el.append($IMAGES);
            },
            hospitalRender: function () {
                var data = _this.data;
                var $el;
                var html = '';
                var keys = [];

                // 병원정보 & 부가서비스
                $el = _this.el.$info;
                keys = Object.keys(data.info);
                if (keys.length) {
                    html += '<ul class="list-unstyled user_data collapse in" id="_hospinfo" aria-expanded="true">';
                    keys.forEach(function (key) {
                        html += '<li><b>' + key + ':</b> ' + data.info[key] + '</li>';
                    });
                    html += '</ul>';
                }

                //부가서비스
                if (data.extra) {
                    html += '<div class="ln_solid"></div>';
                    html += '<h5 class="">';
                    html += '  부가서비스';
                    html += '</h5>';
                    html += '<ul class="list-unstyled user_data" id="_extra">';
                    data.extra.forEach(function (extra) {
                        html += '  <button type="button" class="btn btn-default btn-xs">' + extra['부가서비스'] + '</button>';
                    });
                    html += '</ul>';
                }
                $el.append(html);

                //원격정보
                html = '';
                $el = _this.el.$remote;
                keys = Object.keys(data.uniq).filter(function (key) {
                    return key.match(/원격서버|원격아이디|원격비번|스탠바이이름|스탠바이비번/gim);
                });
                if (keys.length) {
                    html += '<ul class="list-unstyled user_data collapse in" id="_seetrol" aria-expanded="true">';
                    keys.forEach(function (key) {
                        html += '<li><b>' + key + ':</b> ' + data.uniq[key] + '</li>';
                    });
                    html += '</ul>';
                }
                $el.append(html);

                //특이사항
                html = '';
                $el = _this.el.$uniq;
                keys = Object.keys(data.uniq).filter(function (key) {
                    return !key.match(/원격서버|원격아이디|원격비번|스탠바이이름|스탠바이비번/gim);
                });
                if (keys.length) {
                    html += '<ul class="list-unstyled user_data collapse in" id="_certificate" aria-expanded="true">';
                    keys.forEach(function (key) {
                        if (key === '메모') {
                            html += '<li>  <b>' + key + ':</b><br>';
                            if (data.uniq[key] && data.uniq[key].length) {
                                html += '  ' + data.uniq[key].replace(/\n/gim, '<br/>');
                            }
                            html += '<li>';
                            // html += '  <pre class="unstyled-pre">' + data.uniq[key] + '</pre>';
                            // html += exports.fn.urlify(data.uniq[key]);
                        } else if (key === '병원유형') {
                            html += '<li><b>' + key + ':</b> <b class="{{병원유형}}">' + data.uniq[key] + '</b></li>';

                            if (data.uniq[key] === '우수') {
                                html = html.replace('{{병원유형}}', 'blue');
                            } else if (data.uniq[key] === '주의') {
                                html = html.replace('{{병원유형}}', 'red');
                            } else {
                                html = html.replace('{{병원유형}}', '');
                            }
                        } else if (key !== '수정자' && key !== '수정일자') {
                            // html += '<b>' + key + ':</b> ' + data.uniq[key] + '<br/>';
                            html += '<li><b>' + key + ':</b> ' + data.uniq[key] + '</li>';
                        }
                    });
                    html += '<li><b>수정자:</b> ' + data.uniq['수정자'] + ' <b>수정일:</b> ' + data.uniq['수정일자'] + '</li>';
                    html += '</ul>';
                }
                $el.append(html);

                //백업현황
                html = '';
                $el = _this.el.$backup;
                keys = Object.keys(data.backup);
                if (keys.length) {
                    html += '<ul class="list-unstyled user_data collapse in" id="_database" aria-expanded="true">';
                    Object.keys(data.backup).forEach(function (key) {
                        switch (key) {
                            case '백업일시':
                                data.backup[key] = exports.fn.SetFeedBackLabel(data.backup[key], function (a) {
                                    return a < moment().subtract(1, 'days').format('YYYY-MM-DD');
                                })
                                break;
                            case '로그축소':
                                data.backup[key] = exports.fn.SetFeedBackLabel(data.backup[key], function (a) {
                                    return a !== '사용';
                                })
                                break;
                            case '정품여부':
                                data.backup[key] = data.backup[key] === 1 ? 'Standard' : 'Express';
                                data.backup[key] = exports.fn.SetFeedBackLabel(data.backup[key], function (a) {
                                    return a !== 'Standard';
                                })
                                break;
                            case '수가':
                            case '약가':
                            case '재료':
                                data.backup[key] = data.backup[key] || data.backup['S' + key];
                                data.backup[key] = data.backup[key] == null ? '' : data.backup[key];
                                data.backup[key] = exports.fn.SetFeedBackLabel(data.backup[key], function (a, b) {
                                    a = a.replace(/./gim, '');
                                    b = b.replace(/./gim, '');
                                    return a !== b;
                                }, data.backup['M' + key]);
                                break;
                            case '백업경로용량':
                                data.backup[key] = exports.fn.SetFeedBackLabel(data.backup[key], function (a) {
                                    return a < 100;
                                });
                                data.backup[key] = data.backup[key].replace('<i class="fa"', ' GB <i class="fa');
                                break;
                        }
                        if (!key.match(/S수가|S약가|S재료|M수가|M약가|M재료/gim) && data.backup[key]) {
                            html += '<li><b>' + key + ':</b> ' + data.backup[key] + '</li>';
                        }
                    })
                }
                $el.append(html);

            },
            replysRender: function () {
                var replys = _this.data.replys;
                var $el = _this.el.$replys;
                var $REPLYS = '';
                $REPLYS += '    <ul class="messages">';
                replys.forEach(function (reply) {
                    $REPLYS += '<li>';
                    $REPLYS += '    <div class="message_date">';
                    $REPLYS += '        <p class="month">' + moment(reply['작성일자']).fromNow() + '</p>';
                    $REPLYS += '    </div>';
                    $REPLYS += '    <div class="message_wrapper m-l-none m-r-none">';
                    $REPLYS += '        <h5 class="heading blue"><i class="fa fa-user-circle"></i> ' + reply['작성자명'] + '</h5>';
                    $REPLYS += '        <p class="url">' + exports.fn.urlify(reply['내용']) + '</p>';
                    $REPLYS += '    </div>';
                    $REPLYS += '</li>';
                });
                $REPLYS += '    </ul>'
                $el.append($REPLYS);
            }
        }

        return _instance;
    }

    exports.Service = new Service();
    exports.Service.fn.render();

})(window);
