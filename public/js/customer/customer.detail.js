(function (exports) {

    'use strict';

    var $DATEPICKER = $('.datepicker');
    var $DATEPICKER_MISU = $DATEPICKER.filter('[data-name="misu"]');
    var $DATEPICKER_CARE = $DATEPICKER.filter('[data-name="care"]');
    var $DATEMONTH_MISU = $('.datemonth.misu');
    var $DATEMONTH_CARE = $('.datemonth.care');
    var $CALENDAR_VISIT = $('#calendar-visit');
    var $CALENDAR_CALL = $('#calendar-call');
    var $CALENDAR_SERVICE = $('#calendar-service');
    var $CALENDAR_SERVICE_UNDONE = $('#calendar-service-undone');
    var $TABS_CARE = $('.care-tabs');
    var $REMOTEFORM = $('form#remote');
    var $SPECIFICFORM = $('form#specific');

    var $LIST_MISU = $('tbody.list-misu');

    var hospital = params.hospital;
    var oVisits, pVisits, oCalls, oServices;

    var MisuDatePicker = new myDatePicker('.datepicker.misu');
    MisuDatePicker.fn.init({
        start: moment().subtract(4, 'months').startOf('month').format('YYYY-MM-DD'),
        end: moment().endOf('month').format('YYYY-MM-DD')
    }, LoadMisu);

    var CareDatePicker = new myDatePicker('.datepicker.care');
    CareDatePicker.fn.init({
        start: moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        end: moment().endOf('month').format('YYYY-MM-DD')
    }, function () {
        $CALENDAR_VISIT.fullCalendar('gotoDate', CareDatePicker.value.start);
        // $CALENDAR_VISIT.fullCalendar('gotoDate', $DATEPICKER_CARE.data('value'));
        LoadVisits();
        LoadCalls();
        LoadServices();
    });

    // $DATEPICKER.datetimepicker({
    //     format: 'YYYY년MM월'
    // });

    // $DATEMONTH_MISU.bind('click', function (event) {
    //     var $THIS = $(this);
    //     var currentMonth = $DATEPICKER_MISU.data('value');
    //     if ($THIS.data('range') === 'left') {
    //         $DATEPICKER_MISU.data('value', moment(currentMonth).subtract(1, 'month').startOf('month').format('YYYY-MM-DD'));
    //         $DATEPICKER_MISU.val(moment(currentMonth).subtract(1, 'month').startOf('month').format('YYYY년MM월'));
    //     } else {
    //         $DATEPICKER_MISU.data('value', moment(currentMonth).add(1, 'month').startOf('month').format('YYYY-MM-DD'));
    //         $DATEPICKER_MISU.val(moment(currentMonth).add(1, 'month').startOf('month').format('YYYY년MM월'));
    //     }
    //     LoadMisu();
    // });


    $TABS_CARE.find('a').bind('shown.bs.tab', function (event) {
        var $TARGET = $(event.target)
        if ($TARGET.text() === '방문일지') {
            $CALENDAR_VISIT.fullCalendar('render');
        } else if ($TARGET.text() === '상담일지') {
            // $CALENDAR_CALL.fullCalendar('render');
            LoadVisits();
            LoadCalls();
        } else {
            LoadServices();
        }
    })

    // $DATEMONTH_CARE.bind('click', function (event) {
    //     var $THIS = $(this);
    //     var currentMonth = $DATEPICKER_CARE.data('value');
    //     if ($THIS.data('range') === 'left') {
    //         $DATEPICKER_CARE.data('value', moment(currentMonth).subtract(1, 'month').startOf('month').format('YYYY-MM-DD'));
    //         $DATEPICKER_CARE.val(moment(currentMonth).subtract(1, 'month').startOf('month').format('YYYY년MM월'));
    //     } else {
    //         $DATEPICKER_CARE.data('value', moment(currentMonth).add(1, 'month').startOf('month').format('YYYY-MM-DD'));
    //         $DATEPICKER_CARE.val(moment(currentMonth).add(1, 'month').startOf('month').format('YYYY년MM월'));
    //     }
    //     $CALENDAR_VISIT.fullCalendar('gotoDate', $DATEPICKER_CARE.data('value'));
    //     LoadCalls();
    //     LoadServices();
    //     // $CALENDAR_CALL.fullCalendar('gotoDate', $DATEPICKER_CARE.data('value'));
    // });

    // $DATEPICKER_CARE.bind('dp.change', function (event) {
    //     $DATEPICKER_CARE.data('value', event.date.startOf('month').format('YYYY-MM-DD'));
    //     $CALENDAR_VISIT.fullCalendar('gotoDate', event.date.startOf('month').format('YYYY-MM-DD'));
    //     // $CALENDAR_CALL.fullCalendar('gotoDate', $DATEPICKER_CARE.data('value'));
    //     LoadCalls();
    //     LoadServices();
    // });

    $REMOTEFORM.bind('submit', function (event) {
        event.preventDefault();
        var formData = $REMOTEFORM.serializeArray();
        formData.push({
            name: 'user_id',
            value: params.hospital['인덱스']
        });

        var keys = formData.map(function (item) {
            return item.name;
        });
        var _params = {};
        keys.forEach(function (key) {
            _params[key] = formData.find(function (item) {
                return item.name === key;
            }).value;
        });
        _params['user'] = params.user;

        axios.post(API.CUSTOMER.REMOTE, _params)
            .then(function (result) {
                location.reload();
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })
    });

    $SPECIFICFORM.bind('submit', function (event) {
        event.preventDefault();
        var formData = $SPECIFICFORM.serializeArray();
        formData.push({
            name: 'user_id',
            value: params.hospital['인덱스']
        });
        formData.push({
            name: 'hospnum',
            value: params.hospital['기관기호']
        });

        var keys = formData.map(function (item) {
            return item.name;
        });
        var _params = {};
        keys.forEach(function (key) {
            _params[key] = formData.find(function (item) {
                return item.name === key;
            }).value;
        });
        _params['user'] = params.user;

        axios.post(API.CUSTOMER.SPECIFIC, _params)
            .then(function (result) {
                location.reload();
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })
    });

    if (!$('textarea[name="specific-memo2"]').val().length) {
        $('textarea[name="specific-memo2"]').val(
            '1. 서버PC정보(SQL경로, 서버PC 비밀번호, 서버PC 특이사항 등)\n\n' +
            '   서버경로  : \n' +
            '   SQL 비번 : \n' +
            '   메인데이타명 : \n' +
            '   서버비밀번호: \n\n' +
            '2. 병원특이사항(컨버전정보, DB분리 등)\n\n' +
            '3. AS처리 특이사항(병원데이터문제, 청구문제, 처방코드문제 등)\n\n' +
            '4. 해당병원만 사용중인기능 및 처리방법\n\n' +
            '5. 연동 및 HW특이사항\n'
        )
    }


    // $CALENDAR_VISIT.fullCalendar({
    //     // titleFormat: 'YYYY년 MM월',
    //     header: false,
    //     defaultView: 'listMonth',
    //     displayEventTime: false,
    //     selectable: true,
    //     selectHelper: true,
    //     editable: false,
    //     dayClick: function (date, jsEvent, view, resourceObj) {
    //         console.log(date, jsEvent, view, resourceObj);
    //     },
    //     eventClick: function (calEvent, jsEvent, view) {
    //         console.log(calEvent, jsEvent, view);
    //         // RenderEventDetail(calEvent.oData);
    //     },
    //     viewRender: function (view, element) {

    //     },
    //     eventRender: function (event, element) {

    //     },
    //     events: function (start, end, timezone, callback) {
    //         axios.get(API.CUSTOMER.VISITS, {
    //             params: {
    //                 date: {
    //                     start: start.format('YYYY-MM-DD'),
    //                     end: CareDatePicker.value.end// end.format('YYYY-MM-DD'),
    //                 },
    //                 hospid: hospital['인덱스']
    //             }
    //         })
    //             .then(function (events) {
    //                 oVisits = events.data;
    //                 pVisits = [];
    //                 var color = {
    //                     backgroundColor: function (type) {
    //                         switch (type) {
    //                             case CONSTS.VISITTYPE.REGULAR: return '#7CB77E';
    //                             case CONSTS.VISITTYPE.REQUEST: return '#3A87AD';
    //                             case CONSTS.VISITTYPE.EMERGENCY: return '#E47675';
    //                             case CONSTS.VISITTYPE.SALES: return '#8E74C8';
    //                             case CONSTS.VISITTYPE.ETC: return '#7F7F7F';
    //                             case CONSTS.VISITTYPE.OPEN: return '#2ABEC4';
    //                         }
    //                     }
    //                 }
    //                 oVisits.forEach(function (element, index) {
    //                     pVisits.push({
    //                         title: element['유형'] + ':' + element['기관명칭'] + (element['USER_ID'] == -1 ? ' [미등록]' : '') + ' ' + element['작성자명'],
    //                         start: element['시작'],
    //                         end: element['종료'],
    //                         backgroundColor: color.backgroundColor(element['USER_ID'] == -1 ? CONSTS.VISITTYPE.ETC : element['방문유형']),
    //                         borderColor: color.backgroundColor(element['USER_ID'] == -1 ? CONSTS.VISITTYPE.ETC : element['방문유형']),
    //                         oData: element
    //                     });
    //                 })
    //                 callback(pVisits);
    //             })
    //             .catch(function (error) {
    //                 fn.errorNotify(error);
    //             })
    //     }
    // });

    function LoadVisits() {

        axios.get(API.CUSTOMER.VISITS, {
            params: {
                date: {
                    start: CareDatePicker.value.start, //moment(callDate).startOf('month').format('YYYY-MM-DD'),
                    end: CareDatePicker.value.end, //moment(callDate).endOf('month').format('YYYY-MM-DD'),
                },
                hospid: hospital['인덱스']
            }
        })
            .then(function (events) {
                oVisits = events.data;

                _RenderVisits();
            })
            .catch(function (error) {
                console.log(error);
                fn.errorNotify(error);
            })

        function _RenderVisits() {

            $CALENDAR_VISIT.empty();
            var count = 0;
            // var dates = _getDates();

            var $LISTS = '';

            var color = {
                backgroundColor: function (type) {
                    switch (type) {
                        case CONSTS.VISITTYPE.REGULAR:
                            return '#7CB77E';
                        case CONSTS.VISITTYPE.REQUEST:
                            return '#3A87AD';
                        case CONSTS.VISITTYPE.EMERGENCY:
                            return '#E47675';
                        case CONSTS.VISITTYPE.SALES:
                            return '#8E74C8';
                        case CONSTS.VISITTYPE.ETC:
                            return '#7F7F7F';
                        case CONSTS.VISITTYPE.OPEN:
                            return '#2ABEC4';
                    }
                }
            }

            $LISTS += '<div class="panel list-group care-list-group">';
            // dates.forEach(function (date) {
            //     $LISTS += ' <a class="list-group-item care-list-header" data-toggle="collapse" href="#visit-' + date + '" aria-expanded="false" aria-controls="visit-' + date + '" data-parent="#calendar-visit">';
            //     $LISTS += moment(date).format('LL dddd') + ' <span class="badge">{{COUNT}}</span>';
            //     $LISTS += '</a>';
            $LISTS += ' <div id="visit-list" class="sublinks care-list-item-header">';
            //     // $LISTS += '     <div class="list-group-item">' +
            //     count = 0;
            oVisits.forEach(function (visit) {
                // if (moment(visit['방문일자']).format('YYYY-MM-DD') === date) {
                count += 1;
                // $LISTS += '     <a class="list-group-item" href="/customer/visit/view?index=' + visit['인덱스'] + '">';
                // $LISTS += '             ' + visit['작성자명'] + ' ' + visit['작성일자'] + (visit['상태'] === 1 ? ' <span class="red"><b>미완료</b></span>' : '');
                // $LISTS += '     </a>';
                // $LISTS += '     <div class="list-group-item">';
                // $LISTS += '         <a data-toggle="collapse" href="#call-detail-' + call['인덱스'] + '" aria-expanded="false" aria-controls="#call-detail-' + call['인덱스'] + '" data-parent="#call-' + date + '">';
                // $LISTS += '             ' + call['작성자명'] + ' ' + call['작성일자'] + (call['상태'] === 1 ? ' <span class="red"><b>미완료</b></span>' : '');
                // $LISTS += '         </a>';
                // $LISTS += '         <div id="call-detail-' + call['인덱스'] + '" class="collapse" aria-expanded="false"><div class="divider-dashed"></div>' + call['내용'].replace(/\n/gim, '<br>') + '</div>';
                // $LISTS += '     </div>';
                // visits.forEach(function (visit, index) {
                // var tpdkt = template_desktop;
                // var $MOBILEROW = '';
                var visitType = (function () {
                    var visitType = '<span class="badge visit-type-{{VISITTYPE}}">' + visit['유형'] + '</span>';
                    switch (visit['방문유형']) {
                        case CONSTS.VISITTYPE.REGULAR:
                            return visitType.replace('{{VISITTYPE}}', 'regular');
                        case CONSTS.VISITTYPE.REQUEST:
                            return visitType.replace('{{VISITTYPE}}', 'request');
                        case CONSTS.VISITTYPE.EMERGENCY:
                            return visitType.replace('{{VISITTYPE}}', 'emergency');
                        case CONSTS.VISITTYPE.SALES:
                            return visitType.replace('{{VISITTYPE}}', 'sales');
                        case CONSTS.VISITTYPE.ETC:
                            return visitType.replace('{{VISITTYPE}}', 'etc');
                        case CONSTS.VISITTYPE.OFFICE:
                            return visitType.replace('{{VISITTYPE}}', 'office');
                        case CONSTS.VISITTYPE.WATCH:
                            return visitType.replace('{{VISITTYPE}}', 'watch');
                        case CONSTS.VISITTYPE.OPEN:
                            return visitType.replace('{{VISITTYPE}}', 'open');
                    }
                })();
                var visitStatus = (function () {
                    if (visit['방문유형'] === CONSTS.VISITTYPE.OFFICE || visit['방문유형'] === CONSTS.VISITTYPE.WATCH) {
                        return '';
                    } else if (visit['실시작'] === '' || visit['실종료'] === '') {
                        return '<b class="red">미방문</b>';
                    } else {
                        return '<b class="blue">방문</b>';
                    }
                })();
                var visitHosp = (function () {
                    if (visit['방문유형'] === CONSTS.VISITTYPE.OFFICE || visit['방문유형'] === CONSTS.VISITTYPE.WATCH) {
                        return '';
                    } else {
                        return visit['기관명칭'] + (visit['USER_ID'] < 0 ? ' <span class="badge">미등록</span>' : '');
                    }
                })();
                var visitCar = (function () {
                    if (visit['방문유형'] === CONSTS.VISITTYPE.OFFICE || visit['방문유형'] === CONSTS.VISITTYPE.WATCH) {
                        return '';
                    } else if (visit['법인차'].trim() === "") {
                        return '미사용';
                    } else {
                        return visit['법인차'].trim();
                    }
                })();

                $LISTS += '<a class="list-group-item ellipsis" href="/customer/visit/view?index=' + visit['인덱스'] + '">';

                $LISTS += '    ' + visitType + ' <b>' + visitStatus + ' / <i class="fa fa-car"></i>' + visitCar + ' / ' + visitHosp + '</b>';
                $LISTS += '    <br>';
                $LISTS += '    <b class="dark"><span class="green">예정일: </span>' + visit['시작'] + ' - ' + visit['종료'] + '</b>';
                $LISTS += '    <br>';
                $LISTS += '    <b class="dark"><span class="green">방문일: </span>' + visit['실시작'] + ' - ' + visit['실종료'] + '</b>';
                $LISTS += '    <br>';
                $LISTS += '    <b class="dark"><span class="green">방문자: </span>' + visit['작성자명'];
                $LISTS += '</a>';



                // $VISITLIST_DESKTOP.append(tpdkt);
                // $VISITLIST_MOBILE.append($MOBILEROW);
                // });
                // }
            })
            $LISTS += ' </div>';
            //     $LISTS = $LISTS.replace('{{COUNT}}', count);
            // })
            //
            $LISTS += '</div>';

            $CALENDAR_VISIT.append($LISTS);


            function _getDates() {
                var dates = oVisits.map(function (element) {
                    return moment(element['방문일자']).format('YYYY-MM-DD');
                });

                var uniq = dates.filter(function (item, pos) {
                    return dates.indexOf(item) == pos;
                });

                return uniq.sort(function (a, b) {
                    return a > b ? -1 : (a < b ? 1 : 0);
                });
            }

        }
    }


    function LoadCalls() {

        var callDate = $DATEPICKER_CARE.data('value');

        axios.get(API.CUSTOMER.CALLS, {
            params: {
                date: {
                    start: CareDatePicker.value.start, //moment(callDate).startOf('month').format('YYYY-MM-DD'),
                    end: CareDatePicker.value.end, //moment(callDate).endOf('month').format('YYYY-MM-DD'),
                },
                hospid: hospital['인덱스']
            }
        })
            .then(function (events) {
                oCalls = events.data;

                _RenderCalls();
            })
            .catch(function (error) {
                console.log(error);
                fn.errorNotify(error);
            })

        function _RenderCalls() {

            $CALENDAR_CALL.empty();
            var count = 0;
            var dates = _getDates();

            var $LISTS = '';

            $LISTS += '<div class="panel list-group care-list-group">';
            dates.forEach(function (date) {
                $LISTS += ' <a class="list-group-item care-list-header" data-toggle="collapse" href="#call-' + date + '" aria-expanded="false" aria-controls="call-' + date + '" data-parent="#calendar-call">';
                $LISTS += moment(date).format('LL dddd') + ' <span class="badge">{{COUNT}}</span>';
                $LISTS += '</a>';
                $LISTS += ' <div id="call-' + date + '" class="sublinks care-list-item-header collapse" aria-expanded="false">';
                // $LISTS += '     <div class="list-group-item">' +
                count = 0;
                oCalls.forEach(function (call) {
                    if (moment(call['처리일자']).format('YYYY-MM-DD') === date) {
                        count += 1;
                        $LISTS += '     <a class="list-group-item" href="/customer/call/view?index=' + call['인덱스'] + '">';
                        $LISTS += '             ' + call['작성자명'] + ' ' + call['작성일자'] + (call['상태'] === 1 ? ' <span class="red"><b>미완료</b></span>' : '');
                        $LISTS += '     </a>';
                        // $LISTS += '     <div class="list-group-item">';
                        // $LISTS += '         <a data-toggle="collapse" href="#call-detail-' + call['인덱스'] + '" aria-expanded="false" aria-controls="#call-detail-' + call['인덱스'] + '" data-parent="#call-' + date + '">';
                        // $LISTS += '             ' + call['작성자명'] + ' ' + call['작성일자'] + (call['상태'] === 1 ? ' <span class="red"><b>미완료</b></span>' : '');
                        // $LISTS += '         </a>';
                        // $LISTS += '         <div id="call-detail-' + call['인덱스'] + '" class="collapse" aria-expanded="false"><div class="divider-dashed"></div>' + call['내용'].replace(/\n/gim, '<br>') + '</div>';
                        // $LISTS += '     </div>';
                    }
                })
                $LISTS += ' </div>';
                $LISTS = $LISTS.replace('{{COUNT}}', count);
            })
            //
            $LISTS += '</div>';

            $CALENDAR_CALL.append($LISTS);


            function _getDates() {
                var dates = oCalls.map(function (element) {
                    return moment(element['처리일자']).format('YYYY-MM-DD');
                });

                var uniq = dates.filter(function (item, pos) {
                    return dates.indexOf(item) == pos;
                });

                return uniq.sort(function (a, b) {
                    return a > b ? -1 : (a < b ? 1 : 0);
                });
            }

        }
    }

    function LoadServices() {

        var serviceDate = $DATEPICKER_CARE.data('value');

        axios.get(API.CUSTOMER.SERVICES, {
            params: {
                date: {
                    start: CareDatePicker.value.start, //moment(serviceDate).startOf('month').format('YYYY-MM-DD'),
                    end: CareDatePicker.value.end, //moment(serviceDate).endOf('month').format('YYYY-MM-DD'),
                },
                hospnum: hospital['기관기호']
            }
        })
            .then(function (result) {
                oServices = result.data;
                _RenderServices();
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })

        function _RenderServices() {

            $CALENDAR_SERVICE.empty();
            $CALENDAR_SERVICE_UNDONE.empty();
            var count = 0;
            var dates = _getDates();
            var backgroundColor = '';
            var $LISTS = '';

            $LISTS += '<div class="panel list-group care-list-group">';
            dates.forEach(function (date) {
                $LISTS += ' <a class="list-group-item care-list-header" data-toggle="collapse" href="#service-' + date + '" aria-expanded="false" aria-controls="service-' + date + '" data-parent="#calendar-service">';
                $LISTS += moment(date).format('LL dddd') + ' <span class="badge">{{COUNT}}</span>';
                $LISTS += '</a>';
                $LISTS += ' <div id="service-' + date + '" class="sublinks care-list-item-header collapse" aria-expanded="false">';
                // $LISTS += '     <div class="list-group-item">' +
                count = 0;
                oServices.forEach(function (service) {

                    switch (service['상태']) {
                        case CONSTS.SERVICE_STATUS.HOLD:
                            backgroundColor = 'bg-dark';
                            break;
                        case CONSTS.SERVICE_STATUS.SHARE:
                            backgroundColor = 'bg-warning';
                            break;
                        case CONSTS.SERVICE_STATUS.PROCESS:
                            backgroundColor = 'bg-success';
                            break;
                        case CONSTS.SERVICE_STATUS.DONE:
                        case CONSTS.SERVICE_STATUS.FEEDBACK:
                            backgroundColor = 'bg-info';
                    }

                    if (service['접수일자'] === date) {
                        count += 1;
                        $LISTS += '     <div class="list-group-item ' + backgroundColor + '">';
                        $LISTS += '         <a data-toggle="collapse" href="#service-detail-' + service['인덱스'] + '" aria-expanded="false" aria-controls="#service-detail-' + service['인덱스'] + '" data-parent="#service-' + date + '">';
                        $LISTS += '             #' + service['인덱스'] + ' ' + service['접수자'] + ' ' + service['접수일자'] + ' ';
                        // $LISTS += '             ' + service['공유자'] + '/' + service['처리자'] + '/' + service['완료자'] + '/' + service['보류자'];
                        $LISTS += '                 <span class="font-bold ' + (service['상태'] === CONSTS.SERVICE_STATUS.CANCEL ? 'red' : (service['상태'] === CONSTS.SERVICE_STATUS.DONE || service['상태'] === CONSTS.SERVICE_STATUS.FEEDBACK ? 'blue' : 'dark')) + '">' + service['상태명'] + '</span>';
                        $LISTS += '                 / <span class="font-bold ' + (service['타입'] === 1 ? 'orange' : 'green') + '">' + (service['타입'] === 1 ? '장애' : '사용법') + '</span>'
                        $LISTS += '         </a>';
                        $LISTS += '         <div id="service-detail-' + service['인덱스'] + '" class="collapse service-details p-md" aria-expanded="false">';


                        $LISTS += '<div>';

                        if (service['상태'] >= CONSTS.SERVICE_STATUS.ACCEPT) {
                            $LISTS += ' <b>접수자:</b> ' + service['접수자'];
                            $LISTS += ' <b>연락처:</b> ' + service['연락처'] + (service['내선번호'] ? '(내선: ' + service['내선번호'] + ')' : '');
                            $LISTS += ' <b>접수일:</b> <span class="red">' + moment(service['접수일자']).format('LLL') + '(' + moment(service['접수일자']).fromNow() + ')</span>';
                        }

                        if (service['확인자'] !== 0) {
                            $LISTS += '<br>';
                            $LISTS += ' <b>확인자:</b> <b class="blue">' + service['확인자명'] + '</b>';
                            $LISTS += ' <b>확인일:</b><span class="red">' + moment(service['확인일자']).format('LLL') + '</span>';
                        }

                        if (service['상태'] >= CONSTS.SERVICE_STATUS.SHARE && service['공유자'] !== 0) {
                            $LISTS += '<br>';
                            $LISTS += ' <b>공유자:</b> <b class="blue">' + (service['공유자'] !== 0 ? service['공유자명'] : Data.Service.info['담당'] || '') + '</b>';
                            $LISTS += ' <b>공유일:</b><span class="red">' + (service['공유자'] !== 0 ? moment(service['공유일자']).format('LLL') : '15분 자동공유') + '(' + moment(service['공유일자']).fromNow() + ')</span>';
                        }

                        if (service['상태'] >= CONSTS.SERVICE_STATUS.PROCESS && service['처리자'] !== 0) {
                            $LISTS += '<br>';
                            $LISTS += ' <b>처리자:</b> <b class="blue">' + service['처리자명'] + '</b>';
                            $LISTS += ' <b>처리일:</b><span class="red">' + moment(service['처리일자']).format('LLL') + '(' + moment(service['처리일자']).fromNow() + ')</span>';
                        }

                        if (service['상태'] >= CONSTS.SERVICE_STATUS.HOLD && service['보류자'] !== 0) {
                            $LISTS += '<br>';
                            $LISTS += ' <b>보류자:</b> <b class="blue">' + service['보류자명'] + '</b>';
                            $LISTS += ' <b>보류일:</b><span class="red">' + moment(service['보류일자']).format('LLL') + '(' + moment(service['보류일자']).fromNow() + ')</span>';
                        }

                        if (service['상태'] >= CONSTS.SERVICE_STATUS.DONE && service['완료자'] !== 0) {
                            $LISTS += '<br>';
                            $LISTS += ' <b>완료자:</b> <b class="blue">' + service['완료자명'] + '</b>';
                            $LISTS += ' <b>완료일:</b><span class="red">' + moment(service['완료일자']).format('LLL') + '(' + moment(service['완료일자']).fromNow() + ')</span>';
                        }

                        if (service['상태'] >= CONSTS.SERVICE_STATUS.FEEDBACK && service['피드백자'] !== 0) {
                            $LISTS += '<br>';
                            $LISTS += ' <b>피드백자:</b> <b class="blue">' + service['피드백자명'] + '</b>';
                            $LISTS += ' <b>피드백일:</b><span class="red">' + moment(service['피드백일자']).format('LLL') + '(' + moment(service['피드백일자']).fromNow() + ')</span>';
                        }

                        $LISTS += '</div>';

                        $LISTS += '             <div class="divider-dashed"></div><small><b><i class="fa fa-circle"></i> 문의내용</b></small><br>' + service['문의내용'].replace(/\n/gim, '<br>');
                        if (service['전달내용'].trim() !== '') {
                            $LISTS += '             <br><small><b><i class="fa fa-circle"></i> 전달내용</b></small><br>' + service['전달내용'].replace(/\n/gim, '<br>');
                        }
                        if (service['확인내용'].trim() !== '') {
                            $LISTS += '             <br><small><b><i class="fa fa-circle"></i> 확인내용</b></small><br>' + service['확인내용'].replace(/\n/gim, '<br>');
                        }
                        if (service['처리내용'].trim() !== '') {
                            $LISTS += '             <br><small><b><i class="fa fa-circle"></i> 처리내용</b></small><br>' + service['처리내용'].replace(/\n/gim, '<br>');
                        }
                        if (service['보류내용'].trim() !== '') {
                            $LISTS += '             <br><small><b><i class="fa fa-circle"></i> 보류내용</b></small><br>' + service['보류내용'].replace(/\n/gim, '<br>');
                        }
                        $LISTS += '         </div>';
                        $LISTS += '     </div>';
                    }
                })
                $LISTS += ' </div>';
                $LISTS = $LISTS.replace('{{COUNT}}', count);
            })
            //
            $LISTS += '</div>';

            $CALENDAR_SERVICE.append($LISTS);

            $LISTS = '';
            oServices = oServices.sort(function (a, b) {
                return (a['접수일자'] > b['접수일자']) ? -1 : ((a['접수일자'] < b['접수일자']) ? 1 : 0)
            });
            oServices.forEach(function (service) {
                switch (service['상태']) {
                    case CONSTS.SERVICE_STATUS.HOLD:
                        backgroundColor = 'bg-dark';
                        break;
                    case CONSTS.SERVICE_STATUS.SHARE:
                        backgroundColor = 'bg-warning';
                        break;
                    case CONSTS.SERVICE_STATUS.PROCESS:
                        backgroundColor = 'bg-success';
                        break;
                    case CONSTS.SERVICE_STATUS.DONE:
                    case CONSTS.SERVICE_STATUS.FEEDBACK:
                        backgroundColor = 'bg-info';
                }

                if (service['상태'] < CONSTS.SERVICE_STATUS.DONE) {
                    $LISTS += '     <div class="list-group-item ' + backgroundColor + '">';
                    $LISTS += '         <a data-toggle="collapse" href="#service-detail-undone-' + service['인덱스'] + '" aria-expanded="false" aria-controls="#service-detail-undone-' + service['인덱스'] + '">';
                    $LISTS += '             ' + service['접수일자'] + ' #' + service['인덱스'] + ' ' + service['접수자'];
                    // $LISTS += '             ' + service['공유자'] + '/' + service['처리자'] + '/' + service['완료자'] + '/' + service['보류자'];
                    $LISTS += '                 <span class="font-bold ' + (service['상태'] === CONSTS.SERVICE_STATUS.CANCEL ? 'red' : (service['상태'] === CONSTS.SERVICE_STATUS.DONE || service['상태'] === CONSTS.SERVICE_STATUS.FEEDBACK ? 'blue' : 'dark')) + '">' + service['상태명'] + '</span>';
                    $LISTS += '                 / <span class="font-bold ' + (service['타입'] === 1 ? 'orange' : 'green') + '">' + (service['타입'] === 1 ? '장애' : '사용법') + '</span>'
                    $LISTS += '         </a>';
                    $LISTS += '         <div id="service-detail-undone-' + service['인덱스'] + '" class="collapse service-details-undone- p-md" aria-expanded="false">';


                    $LISTS += '<div>';

                    if (service['상태'] >= CONSTS.SERVICE_STATUS.ACCEPT) {
                        $LISTS += ' <b>접수자:</b> ' + service['접수자'];
                        $LISTS += ' <b>연락처:</b> ' + service['연락처'] + (service['내선번호'] ? '(내선: ' + service['내선번호'] + ')' : '');
                        $LISTS += ' <b>접수일:</b> <span class="red">' + moment(service['접수일자']).format('LLL') + '(' + moment(service['접수일자']).fromNow() + ')</span>';
                    }

                    if (service['확인자'] !== 0) {
                        $LISTS += '<br>';
                        $LISTS += ' <b>확인자:</b> <b class="blue">' + service['확인자명'] + '</b>';
                        $LISTS += ' <b>확인일:</b><span class="red">' + moment(service['확인일자']).format('LLL') + '</span>';
                    }

                    if (service['상태'] >= CONSTS.SERVICE_STATUS.SHARE && service['공유자'] !== 0) {
                        $LISTS += '<br>';
                        $LISTS += ' <b>공유자:</b> <b class="blue">' + (service['공유자'] !== 0 ? service['공유자명'] : Data.Service.info['담당'] || '') + '</b>';
                        $LISTS += ' <b>공유일:</b><span class="red">' + (service['공유자'] !== 0 ? moment(service['공유일자']).format('LLL') : '15분 자동공유') + '(' + moment(service['공유일자']).fromNow() + ')</span>';
                    }

                    if (service['상태'] >= CONSTS.SERVICE_STATUS.PROCESS && service['처리자'] !== 0) {
                        $LISTS += '<br>';
                        $LISTS += ' <b>처리자:</b> <b class="blue">' + service['처리자명'] + '</b>';
                        $LISTS += ' <b>처리일:</b><span class="red">' + moment(service['처리일자']).format('LLL') + '(' + moment(service['처리일자']).fromNow() + ')</span>';
                    }

                    if (service['상태'] >= CONSTS.SERVICE_STATUS.HOLD && service['보류자'] !== 0) {
                        $LISTS += '<br>';
                        $LISTS += ' <b>보류자:</b> <b class="blue">' + service['보류자명'] + '</b>';
                        $LISTS += ' <b>보류일:</b><span class="red">' + moment(service['보류일자']).format('LLL') + '(' + moment(service['보류일자']).fromNow() + ')</span>';
                    }

                    if (service['상태'] >= CONSTS.SERVICE_STATUS.DONE && service['완료자'] !== 0) {
                        $LISTS += '<br>';
                        $LISTS += ' <b>완료자:</b> <b class="blue">' + service['완료자명'] + '</b>';
                        $LISTS += ' <b>완료일:</b><span class="red">' + moment(service['완료일자']).format('LLL') + '(' + moment(service['완료일자']).fromNow() + ')</span>';
                    }

                    if (service['상태'] >= CONSTS.SERVICE_STATUS.FEEDBACK && service['피드백자'] !== 0) {
                        $LISTS += '<br>';
                        $LISTS += ' <b>피드백자:</b> <b class="blue">' + service['피드백자명'] + '</b>';
                        $LISTS += ' <b>피드백일:</b><span class="red">' + moment(service['피드백일자']).format('LLL') + '(' + moment(service['피드백일자']).fromNow() + ')</span>';
                    }

                    $LISTS += '</div>';

                    $LISTS += '             <div class="divider-dashed"></div><small><b><i class="fa fa-circle"></i> 문의내용</b></small><br>' + service['문의내용'].replace(/\n/gim, '<br>');
                    if (service['전달내용'].trim() !== '') {
                        $LISTS += '             <br><small><b><i class="fa fa-circle"></i> 전달내용</b></small><br>' + service['전달내용'].replace(/\n/gim, '<br>');
                    }
                    if (service['확인내용'].trim() !== '') {
                        $LISTS += '             <br><small><b><i class="fa fa-circle"></i> 확인내용</b></small><br>' + service['확인내용'].replace(/\n/gim, '<br>');
                    }
                    if (service['처리내용'].trim() !== '') {
                        $LISTS += '             <br><small><b><i class="fa fa-circle"></i> 처리내용</b></small><br>' + service['처리내용'].replace(/\n/gim, '<br>');
                    }
                    if (service['보류내용'].trim() !== '') {
                        $LISTS += '             <br><small><b><i class="fa fa-circle"></i> 보류내용</b></small><br>' + service['보류내용'].replace(/\n/gim, '<br>');
                    }
                    $LISTS += '         </div>';
                    $LISTS += '     </div>';
                }


            });
            $CALENDAR_SERVICE_UNDONE.append($LISTS);


            function _getDates() {
                var dates = oServices.map(function (element) {
                    return element['접수일자'];
                });

                var uniq = dates.filter(function (item, pos) {
                    return dates.indexOf(item) == pos;
                });

                return uniq.sort(function (a, b) {
                    return (a > b) ? -1 : ((a < b) ? 1 : 0)
                });
            }

        }
    }

    function LoadMisu() {
        axios.get(API.CUSTOMER.MISU, {
            params: {
                id: hospital['인덱스'],
                startDate: MisuDatePicker.value.start, //moment($DATEPICKER_MISU.data('value')).startOf('month').format('YYYY-MM-DD'),
                endDate: MisuDatePicker.value.end //moment($DATEPICKER_MISU.data('value')).endOf('month').format('YYYY-MM-DD')
            }
        })
            .then(function (result) {
                _RenderMisu(result.data);
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })

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

    LoadVisits();
    LoadCalls();
    LoadMisu();


})(window);
