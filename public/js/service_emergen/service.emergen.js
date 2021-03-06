(function (exports) {
    'use strict';

    // var $DATEPICKER = $('.datepicker');
    var $SERVICESEARCH = $(':input[name="service-search"]');
    var $SERVICE_DESKTOP = $('tbody#service-desktop');
    var $SERVICE_MOBILE = $('#service-mobile');

    var emergens = null;
    var filterData = null;
    var OPTIONKEY = 'service_emergen';

    var options = sessionStorage.getItem(OPTIONKEY) ? JSON.parse(sessionStorage.getItem(OPTIONKEY)) : {
        date: {
            // month: moment().format('YYYY-MM'),
            start: moment().startOf('month').format('YYYY-MM-DD'),
            end: moment().endOf('month').format('YYYY-MM-DD')
        },
        search: ''
    };

    if (sessionStorage.getItem(OPTIONKEY)) {
        options = JSON.parse(sessionStorage.getItem(OPTIONKEY));
        $SERVICESEARCH.val(options.search);
    }

    var ServiceDatePicker = new myDatePicker('.datepicker.emergen');
    ServiceDatePicker.fn.init(options.date, ChangeDate);

    function ChangeDate() {
        options.date.start = ServiceDatePicker.value.start;
        options.date.end = ServiceDatePicker.value.end;
        Load();
    }

    $SERVICESEARCH.bind('keyup', function (event) {
        if (event.keyCode === 13) {
            options.search = $(this).val().trim();
            sessionStorage.setItem(OPTIONKEY, JSON.stringify(options));
            // TextFiltering(options.search);

        }
    })

    $SERVICE_DESKTOP.bind('click', function (event) {
        var $TR;
        if (event.target.tagName !== 'TR') {
            $TR = $(event.target).closest('tr');
        } else {
            $TR = $(event.target);
        }
        // location.href = '/serviceemergen/view?index=' + $TR.data('index');
        var index = $TR.data('index')
        RenderDetail(index)
        // $TR.closest('body').find('tr#comment-' + index).toggleClass('in')
    })

    function Clear() {
        $SERVICE_DESKTOP.empty();
        $SERVICE_MOBILE.empty();
    }

    function TextFiltering(value) {
        if (value.length) {
            var _filterData = filterData = [];
            var finders = params.finder.map(function (find) {
                return find['label'];
            });

            finders.forEach(function (key) {
                var particle = [];
                particle = articles.filter(function (article) {
                    return article['?????????'][key] ? article['?????????'][key].indexOf(value) >= 0 : false;
                });
                _filterData = _filterData.concat(particle);
            });

            $.each(_filterData, function (i, el) {
                if ($.inArray(el, filterData) === -1) filterData.push(el);
            });

            Render();

        } else {
            filterData = null;
        }


    }

    function Filtering(key, value) {

        filterData = emergens


        Render();
    }


    function Load() {
        sessionStorage.setItem(OPTIONKEY, JSON.stringify(options));
        axios.get(API.EMERGEN.LIST, {
                params: options
            })
            .then(function (result) {
                console.log(result);
                emergens = result.data;
                Filtering()
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })
    }

    function Render() {

        Clear();

        var $ROW, $MOBILELIST, status
        filterData.forEach(function (emergen, index) {
            $ROW = '';
            $MOBILELIST = '';
            switch (emergen['??????']) {
                case 0:
                    status = '??????';
                    break;
                case 1:
                    status = '?????????';
                    break;
                case 2:
                    status = "??????";
                    break;
                case 3:
                    status = "??????";
                    break;
                case 4:
                    status = "??????";
                    break;
            }

            $ROW += '<tr data-index="' + emergen['?????????ID'] + '">';
            $ROW += '    <td>' + (index + 1) + '</td>';
            $ROW += '    <td>' + emergen['????????????'] + '</td>';
            $ROW += '    <td>' + emergen['????????????'] + '</td>';
            $ROW += '    <td>' + emergen['?????????'] + '</td>';
            $ROW += '    <td>' + emergen['??????'] + '</td>';
            $ROW += '    <td>' + status + '</td>';
            $ROW += '    <td>' + emergen['????????????'] + '</td>';
            $ROW += '    <td>' + emergen['????????????'] + '</td>';
            $ROW += '    <td>' + emergen['????????????'] + '</td>';
            $ROW += '</tr>';
            // $ROW += '<tr id="comment-' + emergen['?????????ID'] + '" class="collapse">';
            // $ROW += '   <td colspan="7">';
            // $ROW += '       <table class="table">';
            // $ROW += '           <tbody>';
            // $ROW += '               <tr>';
            // $ROW += '                   <th class="text-right">????????????</th>';
            // $ROW += '                   <td colspan="6"><pre>' + emergen['????????????'] + '</pre></td>';
            // $ROW += '               </tr>';
            // $ROW += '               <tr>';
            // $ROW += '                   <th class="text-right">?????????</th>';
            // $ROW += '                   <td colspan="6"></td>';
            // $ROW += '               </tr>';
            // $ROW += '               <tr>';
            // $ROW += '                   <th class="text-right">????????????</th>';
            // $ROW += '                   <td colspan="6"></td>';
            // $ROW += '               </tr>';
            // $ROW += '               <tr>';
            // $ROW += '                   <th class="text-right">??????</th>';
            // $ROW += '                   <td colspan="6">';
            // $ROW += '                       <button class="btn btn-default">??????</button>';
            // $ROW += '                       <button class="btn btn-default">??????</button>';
            // $ROW += '                   </td>';
            // $ROW += '               </tr>';
            // $ROW += '           </tbody>';
            // $ROW += '       </table>';
            // $ROW += '   </td>'
            // $ROW += '</tr>'

            $SERVICE_DESKTOP.append($ROW);
            $SERVICE_MOBILE.append($MOBILELIST);


        });
    }

    function RenderDetail(index) {
        var $modal = $('.detail-modal')
        var $el = $modal.find('#service-detail>.container')
        var item = emergens.find(function (_item) {
            return _item['?????????ID'] === index
        })

        $el.empty()


        // 1. ????????????
        $el.append(_rowItem('', 'label', ''))
        $el.append(_rowItem('????????????', 'label', item['????????????']))

        $el.append(_rowItem('????????????', 'label', item['????????????']))
        $el.append('<div class="divider-dashed"></div>')
        $el.append(_rowItem('AS??????', 'label', item['??????']))

        $el.append(_rowItem('?????????', 'label', item['????????????']))

        $el.append(_rowItem('?????????', 'label', item['?????????']))
        $el.append('<div class="divider-dashed"></div>')
        $el.append(_rowItem('????????????', 'label', item['????????????']))
        $el.append(_rowItem('????????????', 'textarea', item['????????????']))
        if (item['??????'] != 0) {
            $el.append(_rowItem('?????????', 'label', item['????????????']))
            $el.append(_rowItem('????????????', 'label', item['????????????']))
        }
        $el.append('<div class="divider-dashed"></div>')
        $el.append(_rowItem('??????', 'select', item['??????']))
        $el.append('<div class="ln_solid"></div>')
        $el.append(_rowItem('', 'button', item['?????????ID']))

        $el.find('.selectpicker').selectpicker()
        $el.find('button#save').bind('click', function (event) {
            UpdateService($el, $(this).data('index'))
        })

        $modal.modal('show')

        function _rowItem(label, inputType, value) {
            var $ROW = '<div class="row">'
            $ROW += '<label class="control-label col-md-3">' + label + '</label>'
            $ROW += '<div class="col-md-9">'
            switch (inputType) {
                case "text":
                    $ROW += '   <input type="text" class="form-control" value="' + value + '">'
                    break
                case "select":
                    $ROW += '   <select class="selectpicker form-control" data-width="fit" data-name="' + label + '">'
                    $ROW += '       <option value="0" ' + (value == 0 ? 'selected' : '') + '>??????</option>'
                    $ROW += '       <option value="1" ' + (value == 1 ? 'selected' : '') + '>?????????</option>'
                    $ROW += '       <option value="2" ' + (value == 2 ? 'selected' : '') + '>??????</option>'
                    $ROW += '       <option value="3" ' + (value == 3 ? 'selected' : '') + '>??????</option>'
                    $ROW += '       <option value="4" ' + (value == 4 ? 'selected' : '') + '>??????</option>'
                    $ROW += '   </select>'
                    break
                case "textarea":
                    $ROW += '   <textarea class="form-control" rows="8" data-name="' + label + '">' + value + '</textarea>'
                    break
                case "button":
                    $ROW += '   <p class="pull-right">'
                    $ROW += '       <button class="btn btn-success" id="save" type="button" data-index="' + value + '">??????</button>'
                    $ROW += '       <button type="button" class="btn btn-default" data-dismiss="modal">??????</button>'
                    $ROW += '   </p>'
                    break
                case "label":
                    $ROW += '   <p class="form-text">' + value.replace(/\n/gim, '<br>') + '</p>'
                    break
            }
            $ROW += '</div>'
            $ROW += '</div>'
            return $ROW
        }
    }

    function UpdateService(el, index) {
        var item = emergens.find(function (_item) {
            return _item['?????????ID'] === index
        })

        item['????????????'] = el.find('[data-name="????????????"]').val()
        item['??????'] = el.find('[data-name="??????"]').selectpicker('val')
        item['?????????'] = params.user['?????????']
        item['????????????'] = params.user['??????']
        item['????????????'] = moment().format('llll')

        axios.put(API.EMERGEN.DETAIL, item)
            .then(function () {
                $('.detail-modal').modal('hide')
                Load()
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })

    }
    Load();

})(window);
