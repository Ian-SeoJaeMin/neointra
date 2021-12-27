(function (exports) {

    'use strict'


    function autoTags(el) {

        var _instance = null,
            _target = el,
            _this = this;

        // var tags = (function () {
        //     axios.get(API.SERVICE.TAGS)
        //         .then(function (result) {

        //         })
        // })()

        // tags.sort()
        // tags = tags.filter(function (tag, pos, self) {
        //     return self.indexOf(tag) == pos
        // })

        var tags = null
        autoTags = function () {
            return _instance;
        }

        autoTags.prototype = this;
        _instance = new autoTags();
        _instance.constructor = autoTags();

        _target.autocomplete({
            source: function (request, response) {

                if (tags) {
                    var term = extractLast(request.term)
                    if (term.trim().length) {
                        response($.ui.autocomplete.filter(tags.names, term))
                    }
                } else {
                    axios.get(API.SERVICE.TAGS)
                        .then(function (result) {
                            tags = {
                                names: [],
                                origins: result.data.tags
                            }
                            // preserve newlines, etc - use valid JSON
                            tags.origins = tags.origins.replace(/\\n/g, "\\n")
                                           .replace(/\\'/g, "\\'")
                                           .replace(/\\"/g, '\\"')
                                           .replace(/\\&/g, "\\&")
                                           .replace(/\\r/g, "\\r")
                                           .replace(/\\t/g, "\\t")
                                           .replace(/\\b/g, "\\b")
                                           .replace(/\\f/g, "\\f");
                            // remove non-printable and other non-valid JSON chars
                            tags.origins = tags.origins.replace(/[\u0000-\u0019]+/g,"");
                            tags.origins = JSON.parse(tags.origins)

                            tags.names = tags.origins.map(function(tag){
                                return tag.name
                            })
                            response($.ui.autocomplete.filter(tags.names, extractLast(request.term)))
                        })
                        .catch(function (error) {
                            console.log(error)
                        })
                }

            },
            minLength: 0,
            focus: function () {
                // prevent value inserted on focus
                return false;
            },
            select: function (event, ui) {
                var terms = split(this.value, true);
                var comment = ''
                var isNewLine = false
                var tag = ui.item.value.trim()

                terms.splice(terms.length - 1, 1)

                tag = tags.origins.find(function(_tag){
                    return _tag.name === tag
                })

                comment += '1. ' + tag.name + '\n'
                if (tag.required.length == 1) {
                    // comment += '2. 아래의 추가정보를 입력해주시면 원활하고 빠른게 처리해드릴 수 있습니다.\n'
                    comment += '2. ' + tag.required[0] + ' : '
                } else if (tag.required.length > 1) {
                    // comment += '2. 아래의 추가정보를 입력해주시면 원활하고 빠른게 처리해드릴 수 있습니다.\n'
                    comment += '2. \n'
                    tag.required.forEach(function(required){
                        comment += '\t' + required + ' : \n'
                    })
                } else {
                    comment += '2. '
                }

                terms.push(comment);
                terms = terms.filter(function (item) {
                    return item.length >= 1
                })
                comment = ''
                terms.forEach(function (item) {
                    if (item === '&newline') {
                        comment += '\n'
                        isNewLine = true
                    } else {
                        if (comment.length > 0) {
                            if (isNewLine) {
                                isNewLine = false
                            } else {
                                comment += ' '
                            }
                        }
                        comment += item
                    }
                })
                this.value = comment//terms.join(" ").replace(/&newline/g, '\n');

                return false;
            },
            open: function (event, ui) {
                // console.log('open')
                var caret = getCaretCoordinates(this, this.selectionEnd)
                // console.log(this.offsetTop, caret.top)
                console.log(caret)
                var $menu = $('.ui-menu')
                $menu.css({
                    'position': 'absolute',
                    'left': (this.offsetLeft + caret.left) + 'px',
                    'top': (this.offsetTop + (caret.top) + 100) + 'px',
                    'width': '50%'
                });
            }
        })
        _target.bind("keydown", function (event) {
            // console.log(event.keyCode, $(this).autocomplete("instance").menu.active)
            if (event.keyCode === $.ui.keyCode.ENTER &&
                $(this).autocomplete("instance").menu.active) {
                event.preventDefault();
            }
        })
        // _target.bind('keyup', function (event) {
        //     // console.log(event.keyCode)
        //     if (event.keyCode !== 21 && event.keyCode !== 13) {
        //         var keyword = $(this).val().trim().split(' ')
        //         _target.autocomplete('search', keyword[keyword.length - 1])
        //     }
        // })

        function split(val, isSelect) {
            return isSelect ? val.replace(/\n/g, ' &newline ').split(' ') : val.replace(/\n/g, ' ').split(' ');
        }
        function extractLast(term) {
            return split(term).pop();
        }
    }
    exports.autoTags = autoTags
    // exports.Tags = new autoTags($(document));

})(window)
