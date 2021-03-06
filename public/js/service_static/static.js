;
(function (exports) {
    'use strict'

    var start = moment(),
        end = moment()

    var $SEARCHBTN = $('button[name="search-btn"]')
    var $YEARPICKER = $('.yearpicker')
    var $STATUSTABLE = $('#service-status')
    var $EXEAREA = $('[name="exe-static-area"]')
    var $EXETABLE = $('#exe-table')
    var $ACCEPTDAYRANGE = $('.btn-accept-day-range')
    var $ACCEPTDAY = $('.btn-accept-day')
    var $EXESTATICDETAIL = $('.exestatic-detail-modal').modal({
        show: false,
        keyboard: true,
        backdrop: 'static'
    })

    var $categoryProgram = $('.category-options#program'),
        $categoryExe = $('.category-options#exe'),
        $categoryList = $('#category-list')

    $categoryProgram.selectpicker().bind('changed.bs.select', function (event) {
        exports.Categorys.options.program = $(this).selectpicker('val')
        // RenderCategoryStatic()
    })
    $categoryExe.selectpicker().bind('changed.bs.select', function (event) {
        exports.Categorys.options.exe = $(this).selectpicker('val')
        // RenderCategoryStatic()
    })

    var $finderCategoryProgram = $('.finder-options#program'),
        $finderCategoryExe = $('.finder-options#exe'),
        // $finderCategoryList = $('#finder-category-list')
        $finderCategoryMenu = $('tbody#finder-menu'),
        $finderCategoryButton = $('tbody#finder-button'),
        $finderCategoryList = $('tbody#finder-list')

    $finderCategoryProgram.selectpicker().bind('changed.bs.select', function (event) {
        finderCategoryOpts.program = $(this).selectpicker('val')
        finderCategoryOpts.menu = ''
        finderCategoryOpts.button = ''
        $finderCategoryButton.empty()
        $finderCategoryList.empty()
        // LoadFinderCategoryStatic()
    })
    $finderCategoryExe.selectpicker().bind('changed.bs.select', function (event) {
        finderCategoryOpts.exe = $(this).selectpicker('val')
        finderCategoryOpts.menu = ''
        finderCategoryOpts.button = ''
        $finderCategoryButton.empty()
        $finderCategoryList.empty()
        // LoadFinderCategoryStatic()
    })

    var StaticDatePicker = new myDatePicker('.datepicker.static')
    StaticDatePicker.fn.init({
        start: moment().format('YYYY-MM-DD'),
        end: moment().format('YYYY-MM-DD')
    },
        ServiceStatus
    )

    var ExeDatePicker = new myDatePicker('.datepicker.exe')
    ExeDatePicker.fn.init({
        start: moment().format('YYYY-MM-DD'),
        end: moment().format('YYYY-MM-DD')
    },
        LoadExeStatic
    )

    var CategoryDatePicker = new myDatePicker('.datepicker.categorys')
    CategoryDatePicker.fn.init({
        start: moment().format('YYYY-MM-DD'),
        end: moment().format('YYYY-MM-DD')
    },
        ChangeDate
    )

    var FinderCategoryDatePicker = new myDatePicker('.datepicker.finder')
    FinderCategoryDatePicker.fn.init({
        start: moment().format('YYYY-MM-DD'),
        end: moment().format('YYYY-MM-DD')
    },
        ChangeFinderDate
    )

    var categoryOpts = sessionStorage.getItem('categoryOpts');
    categoryOpts = categoryOpts ? JSON.parse(categoryOpts) : {
        program: '',
        exe: '',
        date: CategoryDatePicker.value
    }

    var finderCategoryOpts = sessionStorage.getItem('finderCategoryOpts');
    finderCategoryOpts = finderCategoryOpts ? JSON.parse(finderCategoryOpts) : {
        program: '',
        exe: '',
        menu: '',
        button: '',
        date: FinderCategoryDatePicker.value
    }

    function ServiceStatus() {
        axios
            .get(API.STATIC.STATUS, {
                params: {
                    date: StaticDatePicker.value
                }
            })
            .then(function (result) {
                SortingServiceStatus(result.data)
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    $SEARCHBTN.bind('click', function (event) {
        var staticType = $(this).attr('class').replace('btn btn-success ', '');
        // LoadProgramStatic()
        // LoadAreaStatic()

        // LoadAcceptDaysStatic()
        // LoadCategoryStatic()
        switch (staticType) {
            case 'static':
                return ServiceStatus();
            case 'exe':
                return LoadExeStatic();
            case 'categorys':
                return LoadCategoryStatic();
            case 'finder':
                return LoadFinderCategoryStatic();
        }
    });

    $YEARPICKER
        .datetimepicker({
            viewMode: $YEARPICKER.data('viewMode'),
            format: $YEARPICKER.data('format'),
            ignoreReadonly: true,
            defaultDate: moment().format()
        })
        .bind('dp.change', function (event) {
            LoadProgramStatic()
        })

    $EXEAREA.bind('change', function () {
        $(this)
            .parent()
            .toggleClass('fa fa-check')
        LoadExeStatic()
    })

    $EXETABLE.bind('click', function (event) {
        if (event.target.tagName === 'TD') {
            var $THIS = $(event.target)
            var params = {
                date: ExeDatePicker.value,
                area: $EXEAREA.is(':checked') ? 1 : 0,
                program: typeof $THIS.closest('tr').data('program') === 'undefined' ?
                    '' : $THIS.closest('tr').data('program'),
                exe: $THIS.data('exe'),
                treat: typeof $THIS.data('treat') === 'undefined' ?
                    '' : $THIS.data('treat'),
                count: $THIS.text()
            }

            if (params.count.indexOf('(') >= 0) {
                params.count = params.count.split('(')[0].trim()
            }

            if ($.isNumeric(params.count) && parseInt(params.count) > 0) {
                LoadExeDetailStatic(params)
                // $EXESTATICDETAIL.modal('show');
            }
        }
    })

    $ACCEPTDAYRANGE.bind('click', function (event) {
        $(this)
            .addClass('active')
            .siblings()
            .removeClass('active')

        LoadAcceptDaysStatic($(this).data('value'), $(this).data('range'))

    })
    $ACCEPTDAY.bind('click', function (event) {
        $(this)
            .removeClass('btn-default')
            .addClass('btn-primary')
            .siblings()
            .removeClass('btn-primary')
            .addClass('btn-default')
        ParseAcceptDaysData(
            exports.AcceptDays,
            $(this).data('day-name'),
            $ACCEPTDAYRANGE.filter('.active').data('value'),
            $ACCEPTDAYRANGE.filter('.active').data('range')
        )
            .then(function (timeData) {
                RenderAcceptDays(timeData)
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    })

    function SortingServiceStatus(status) {
        var sort = {
            field: 'area',
            order: 'asc'
        }
        status = status.sort(function (a, b) {
            if (sort.order === 'asc') {
                return a[sort.field] > b[sort.field] ?
                    1 :
                    a[sort.field] < b[sort.field] ?
                        -1 :
                        0
            } else {
                return b[sort.field] > a[sort.field] ?
                    1 :
                    b[sort.field] < a[sort.field] ?
                        -1 :
                        0
            }
        })

        RenderServiceStatus(status)
    }

    function RenderServiceStatus(status) {
        $STATUSTABLE.empty()
        var colSum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        var divider = false
        var total = 0
        status.forEach(function (s) {
            var border = ''
            if (s['area'] !== '' && divider === false) {
                divider = true
                if ($STATUSTABLE.find('tr').length > 0) {
                    $STATUSTABLE.append(
                        '<tr>' +
                        '   <th class="bg-success text-center">??????</th>' +
                        '   <th class="bg-success text-right" data-content="' +
                        colSum[0] +
                        '">' +
                        colSum[0] +
                        '</th>' +
                        '   <th class="bg-success text-right" data-content="' +
                        colSum[1] +
                        '">' +
                        colSum[1] +
                        '</th>' +
                        '   <th class="bg-success text-right" data-content="' +
                        colSum[2] +
                        '">' +
                        colSum[2] +
                        '</th>' +
                        '   <th class="bg-success text-right" data-content="' +
                        colSum[3] +
                        '">' +
                        colSum[3] +
                        '</th>' +
                        '   <th class="bg-success text-right" data-content="' +
                        colSum[4] +
                        '">' +
                        colSum[4] +
                        '</th>' +
                        '   <th class="bg-success text-right" data-content="' +
                        colSum[5] +
                        '">' +
                        colSum[5] +
                        '</th>' +
                        '   <th class="bg-success text-right" data-content="' +
                        colSum[6] +
                        '">' +
                        colSum[6] +
                        '</th>' +
                        '   <th class="bg-success text-right" data-content="' +
                        colSum[7] +
                        '">' +
                        colSum[7] +
                        '</th>' +
                        '   <th class="bg-success text-right" data-content="' +
                        colSum[8] +
                        '">' +
                        colSum[8] +
                        '</th>' +
                        '   <th class="bg-success text-right" data-content="' +
                        colSum[10] +
                        '">' +
                        colSum[10] +
                        '</th>' +
                        '   <th class="bg-success text-right" data-content="' +
                        colSum[9] +
                        '">' +
                        colSum[9] +
                        '</th>' +
                        // '   <th class="bg-success text-right">' + (colSum.reduce(function (a, b) { return a + b }, 0)) + '</th>' +
                        '</tr>'
                    )
                    colSum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
            }

            total = s['service'] + s['call']
            $STATUSTABLE.append(
                '<tr>' +
                '   <td class="text-right">' +
                s['name'] +
                '</td>' +
                '   <th class="bg-success text-right" data-content="' +
                total +
                '">' +
                total +
                '</th>' +
                '   <td class="text-right" data-content="' +
                s['service'] +
                '">' +
                s['service'] +
                ' (' +
                Math.floor((100 / total) * s['service']) +
                '%)</td>' +
                '   <td class="text-right" data-content="' +
                s['call'] +
                '">' +
                s['call'] +
                ' (' +
                Math.floor((100 / total) * s['call']) +
                '%)</td>' +
                '   <td class="text-right" data-content="' +
                s['visit'] +
                '">' +
                s['visit'] +
                '</td>' +
                '   <td class="text-right" data-content="' +
                s['r'] +
                '">' +
                s['r'] +
                '</td>' +
                '   <td class="text-right" data-content="' +
                s['s'] +
                '">' +
                s['s'] +
                '</td>' +
                '   <td class="text-right" data-content="' +
                s['p'] +
                '">' +
                s['p'] +
                '</td>' +
                '   <td class="text-right" data-content="' +
                s['h'] +
                '">' +
                s['h'] +
                '</td>' +
                '   <td class="text-right" data-content="' +
                s['d'] +
                '">' +
                s['d'] +
                '</td>' +
                '   <td class="text-right" data-content="' +
                s['f'] +
                '">' +
                s['f'] +
                '</td>' +
                '   <td class="text-right" data-content="' +
                s['c'] +
                '">' +
                s['c'] +
                '</td>' +
                '</tr>'
            )
            colSum[0] += s['service'] + s['call']
            colSum[1] += s['service']
            colSum[2] += s['call']
            colSum[3] += s['visit']
            colSum[4] += s['r']
            colSum[5] += s['s']
            colSum[6] += s['p']
            colSum[7] += s['h']
            colSum[8] += s['d']
            colSum[9] += s['c']
            colSum[10] += s['f']
        })
        $STATUSTABLE.append(
            '<tr>' +
            '   <th class="bg-success text-center">??????</th>' +
            '   <th class="bg-success text-right" data-content="' +
            colSum[0] +
            '">' +
            colSum[0] +
            '</th>' +
            '   <th class="bg-success text-right" data-content="' +
            colSum[1] +
            '">' +
            colSum[1] +
            '</th>' +
            '   <th class="bg-success text-right" data-content="' +
            colSum[2] +
            '">' +
            colSum[2] +
            '</th>' +
            '   <th class="bg-success text-right" data-content="' +
            colSum[3] +
            '">' +
            colSum[3] +
            '</th>' +
            '   <th class="bg-success text-right" data-content="' +
            colSum[4] +
            '">' +
            colSum[4] +
            '</th>' +
            '   <th class="bg-success text-right" data-content="' +
            colSum[5] +
            '">' +
            colSum[5] +
            '</th>' +
            '   <th class="bg-success text-right" data-content="' +
            colSum[6] +
            '">' +
            colSum[6] +
            '</th>' +
            '   <th class="bg-success text-right" data-content="' +
            colSum[7] +
            '">' +
            colSum[7] +
            '</th>' +
            '   <th class="bg-success text-right" data-content="' +
            colSum[8] +
            '">' +
            colSum[8] +
            '</th>' +
            '   <th class="bg-success text-right" data-content="' +
            colSum[10] +
            '">' +
            colSum[10] +
            '</th>' +
            '   <th class="bg-success text-right" data-content="' +
            colSum[9] +
            '">' +
            colSum[9] +
            '</th>' +
            // '   <th class="bg-success text-right">' + (colSum.reduce(function (a, b) { return a + b }, 0)) + '</th>' +
            '</tr>'
        )
    }

    function LoadProgramStatic() {
        axios
            .get(API.STATIC.PROGRAM, {
                params: {
                    year: $YEARPICKER.val().replace('???', '')
                }
            })
            .then(function (result) {
                console.log(result)
                RenderProgramChart(result.data)
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    function RenderProgramChart(data) {
        var ctx = document.getElementById('program-chart').getContext('2d')
        var MONTHS = (function () {
            var _months = []
            for (var i = 1; i <= 12; i++) {
                _months.push(i + '???')
            }
            return _months
        })()

        var config = {
            type: 'bar',
            data: {},
            options: {
                responsive: true,
                title: {
                    display: false
                },
                maintainAspectRatio: false
            }
        }

        if (exports.programChart) {
            exports.programChart.destroy();
        }

        _parsing(data)
            .then(function (pData) {
                config.data = pData
                exports.programChart = new Chart(ctx, config)
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })

        function _parsing() {
            return new Promise(function (resolve, reject) {
                try {
                    var parseData = {
                        labels: MONTHS,
                        datasets: []
                    }

                    var arrMonth = []
                    var program = {}

                    data.forEach(function (element) {
                        // arrMonth.push(moment(element['????????????']).format('M') + '???');
                        if (!program.hasOwnProperty(element['???????????????'])) {
                            program[element['???????????????']] = {
                                label: element['???????????????'],
                                backgroundColor: EMR(element['????????????'])
                                    .backgroundColor,
                                borderColor: EMR(element['????????????'])
                                    .backgroundColor,
                                fill: false,
                                data: Array.apply(null, Array(12)).map(
                                    function () {
                                        return 0
                                    }
                                )
                            }
                        }

                        var month = moment(element['????????????']).format('M')
                        program[element['???????????????']].data[month - 1] =
                            element['A/S']
                    })

                    Object.keys(program).forEach(function (key) {
                        parseData.datasets.push(program[key])
                    })
                    resolve(parseData)
                } catch (error) {
                    reject(error)
                }
            })
        }
    }

    function LoadAreaStatic() {
        axios
            .get(API.STATIC.AREA)
            .then(function (result) {
                console.log(result)
                RenderAreaChart(result.data[0], result.data[1])
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    function RenderAreaChart(prev, current) {
        try {
            var ctx = document.getElementById('area-chart').getContext('2d')

            var config = {
                type: 'bar',
                data: {},
                options: {
                    responsive: true,
                    title: {
                        display: false
                    },
                    maintainAspectRatio: false
                }
            }

            var prevLabels = _getLabels(prev)
            var currentLabels = _getLabels(current)
            var labels = prevLabels.concat(currentLabels)
            labels = labels.reduce(function (a, b) {
                if (a.indexOf(b) < 0) a.push(b)
                return a
            }, [])
            // labels = labels.sort();

            var prevData = _parsing(prev)
            var currentData = _parsing(current)

            config.data = {
                labels: labels,
                datasets: [{
                    label: moment()
                        .subtract(1, 'year')
                        .format('YYYY???'),
                    backgroundColor: CONSTS.CHART_COLOR.RED,
                    data: prevData
                },
                {
                    label: moment().format('YYYY???'),
                    backgroundColor: CONSTS.CHART_COLOR.BLUE,
                    data: currentData
                }
                ]
            }
            var areaChart = new Chart(ctx, config)

            function _parsing(d) {
                var parseData = []
                labels.forEach(function (label) {
                    var _item = d.find(function (item) {
                        return item['?????????'] === label
                    })
                    if (_item) {
                        parseData.push(_item['??????'])
                    } else {
                        parseData.push(0)
                    }
                })
                return parseData
            }

            function _getLabels(d) {
                if (d) {
                    return d.map(function (item) {
                        return item['?????????']
                    })
                } else {
                    return []
                }
            }
        } catch (error) {
            fn.errorNotify(error)
        }
    }

    function LoadExeStatic() {
        axios
            .get(API.STATIC.EXE, {
                params: {
                    date: ExeDatePicker.value,
                    area: $EXEAREA.is(':checked') ? 1 : 0
                }
            })
            .then(function (result) {
                RenderExeStatic(result.data)
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    function RenderExeStatic(exes) {
        return new Promise(function (resolve, reject) {
            try {
                var $ROW = ''
                var $PROCROW = ''
                var processes = params.setting.service['????????????']
                var temp = {}
                var sum = new Array(CONSTS.EXES.length + 1)
                var total = 0

                $EXETABLE.empty()

                processes = processes.map(function (prc) {
                    return prc['?????????']
                })
                processes.unshift('??????')

                exes[0].forEach(function (exe) {



                    $ROW = ''
                    $ROW +=
                        '<tr style="background-color:#f3f3f3" class="exe-program-total" data-program="' +
                        exe['????????????'] +
                        '">'
                    $ROW += '    <th colspan="2">' + exe['???????????????'] + '</th>'
                    CONSTS.EXES.forEach(function (header, index) {
                        $ROW +=
                            '   <td class="text-right" data-exe="' +
                            header +
                            '" data-content="' +
                            exe[header] +
                            '">' +
                            exe[header] + '<br>' +
                            (header.match(/?????????|?????????/gim) ?
                                '(<span class="font-bold orange">' + toHours(exe[header + '??????T']) + '</span> / <span class="font-bold blue">' + toHours(exe[header + '??????T']) + '</span>)' : ''
                            ) +
                            '</td>'
                        if (!sum[index]) sum[index] = 0
                        if (!sum[sum.length - 1]) sum[sum.length - 1] = 0
                        sum[index] += exe[header]
                        sum[sum.length - 1] += exe[header]
                    })
                    $ROW +=
                        '    <th class="text-right blue">' +
                        exe['??????'] +
                        '</th>'
                    $ROW += '</tr>'

                    $EXETABLE.append($ROW)

                    processes.forEach(function (proc, index) {
                        if (
                            !exes[1].some(function (_exe) {
                                return (
                                    _exe['????????????'] === exe['????????????'] &&
                                    _exe['????????????'] === index
                                )
                            })
                        ) {
                            temp = {
                                ????????????: exe['????????????'],
                                ???????????????: exe['???????????????'],
                                ????????????: index,
                                ??????: 0
                            }

                            CONSTS.EXES.forEach(function (header, index) {
                                temp[header] = 0
                            })
                            exes[1].push(temp)
                        }
                    })
                })

                $ROW = ''
                $ROW += '<tr class="bg-info">'
                $ROW += '    <th colspan="2">TOTAL</th>'
                sum.forEach(function (s, index) {
                    $ROW +=
                        '   <td class="text-right" data-exe="' +
                        CONSTS.EXES[index] +
                        '" data-content="' +
                        s +
                        '">' +
                        s +
                        ' (' +
                        Math.ceil((s / sum[sum.length - 1]) * 100) +
                        '%)</td>'
                })
                $ROW += '</tr>'
                $EXETABLE.append($ROW)

                exes[1] = exes[1].sort(function (a, b) {
                    if (a['????????????'] > b['????????????']) return -1
                    if (a['????????????'] < b['????????????']) return 1
                    if (a['????????????'] > b['????????????']) return 1
                    if (a['????????????'] < b['????????????']) return -1
                })

                sum = new Array(processes.length)

                exes[1].forEach(function (exe) {
                    var $PROCROW = $EXETABLE.find(
                        'tr.exe-program-total[data-program="' +
                        exe['????????????'] +
                        '"]'
                    )
                    total = parseInt($PROCROW.find('th:last-child').text())
                    $ROW = ''
                    $ROW += '<tr data-program="' + exe['????????????'] + '">'
                    $ROW += '    <th></th>'
                    $ROW += '    <th>' + processes[exe['????????????']] + '</th>'
                    CONSTS.EXES.forEach(function (header, index) {
                        $ROW +=
                            '   <td class="text-right" data-exe="' +
                            header +
                            '" data-treat="' +
                            exe['????????????'] +
                            '" data-content="' +
                            exe[header] +
                            '">' +
                            exe[header] +
                            '</td>'
                    })
                    $ROW +=
                        '    <th class="text-right blue">' +
                        exe['??????'] +
                        ' (' +
                        Math.ceil((exe['??????'] / total) * 100) +
                        '%)</th>'
                    $ROW += '</tr>'
                    if (!sum[exe['????????????']]) sum[exe['????????????']] = 0
                    sum[exe['????????????']] += exe['??????']
                    $PROCROW.before($ROW)
                })

                total = sum.reduce(function (accu, value, index, arr) {
                    return accu + value
                })
                $ROW = ''
                $ROW +=
                    '<tr><th colspan="15" class="bg-navy">??????????????? ??????</th></tr>'
                sum.forEach(function (s, index) {
                    $ROW += '<tr>'
                    if (index == 0) {
                        // $ROW += '    <th class="" rowspan="' + sum.length + '"></th>';
                    }
                    $ROW +=
                        '    <th class="bg-info" colspan="2">' +
                        processes[index] +
                        '</th>'
                    $ROW +=
                        '    <td class="text-right">' +
                        s +
                        ' (' +
                        Math.ceil((s / total) * 100) +
                        '%)</td>'
                    if (index == 0) {
                        $ROW +=
                            '    <td class="text-right" rowspan="' +
                            sum.length +
                            '">' +
                            total +
                            ' (' +
                            Math.ceil((total / total) * 100) +
                            '%)</td>'
                        // $ROW += '    <td colspan="10" rowspan="' + sum.length + '"></td>';
                    }
                    $ROW += '</tr>'
                })
                $EXETABLE.append($ROW)

                /*
                var datasets = exes.map(function (label) {
                    var data = [];
                    CONSTS.EXES.forEach(function (exe) {
                        var item = exes.find(function (_exe) {
                            return _exe['???????????????'] === label['???????????????'];
                        });
                        data.push(Math.ceil(100 / item['??????'] * item[exe]));
                    });
                    return $.extend({}, {
                        label: label['???????????????'],
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(220, 220, 220, 1)',
                        data: data
                    }, CONSTS.CHART_COLOR[label['????????????']]);
                })

                var $EXECHART = $('#exe-chart');
                $EXECHART.empty();
                datasets.forEach(function (dataset) {
                    var $COL = $('<div />').addClass('col-md-3 col-sm-12 col-xs-12');
                    var $CHART_CONTAINER = $('<div />').addClass('chart-container-mini').appendTo($COL);
                    var $CANVAS = $('<canvas />').appendTo($CHART_CONTAINER);

                    var f = $CANVAS[0];
                    var i = {
                        labels: CONSTS.EXES,
                        datasets: [dataset]
                    }

                    $COL.appendTo($EXECHART);
                    new Chart(f, {
                        type: 'radar',

                        data: i
                    })
                })
                */
            } catch (error) {
                reject(error)
            }
        })

        function toHours(seconds) {

            var hour = parseInt(seconds / 3600);
            var min = parseInt((seconds % 3600) / 60);
            var sec = seconds % 60;

            var hourStr = ''
            if (hour > 0) {
                hourStr = hour + 'h'
            }
            if (min > 0) {
                hourStr += min + 'm'
            }
            if (sec > 0) {
                hourStr == sec + 's'
            }

            return hourStr
        }
    }

    function LoadExeDetailStatic(params) {
        axios
            .get(API.STATIC.EXEDETAIL, {
                params: params
            })
            .then(function (result) {
                RenderExeDetail(result.data)
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    function RenderExeDetail(details) {
        //console.log(details);
        var $TABLE = $EXESTATICDETAIL.find('table')
        var $TBODY = $('<tbody/>')
        var $ROW = ''
        var treat = '',
            temp = ''
        var processes = params.setting.service['????????????']

        processes = processes.map(function (prc) {
            return prc['?????????']
        })

        processes.unshift('??????')

        details.forEach(function (detail, index) {
            $ROW = ''
            $ROW += '<tr>'
            $ROW += '   <td>' + detail['????????????'] + '</td>'
            $ROW += '   <td>' + detail['???????????????'] + '</td>'
            $ROW += '   <td width="80px">' + detail['????????????'] + '</td>'
            $ROW += '   <td width="150px">' + processes[detail['????????????']] +
                '<br><a class="btn btn-primary btn-xs" href="/service/history/detail?index=' + detail['?????????'] + '&id=' + detail['USER_ID'] + '&hospnum=' + detail['????????????'] + '" target="_blank">?????????</a>' +
                '</td>'
            // $ROW += '   <td><button type="button" class="question btn btn-xs btn-primary" data-index="' + index + '">?</button></td>';
            $ROW +=
                '   <td>' +
                detail['????????????'].replace(/\n/gim, '<br>') +
                '</td>'
            $ROW +=
                '   <td>' +
                detail['????????????'].replace(/\n/gim, '<br>') +
                '</td>'
            $ROW +=
                '   <td>' +
                detail['????????????'].replace(/\n/gim, '<br>') +
                '</td>'

            // treat = detail['????????????'];
            // temp = treat.split('\n');

            // $ROW += '   <td>' + (function () {
            //     var cause;
            //     cause = temp.find(function (t) {
            //         return t.indexOf('1)') >= 0;
            //     })

            //     if (cause) {
            //         cause = cause.split(':');
            //         cause = cause[cause.length - 1];
            //         return cause.trim();
            //     } else return '';

            // })().replace(/\n/gim, '<br>') + '</td>';
            // $ROW += '   <td>' + (function () {
            //     var cause;
            //     cause = temp.find(function (t) {
            //         return t.indexOf('2)') >= 0;
            //     })

            //     if (cause) {
            //         cause = cause.split(':');
            //         cause = cause[cause.length - 1];
            //         return cause.trim();
            //     } else return '';
            // })().replace(/\n/gim, '<br>') + '</td>';
            // $ROW += '   <td>' + (function () {
            //     var cause;
            //     var selIndex;
            //     cause = temp.find(function (t, index) {
            //         if (t.indexOf('3)') >= 0) {
            //             selIndex = index
            //             return true;
            //         }
            //     })

            //     if (cause) {
            //         cause = cause.split(':');
            //         cause = cause[cause.length - 1];
            //         if (detail['????????????'] === 3) {
            //             for (var i = selIndex + 1; i < temp.length; i++) {
            //                 cause += temp[i] + '\n';
            //             }
            //         }
            //         return cause.trim();

            //     } else return '';
            // })().replace(/\n/gim, '<br>') + '</td>';

            $ROW += '</tr>'
            $TBODY.append($ROW)
        })

        $TABLE.find('tbody').remove()

        $TBODY.appendTo($TABLE)

        $EXESTATICDETAIL.modal({
            keyboard: true
        })
    }

    function LoadAcceptDaysStatic(rangeType, range) {
        // ParseAcceptDaysData(
        //     exports.AcceptDays,
        //     $ACCEPTDAY.filter('.btn-primary').data('day-name'),
        //     $(this).data('value'),
        //     $(this).data('range')
        // )
        //     .then(function (timeData) {
        //         RenderAcceptDays(timeData)
        //     })
        //     .catch(function (error) {
        //         fn.errorNotify(error)
        //     })

        axios
            .get(API.STATIC.ACCEPTDAYS)
            .then(function (result) {
                exports.AcceptDays = result.data
                return ParseAcceptDaysData(
                    result.data,
                    $ACCEPTDAY.filter('btn-primary').data('day-name'),
                    rangeType,
                    range
                )
            })
            .then(function (times) {
                RenderAcceptDays(times)
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    function ParseAcceptDaysData(data, dayName, rangeType, range) {
        return new Promise(function (resolve, reject) {
            try {
                var startDate, endDate
                data = data || exports.AcceptDays

                if (rangeType && rangeType.length > 0) {
                    startDate = moment()
                        .subtract(range, rangeType)
                        .format('YYYY-MM-DD')
                    endDate = moment().format('YYYY-MM-DD')

                    data = data.filter(function (accept) {
                        var acceptDate = moment(accept['????????????']).format(
                            'YYYY-MM-DD'
                        )
                        return startDate <= acceptDate && endDate >= acceptDate ?
                            true :
                            false
                    })
                }

                var toDayName = dayName || moment().format('dddd')
                var timeData = {
                    0: 0,
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0,
                    6: 0,
                    7: 0,
                    8: 0,
                    9: 0,
                    10: 0,
                    11: 0,
                    12: 0,
                    13: 0,
                    14: 0,
                    15: 0,
                    16: 0,
                    17: 0,
                    18: 0,
                    19: 0,
                    20: 0,
                    21: 0,
                    22: 0,
                    23: 0,
                    24: 0
                }
                data.forEach(function (accept) {
                    if (!timeData[parseInt(accept['??????'])])
                        timeData[parseInt(accept['??????'])] = 0
                    if (accept['??????'] === toDayName) {
                        timeData[parseInt(accept['??????'])] += 1
                    }
                })

                timeData = Object.keys(timeData).map(function (_t) {
                    return timeData[_t]
                })

                resolve(timeData)
            } catch (error) {
                reject(error)
            }
        })
    }

    function RenderAcceptDays(data) {
        try {
            if (exports.AcceptDaysChart) {
                exports.AcceptDaysChart.data.datasets[0].data = data
                exports.AcceptDaysChart.update()
            } else {
                var ctx = document.getElementById('time-chart').getContext('2d')

                var config = {
                    type: 'line',
                    data: {
                        labels: [
                            '0',
                            '1',
                            '2',
                            '3',
                            '4',
                            '5',
                            '6',
                            '7',
                            '8',
                            '9',
                            '10',
                            '11',
                            '12',
                            '13',
                            '14',
                            '15',
                            '16',
                            '17',
                            '18',
                            '19',
                            '20',
                            '21',
                            '22',
                            '23',
                            '24'
                        ],
                        datasets: [{
                            borderColor: CONSTS.CHART_COLOR.RED,
                            data: data
                        }]
                    },
                    fill: false,
                    options: {
                        legend: {
                            display: false
                        },
                        responsive: true,
                        title: {
                            display: false
                        },
                        tooltips: {
                            mode: 'index',
                            intersect: false
                        },
                        hover: {
                            mode: 'nearest',
                            intersect: true
                        },
                        scales: {
                            xAxes: [{
                                display: true,
                                scaleLabel: {
                                    display: false
                                },
                                ticks: {
                                    min: 0,
                                    max: 22,

                                    // forces step size to be 5 units
                                    stepSize: 2
                                }
                            }]
                        }
                    }
                }

                var areaChart = new Chart(ctx, config)
                exports.AcceptDaysChart = areaChart
            }

            console.log(data)
        } catch (error) {
            fn.errorNotify(error)
        }
    }

    function ChangeDate() {
        categoryOpts.date.start = CategoryDatePicker.value.start;
        categoryOpts.date.end = CategoryDatePicker.value.end;
        LoadCategoryStatic();
    }

    function LoadCategoryStatic() {

        if (exports.mainCategoryChart) exports.mainCategoryChart.destroy()
        if (exports.subCategoryChart)
            exports.subCategoryChart.destroy()
        $categoryList.empty()

        axios
            .get(API.STATIC.CATEGORYS, {
                params: {
                    date: categoryOpts.date
                }
            })
            .then(function (result) {
                return ParseCategoryData(result.data, categoryOpts)
            })
            .then(function () {
                return RenderCategoryOptions(categoryOpts)
            })
            .then(function () {
                return axios.get(API.COMPANY.USERS)
            })
            .then(function (result) {
                if (result.status === 200) {
                    Categorys.users = result.data;
                }
                RenderCategoryStatic()
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    function ParseCategoryData(data, opts) {
        return new Promise(function (resolve, reject) {
            try {
                var categorys = {
                    programs: [],
                    exes: [],
                    datas: data[0],
                    options: opts,
                    detail: data[1]
                }

                data[0].forEach(function (item) {
                    if (categorys.programs.indexOf(item['???????????????']) < 0) {
                        categorys.programs.push(item['???????????????'])
                    }
                    if (categorys.exes.indexOf(item['????????????']) < 0) {
                        categorys.exes.push(item['????????????'])
                    }
                });

                console.log(categorys)
                exports.Categorys = categorys
                resolve()
            } catch (e) {
                reject(e)
            }
        })
    }

    function RenderCategoryOptions(opts) {
        return new Promise(function (resolve, reject) {
            try {
                $categoryProgram.empty()
                $categoryExe.empty()

                exports.Categorys.programs.forEach(function (program) {
                    $categoryProgram.append(
                        '<option value="' +
                        program +
                        '" ' + (opts.program === program ? 'selected' : '') + '>' +
                        program +
                        '</option>'
                    )
                })
                exports.Categorys.exes.forEach(function (exe) {
                    $categoryExe.append(
                        '<option value="' + exe + '" ' + (opts.exe === exe ? 'selected' : '') + '>' + exe + '</option>'
                    )
                })

                $categoryProgram.selectpicker('refresh')
                $categoryExe.selectpicker('refresh')

                resolve()
            } catch (e) {
                reject(e)
            }
        })
    }

    function RenderCategoryStatic() {
        if (exports.mainCategoryChart) exports.mainCategoryChart.destroy()
        if (exports.subCategoryChart)
            exports.subCategoryChart.destroy()
        $categoryList.empty()

        var categorys = exports.Categorys
        var options = categorys.options

        sessionStorage.setItem('categoryOpts', JSON.stringify(options))

        if (options.program === '') {
            // alert('??????????????? ??????????????????.')
            return
        } else if (options.exe === '') {
            // alert('??????????????? ??????????????????.')
            return
        }

        var data = categorys.datas.filter(function (item) {
            return (
                item['???????????????'] === options.program &&
                item['????????????'] === options.exe
            )
        })

        var dataDetails = categorys.detail.filter(function (item) {
            return (
                item['???????????????'] === options.program &&
                item['????????????'] === options.exe
            )
        })

        exports.mainCategory = []
        data.forEach(function (item) {
            var findIndex = exports.mainCategory.findIndex(function (_m) {
                return _m['?????????'] === item['?????????']
            })

            if (findIndex >= 0) {
                exports.mainCategory[findIndex]['??????'] += item['??????']
            } else {
                exports.mainCategory.push({
                    ?????????: item['?????????'],
                    ??????: item['??????']
                })
            }
        })

        exports.mainCategory.sort(function (a, b) {
            return a['??????'] > b['??????'] ? -1 : 1
        })

        var topIndex = 0
        if (exports.mainCategory[0]['?????????'] === '??????') topIndex = 1

        try {

            if (exports.mainCategoryChart) exports.mainCategoryChart.destroy()

            var canvas = document.getElementById('mainCategory-chart')
            var ctx = canvas.getContext('2d')

            var config = {
                type: 'horizontalBar',
                data: {
                    labels: exports.mainCategory.map(function (item) {
                        return item['?????????']
                    }),
                    datasets: [{
                        // borderColor: CONSTS.CHART_COLOR.RED,
                        label: '?????????',
                        backgroundColor: (function () {
                            var bc = []
                            bc[topIndex] = CONSTS.CHART_COLOR.RED
                            return bc
                        })(),
                        data: exports.mainCategory.map(function (item) {
                            return item['??????']
                        })
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: false
                    },
                    maintainAspectRatio: false,
                    onClick: function (evt, activeElements) {
                        var elementIndex = activeElements[0]._index;
                        var _this = this.data.datasets[0].backgroundColor;
                        // this.data.datasets[0].pointBackgroundColor[elementIndex] = CONSTS.CHART_COLOR.RED;
                        _this.forEach(function (value, index) {
                            _this[index] = CONSTS.CHART_COLOR.GREY;
                        });
                        _this[elementIndex] = CONSTS.CHART_COLOR.RED;
                        this.update();
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            }

            var mainCategoryChart = new Chart(ctx, config)
            exports.mainCategoryChart = mainCategoryChart

            canvas.onclick = function (event) {
                var activePoints = mainCategoryChart.getElementsAtEvent(event)

                console.log(activePoints, data)
                if (activePoints[0]) {
                    var chartData = activePoints[0]['_chart'].config.data
                    var idx = activePoints[0]['_index']

                    // activePoints[0]['_chart'].config.data.datasets.backgroundColor = [];
                    // activePoints[0]['_chart'].config.data.datasets.backgroundColor[idx] = CONSTS.CHART_COLOR.RED;

                    var label = chartData.labels[idx]
                    // var value = chartData.datasets[0].data[idx]
                    // console.log(chartData, idx, label, value);

                    var subCategory = data.filter(function (_data) {
                        return _data['?????????'] === label
                    })

                    if (exports.subCategoryChart)
                        exports.subCategoryChart.destroy()
                    var _canvas = document.getElementById('subCategory-chart')
                    var _ctx = _canvas.getContext('2d')

                    var _config = {
                        type: 'horizontalBar',
                        data: {
                            labels: subCategory.map(function (item) {
                                return item['?????????']
                            }),
                            datasets: [{
                                // borderColor: CONSTS.CHART_COLOR.RED,
                                label: '?????????',
                                backgroundColor: [],
                                data: subCategory.map(function (
                                    item
                                ) {
                                    return item['??????']
                                })
                            }]
                        },
                        options: {
                            responsive: true,
                            title: {
                                display: false
                            },
                            onClick: function (evt, activeElements) {
                                var elementIndex = activeElements[0]._index;
                                var _this = this.data.datasets[0].backgroundColor;
                                // this.data.datasets[0].pointBackgroundColor[elementIndex] = CONSTS.CHART_COLOR.RED;
                                _this.forEach(function (value, index) {
                                    _this[index] = CONSTS.CHART_COLOR.GREY;
                                });
                                _this[elementIndex] = CONSTS.CHART_COLOR.RED;
                                this.update();
                            },
                            maintainAspectRatio: false,
                            scales: {
                                xAxes: [{
                                    ticks: {
                                        beginAtZero: true
                                    }
                                }]
                            }
                        }
                    }

                    var subCategoryChart = new Chart(_ctx, _config)
                    exports.subCategoryChart = subCategoryChart

                    _canvas.onclick = function (event) {
                        var activePoints = subCategoryChart.getElementsAtEvent(event)

                        console.log(activePoints, subCategory)
                        if (activePoints[0]) {
                            $categoryList.empty()
                            var _chartData = activePoints[0]['_chart'].config.data
                            var _idx = activePoints[0]['_index']

                            // activePoints[0]['_chart'].config.data.datasets.backgroundColor = [];
                            // activePoints[0]['_chart'].config.data.datasets.backgroundColor[idx] = CONSTS.CHART_COLOR.RED;

                            var _label = _chartData.labels[_idx]
                            var selectData = dataDetails.filter(function (_data) {
                                return _data['????????????'] === label && _data['????????????'] === _label
                            });

                            selectData.forEach(function (data) {
                                var params = {
                                    index: data['?????????'],
                                    id: data['user_id'],
                                    hospnum: data['????????????']
                                }
                                var checker = Categorys.users.find(function (member) {
                                    return member['?????????'] === data['?????????']
                                }) || null
                                var processer = Categorys.users.find(function (member) {
                                    return member['?????????'] === data['?????????']
                                }) || null
                                var status = (function () {
                                    var _status = {
                                        color: 'dark',
                                        name: ''
                                    }
                                    switch (data['??????']) {
                                        case CONSTS.SERVICE_STATUS.CANCEL:
                                            _status.color = 'red';
                                            _status.name = '??????';
                                            break;
                                        case CONSTS.SERVICE_STATUS.DONE:
                                            _status.color = 'blue';
                                            _status.name = '??????';
                                            break;
                                        case CONSTS.SERVICE_STATUS.SHARE:
                                            _status.name = '??????';
                                            break;
                                        case CONSTS.SERVICE_STATUS.PROCESS:
                                            _status.name = '??????';
                                            break;
                                        case CONSTS.SERVICE_STATUS.HOLD:
                                            _status.name = '??????';
                                            break;
                                    }
                                    return _status
                                })()
                                $categoryList.append(
                                    // '<a href="/service/history/detail?' + $.param(params) + '" class="list-group-item ellipsis">' +
                                    // '   ' + data['?????????'] + ' ' + data['????????????'] +
                                    // '</a>'
                                    '         <a class="list-group-item" data-toggle="collapse" href="#service-detail-' + data['?????????'] + '" aria-expanded="false" aria-controls="service-detail-' + data['?????????'] + '" data-parent="#category-list">' +
                                    '             [' + data['?????????'] + '] ' + data['????????????'] + ' <small>' + data['????????????'] + '</small>' +
                                    '                 <span class="' + status.color + '">' + status.name + '</span>' +
                                    '         </a>' +
                                    '         <div id="service-detail-' + data['?????????'] + '" class="collapse" aria-expanded="false">' +
                                    '           <div class="panel-body">' +
                                    '              <h5>[????????????]</h5>' +
                                    data['????????????'].replace(/\n/gim, '<br>') +
                                    '               <h5>[????????????] <i class="fa fa-edit"></i>' + (checker ? checker['??????'] : '') + '</h5>' +
                                    data['????????????'].replace(/\n/gim, '<br>') +
                                    '               <h5>[????????????] <i class="fa fa-edit"></i>' + (processer ? processer['??????'] : '') + '</h5>' +
                                    data['????????????'].replace(/\n/gim, '<br>') +
                                    '           <br><a href="/service/history/detail?' + $.param(params) + '" class="btn btn-success btn-sm">?????????</a>' +
                                    '           </div>' +
                                    '         </div>'
                                )
                            })
                        }
                    }
                }
            }
        } catch (error) {
            fn.errorNotify(error)
        }
    }

    function ChangeFinderDate() {
        finderCategoryOpts.date.start = FinderCategoryDatePicker.value.start;
        finderCategoryOpts.date.end = FinderCategoryDatePicker.value.end;
        LoadFinderCategoryStatic();
    }

    function LoadFinderCategoryStatic() {

        if (finderCategoryOpts.program == '' || finderCategoryOpts.exe == '') return false;

        var axiosStatic = (function () {
            if (finderCategoryOpts.menu == '') {
                return axios.get(API.STATIC.FINDER.MENU, {
                    params: finderCategoryOpts
                })
            } else if (finderCategoryOpts.menu !== '' && finderCategoryOpts.button == '') {
                return axios.get(API.STATIC.FINDER.BUTTON, {
                    params: finderCategoryOpts
                })
            } else if (finderCategoryOpts.menu !== '' && finderCategoryOpts.button != '') {
                return axios.get(API.STATIC.FINDER.LIST, {
                    params: finderCategoryOpts
                })
            }
        })()

        axiosStatic
            .then(function (result) {
                if (finderCategoryOpts.menu == '') {
                    return RenderFinderMenuList(result.data)
                } else if (finderCategoryOpts.menu !== '' && finderCategoryOpts.button == '') {
                    return RenderFinderBtnList(result.data)
                } else if (finderCategoryOpts.menu !== '' && finderCategoryOpts.button != '') {
                    return RenderFinderDetailList(result.data)
                }
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    function RenderFinderMenuList(data) {
        console.log(data)
        var $TARGET = $finderCategoryMenu
        var $row = ''
        var total = 0
        $TARGET.empty()

        data.forEach(function (item) {
            $row = '<tr data-menu="' + item['????????????'] + '">'
            $row += '    <td>' + item['????????????'] + '</td>'
            $row += '    <td class="text-center">' + item['?????????'] + '</td>'
            $row += '</tr>'
            total += item['?????????']
            $TARGET.append($row)
        })
        $TARGET.append(
            '<tr class="bg-navy">' +
            '<th></th>' +
            '<th class="text-center">' + total + '</th>' +
            '</tr>'
        )

        $TARGET.find('tr').bind('click', function (event) {
            event.preventDefault()
            finderCategoryOpts.menu = $(this).data('menu')
            finderCategoryOpts.button = ''
            $finderCategoryList.empty()
            LoadFinderCategoryStatic()
        })
    }

    function RenderFinderBtnList(data) {
        console.log(data)
        var $TARGET = $finderCategoryButton
        var $row = ''
        var total = 0
        $TARGET.empty()
        data.forEach(function (item) {
            $row = '<tr data-button="' + item['????????????'] + '">'
            $row += '    <td>' + item['????????????'] + '</td>'
            $row += '    <td class="text-center">' + item['?????????'] + '</td>'
            $row += '</tr>'
            total += item['?????????']
            $TARGET.append($row)
        })
        $TARGET.append(
            '<tr class="bg-navy">' +
            '<th></th>' +
            '<th class="text-center">' + total + '</th>' +
            '</tr>'
        )

        $TARGET.find('tr').bind('click', function (event) {
            event.preventDefault()
            finderCategoryOpts.button = $(this).data('button')
            // finderCategoryOpts.menu = $(this).data('menu')
            LoadFinderCategoryStatic()
        })
    }

    function RenderFinderDetailList(data) {
        console.log(data)
        var $TARGET = $finderCategoryList
        var $row = ''
        var total = 0
        $TARGET.empty()
        exports.finderDetailData = data
        data.forEach(function (item) {
            if (item['?????????'] <= 0) return false
            var status = (function () {
                var _status = {
                    color: 'dark',
                    name: ''
                }
                switch (item['??????']) {
                    case CONSTS.SERVICE_STATUS.CANCEL:
                        _status.color = 'red';
                        _status.name = '??????';
                        break;
                    case CONSTS.SERVICE_STATUS.DONE:
                        _status.color = 'blue';
                        _status.name = '??????';
                        break;
                    case CONSTS.SERVICE_STATUS.SHARE:
                        _status.name = '??????';
                        break;
                    case CONSTS.SERVICE_STATUS.PROCESS:
                        _status.name = '??????';
                        break;
                    case CONSTS.SERVICE_STATUS.HOLD:
                        _status.name = '??????';
                        break;
                }
                return _status
            })()
            $row = '<tr data-index="' + item['?????????'] + '">'
            $row += '    <td class="text-center">' + item['?????????'] + '</td>'
            $row += '    <td>' + item['????????????'] + '</td>'
            $row += '    <td class="' + status.color + '">' + status.name + '</td>'
            $row += '    <td class="text-center">' + item['?????????'] + '</td>'
            $row += '</tr>'
            total += item['?????????']
            $TARGET.append($row)
        })
        $TARGET.append(
            '<tr class="bg-navy">' +
            '<th colspan="3"></th>' +
            '<th class="text-center">' + total + '</th>' +
            '</tr>'
        )

        $TARGET.find('tr').bind('click', function (event) {
            event.preventDefault()
            // finderCategoryOpts.menu = $(this).data('menu')
            showServiceDetailModal($(this).data('index'))
        })
    }

    function showServiceDetailModal(id) {
        // console.log(id)
        var $modal = $('.detail-modal')
        var $el = $modal.find('#service-detail')
        // var detailUrl = "/service/history/detail?index={{INDEX}}&id={{USERID}}&hospnum={{HOSPNUM}}"
        var target = finderDetailData.find(function (item) {
            return item['?????????'] === id
        })
        var detailData = {
            service: {},
            replys: []
        };

        $el.empty()

        loadDetail(target)

        // detailUrl = detailUrl.replace('{{INDEX}}', id)
        // detailUrl = detailUrl.replace('{{USERID}}', target['USER_ID'])
        // detailUrl = detailUrl.replace('{{HOSPNUM}}', target['????????????'])

        // $modal.find('iframe').attr('src', detailUrl)
        // $modal.modal('show')
        function loadDetail(item) {
            axios
                .get(API.SERVICE.DETAIL, {
                    params: {
                        index: item['?????????'],
                        id: item['USER_ID'],
                        hospnum: item['????????????']
                    }
                })
                .then(function (result) {
                    detailData.service = result.data[0][0] || {}
                    detailData.replys = result.data[1] || []
                    detailData.selector = result.data[7] || []
                    $modal.find('#service-title').html('[' + item['?????????'] + '] ' + item['????????????'] + '<samll class="font-bold red pull-right m-r-md">??? ??????????????????: ' + target['?????????'] + '???</b>')
                    workflowRender()
                    serviceRender()
                    replysRender()
                    selectorRender()
                    $modal.modal('show')
                })
        }

        function workflowRender() {
            var service = detailData.service;
            // var $el = _this.el.$service;
            var $WORKFLOW = '';
            $WORKFLOW += '<div>';

            if (service['??????'] >= CONSTS.SERVICE_STATUS.ACCEPT) {
                $WORKFLOW += ' <b>?????????:</b> ' + service['?????????'];
                $WORKFLOW += ' <b>?????????:</b> ' + service['?????????'] + (service['????????????'] ? '(??????: ' + service['????????????'] + ')' : '');
                $WORKFLOW += ' <b>?????????:</b> <span class="red">' + moment(service['????????????']).calendar() + '(' + moment(service['????????????']).fromNow() + ')</span>';
            }

            if (service['?????????'] !== 0) {
                $WORKFLOW += '<br>';
                $WORKFLOW += ' <b>?????????:</b> <b class="blue">' + service['????????????'] + '</b>';
                $WORKFLOW += ' <b>?????????:</b><span class="red">' + service['????????????'] + '</span>';
            }

            if (service['??????'] >= CONSTS.SERVICE_STATUS.SHARE && service['?????????'] !== 0) {
                $WORKFLOW += '<br>';
                $WORKFLOW += ' <b>?????????:</b> <b class="blue">' + (service['?????????'] !== 0 ? service['????????????'] : Data.Service.info['??????'] || '') + '</b>';
                $WORKFLOW += ' <b>?????????:</b><span class="red">' + (service['?????????'] !== 0 ? moment(service['????????????']).calendar() : '15??? ????????????') + '(' + moment(service['????????????']).fromNow() + ')</span>';
            }

            if (service['??????'] >= CONSTS.SERVICE_STATUS.PROCESS && service['?????????'] !== 0) {
                $WORKFLOW += '<br>';
                $WORKFLOW += ' <b>?????????:</b> <b class="blue">' + service['????????????'] + '</b>';
                $WORKFLOW += ' <b>?????????:</b><span class="red">' + moment(service['????????????']).calendar() + '(' + moment(service['????????????']).fromNow() + ')</span>';
            }

            if (service['??????'] >= CONSTS.SERVICE_STATUS.HOLD && service['?????????'] !== 0) {
                $WORKFLOW += '<br>';
                $WORKFLOW += ' <b>?????????:</b> <b class="blue">' + service['????????????'] + '</b>';
                $WORKFLOW += ' <b>?????????:</b><span class="red">' + moment(service['????????????']).calendar() + '(' + moment(service['????????????']).fromNow() + ')</span>';
            }

            if (service['??????'] >= CONSTS.SERVICE_STATUS.DONE && service['?????????'] !== 0) {
                $WORKFLOW += '<br>';
                $WORKFLOW += ' <b>?????????:</b> <b class="blue">' + service['????????????'] + '</b>';
                $WORKFLOW += ' <b>?????????:</b><span class="red">' + moment(service['????????????']).calendar() + '(' + moment(service['????????????']).fromNow() + ')</span>';
            }

            if (service['??????'] === 1) {
                $WORKFLOW += '<br>';
                $WORKFLOW += '<span class="badge bg-red">?????? A/S</span>';
            }
            if (service['??????'] === 1) {
                $WORKFLOW += '<br>';
                $WORKFLOW += '<span class="badge bg-blue">?????? A/S</span>';
            }

            $WORKFLOW += '<div class="ln_solid"></div>';
            $WORKFLOW += '<b>????????????:</b> ' + service['????????????'];
            $WORKFLOW += '<br>';
            $WORKFLOW += '<b class="red">??????/??????: ' + service['????????????'] + ' - ' + service['????????????'] + "</b>";
            // $WORKFLOW += '<br>';
            // $WORKFLOW += '<b>?????????:</b> ' + service['????????????'];


            $WORKFLOW += '</div>';

            $el.append($WORKFLOW);

        }

        function serviceRender() {
            var service = detailData.service;
            // var $el = _this.el.$service;
            var images = service['?????????'].trim().length > 0 ? service['?????????'].split(',') : null;

            var $COMMENT = '',
                $DIVIDELINE = '<div class="ln_solid"></div>',
                $QUESTION_TITLE = '<h5 class="font-bold"><i class="fa fa-question-circle orange"></i> ????????????</h5>',
                $QUESTION_READ = exports.fn.urlify(service['????????????'].replace(/\n/gim, '<br>')) || ' - ',
                $CONFIRM_TITLE = '<h5 class="font-bold"><i class="fa fa-info-circle blue"></i> ????????????</h5>',
                $CONFIRM_READ = exports.fn.urlify(service['????????????'].replace(/\n/gim, '<br>')) || ' - ',
                $HOLD_TITLE = '<h5 class="font-bold"><i class="fa fa-pause-circle"></i> ????????????</h5>',
                $HOLD_READ = exports.fn.urlify(service['????????????'].replace(/\n/gim, '<br>')) || ' - ',
                $PROCESS_TITLE = '<h5 class="font-bold"><i class="fa fa-check-circle green"></i> ????????????</h5>',
                $PROCESS_READ = (service['????????????'] > 0 ? '<h5 class="font-bold blue">????????????: ' + params.setting.service['????????????'][service['????????????'] - 1]['?????????'] + '</h5>' : '') + exports.fn.urlify(service['????????????'].replace(/\n/gim, '<br>')) || ' - ',
                $CANCEL_TITLE = '<h5 class="font-bold"><i class="fa fa-times-circle red"></i> ????????????</h5>',
                $CANCEL_READ = exports.fn.urlify(service['????????????'].replace(/\n/gim, '<br>')) || ' - ';
            //     $TAG_TITLE = '<h5 class="font-bold"><i class="fa fa-tag"> ??????</i></h5>';


            // var tags = service['??????'].length ? service['??????'].split('||') : [];
            // var $TAG = '';
            // if (tags.length) {
            //     tags.forEach(function (tag) {
            //         $TAG += '<div class="chip">#' + tag + '</div>'
            //     });
            // }


            $COMMENT += $DIVIDELINE + $QUESTION_TITLE + $QUESTION_READ +
                $DIVIDELINE + $CONFIRM_TITLE + $CONFIRM_READ +
                $DIVIDELINE + $PROCESS_TITLE + $PROCESS_READ +
                $DIVIDELINE + $HOLD_TITLE + $HOLD_READ +
                $DIVIDELINE + $CANCEL_TITLE + $CANCEL_READ;
            // $DIVIDELINE + $TAG_TITLE + $TAG;


            $el.append($COMMENT);

        }

        function replysRender() {
            var replys = detailData.replys;
            if (!replys.length) return false
            // var $el = _this.el.$replys;
            var $REPLYS = '';
            var $DIVIDELINE = '<div class="ln_solid"></div>';
            $REPLYS += $DIVIDELINE + '<h5 class="font-bold"><i class="fa fa-comments"></i> ??????</h5>';
            $REPLYS += '    <ul class="messages p-w-xs">';
            replys.forEach(function (reply) {
                $REPLYS += '<li>';
                $REPLYS += '    <div class="message_date">';
                $REPLYS += '        <p class="month">' + moment(reply['????????????']).fromNow() + '</p>';
                $REPLYS += '    </div>';
                $REPLYS += '    <div class="message_wrapper m-l-none m-r-none">';
                $REPLYS += '        <h5 class="heading blue"><i class="fa fa-user-circle"></i> ' + reply['????????????'] + '</h5>';
                $REPLYS += '        <p class="url">' + exports.fn.urlify(reply['??????']) + '</p>';
                $REPLYS += '    </div>';
                $REPLYS += '</li>';
            });
            $REPLYS += '    </ul>'
            $el.append($REPLYS);
        }

        function selectorRender() {
            var selectors = detailData.selector;
            if (!selectors.length) return false
            // var $el = _this.el.$replys;
            var $REPLYS = '';
            var $DIVIDELINE = '<div class="ln_solid"></div>';
            $REPLYS += $DIVIDELINE + '<h5 class="font-bold"><i class="fa fa-users"></i> ???????????? ??????</h5>';
            $REPLYS += '    <ul class="messages p-w-xs">';
            selectors.forEach(function (selector) {
                $REPLYS += '<li>';
                $REPLYS += '    <div class="message_date">';

                $REPLYS += '    </div>';
                $REPLYS += '    <div class="message_wrapper m-l-none m-r-none">';
                $REPLYS += '        <h5 class="heading blue"><i class="fa fa-user-circle"></i> ' + selector['????????????'] + '</h5>';
                $REPLYS += '        <p class="month">' + moment(selector['????????????']).fromNow() + '(' + selector['????????????'] + ')</p>';
                // $REPLYS += '        <p class="url">' + exports.fn.urlify(reply['??????']) + '</p>';
                $REPLYS += '    </div>';
                $REPLYS += '</li>';
            });
            $REPLYS += '    </ul>'
            $el.append($REPLYS);
        }
    }


    function getRandomColor() {
        var letters = '0123456789ABCDEF'
        var color = '#'
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)]
        }
        return color
    }

    Chart.plugins.register({
        afterDatasetsDraw: function (chart) {
            var ctx = chart.ctx;

            chart.data.datasets.forEach(function (dataset, i) {
                var meta = chart.getDatasetMeta(i);
                if (!meta.hidden) {
                    meta.data.forEach(function (element, index) {
                        // Draw the text in black, with the specified font
                        ctx.fillStyle = 'rgb(0, 0, 0)';

                        var fontSize = 16;
                        var fontStyle = 'normal';
                        var fontFamily = 'Helvetica Neue';
                        ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

                        // Just naively convert to string for now
                        var dataString = dataset.data[index].toString();

                        // Make sure alignment settings are correct
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        var padding = 5;
                        var position = element.tooltipPosition();
                        ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
                    });
                }
            });
        }
    });

    // ServiceStatus()
    LoadProgramStatic()
    LoadAreaStatic()
    // LoadExeStatic()
    // LoadAcceptDaysStatic()
    // LoadCategoryStatic()
})(window)
