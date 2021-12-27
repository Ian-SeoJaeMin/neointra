(function (exports) {
    'use strict';

    // var $DATEPICKER = $('.datepicker');
    // var $VISITMONTH = $('.datemonth');
    var $VISITSEARCH = $('input[name="visit-search"]');
    var $VISITHEADER = $('.visit-list').find('th');
    var $VISITLIST_DESKTOP = $('#visit-desktop');
    var $VISITLIST_MOBILE = $('#visit-mobile');
    var $VISITSTATUS = $('.visit-status');
    var $VISITOR = $('.visit-writer');
    var $DATACOUNTER = $('#data-count');

    var sort = {
        field: '시작',
        sort: 'desc'
    };

    var options = {
        writer: $VISITOR.selectpicker('val'),
        date: {
            // month: sessionStorage.getItem('visitdate') || moment().format('YYYY-MM')
            start: moment().format('YYYY-MM-DD'),
            end: moment().format('YYYY-MM-DD')
        },
        search: '',
        status: ''
    };

    var visits = null;

    if (sessionStorage.getItem('visitoptions')) {
        options = JSON.parse(sessionStorage.getItem('visitoptions'));
        $VISITSTATUS.selectpicker('val', options.status);
        $VISITOR.selectpicker('val', options.writer);
        $VISITSEARCH.val(options.search);
        // $DATEPICKER.val(options.date.month);
        // $DATEPICKER.data('value', options.date.month);
    }

    var VisitDatePicker = new myDatePicker('.datepicker.visit');
    VisitDatePicker.fn.init(options.date, ChangeDate);
    function ChangeDate() {
        options.date.start = VisitDatePicker.value.start;
        options.date.end = VisitDatePicker.value.end;
        Load();
    }

    // $DATEPICKER.datetimepicker({
    //     format: 'YYYY년MM월',
    //     showTodayButton: true,
    //     defaultDate: options.date.month,
    //     useCurrent: false
    // });

    // $VISITMONTH.bind('click', function (event) {
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

    $VISITHEADER.bind('click', function (event) {
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

        Sorting();
    });

    // $DATEPICKER.bind('dp.change', function (event) {
    //     $DATEPICKER.data('value', event.date.startOf('month').format('YYYY-MM'));
    //     // $CALENDAR_VISIT.fullCalendar('gotoDate', $DATEPICKER_CARE.data('value'));
    //     options.date.month = $DATEPICKER.data('value');
    //     Load();
    // });

    $VISITSTATUS.bind('changed.bs.select', function (event) {
        options.status = $(this).selectpicker('val');
        Load();
    });

    $VISITOR.bind('changed.bs.select', function (event) {
        options.writer = $(this).selectpicker('val');
        Load();
    })

    $VISITSEARCH.bind('keyup', function (event) {
        if (event.keyCode === 13) {
            options.search = $(this).val().trim();
            Load();
        }
    })

    $VISITLIST_DESKTOP.bind('click', function (event) {
        var $TR;
        if (event.target.tagName !== 'TR') {
            $TR = $(event.target).closest('tr');
        } else {
            $TR = $(event.target);
        }
        sessionStorage.setItem(CONSTS.PARENT_URL, CURRENT_URL);
        location.href = '/customer/visit/view?index=' + $TR.data('index');
    })

    function Clear() {
        $VISITLIST_DESKTOP.empty();
        $VISITLIST_MOBILE.empty();
    }

    function Sorting() {
        visits = visits.sort(function (a, b) {
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
        sessionStorage.setItem('visitoptions', JSON.stringify(options));
        axios.get(API.CUSTOMER.VISITS, {
            params: options
        })
            .then(function (result) {
                console.log(result);
                visits = result.data;
                Sorting();
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })
    }

    function Render() {
        var count = 0;
        // var dates = _getDates();

        var template_desktop = '';
        template_desktop += '<tr data-index="{{인덱스}}">';
        template_desktop += '    <td>{{유형}}</td>';
        template_desktop += '    <td class="table-ellipsis">{{기관명칭}}</td>';
        template_desktop += '    <td>{{상태}}</td>';
        template_desktop += '    <td>{{시작}}</td>';
        template_desktop += '    <td>{{종료}}</td>';
        template_desktop += '    <td>{{실시작}}</td>';
        template_desktop += '    <td>{{실종료}}</td>';
        template_desktop += '    <td>{{법인차}}</td>';
        template_desktop += '    <td>{{작성자명}}</td>';
        template_desktop += '    <td>{{작성일자}}</td>';
        template_desktop += '</tr>';

        visits.forEach(function (visit, index) {
            var tpdkt = template_desktop;
            var $MOBILEROW = '';
            var visitType = (function () {
                var visitType = '<span class="badge visit-type-{{VISITTYPE}}">' + visit['유형'] + '</span>';
                switch (visit['방문유형']) {
                    case CONSTS.VISITTYPE.REGULAR: return visitType.replace('{{VISITTYPE}}', 'regular');
                    case CONSTS.VISITTYPE.REQUEST: return visitType.replace('{{VISITTYPE}}', 'request');
                    case CONSTS.VISITTYPE.EMERGENCY: return visitType.replace('{{VISITTYPE}}', 'emergency');
                    case CONSTS.VISITTYPE.SALES: return visitType.replace('{{VISITTYPE}}', 'sales');
                    case CONSTS.VISITTYPE.ETC: return visitType.replace('{{VISITTYPE}}', 'etc');
                    case CONSTS.VISITTYPE.OFFICE: return visitType.replace('{{VISITTYPE}}', 'office');
                    case CONSTS.VISITTYPE.WATCH: return visitType.replace('{{VISITTYPE}}', 'watch');
                    case CONSTS.VISITTYPE.OPEN: return visitType.replace('{{VISITTYPE}}', 'open');
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
            tpdkt = tpdkt.replace(/{{인덱스}}/gim, visit['인덱스']);
            tpdkt = tpdkt.replace('{{유형}}', visitType);
            tpdkt = tpdkt.replace('{{기관명칭}}', visitHosp);
            tpdkt = tpdkt.replace('{{상태}}', visitStatus);
            tpdkt = tpdkt.replace('{{시작}}', visit['시작']);
            tpdkt = tpdkt.replace('{{종료}}', visit['종료']);
            tpdkt = tpdkt.replace('{{실시작}}', visit['실시작']);
            tpdkt = tpdkt.replace('{{실종료}}', visit['실종료']);
            tpdkt = tpdkt.replace('{{법인차}}', visitCar);
            tpdkt = tpdkt.replace('{{작성자명}}', visit['작성자명']);
            tpdkt = tpdkt.replace('{{작성일자}}', visit['작성일자']);

            $MOBILEROW += '<a class="list-group-item ellipsis" href="/customer/visit/view?index=' + visit['인덱스'] + '">';

            $MOBILEROW += '    ' + visitType + ' <b>' + visitStatus + ' ' + visitCar + visitHosp + '</b>';
            $MOBILEROW += '    <br>';
            $MOBILEROW += '    <b class="dark">예정일:' + visit['시작'] + ' - ' + visit['종료'] + '</b>';
            $MOBILEROW += '    <br>';
            $MOBILEROW += '    <b class="dark">방문일:' + visit['실시작'] + ' - ' + visit['실종료'] + '</b>';
            $MOBILEROW += '</a>';



            $VISITLIST_DESKTOP.append(tpdkt);
            $VISITLIST_MOBILE.append($MOBILEROW);
        });

        $DATACOUNTER.text(visits.length + '건');
        /*
        var $MOBILELISTS = '';

        $MOBILELISTS += '<div class="panel list-group visit-list-group">';
        dates.forEach(function (date) {
            $MOBILELISTS += ' <a class="list-group-item visit-list-header" data-toggle="collapse" href="#visit-' + date + '" aria-expanded="false" aria-controls="visit-' + date + '" data-parent="#visit-mobile">';
            $MOBILELISTS += moment(date).format('LL dddd') + ' <span class="badge">{{COUNT}}</span>';
            $MOBILELISTS += '</a>';
            $MOBILELISTS += ' <div id="visit-' + date + '" class="sublinks visit-list-item-header collapse" aria-expanded="false">';

            count = 0;
            visits.forEach(function (visit) {
                if (visit['처리일자'] === date) {
                    count += 1;
                    $MOBILELISTS += '     <div class="list-group-item">';
                    $MOBILELISTS += '         <a data-toggle="collapse" href="#visit-detail-' + visit['인덱스'] + '" aria-expanded="false" aria-controls="#visit-detail-' + visit['인덱스'] + '" data-parent="#visit-' + date + '">';
                    $MOBILELISTS += '             ' + visit['기관명칭'];
                    $MOBILELISTS += '             <small>[' + visit['기관코드'] + ']</small> ';
                    $MOBILELISTS += '             <span class="badge ' + EMR(visit['프로그램']).badge + '">' + visit['프로그램'] + '</span>';                    
                    $MOBILELISTS += '             <br>' + ' ';
                    $MOBILELISTS += '             ' + (visit['상태'] === 1 ? ' <span class="red"><b>미완료</b></span>' : '');
                    $MOBILELISTS += '             ' + visit['작성자명'] + ' ' + moment(visit['작성일자']).calendar();
                    $MOBILELISTS += '         </a>';
                    $MOBILELISTS += '         <div id="visit-detail-' + visit['인덱스'] + '" class="collapse" aria-expanded="false"><div class="divider-dashed"></div>';
                    $MOBILELISTS += '           ' + visit['내용'];                    
                    $MOBILELISTS += '           <p class="text-right"><a class="btn btn-default" href="/customer/visit/view?index=' + visit['인덱스'] + '"><i class="fa fa-edit"></i></a></p>';
                    $MOBILELISTS += '         </div>';
                    $MOBILELISTS += '     </div>';
                }
            })
            $MOBILELISTS += ' </div>';
            $MOBILELISTS = $MOBILELISTS.replace('{{COUNT}}', count);
        });
        $MOBILELISTS += '</div>';

        $VISITLIST_MOBILE.append($MOBILELISTS);
        */
        /*
        function _getDates() {
            var dates = visits.map(function (element) {
                return element['처리일자'];
            });
            var uniq = dates.filter(function (item, pos) {
                return dates.indexOf(item) == pos;
            });

            return uniq.sort();
        }
        */
    }

    Load();

})(window);