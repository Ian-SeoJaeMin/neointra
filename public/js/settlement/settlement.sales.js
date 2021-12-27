(function (exports) {

    var $SALESTABLE = $('#sales-table');
    var $STATICPROGRAMTABLE = $('#static-program');
    var $STATICGWATABLE = $('#static-gwa');
    var $SALESADD = $('#sales-add');

    var $modal = $('#sales-modal');

    var $DATEPICKER = $('.datepicker');
    var $AREA = $('select.areas');
    var $SEARCH_AREA = $('select.areas:eq(0)');
    var $SEARCH_MANAGER = $('select.managers:eq(0)');
    var $SEARCH_TYPE = $('select#sales-type');
    var $MANAGER = $('select.managers');
    var $SEARCHHOSPITAL = $('#hospname');
    var $FORM = $('#sales-add-form');

    var salesData = null;
    var isAdmin = false;

    isAdmin = params.user['설정']['정산'] && params.user['설정']['정산'] === 1;
    isAdmin = params.user['설정'].admin && params.user['설정'].admin == 1;

    isAdmin = params.user['인덱스'] == 5 || params.user['인덱스'] == 43 ? false : true;


    $SALESADD.bind('click', function (event) {
        $modal.modal('show');
    });

    $DATEPICKER.each(function (i, v) {
        $(v).datetimepicker({
            format: $(v).data('format'),
            defaultDate: moment().format(),
            showTodayButton: true,
            ignoreReadonly: true,
            keepOpen: true,
            viewMode: $(v).data('viewmode')
        }).bind('dp.change', function (event) {
            if (i === 0) {
                Load();
            } else if (i === 1) {
                LoadStatic(event.date.format('YYYY'));
            }
        });
    });

    $AREA.bind('changed.bs.select', function (event) {
        if ($(this).selectpicker('val') === '0000') {
            $MANAGER.selectpicker('show');
        } else {
            $MANAGER.selectpicker('hide');
        }
    });

    $SEARCH_AREA.bind('changed.bs.select', function (event) {
        Load();
        LoadStatic();
    });
    $SEARCH_MANAGER.bind('changed.bs.select', function (event) {
        Load();
    });
    $SEARCH_TYPE.bind('changed.bs.select', function (event) {
        Load();
    });

    $SALESTABLE.bind('click', function (event) {
        // event.stopPropagation();
        var $THIS = null;
        if (event.target.tagName === 'BUTTON') {
            $THIS = $(event.target);

            if ($THIS.hasClass('btn-primary')) {
                editSaleInfo($THIS.data('index'));
            } else if ($THIS.hasClass('btn-danger')) {

                swal({
                    title: '매출정보 삭제',
                    text: '정말로 삭제하시겠습니까?',
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33'
                }).then(function () {
                    deleteSale($THIS.data('index'));
                }, function (dismiss) {
                    console.log(dismiss);
                })
            }
        }
    });

    exports.fn.init_area($AREA, null, true)
        .then(function () {


            if (params.user['지사코드'] !== '0000') {
                $MANAGER.selectpicker('hide');
            }
            return exports.fn.init_manage($MANAGER, null, true);
        })
        .then(function () {

            Load();
            LoadStatic();
        })
        .catch(function (e) {
            console.log(e);
        })



    $SEARCHHOSPITAL.selectpicker({
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
                emptyTitle: '병원코드, 명칭으로 검색...'
            },
            preprocessData: function (data) {

                var hosps = [];
                data.forEach(function (hosp) {
                    // hosps[hosp['ID']] = hosp['기관명칭'];
                    // console.log(hosp);

                    hosps.push({
                        'value': Object.values(hosp).join('|'),
                        'text': hosp['기관명칭'] + '/' + hosp['담당지사'] + (hosp['담당자'].trim().length > 0 ? '/' + hosp['담당자'] : ''),
                        'disabled': false
                    })
                });

                return hosps;
            },
            preserveSelected: false
        }).bind('changed.bs.select', function (event) {
            // console.log($(this).selectpicker('val'));
            var selectedHosp = $(this).selectpicker('val');
            if (selectedHosp) {
                selectedHosp = selectedHosp.split('|');
                $FORM.find('[data-name="진료과목"]').selectpicker('val', selectedHosp[8]);
                selectedHosp[7] = selectedHosp[7] === 'SENSE' ? 'SenseChart' : selectedHosp[7];
                $FORM.find('[data-name="주프로그램"]').selectpicker('val', selectedHosp[7]);

                $FORM.find('[data-name="지사"]').selectpicker('val', selectedHosp[4])
                $FORM.find('[data-name="지사"]').trigger('changed.bs.select');

                if (selectedHosp[4] !== '') {
                    $FORM.find('[data-name="담당자"]').selectpicker('val', selectedHosp[6]);
                }
            }
            // $(this).selectpicker('val', selectedHosp[2]);
        })

    $FORM.bind('submit', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        var body = {
            index: $FORM.find('#id').val(),
            hospname: $FORM.find('#hospname').selectpicker('val'),
            jingwa: $FORM.find('#gwa').selectpicker('val') || '',
            program: $FORM.find('#program').selectpicker('val'),
            subProgram: $FORM.find('#subprogram').selectpicker('val') || '',
            area: $FORM.find('#area').selectpicker('val'),
            manager: $FORM.find('#manager').selectpicker('val') || 0,
            saleMonth: $FORM.find('[data-name="매출월"]').datetimepicker('date').format('YYYY-MM'),
            contractDate: $FORM.find('[data-name="계약일"]').datetimepicker('date').format('YYYY-MM-DD'),
            installFee: $FORM.find('[data-name="설치비"]').val(),
            asFee: $FORM.find('[data-name="유지보수"]').val(),
            hwFee: $FORM.find('[data-name="하드웨어"]').val(),
            bigo: $FORM.find('[data-name="비고"]').val().replace(/\n/gim, '<br>')
        };

        body.hospname = body.hospname.split('|')[2];


        if (!$.isNumeric(body.index)) {
            axios.post(API.SETTLEMENT.SALE, body)
                .then(function (result) {
                    $modal.modal('hide');
                    Load();
                })
                .catch(function (error) {
                    console.log(error);
                })
        } else {

            axios.put(API.SETTLEMENT.SALE, body)
                .then(function (result) {
                    $modal.modal('hide');
                    Load();
                })
                .catch(function (error) {
                    console.log(error);
                })
        }

    });


    $('#export').bind('click', function (event) {
        event.preventDefault();

        if ($SALESTABLE.find('tbody').find('tr').length <= 0) {
            return false;
        }

        //getting data from our table
        var data_type = 'data:application/vnd.ms-excel';
        var table_div = $SALESTABLE.clone();

        table_div.removeClass('table table-hover').attr('border', 1);
        table_div.find('button').remove();
        table_div.find('input').each(function (i, v) {
            $(v).closest('td').text($(v).val().trim());
            $(v).remove();
        });


        var table_html = table_div[0].outerHTML.replace(/ /g, '%20');
        var a = document.createElement('a');
        a.href = data_type + ', ' + table_html;
        a.download = '신규매출_' + exports.params.areas.find(function (area) {
            return area['지사코드'] == $SEARCH_AREA.selectpicker('val');
        })['지사명'] + '_' + $($DATEPICKER[0]).val() + '.xls';

        a.click();

    });



    function Load() {
        var params = {
            saleMonth: $('.datepicker:eq(0)').datetimepicker('date').format('YYYY-MM'),
            area: $('select.areas:eq(0)').selectpicker('val'),
            manager: $('select.managers:eq(0)').selectpicker('val'),
            type: $SEARCH_TYPE.selectpicker('val')
        };

        salesData = null;
        axios.get(API.SETTLEMENT.SALE, {
                params: params
            })
            .then(function (result) {
                salesData = result.data;
                Render(result.data);
            })
            .catch(function (error) {
                console.log(error);
            })

    }

    function Render(data) {

        var $LIST = $SALESTABLE.find('tbody');
        var $ROW = '';
        var total = {
            install: 0,
            as: 0,
            hw: 0,
            total: 0
        };
        $LIST.empty();

        data.forEach(function (item, index) {
            $ROW = '';
            $ROW += '<tr>';
            $ROW += '    <th class="text-center">' + (index + 1) + '</th>';
            $ROW += '    <td>' + item['기관명칭'] + '</td>';
            $ROW += '    <td>' + item['진료과'] + '</td>';
            $ROW += '    <td class="text-center">' + item['주프로그램'] + '</td>';
            $ROW += '    <td>' + item['프로그램'] + '</td>';
            $ROW += '    <td>' + item['지사명'] + '(' + (item['담당자명'] || '-') + ')</td>';
            $ROW += '    <td class="text-center">' + item['매출월'] + '</td>';
            $ROW += '    <td class="text-center">' + item['계약일'] + '</td>';
            $ROW += '    <td class="text-right">' + item['설치비'].toLocaleString() + '</td>';
            $ROW += '    <td class="text-right">' + item['유지보수'].toLocaleString() + '</td>';
            $ROW += '    <td class="text-right">' + item['하드웨어'].toLocaleString() + '</td>';
            $ROW += '    <td>' + item['비고'] + '</td>';
            if (isAdmin) {
                $ROW += '    <td class="text-center"><button class="btn btn-sm btn-primary m-b-none" data-index="' + item['인덱스'] + '">수정</button><button class="btn btn-sm btn-danger m-b-none" data-index="' + item['인덱스'] + '">삭제</button></td>';
            } else {
                $ROW += '    <td></td>';
            }
            $ROW += '</tr>';
            $LIST.append($ROW);

            total.install += item['설치비'];
            total.as += item['유지보수'];
            total.hw += item['하드웨어'];
        });

        total.total = total.install + total.as + total.hw;
        $ROW = '';
        $ROW += '<tr class="bg-success font-bold">';
        $ROW += '    <th colspan="8">합계</th>';
        $ROW += '    <td class="text-right">' + total.install.toLocaleString() + '</td>';
        $ROW += '    <td class="text-right">+ ' + total.as.toLocaleString() + '</td>';
        $ROW += '    <td class="text-right">+ ' + total.hw.toLocaleString() + '</td>';
        $ROW += '    <td> = ' + total.total.toLocaleString() + '</td>';
        $ROW += '    <td></td>';
        $ROW += '</tr>';
        $LIST.append($ROW);
    }


    function editSaleInfo(index) {
        var saleData = salesData.find(function (item) {
            return item['인덱스'] == index;
        });

        if (saleData) {

            $FORM.find('#id').val(saleData['인덱스']);

            var hospData = '||' + saleData['기관명칭'] + '|' +
                saleData['지사명'] + '|' +
                saleData['지사'] + '|' +
                saleData['담당자명'] + '|' +
                saleData['담당자'] + '|' +
                saleData['주프로그램'] + '|' +
                saleData['진료과'] + '|';

            $FORM.find('#hospname').val(hospData).append(
                '<option value="' + hospData + '" selected>' + saleData['기관명칭'] + '</option>'
            ).selectpicker('refresh').selectpicker('val', hospData).trigger('change');


            $FORM.find('[data-name="매출월"]').data('DateTimePicker').date(saleData['매출월']);
            $FORM.find('[data-name="계약일"]').data('DateTimePicker').date(saleData['계약일']);
            $FORM.find('[data-name="설치비"]').val(saleData['설치비']);
            $FORM.find('[data-name="유지보수"]').val(saleData['유지보수']);
            $FORM.find('[data-name="하드웨어"]').val(saleData['하드웨어']);
            $FORM.find('[data-name="비고"]').val(saleData['비고'].replace(/<br>/gim, '\n'));

            $modal.modal('show');
        }

    }

    function deleteSale(index) {
        axios.delete(API.SETTLEMENT.SALE, {
                data: {
                    index: index
                }
            })
            .then(function (result) {
                Load();
            })
            .catch(function (error) {
                console.log(error);
                Load();
            })

    }

    function LoadStatic(year) {
        axios.get(API.SETTLEMENT.SALESTATIC, {
                params: {
                    year: year || $('.datepicker:eq(0)').datetimepicker('date').format('YYYY'),
                    area: $('select.areas:eq(0)').selectpicker('val')
                }
            })
            .then(function (result) {
                console.log(result.data);
                RenderStaticByProgram(result.data);
                RenderStaticByGwa(result.data);
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    function RenderStaticByProgram(data) {
        var $ROW = '';
        var row = {},
            total = {};
        var counter = 0;
        var $LIST = $STATICPROGRAMTABLE.find('tbody');
        $LIST.empty();
        total = {
            'SenseChart': 0,
            'SenseChart_H': 0,
            // '센스라이트': 0,
            'MediChart': 0,
            'Eplus': 0,
            'EChart': 0,
            'HanimacPro': 0,
            '홈페이지': 0,
            '합계': 0
        };
        for (var i = 1; i <= 12; i++) {
            row = {
                month: i < 10 ? '0' + i : i + "",
                'SenseChart': 0,
                'SenseChart_H': 0,
                // '센스라이트': 0,
                'MediChart': 0,
                'Eplus': 0,
                'EChart': 0,
                'HanimacPro': 0,
                '홈페이지': 0,
                '합계': 0
            };

            data.forEach(function (item) {
                if (item['매출월'] === row.month) {
                    row[item['주프로그램']]++;
                    row['합계']++;
                    total[item['주프로그램']]++;
                    total['합계']++;
                }
            });

            $ROW = '';
            $ROW += '<tr>';
            $ROW += '   <th class="text-center">' + i + '월</th>';
            $ROW += '   <td class="text-right"><button class="btn btn-link btn-xs settle-program" data-program="SenseChart" data-month="' + row.month + '">' + (row['SenseChart'] > 0 ? row['SenseChart'] : '-') + '</button></td>';
            $ROW += '   <td class="text-right"><button class="btn btn-link btn-xs settle-program" data-program="SenseChart_H" data-month="' + row.month + '">' + (row['SenseChart_H'] > 0 ? row['SenseChart_H'] : '-') + '</td>';
            // $ROW += '   <td class="text-right">' + (row['센스라이트'] > 0 ? row['센스라이트'] : '-') + '</td>';
            $ROW += '   <td class="text-right"><button class="btn btn-link btn-xs settle-program" data-program="MediChart" data-month="' + row.month + '">' + (row['MediChart'] > 0 ? row['MediChart'] : '-') + '</td>';
            $ROW += '   <td class="text-right"><button class="btn btn-link btn-xs settle-program" data-program="Eplus" data-month="' + row.month + '">' + (row['Eplus'] > 0 ? row['Eplus'] : '-') + '</td>';
            $ROW += '   <td class="text-right"><button class="btn btn-link btn-xs settle-program" data-program="EChart" data-month="' + row.month + '">' + (row['EChart'] > 0 ? row['EChart'] : '-') + '</td>';
            $ROW += '   <td class="text-right"><button class="btn btn-link btn-xs settle-program" data-program="HanimacPro" data-month="' + row.month + '">' + (row['HanimacPro'] > 0 ? row['HanimacPro'] : '-') + '</td>';
            $ROW += '   <td class="text-right"><button class="btn btn-link btn-xs settle-program" data-program="홈페이지" data-month="' + row.month + '">' + (row['홈페이지'] > 0 ? row['홈페이지'] : '-') + '</td>';
            $ROW += '   <th class="text-right bg-success">' + (row['합계'] > 0 ? row['합계'] : '-') + '</th>';
            $ROW += '</tr>';
            $LIST.append($ROW);
        }

        $ROW = '';
        $ROW += '<tr class="bg-success">';
        $ROW += '   <th class="text-center">합계</th>';
        $ROW += '   <td class="text-right">' + (total['SenseChart'] > 0 ? total['SenseChart'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['SenseChart_H'] > 0 ? total['SenseChart_H'] : '-') + '</td>';
        // $ROW += '   <td class="text-right">' + (total['센스라이트'] > 0 ? total['센스라이트'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['MediChart'] > 0 ? total['MediChart'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['Eplus'] > 0 ? total['Eplus'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['EChart'] > 0 ? total['EChart'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['HanimacPro'] > 0 ? total['HanimacPro'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['홈페이지'] > 0 ? total['홈페이지'] : '-') + '</td>';
        $ROW += '   <th class="text-right">' + (total['합계'] > 0 ? total['합계'] : '-') + '</th>';
        $ROW += '</tr>';
        $LIST.append($ROW);

        $($LIST.find('.settle-program')).bind('click', function (event) {
            var month = $(this).data('month') + '',
                program = $(this).data('program')

            var filtered = data.filter(function (item) {
                return item['주프로그램'] === program && item['매출월'] === month
            })

            $('#sales-program-table>tbody').empty();

            filtered.forEach(function (item, index) {
                $ROW = '';
                $ROW += '<tr>';
                $ROW += '    <th class="text-center">' + (index + 1) + '</th>';
                $ROW += '    <td>' + item['기관명칭'] + '</td>';
                $ROW += '    <td>' + item['진료과'] + '</td>';
                $ROW += '    <td class="text-center">' + item['주프로그램'] + '</td>';
                $ROW += '    <td>' + item['지사명'] + '</td>';
                $ROW += '    <td class="text-center">' + item['매출월'] + '</td>';
                $ROW += '    <td class="text-center">' + item['계약일'] + '</td>';
                $ROW += '    <td class="text-right">' + item['설치비'].toLocaleString() + '</td>';
                $ROW += '    <td class="text-right">' + item['유지보수'].toLocaleString() + '</td>';
                $ROW += '    <td class="text-right">' + item['하드웨어'].toLocaleString() + '</td>';

                $ROW += '</tr>';
                $('#sales-program-table>tbody').append($ROW);

                // total.install += item['설치비'];
                // total.as += item['유지보수'];
                // total.hw += item['하드웨어'];
            });
        })
    }

    function RenderStaticByGwa(data) {
        var $ROW = '';
        var row = {},
            total = {};
        var counter = 0;
        var $LIST = $STATICGWATABLE.find('tbody');
        $LIST.empty();
        total = {
            '병원': 0,
            '요양병원': 0,
            '내과': 0,
            '신경과': 0,
            '정신과': 0,
            '일반외과': 0,
            '정형외과': 0,
            '신경외과': 0,
            '흉부외과': 0,
            '성형외과': 0,
            '마취과': 0,
            '산부인과': 0,
            '소아과': 0,
            '안과': 0,
            '이비인후과': 0,
            '피부과': 0,
            '비뇨기과': 0,
            '방사선과': 0,
            '임상병리과': 0,
            '재활의학과': 0,
            '가정의학과': 0,
            '일반과': 0,
            '한방과': 0,
            '합계': 0
        };
        for (var i = 1; i <= 12; i++) {
            row = {
                month: '0' + i,
                '병원': 0,
                '요양병원': 0,
                '내과': 0,
                '신경과': 0,
                '정신과': 0,
                '일반외과': 0,
                '정형외과': 0,
                '신경외과': 0,
                '흉부외과': 0,
                '성형외과': 0,
                '마취과': 0,
                '산부인과': 0,
                '소아과': 0,
                '안과': 0,
                '이비인후과': 0,
                '피부과': 0,
                '비뇨기과': 0,
                '방사선과': 0,
                '임상병리과': 0,
                '재활의학과': 0,
                '가정의학과': 0,
                '일반과': 0,
                '한방과': 0,
                '합계': 0
            };

            data.forEach(function (item) {
                if (item['매출월'] === row.month) {
                    row[item['진료과']]++;
                    row['합계']++;
                    total[item['진료과']]++;
                    total['합계']++;
                }
            });

            $ROW = '';
            $ROW += '<tr>';
            $ROW += '   <th class="text-center">' + i + '월</th>';
            $ROW += '   <td class="text-right">' + (row['병원'] > 0 ? row['병원'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['요양병원'] > 0 ? row['요양병원'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['내과'] > 0 ? row['내과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['신경과'] > 0 ? row['신경과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['정신과'] > 0 ? row['정신과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['일반외과'] > 0 ? row['일반외과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['정형외과'] > 0 ? row['정형외과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['신경외과'] > 0 ? row['신경외과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['흉부외과'] > 0 ? row['흉부외과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['성형외과'] > 0 ? row['성형외과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['마취과'] > 0 ? row['마취과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['산부인과'] > 0 ? row['산부인과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['소아과'] > 0 ? row['소아과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['안과'] > 0 ? row['안과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['이비인후과'] > 0 ? row['이비인후과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['피부과'] > 0 ? row['피부과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['비뇨기과'] > 0 ? row['비뇨기과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['방사선과'] > 0 ? row['방사선과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['임상병리과'] > 0 ? row['임상병리과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['재활의학과'] > 0 ? row['재활의학과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['가정의학과'] > 0 ? row['가정의학과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['일반과'] > 0 ? row['일반과'] : '-') + '</td>';
            $ROW += '   <td class="text-right">' + (row['한방과'] > 0 ? row['한방과'] : '-') + '</td>';
            $ROW += '   <th class="text-right bg-success">' + (row['합계'] > 0 ? row['합계'] : '-') + '</th>';
            $ROW += '</tr>';
            $LIST.append($ROW);
        }

        $ROW = '';
        $ROW += '<tr class="bg-success">';
        $ROW += '   <th class="text-center">합계</th>';
        $ROW += '   <td class="text-right">' + (total['병원'] > 0 ? total['병원'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['요양병원'] > 0 ? total['요양병원'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['내과'] > 0 ? total['내과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['신경과'] > 0 ? total['신경과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['정신과'] > 0 ? total['정신과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['일반외과'] > 0 ? total['일반외과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['정형외과'] > 0 ? total['정형외과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['신경외과'] > 0 ? total['신경외과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['흉부외과'] > 0 ? total['흉부외과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['성형외과'] > 0 ? total['성형외과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['마취과'] > 0 ? total['마취과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['산부인과'] > 0 ? total['산부인과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['소아과'] > 0 ? total['소아과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['안과'] > 0 ? total['안과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['이비인후과'] > 0 ? total['이비인후과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['피부과'] > 0 ? total['피부과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['비뇨기과'] > 0 ? total['비뇨기과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['방사선과'] > 0 ? total['방사선과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['임상병리과'] > 0 ? total['임상병리과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['재활의학과'] > 0 ? total['재활의학과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['가정의학과'] > 0 ? total['가정의학과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['일반과'] > 0 ? total['일반과'] : '-') + '</td>';
        $ROW += '   <td class="text-right">' + (total['한방과'] > 0 ? total['한방과'] : '-') + '</td>';
        $ROW += '   <th class="text-right">' + (total['합계'] > 0 ? total['합계'] : '-') + '</th>';
        $ROW += '</tr>';
        $LIST.append($ROW);
    }

})(window);
