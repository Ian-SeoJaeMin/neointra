(function (exports) {

    'use strict';

    var $MONTHPICKER = $('.monthpicker');
    var $DATEPICKER = $('.datepicker');
    var $FEETABLE = $('.fee-table');

    var $FEEDAYS = $FEETABLE.filter('.fee-daily');
    var $FEEMONTH = $FEETABLE.filter('.fee-monthly');

    // var $FEEARAE = $FEEMONTH.filter('[data-fee="area"]');
    // var $FEEMEMBER = $FEEMONTH.filter('[data-fee="member-area"]');
    // var $FEEMEMBERMANAGER = $FEEMONTH.filter('[data-fee="member-manager"]');
    // var $FEEMANAGER = $FEEMONTH.filter('[data-fee="manager"]');
    var $FEEARAE, $FEEMEMBER, $FEEMEMBERMANAGER, $FEEMANAGER;

    var $FEEPRINT = $('#fee-print');
    var $FEEPRINTBTN = $('.fee-print-btn');
    var $FEEPRINT_MONTH = $('.fee-print-container[data-fee="month"]').find('tbody#fee-print');


    $MONTHPICKER.datetimepicker({
        viewMode: 'months',
        format: 'YYYY년MM월',
        ignoreReadonly: true,
        showTodayButton: true,
        defaultDate: moment().format()
    }).bind('dp.change', function (event) {
        // LoadProgramStatic();
        LoadServiceFee();
    });

    $DATEPICKER.datetimepicker({
        viewMode: 'days',
        format: 'YYYY년MM월DD일',
        ignoreReadonly: true,
        showTodayButton: true,
        defaultDate: moment().format()
    }).bind('dp.change', function (event) {
        // LoadProgramStatic();
        // LoadServiceFee();
        LoadServiceFee('days');
    });

    $FEEPRINTBTN.bind('click', function (event) {
        event.preventDefault();
        var type = $(this).data('fee');
        // $FEEPRINT = $('.fee-print-container[data-fee="days"]').find('tbody#fee-print')
        //getting data from our table
        var data_type = 'data:application/vnd.ms-excel';
        var table_div = $('.fee-print-container[data-fee="' + type + '"]');
        var table_html = table_div[0].outerHTML.replace(/ /g, '%20');
        var a = document.createElement('a');
        a.href = data_type + ', ' + table_html;
        a.download = 'AS수수료_' + (type === 'days' ? $DATEPICKER.data('DateTimePicker').date().format('YYYY-MM-DD') : $MONTHPICKER.data('DateTimePicker').date().format('YYYY-MM')) + '_' + Math.floor((Math.random() * 9999999) + 1000000) + '.xls';
        a.click();

    });

    $FEEPRINT_MONTH.bind('click', function (event) {
        var $ROW = $(event.target).closest('tr');
        var index = $ROW.find('td:eq(0)').text().trim();
        var hospnum = $ROW.find('td:eq(1)').text().trim();
        var user_id = $ROW.find('td').last().text();
        if ($.isNumeric(index)) {
            location.href = '/service/history/detail?index=' + index + '&id=' + user_id + '&hospnum=' + hospnum;
        }
    });


    function LoadServiceFee(type) {

        var params = type === 'days' ? { date: $DATEPICKER.data('DateTimePicker').date().format('YYYY-MM-DD') } : { month: $MONTHPICKER.data('DateTimePicker').date().format('YYYY-MM') };


        axios.get(API.STATIC.FEE, {
            params: params
        })
            .then(function (result) {
                console.log(result);
                // RenderProgramChart(result.data);
                RenderFeeTable(type, result.data);
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })
    }

    function RenderFeeTable(type, data) {
        if (type === 'days') {
            $FEEDAYS.empty();
            $FEEARAE = $FEEDAYS.filter('[data-fee="area"]');
            $FEEMEMBER = $FEEDAYS.filter('[data-fee="member-area"]');
            $FEEMEMBERMANAGER = $FEEDAYS.filter('[data-fee="member-manager"]');
            $FEEMANAGER = $FEEDAYS.filter('[data-fee="manager"]');
            $FEEPRINT = $('.fee-print-container[data-fee="days"]').find('tbody#fee-print')
            $FEEPRINT.empty();
        } else {
            $FEEMONTH.empty();
            $FEEARAE = $FEEMONTH.filter('[data-fee="area"]');
            $FEEMEMBER = $FEEMONTH.filter('[data-fee="member-area"]');
            $FEEMEMBERMANAGER = $FEEMONTH.filter('[data-fee="member-manager"]');
            $FEEMANAGER = $FEEMONTH.filter('[data-fee="manager"]');
            $FEEPRINT = $('.fee-print-container[data-fee="month"]').find('tbody#fee-print')
            $FEEPRINT.empty();
        }

        var fees = {
            area: data[0],
            manager: data[1]
        };

        // 본사 담당자 추출
        var manager = fees.manager.map(function (fee) {
            return fee['담당자'];
        });

        // 지사 추출
        var area = fees.area.map(function (fee) {
            return fee['지사코드'];
        });

        // 지사 완료자 추출
        var member = fees.area.map(function (fee) {
            return fee['완료자'];
        })

        // 본사 A/S 완료자 추출
        var member2 = fees.manager.map(function (fee) {
            return fee['완료자'];
        });


        // 추출 리스트 중복 제거
        var uniqManager = [];
        var uniqArea = [];
        var uniqMember = [];
        var uniqMemberParent = [];

        $.each(area, function (i, el) {
            if ($.inArray(el, uniqArea) === -1) uniqArea.push(el);
        });
        $.each(member, function (i, el) {
            if ($.inArray(el, uniqMember) === -1) uniqMember.push(el);
        });
        $.each(manager, function (i, el) {
            if ($.inArray(el, uniqManager) === -1) uniqManager.push(el);
        });
        $.each(member2, function (i, el) {
            if ($.inArray(el, uniqMemberParent) === -1) uniqMemberParent.push(el);
        });



        // A/S 건수 , 수수료 계산
        var managerFee = [];
        var areaFee = [];
        var memberFee = [];
        var memberParentFee = [];

        uniqManager.forEach(function (manager, index) {
            var objManager = {
                id: manager,
                name: '',
                normal: 0,
                emergency: 0,
                total: 0,
                fee: 0
            };

            fees.manager.forEach(function (fee) {
                if (fee['담당자'] === manager) {
                    objManager['name'] = fee['담당자명'];
                    objManager['total'] += 1;
                    fee['응급'] === 1 ? objManager['emergency'] += 1 : objManager['normal'] += 1;
                    objManager['fee'] += 500;
                }
            });
            managerFee.push(objManager);
        });

        uniqArea.forEach(function (area, index) {
            var objArea = {
                id: area,
                name: '',
                normal: 0,
                emergency: 0,
                total: 0,
                fee: 0
            };

            fees.area.forEach(function (fee) {
                if (fee['지사코드'] === area) {
                    objArea['name'] = fee['지사'];
                    objArea['total'] += 1;
                    fee['응급'] === '응급' ? objArea['emergency'] += 1 : objArea['normal'] += 1;
                    fee['응급'] === '응급' ? objArea['fee'] += 5000 : objArea['fee'] += 3000;
                }
            });

            areaFee.push(objArea);
        });

        uniqMember.forEach(function (member) {
            var objMember = {
                id: member,
                name: '',
                normal: 0,
                emergency: 0,
                total: 0,
                fee: 0
            };

            fees.area.forEach(function (fee) {
                if (fee['완료자'] === member) {
                    objMember['name'] = fee['완료자명'];
                    objMember['total'] += 1;
                    fee['응급'] === '응급' ? objMember['emergency'] += 1 : objMember['normal'] += 1;
                    fee['응급'] === '응급' ? objMember['fee'] += 5000 : objMember['fee'] += 3000;
                }
            });
            memberFee.push(objMember);
        });

        uniqMemberParent.forEach(function (member, index) {
            var objMemberParent = {
                id: member,
                name: '',
                normal: 0,
                emergency: 0,
                total: 0,
                fee: 0
            };

            fees.manager.forEach(function (fee) {
                if (fee['완료자'] === member) {
                    objMemberParent['name'] = fee['완료자명'];
                    objMemberParent['total'] += 1;
                    fee['응급'] === 1 ? objMemberParent['emergency'] += 1 : objMemberParent['normal'] += 1;
                    objMemberParent['fee'] += 1500;//800;
                }
            });
            memberParentFee.push(objMemberParent);
        });



        // 렌더링 
        managerFee.forEach(function (mngr) {
            $FEEMANAGER.append(
                '<tr>' +
                '    <td class="text-right">' + mngr['name'] + '</td>' +
                '    <td class="text-right">' + mngr['normal'] + '</td>' +
                '    <td class="text-right">' + mngr['emergency'] + '</td>' +
                '    <td class="text-right">' + mngr['total'] + '</td>' +
                '    <td class="text-right">' + mngr['fee'] + '</td>' +
                '</tr>'
            );
        });


        areaFee.forEach(function (af) {
            $FEEARAE.append(
                '<tr>' +
                '    <td class="text-right">' + af['name'] + '</td>' +
                '    <td class="text-right">' + af['normal'] + '</td>' +
                '    <td class="text-right">' + af['emergency'] + '</td>' +
                '    <td class="text-right">' + af['total'] + '</td>' +
                '    <td class="text-right">' + af['fee'] + '</td>' +
                '</tr>'
            );
        });

        memberParentFee.forEach(function (mbr) {
            $FEEMEMBERMANAGER.append(
                '<tr>' +
                '    <td class="text-right">' + mbr['name'] + '</td>' +
                '    <td class="text-right">' + mbr['normal'] + '</td>' +
                '    <td class="text-right">' + mbr['emergency'] + '</td>' +
                '    <td class="text-right">' + mbr['total'] + '</td>' +
                '    <td class="text-right">' + mbr['fee'] + '</td>' +
                '</tr>'
            );
        });
        memberFee.forEach(function (mbr) {
            $FEEMEMBER.append(
                '<tr>' +
                '    <td class="text-right">' + mbr['name'] + '</td>' +
                '    <td class="text-right">' + mbr['normal'] + '</td>' +
                '    <td class="text-right">' + mbr['emergency'] + '</td>' +
                '    <td class="text-right">' + mbr['total'] + '</td>' +
                '    <td class="text-right">' + mbr['fee'] + '</td>' +
                '</tr>'
            );
        });

        var listHidden = (function () {
            if (params.user['인덱스'] !== 89 && params.user['인덱스'] !== 5 && params.user['인덱스'] !== 4) {
                return params.user['지사코드'].match(/0000|0030|0031|0026/) ? '' : 'hidden';
            } else {
                return '';
            }
        })();
        // 프린트용 테이블
        fees.manager.forEach(function (fee) {
            $FEEPRINT.append(
                '<tr class="' + listHidden + '">' +
                '    <td style="border: 1px solid #444444;" class="text-right">' + fee['인덱스'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-right">' + fee['기관코드'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-cemter">' + fee['기관명칭'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-cemter">' + fee['지사'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-cemter">' + fee['담당자명'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-cemter">' + fee['접수자'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-cemter">' + fee['접수일자'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-cemter">' + fee['완료일자'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-cemter">' + fee['공유자명'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-cemter">' + fee['완료자명'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-cemter">' + fee['응급2'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-right">500(담당자) + 1000(본사지원) = 1500</td>' +
                '    <td class="hidden">' + fee['USER_ID'] + '</td>' +
                '</tr>'
            );
        });
        $FEEPRINT.append(
            '<tr class="' + listHidden + '">' +
            '   <td style="border: 1px solid #444444;" text-align="right" class="text-right bg-dark" colspan="11">합계</td>' +
            '   <td style="border: 1px solid #444444;" class="text-right bg-dark">' + (1500 * fees.manager.length) + '</td>' +
            '</tr>'
        );

        listHidden = (function () {
            if (params.user['인덱스'] !== 89 && params.user['인덱스'] !== 5 && params.user['인덱스'] !== 4) {
                return params.user['지사코드'].match(/0000|0030|0031|0026/) ? 'hidden' : '';
            } else {
                return '';
            }
        })();
        fees.area.forEach(function (fee) {
            $FEEPRINT.append(
                '<tr class="' + listHidden + '">' +
                '    <td style="border: 1px solid #444444;" class="text-right">' + fee['인덱스'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-right">' + fee['기관코드'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-right">' + fee['기관명칭'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-right">' + fee['지사'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-right"></td>' +
                '    <td style="border: 1px solid #444444;" class="text-right">' + fee['접수자'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-right">' + fee['접수일자'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-right">' + fee['완료일자'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-right">' + fee['공유자명'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-right">' + fee['완료자명'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-right">' + fee['응급'] + '</td>' +
                '    <td style="border: 1px solid #444444;" class="text-right">' + fee['수수료'] + '</td>' +
                '    <td class="hidden">' + fee['USER_ID'] + '</td>' +
                '</tr>'
            );
        });
        $FEEPRINT.append(
            '<tr class="' + listHidden + '">' +
            '   <td style="border: 1px solid #444444;" text-align="right" class="text-right bg-dark" colspan="11">합계</td>' +
            '   <td style="border: 1px solid #444444;" class="text-right bg-dark">' + fees.area.reduce(function (a, b) { return parseInt(a) + parseInt(b['수수료']); }, 0) + '</td>' +
            '</tr>'
        );

    }

    LoadServiceFee();
    LoadServiceFee('days');

})(window);