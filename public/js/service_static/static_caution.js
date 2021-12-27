(function (exports) {
    'use strict'

    // declare element & variable
    const $MONTHPICKER = $('.monthpicker');
    const $HOSPITALPICKER = $('.caution-hospital');
    const $SEARCHBTN = $('.search-btn');
    const $TABLE = $('table.neo-static');
    const $TABLEHEADER = $TABLE.find('thead');
    const $TABLEBODY = $TABLE.find('tbody');

    const options = {
        hospital: null,
        month: moment().format('YYYY-MM'),
        originData: [],
        parsedData: [],
        sort: {
            field: '연속일',
            order: 'desc'
        }
    }

    $HOSPITALPICKER.bind('changed.bs.select', function (event) {
        options.hospital = $(this).selectpicker('val');
        filterData();
    });

    // init element events
    $MONTHPICKER
        .datetimepicker({
            viewMode: $MONTHPICKER.data('viewMode'),
            format: $MONTHPICKER.data('format'),
            ignoreReadonly: true,
            defaultDate: moment().format()
        })
        .bind('dp.change', function (event) {
            options.month = event.date.format('YYYY-MM');
        });

    $SEARCHBTN.bind('click', function (event) {
        Load();
    });

    $TABLEHEADER.find('th').bind('click', function (event) {
        var $THIS = $(this);
        var $SORTICON = $THIS.find('i.sort');
        if (!$THIS.data('field')) return false;

        if ($SORTICON.length) {
            $SORTICON.toggleClass('fa-sort-amount-asc fa-sort-amount-desc');
            options.sort.order = options.sort.order === 'asc' ? 'desc' : 'asc';
        } else {
            $THIS.siblings().find('i.sort').remove();
            $THIS.append('<i class="m-l-xs fa sort fa-sort-amount-asc"></i>');
            options.sort.field = $THIS.data('field');
            options.sort.order = 'asc';
        }

        // sessionStorage.setItem('historySort', JSON.stringify(sort))

        sortData()
            .then(function () {
                renderData();
            })
    });

    function Load() {
        options.originData = [];
        options.parsedData = [];
        options.filterData = null;
        axios
            .get(API.STATIC.CAUTION, {
                params: {
                    hospital: options.hospital,
                    month: options.month
                }
            })
            .then(function (result) {
                console.log(result)
                options.originData = result.data
                return parsingData();
            })
            .then(function () {
                return sortData();
            })
            .then(function () {
                renderData();
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    function parsingData() {
        return new Promise(function (resolve, reject) {
            try {
                const originData = options.originData;
                const hospItemTemplate = {
                    기관코드: '',
                    기관명칭: '',
                    건수: 0,
                    연속리스트: [],
                    연속일: 0,
                    처리시간: [],
                    평균시간: "",
                    처리율: '',
                    신규: 0,
                    유형: 0
                }
                originData.forEach(function (item) {
                    let hospItem = options.parsedData.find(function (hosp) {
                        return hosp['기관코드'] === item['기관코드']
                    });
                    if (!hospItem) {
                        hospItem = window.fn.cloneObject(hospItemTemplate);
                        hospItem['기관코드'] = item['기관코드'];
                        hospItem['기관명칭'] = item['기관명칭'];
                        options.parsedData.push(hospItem);
                    }
                    hospItem['건수'] += 1;

                    if (hospItem['연속리스트'].length == 0) {
                        hospItem['연속리스트'].push(item['접수일자'])
                    } else {
                        const prevDate = moment(hospItem['연속리스트'][hospItem['연속리스트'].length - 1])
                        const thisDate = moment(item['접수일자'])

                        if (thisDate.subtract(1, 'days').format('YYYY-MM-DD') === prevDate.format('YYYY-MM-DD')) {
                            hospItem['연속리스트'].push(item['접수일자'])
                        } else if (prevDate.format('YYYY-MM-DD') !== moment(item['접수일자']).format('YYYY-MM-DD')) {
                            hospItem['연속일'] = hospItem['연속일'] >= hospItem['연속리스트'].length ? hospItem['연속일'] : hospItem['연속리스트'].length;
                            hospItem['연속리스트'] = [];
                            hospItem['연속리스트'].push(item['접수일자']);
                        }
                    }

                    if (!hospItem[item['실행파일']]) {
                        hospItem[item['실행파일']] = 1;
                    } else {
                        hospItem[item['실행파일']] += 1;
                    }

                    if (item['완료일자'].length) {
                        const end = moment(item['접수일자']);
                        const start = moment(item['완료일자']);
                        hospItem['처리시간'].push(start.diff(end, 'minutes'));
                        hospItem['평균시간'] = Math.ceil(hospItem['처리시간'].reduce((a, b) => a + b, 0) / hospItem['처리시간'].length);
                        if (hospItem['평균시간'] >= 60) {
                            if (hospItem['평균시간'] / 60 >= 24) {
                                hospItem['평균시간'] = Math.ceil(hospItem['평균시간'] / 60 / 24) + '일';
                            } else {
                                hospItem['평균시간'] = Math.ceil(hospItem['평균시간'] / 60) + '시간';
                            }
                        } else {
                            hospItem['평균시간'] += '분';
                        }
                    }
                    hospItem['처리율'] = Math.round(hospItem['처리시간'].length / hospItem['건수'] * 100) + '%';
                    hospItem['신규'] = item['신규'];
                    hospItem['유형'] = item['병원유형'];
                    hospItem['프로그램'] = item['프로그램'];

                });
                console.log(options.parsedData);
                resolve();
            } catch (error) {
                reject(error)
            }
        });
    }

    function sortData() {
        return new Promise(function (resolve, reject) {
            try {

                options.parsedData = options.parsedData.sort(function (a, b) {
                    let _a = a[options.sort.field];
                    let _b = b[options.sort.field];

                    if (options.sort.field === '평균시간') {

                        if (_a.indexOf('시간')) { _a = parseInt(_a.replace('시간', '')) * 60 }
                        else if (_a.indexOf('일')) { _a = parseInt(_a.replace('일', '')) * 24 * 60 }
                        else { _a = parseInt(_a.replace('분', '')) }

                        if (_b.indexOf('시간')) { _b = parseInt(_b.replace('시간', '')) * 60 }
                        else if (_b.indexOf('일')) { _b = parseInt(_b.replace('일', '')) * 24 * 60 }
                        else { _b = parseInt(_b.replace('분', '')) }
                    } else if (options.sort.field === '처리율') {
                        _a = parseInt(_a.replace('%', ''))
                        _b = parseInt(_b.replace('%', ''))
                    }

                    if (options.sort.order === 'asc') {
                        return (_a > _b) ? 1 : ((_a < _b) ? -1 : 0);
                    } else {
                        return (_b > _a) ? 1 : ((_b < _a) ? -1 : 0);
                    }

                })

                resolve();
            } catch (error) {
                reject(error);
            }
        })
    }

    function filterData() {
        options.filterData = options.parsedData.filter(function (item) {
            return item['기관코드'] === options.hospital
        });
        renderData();
    }

    function renderData() {
        // $TABLEHEADER.empty();
        const data = options.filterData || options.parsedData

        $TABLEBODY.empty();

        data.forEach(function (item, index) {
            $HOSPITALPICKER.append(`<option value="${item['기관코드']}">${item['기관명칭']}</option>`)
            $TABLEBODY.append(addRow(item, index));
        });
        $HOSPITALPICKER.selectpicker('refresh')

        function addRow(item, index) {
            return `
                <tr>
                    <th>${index + 1}</th>
                    <td>${item['기관코드']}</td>
                    <td>${item['기관명칭']}</td>
                    <td>${EMR(item['프로그램']).name}</td>
                    <td>${item['신규'] <= 3 ? '<span class="badge bg-red">NEW</span>' : ''}</td>
                    <td>${(function () {
                    if (item["유형"] == 0) {
                        return '<span class="badge">보통</span>';
                    } else if (item["유형"] == 1) {
                        return '<span class="badge bg-blue">우수</span>';
                    } else {
                        return '<span class="badge bg-red">주의</span>';
                    }
                })()}</td>
                    <td>${item['연속일']}</td>
                    <td>${item['평균시간']}</td>
                    <td>${item['처리율']}</td>
                    <td>${item['데스크'] ? item['데스크'] : 0}</td>
                    <td>${item['입원수납'] ? item['입원수납'] : 0}</td>
                    <td>${item['청구심사'] ? item['청구심사'] : 0}</td>
                    <td>${item['진료실'] ? item['진료실'] : 0}</td>
                    <td>${item['병동'] ? item['병동'] : 0}</td>
                    <td>${item['진료지원'] ? item['진료지원'] : 0}</td>
                    <td>${item['병원관리'] ? item['병원관리'] : 0}</td>
                    <td>${item['문서관리'] ? item['문서관리'] : 0}</td>
                    <td>${item['통계'] ? item['통계'] : 0}</td>
                    <td>${item['메인'] ? item['메인'] : 0}</td>
                    <td>${item['부가서비스'] ? item['부가서비스'] : 0}</td>
                    <td>${item['기타'] ? item['기타'] : 0}</td>
                    <td>${item['건수']}</td>
                </tr>
            `
        }

    }

})(window);
