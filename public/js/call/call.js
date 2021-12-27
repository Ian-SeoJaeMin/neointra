(function (exports) {
    'use strict';

    // var $DATEPICKER = $('.datepicker');
    // var $CALLMONTH = $('.datemonth');
    var $CALLSEARCH = $('input[name="call-search"]');
    var $CALLHEADER = $('.call-list').find('th');
    var $CALLLIST_DESKTOP = $('#call-desktop');
    var $CALLLIST_MOBILE = $('#call-mobile');
    var $CALLPROGRAM = $('.call-program');
    var $CALLSTATUS = $('.call-status');
    var $CALLWRITER = $('.call-writer');
    var $DATACOUNTER = $('#data-count');

    var sort = {
        field: '처리일자',
        sort: 'desc'
    };

    var options = {
        writer: $CALLWRITER.selectpicker('val'),
        date: {
            // month: sessionStorage.getItem('calldate') || moment().format('YYYY-MM')
            start: moment().format('YYYY-MM-DD'),
            end: moment().format('YYYY-MM-DD')
        },
        program: '',
        search: '',
        status: ''
    };

    var calls = null;

    if (sessionStorage.getItem('calloptions')) {
        options = JSON.parse(sessionStorage.getItem('calloptions'));
        $CALLPROGRAM.selectpicker('val', options.program);
        $CALLSTATUS.selectpicker('val', options.status);
        $CALLSEARCH.val(options.search);
        $CALLWRITER.selectpicker('val', options.writer);
        // $DATEPICKER.val(options.date.month);
        // $DATEPICKER.data('value', options.date.month);
    }

    if (sessionStorage.getItem('callsort')) {
        sort = JSON.parse(sessionStorage.getItem('callsort'));
    }

    var CallDatePicker = new myDatePicker('.datepicker.call');
    CallDatePicker.fn.init(options.date, ChangeDate);
    function ChangeDate() {
        options.date.start = CallDatePicker.value.start;
        options.date.end = CallDatePicker.value.end;
        Load();
    }
    // $DATEPICKER.datetimepicker({
    //     format: 'YYYY년MM월',
    //     showTodayButton: true,
    //     defaultDate: options.date.month,
    //     useCurrent: false
    // });

    // $CALLMONTH.bind('click', function (event) {
    //     var $THIS = $(this);
    //     var currentMonth = $DATEPICKER.data('value');
    //     if ($THIS.data('range') === 'left') {
    //         $DATEPICKER.data('value', moment(currentMonth).subtract(1, 'month').startOf('month').format('YYYY-MM'));
    //         $DATEPICKER.val(moment(currentMonth).subtract(1, 'month').startOf('month').format('YYYY년MM월'));
    //     } else {
    //         $DATEPICKER.data('value', moment(currentMonth).add(1, 'month').startOf('month').format('YYYY-MM'));
    //         $DATEPICKER.val(moment(currentMonth).add(1, 'month').startOf('month').format('YYYY년MM월'));
    //     }
    //     options.date.month = $DATEPICKER.data('value');
    //     Load();
    // });
    $CALLHEADER.filter('[data-field="' + sort.field + '"]').append('<i class="m-l-xs sort fa fa-sort-amount-' + (sort.order === 'asc' ? 'desc' : 'asc') + '"></i>');

    $CALLHEADER.bind('click', function (event) {
        var $THIS = $(this);
        var $SORTICON = $THIS.find('i.sort');
        if (!$THIS.data('field')) return false;

        if ($SORTICON.length) {
            $SORTICON.toggleClass('fa-sort-amount-asc fa-sort-amount-desc');
            sort.order = sort.order === 'asc' ? 'desc' : 'asc';
        } else {
            $THIS.siblings().find('i.sort').remove();
            $THIS.append('<i class="m-l-xs fa sort fa-sort-amount-asc"></i>');
            sort.field = $THIS.data('field');
            sort.order = 'asc';
        }
        sessionStorage.setItem('callsort', JSON.stringify(sort));
        Sorting();
    });

    // $DATEPICKER.bind('dp.change', function (event) {
    //     $DATEPICKER.data('value', event.date.startOf('month').format('YYYY-MM'));
    //     // $CALENDAR_CALL.fullCalendar('gotoDate', $DATEPICKER_CARE.data('value'));
    //     options.date.month = $DATEPICKER.data('value');
    //     Load();
    // });

    $CALLPROGRAM.bind('changed.bs.select', function (event) {
        options.program = $(this).selectpicker('val');
        options.program = options.program.join(',');
        Load();
    });

    $CALLSTATUS.bind('changed.bs.select', function (event) {
        options.status = $(this).selectpicker('val');
        Load();
    });

    $CALLWRITER.bind('changed.bs.select', function (event) {
        options.writer = $(this).selectpicker('val');
        Load();
    });

    $CALLSEARCH.bind('keyup', function (event) {
        if (event.keyCode === 13) {
            options.search = $(this).val().trim();
            Load();
        }
    })

    $CALLLIST_DESKTOP.bind('click', function (event) {
        var $TR;
        if (event.target.tagName !== 'TR') {
            $TR = $(event.target).closest('tr');
        } else {
            $TR = $(event.target);
        }
        location.href = '/customer/call/view?index=' + $TR.data('index');
    })

    function Clear() {
        $CALLLIST_DESKTOP.empty();
        $CALLLIST_MOBILE.empty();
    }

    function Sorting() {
        calls = calls.sort(function (a, b) {
            if (sort.order === 'asc') {
                return (a[sort.field] > b[sort.field]) ? 1 : ((a[sort.field] < b[sort.field]) ? -1 : 0);
            } else {
                return (b[sort.field] > a[sort.field]) ? 1 : ((b[sort.field] < a[sort.field]) ? -1 : 0);
            }
        });

        Clear();
        Render();
    }

    function Load() {
        sessionStorage.setItem('calloptions', JSON.stringify(options));
        axios.get(API.CUSTOMER.CALLS, {
            params: options
        })
            .then(function (result) {
                console.log(result);
                calls = result.data;
                Sorting();
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })
    }

    function Render() {
        var count = 0;
        var dates = _getDates();

        var template_desktop = '';
        template_desktop += '<tr data-index="{{인덱스}}">';
        template_desktop += '    <td>{{인덱스}}</td>';
        template_desktop += '    <td>{{신규}}</td>';
        template_desktop += '    <td>{{기관코드}}</td>';
        template_desktop += '    <td class="table-ellipsis">{{기관명칭}}</td>';
        template_desktop += '    <td>{{지사}}</td>';
        template_desktop += '    <td>{{담당자}}</td>';
        template_desktop += '    <td>{{프로그램}}</td>';
        template_desktop += '    <td>{{처리일자}}</td>';
        template_desktop += '    <td>{{상태}}</td>';
        template_desktop += '    <td>{{AS전달}}</td>';
        template_desktop += '    <td>{{작성자명}}</td>';
        template_desktop += '    <td>{{처리자}}</td>';
        template_desktop += '    <td>{{작성일자}}</td>';
        template_desktop += '</tr>';

        calls.forEach(function (call, index) {
            // console.log(call);
            var tpdkt = template_desktop;
            tpdkt = tpdkt.replace(/{{인덱스}}/gim, call['인덱스']);

            tpdkt = tpdkt.replace('{{신규}}', (function () {
                if (call['계약일'].length) {
                    if (moment().diff(call['계약일'], 'month') <= 3) {
                        return '<span class="badge badge-red-4">신규</span>';
                    } else {
                        return '';
                    }
                } else {
                    return '';
                }
            })());

            tpdkt = tpdkt.replace('{{기관코드}}', call['기관코드'] === '' ? '<span class="badge bg-navy">미등록</span>' : call['기관코드']);
            tpdkt = tpdkt.replace('{{기관명칭}}', call['기관명칭']);
            tpdkt = tpdkt.replace('{{프로그램}}', (function () {
                if (call['USER_ID'] > -1) {
                    return '<span class="badge ' + EMR(call['프로그램']).badge + '">' + call['프로그램'] + '</span>';
                } else {
                    return '';
                }
            })());
            tpdkt = tpdkt.replace('{{처리일자}}', moment(call['처리일자']).format('YYYY-MM-DD a hh:mm:ss'));
            tpdkt = tpdkt.replace('{{상태}}', call['상태'] === 1 ? '<b class="red">미완료</b>' : '<b class="blue">완료</b>');
            tpdkt = tpdkt.replace('{{AS전달}}', call['AS전달'] > 0 ? '<i class="fa fa-check text-primary"></i>' : '');
            tpdkt = tpdkt.replace('{{작성자명}}', call['작성자명']);
            tpdkt = tpdkt.replace('{{작성일자}}', moment(call['작성일자']).calendar());
            tpdkt = tpdkt.replace('{{지사}}', call['지사']);
            tpdkt = tpdkt.replace('{{담당자}}', call['담당자']);
            tpdkt = tpdkt.replace('{{처리자}}', call['AS처리자명']);

            $CALLLIST_DESKTOP.append(tpdkt);
        })

        var $MOBILELISTS = '';

        $MOBILELISTS += '<div class="panel list-group call-list-group">';
        dates.forEach(function (date) {
            // $MOBILELISTS += ' <a class="list-group-item call-list-header" data-toggle="collapse" href="#call-' + date + '" aria-expanded="false" aria-controls="call-' + date + '" data-parent="#call-mobile">';
            $MOBILELISTS += '<div class="list-group-item bg-green">'
            $MOBILELISTS += moment(date).format('LL dddd') + ' <span class="badge">{{COUNT}}</span>';
            // $MOBILELISTS += '</a>';
            $MOBILELISTS += '</div>';
            // $MOBILELISTS += ' <div id="call-' + date + '" class="sublinks call-list-item-header collapse" aria-expanded="false">';

            count = 0;
            calls.forEach(function (call) {
                if (moment(call['처리일자']).format('YYYY-MM-DD') === date) {
                    count += 1;

                    $MOBILELISTS += '         <a href="/customer/call/view?index=' + call['인덱스'] + '" class="list-group-item">';
                    $MOBILELISTS += '             ' + call['기관명칭'];
                    $MOBILELISTS += '             <small>[' + call['기관코드'] + ']</small> ';
                    if (call['USER_ID'] > -1) {
                        $MOBILELISTS += '             <span class="badge ' + EMR(call['프로그램']).badge + '">' + call['프로그램'] + '</span>';
                    } else {
                        $MOBILELISTS += '             <span class="badge bg-navy">미등록</span>';
                    }
                    $MOBILELISTS += '             ' + call['지사'] + (call['담당자'].trim().length > 0 ? '(' + call['담당자'] + ')' : '');
                    $MOBILELISTS += '             <br>' + ' ';
                    $MOBILELISTS += '             ' + (call['상태'] === 1 ? ' <span class="red"><b>미완료</b></span>' : '');
                    $MOBILELISTS += '             <i class="fa fa-edit"></i> ' + call['작성자명'] + ' ' + moment(call['작성일자']).calendar();
                    $MOBILELISTS += '         </a>';


                }
            })
            // $MOBILELISTS += ' </div>';
            $MOBILELISTS = $MOBILELISTS.replace('{{COUNT}}', count);
        });
        $MOBILELISTS += '</div>';

        $CALLLIST_MOBILE.append($MOBILELISTS);

        $DATACOUNTER.text(calls.length + '건');

        function _getDates() {
            var dates = calls.map(function (element) {
                return moment(element['처리일자']).format('YYYY-MM-DD');
            });
            var uniq = dates.filter(function (item, pos) {
                return dates.indexOf(item) == pos;
            });

            return uniq.sort().reverse();
        }
    }

    Load();

})(window);