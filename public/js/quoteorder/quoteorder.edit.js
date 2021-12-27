;
(function (exports) {
    'use strict'

    var QuoteOrder = function () {
        var _instance = null,
            _this = this

        QuoteOrder = function () {
            return _instance
        }
        QuoteOrder.prototype = this
        _instance = new QuoteOrder()
        _instance.constructor = QuoteOrder()

        var state = {
            subject: null,
            model: null,
            product: {
                origin: null,
                selected: exports.params.orderProducts
            }
        }

        var el = {
            $ORDERFORM: $('#order-form'),
            $ORDERWRITER: $('#order-writer'),
            $ORDERHOSPITAL: $('#order-hospital'),
            $ORDERDELETE: $('#order-delete'),
            $PRODUCTMODAL: $('.modal'),
            $PRODUCTLIST: $('tbody#product-list'),
            $modal: {
                $PRODUCTFORM: $('.product-modal form'),
                $PRODUCTSUBJECT: $('select#product-subject'),
                $PRODUCTMODEL: $('select#product-model'),
                $PRODUCTACCOUNT: $('input#product-account'),
                $PRODUCTCONSUMERPRICE: $('input#product-consumerprice'),
                $PRODUCTUNITPRICE: $('b#product-unitprice'),
                $PRODUCTSUGGESTPRICE: $('input#product-suggestprice')
            }
        }

        var actions = {
            initialize: function () {
                // 작성자
                fn.init_users(_this.el.$ORDERWRITER, false, 'all')
                // 병원검색
                _this.el.$ORDERHOSPITAL.selectpicker({
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
                            hosps.push({
                                'value': '',
                                'text': '선택해제',
                                'disabled': false
                            })
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

                _this.el.$modal.$PRODUCTSUBJECT.bind('changed.bs.select', function (event) {
                    _this.actions.loadProductModel($(this).selectpicker('val'))
                })

                _this.el.$modal.$PRODUCTMODEL.bind('changed.bs.select', function (event) {
                    // if ($(this).selectpicker('val')) {
                    _this.actions.loadProduct($(this).selectpicker('val'))
                    // }
                })

                _this.el.$modal.$PRODUCTACCOUNT.bind('change', function (event) {
                    event.preventDefault()
                    // console.log('account change')
                    _this.el.$modal.$PRODUCTSUGGESTPRICE.val(_this.el.$modal.$PRODUCTCONSUMERPRICE.val())
                })

                _this.el.$modal.$PRODUCTFORM.bind('submit', function (event) {
                    event.preventDefault()
                    var _product = _this.state.product.origin.find(function (item) {
                        return item['품목'] === _this.state.subject && item['모델'] === _this.state.model
                    }) || null

                    _product = $.extend({}, _product)

                    if (_product) {
                        _product['수량'] = _this.el.$modal.$PRODUCTACCOUNT.val().trim() * 1
                        _product['소비자가'] = _this.el.$modal.$PRODUCTCONSUMERPRICE.val().trim() * 1
                        _product['제안가'] = _this.el.$modal.$PRODUCTSUGGESTPRICE.val().trim() * 1

                        _this.state.product.selected.push(_product)
                        _this.actions.renderProductList()
                        _this.el.$modal.$PRODUCTFORM[0].reset()
                        _this.el.$modal.$PRODUCTFORM.find('select').selectpicker('val', [])
                        _this.el.$modal.$PRODUCTUNITPRICE.text('')
                    } else {
                        alert('선택하신 품목을 찾지 못하였습니다. 다시 시도해주세요.')
                        _this.el.$modal.modal('hide')
                    }
                })

                _this.el.$PRODUCTMODAL.bind('hidden.bs.modal', function (event) {
                    _this.el.$modal.$PRODUCTFORM[0].reset()
                    _this.el.$modal.$PRODUCTFORM.find('select').selectpicker('val', [])
                    // _this.actions.loadProductSubject()
                })

                _this.el.$ORDERFORM.bind('submit', function (event) {
                    event.preventDefault()
                    var tempArray = $(this).serializeArray()
                    var formData = {}

                    tempArray.forEach(function (item) {
                        formData[item.name] = item.value
                    })

                    formData['products'] = _this.state.product.selected

                    if (!formData['order-hospital'] && !formData['order-unreg-hospital']) {
                        alert('거래처를 선택하시거나 미등록거래처인 경우 직접 입력해주세요.')
                    } else {
                        _this.actions.saveOrder(formData)
                    }
                    // _this.actions.saveOrder(formData)

                })

                _this.el.$PRODUCTLIST.bind('click', function (event) {
                    event.preventDefault()
                    if (event.target.tagName === 'BUTTON') {
                        var $ROW = $(event.target).closest('tr')
                        _this.actions.deleteProducts($ROW)
                    }
                })

                _this.el.$ORDERDELETE.bind('click', function (event) {
                    event.preventDefault()
                    _this.actions.deleteOrder()
                })

                _this.el.$PRODUCTLIST.closest('table').parent().bind('click', function (event) {
                    if ($(event.target).hasClass('quick-product')) {
                        _this.actions.addProductPackages($(event.target).data('package'))
                    }
                })

                // _this.actions.loadProductSubject()
                _this.actions.loadProducts()
            },
            loadProductSubject: function () {
                axios.get(API.QUOTEORDER.PRODUCTSUBJECT)
                    .then(function (result) {
                        _this.actions.renderSubjects(result.data)
                    })
                    .catch(function (error) {
                        fn.errorNotify(error)
                    })
            },
            loadProductModel: function (subject) {
                _this.state.subject = subject
                var models = _this.state.product.origin.filter(function (model) {
                    return model['품목'] === subject
                })
                _this.actions.renderModels(models)

                // axios.get(API.QUOTEORDER.PRODUCTMODEL, {
                //         params: {
                //             subject: subject
                //         }
                //     })
                //     .then(function (result) {
                //         _this.state.product.origin = result.data
                //         _this.actions.renderModels(result.data)
                //     })
                //     .catch(function (error) {
                //         fn.errorNotify(error)
                //     })
            },
            loadProduct: function (model) {
                if (!model) return false
                _this.state.model = model
                var _product = _this.state.product.origin.find(function (item) {
                    return item['품목'] === _this.state.subject && item['모델'] === _this.state.model
                }) || null
                if (_product) {
                    // _this.state.product.selected.push(_product)
                    _product['제안가'] = _product['소비자가']
                    _this.el.$modal.$PRODUCTACCOUNT.val(1)
                    _this.el.$modal.$PRODUCTCONSUMERPRICE.val(_product['소비자가'])
                    _this.el.$modal.$PRODUCTUNITPRICE.text(_product['공급단가'].toLocaleString())
                    _this.el.$modal.$PRODUCTSUGGESTPRICE.val(_product['소비자가'])
                }
            },
            loadProducts: function () {
                axios.get(API.QUOTEORDER.PRODUCTS)
                    .then(function (result) {
                        _this.state.product.origin = result.data
                        // _this.actions.renderModels(result.data)
                        _this.actions.renderPackages()
                    })
                    .then(function () {
                        _this.actions.renderSubjects()
                    })
                    .catch(function (error) {
                        fn.errorNotify(error)
                    })
            },
            renderPackages: function () {
                return new Promise(function (resolve, reject) {
                    try {
                        var packages = []
                        var tempArray = _this.state.product.origin.filter(function (item) {
                            return item['패키지'].length
                        })
                        tempArray = tempArray.map(function (item) {
                            return item['패키지']
                        })

                        $.each(tempArray, function (i, el) {
                            if ($.inArray(el, packages) === -1) packages.push(el);
                        });

                        if (!packages.length) {
                            return resolve()
                        }

                        var $TARGET = _this.el.$PRODUCTLIST.closest('table').parent()

                        packages.forEach(function (item) {
                            $TARGET.append(
                                '<button class="btn btn-primary btn-sm quick-product" type="button" data-package="' + item + '">' + item + '</button>'
                            )
                        })

                        packages = null
                        tempArray = null
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                })
            },
            renderSubjects: function (subjects) {
                var $TARGET = _this.el.$modal.$PRODUCTSUBJECT
                var subjects = []
                var tempArray = _this.state.product.origin.map(function (item) {
                    return item['품목']
                })
                $.each(tempArray, function (i, el) {
                    if ($.inArray(el, subjects) === -1) subjects.push(el);
                });
                subjects.forEach(function (subject) {
                    $TARGET.append(
                        '<option value="' + subject + '">' + subject + '</option>'
                    )
                })
                $TARGET.selectpicker('refresh')
            },
            renderModels: function (models) {
                console.log(models)
                var $TARGET = _this.el.$modal.$PRODUCTMODEL
                $TARGET.empty()
                models.forEach(function (model) {
                    $TARGET.append(
                        '<option value="' + model['모델'] + '">' + model['모델'] + '</option>'
                    )
                })
                $TARGET.selectpicker('refresh')
            },
            renderProductList: function () {
                var $TARGET = _this.el.$PRODUCTLIST
                $TARGET.empty()
                var total = 0
                if (_this.state.product.selected.length) {
                    _this.state.product.selected.forEach(function (item, index) {
                        $TARGET.append(
                            '<tr data-index="' + index + '">' +
                            '    <td class="text-center">' + item['품목'] + '</td>' +
                            '    <td class="text-center">' + item['모델'] + '</td>' +
                            '    <td class="text-center">' + item['수량'] + '</td>' +
                            '    <td class="text-right">' + item['공급단가'].toLocaleString() + '</td>' +
                            '    <td class="text-right">' + item['소비자가'].toLocaleString() + '</td>' +
                            '    <td class="text-right">' + item['제안가'].toLocaleString() + '</td>' +
                            '    <td class="text-right">' + (item['제안가'] * item['수량']).toLocaleString() + '</td>' +
                            '    <td class="text-center"><button type="button" class="btn btn-xs btn-danger">삭제</button></td>' +
                            '</tr>'
                        )
                        total += (item['제안가'] * item['수량'])
                    })
                }

                if (total > 0) {
                    $TARGET.append(
                        '<tr>' +
                        '    <td colspan="7" class="text-right bg-navy" id="product-total">' + total.toLocaleString() + '</td>' +
                        '    <td class="bg-navy"></td>' +
                        '</tr>'
                    )
                }
            },
            addProductPackages: function (pkg) {
                var products = _this.state.product.origin.filter(function (item) {
                    return item['패키지'] == pkg
                })

                var msgProducts = '선택한 물품 묶음을 등록하시겠습니까? <br><br>'
                products.forEach(function (item, index) {
                    item['제안가'] = item['소비자가']
                    item['수량'] = 1
                    msgProducts += (index + 1) + '. ' + item['모델'] + '<br>'
                })

                swal({
                        title: '',
                        html: msgProducts,
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33'
                    })
                    .then(function (result) {
                        _this.state.product.selected = _this.state.product.selected.concat(products)
                        _this.actions.renderProductList()
                    })
                    .catch(function (error) {
                        fn.errorNotify(error)
                    })


            },
            saveOrder: function (data) {
                axios.put(API.QUOTEORDER.ORDER, data)
                    .then(function (result) {
                        swal('견적/발주 수정', '저장되었습니다.', 'success')
                            .then(function () {
                                location.href = '/quoteorder';
                            })
                    })
                    .catch(function (error) {
                        swal('견적/발주 수정', '오류가 발생하였습니다.', 'error')
                            .then(function () {
                                location.href = '/quoteorder';
                            })
                        fn.errorNotify(error)
                    })
            },
            deleteProducts: function (row) {
                var index = row.data('index')

                _this.state.product.selected.splice(index, 1)

                _this.actions.renderProductList()
            },
            deleteOrder: function () {
                swal({
                        title: '견적/발주 삭제',
                        text: '해당 견적서를 삭제할까요?',
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33'
                    })
                    .then(function (result) {
                        return axios.delete(API.QUOTEORDER.ORDER, {
                            data: {
                                'order-id': $('input[name="order-id"]').val()
                            }
                        })
                    })
                    .then(function (result) {
                        swal('견적/발주 삭제', '삭제되었습니다.', 'success')
                            .then(function () {
                                location.href = '/quoteorder';
                            })
                    })
                    .catch(function (error) {
                        if (error !== 'cancel') {
                            swal('견적/발주 삭제', '오류가 발생하였습니다.', 'error')
                                .then(function () {
                                    location.href = '/quoteorder';
                                })
                            fn.errorNotify(error)
                        }
                    })

            }
        }

        _this.state = state
        _this.el = el
        _this.actions = actions

        return _instance
    }

    exports.QuoteOrder = new QuoteOrder()
    exports.QuoteOrder.actions.initialize()
})(window)
