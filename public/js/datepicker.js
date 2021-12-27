(function (exports) {

    'use strict';

    var DatePicker = function (obj) {


        var _instance = null,
            _that = this;
        var isLoad = false;

        DatePicker = function () {
            return _instance;
        };


        DatePicker.prototype = this;
        _instance = new DatePicker();
        _instance.constructor = DatePicker();

        _that.value = {
            start: moment().startOf('month').format('YYYY-MM-DD'),
            end: moment().endOf('month').format('YYYY-MM-DD')
        };
        _that.callback = function () {};

        _that.fn = {
            // drawToolTip : function(){
            //     $(this).append(_that.dom.fragment.tooltip)
            // }
            init: function (date, cb) {
                _that.value = date;

                if (_that.dom.cached.target.length) {
                    var $DATEPICKER = _that.dom.cached.target;

                    $DATEPICKER.filter('[data-type="start"]').datetimepicker({
                        format: "YYYY-MM-DD",
                        dayViewHeaderFormat: 'YYYY년MMMM',
                        ignoreReadonly: true,
                        showTodayButton: true,
                        useCurrent: false,
                        defaultDate: _that.value.start
                    });
                    $DATEPICKER.filter('[data-type="end"]').datetimepicker({
                        format: "YYYY-MM-DD",
                        dayViewHeaderFormat: 'YYYY년MMMM',
                        ignoreReadonly: true,
                        showTodayButton: true,
                        useCurrent: false,
                        defaultDate: _that.value.end
                    });

                    isLoad = true;
                    // .data('DateTimePicker').date(moment(_that.value.start));
                    // $DATEPICKER.filter('[data-type="end"]').data('DateTimePicker').date(moment(_that.value.end));
                }
                _that.callback = cb || this.callback;
            },
            toggleCalendar: function (event) {
                // event.stopPropagation();
                // var type = $(this).find('.datepicker').data('type');
                // var isOpen = $(this).find('.bootstrap-datetimepicker-widget');

                // if (isOpen.length) {
                //     $(this).find('.datepicker').data('DateTimePicker').hide();
                // } else {
                //     var $DATEPICKER = _that.dom.cached.target;
                //     if (type === 'start') {
                //         $DATEPICKER.filter('[data-type="end"]').each(function () {
                //             $(this).data('DateTimePicker').hide();
                //         });
                //     } else {
                //         $DATEPICKER.filter('[data-type="start"]').each(function () {
                //             $(this).data('DateTimePicker').hide();
                //         });
                //     }
                //     $(this).find('.datepicker').data('DateTimePicker').show();
                // }


            },
            changeDate: function (event) {
                var $THIS = $(this);
                var $DATEPICKER = _that.dom.cached.target;
                if ($THIS.data('type') === 'start') {
                    _that.value.start = event.date.format('YYYY-MM-DD');
                    if (isLoad) {
                        $DATEPICKER.filter('[data-type="start"]').each(function () {
                            $(this).val(event.date.format('YYYY-MM-DD'));
                            // $(this).parent().find('span').text($(this).val());
                        });
                        $DATEPICKER.filter('[data-type="end"]').each(function () {
                            $(this).data('DateTimePicker').minDate(event.date);
                        });
                    }
                } else {
                    _that.value.end = event.date.format('YYYY-MM-DD');
                    if (isLoad) {
                        $DATEPICKER.filter('[data-type="end"]').each(function () {
                            // $(this).data('DateTimePicker').date(event.date);
                            $(this).val(event.date.format('YYYY-MM-DD'));
                            // $(this).parent().find('span').text($(this).val());
                        });
                        $DATEPICKER.filter('[data-type="start"]').each(function () {
                            $(this).data('DateTimePicker').maxDate(event.date);
                        });
                    }
                }
                _that.callback();
            },
            moveDate: function (event) {
                var target = $(this).data('target');
                var directive = $(this).data('directive');

                var $DATEPICKER = _that.dom.cached.target.filter('[data-type="' + target + '"]');
                var date = _that.value[target]
                if (directive === 'left') {
                    date = moment(date).subtract(1, 'day').format('YYYY-MM-DD');
                } else {
                    date = moment(date).add(1, 'day').format('YYYY-MM-DD')
                }
                _that.value[target] = date;
                $DATEPICKER.each(function () {
                    // $(this).data('DateTimePicker').date(moment(date))
                    $(this).val(moment(date).format('YYYY-MM-DD'));
                    // $(this).parent().find('span').text($(this).val());
                });
                _that.callback();
            },
            quickDate: function (event) {
                var $THIS = $(this);
                var quick;
                if ($THIS.hasClass('selectpicker')) {
                    quick = $THIS.selectpicker('val');
                    quick = parseInt(quick);
                } else {
                    quick = $THIS.data('value');
                }

                switch (quick) {
                    case _that.Const.QUICKDATE.TODAY:
                        _that.value.start = moment().format('YYYY-MM-DD');
                        _that.value.end = _that.value.start;
                        break;
                    case _that.Const.QUICKDATE.LASTDAY:
                        _that.value.start = moment().subtract(1, 'day').format('YYYY-MM-DD');
                        _that.value.end = _that.value.start;
                        break;
                    case _that.Const.QUICKDATE.LAST7:
                        _that.value.start = moment().subtract(6, 'day').format('YYYY-MM-DD');
                        _that.value.end = moment().format('YYYY-MM-DD');
                        break;
                    case _that.Const.QUICKDATE.LAST30:
                        _that.value.start = moment().subtract(29, 'day').format('YYYY-MM-DD');
                        _that.value.end = moment().format('YYYY-MM-DD');
                        break;
                    case _that.Const.QUICKDATE.THISMONTH:
                        _that.value.start = moment(_that.value.start).add(1, 'month').startOf('month').format('YYYY-MM-DD');
                        _that.value.end = moment(_that.value.end).add(1, 'month').endOf('month').format('YYYY-MM-DD');
                        break;
                    case _that.Const.QUICKDATE.LASTMONTH:
                        _that.value.start = moment(_that.value.start).subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
                        _that.value.end = moment(_that.value.end).subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
                        break;
                }
                var $DATEPICKER = _that.dom.cached.target;
                $DATEPICKER.filter('[data-type="start"]').each(function () {
                    $(this).val(_that.value.start);
                    // $(this).parent().find('span').text($(this).val());
                });
                $DATEPICKER.filter('[data-type="end"]').each(function () {
                    $(this).val(_that.value.end);
                });

                _that.callback();
            }
        };
        _that.dom = {
            cached: {
                target: $(obj),
                directives: $(obj).closest('.datepicker-container').find('.datemove'),
                quickButton: $(obj).closest('.datepicker-container').find('button.date-quick'),
                quickSelect: $(obj).closest('.datepicker-container').find('select.date-quick')
                // datepicker: $(obj).find(':input.datepicker')
            },
            fragment: {
                tooltip: "<div class='tipLayer'>{{sToolTip}}</div>"
            }
        };

        _that.Const = {
            QUICKDATE: {
                TODAY: 0,
                LASTDAY: 1,
                LAST7: 2,
                LAST30: 3,
                THISMONTH: 4,
                LASTMONTH: 5
            }
        };

        if (_that.dom.cached.target.length) {
            // _that.dom.cached.target.parent().on('click', _that.fn.toggleCalendar);
            _that.dom.cached.target.on("dp.change", _that.fn.changeDate);
            // _that.dom.cached.directives.on('click', _that.fn.moveDate);
            _that.dom.cached.quickButton.on('click', _that.fn.quickDate);
            _that.dom.cached.quickSelect.on('changed.bs.select', _that.fn.quickDate);
        }

        return _instance;

    };

    exports.myDatePicker = DatePicker; //new DatePicker(".datepicker");



})(window);
