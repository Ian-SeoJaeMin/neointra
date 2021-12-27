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
            products: null
        }

        var el = {
            $PRODUCTFORMS: $('.product-form'),
            $PRODUCTADD: $('#product-add'),
            $PRODUCTLIST: $('#product-list')
        }

        var actions = {
            initialize: function () {

                _this.el.$PRODUCTADD.bind('click', function (event) {
                    _this.actions.validate(_this.el.$PRODUCTFORMS)
                        .then(_this.actions.addProduct)
                        .catch(function (error) {
                            fn.errorNotify(error)
                        })

                })

                _this.actions.load()

            },
            clear: function (elem) {
                elem.val('')
            },
            load: function () {
                axios.get(API.QUOTEORDER.PRODUCTS)
                    .then(function (result) {
                        console.log(result)
                        _this.state.products = result.data
                        return _this.actions.render()
                    })
                    .catch(function (error) {
                        fn.errorNotify(error)
                    })
            },
            render: function () {
                var $TABLE = _this.el.$PRODUCTLIST
                $TABLE.empty()
                _this.state.products.forEach(function (item, index) {
                    $TABLE.append(
                        '<tr data-id="' + item['물품ID'] + '" data-index="' + index + '">' +
                        '    <th class="text-center">' + (index + 1) + '</th>' +
                        '    <td><input type="text" name="subject" class="form-control input input-sm product-edit-form" value="' + item['품목'] + '"></td>' +
                        '    <td><input type="text" name="model" class="form-control input input-sm product-edit-form" value="' + item['모델'] + '"></td>' +
                        '    <td><input type="text" name="wheretobuy" class="form-control input input-sm product-edit-form" value="' + item['구매처'] + '"></td>' +
                        '    <td class="text-right"><input type="text" name="unitprice" class="form-control input input-sm product-edit-form" value="' + item['공급단가'] + '"></tdcl>' +
                        '    <td class="text-right"><input type="text" name="consumerprice" class="form-control input input-sm product-edit-form" value="' + item['소비자가'] + '"></td>' +
                        '    <td><input type="text" name="memo" class="form-control input input-sm product-edit-form" value="' + item['비고'] + '"></td>' +
                        '    <td><input type="text" name="package" class="form-control input input-sm product-edit-form" value="' + item['패키지'] + '"></td>' +
                        '    <td><button class="btn btn-default btn-sm" data-type="product-edit"><i class="fa fa-edit"></i></button><button class="btn btn-danger btn-sm" data-type="product-delete"><i class="fa fa-trash"></i></button></td>' +
                        '</tr>'
                    )
                })

                $TABLE.find('button').bind('click', function (event) {
                    var type = $(this).data('type')
                    var id = $(this).closest('tr').data('id')
                    var index = $(this).closest('tr').data('index')

                    if (type === 'product-edit') {
                        var data = _this.state.products[index]
                        var name = ''
                        var value = ''
                        $(this).closest('tr').find('.product-edit-form').each(function () {
                            name = $(this).attr('name')
                            value = $(this).val()
                            switch (name) {
                                case 'subject':
                                    data['품목'] = value;
                                    break
                                case 'model':
                                    data['모델'] = value;
                                    break
                                case 'wheretobuy':
                                    data['구매처'] = value;
                                    break
                                case 'unitprice':
                                    data['공급단가'] = value;
                                    break
                                case 'consumerprice':
                                    data['소비자가'] = value;
                                    break
                                case 'memo':
                                    data['비고'] = value;
                                    break
                                case 'package':
                                    data['패키지'] = value;
                                    break
                            }
                        })
                        _this.actions.editProduct(data)
                    } else if (type === 'product-delete') {
                        _this.actions.deleteProduct(id)
                    }
                })
            },
            validate: function (elems) {
                return new Promise(function (resolve, reject) {
                    try {
                        var validate = true
                        elems.each(function (index) {
                            // console.log(typeof $(this).val())
                            if (!$(this).val().length && $(this).attr('name').match(/subject|model|wheretobuy/gim)) {
                                validate = false
                            }
                        })

                        if (validate) resolve()
                        else {
                            // error.title && error.text && error.type
                            reject({
                                title: '품목관리',
                                text: '내용을 입력하셔야합니다.',
                                type: 'error'
                            })
                        }
                    } catch (error) {
                        reject(error)
                    }
                })
            },
            addProduct: function () {

                var forms = {}
                _this.el.$PRODUCTFORMS.each(function (index) {
                    forms[$(this).attr('name')] = $(this).val() || 0
                })

                axios.post(API.QUOTEORDER.PRODUCTS, forms)
                    .then(function (result) {
                        console.log(result)
                        _this.el.$PRODUCTFORMS.val('')
                        return _this.actions.load()
                    })
                    .catch(function (error) {
                        fn.errorNotify(error)
                    })
            },
            deleteProduct: function (id) {
                axios.delete(API.QUOTEORDER.PRODUCTS, {
                        data: {
                            id: id
                        }
                    })
                    .then(function (result) {
                        return _this.actions.load()
                    })
                    .catch(function (error) {
                        fn.errorNotify(error)
                    })
            },
            editProduct: function (data) {
                axios.put(API.QUOTEORDER.PRODUCTS, data)
                    .then(function (result) {
                        (new PNotify({
                            title: '수정되었습니다.',
                            type: 'success'
                        }))()
                        return _this.actions.load()
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

    exports.QuoteOrder = new QuoteOrder()
    exports.QuoteOrder.actions.initialize()
})(window)
