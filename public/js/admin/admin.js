(function (exports) {

    'use strict';

    var Admin = function () {
        var _instance = null,
            _this = this;

        Admin = function () {
            return _instance;
        }

        Admin.prototype = this;
        _instance = new Admin();
        _instance.constructor = Admin();

        var step = {
            sort: _sorting,
            render: _renderUsers,
            renderServiceUserSelect: _renderServiceUserSelect,
            renderManagers: _renderManagers,
            renderAreas: _renderAreas
        };

        var setting = params.setting;
        setting['service'] = setting['service'] || {
            '담당자': {
                '본사': {
                    '고정': 78,
                    '로테이션': 135
                },
                '직영': {
                    '고정': 192,
                    '로테이션': 121
                },
                '개발': {
                    '고정': 186
                }
            },
            '확인내용': '    1)실행파일 및 메뉴: \n' +
                '    2)환자정보 (챠트번호, 종별): \n' +
                '    3)진료일자: \n' +
                '    4)처방코드: \n' +
                '    5)특정자리 여부, 빈도 수: \n' +
                '    6)현상 순서 ( 테스트 결과 : 현상 나타남 / 나타나지 않음 ): \n\n' +
                '2.본인이 확인했던 내용들 기재\n\n' +
                '3.서버 정보 혹은 클라이언트 pc 정보 기재 ( 사용 가능 시간 포함 )\n',
            '보류매크로': [
                "담당자와 연결이 안될 경우",
                "이미 다른 병원에서 수정이 됐는데 셋업을 기다리는 경우",
                "증상이 나타났다가 괜찮다가 하는 원인 찾기 힘든 경우",
                "바로 처리가 어렵고 시간이 필요한 경우",
                "오류는 아니나 다시 확인이 필요한 사항",
                "요청사항이 접수되어 프로젝트를 통해 작업이 이루어져야 하는 경우",
                "업무중이라 점심시간이나 업무종료 후 원격가능한경우",
                "수정중인 경우",
                "내용중복인 경우",
                "담당자와 내용확인이 필요한 경우"
            ],
            "처리구분": [{
                '구분명': '수정사항',
                '입력사항': '1) 오류사황, 오류원인\n2) 수정된 결과\n3) 셋업 배포 일자',
                '예시': '1) 원인 : DRG 환자는 영수증 출력 시 퇴원이 아닌 중간으로 찍히는 오류 발생\n2) 수정사항 : 퇴원으로 찍히도록 작업\n3) 배포 : 20171212-1 반영 예정'
            }, {
                '구분명': '데이터처리',
                '입력사항': '1) 데이터가 잘못 들어가게 된 추정원인\n2) 처리 방법 - 동일한 상황 시 처리 방법\n3) 앞으로 데이터가 잘못 들어가지 않게 하는 방법',
                '예시': '1) 원인 : 사용자가 실수로 식이 리핏하여 식이가 2건 씩 중복으로 들어가서 발생\n2) 처리 방법 : 중복으로 들어간 것에 대해 데이터 처리\n3) 방지 대책 : 사용자 실수 줄일 수 있도록 도움말 처리'
            }, {
                '구분명': '사용법 및 옵션 등의 내용 전달',
                '입력사항': '1) 잘못된 사용법이나 잘못 설정된 옵션 설정 기재\n2) 올바른 사용법 기재\n3) 도움말 처리 여부',
                '예시': '1) 원인 : 환경설정 협진기록 작성시에만 협의진찰료 체크하지 않아 협의 진찰료 안 붙는 현상\n2) 올바른방법 : 환경설정 - 입원수납 - 협진기록 작성시에만 협의진찰료 에 체크하면 됨.\n3) 도움말 처리 : 환경설정에 도움말 추가'
            }],
            "우선순위": [{
                '목표': '',
                '방법': '',
                '중요': ''
            }, {
                '목표': '',
                '방법': '',
                '중요': ''
            }, {
                '목표': '',
                '방법': '',
                '중요': ''
            }, {
                '목표': '',
                '방법': '',
                '중요': ''
            }, {
                '목표': '',
                '방법': '',
                '중요': ''
            }]
        }
        setting.service['우선순위'] = setting.service['우선순위'] || []
        setting.service['확인내용'] = setting.service['확인내용'] || '1)실행파일 및 메뉴: \n' +
            '2)환자정보 (챠트번호, 종별): \n' +
            '3)진료일자: \n' +
            '4)처방코드: \n' +
            '5)특정자리 여부, 빈도 수: \n' +
            '6)현상 순서 ( 테스트 결과 : 현상 나타남 / 나타나지 않음 ): \n\n' +
            '2.본인이 확인했던 내용들 기재\n\n' +
            '3.서버 정보 혹은 클라이언트 pc 정보 기재 ( 사용 가능 시간 포함 )\n'

        function Load() {
            _renderHoldMacro();
            _renderProcess();
            _renderPriority();
            _renderConfirmForm();
            LoadUsers();
        }

        function _loadCustomer(key, value) {
            var params = {};
            params[key] = value;
            axios.get(API.CUSTOMER.FEE, {
                params: params
            }).then(function (result) {
                _renderCustomerFee(result.data);
            }).catch(function (error) {
                fn.errorNotify(error);
            })
        }

        function _renderCustomerFee(data) {
            console.log(data);
            var $SALESMANS = _this.el.$SALESMANS.empty();

            data.forEach(function (item) {
                var $ROW = $('<tr />');
                $ROW.append('<td class="text-center">' + item['기관코드'] + '</td>');
                $ROW.append('<td class="text-center">' + item['기관명칭'] + '</td>');
                $ROW.append('<td class="text-center">' + item['병원구분'] + '</td>');
                $ROW.append('<td class="text-center">' + item['프로그램'] + '</td>');
                $ROW.append('<td class="text-center">' + item['담당지사'] + '(' + (item['담당자'] || '') + ')</td>');
                $ROW.append(
                    '<td class="bg-warning">' +
                    '   <div class="input-group input-group-sm m-b-none">' +
                    '   <input ' + (item['병원구분'] === '' ? 'disabled' : '') + ' type="number" class="form-control" data-key="관리수당" data-index="' + item['ID'] + '" value="' + item['관리수당'] + '" />' +
                    '   <span class="input-group-addon">Enter 키로 저장</span>' +
                    '   </div>' +
                    '</td>'
                );
                $ROW.appendTo($SALESMANS);
            });


            $SALESMANS.find('input[type="number"]').bind('keyup', function (event) {
                // if (!$.isNumeric($(this).val().trim())) {
                //     return event.preventDefault();
                // } else if (!$.isNumeric(event.key)) {
                //     return event.preventDefault();
                // }
                if (event.keyCode !== 13) {
                    return event.preventDefault();
                }
                SaveCustomerFee($(this).val(), $(this).data('index'));

            });
        }

        function _renderPriority() {
            var prioritys = setting.service['우선순위'] || []

            var $TARGET = _this.el.$SERVICE.$PRIORITYS.find('tbody');
            var $ADDER = $('#priority-add');

            $TARGET.empty()
            prioritys.forEach(function (priority, index) {
                _addItem(priority, index)
            })

            // $TARGET.find('input[type="checkbox"]').iCheck({
            //     checkboxClass: 'icheckbox_flat-orange',
            //     radioClass: 'iradio_flat-orange'
            // })

            $TARGET.bind('click', function (event) {
                if (event.target.tagName === 'BUTTON') {
                    var index = -1
                    var $ROW = undefined
                    if ($(event.target).hasClass('priority-delete')) {
                        index = $(event.target).data('index')
                        // prioritys[index] = {
                        //     '목표': '',
                        //     '방법': '',
                        //     '중요': 0
                        // }
                        prioritys.splice(index, 1)

                        $ROW = $(event.target).closest('tr')
                        $ROW.remove()
                        // $ROW.find('input:text').val('')
                        // $ROW.find('input[type="checkbox"]').iCheck('uncheck')
                        SaveSetting('우선순위')
                    } else if ($(event.target).hasClass('priority-save')) {
                        index = $(event.target).data('index')
                        $ROW = $(event.target).closest('tr')
                        prioritys[index] = {
                            '목표': $ROW.find('input:text').eq(0).val(),
                            '방법': $ROW.find('input:text').eq(1).val(),
                            '중요': $ROW.find('input:text').eq(2).val()
                        }
                        // console.log(prioritys, setting.service['우선순위'])
                        SaveSetting('우선순위')
                    }
                }
            });

            $ADDER.bind('click', function (event) {
                prioritys.push({
                    '목표': '',
                    '방법': '',
                    '중요': ''
                })
                _addItem(prioritys[prioritys.length - 1], prioritys.length - 1)
            });

            function _addItem(data, index) {
                $TARGET.append(
                    '<tr>' +
                    '    <td><input type="text" class="input form-control" value="' + data['목표'] + '"/></td>' +
                    '    <td><input type="text" class="input form-control" value="' + data['방법'] + '"/></td>' +
                    // '    <td><input type="checkbox" ' + (data['중요'] === 1 ? 'checked' : '') + ' disabled/></td>' +
                    '   <td><input type="text" class="input form-control" value="' + data['중요'] + '" placeholder="콤마(,)로 구분하여 중요표시 단어를 입력해주세요."/></td>' +
                    '    <td><button class="btn btn-xs btn-success priority-save" data-index="' + index + '">저장</button><button class="btn btn-xs btn-danger priority-delete" data-index="' + index + '">삭제</button></td>' +
                    '</tr>'
                )

                // $TARGET.find('input[type="checkbox"]').iCheck({
                //     checkboxClass: 'icheckbox_flat-orange',
                //     radioClass: 'iradio_flat-orange'
                // })
            }

            // $ADDER.unbind('click').bind('click', function (event) {
            //     prioritys.push({
            //         '목표': '',
            //         '방법': '',
            //         '중요': 0
            //     })
            //     $TARGET.append(
            //         '<tr>' +
            //         '    <td><input type="text" class="input form-control" value=""/></td>' +
            //         '    <td><input type="text" class="input form-control" value=""/></td>' +
            //         '    <td><input type="checkbox"/></td>' +
            //         '    <td><button class="btn btn-xs btn-success prioriry-save" data-index="' + (prioritys.length - 1) + '">저장</button><button class="btn btn-xs btn-danger prioriry-delete" data-index="' + (prioritys.length - 1) + '">삭제</button></td>' +
            //         '</tr>'
            //     )
            //     $TARGET.find('input[type="checkbox"]').iCheck({
            //         checkboxClass: 'icheckbox_flat-orange',
            //         radioClass: 'iradio_flat-orange'
            //     })
            // })

        }

        function _renderConfirmForm() {
            var confirmForm = setting.service['확인내용']
            var $TARGET = $('#confirm-form');

            $TARGET.val(confirmForm)

        }

        function _renderHoldMacro() {
            var macros = setting.service['보류매크로'];
            var $TARGET = _this.el.$SERVICE.$HOLDMACRO;
            var $ADDER = $('.input-adder[data-target=".hold-macro"]');
            var $ADDBUTTON = $('.btn-adder[data-target=".hold-macro"]');
            $TARGET.empty();
            macros.forEach(function (macro, index) {
                $TARGET.append(
                    '<a href="#" class="list-group-item" data-index="' + index + '">' + macro + '<button type="button" class="badge bg-red btn btn-xs btn-link">x</button></a>'
                );
            });

            $TARGET.bind('click', function (event) {
                event.preventDefault();
                if (event.target.tagName === 'BUTTON') {
                    $(event.target).closest('a').remove();
                    macros.splice($($(event.target).closest('a')).data('index'), 1);
                } else if (event.target.tagName === 'A') {
                    // $ADDER.val($(event.target).text()).data('index', $(event.target).data('index')).focus();
                    $ADDER.val(macros[$(event.target).data('index')]).data('index', $(event.target).data('index')).focus();
                }
            });
            $ADDBUTTON.bind('click', function (event) {
                var macro = $ADDER.val().trim();
                if (macro.length) {
                    macros.push(macro);
                    $TARGET.append(
                        '<a href="#" class="list-group-item" data-index="' + (macros.length - 1) + '">' + macro + '<button type="button" class="badge bg-red btn btn-xs btn-link">x</button></a>'
                    );
                }
            });
            $ADDER.bind('keyup', function (event) {
                var $THIS = $(this);
                if ($THIS.data('index') !== undefined) {
                    var $TARGET = _this.el.$SERVICE.$HOLDMACRO.find('a[data-index="' + $THIS.data('index') + '"]');
                    $TARGET.contents().first()[0].textContent = $(this).val().trim();
                    macros[$THIS.data('index')] = $(this).val().trim();
                }
            })
        }

        function _renderProcess() {
            var processes = setting.service['처리구분'];
            var types = processes.map(function (_process) {
                return _process['구분명'];
            });
            var $TARGET = _this.el.$SERVICE.$PROCESSTYPE;
            var $ADDER = $('.input-adder[data-target=".process-type"]');
            var $ADDBUTTON = $('.btn-adder[data-target=".process-type"]');
            var $REQUIRE = _this.el.$SERVICE.$PROCESSREQUIRE;
            var $EXAMPLE = _this.el.$SERVICE.$PROCESSEXAMPLE;
            types.forEach(function (type, index) {
                $TARGET.append(
                    '<a href="#" class="list-group-item" data-index="' + index + '">' + type + '<button type="button" class="badge bg-red btn btn-xs btn-link">x</button></a>'
                );
            })

            $TARGET.bind('click', function (event) {
                // alert('작업중입니다.');
                if (event.target.tagName === 'BUTTON') {
                    event.preventDefault();
                    $(event.target).closest('a').remove();
                    processes.splice($($(event.target).closest('a')).data('index'), 1);
                } else {
                    var $THIS = $(event.target);
                    $THIS.addClass('active').siblings().removeClass('active');
                    $ADDER.val(processes[$THIS.data('index')]['구분명']).data('index', $THIS.data('index'));
                    $REQUIRE.val(processes[$THIS.data('index')]['입력사항']).data('index', $THIS.data('index'));
                    $EXAMPLE.val(processes[$THIS.data('index')]['예시']).data('index', $THIS.data('index'));
                }
            });

            $REQUIRE.bind('keyup', function (event) {
                var index = $(this).data('index');
                var sub = $(this).data('sub');
                processes[index][sub] = $(this).val().trim();
            });
            $EXAMPLE.bind('keyup', function (event) {
                var index = $(this).data('index');
                var sub = $(this).data('sub');
                processes[index][sub] = $(this).val().trim();
            });

            $ADDER.bind('keyup', function (event) {
                var $THIS = $(this);
                if ($THIS.data('index') !== undefined) {
                    var $TARGET = _this.el.$SERVICE.$PROCESSTYPE.find('a[data-index="' + $THIS.data('index') + '"]');
                    $TARGET.contents().first()[0].textContent = $(this).val().trim();
                    processes[$THIS.data('index')]['구분명'] = $(this).val().trim();
                }
            });
            $ADDBUTTON.bind('click', function (event) {
                var newProcess = $ADDER.val().trim();
                if (newProcess.length) {
                    processes.push({
                        구분명: newProcess,
                        입력사항: '',
                        예시: ''
                    });
                    $TARGET.append(
                        '<a href="#" class="list-group-item" data-index="' + (processes.length - 1) + '">' + newProcess + '<button type="button" class="badge bg-red btn btn-xs btn-link">x</button></a>'
                    );
                }
            });
        }

        function LoadUsers() {

            axios.get(API.COMPANY.USERS)
                .then(function (result) {
                    _this.data.users = result.data;
                    step.sort().render().sort(null, '부서코드').renderServiceUserSelect();
                    return axios.get(API.COMPANY.MANAGERS);
                })
                .then(function (result) {
                    if (result.status === 200) {
                        step.renderManagers(result.data[0]);
                    }
                    return axios.get(API.COMPANY.AREAS);
                })
                .then(function (result) {
                    if (result.status === 200) {
                        step.renderAreas(result.data[0]);
                    }
                })
                .catch(function (error) {
                    fn.errorNotify(error);
                });

        }

        function _sorting(data, field) {
            data = data || _this.data.users;
            field = field || '인덱스';
            data = data.sort(function (a, b) {
                return (a[field] > b[field] ? 1 : (a[field] < b[field] ? -1 : 0));
            });
            return step;
        }

        function _renderUsers(data) {
            var $USERS = _this.el.$USERS.empty();
            var $BOARDS = _this.el.$BOARDUSERS.empty();
            var boards = [];
            var users = data || _this.data.users;

            $BOARDS.parent().find('thead').find('th[data-board]').each(function () {
                boards.push($(this).data('board'));
            });

            console.log(boards);

            users.forEach(function (user) {
                var settings = JSON.parse(user['설정'] || '{}');
                var $ROW = $('<tr />');
                $ROW.append('<td class="text-center">' + user['인덱스'] + '</td>');
                $ROW.append('<td class="text-center">' + user['아이디'] + '</td>');
                $ROW.append('<td class="text-center">' + user['비밀번호'] + '</td>');
                $ROW.append('<td class="text-center">' + user['이름'] + '</td>');
                $ROW.append('<td class="text-center">' + user['소속'] + '</td>');
                $ROW.append('<td class="text-center">' + user['부서'] + '</td>');
                $ROW.append('<td class="text-center bg-warning"><input type="checkbox" data-key="관리자" data-index="' + user['인덱스'] + '" ' + (settings.admin === 1 ? 'checked' : '') + '/></td>');
                $ROW.append('<td class="text-center bg-warning"><input type="checkbox" data-key="확인내용" data-index="' + user['인덱스'] + '" ' + (settings.admin === 1 || (settings['확인내용'] && settings['확인내용'] === 1) ? 'checked' : '') + '/></td>');
                $ROW.append('<td class="text-center bg-warning"><input type="checkbox" data-key="보류매크로" data-index="' + user['인덱스'] + '" ' + (settings.admin === 1 || (settings['보류매크로'] && settings['보류매크로'] === 1) ? 'checked' : '') + '/></td>');
                $ROW.append('<td class="text-center bg-warning"><input type="checkbox" data-key="처리구분" data-index="' + user['인덱스'] + '" ' + (settings.admin === 1 || (settings['처리구분'] && settings['처리구분'] === 1) ? 'checked' : '') + '/></td>');
                $ROW.append('<td class="text-center bg-warning"><input type="checkbox" data-key="우선순위" data-index="' + user['인덱스'] + '" ' + (settings.admin === 1 || (settings['우선순위'] && settings['우선순위'] === 1) ? 'checked' : '') + '/></td>');
                $ROW.append('<td class="text-center bg-warning"><input type="checkbox" data-key="AS담당자" data-index="' + user['인덱스'] + '" ' + (settings.admin === 1 || (settings['AS담당자'] && settings['AS담당자'] === 1) ? 'checked' : '') + '/></td>');
                $ROW.append('<td class="text-center bg-warning"><input type="checkbox" data-key="게시판권한" data-index="' + user['인덱스'] + '" ' + (settings.admin === 1 || (settings['게시판권한'] && settings['게시판권한'] === 1) ? 'checked' : '') + '/></td>');
                $ROW.append('<td class="text-center bg-warning"><input type="checkbox" data-key="지사선택" data-index="' + user['인덱스'] + '" ' + (settings.admin === 1 || (settings['지사선택'] && settings['지사선택'] === 1) ? 'checked' : '') + '/></td>');
                $ROW.append('<td class="text-center bg-warning"><input type="checkbox" data-key="담당자선택" data-index="' + user['인덱스'] + '" ' + (settings.admin === 1 || (settings['담당자선택'] && settings['담당자선택'] === 1) ? 'checked' : '') + '/></td>');
                $ROW.append('<td class="text-center bg-warning"><input type="checkbox" data-key="정산" data-index="' + user['인덱스'] + '" ' + (settings.admin === 1 || (settings['정산'] && settings['정산'] === 1) ? 'checked' : '') + '/></td>');
                $ROW.append('<td class="text-center bg-warning"><input type="checkbox" data-key="권한관리" data-index="' + user['인덱스'] + '" ' + (settings.admin === 1 ? 'checked' : '') + '/></td>');
                $ROW.appendTo($USERS);

                $ROW = $('<tr />');
                $ROW.append('<td class="text-center">' + user['인덱스'] + '</td>');
                $ROW.append('<td class="text-center">' + user['이름'] + '</td>');
                $ROW.append('<td class="text-center">' + user['소속'] + '</td>');
                $ROW.append('<td class="text-center">' + user['부서'] + '</td>');

                settings['게시판'] = settings['게시판'] || [];
                boards.forEach(function (board) {
                    $ROW.append('<td class="text-center bg-warning"><input type="checkbox" data-index="' + user['인덱스'] + '" data-board="' + board + '" ' + (settings['게시판'].some(function (ub) {
                        return ub === board;
                    }) ? '' : 'checked') + '/></td>');
                });
                $ROW.appendTo($BOARDS);

            });
            $USERS.find('input[type="checkbox"]').iCheck({
                checkboxClass: 'icheckbox_flat-orange',
                radioClass: 'iradio_flat-orange'
            }).bind('ifChecked ifUnchecked', function (event) {
                var index = $(this).data('index');
                var key = $(this).data('key');
                var user = users.find(function (user) {
                    return user['인덱스'] === index;
                });
                if (user) {
                    var userSetting = JSON.parse(user['설정'] || '{}');
                    userSetting[key] = event.type === 'ifChecked' ? 1 : 0;
                    user['설정'] = JSON.stringify(userSetting);
                    SaveUserSetting(user);
                }
            });
            $BOARDS.find('input[type="checkbox"]').iCheck({
                checkboxClass: 'icheckbox_flat-orange',
                radioClass: 'iradio_flat-orange'
            }).bind('ifChecked ifUnchecked', function (event) {
                var index = $(this).data('index');
                var board = $(this).data('board');
                var user = users.find(function (user) {
                    return user['인덱스'] === index;
                });
                if (user) {
                    var userSetting = JSON.parse(user['설정'] || '{}');
                    userSetting['게시판'] = userSetting['게시판'] || [];

                    index = userSetting['게시판'].indexOf(board);
                    if (index > -1) {
                        userSetting['게시판'].splice(index, 1);
                    } else {
                        userSetting['게시판'].push(board);
                    }
                    user['설정'] = JSON.stringify(userSetting);
                    SaveUserSetting(user);
                }
            });
            return step;
        }

        function _renderServiceUserSelect() {
            var users = _this.data.users;
            var $SELECT = _this.el.$SERVICE.$USERSELECT;

            var position = '';
            var $GROUP, $OPTION;
            $SELECT.append('<option value="">선택안함</option>');
            users.forEach(function (user) {
                if (user['지사코드'] === '0000') {
                    if (position !== user['부서']) {
                        $GROUP = $('<optgroup />').attr('label', user['부서']);
                        position = user['부서'];
                        $GROUP.appendTo($SELECT);
                    } else {
                        $('optgroup[label="' + user['부서'] + '"]').append(
                            '<option value="' + user['이름'] + '">' + user['이름'] + '</option>'
                        );
                    }
                }
            });
            $SELECT.selectpicker('refresh').bind('changed.bs.select', function (event) {
                var $THIS = $(this);
                var area = $THIS.data('area');
                var fixed = $THIS.data('fix') ? true : false;
                var rotat = $THIS.data('rotation') ? true : false;
                if (fixed) {
                    setting.service['담당자'][area]['고정'] = $THIS.selectpicker('val');
                } else if (rotat) {
                    setting.service['담당자'][area]['로테이션'] = $THIS.selectpicker('val');
                }
            });

            $SELECT.each(function (i, v) {
                var $THIS = $(v);
                var area = $THIS.data('area');
                var fixed = $THIS.data('fix') ? true : false;
                var rotat = $THIS.data('rotation') ? true : false;
                var value;
                if (fixed) {
                    value = setting.service['담당자'][area]['고정'];
                } else if (rotat) {
                    value = setting.service['담당자'][area]['로테이션']
                }
                if (value) {
                    $THIS.selectpicker('val', value);
                }
            })
            // $($SELECT[0]).selectpicker('val', setting.service['담당자']['본사']['고정']);
            // $($SELECT[]).selectpicker('val', setting.service['담당자']['본사']['고정']);
            // $($SELECT[0]).selectpicker('val', setting.service['담당자']['본사']['고정']);
            // $($SELECT[0]).selectpicker('val', setting.service['담당자']['본사']['고정']);
            // $($SELECT[0]).selectpicker('val', setting.service['담당자']['본사']['고정']);
            // $($SELECT[0]).selectpicker('val', setting.service['담당자']['본사']['고정']);

            return step;
        }

        function _renderManagers(data) {
            var salesmans = _this.data.users.filter(function (user) {
                return data.some(function (_user) {
                    return _user['USER_ID'] === user['인덱스'];
                });
            });

            salesmans.forEach(function (item) {
                console.log(item);
                _this.el.$SALESMANAGER.append(
                    '<option value="' + item['인덱스'] + '">' + item['이름'] + '</option>'
                )
            });
            _this.el.$SALESMANAGER.selectpicker('refresh');


            /*
            var salesmans = _this.data.users.filter(function (user) {
                return data.some(function (_user) {
                    return _user['USER_ID'] === user['인덱스'];
                });
            });
            var $SALESMANS = _this.el.$SALESMANS.empty();

            salesmans.forEach(function (user) {
                var settings = JSON.parse(user['설정'] || '{}');
                var $ROW = $('<tr />');
                $ROW.append('<td class="text-center">' + user['인덱스'] + '</td>');
                $ROW.append('<td class="text-center">' + user['아이디'] + '</td>');
                $ROW.append('<td class="text-center">' + user['비밀번호'] + '</td>');
                $ROW.append('<td class="text-center">' + user['이름'] + '</td>');
                $ROW.append('<td class="text-center">' + user['소속'] + '</td>');
                $ROW.append('<td class="text-center">' + user['부서'] + '</td>');
                $ROW.append('<td class="text-center bg-warning"><input type="number" class="form-control" data-key="관리수당" data-index="' + user['인덱스'] + '" value="' + (settings['관리수당'] || '') + '" /></td>');
                $ROW.append('<td class="text-center bg-warning"><input type="number" class="form-control" data-key="관리수당_연유지" data-index="' + user['인덱스'] + '" value="' + (settings['관리수당_연유지'] || '') + '" /></td>');
                $ROW.append('<td class="text-center bg-warning"><input type="number" class="form-control" data-key="판매수당" data-index="' + user['인덱스'] + '" value="' + (settings['판매수당'] || '') + '" /></td>');
                $ROW.append('<td class="text-center bg-warning"><input type="number" class="form-control" data-key="신규영업" data-index="' + user['인덱스'] + '" value="' + (settings['신규영업'] || '') + '" /></td>');
                $ROW.appendTo($SALESMANS);

            });

            $SALESMANS.find('input[type="number"]').bind('keyup', function (event) {
                if (!$.isNumeric($(this).val().trim())) {
                    return event.preventDefault();
                }
                var index = $(this).data('index');
                var key = $(this).data('key');
                var user = _this.data.users.find(function (user) {
                    return user['인덱스'] === index;
                });
                if (user) {
                    var userSetting = JSON.parse(user['설정'] || '{}');
                    userSetting[key] = $(this).val().trim();
                    user['설정'] = JSON.stringify(userSetting);
                    SaveUserSetting(user);
                }
            });
            */
            return step;
        }

        function _renderAreas(data) {
            data.forEach(function (item) {
                _this.el.$SALESAREAS.append(
                    '<option value="' + item['지사코드'] + '">' + item['지사명'] + '</option>'
                )
            });
            _this.el.$SALESAREAS.selectpicker('refresh');


            return step;
        }

        function SaveSetting(key) {
            setting.service['확인내용'] = $('#confirm-form').val()
            axios.post(API.ADMIN.GLOBAL, {
                setting: setting
            }).then(function (result) {
                swal('홈페이지 관리', '저장되었습니다.', 'success');
            }).catch(function (error) {
                fn.errorNotify(error);
            })
        }

        function SaveUserSetting(user) {
            axios.post(API.ADMIN.USER, user);
        }

        function SaveCustomerFee(fee, index) {
            if (!$.isNumeric(fee)) {
                new PNotify({
                    title: '관리수당',
                    text: '숫자를 입력해주세요.',
                    type: 'error'
                });
                return false;
            }

            axios.put(API.CUSTOMER.FEE, {
                id: index,
                fee: fee
            }).then(function (result) {
                new PNotify({
                    title: '관리수당',
                    text: '저장되었습니다.',
                    type: 'info'
                });
            }).catch(function (error) {
                fn.errorNotify(error);
            });
        }

        _this.data = {
            setting: setting,
            users: null
        };

        _this.fn = {
            Load: Load
        };

        _this.el = {
            $USERS: $('tbody#users'),
            $USERSEARCH: $('input#user-search'),
            $BOARDUSERS: $('tbody#boards'),
            $BOARDUSERSEARCH: $('input#board-user-search'),
            $SALESMANS: $('tbody#salesmans'),
            $SALESMANAGER: $('select#manager'),
            $SALESAREAS: $('select#area'),
            $SALESMANSEARCH: $('input#salesmans-search'),
            $SERVICE: {
                $USERSELECT: $('.select-users.service'),
                $HOLDMACRO: $('div.hold-macro'),
                $PROCESSTYPE: $('div.process-type'),
                $PROCESSREQUIRE: $('textarea.process-require'),
                $PROCESSEXAMPLE: $('textarea.process-example'),
                $PRIORITYS: $('table.priority-table')
            },
            $SAVE: $('.setting-save')
        };

        _this.el.$USERSEARCH.bind('keyup', function (event) {
            var keyword = $(this).val().trim();
            // var filterData = _this.data.users.filter(function (user) {
            //     return user['인덱스'] == keyword ||
            //         user['아이디'].indexOf(keyword) >= 0 ||
            //         user['이름'].indexOf(keyword) >= 0 ||
            //         user['소속'].replace(/(\s*)/g, '').indexOf(keyword) >= 0 ||
            //         user['부서'].indexOf(keyword) >= 0;
            // });
            // _renderUsers(filterData);
            _this.el.$USERS.find('tr').filter(function () {
                $(this).toggle($(this).text().indexOf(keyword) > -1);
            });
        });
        _this.el.$BOARDUSERSEARCH.bind('keyup', function (event) {
            var keyword = $(this).val().trim();
            _this.el.$BOARDUSERS.find('tr').filter(function () {
                $(this).toggle($(this).text().indexOf(keyword) > -1);
            });
            // _renderUsers(filterData);
        });

        _this.el.$SALESMANSEARCH.bind('keyup', function (event) {
            var keyword = $(this).val().trim();
            _this.el.$SALESMANS.find('tr').filter(function () {
                $(this).toggle($(this).text().indexOf(keyword) > -1);
            });
            // _renderUsers(filterData);
        });

        _this.el.$SALESMANAGER.bind('changed.bs.select', function (event) {
            // 여기서 거래처 리스트 로드
            _loadCustomer('manager', $(this).selectpicker('val'));
        });
        _this.el.$SALESAREAS.bind('changed.bs.select', function (event) {
            // 여기서 거래처 리스트 로드
            _loadCustomer('area', $(this).selectpicker('val'));
        });


        _this.el.$SAVE.bind('click', function () {
            var settingKey = $(this).data('setting');
            SaveSetting(settingKey);
        });

        return _instance;

    }


    exports.NeoAdmin = new Admin();

    NeoAdmin.fn.Load();
    // NeoAdmin.fn.Users();


})(window);
