;
(function (exports) {
    'use strict'

    var Drafting = function () {
        var _instance = null,
            _this = this

        Drafting = function () {
            return _instance
        }
        Drafting.prototype = this
        _instance = new Drafting()
        _instance.constructor = Drafting()

        var state = {
            permission: {
                chongmu: false,
                president: false
            },
            date: {
                // month: moment().format('YYYY-MM'),
                start: moment().startOf('month').format('YYYY-MM-DD'),
                end: moment().endOf('month').format('YYYY-MM-DD')
            },
            draftings: null
        }

        var el = {
            $FORM: $('#drafting-form'),
            $DATEPICKER: new myDatePicker('.datepicker.drafting'),
            $DRAFTINGHOSPITAL: $('#drafting-hospital'),
            $DRAFTINGDATE: $('.datepicker.drafting-date'),
            $LIST: $('#drafting-list')
        }

        var actions = {
            initialize: function () {

                _this.state.permission.chongmu = params.user['인덱스'] === 13
                _this.state.permission.president = params.user['인덱스'] === 5
                _this.state.permission.chief = params.user['인덱스'] === 43

                // _this.state.permission.chongmu = _this.state.permission.president = _this.state.permission.chief = params.user['인덱스'] === 89


                _this.el.$DATEPICKER.fn.init(_this.state.date, _this.actions.ChangeDate);

                _this.el.$DRAFTINGHOSPITAL.selectpicker({
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
                                hosps.push({
                                    'value': hosp['ID'] + '|' + hosp['기관코드'],
                                    'text': hosp['기관명칭'] + '/' + hosp['담당지사'],
                                    'disabled': false
                                })
                            });

                            return hosps;
                        },
                        preserveSelected: false
                    });

                _this.el.$DRAFTINGDATE.datetimepicker({
                    format: "YYYY-MM-DD",
                    dayViewHeaderFormat: 'YYYY년MMMM',
                    ignoreReadonly: true,
                    showTodayButton: true,
                    useCurrent: false,
                    defaultDate: moment()
                });

                _this.el.$FORM.bind('submit', function (event) {
                    event.preventDefault()

                    var tempArr = $(this).serializeArray()
                    var data = {}

                    $(tempArr).each(function (index, obj) {
                        if (obj.name === 'drafting-hospital') {
                            data[obj.name] = obj.value.split('|')[0]
                        } else {
                            data[obj.name] = obj.value
                        }
                    })
                    _this.actions.Save(data)
                })

                _this.el.$LIST.bind('click', function (event) {
                    console.log(event.target.tagName)
                    if (event.target.tagName !== 'BUTTON') {
                        event.preventDefault()
                        return
                    }

                    _this.actions.draftingAct($(event.target))


                })

                $('.modal').bind('hidden.bs.modal', function (event) {
                    _this.el.$FORM[0].reset()
                    $('select[name="drafting-hospital"]').selectpicker('val', [])
                    $('select[name="drafting-vat"]').selectpicker('val', [])
                    $('select[name="drafting-status"]').selectpicker('val', 0)
                    $('input[name="drafting-index"]').val('')
                })

                $('input[name="drafting-price"], input[name="drafting-ratio"]').bind('keyup', function (event) {
                    var price = $('input[name="drafting-price"]').val()
                    var ratio = $('input[name="drafting-ratio"]').val()
                    var vat = $('select[name="drafting-vat"]').selectpicker('val')

                    if (price && ratio && vat) {
                        var incen = vat == 1 ? (price / 1.1) / 100 * ratio : price / 100 * ratio
                        $('input[name="drafting-incentive"]').val(Math.floor(incen))
                    }
                })
                $('select[name="drafting-vat"]').bind('changed.bs.select', function (event) {
                    var price = $('input[name="drafting-price"]').val()
                    var ratio = $('input[name="drafting-ratio"]').val()
                    var vat = $('select[name="drafting-vat"]').selectpicker('val')

                    if (price && ratio && vat) {
                        var incen = vat == 1 ? (price / 1.1) / 100 * ratio : price / 100 * ratio
                        $('input[name="drafting-incentive"]').val(Math.floor(incen))
                    }
                })


                _this.actions.LoadOrder()

            },
            ChangeDate: function () {
                _this.state.date.start = _this.el.$DATEPICKER.value.start;
                _this.state.date.end = _this.el.$DATEPICKER.value.end;
                _this.actions.LoadOrder()
            },
            LoadOrder: function () {
                axios.get(API.DRAFTING.LIST, {
                    params: {
                        date: _this.state.date
                    }
                }).then(function (result) {
                    _this.state.draftings = result.data
                    _this.actions.RenderList()
                }).catch(function (error) {
                    fn.errorNotify(error)
                })
            },
            RenderList: function () {

                var $TARGET = _this.el.$LIST
                var $ROW = ''
                var userId = -1
                var total = {
                    price: 0,
                    incentive: 0
                }

                $TARGET.empty()

                _this.state.draftings.forEach(function (item, index) {
                    $ROW = ''
                    if (index == 0) {
                        userId = item['사원ID']
                    }
                    // if (userId > -1 && userId !== item['사원ID']) {
                    //     // 여기다가 기안서 합계
                    //     $ROW += '<tr style="background-color:#dff0d8;">'
                    //     $ROW += '   <td colspan="6">합계</td>'
                    //     $ROW += '   <td>' + total.price + '</td>'
                    //     $ROW += '   <td>' + total.incentive + '</td>'
                    //     $ROW += '   <td colspan="7"></td>'
                    //     $ROW += '</tr>'
                    //     total = {
                    //         price: 0,
                    //         incentive: 0
                    //     }
                    // } else {
                    //     userId = item['사원ID']
                    //     total.price += item['공급가']
                    //     total.incentive += item['인센티브']
                    // }

                    $ROW += '<tr data-index="' + item['인덱스'] + '">'
                    $ROW += '    <td>' + (index + 1) + '</td>'
                    $ROW += '    <td>' + item['USER_NAME'] + '</td>'
                    $ROW += '    <td>' + (!item['유형'] ? '' : item['유형']) + '</td>'
                    $ROW += '    <td>' + (!item['기관명칭'] ? '' : item['기관명칭']) + '</td>'
                    $ROW += '    <td>' + (item['부가세'] == 0 ? '별도' : '포함') + '</td>'
                    $ROW += '    <td>' + item['퍼센트'] + '</td>'
                    $ROW += '    <td>' + item['공급가'].toLocaleString() + '</td>'
                    $ROW += '    <td>' + item['인센티브'].toLocaleString() + '</td>'
                    $ROW += '    <td>' + (item['상태'] == 0 ? '미제출' : '제출') + '</td>'
                    $ROW += '    <td>' + item['기안일'] + '</td>'
                    if (_this.state.permission.chongmu) {
                        //총무과이면
                        $ROW += '    <td>'
                        $ROW += '    <input type="checkbox" name="drafting-confirm" ' + (!item['확인일'] ? '' : 'checked="true"') + ' data-approval="chongmu"/>'
                        $ROW += '    </td>'
                    } else {
                        $ROW += '    <td>' + (!item['확인일'] ? '' : item['확인일']) + '</td>'
                    }

                    if (_this.state.permission.president) {
                        //사장님 이면
                        $ROW += '    <td>'
                        $ROW += '    <input type="checkbox" name="drafting-confirm" ' + (!item['결재일'] ? '' : 'checked="true"') + ' data-approval="president"/>'
                        $ROW += '    </td>'
                    } else {
                        $ROW += '    <td>' + (!item['결제일'] ? '' : item['결제일']) + '</td>'
                    }

                    if (_this.state.permission.chief) {
                        $ROW += '    <td>'
                        $ROW += '    <select class="selectpicker show-tick" data-size="5">'
                        $ROW += '        <option ' + (!item['지급일'] || item['지급일'] == '' ? 'selected' : '') + ' value="">미지급</option>'
                        $ROW += '        <option ' + (item['지급일'] && item['지급일'] == (moment().format('YYYY') + 1) ? 'selected' : '') + ' value="' + (moment().format('YYYY') + 1) + '">1월</option>'
                        $ROW += '        <option ' + (item['지급일'] && item['지급일'] == (moment().format('YYYY') + 2) ? 'selected' : '') + ' value="' + (moment().format('YYYY') + 2) + '">2월</option>'
                        $ROW += '        <option ' + (item['지급일'] && item['지급일'] == (moment().format('YYYY') + 3) ? 'selected' : '') + ' value="' + (moment().format('YYYY') + 3) + '">3월</option>'
                        $ROW += '        <option ' + (item['지급일'] && item['지급일'] == (moment().format('YYYY') + 4) ? 'selected' : '') + ' value="' + (moment().format('YYYY') + 4) + '">4월</option>'
                        $ROW += '        <option ' + (item['지급일'] && item['지급일'] == (moment().format('YYYY') + 5) ? 'selected' : '') + ' value="' + (moment().format('YYYY') + 5) + '">5월</option>'
                        $ROW += '        <option ' + (item['지급일'] && item['지급일'] == (moment().format('YYYY') + 6) ? 'selected' : '') + ' value="' + (moment().format('YYYY') + 6) + '">6월</option>'
                        $ROW += '        <option ' + (item['지급일'] && item['지급일'] == (moment().format('YYYY') + 7) ? 'selected' : '') + ' value="' + (moment().format('YYYY') + 7) + '">7월</option>'
                        $ROW += '        <option ' + (item['지급일'] && item['지급일'] == (moment().format('YYYY') + 8) ? 'selected' : '') + ' value="' + (moment().format('YYYY') + 8) + '">8월</option>'
                        $ROW += '        <option ' + (item['지급일'] && item['지급일'] == (moment().format('YYYY') + 9) ? 'selected' : '') + ' value="' + (moment().format('YYYY') + 9) + '">9월</option>'
                        $ROW += '        <option ' + (item['지급일'] && item['지급일'] == (moment().format('YYYY') + 10) ? 'selected' : '') + ' value="' + (moment().format('YYYY') + 10) + '">10월</option>'
                        $ROW += '        <option ' + (item['지급일'] && item['지급일'] == (moment().format('YYYY') + 11) ? 'selected' : '') + ' value="' + (moment().format('YYYY') + 11) + '">11월</option>'
                        $ROW += '        <option ' + (item['지급일'] && item['지급일'] == (moment().format('YYYY') + 12) ? 'selected' : '') + ' value="' + (moment().format('YYYY') + 12) + '">12월</option>'
                        $ROW += '    </select>'
                        $ROW += '    </td>'
                    } else {
                        $ROW += '    <td>' + (!item['지급일'] ? '' : item['지급일']) + '</td>'
                    }

                    $ROW += '    <td>' + (!item['비고'] ? '' : item['비고'].replace(/\n/gim, '<br>')) + '</td>'
                    if (item['사원ID'] === params.user['인덱스']) {
                        $ROW += '    <td>'
                        $ROW += '       <button class="btn btn-xs btn-success drafting-act" data-index="' + item['인덱스'] + '">수정</button>'
                        $ROW += '       <button class="btn btn-xs btn-danger drafting-act" data-index="' + item['인덱스'] + '">삭제</button>'
                        $ROW += '    </td>'
                    } else {
                        $ROW += '    <td></td>'
                    }
                    $ROW += '</tr>'

                    if (userId !== item['사원ID']) {
                        $TARGET.append(
                            '<tr style="background-color:#dff0d8;">' +
                            '    <td colspan="6">합계</td>' +
                            '    <td>' + total.price.toLocaleString() + '</td>' +
                            '    <td>' + total.incentive.toLocaleString() + '</td>' +
                            '    <td colspan="7"></td>' +
                            '</tr>'
                        )

                        total.price = item['공급가']
                        total.incentive = item['인센티브']
                    } else {
                        total.price += item['공급가']
                        total.incentive += item['인센티브']
                    }


                    // if (_this.state.draftings.length - 1 == index) {
                    //     // 여기다가 기안서 합계
                    //     $ROW += '<tr style="background-color:#dff0d8;">'
                    //     $ROW += '   <td colspan="6">합계</td>'
                    //     $ROW += '   <td>' + total.price.toLocaleString() + '</td>'
                    //     $ROW += '   <td>' + total.incentive.toLocaleString() + '</td>'
                    //     $ROW += '   <td colspan="7"></td>'
                    //     $ROW += '</tr>'
                    // }
                    $TARGET.append($ROW)
                })
                $TARGET.append(
                    '<tr style="background-color:#dff0d8;">' +
                    '    <td colspan="6">합계</td>' +
                    '    <td>' + total.price.toLocaleString() + '</td>' +
                    '    <td>' + total.incentive.toLocaleString() + '</td>' +
                    '    <td colspan="7"></td>' +
                    '</tr>'
                )

                $TARGET.find('input[type="checkbox"]').iCheck({
                    checkboxClass: 'icheckbox_flat-orange',
                    radioClass: 'iradio_flat-orange'
                }).bind('ifChecked ifUnchecked', function (event) {
                    console.log(event)
                    _this.actions.updateApproval(event)
                })
                $TARGET.find('select').selectpicker({
                    style: "btn-default btn-xs"
                })
            },
            Save: function (formData) {
                console.log(formData)
                var apiAxios = formData['drafting-index'] ? axios.put(API.DRAFTING.DRAFT, formData) : axios.post(API.DRAFTING.DRAFT, formData)
                apiAxios.then(function (result) {
                        console.log(result)
                        // location.reload()
                        _this.actions.LoadOrder()
                    })
                    .catch(function (error) {
                        fn.errorNotify(error)
                    })
            },
            draftingAct: function ($button) {

                var index = $button.data('index')

                if ($button.hasClass('btn-success')) {
                    // edit
                    return _this.actions.showEditPopup(index)
                } else if ($button.hasClass('btn-danger')) {
                    // delete
                    console.log('delete')
                    return _this.actions.deleteDraft(index)
                }
            },
            showEditPopup: function (_index) {
                var item = _this.state.draftings.find(function (_item) {
                    return _item['인덱스'] === _index
                })

                $('input[name="drafting-index"]').val(_index)
                $('input[name="drafting-type"]').val(item['유형'])
                $('input[name="drafting-date"]').val(item['기안일'])
                $('select[name="drafting-hospital"]').append(
                    '<option value="' + (item['거래처ID'] + '|' + item['기관코드']) + '" selected>' + item['기관명칭'] + '</option>'
                ).selectpicker('refresh')
                $('input[name="drafting-price"]').val(item['공급가'])
                $('select[name="drafting-vat"]').selectpicker('val', item['부가세'])
                $('input[name="drafting-ratio"]').val(item['퍼센트'])
                $('input[name="drafting-incentive"]').val(item['인센티브'])
                $('textarea[name="drafting-bigo"]').val(item['비고'])
                $('select[name="drafting-status"]').selectpicker('val', item['상태'])

                $('.modal').modal('show')
            },
            deleteDraft: function (_index) {
                swal({
                        title: '기안서 삭제',
                        text: '해당 내용을 삭제하시겠습니까?',
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33'
                    }).then(function () {
                        axios.delete(API.DRAFTING.DRAFT, {
                            data: {
                                'drafting-index': _index
                            }
                        })
                    })
                    .then(function () {
                        _this.actions.LoadOrder()
                    })
                    .catch(function (dismiss) {
                        console.log(dismiss);
                    })
            },
            updateApproval: function (event) {
                var approval = $(event.target).data('approval')
                var index = $(event.target).closest('tr').data('index')
                console.log(approval, index)
                console.log(event)

                axios.put(API.DRAFTING.APPROVAL, {
                        'drafting-index': index,
                        'drafting-key': approval === 'chongmu' ? '확인일' : '결재일',
                        'drafting-date': event.type == 'ifUnchecked' ? 'null' : moment().format('YYYY-MM-DD')
                    })
                    .then(function (result) {

                    })
                    .catch(function (error) {
                        fn.errorNotify(error)
                    })
            }

        }

        _this.state = state
        _this.el = el
        _this.actions = actions

        return _instance
    }

    exports.Drafting = new Drafting()
    exports.Drafting.actions.initialize()
})(window)
