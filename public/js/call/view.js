(function (exports) {
    'use strict';

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

    function LoadHospInfo() {
        var user_id = params.user_id;
        var hospnum = params.hospnum;

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

                    // 병원정보 & 부가서비스
                    $el = $HOSPINFO.empty();
                    keys = Object.keys(data.info);
                    if (keys.length) {
                        html += '<ul class="list-unstyled user_data collapse in" id="_hospinfo" aria-expanded="true">';
                        keys.forEach(function (key) {
                            if (key === '계약일' && data.info[key].length) {
                                if (moment().diff(data.info[key], 'month') <= 3) {
                                    html += '<li class="' + (key.match(/기관명칭|프로그램|전화번호/gim) ? 'red font-bold' : '') + '"><b>' + key + ':</b> ' + data.info[key] + ' <span class="label label-red-4">신규</span></li>';
                                }
                            } else if (key !== '인덱스') {
                                html += '<li><b>' + key + ':</b> ' + data.info[key] + '</li>';
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
                        data.extra.forEach(function (extra) {
                            html += '  <button type="button" class="btn btn-default btn-xs">' + extra['부가서비스'] + '</button>';
                        });
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
                            if (key === '메모' || key === '메모2') {
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

    function LoadMisu() {
        var user_id = params.user_id;
        var hospnum = params.hospnum;
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

    $(document).ready(function (event) {
        LoadHospInfo();
        LoadMisu();
    })


})(window);