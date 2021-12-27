(function (exports) {

    'use strict';

    var Amount = function () {
        var _instance = null,
            _this = this;

        Amount = function () {
            return _instance;
        }

        Amount.prototype = this;
        _instance = new Amount();
        _instance.constructor = Amount();

        var loading = false

        _this.options = sessionStorage.getItem('amountOption') ? JSON.parse(sessionStorage.getItem('amountOption')) : {
            status: '',
            area: params.user['지사코드'],
            manager: '',
            search: '',
            date: moment().format('YYYY-MM-DD'), //moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
            misu: 0,
            misufilter: false,
            maintain: 0
        };
        _this.sort = sessionStorage.getItem('amountSortOption') ? JSON.parse(sessionStorage.getItem('amountSortOption')) : {
            field: '미수금',
            order: 'desc'
        };
        _this.amounts = [];


        _this.el = {
            $OPT_PROGRAM: $('.customer-program'),
            $OPT_STATUS: $('.customer-status'),
            $OPT_AREA: $('.customer-area'),
            $OPT_MANAGER: $('.customer-manager'),
            $OPT_SEARCH: $('input[name="customer-search"]'),
            $OPT_DATE: $('.datepicker'),
            $OPT_MISU: $('.customer-misu'),
            $OPT_MAINTAIN: $('.customer-maintain'),
            $LIST_HEADER: $('.customer-list-header').find('th'),
            $LIST: $('.customer-list'),
            $LISTCOUNT: $('#data-count'),
            $OPT_MISUFILTER: $('#misu-filter')
        };


        function Initialize() {

            loading = true

            _this.el.$OPT_DATE.datetimepicker({
                format: 'YYYY년 M월',
                defaultDate: moment().format(),
                showTodayButton: true,
                ignoreReadonly: true,
                keepOpen: true,
                viewMode: 'months'
            }).bind('dp.change', function (event) {
                _this.options.date = event.date.format('YYYY-MM-DD'); //event.date.subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
                if (!loading) _this.fn.Amounts();
            });

            _this.el.$OPT_MANAGER.bind('changed.bs.select', function (event) {
                _this.options.manager = $(this).selectpicker('val');
                if (!loading) _this.fn.Amounts();
            });

            _this.el.$OPT_AREA.bind('changed.bs.select', function (event) {
                _this.options.area = $(this).selectpicker('val');
                if (_this.options.area.match(/0000|0026|0030|0031/)) {
                    _this.options.manager = _this.el.$OPT_MANAGER.selectpicker('val');
                    _this.el.$OPT_MANAGER.selectpicker('val', '')
                    _this.el.$OPT_MANAGER.removeAttr('disabled').selectpicker('refresh');
                } else {
                    _this.options.manager = '';
                    _this.el.$OPT_MANAGER.selectpicker('val', '')
                    _this.el.$OPT_MANAGER.attr('disabled', true).selectpicker('refresh');
                }
                if (!loading) _this.fn.Amounts();
            });

            _this.el.$OPT_STATUS.bind('changed.bs.select', function (event) {
                _this.options.status = $(this).selectpicker('val');
                if (!loading) _this.fn.Amounts();
            });

            _this.el.$OPT_SEARCH.bind('keyup', function (event) {
                if (event.keyCode === 13) {
                    _this.options.search = $(this).val().trim();
                    if (!loading) _this.fn.Amounts();
                }
            });

            _this.el.$OPT_MISU.bind('click', function (event) {
                _this.options.misu = $(this).data('misu');
                if (!loading) Filtering();
            });

            _this.el.$OPT_MAINTAIN.bind('changed.bs.select', function (event) {
                _this.options.maintain = $(this).selectpicker('val')
                sessionStorage.setItem('amountOption', JSON.stringify(_this.options));
                if (!loading) Filtering();
            })

            _this.el.$LIST_HEADER.filter('[data-field="' + _this.sort.field + '"]').append('<i class="m-l-xs sort fa fa-sort-amount-' + (_this.sort.order === 'asc' ? 'desc' : 'asc') + '"></i>');
            _this.el.$LIST_HEADER.bind('click', function (event) {
                var $THIS = $(this);
                var $SORTICON = $THIS.find('i.sort');
                if (!$THIS.data('field')) return false;

                if ($SORTICON.length) {
                    $SORTICON.toggleClass('fa-sort-amount-asc fa-sort-amount-desc');
                    _this.sort.order = _this.sort.order === 'asc' ? 'desc' : 'asc';
                } else {
                    $THIS.siblings().find('i.sort').remove();
                    $THIS.append('<i class="m-l-xs fa sort fa-sort-amount-asc"></i>');
                    _this.sort.field = $THIS.data('field');
                    _this.sort.order = 'asc';
                }
                sessionStorage.setItem('amountSortOption', JSON.stringify(_this.sort));
                if (!loading) Filtering();
            });

            _this.el.$LIST.bind('click', function (event) {
                if (event.target.tagName === 'TD') {
                    var $ROW = $(event.target).closest('tr');
                    if ($ROW[0].dataset.userid && $ROW[0].dataset.hospnum) {
                        location.href = '/customer?id=' + $ROW[0].dataset.userid + '&hospnum=' + $ROW[0].dataset.hospnum;
                    }
                }
            })

            if (_this.options.misufilter) {
                _this.el.$OPT_MISUFILTER.removeClass('btn-default').addClass('btn-success');
            }
            _this.el.$OPT_MISUFILTER.bind('click', function (event) {
                //_this.options.misufilter = true
                $(this).toggleClass('btn-default btn-success');
                _this.options.misufilter = $(this).hasClass('btn-success');
                _this.options.misu = _this.options.misufilter ? 0 : _this.options.misu
                sessionStorage.setItem('amountOption', JSON.stringify(_this.options));
                if (!loading) Filtering();
            })

            exports.fn.init_area(_this.el.$OPT_AREA, true)
                .then(function () {
                    return exports.fn.init_manage(_this.el.$OPT_MANAGER, true)
                })
                .then(function () {
                    if (_this.options.status !== '') {
                        _this.el.$OPT_STATUS.selectpicker('val', _this.options.status);
                    }
                    if (_this.options.program !== '') {
                        _this.el.$OPT_PROGRAM.selectpicker('val', _this.options.program);
                    }
                    if (_this.options.area !== '') {
                        _this.el.$OPT_AREA.selectpicker('val', _this.options.area);
                    }
                    if (_this.options.manager !== '') {
                        _this.el.$OPT_MANAGER.selectpicker('val', _this.options.manager);
                    }
                    if (_this.options.search !== '') {
                        _this.el.$OPT_SEARCH.val(_this.options.search);
                    }

                    // if (_this.options.maintain !== 0) {
                    _this.el.$OPT_MAINTAIN.selectpicker('val', _this.options.maintain);
                    // }

                    _this.fn.Amounts();

                    loading = false
                })
                .catch(function (error) {
                    exports.fn.errorNotify(error);
                });
        }

        function GetAmounts() {
            sessionStorage.setItem('amountOption', JSON.stringify(_this.options));
            axios.get(API.AMOUNT.OUTAMOUNTS, {
                    params: _this.options
                })
                .then(function (result) {
                    //RenderList(result.data);
                    console.log(result.data);
                    _this.amounts = result.data;
                    Filtering();
                    //Sorting(result.data);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }

        function Filtering() {
            var filterData = _this.amounts;
            if (_this.options.misufilter) {

                filterData = _this.amounts.filter(function (amount) {
                    return amount['유지보수총액'] * 3 < amount['미수금']
                });

            } else if (_this.options.misu > 0) {
                filterData = _this.amounts.filter(function (amount) {
                    return amount['미수금'] >= _this.options.misu * 10000;
                });
            }

            if (_this.options.maintain == 1) {
                filterData = filterData.filter(function (amount) {
                    return amount['연유지'] != 1
                })
            } else if (_this.options.maintain == 2) {
                filterData = filterData.filter(function (amount) {
                    return amount['연유지'] == 1
                })
            }

            return Sorting(filterData);
        }

        function Sorting(data) {
            data = data.sort(function (a, b) {
                if (_this.sort.order === 'asc') {
                    return (a[_this.sort.field] > b[_this.sort.field]) ? 1 : ((a[_this.sort.field] < b[_this.sort.field]) ? -1 : 0);
                } else {
                    return (b[_this.sort.field] > a[_this.sort.field]) ? 1 : ((b[_this.sort.field] < a[_this.sort.field]) ? -1 : 0);
                }
            });

            Clear();
            Render(data);
        }

        function Clear() {
            _this.el.$LISTCOUNT.text('0건');
            _this.el.$LIST.empty();
        }

        function Render(data) {
            var $LIST = _this.el.$LIST;
            if (data.length <= 0) {
                _this.el.$LISTCOUNT.text("0건");
                $LIST.append(
                    '<tr class="animate fadeIn">' +
                    '    <th colspan="11"><h4>결과가 없습니다.</h4></th>' +
                    '</tr>'
                );
            } else {
                var total = {
                    '유지보수총액': 0,
                    '미수금': 0
                }
                _this.el.$LISTCOUNT.text(data.length + "건");
                data.forEach(function (item, index) {

                    item['미수금관리'] = typeof item['미수금관리'] !== 'object' ? JSON.parse(item['미수금관리']) : item['미수금관리'];
                    item['미수금관리']['확인'] = item['미수금관리']['확인'] || false;
                    item['미수금관리']['비고'] = item['미수금관리']['비고'] || '';

                    $LIST.append(
                        '<tr class="" data-userid="' + item['ID'] + '" data-hospnum="' + item['기관코드'] + '">' +
                        '<td class="breakpoints-sm breakpoints-xs">' + (index + 1) + '</td>' +
                        '<td class="">' + item['기관코드'] + '</td>' +
                        '<td>' + item['기관명칭'] + '</td>' +
                        '<td class="breakpoints-sm breakpoints-xs">' + item['프로그램'] + '</td>' +
                        '<td class="breakpoints-sm breakpoints-xs">' + item['담당지사'] + (item['담당자명'] !== '' ? '(' + item['담당자명'] + ')' : '') + '</td>' +
                        '<td class="breakpoints-sm breakpoints-xs">' + (item['연유지'] == 1 ? '년' : '월') + '</td>' +
                        '<td class="text-right">' + item['유지보수총액'].toLocaleString() + '</td>' +
                        '<td class="red text-right">' + item['미수금'].toLocaleString() + '</td>' +
                        // '<td class="breakpoints-sm breakpoints-xs">' + item['메모'] + '</td>' +
                        '<td class="breakpoints-sm breakpoints-xs red text-center">' + (item['잠금일자'] || '') + '</td>' +
                        '<td class="text-center red">' +
                        (item['잠금'] > 0 ? '<i class="fa fa-lock"></i>' : '') +
                        '</td>' +
                        '<td class="text-center breakpoints-sm breakpoints-xs"><input type="checkbox" data-name="확인" ' + (item['미수금관리']['확인'] ? 'checked' : '') + '/></td>' +
                        '<td class="breakpoints-sm breakpoints-xs"><input type="text" class="form-control input input-sm" placeholder="Enter키로 저장" value="' + item['미수금관리']['비고'] + '"/></td>' +
                        '</tr>'
                    );
                    total['유지보수총액'] += (item['유지보수총액'] * 1)
                    total['미수금'] += (item['미수금'] * 1)
                })

                $LIST.append(
                    '<tr class="breakpoints-sm breakpoints-xs">' +
                    '<th colspan="6">합계</th>' +
                    '<td class="text-right">' + total['유지보수총액'].toLocaleString() + '</td>' +
                    '<td class="red text-right">' + total['미수금'].toLocaleString() + '</td>' +
                    '<td colspan="4"></td>' +
                    '</tr>' +
                    '<tr class="breakpoints-lg breakpoints-md">' +
                    '<th colspan="2">합계</th>' +
                    '<td class="text-right">' + total['유지보수총액'].toLocaleString() + '</td>' +
                    '<td class="red text-right">' + total['미수금'].toLocaleString() + '</td>' +
                    '<td></td>' +
                    '</tr>'
                );

                $LIST.find('input[type="checkbox"]').iCheck({
                    checkboxClass: 'icheckbox_flat-orange',
                    radioClass: 'iradio_flat-orange'
                }).bind('ifChecked ifUnchecked', function (event) {
                    var userId = $(this).closest('tr').data('userid')
                    var hosp = data.find(function (item) {
                        return item['ID'] === userId
                    })

                    hosp['미수금관리']['확인'] = !hosp['미수금관리']['확인'];
                    SaveMisuManage(hosp);
                });

                $LIST.find('input[type="text"]').bind('keyup', function (event) {
                    if (event.keyCode !== 13) {
                        return event.preventDefault();
                    }

                    var userId = $(this).closest('tr').data('userid')
                    var hosp = data.find(function (item) {
                        return item['ID'] === userId
                    })

                    hosp['미수금관리']['비고'] = $(this).val().trim().replace(/'/gim, '′');
                    SaveMisuManage(hosp);
                });

            }
        }

        function SaveMisuManage(hosp) {
            axios.post(API.AMOUNT.OUTAMOUNTS, hosp)
                .then(function (result) {
                    // GetAmounts();
                    new PNotify({
                        text: '저장되었습니다',
                        type: 'success'
                    })
                })
                .catch(function (error) {
                    new PNotify({
                        title: '저장 실패하였습니다',
                        text: '새로고침하고 다시 시도해보세요.',
                        type: 'error'
                    })
                    console.log(error);
                });
        }


        _this.fn = {
            Init: Initialize,
            Amounts: GetAmounts
        }


        return _instance;
    }

    exports.Amount = new Amount();
    exports.Amount.fn.Init();


})(window);
