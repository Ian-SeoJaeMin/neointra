(function (exports) {

    'use strict';

    var $ELEMENTS = $('.board-element');
    var $BOARD_TEMPLATE = $('#board-template');
    var $BOARD_TEMPLATE_FORM = $('#board-template-form');
    var $ELEMENT_ATTR = $('#element-attr');
    var $ELEMENT_ATTR_SAVE = $ELEMENT_ATTR.find('#attribute-save');
    var $SELECTITEMLIST = $ELEMENT_ATTR.find('ul[data-name="listitem"]');
    var $SELECTITEMINPUT = $ELEMENT_ATTR.find('input.select-option-item');
    var $SELECTITEMADD = $ELEMENT_ATTR.find('button.select-option-add');

    var ELEMENT = {
        '텍스트': {
            name: '텍스트',
            type: '텍스트',
            label: '텍스트',
            require: false,
            placeholder: '',
            tooltip: false,
            default: '',
            class: 'form-control'
        },
        '멀티텍스트': {
            name: '멀티텍스트',
            type: '멀티텍스트',
            label: '멀티텍스트',
            require: false,
            placeholder: '',
            tooltip: false,
            rows: 15,
            default: '',
            class: 'form-control'
        },
        '숫자': {
            name: '숫자',
            type: '숫자',
            label: '숫자',
            require: false,
            placeholder: '',
            tooltip: false,
            default: '',
            format: '',
            class: 'form-control'
        },
        '드롭박스': {
            name: '드롭박스',
            type: '드롭박스',
            label: '드롭박스',
            require: false,
            placeholder: '',
            tooltip: false,
            default: '',
            multiple: false,
            listitem: ['전체'],
            class: 'form-control selectpicker'
        },
        '날짜': {
            name: '날짜',
            type: '날짜',
            label: '날짜',
            require: false,
            placeholder: '',
            tooltip: false,
            format: 'YYYY-MM-DD',
            class: 'form-control datepicker'
        },
        '파일첨부': {
            name: '파일첨부',
            type: '파일첨부',
            label: '파일첨부',
            require: false,
            placeholder: '',
            tooltip: false,
            accept: '',
            multiple: false,
            class: 'input-group'
        },
        '직원선택': {
            name: '직원선택',
            type: '직원선택',
            label: '직원선택',
            require: false,
            placeholder: '',
            tooltip: false,
            default: '',
            multiple: false,
            listitem: params.users,
            class: 'form-control selectpicker'
        },
        '부서선택': {
            name: '부서선택',
            type: '부서선택',
            label: '부서선택',
            require: false,
            placeholder: '',
            tooltip: false,
            default: '',
            multiple: false,
            listitem: [],
            class: 'form-control selectpicker'
        },
        '지사선택': {
            name: '지사선택',
            type: '지사선택',
            label: '지사선택',
            require: false,
            placeholder: '',
            tooltip: false,
            default: '',
            multiple: false,
            listitem: params.areas,
            class: 'form-control selectpicker'
        },
        '프로그램선택': {
            name: '프로그램선택',
            type: '프로그램선택',
            label: '프로그램선택',
            require: false,
            placeholder: '',
            tooltip: false,
            default: '',
            multiple: true,
            listitem: ['SenseChart', 'MediChart', 'Eplus', 'EChart', 'HanimacPro', 'SenseChart(H)'],
            class: 'form-control selectpicker'
        },
        '실행파일선택': {
            name: '실행파일선택',
            type: '실행파일선택',
            label: '실행파일선택',
            require: false,
            placeholder: '',
            tooltip: false,
            default: '',
            multiple: true,
            listitem: ['데스크', '입원수납', '청구심사', '진료실', '병동', '진료지원', '병원관리', '문서관리', '통계', '메인', '펜챠트', '대기자', '기타'],
            class: 'form-control selectpicker'
        }
    }


    var ELEMENT_TEMPLATE = '';
    ELEMENT_TEMPLATE += '<div class="board-element-box">';
    ELEMENT_TEMPLATE += '    <div class="board-element-mask"></div>';
    ELEMENT_TEMPLATE += '    <div class="board-element-tools">';
    ELEMENT_TEMPLATE += '        <button type="button" class="btn btn-round btn-xs btn-default element-tools fa fa-chevron-up" data-tool="up"></button>';
    ELEMENT_TEMPLATE += '        <button type="button" class="btn btn-round btn-xs btn-default element-tools fa fa-chevron-down" data-tool="down"></button>';
    ELEMENT_TEMPLATE += '        <button type="button" class="btn btn-round btn-xs btn-default element-tools fa fa-remove" data-tool="remove"></button>';
    ELEMENT_TEMPLATE += '    </div>';
    ELEMENT_TEMPLATE += '    <div class="form-group">';
    ELEMENT_TEMPLATE += '        <label class="control-label col-lg-3 col-md-3 col-sm-3 col-xs-12 element-label">';
    ELEMENT_TEMPLATE += '        </label>';
    ELEMENT_TEMPLATE += '        <div class="col-lg-8 col-md-6 col-sm-6 col-xs-12 element-input">';
    ELEMENT_TEMPLATE += '        </div>';
    ELEMENT_TEMPLATE += '    </div>';
    // ELEMENT_TEMPLATE += '    <div class="divider-dashed"></div>';
    ELEMENT_TEMPLATE += '</div>';

    var elements = params.board['입력필드'];
    var selectElement = null;

    $SELECTITEMLIST.sortable({
        placeholder: "ui-state-highlight"
        // start: function (event, ui) {
        //     console.log(event, ui);
        //     $(ui.item).find('.list-group-addon .fa').toggleClass('fa-hand-paper-o fa-hand-grab-o');
        // },
        // stop: function (event, ui) {
        //     $(ui.item).find('.list-group-addon .fa').toggleClass('fa-hand-paper-o fa-hand-grab-o');
        // }
    });

    $ELEMENTS.bind('click', function (event) {
        event.preventDefault();

        InsertElement(ELEMENT[$(this).data('element')], true);

    });

    $BOARD_TEMPLATE.bind('click', function (event) {
        var $THIS;
        if (event.target.className === 'board-element-mask') {
            $THIS = $(event.target).parent();
            $THIS.addClass('element-select').siblings().removeClass('element-select');
            LoadAttribute($THIS.data('index'));
        } else if (event.target.parentElement.className === 'board-element-tools') {
            $THIS = $(event.target);
            if ($THIS.data('tool') === 'remove') {
                RemoveElement($THIS.closest('.board-element-box'));
            } else {
                MoveElement($THIS.closest('.board-element-box'), $THIS.data('tool'));
            }
        }
    });

    $ELEMENT_ATTR.bind('keydown', function (event) {
        if (event.keyCode === 13) {
            return false;
        }
    });
    $ELEMENT_ATTR.bind('submit', function (event) {
        event.preventDefault();

        if (event.keyCode === 13) {
            return;
        }


        // var index = $ELEMENT_ATTR.data('index');

        if (!selectElement) {
            swal('편집하실 입력요소를 선택해주세요.', '', 'error');
            return;
        } else {
            Object.keys(selectElement).forEach(function (key) {
                var $ATTR = $ELEMENT_ATTR.find(':input[data-name="' + key + '"]');
                if ($ATTR.length) {
                    if (key.match(/require|tooltip|multiple|header|finder/)) {
                        selectElement[key] = $ATTR.is(':checked');
                    } else if (key.match(/format|accept/)) {
                        // $ATTR = $ELEMENT_ATTR.find('select[data-name="' + key + '"]');
                        selectElement[key] = $ATTR.selectpicker('val');
                    } else {
                        selectElement[key] = $ATTR.val().trim();
                    }
                } else if (key === 'listitem') {
                    $ATTR = $SELECTITEMLIST;
                    selectElement[key] = [];
                    $ATTR.find('li').each(function (index, item) {
                        selectElement[key].push($(item).text().trim());
                    });
                }
            });
        }

        LoadTemplate();

    });

    $SELECTITEMADD.bind('click', function (event) {
        var option = $SELECTITEMINPUT.val().trim();
        $SELECTITEMINPUT.val('');
        if (option !== '') {
            $SELECTITEMLIST.prepend(
                '<li class="list-group-item">' +
                '   <button class="btn btn-xs btn-round pull-right" type="button"><i class="fa fa-remove"></i></button>' +
                '   ' + option +
                '</li>'
            );
        }
    });

    $SELECTITEMINPUT.bind('keyup', function (event) {
        if (event.keyCode === 13) {
            $SELECTITEMADD.trigger('click');
        }
    })

    $SELECTITEMLIST.bind('click', function (event) {
        var $THIS;
        if (event.target.tagName === 'BUTTON') {
            $THIS = $(event.target);
        } else if (event.target.tagName === 'I') {
            $THIS = $(event.target).parent();
        }

        if ($THIS && $THIS.length) {
            $THIS.parent().remove();
        }
    });

    $BOARD_TEMPLATE_FORM.bind('submit', function (event) {
        event.preventDefault();
        swal({
            title: '게시판 입력화면',
            text: '설정하신 내용으로 저장하겠습니까?',
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then(function () {
            SaveBoard();
        }, function (dismiss) {
            console.log(dismiss);
        });
    });

    function LoadTemplate() {
        $BOARD_TEMPLATE.empty();
        elements.forEach(function (element, index) {
            InsertElement(element, false, index);
        }, this);
    }

    function LoadAttribute(index) {
        selectElement = elements[index];
        var additionalAttr = $ELEMENT_ATTR.find('.optional-attr').find('.form-group');

        $ELEMENT_ATTR.data('index', index);

        additionalAttr.addClass('hidden');
        additionalAttr.each(function (index, el) {
            var $EL = $(el);
            var key = $EL.data('name');
            if (selectElement.hasOwnProperty(key)) {
                $EL.removeClass('hidden');
            }
        });

        Object.keys(selectElement).forEach(function (k) {

            var $ATTR = $ELEMENT_ATTR.find(':input[data-name="' + k + '"]');
            if ($ATTR.length) {
                if (k.match(/require|tooltip|multiple|header|finder/)) {
                    $ATTR.iCheck(selectElement[k] ? 'check' : 'uncheck');
                } else if (k.match(/format|accept/)) {
                    // $ATTR = $ELEMENT_ATTR.find('select[data-name="' + k + '"]');
                    $ATTR.selectpicker('val', selectElement[k]);
                    if (k === 'format') {
                        if (selectElement.type === '날짜') {
                            $ATTR.find('optgroup[label="Number"]').attr('disabled', 'disabled');
                            $ATTR.find('optgroup[label="Date"]').removeAttr('disabled');
                        } else {
                            $ATTR.find('optgroup[label="Number"]').removeAttr('disabled');
                            $ATTR.find('optgroup[label="Date"]').attr('disabled', 'disabled');
                        }
                    }
                    $ATTR.selectpicker('refresh');
                } else {
                    $ATTR.val(selectElement[k]);
                }
            } else if (k === 'listitem') {
                $ATTR = $ELEMENT_ATTR.find('ul[data-name="' + k + '"]');
                $ATTR.empty();
                selectElement[k].forEach(function (item) {
                    $ATTR.append(
                        '<li class="list-group-item">' +
                        // '   <span class="list-group-addon"><i class="fa fa-hand-paper-o"></i></span>' +
                        '   <button class="btn btn-xs btn-round pull-right" type="button">' +
                        '       <i class="fa fa-remove"></i>' +
                        '   </button>' +
                        item +
                        '</li>'
                    )
                })
            }
        })

    }

    function InsertElement(element, isNew, index) {

        var $ELEMENTBOX = $(ELEMENT_TEMPLATE);
        var $ELEMENT;
        var attr = {};
        var command = '';

        if (isNew) {
            element = JSON.parse(JSON.stringify(element));
            element.name = element.name + (elements.length + 1);
            elements.push(element);
            index = elements.length - 1;
        }

        // NEW ATTRIBUTE
        element['header'] = element['header'] || false;
        element['finder'] = element['finder'] || false;

        $ELEMENTBOX.attr('data-index', index);
        $ELEMENTBOX.find('.element-label').text(element.label);

        switch (element.type) {
            case '텍스트':
                $ELEMENT = $('<input/>');
                attr['type'] = 'text';
                attr['value'] = element.default;
                break;
            case '멀티텍스트':
                $ELEMENT = $('<textarea/>');
                attr['style'] = 'resize:none;';
                attr['rows'] = element.rows;
                // attr['value'] = element.default.replace(/\\n/gim, '<br>');
                $ELEMENT.append(element.default.replace(/\\n/gim, '\n'));

                break;
            case '숫자':
                $ELEMENT = $('<input/>');
                attr['type'] = 'number';
                attr['data-format'] = element.format;
                attr['value'] = element.default;
                break;
            case '직원선택':
            case '부서선택':
            case '지사선택':
            case '프로그램선택':
            case '실행파일선택':
            case '드롭박스':
                $ELEMENT = $('<select/>');
                attr['disabled'] = 'disabled';
                command = 'RenderSelectPicker';
                break;
            case '날짜':
                $ELEMENT = $('<input/>');
                attr['type'] = 'text';
                attr['data-format'] = element.format;
                // command = 'RenderDatePicker';
                break;
            case '파일첨부':
                $ELEMENT = $('<div />');
                $ELEMENT.append(
                    '<label class="input-group-btn">' +
                    '    <span class="btn btn-primary">파일첨부</span>' +
                    '</label>' +
                    '<input type="text" class="form-control input inpu-xs" readonly />'
                );
                break;
        }

        attr['readonly'] = 'readonly';
        attr['class'] = element.class || 'form-control';
        attr['data-name'] = element.name;

        if (element.require) {
            attr['required'] = 'required';
        }

        if (element.tooltip) {
            attr['title'] = element.placeholder;
            attr['data-toggle'] = 'tooltip';
        } else {
            attr['placeholder'] = element.placeholder;
        }

        if (element.multiple) {
            attr['multiple'] = 'multiple';
        }

        if (element.listitem) {
            element.listitem.forEach(function (item) {
                $ELEMENT.append(
                    '<option value="' + (item === '전체' ? '' : item) + '">' + item + '</option>'
                )
            });
        }
        $ELEMENT.attr(attr);
        $ELEMENTBOX.find('.element-input').append($ELEMENT);
        $ELEMENTBOX.appendTo($BOARD_TEMPLATE);

        element['elbox'] = $ELEMENTBOX;
        element['el'] = $ELEMENT;

        if (command !== '') {
            RenderElement(command, index);
        }
    }

    function RenderElement(command, index) {
        var commands = {
            'RenderSelectPicker': function () {
                $('.selectpicker').selectpicker();
            },
            'RenderDatepicker': function () {
                $('.datepicker').datetimepicker({
                    format: elemens[index].format,
                    showTodayButton: true
                })
            }
        };
        return commands[command]();
    }

    function RemoveElement(box) {
        var index = box.data('index');
        elements.splice(index, 1);
        box.remove();
    }

    function MoveElement(box, direction) {
        var index = box.data('index');

        if (typeof Array.prototype.move !== 'function') {
            Array.prototype.move = function (from, to) {
                this.splice(to, 0, this.splice(from, 1)[0]);
            };
        }

        if (direction === 'up') {
            elements.move(index, index - 1);
            index = index - 1;
            // box.siblings().filter('[data-index="' + (index - 1) + '"]').before(box);
        } else {
            elements.move(index, index + 1);
            index = index + 1;
            // box.siblings().filter('[data-index="' + (index + 1) + '"]').next(box);
        }

        LoadTemplate();


        $('.board-element-box').filter('[data-index="' + index + '"]').addClass('element-select');
        //     $(box).attr('data-index', index).data('index', index);
        // })

    }

    function SaveBoard() {
        console.log(elements);
        elements.forEach(function (element) {
            delete element['el'];
            delete element['elbox'];
        });

        axios.put(API.BOARD.MANAGE, params.board)
            .then(function (result) {
                swal('저장되었습니다.', '', 'success')
                    .then(function () {
                        location.href = '/board/manage';
                    })
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })
    }


    LoadTemplate();

})(window);