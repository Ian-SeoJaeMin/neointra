(function (exports) {
    'use strict';

    var $CALLHOSPITAL = $('#call-hospital');
    var $CALLUNREG = $('#call-unreg');
    var $CALLUNREGHOSPITAL = $('#call-unreg-hospital');
    var $CALLDATE = $('.datepicker[data-name="care"]');
    // var $DATEMONTH = $('.datemonth');
    var $CALLSTATUS = $('input[name="call-status"]');
    var $CALLSAVE = $('#call-save');
    var $CALLDELETE = $('#call-delete');
    var $CALLCATEGORY = $('#call-category');
    var $CALLPROGRAM = $('#call-program');
    // var $CALLCHARTAS = $('#call-chart-as');
    var $CALLTRANSFER = $('#call-transfer-member');

    var $CALLQUESTION = $('#call-question');
    var $CALLTREAT = $('#call-treat');
    var $CALLETC = $('#call-etc');

    var $HOSPINFO = $('.x_content#info'),
        $HOSPREMOTE = $('.x_content#remote'),
        $HOSPBACKUP = $('.x_content#backup'),
        $HOSPUNIQ = $('.x_content#uniq'),
        $LIST_MISU = $('tbody.list-misu');

    var MisuDatePicker = new myDatePicker('.datepicker.misu');
    MisuDatePicker.fn.init({
        start: moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        end: moment().endOf('month').format('YYYY-MM-DD')
    }, LoadMisu);

    var data = {
        USER_ID: '',
        hospital: '',
        date: '',
        status: '',
        comment: '',
        program: '',
        category: '',
        question: '',
        treat: '',
        etc: '',
        // chartAS: 0,
        transferAS: 0,
        writer: params.user['인덱스']
    };

    // $CALLCOMMENT.val('Q. 문의내용\n\nA. 처리내용\n\nE.기타\n\n');


    $CALLHOSPITAL.selectpicker({
        liveSearch: true,
        size: 10
    })
        .ajaxSelectPicker({
            ajax: {
                url: API.CUSTOMER.LIST,
                method: 'GET',
                dataType: 'json',
                data: function () {
                    var params = {
                        search: '{{{q}}}'
                    };
                    // debugger;
                    // if (gModel.selectedGroup().hasOwnProperty('ContactGroupID')) {
                    //     params.GroupID = gModel.selectedGroup().ContactGroupID;
                    // }
                    return params;
                }
            },
            locale: {
                emptyTitle: '병원코드, 명칭으로 검색...'
            },
            preprocessData: function (data) {

                var hosps = [];
                data.forEach(function (hosp) {
                    // hosps[hosp['ID']] = hosp['기관명칭'];
                    hosps.push({
                        'value': hosp['ID'] + '|' + hosp['기관코드'],
                        'text': hosp['기관명칭'] + '/' + hosp['담당지사'] + (hosp['담당자'].trim().length > 0 ? '/' + hosp['담당자'] : ''),
                        'disabled': false
                    })
                });

                return hosps;
            },
            preserveSelected: false
        });

    $CALLDATE.datetimepicker({
        format: "YYYY-MM-DD, a hh:mm:ss",
        dayViewHeaderFormat: 'YYYY년MMMM',
        ignoreReadonly: true,
        showTodayButton: true,
        useCurrent: true,
        defaultDate: moment().format()
    });

    // setInterval(function () {
    //     $CALLDATE.data('DateTimePicker').date(moment().format("YYYY년 MMMM Do, a hh:mm:ss"));
    // }, 1000);

    $CALLHOSPITAL.bind('changed.bs.select', function (event) {
        // data.USER_ID = $(this).selectpicker('val');
        if ($(this).selectpicker('val').length) {
            LoadHospInfo($(this).selectpicker('val'));
            LoadMisu($(this).selectpicker('val'));
        }
    });


    $CALLUNREG.bind('ifChecked ifUnchecked', function (event) {
        $CALLUNREGHOSPITAL.toggleClass('hidden');
        if (event.type === 'ifChecked') {
            $CALLHOSPITAL.selectpicker('hide');
            // data.USER_ID = '-1';
        } else {
            $CALLHOSPITAL.selectpicker('show');
            // data.USER_ID = '';
        }
    });

    $CALLPROGRAM.bind('changed.bs.select', function (event) {
        if ($(this).selectpicker('val') === 'NeoAS') {
            $CALLCATEGORY.selectpicker('val', 'AS접수')
        }
    })

    // $CALLDATE.bind('dp.change', function (event) {
    //     $CALLDATE.data('value', event.date.format('YYYY-MM-DD'));
    //     // data.date = $CALLDATE.data('value');

    // });

    $CALLSAVE.bind('click', function (event) {
        CheckValidate()
            .then(function () {
                swal({
                    title: '상담일지 등록',
                    text: '입력하신 내용으로 저장하시겠습니까?',
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33'
                }).then(function () {
                    Save();
                }, function (dismiss) {
                    console.log(dismiss);
                })

            })
            .catch(function (message) {
                new PNotify({
                    title: '입력내용 오류',
                    text: message,
                    type: 'error'
                });
            })

    });


    function CheckValidate() {
        return new Promise(function (resolve, reject) {

            if ($CALLUNREG.is(':checked')) {
                data.USER_ID = '-1';
                data.hospital = $CALLUNREGHOSPITAL.val().trim();
            } else {
                data.USER_ID = $CALLHOSPITAL.selectpicker('val');
                data.hospital = '';
                data.USER_ID = data.USER_ID.split('|')[0];
            }

            data.date = $CALLDATE.data('DateTimePicker').date().format('YYYY-MM-DD HH:mm:ss')
            data.status = $CALLSTATUS.filter(':checked').val();
            // data.comment = $CALLCOMMENT.val().trim();
            data.question = $CALLQUESTION.val().trim();
            data.treat = $CALLTREAT.val().trim();
            data.etc = $CALLETC.val().trim();
            data.program = $CALLPROGRAM.selectpicker('val');
            data.category = $CALLCATEGORY.selectpicker('val');
            // data.chartAS = $CALLCHARTAS.is(':checked') ? 1 : 0;
            data.transferAS = $CALLTRANSFER.selectpicker('val');

            if (data.USER_ID === '') {
                reject('상담한 기관이름을 입력해주세요.')
            } else if (data.USER_ID === '-1' && data.hospital.trim() === '') {
                reject('상담한 기관이름을 입력해주세요.');
            } else if (data.program === '') {
                $CALLPROGRAM.focus();
                reject('프로그램을 선택해주세요.');
            } else if (data.category === '') {
                $CALLCATEGORY.focus();
                reject('카테고리를 선택해주세요.');
            } else if (!data.question.length) {
                $CALLQUESTION.focus();
                reject('문의내용을 입력해주세요.');
            } else {
                resolve();
            }

        });
    }

    function Save() {
        axios.post(API.CUSTOMER.CALLS, data)
            .then(function (result) {
                swal('상담일지 등록', '저장되었습니다.', 'success')
                    .then(function () {
                        location.href = '/customer/call';
                    })
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })
    }

    function LoadHospInfo(params) {
        var user_id = params.split('|')[0];
        var hospnum = params.split('|')[1];

        axios.get(API.CUSTOMER.DETAIL, {
            params: {
                id: user_id,
                hospnum: hospnum
            }
        }).then(function (result) {
            _renderHospInfo(result.data);
        }).catch(function (error) {
            fn.errorNotify(error);
        });

        function _renderHospInfo(data) {
            return new Promise(function (resolve, reject) {
                try {

                    var $el;
                    var html = '';
                    var keys = [];

                    if (data.info['잠금일자'].length) {
                        $('#closed_date').text('폐업일자(청구잠금일자 기준): ' + data.info['잠금일자'])
                    } else {
                        $('#closed_date').empty()
                    }

                    // 병원정보 & 부가서비스
                    $el = $HOSPINFO.empty();
                    keys = Object.keys(data.info);
                    if (keys.length) {
                        html += '<ul class="list-unstyled user_data collapse in" id="_hospinfo" aria-expanded="true">';
                        keys.forEach(function (key) {
                            if (key === '계약일' && data.info[key].length) {
                                if (moment().diff(data.info[key], 'month') <= 3) {
                                    html += '<li><b>' + key + ':</b> ' + data.info[key] + ' <span class="label label-red-4">신규</span></li>';
                                }
                            } else if (key !== '인덱스') {
                                html += '<li class="' + (key.match(/기관명칭|프로그램|전화번호/gim) ? 'red font-bold' : '') + '"><b>' + key + ':</b> ' + data.info[key] + '</li>';
                            }

                            if (key === '프로그램') {
                                $CALLPROGRAM.selectpicker('val', data.info[key]);
                            }

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
                        // data.extra.forEach(function (extra) {
                        if (data.extra != ""){
                            html += '  <button type="button" class="btn btn-default btn-xs">' + data.extra + '</button>';
                        }
                        if (data.pacs != ""){
                            html += '  <button type="button" class="btn btn-default outline-info btn-xs">' + data.pacs + '</button>';
                        }
                        if (data.out != ""){
                            html += '  <button type="button" class="btn btn-default outline-warning btn-xs">' + data.out + '</button>';
                        }
                        // });
                        html += '</ul>';
                    }
                    $el.append(html);

                    //원격정보
                    html = '';
                    $el = $HOSPREMOTE.empty();
                    keys = Object.keys(data.uniq).filter(function (key) {
                        return key.match(/원격서버|원격아이디|원격비번|스탠바이이름|스탠바이비번/gim);
                    });
                    if (keys.length) {
                        html += '<ul class="list-unstyled user_data collapse in" id="_seetrol" aria-expanded="true">';
                        keys.forEach(function (key) {
                            html += '<li class="red font-bold"><b>' + key + ':</b> ' + data.uniq[key] + '</li>';
                        });
                        html += '</ul>';
                    }
                    $el.append(html);

                    //특이사항
                    html = '';
                    $el = $HOSPUNIQ.empty();
                    keys = Object.keys(data.uniq).filter(function (key) {
                        return !key.match(/원격서버|원격아이디|원격비번|스탠바이이름|스탠바이비번/gim);
                    });
                    if (keys.length) {
                        html += '<ul class="list-unstyled user_data collapse in" id="_certificate" aria-expanded="true">';
                        keys.forEach(function (key) {
                            if (key === '메모') {
                                html += '<li class="font-bold bg-danger p-xs" style="color:#000;">  <b>' + key + ':</b><br>';
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
                            } else if (key !== '수정자' && key !== '수정일자' && key !== '병원유형ID') {
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
                    $el = $HOSPBACKUP.empty();
                    keys = Object.keys(data.backup);
                    if (keys.length) {
                        html += '<ul class="list-unstyled user_data collapse in" id="_database" aria-expanded="true">';
                        Object.keys(data.backup).forEach(function (key) {

                            if (!key.match(/S수가|S약가|S재료|M수가|M약가|M재료/gim) && data.backup[key]) {
                                html += '<li><b>' + key + ':</b> ' + data.backup[key] + '</li>';
                            }
                        })
                    }
                    $el.append(html);

                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        }
    }

    function LoadMisu(params) {

        if (!params) {
            return false;
        }

        var user_id = params.split('|')[0];
        var hospnum = params.split('|')[1];
        axios.get(API.CUSTOMER.MISU, {
            params: {
                id: user_id,
                startDate: MisuDatePicker.value.start,
                endDate: MisuDatePicker.value.end
            }
        }).then(function (result) {
            _RenderMisu(result.data);
        }).catch(function (error) {
            fn.errorNotify(error);
        });

        function _RenderMisu(misus) {
            //console.log(misus);
            $LIST_MISU.empty();

            misus.forEach(function (misu) {
                $LIST_MISU.append(_newItem(misu));
            });

            function _newItem(misu) {
                var $TR = '';
                $TR += '<TR class="animate fadeIn">';
                $TR += '    <TD>' + misu['날짜'] + '</TD>';
                $TR += '    <TD>' + misu['구분명'] + '</TD>';
                $TR += '    <TD>' + misu['명칭'] + '</TD>';
                $TR += '    <TD>' + misu['수량'] + '</TD>';
                $TR += '    <TD>' + misu['단가'] + '</TD>';
                $TR += '    <TD>' + misu['총금액'] + '</TD>';
                $TR += '    <TD class="blue">' + misu['입금액'] + '</TD>';
                $TR += '    <TD class="red">' + misu['미수총액'] + '</TD>';
                $TR += '    <TD>' + misu['메모'] + '</TD>';
                $TR += '</TR>';
                return $TR;
            }
        }
    }

    $(document).ready(function () {
        $('[data-id="call-hospital"]').trigger('click').find('input').focus();;
    });


})(window);