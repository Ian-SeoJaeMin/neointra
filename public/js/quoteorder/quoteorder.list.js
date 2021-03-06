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
            date: {
                // month: moment().format('YYYY-MM'),
                start: moment().startOf('month').format('YYYY-MM-DD'),
                end: moment().endOf('month').format('YYYY-MM-DD')
            }
        }

        var el = {
            $DATEPICKER: new myDatePicker('.datepicker.quoteorder'),
            $LIST: $('#order-list')
        }

        var actions = {
            initialize: function () {

                _this.el.$DATEPICKER.fn.init(_this.state.date, _this.actions.ChangeDate);

                _this.el.$LIST.bind('click', function (event) {
                    if (event.target.tagName === 'TD') {
                        var index = $(event.target).closest('tr').data('index')
                        if (index) {
                            location.href = '/quoteorder/view?index=' + index
                        }
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
                axios.get(API.QUOTEORDER.ORDER, {
                        params: _this.state
                    })
                    .then(function (result) {
                        _this.actions.RenderList(result.data)
                    })
                    .catch(function (error) {
                        fn.errorNotify(error)
                    })
            },
            RenderList: function (data) {
                var orders = data[0]
                var orderProducts = data[1]
                var $TARGET = _this.el.$LIST
                var $ROW = ''
                $TARGET.empty()

                var temps = null
                orders.forEach(function (element, index) {

                    temps = orderProducts.filter(function (item) {
                        return item['?????????ID'] == element['?????????ID']
                    })

                    console.log(temps)

                    $ROW += '<tr data-index="' + element['?????????ID'] + '">'
                    $ROW += '    <td>' + (index + 1) + '</td>'
                    $ROW += '    <td>' + (element['??????'] == 0 ? '??????' : '??????') + '</td>'
                    $ROW += '    <td>' + (element['????????????'] || element['????????????2']) + '</td>'
                    if (temps.length) {
                        $ROW += '    <td>' + temps[0]['??????'] + '</td>'
                        $ROW += '    <td>' + (temps[0]['??????'] + ' ??? ' + temps.length + '???') + '</td>'
                    } else {
                        $ROW += '    <td>-</td>'
                        $ROW += '    <td>-</td>'
                    }
                    $ROW += '    <td>' + element['????????????'] + '</td>'
                    $ROW += '    <td>' + element['????????????'] + '</td>'
                    $ROW += '    <td>' + (element['????????????'] == 0 ? '?????????' : '??????') + '</td>'
                    $ROW += '    <td>' + element['?????????'] + '</td>'
                    $ROW += '</tr>'
                });

                $TARGET.append($ROW)
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
