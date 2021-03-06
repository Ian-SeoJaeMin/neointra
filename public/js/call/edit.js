(function (exports) {
    'use strict';

    var $CALLHOSPITAL = $('#call-hospital');
    var $CALLUNREG = $('#call-unreg');
    var $CALLUNREGHOSPITAL = $('#call-unreg-hospital');
    var $CALLDATE = $('.datepicker[data-name="care"]');
    // var $DATEMONTH = $('.datemonth');
    var $CALLSTATUS = $('input[name="call-status"]');
    var $CALLCOMMENT = $('#call-comment');
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
    }, function () {
        if ($CALLHOSPITAL.selectpicker('val').length) {
            LoadMisu($CALLHOSPITAL.selectpicker('val'))
        }
    });

    var data = {
        index: '',
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
        // chartAS: 0
        transferAS: 0
    };


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
                emptyTitle: '????????????, ???????????? ??????...'
            },
            preprocessData: function (data) {

                var hosps = [];
                data.forEach(function (hosp) {
                    // hosps[hosp['ID']] = hosp['????????????'];
                    hosps.push({
                        'value': hosp['ID'],
                        'text': hosp['????????????'] + '/' + hosp['????????????'] + (hosp['?????????'].trim().length > 0 ? '/' + hosp['?????????'] : ''),
                        'disabled': false
                    })
                });

                return hosps;
            },
            preserveSelected: false
        });

    $CALLDATE.datetimepicker({
        format: "YYYY-MM-DD, a hh:mm:ss",
        dayViewHeaderFormat: 'YYYY???MMMM',
        ignoreReadonly: true,
        showTodayButton: true,
        useCurrent: true,
        defaultDate: moment($CALLDATE.data('value')).format()
    });


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
            $CALLCATEGORY.selectpicker('val', 'AS??????')
        }
    })

    $CALLSAVE.bind('click', function (event) {
        CheckValidate()
            .then(function () {
                swal({
                    title: '???????????? ??????',
                    text: '???????????? ???????????? ?????????????????????????',
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
                    title: '???????????? ??????',
                    text: message,
                    type: 'error'
                });
            })

    });

    $CALLDELETE.bind('click', function () {
        swal({
            title: '???????????? ??????',
            text: '????????? ?????????????????????????',
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then(function () {
            Delete();
        }, function (dismiss) {
            console.log(dismiss);
        })


    })

    function CheckValidate() {
        return new Promise(function (resolve, reject) {

            data.index = $CALLSAVE.data('index');

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
                reject('????????? ??????????????? ??????????????????.')
            } else if (data.USER_ID === '-1' && data.hospital.trim() === '') {
                reject('????????? ??????????????? ??????????????????.');
            } else if (data.program === '') {
                $CALLPROGRAM.focus();
                reject('??????????????? ??????????????????.');
            } else if (data.category === '') {
                $CALLCATEGORY.focus();
                reject('??????????????? ??????????????????.');
            } else if (!data.question.length) {
                $CALLQUESTION.focus();
                reject('??????????????? ??????????????????.');
            } else {
                resolve();
            }

        });
    }

    function Save() {
        axios.put(API.CUSTOMER.CALLS, data)
            .then(function (result) {
                swal('???????????? ??????', '?????????????????????.', 'success')
                    .then(function () {
                        location.href = '/customer/call';
                    })
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })
    }

    function Delete() {
        axios.delete(API.CUSTOMER.CALLS, {
            data: {
                index: $CALLDELETE.data('index')
            }
        }).then(function (result) {
            swal('???????????? ??????', '?????????????????????.', 'success')
                .then(function () {
                    location.href = '/customer/call';
                })
        }).catch(function (error) {
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

                    if (data.info['????????????'].length) {
                        $('#closed_date').text('????????????(?????????????????? ??????): ' + data.info['????????????'])
                    } else {
                        $('#closed_date').empty()
                    }

                    // ???????????? & ???????????????
                    $el = $HOSPINFO.empty();
                    keys = Object.keys(data.info);
                    if (keys.length) {
                        html += '<ul class="list-unstyled user_data collapse in" id="_hospinfo" aria-expanded="true">';
                        keys.forEach(function (key) {
                            if (key === '?????????' && data.info[key].length) {
                                if (moment().diff(data.info[key], 'month') <= 3) {
                                    html += '<li><b>' + key + ':</b> ' + data.info[key] + ' <span class="label label-red-4">??????</span></li>';
                                }
                            } else if (key !== '?????????') {
                                html += '<li class="' + (key.match(/????????????|????????????|????????????/gim) ? 'red font-bold' : '') + '"><b>' + key + ':</b> ' + data.info[key] + '</li>';
                            }

                            if (key === '????????????') {
                                $CALLPROGRAM.selectpicker('val', data.info[key]);
                            }
                        });
                        html += '</ul>';
                    }
                    //???????????????
                    if (data.extra) {
                        html += '<div class="ln_solid"></div>';
                        html += '<h5 class="">';
                        html += '  ???????????????';
                        html += '</h5>';
                        html += '<ul class="list-unstyled user_data" id="_extra">';
                        data.extra.forEach(function (extra) {
                            html += '  <button type="button" class="btn btn-default btn-xs">' + extra['???????????????'] + '</button>';
                        });
                        html += '</ul>';
                    }
                    $el.append(html);

                    //????????????
                    html = '';
                    $el = $HOSPREMOTE.empty();
                    keys = Object.keys(data.uniq).filter(function (key) {
                        return key.match(/????????????|???????????????|????????????|??????????????????|??????????????????/gim);
                    });
                    if (keys.length) {
                        html += '<ul class="list-unstyled user_data collapse in" id="_seetrol" aria-expanded="true">';
                        keys.forEach(function (key) {
                            html += '<li class="red font-bold"><b>' + key + ':</b> ' + data.uniq[key] + '</li>';
                        });
                        html += '</ul>';
                    }
                    $el.append(html);

                    //????????????
                    html = '';
                    $el = $HOSPUNIQ.empty();
                    keys = Object.keys(data.uniq).filter(function (key) {
                        return !key.match(/????????????|???????????????|????????????|??????????????????|??????????????????/gim);
                    });
                    if (keys.length) {
                        html += '<ul class="list-unstyled user_data collapse in" id="_certificate" aria-expanded="true">';
                        keys.forEach(function (key) {
                            if (key === '??????') {
                                html += '<li class="font-bold bg-danger p-xs" style="color:#000;">  <b>' + key + ':</b><br>';
                                if (data.uniq[key] && data.uniq[key].length) {
                                    html += '  ' + data.uniq[key].replace(/\n/gim, '<br/>');
                                }
                                html += '<li>';
                                // html += '  <pre class="unstyled-pre">' + data.uniq[key] + '</pre>';
                                // html += exports.fn.urlify(data.uniq[key]);
                            } else if (key === '????????????') {
                                html += '<li><b>' + key + ':</b> <b class="{{????????????}}">' + data.uniq[key] + '</b></li>';

                                if (data.uniq[key] === '??????') {
                                    html = html.replace('{{????????????}}', 'blue');
                                } else if (data.uniq[key] === '??????') {
                                    html = html.replace('{{????????????}}', 'red');
                                } else {
                                    html = html.replace('{{????????????}}', '');
                                }
                            } else if (key !== '?????????' && key !== '????????????' && key !== '????????????ID') {
                                // html += '<b>' + key + ':</b> ' + data.uniq[key] + '<br/>';
                                html += '<li><b>' + key + ':</b> ' + data.uniq[key] + '</li>';
                            }
                        });
                        html += '<li><b>?????????:</b> ' + data.uniq['?????????'] + ' <b>?????????:</b> ' + data.uniq['????????????'] + '</li>';
                        html += '</ul>';
                    }
                    $el.append(html);

                    //????????????
                    html = '';
                    $el = $HOSPBACKUP.empty();
                    keys = Object.keys(data.backup);
                    if (keys.length) {
                        html += '<ul class="list-unstyled user_data collapse in" id="_database" aria-expanded="true">';
                        Object.keys(data.backup).forEach(function (key) {

                            if (!key.match(/S??????|S??????|S??????|M??????|M??????|M??????/gim) && data.backup[key]) {
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
                $TR += '    <TD>' + misu['??????'] + '</TD>';
                $TR += '    <TD>' + misu['?????????'] + '</TD>';
                $TR += '    <TD>' + misu['??????'] + '</TD>';
                $TR += '    <TD>' + misu['??????'] + '</TD>';
                $TR += '    <TD>' + misu['??????'] + '</TD>';
                $TR += '    <TD>' + misu['?????????'] + '</TD>';
                $TR += '    <TD class="blue">' + misu['?????????'] + '</TD>';
                $TR += '    <TD class="red">' + misu['????????????'] + '</TD>';
                $TR += '    <TD>' + misu['??????'] + '</TD>';
                $TR += '</TR>';
                return $TR;
            }
        }
    }

    if ($CALLHOSPITAL.selectpicker('val').length) {
        LoadHospInfo($CALLHOSPITAL.selectpicker('val'));
        LoadMisu($CALLHOSPITAL.selectpicker('val'));
    }

})(window);
