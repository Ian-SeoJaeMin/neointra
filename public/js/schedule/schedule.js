(function (exports) {

    'use strict';

    var $DATEMOVE = $('.datemove');
    var $TITLE = $('.schedule-title');
    var $MODE = $(':input[name="mode"]');
    var $BODY = $('table').find('#body');

    var schedules = null;

    var mode = "month";
    var viewDate = moment().format('YYYY-MM-DD');

    $MODE.bind('change', function (event) {
        mode = $(this).val();
        ChangeView();
    });

    $DATEMOVE.bind('click', function (event) {
        MoveDate($(this).data('move'));
    });

    $BODY.bind('click', function (event) {
        var $THIS;
        if (event.target.tagName === 'DIV') {
            $THIS = $(event.target);
        } else if (event.target.tagName === 'SPAN') {
            if ($(event.target).parent()[0].tagName === 'DIV') {
                $THIS = $(event.target).parent();
            }
        }
        if ($THIS && $THIS.length) {
            if ($THIS.hasClass('schedule-event')) {
                location.href = '/customer/visit/view?index=' + $THIS.data('index');
            }
        }
    })

    function MoveDate(move) {
        switch (mode) {
            case 'month':
                if (move === 'next') {
                    viewDate = moment(viewDate).add(1, 'M').format('YYYY-MM-DD');
                } else {
                    viewDate = moment(viewDate).subtract(1, 'M').format('YYYY-MM-DD');
                }
                break;
            case 'week':
                if (move === 'next') {
                    viewDate = moment(viewDate).add(1, 'w').format('YYYY-MM-DD');
                } else {
                    viewDate = moment(viewDate).subtract(1, 'w').format('YYYY-MM-DD');
                }
                break;
            case 'day':
                if (move === 'next') {
                    viewDate = moment(viewDate).add(1, 'd').format('YYYY-MM-DD');
                } else {
                    viewDate = moment(viewDate).subtract(1, 'd').format('YYYY-MM-DD');
                }
                break;
        }
        ChangeView();
    }

    function ChangeView() {

        Clear();

        var $HEADER = $('table').find('thead');

        $HEADER.find('tr.' + mode).removeClass('hidden').siblings().addClass('hidden');
        $BODY.attr('class', 'schedule-body-' + mode);

        switch (mode) {
            case 'month':
                $TITLE.text(moment(viewDate).format('YYYY년 MM월'));

                var thisStartDay = moment(viewDate).startOf('month').format('d');
                var startDate = moment(viewDate).startOf('month').subtract(thisStartDay, 'd').format('YYYY-MM-DD');
                var dateCount = 1;
                var weekCount = 0;
                var cellClasss = 'schedule-cell';

                var $ROW, $CELL;

                while (dateCount < 42) {


                    if (weekCount === 0) {
                        $ROW = $('<tr/>');
                    }

                    cellClasss = 'schedule-cell';

                    if (moment(viewDate).format('MM') < moment(startDate).format('MM')) {
                        cellClasss += ' schedule-next-date';
                    } else if (moment(viewDate).format('MM') > moment(startDate).format('MM')) {
                        cellClasss += ' schedule-old-date';
                    } else {
                        cellClasss += ' schedule-this-date';
                    }

                    if (moment().format('YYYY-MM-DD') === moment(startDate).format('YYYY-MM-DD')) {
                        cellClasss += ' schedule-today';
                    }

                    $ROW.append('<td class="schedule-cell ' + cellClasss + '" data-date="' + moment(startDate).format('YYYY-MM-DD') + '"><span class="date">' + moment(startDate).format('D') + '</span></td>');

                    if (weekCount === 6) {
                        $BODY.append($ROW);
                    }

                    startDate = moment(startDate).add(1, 'd').format('YYYY-MM-DD');

                    weekCount += 1;
                    if (weekCount === 7) weekCount = 0;

                    dateCount += 1;

                }


                break;
            case 'week':
                $TITLE.text(moment(viewDate).startOf('week').format('MM월 DD일') + '-' + moment(viewDate).endOf('week').format('MM월 DD일, YYYY년'));

                var startDate = moment(viewDate).startOf('week').format('YYYY-MM-DD');

                var dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
                dayOfWeek.forEach(function (day, index) {
                    var $TH = $HEADER.find('tr.' + mode).find('th:eq(' + (index + 1) + ')');
                    $TH.text(day + '(' + moment(startDate).format('MM/DD') + ')');
                    $TH.attr('data-date', startDate);
                    startDate = moment(startDate).add(1, 'd').format('YYYY-MM-DD');
                })

                break;
            case 'day':
                $TITLE.text(moment(viewDate).format('LL dddd'));

                var startTime = 6;
                $HEADER.find('tr.' + mode).find('th').each(function (index, element) {
                    if (index > 0) {
                        if (index % 2 === 0) {
                            $(element).attr('data-time', (startTime < 10 ? '0' : '') + startTime + ':30');
                            startTime += 1;
                        } else {
                            $(element).attr('data-time', (startTime < 10 ? '0' : '') + startTime + ':00');
                        }
                    }
                })

                break;
        }

        Load();
    }

    function Load() {

        var date = (function () {
            switch (mode) {
                case 'month':
                    return {
                        month: moment(viewDate).format('YYYY-MM')
                    }
                case 'week':
                    return {
                        start: moment(viewDate).startOf('week').format('YYYY-MM-DD'),
                        end: moment(viewDate).endOf('week').format('YYYY-MM-DD')
                    }
                case 'day': {
                    return {
                        start: viewDate,
                        end: viewDate
                    }
                }
            }
        })();

        axios.get(API.SCHEDULE, {
            params: {
                date: date
            }
        })
            .then(function (result) {
                schedules = result.data;
                Render();
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })
    }

    function Clear() {
        $BODY.empty();
    }

    function Render() {

        // Clear();
        try {

            schedules = schedules.sort(function (a, b) {
                return a['방문유형'] > b['방문유형'] ? -1 : (a['방문유형'] < b['방문유형'] ? 1 : 0);
            })

            var cellCount = $('table').find('#header>tr.' + mode).find('th').length;

            if (mode === 'month') {

                schedules.forEach(function (event) {
                    var eventType = 'visit-type-';
                    var eventDate = moment(event['시작']).format('YYYY-MM-DD');
                    var eventTime = {
                        start: moment(event['시작']).format('a hh:mm'),
                        end: moment(event['종료']).format('a hh:mm')
                    };

                    switch (event['방문유형']) {
                        case CONSTS.VISITTYPE.REGULAR:
                            eventType += 'regular';
                            break;
                        case CONSTS.VISITTYPE.REQUEST:
                            eventType += 'request';
                            break;
                        case CONSTS.VISITTYPE.EMERGENCY:
                            eventType += 'emergency';
                            break;
                        case CONSTS.VISITTYPE.SALES:
                            eventType += 'sales';
                            break;
                        case CONSTS.VISITTYPE.ETC:
                            eventType += 'etc';
                            break;
                        case CONSTS.VISITTYPE.OFFICE:
                            eventType += 'office';
                            break;
                        case CONSTS.VISITTYPE.WATCH:
                            eventType += 'watch';
                            break;
                        case CONSTS.VISITTYPE.OPEN:
                            eventType += 'open';
                            break;
                    }

                    var $CELL = $('#body').find('[data-date="' + eventDate + '"]');
                    $CELL.find('span.date').after(
                        '<div class="schedule-event ' + eventType + '" data-index="' + event['인덱스'] + '">' +
                        '   <span class="pull-right">' +
                        (event['법인차'].trim().length > 0 ? '<i class="fa fa-' + (event['법인차'] === '대중교통' ? 'subway' : 'car') + '"></i> ' + event['법인차'] : '') +
                        '   </span>' +
                        '   <span>(' + event['유형'] + ') ' +
                        event['작성자명'] + '<br>' + eventTime.start + ' - ' + eventTime.end +

                        '   </span>' +
                        '</div>'
                    );

                })

            } else if (mode === 'week' || mode === 'day') {

                var writers = schedules.map(function (event) {
                    return event['작성자']
                }).filter(function (writer, index, self) {
                    return index == self.indexOf(writer);
                }).sort(function (a, b) {
                    return a - b;
                }).map(function (writer) {
                    return schedules.find(function (event) {
                        return event['작성자'] == writer;
                    })
                }).map(function (writer) {
                    return {
                        id: writer['작성자'],
                        name: writer['작성자명']
                    }
                })

                var $ROW = (function () {
                    var $TR = $('<tr />');
                    var _td;

                    for (var i = 0; i < cellCount; i++) {
                        if (i === 0) {
                            $TR.append('<th class="schedule-cell"></th>');
                        } else {
                            $TR.append('<td class="schedule-cell"></td>');
                        }
                    }

                    return $TR;
                })();

                writers.forEach(function (writer) {
                    var $TR = $ROW.clone();
                    $TR.find('th').text(writer['name']).attr('data-writer', writer['id']);
                    $TR.appendTo($BODY);
                });

                schedules.forEach(function (event) {

                    var $HEADER = $('table').find('tr.' + mode);
                    var $ROW = $BODY.find('th[data-writer="' + event['작성자'] + '"]').closest('tr');
                    var indexOfCell = (function () {
                        if (mode === 'week') {
                            return $HEADER.find('th[data-date="' + moment(event['시작']).format('YYYY-MM-DD') + '"]').index();
                        } else {
                            return $HEADER.find('th[data-time="' + moment(event['시작']).format('HH:mm') + '"]').index();
                        }
                    })();
                    indexOfCell = indexOfCell - 1; // 이름 표기 셀 빼주기
                    var $TARGET = $ROW.find('td').eq(indexOfCell);


                    var span = 0;
                    switch (mode) {
                        case 'week':
                            break;
                        case 'day':

                            span = $HEADER.find('th[data-time="' + moment(event['종료']).format('HH:mm') + '"]').index() - indexOfCell - 1;

                            break;
                    }
                    if (span > 0) {
                        $TARGET.attr('colspan', span);

                        for (var i = $TARGET.index(); i < $TARGET.index() + span - 1; i++) {
                            $ROW.find('td').eq(i).addClass('hidden');
                        }

                    }



                    var eventType = 'visit-type-';
                    var eventTime = {
                        start: moment(event['시작']).format('a hh:mm'),
                        end: moment(event['종료']).format('a hh:mm')
                    };

                    switch (event['방문유형']) {
                        case CONSTS.VISITTYPE.REGULAR:
                            eventType += 'regular';
                            break;
                        case CONSTS.VISITTYPE.REQUEST:
                            eventType += 'request';
                            break;
                        case CONSTS.VISITTYPE.EMERGENCY:
                            eventType += 'emergency';
                            break;
                        case CONSTS.VISITTYPE.SALES:
                            eventType += 'sales';
                            break;
                        case CONSTS.VISITTYPE.ETC:
                            eventType += 'etc';
                            break;
                        case CONSTS.VISITTYPE.OFFICE:
                            eventType += 'office';
                            break;
                        case CONSTS.VISITTYPE.WATCH:
                            eventType += 'watch';
                            break;
                        case CONSTS.VISITTYPE.OPEN:
                            eventType += 'open';
                            break;
                    }
                    $TARGET.append(
                        '<div class="schedule-event ellipsis ' + eventType + '" data-index="' + event['인덱스'] + '">' +
                        '   <span class="pull-right">' +
                        (event['법인차'].trim().length > 0 ? '<i class="fa fa-car"></i> ' + event['법인차'] : '') +
                        '   </span>' +
                        '   <span>' +
                        '       (' + event['유형'] + ')' + event['기관명칭'] +
                        '       <br>' +
                        '       <small>' + eventTime.start + ' - ' + eventTime.end + '</small>' +
                        '   </span>' +
                        '</div>'
                    );

                })

            }
        } catch (e) {
            console.log(e);
        }


    }

    ChangeView();

})(window);