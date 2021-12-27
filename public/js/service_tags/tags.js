;
(function (exports) {
    'use strict'

    var Tags = function () {
        var _instance = null,
            _this = this

        Tags = function () {
            return _instance
        }
        Tags.prototype = this
        _instance = new Tags()
        _instance.constructor = Tags()

        var state = {
            select: '',
            selectExe: '',
            tags: null,
            filteredTags: null
        }

        var el = {
            container: null,
            search: null,
            tagExe: null,
            tagModal: null,
            tagForm: null
        }

        var actions = {
            initialize: function () {
                /**
                 * element binding
                 * element event defined
                 * load tags
                 */

                el.container = $('#tag-list')
                el.tagExe = $('#tag-exe')
                el.search = $('.tag-search')
                el.tagModal = $('#tagForm')
                el.tagForm = $('#tag-form')

                el.tagExe.bind('changed.bs.select', function (event) {
                    state.selectExe = $(this).val()
                    actions.filter()
                })

                el.tagForm.bind('submit', function (event) {
                    var exe = el.tagForm.find('#tag-exe').selectpicker('val')
                    var mainCategory = el.tagForm.find('input#main-category').val().trim()
                    var subCategory = el.tagForm.find('input#sub-category').val().trim()
                    var subCategoryIndex = el.tagForm.data('sub-category-index')

                    var _t, _m, _s
                    event.preventDefault()

                    if ($.isNumeric(subCategoryIndex)) { // 수정모드
                        _t = state.tags.find(function (tag) {
                            return tag.exe === exe
                        })
                        if (_t) {
                            _m = _t.mainCategory.find(function (_mainCategory) {
                                return _mainCategory.name === mainCategory
                            })
                            if (_m) {
                                _m.subCategory[subCategoryIndex] = subCategory
                                // 여기서 서버에 저장하는 함수 실행
                                actions.saveTag()
                                actions.filter()
                                el.tagModal.modal('hide')
                            }
                        }
                    } else {
                        // 추가
                        _t = state.tags.find(function (tag) {
                            return tag.exe === exe
                        })
                        if (_t) { // 실행파일 같은거 찾기
                            _m = _t.mainCategory.find(function (_mainCategory) {
                                return _mainCategory.name === mainCategory
                            })
                            if (_m) { // 대분류 같은거 찾기
                                if (_m.subCategory.some(function (_subCategory) {
                                        return _subCategory === subCategory
                                    })) {
                                    swal('', '이미 등록된 태그명입니다.', 'error')
                                } else {
                                    _m.subCategory.push(subCategory)
                                    // 여기서 서버에 저장하는 함수 실행
                                    actions.saveTag(true)
                                    actions.filter()
                                    // el.tagModal.modal('hide')
                                }
                            } else {
                                _t.mainCategory.push({
                                    name: mainCategory,
                                    subCategory: [subCategory]
                                })
                                actions.saveTag(true)
                                actions.filter()
                            }
                        } else {
                            _t = {
                                exe: exe,
                                mainCategory: [{
                                    name: mainCategory,
                                    subCategory: [subCategory]
                                }]
                            }
                            state.tags.push(_t)
                            actions.saveTag(true)
                            actions.filter()
                            // el.tagModal.modal('hide')
                        }
                    }

                })

                el.container.bind('click', function (event) {
                    if (event.target.tagName === 'BUTTON' && event.target.dataset.delete === "1") {
                        var $THIS = $(event.target)
                        var exe = $THIS.data('exe')
                        var mainCategory = $THIS.data('main-category')
                        var subCategory = $THIS.data('sub-category')
                        var subCategoryIndex = $THIS.data('sub-category-index')

                        var _t, _m, _s
                        _t = state.tags.find(function (tag) {
                            return tag.exe === exe
                        })
                        if (_t) {
                            _m = _t.mainCategory.find(function (_mainCategory) {
                                return _mainCategory.name === mainCategory
                            })
                            if (_m) {
                                _m.subCategory.splice(subCategoryIndex, 1)
                                // 여기서 서버에 저장하는 함수 실행
                                actions.saveTag()
                                actions.filter()
                            }
                        }
                    }
                })

                el.tagModal.bind('show.bs.modal', function (event) {
                    var $reTarget = $(event.relatedTarget)

                    el.tagForm[0].reset()
                    el.tagForm.find('select#tag-exe').selectpicker('deselectAll')
                    el.tagForm.data('sub-category-index', '')
                    el.tagForm.find('select#tag-exe').removeAttr('disabled')
                    el.tagForm.find('input#main-category').removeAttr('disabled')
                    el.tagForm.find('select#tag-exe').selectpicker('refresh')
                    if ($reTarget.hasClass('tag-act')) {

                        if ($reTarget.attr('data-sub-category-index')) {
                            el.tagForm.data('sub-category-index', $reTarget.data('sub-category-index') + "")
                            el.tagForm.find('select#tag-exe').attr('disabled', true)
                            el.tagForm.find('input#main-category').attr('disabled', true)
                        }

                        el.tagForm.find('select#tag-exe').selectpicker('refresh')

                        if ($reTarget.data('exe')) {
                            el.tagForm.find('select#tag-exe').selectpicker('val', $reTarget.data('exe'))
                        }

                        if ($reTarget.data('main-category')) {
                            el.tagForm.find('input#main-category').val($reTarget.data('main-category'))
                        }

                        if ($reTarget.data('sub-category')) {
                            el.tagForm.find('input#sub-category').val($reTarget.data('sub-category'))
                        }
                    }
                })

                actions.getTags()

            },
            filter: function () {
                if (!state.tags || !state.tags.length) return false
                state.filteredTags = state.tags.filter(function (tag) {
                    return tag.exe === state.selectExe
                })
                actions.render()
            },
            getTags: function () {
                axios
                    .get(API.SERVICE.TAGS)
                    .then(function (result) {
                        state.tags = result.data.tags

                        // preserve newlines, etc - use valid JSON
                        state.tags = state.tags
                            .replace(/\\n/g, '\\n')
                            .replace(/\\'/g, "\\'")
                            .replace(/\\"/g, '\\"')
                            .replace(/\\&/g, '\\&')
                            .replace(/\\r/g, '\\r')
                            .replace(/\\t/g, '\\t')
                            .replace(/\\b/g, '\\b')
                            .replace(/\\f/g, '\\f')
                        // remove non-printable and other non-valid JSON chars
                        state.tags = state.tags.replace(/[\u0000-\u0019]+/g, '')
                        state.tags = JSON.parse(state.tags)

                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            },
            render: function () {
                var $row = ''
                var tags = state.filteredTags
                var exeRowSpan = 0,
                    mainRowSpan = 0
                _this.el.container.empty()
                if (tags.length <= 0) return false

                tags.forEach(function (item, index) {
                    if (item.mainCategory.length > 0) {
                        item.mainCategory.forEach(function (mc, mIdx) {
                            if (mc.subCategory.length > 0) {
                                exeRowSpan += mc.subCategory.length
                                mainRowSpan = mc.subCategory.length
                                mc.subCategory.forEach(function (sc, sIdx) {
                                    $row += '<tr data-exe-index="' + index + '" data-main-category-index="' + mIdx + '" data-sub-category-index="' + sIdx + '">'
                                    if (sIdx === 0) {
                                        if (index === 0 && mIdx === 0) {
                                            $row += '   <td rowspan="{{EXE_ROWSPAN}}">' + item.exe + '<br>'
                                            // $row += '       <button type="button" class="btn btn-xs btn-link tag-act" data-exe="' + item.exe + '" data-toggle="modal" data-target="#tagForm">추가</button>'
                                            $row += '   </td>'
                                        }
                                        $row += '   <td rowspan="' + mainRowSpan + '">' + mc.name + '<br>'
                                        // $row += '       <button type="button" class="btn btn-xs btn-link tag-act" data-exe="' + item.exe + '" data-main-category="' + mc.name + '" data-toggle="modal" data-target="#tagForm">추가</button>'
                                        $row += '   </td>'
                                    }
                                    $row += '   <td>' + sc + '</td>'
                                    $row += '   <td class="text-center">'
                                    $row += '       <button type="button" class="btn btn-xs btn-link tag-act" data-exe="' + item.exe + '" data-main-category="' + mc.name + '" data-sub-category="' + sc + '" data-sub-category-index="' + sIdx + '" data-toggle="modal" data-target="#tagForm">수정</button>'
                                    $row += '       <button type="button" class="btn btn-xs btn-link red tag-act" data-exe="' + item.exe + '" data-main-category="' + mc.name + '" data-sub-category="' + sc + '" data-sub-category-index="' + sIdx + '" data-delete="1">삭제</button>'
                                    $row += '   </td>'
                                    $row += '</tr>'
                                })
                            } else {
                                exeRowSpan += 1
                                $row += '<tr data-exe-index="' + index + '" data-main-category-index="' + mIdx + '">'
                                if (index === 0 && mIdx === 0) {
                                    $row += '   <td rowspan="{{EXE_ROWSPAN}}">' + item.exe + '</td>'
                                }
                                $row += '   <td>' + mc.name + '</td>'
                                $row += '   <td></td>'
                                $row += '   <td class="text-center">'

                                $row += '   </td>'
                                $row += '</tr>'
                            }
                        })
                    }
                })
                $row = $row.replace('{{EXE_ROWSPAN}}', exeRowSpan)
                _this.el.container.append($row)
                // // filteredTags = filteredTags || []
                // // if (!_this.state.tags.names.length && !filteredTags.names.length)
                // if (!_this.state.tags.length) return false
                // var tags = _this.state.tags //filteredTags.length >= 1 ? filteredTags : _this.state.tags
                // var $tag = ''
                // tags.forEach(function(item, index) {
                //     $tag += '<tr data-index="' + index + '">'
                //     $tag +=
                //         '    <td><input type="text" class="form-control input input-sm" data-key="exe" value="' +
                //         (item.exe || '데스크') +
                //         '"/></td>'
                //     $tag +=
                //         '    <td><input type="text" class="form-control input input-sm" data-key="name" value="' +
                //         item.name +
                //         '"/></td>'
                //     $tag +=
                //         '    <td><input type="text" class="form-control input input-sm" data-key="required" value="' +
                //         item.required.join(',') +
                //         '"/></td>'
                //     $tag +=
                //         '    <td class="text-center"><button type="button" class="btn btn-link red fa fa-trash"></button></td>'
                //     $tag += '</tr>'
                //     // $tag +=
                //     //     '<div class="chip animate bounceIn" data-index="' +
                //     //     index +
                //     //     '" data-tag="' +
                //     //     item +
                //     //     '">' +
                //     //     item +
                //     //     '</div>'
                // })
                // _this.el.container.empty().append($tag)
            },

            saveTag: function (popup) {
                var tags = _this.state.tags

                axios.post(API.SERVICE.TAGS, {
                        tags: JSON.stringify(tags),
                        exe: '통합'
                    })
                    .then(function (response) {
                        if (!popup) {
                            swal('', '저장되었습니다.', 'success')
                        }
                    })
                    .catch(function (error) {
                        swal('', '저장을 실패하였습니다.' + error.reponse, 'error')
                    })
            },
            search: function (keyword) {
                var $targets = _this.el.container.find('tr')

                keyword = keyword.toLowerCase()

                $targets.filter(function () {
                    var $input = $(this).find('input:eq(1)')
                    $(this).toggle(
                        $input
                        .val()
                        .toLowerCase()
                        .trim()
                        .indexOf(keyword) > -1
                    )
                })

            }
        }

        _this.state = state
        _this.el = el
        _this.actions = actions

        return _instance
    }

    exports.Tags = new Tags()
    exports.Tags.actions.initialize()
})(window)
