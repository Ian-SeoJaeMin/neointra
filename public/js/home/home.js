(function (exports) {

    var $ARTICLES = $('.board-article-list');
    var $CALENDAR = $('#calendar');
    var $CALENDAR_DETAIL = $('#calendar-detail');

    var event_color = $.extend({}, CONSTS.CALENDAR_EVENT_COLOR.SCHEDULES);
    var event_id = $.extend({}, CONSTS.CALENDAR_EVENT_ID.SCHEDULES);
    var event_name = $.extend({}, CONSTS.CALENDAR_EVENT_NAME.SCHEDULES);

    var schedules = null;
    var event_object = {
        title: '',
        start: null,
        end: null,
        borderColor: '',
        backgroundColor: '',
        textColor: '',
        oData: null
    };

    $CALENDAR.fullCalendar({
        titleFormat: 'YYYY년 MM월',
        customButtons: (function () {

            var eventLabels = {};
            Object.keys(event_name).forEach(function (key) {
                eventLabels[event_name[key]] = {
                    text: event_name[key]
                };
            });

            return eventLabels;
        })(),
        header: {
            left: 'prev,next,today,month,listMonth',
            center: 'title',
            right: Object.values(event_name).join(',')
        },
        defaultView: $(window).width() <= 480 ? 'listMonth' : 'month',
        displayEventTime: false,
        selectable: true,
        selectHelper: true,

        editable: false,
        dayClick: function (date, jsEvent, view, resourceObj) {
            console.log(date, jsEvent, view, resourceObj);
        },
        eventClick: function (calEvent, jsEvent, view) {
            console.log(calEvent, jsEvent, view);
            RenderEventDetail(calEvent.oData);
        },
        viewRender: function (view, element) {

        },
        eventRender: function (event, element) {

        },
        events: function (start, end, timezone, callback) {
            axios.get(API.COMPANY.SCHEDULE, {
                params: {
                    start: start.format('YYYY-MM-DD'),
                    end: end.format('YYYY-MM-DD')
                }
            })
                .then(function (result) {
                    console.log(result);
                    schedules = result.data;
                    Render(schedules, callback);
                })
                .catch(function (error) {
                    // error = error.response;
                    // if (error.status !== 404) {
                    //     new PNotify({
                    //         title: "일정표 로드 오류",
                    //         text: error.statusText,
                    //         addclass: "stack-bottomleft",
                    //         stack: CONSTS.NOTIFY_POS,
                    //         type: "error"
                    //     });
                    // }
                    fn.errorNotify(error);
                });

        }
    });

    $(window).bind('resize', function (event) {
        console.log($(this).width());
        if ($(this).width() <= 480) {
            $CALENDAR.fullCalendar('changeView', 'listMonth');
        } else {
            $CALENDAR.fullCalendar('changeView', 'month');
        }
    });

    $ARTICLES.bind('click', function (event) {
        if (event.target.tagName === 'TD') {
            var $THIS = $(event.target).closest('tr');
            location.href = $THIS.data('url');
        }
    })

    function Render(data, callback) {
        try {
            var parseData = [];


            // parsing Notices
            if (data[0].length) {
                data[0].forEach(function (element) {
                    parseData.push(_parseEvent(element));
                }, this);
            }

            // parsing Schedules
            if (data[1].length) {
                data[1].forEach(function (element) {
                    parseData.push(_parseEvent(element));
                }, this);
            }


        } catch (error) {
            console.log(error);
            new PNotify({
                title: "일정표 로드 오류",
                text: error,
                addclass: "stack-bottomleft",
                stack: CONSTS.NOTIFY_POS,
                type: "error"
            })
        } finally {
            callback(parseData);
        }


        function _parseEvent(element) {
            var _event = $.extend({}, event_object);
            _event.title = element['제목'];
            _event.start = element['시작일자'];
            _event.end = element['종료일자'];
            _event.borderColor = event_color[event_id[element['구분']]].borderColor;
            _event.backgroundColor = event_color[event_id[element['구분']]].backgroundColor;
            _event.textColor = event_color[event_id[element['구분']]].textColor;
            _event.oData = element;
            return _event;
        }
    }

    function RenderEventDetail(event) {
        if (event['구분'] === 6) {
            swal({
                title: '[' + event_name[event['구분']] + '] ' + event['제목'],
                html: (function () {
                    if (event['구분'] === 6) {
                        return '<p class="text-left">' + event['내용'].replace(/\n/gim, '<br>') + '</p>';
                    } else {
                        return '';
                    }
                })()
            });
        }
    }

})(window)