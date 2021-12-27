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
                    return article['데이터'][key] ? article['데이터'][key].indexOf(value) >= 0 : false;
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
            switch (emergen['상태']) {
                case 0:
                    status = '접수';
                    break;
                case 1:
                    status = '처리중';
                    break;
                case 2:
                    status = "완료";
                    break;
                case 3:
                    status = "보류";
                    break;
                case 4:
                    status = "취소";
                    break;
            }

            $ROW += '<tr data-index="' + emergen['서비스ID'] + '">';
            $ROW += '    <td>' + (index + 1) + '</td>';
            $ROW += '    <td>' + emergen['기관코드'] + '</td>';
            $ROW += '    <td>' + emergen['기관명칭'] + '</td>';
            $ROW += '    <td>' + emergen['접수자'] + '</td>';
            $ROW += '    <td>' + emergen['유형'] + '</td>';
            $ROW += '    <td>' + status + '</td>';
            $ROW += '    <td>' + emergen['접수시간'] + '</td>';
            $ROW += '    <td>' + emergen['처리자명'] + '</td>';
            $ROW += '    <td>' + emergen['처리시간'] + '</td>';
            $ROW += '</tr>';
            // $ROW += '<tr id="comment-' + emergen['서비스ID'] + '" class="collapse">';
            // $ROW += '   <td colspan="7">';
            // $ROW += '       <table class="table">';
            // $ROW += '           <tbody>';
            // $ROW += '               <tr>';
            // $ROW += '                   <th class="text-right">문의내용</th>';
            // $ROW += '                   <td colspan="6"><pre>' + emergen['문의내용'] + '</pre></td>';
            // $ROW += '               </tr>';
            // $ROW += '               <tr>';
            // $ROW += '                   <th class="text-right">처리자</th>';
            // $ROW += '                   <td colspan="6"></td>';
            // $ROW += '               </tr>';
            // $ROW += '               <tr>';
            // $ROW += '                   <th class="text-right">처리내용</th>';
            // $ROW += '                   <td colspan="6"></td>';
            // $ROW += '               </tr>';
            // $ROW += '               <tr>';
            // $ROW += '                   <th class="text-right">상태</th>';
            // $ROW += '                   <td colspan="6">';
            // $ROW += '                       <button class="btn btn-default">완료</button>';
            // $ROW += '                       <button class="btn btn-default">보류</button>';
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
            return _item['서비스ID'] === index
        })

        $el.empty()


        // 1. 기관정보
        $el.append(_rowItem('', 'label', ''))
        $el.append(_rowItem('기관코드', 'label', item['기관코드']))

        $el.append(_rowItem('기관명칭', 'label', item['기관명칭']))
        $el.append('<div class="divider-dashed"></div>')
        $el.append(_rowItem('AS유형', 'label', item['유형']))

        $el.append(_rowItem('접수일', 'label', item['접수시간']))

        $el.append(_rowItem('접수자', 'label', item['접수자']))
        $el.append('<div class="divider-dashed"></div>')
        $el.append(_rowItem('문의내용', 'label', item['문의내용']))
        $el.append(_rowItem('처리내용', 'textarea', item['처리내용']))
        if (item['상태'] != 0) {
            $el.append(_rowItem('처리자', 'label', item['처리자명']))
            $el.append(_rowItem('처리시간', 'label', item['처리시간']))
        }
        $el.append('<div class="divider-dashed"></div>')
        $el.append(_rowItem('상태', 'select', item['상태']))
        $el.append('<div class="ln_solid"></div>')
        $el.append(_rowItem('', 'button', item['서비스ID']))

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
                    $ROW += '       <option value="0" ' + (value == 0 ? 'selected' : '') + '>접수</option>'
                    $ROW += '       <option value="1" ' + (value == 1 ? 'selected' : '') + '>처리중</option>'
                    $ROW += '       <option value="2" ' + (value == 2 ? 'selected' : '') + '>완료</option>'
                    $ROW += '       <option value="3" ' + (value == 3 ? 'selected' : '') + '>보류</option>'
                    $ROW += '       <option value="4" ' + (value == 4 ? 'selected' : '') + '>취소</option>'
                    $ROW += '   </select>'
                    break
                case "textarea":
                    $ROW += '   <textarea class="form-control" rows="8" data-name="' + label + '">' + value + '</textarea>'
                    break
                case "button":
                    $ROW += '   <p class="pull-right">'
                    $ROW += '       <button class="btn btn-success" id="save" type="button" data-index="' + value + '">저장</button>'
                    $ROW += '       <button type="button" class="btn btn-default" data-dismiss="modal">닫기</button>'
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
            return _item['서비스ID'] === index
        })

        item['처리내용'] = el.find('[data-name="처리내용"]').val()
        item['상태'] = el.find('[data-name="상태"]').selectpicker('val')
        item['처리자'] = params.user['인덱스']
        item['처리자명'] = params.user['이름']
        item['처리시간'] = moment().format('llll')

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
