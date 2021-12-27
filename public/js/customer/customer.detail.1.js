(function (exports) {

    'use strict';

    var $DATEPICKER = $('.datepicker');
    var $DATEPICKER_MISU = $DATEPICKER.filter('[data-name="misu"]');
    var $DATEPICKER_CARE = $DATEPICKER.filter('[data-name="care"]');
    var $DATEMONTH_MISU = $('.datemonth.misu');
    var $DATEMONTH_CARE = $('.datemonth.care');
    var $CALENDAR_VISIT = $('#calendar-visit');
    var $CALENDAR_CALL = $('#calendar-call');
    var $TABS_CARE = $('.care-tabs');

    var $LIST_MISU = $('tbody.list-misu');

    var hospital = params.hospital;
    var oVisits, pVisits, oCalls, pCalls;

    $DATEPICKER.datetimepicker({
        format: 'YYYY년MM월'
    });

    $DATEMONTH_MISU.bind('click', function (event) {
        var $THIS = $(this);
        var currentMonth = $DATEPICKER_MISU.data('value');
        if ($THIS.data('range') === 'left') {
            $DATEPICKER_MISU.data('value', moment(currentMonth).subtract(1, 'month').startOf('month').format('YYYY-MM-DD'));
            $DATEPICKER_MISU.val(moment(currentMonth).subtract(1, 'month').startOf('month').format('YYYY년MM월'));
        } else {
            $DATEPICKER_MISU.data('value', moment(currentMonth).add(1, 'month').startOf('month').format('YYYY-MM-DD'));
            $DATEPICKER_MISU.val(moment(currentMonth).add(1, 'month').startOf('month').format('YYYY년MM월'));
        }
        LoadMisu();
    });

    $DATEMONTH_CARE.bind('click', function (event) {
        var $THIS = $(this);
        var currentMonth = $DATEPICKER_CARE.data('value');
        if ($THIS.data('range') === 'left') {
            $DATEPICKER_CARE.data('value', moment(currentMonth).subtract(1, 'month').startOf('month').format('YYYY-MM-DD'));
            $DATEPICKER_CARE.val(moment(currentMonth).subtract(1, 'month').startOf('month').format('YYYY년MM월'));
        } else {
            $DATEPICKER_CARE.data('value', moment(currentMonth).add(1, 'month').startOf('month').format('YYYY-MM-DD'));
            $DATEPICKER_CARE.val(moment(currentMonth).add(1, 'month').startOf('month').format('YYYY년MM월'));
        }
        $CALENDAR_VISIT.fullCalendar('gotoDate', $DATEPICKER_CARE.data('value'));
        $CALENDAR_CALL.fullCalendar('gotoDate', $DATEPICKER_CARE.data('value'));
    });

    $DATEPICKER_CARE.bind('dp.change', function (event) {
        $DATEPICKER_CARE.data('value', event.date.startOf('month').format('YYYY-MM-DD'));
        $CALENDAR_VISIT.fullCalendar('gotoDate', event.date.startOf('month').format('YYYY-MM-DD'));
        $CALENDAR_CALL.fullCalendar('gotoDate', $DATEPICKER_CARE.data('value'));
    });

    $CALENDAR_VISIT.fullCalendar({
        // titleFormat: 'YYYY년 MM월',        
        header: false,
        defaultView: 'listMonth',
        displayEventTime: false,
        selectable: true,
        selectHelper: true,
        editable: false,
        dayClick: function (date, jsEvent, view, resourceObj) {
            console.log(date, jsEvent, view, resourceObj);
        },
        eventClick: function (calEvent, jsEvent, view) {
            console.log(calEvent, jsEvent, view);
            // RenderEventDetail(calEvent.oData);
        },
        viewRender: function (view, element) {

        },
        eventRender: function (event, element) {

        },
        events: function (start, end, timezone, callback) {
            axios.get(API.CUSTOMER.VISITS, {
                params: {
                    start: start.format('YYYY-MM-DD'),
                    end: end.format('YYYY-MM-DD'),
                    hospid: hospital['인덱스']
                }
            })
                .then(function (events) {
                    oVisits = events.data;
                    pVisits = [];
                    var color = {
                        backgroundColor: function (type) {
                            switch (type) {
                                case CONSTS.VISITTYPE.REGULAR: return '#7CB77E';
                                case CONSTS.VISITTYPE.REQUEST: return '#3A87AD';
                                case CONSTS.VISITTYPE.EMERGENCY: return '#E47675';
                                case CONSTS.VISITTYPE.SALES: return '#8E74C8';
                                case CONSTS.VISITTYPE.ETC: return '#7F7F7F';
                            }
                        }
                    }
                    oVisits.forEach(function (element, index) {
                        pVisits.push({
                            title: element['방문'] + ':' + element['기관명칭'] + (element['USER_ID'] == -1 ? ' [미등록]' : '') + ' ' + element['작성자명'],
                            start: element['시작'],
                            end: element['종료'],
                            backgroundColor: color.backgroundColor(element['USER_ID'] == -1 ? CONSTS.VISITTYPE.ETC : element['방문유형']),
                            borderColor: color.backgroundColor(element['USER_ID'] == -1 ? CONSTS.VISITTYPE.ETC : element['방문유형']),
                            oData: element
                        });
                    })
                    callback(pVisits);
                })
                .catch(function (error) {
                    fn.errorNotify(error);
                })
        }
    });

    $CALENDAR_CALL.fullCalendar({
        // titleFormat: 'YYYY년 MM월',        
        header: false,
        defaultView: 'listMonth',
        displayEventTime: false,
        selectable: true,
        selectHelper: true,
        editable: false,
        dayClick: function (date, jsEvent, view, resourceObj) {
            console.log(date, jsEvent, view, resourceObj);
        },
        eventClick: function (calEvent, jsEvent, view) {
            console.log(calEvent, jsEvent, view);
            // RenderEventDetail(calEvent.oData);
        },
        viewRender: function (view, element) {

        },
        eventRender: function (event, element) {
            
            element.find('.fc-list-item-title').html(element.find('.fc-list-item-title').text());

        },
        events: function (start, end, timezone, callback) {
            axios.get(API.CUSTOMER.CALLS, {
                params: {
                    start: start.format('YYYY-MM-DD'),
                    end: end.format('YYYY-MM-DD'),
                    hospid: hospital['인덱스']
                }
            })
                .then(function (events) {
                    oCalls = events.data;
                    console.log(oCalls);
                    pCalls = [];

                    oCalls.forEach(function (element, index) {
                        pCalls.push({
                            title: moment(element['작성일자']).format('LLLL') + (element['상태'] === 0 ? ' <span class="red">미완료</span>' : ''),
                            start: element['처리일자'],
                            end: element['처리일자'],
                            oData: element
                        });
                    })
                    callback(pCalls);
                })
                .catch(function (error) {
                    console.log(error);
                    fn.errorNotify(error);
                })
        }
    });

    $TABS_CARE.find('a').bind('shown.bs.tab', function (event) {
        var $TARGET = $(event.target)
        if ($TARGET.text() === '방문일지') {
            $CALENDAR_VISIT.fullCalendar('render');
        } else if ($TARGET.text() === '상담일지') {
            $CALENDAR_CALL.fullCalendar('render');
        }
    })


    function LoadMisu() {
        axios.get(API.CUSTOMER.MISU, {
            params: {
                id: hospital['인덱스'],
                startDate: moment($DATEPICKER_MISU.data('value')).startOf('month').format('YYYY-MM-DD'),
                endDate: moment($DATEPICKER_MISU.data('value')).endOf('month').format('YYYY-MM-DD')
            }
        })
            .then(function (result) {
                RenderMisu(result.data);
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })
    }

    function RenderMisu(misus) {
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

    LoadMisu();


})(window);