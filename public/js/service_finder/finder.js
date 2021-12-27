;
(function (exports) {
    'use strict'

    String.prototype.replaceAll = function (stringToFind, stringToReplace) {
        if (stringToFind == stringToReplace) return this;
        var temp = this;
        var index = temp.indexOf(stringToFind);
        while (index != -1) {
            temp = temp.replace(stringToFind, stringToReplace);
            index = temp.indexOf(stringToFind);
        }
        return temp;
    };

    var Store = function () {
        var _instance = null,
            _this = this

        Store = function () {
            return _instance
        }
        Store.prototype = this
        _instance = new Store()
        _instance.constructor = Store()

        var consts = {
            FINDER_TYPE: {
                CONTENT: 0,
                TAG: 1
            },
            FINDER_STATUS: {
                HOLD: 3,
                DONE: 4,
                FEEDBACK: 6
            },
            FINDER_ORDER: {
                ACC: 0,
                LIKES: 1
            }
        }

        var state = {
            program: localStorage.getItem('finder-program') || 0,
            type: localStorage.getItem('finder-type') ||
                consts.FINDER_TYPE.CONTENT,
            status: localStorage.getItem('finder-status') || 4,
            search: '',
            innerSearch: '',
            running: false,
            order: localStorage.getItem('finder-order') || 0,
            app: localStorage.getItem('finder-app') || 0,
            pageing: {
                curpage: 1,
                perpage: 10,
                maxpage: 0
            },
            hospital: ''
        }

        var data = null
        var parseData = null
        var mapData = null

        var el = {
            programs: null,
            types: null,
            orders: null,
            apps: null,
            listContainer: null,
            search: null,
            status: null,
            hospital: null,
            innerSearch: null
        }

        var actions = {
            initialize: function () {
                el.programs = $('.finder-programs')
                el.status = $('.finder-status')
                el.types = $('.finder-types')
                el.apps = $('.finder-apps')
                el.orders = $('.finder-order')
                el.listContainer = $('.finder-list-wrapper')
                el.search = $('.finder-search')
                el.hospital = $('#finder-hospital')
                el.innerSearch = $('#inner-search')
                el.programs
                    .filter('[data-value="' + _this.state.program + '"]')
                    .addClass('active')
                // .prepend('<i class="fa fa-check" aria-hidden="true"></i> ')
                el.programs.bind('click', function (event) {
                    event.stopPropagation()
                    var $THIS = $(this)
                    _this.state.program = $THIS.data('value')

                    el.programs.removeClass('active')
                    $THIS.addClass('active')
                    // console.log(state)
                    _this.el.listContainer.empty()
                    _this.actions.renderList()
                })
                el.status
                    .filter('[data-value="' + _this.state.status + '"]')
                    .addClass('active')
                // .prepend('<i class="fa fa-check" aria-hidden="true"></i> ')
                el.status.bind('click', function (event) {
                    event.stopPropagation()
                    var $THIS = $(this)
                    _this.state.status = $THIS.data('value')

                    el.status.removeClass('active')
                    $THIS.addClass('active')
                    // console.log(state)
                    _this.el.listContainer.empty()
                    _this.actions.renderList()
                })
                el.types
                    .filter('[data-value="' + _this.state.type + '"]')
                    .prepend('<i class="fa fa-check" aria-hidden="true"></i> ')
                el.types.bind('click', function (event) {
                    event.stopPropagation()
                    var $THIS = $(this)
                    _this.state.type = $THIS.data('value')

                    el.types.find('.fa-check').remove()
                    $THIS.prepend(
                        '<i class="fa fa-check" aria-hidden="true"></i> '
                    )

                    console.log(_this.state)
                })

                el.orders
                    .filter('[data-value="' + _this.state.order + '"]')
                    .addClass('active')
                // .prepend('<i class="fa fa-check" aria-hidden="true"></i> ')
                el.orders.bind('click', function (event) {
                    event.stopPropagation()
                    var $THIS = $(this)
                    _this.state.order = $THIS.data('value')

                    el.orders.removeClass('active')
                    $THIS.addClass('active')
                    // console.log(state)
                    _this.el.listContainer.empty()
                    _this.actions.renderList()
                })

                el.apps
                    .filter('[data-value="' + _this.state.program + '"]')
                    .addClass('active')
                // .prepend('<i class="fa fa-check" aria-hidden="true"></i> ')
                el.apps.bind('click', function (event) {
                    event.stopPropagation()
                    var $THIS = $(this)
                    _this.state.app = $THIS.data('value')

                    el.apps.removeClass('active')
                    $THIS.addClass('active')
                    // console.log(state)
                    _this.el.listContainer.empty()
                    _this.actions.renderList()
                })

                _this.el.search.bind(
                    'keyup',
                    _.debounce(function (event) {
                        event.preventDefault()
                        _this.state.search = el.search.val()
                        actions.search()
                    }, 500)
                )

                _this.el.listContainer.bind('click', function (event) {
                    event.stopPropagation()
                    var $THIS = null
                    if (event.target.tagName === 'BUTTON') {
                        $THIS = $(event.target)
                    } else if (event.target.tagName === 'I') {
                        $THIS = $(event.target).parent()
                        // if (!$THIS.hasClass('finder-like')) return false
                    }
                    if ($THIS) {
                        if ($THIS.hasClass('finder-like')) {
                            _this.actions.toggleLike($THIS)
                        }
                        if ($THIS.hasClass('finder-dislike')) {
                            swal({
                                    title: 'A/S Finder',
                                    html: '해당 AS건을 검색에서 제외시키시겠습니까?',
                                    type: 'question',
                                    showCancelButton: true,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33'
                                })
                                .then(function (result) {
                                    _this.actions.toggleDislike($THIS)
                                })
                                .catch(function (error) {
                                    fn.errorNotify(error)
                                })
                        }
                    }
                })

                el.hospital.selectpicker({
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
                                    'value': hosp['기관코드'],
                                    'text': hosp['기관명칭'] + '/' + hosp['담당지사'] + (hosp['담당자'].trim().length > 0 ? '/' + hosp['담당자'] : ''),
                                    'disabled': false
                                })
                            });

                            return hosps;
                        },
                        preserveSelected: false
                    });

                el.hospital.bind('changed.bs.select', function (event) {
                    // data.USER_ID = $(this).selectpicker('val');
                    if ($(this).selectpicker('val').length) {
                        _this.state.hospital = $(this).selectpicker('val')
                        _this.el.listContainer.empty()
                        _this.actions.renderList()
                    }
                });

                _this.el.innerSearch.bind(
                    'keyup',
                    _.debounce(function (event) {
                        event.preventDefault()
                        _this.state.innerSearch = el.innerSearch.val()
                        _this.el.listContainer.empty()
                        _this.actions.renderList()
                    }, 500)
                )

                // actions.loadMap()
                if (sessionStorage.getItem('prev')) {
                    _this.actions.search(sessionStorage.getItem('prev'))
                }


                _this.el.listContainer.bind('scroll', function (event) {
                    var $THIS = $(this)
                    // console.log($THIS.scrollTop(), $THIS.height())
                    if ($THIS.scrollTop() + $THIS.height() >= $THIS[0].scrollHeight) {
                        if (_this.data) {
                            _this.state.pageing.curpage += 1
                            if (
                                _this.state.pageing.maxpage <
                                _this.state.pageing.curpage
                            ) {
                                _this.state.pageing.curpage -= 1
                            } else {
                                $('.loader-wrapper')
                                    .removeClass('hidden fadeOut')
                                    .addClass('fadeIn')
                                setTimeout(function () {
                                    _this.actions.renderList()

                                    $('.loader-wrapper')
                                        .removeClass('fadeIn')
                                        .addClass('fadeOut')
                                }, 1000)
                            }
                        }
                    }
                })
            },
            loadMap: function () {
                axios
                    .get(API.FINDER.MAP)
                    .then(function (resp) {
                        _this.mapData = resp.data
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            },
            receiveMessage: function (event) {
                if (_this.state.running) return false

                _this.state = {
                    program: 0,
                    type: consts.FINDER_TYPE.CONTENT,
                    status: 4,
                    search: '',
                    innerSearch: '',
                    running: true,
                    order: 0,
                    app: 0,
                    pageing: {
                        curpage: 1,
                        perpage: 10,
                        maxpage: 0
                    },
                    hospital: ''
                }

                el.hospital.selectpicker('val', '')


                if (event.data) {

                    sessionStorage.setItem('prev', JSON.stringify(event.data))
                    _this.actions.search(event.data)
                    // console.log(event.data)
                }
            },
            search: function (params) {
                if (typeof params !== 'object') {
                    var _params = JSON.parse(sessionStorage.getItem('prev'))
                    params = {
                        search: _this.state.search
                    }

                    if (_params && _params.index) {
                        params.index = _params.index
                    }
                }

                axios
                    .get(API.FINDER.SEARCH, {
                        params: params
                    })
                    .then(function (resp) {
                        _this.data = resp.data
                        // _this.state.pageing.maxpage = Math.ceil(
                        //     _this.data.similarity.length /
                        //     _this.state.pageing.perpage
                        // )
                        return _this.actions.parsing()
                    })
                    .then(function () {
                        _this.state.running = false
                        return _this.actions.clear()
                    })
                    .then(function () {
                        _this.state.pageing.curpage = 1
                        _this.state.pageing.maxpage = Math.ceil(
                            _this.data.length /
                            _this.state.pageing.perpage
                        )
                        _this.actions.renderCounter()
                        _this.actions.renderList()
                        _this.el.listContainer.scrollTop(0)
                        return el.programs.filter('[data-value="' + params.program + '"]').trigger('click')
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            },
            clear: function () {
                return new Promise(function (resolve, reject) {
                    el.status.find('.badge').remove()
                    el.programs.find('.badge').remove()
                    el.apps.find('.badge').remove()
                    el.listContainer.empty()
                    resolve()
                })
            },
            parsing: function () {
                return new Promise(function (resolve, reject) {
                    resolve()
                    // _this.lunr = lunr(function() {
                    //     this.field('내용', { boost: 10 })

                    //     _this.mapData.forEach(function(item) {
                    //         this.add(item)
                    //     }, this)
                    // })

                    // var options = {
                    //     caseSensitive: false,
                    //     shouldSort: true,
                    //     tokenize: true,
                    //     matchAllTokens: false,
                    //     findAllMatches: true,
                    //     includeScore: true,
                    //     includeMatches: true,
                    //     threshold: 0.6,
                    //     location: 0,
                    //     distance: 100,
                    //     minMatchCharLength: 3,
                    //     maxPatternLength: 32,
                    //     keys: ['내용']
                    // }

                    // // _this.fuse = new Fuse(_this.mapData, options)
                    // var token = _this.data.pharases.map(function(item) {
                    //     if (item.text.length > 1) {
                    //         return item.text
                    //     }
                    // })

                    // var result = _this.mapData.filter(function(item){

                    // })

                    // var result = _this.fuse.search(token.join(' '))
                    // _this.el.listContainer.empty().append('<pre>'+JSON.stringify(result, null, 4)+'</pre>')
                    // resolve()
                })
            },
            renderList: function () {
                var _paging = _this.state.pageing
                var $container = _this.el.listContainer
                var panel, header, content, footer, comments
                var params = JSON.parse(sessionStorage.getItem('prev'))
                if (!_this.data) return

                var _data = JSON.stringify(_this.data.similarity)
                _data = JSON.parse(_data)

                if (_this.state.program !== 0) {
                    _data = _data.filter(function (item) {
                        return item['프로그램'] === _this.state.program
                    })
                }

                if (_this.state.app !== 0) {
                    _data = _data.filter(function (item) {
                        return item['실행파일'] === _this.state.app
                    })
                }

                if (_this.state.status !== 0) {
                    _data = _data.filter(function (item) {
                        if (_this.state.status == consts.FINDER_STATUS.DONE) {

                            return item['상태'] === consts.FINDER_STATUS.DONE || item['상태'] === consts.FINDER_STATUS.FEEDBACK
                        } else {
                            return item['상태'] === _this.state.status
                        }
                    })
                }

                if (_this.state.hospital !== '') {
                    _data = _data.filter(function (item) {
                        return item['기관코드'] === _this.state.hospital
                    })
                }

                if (_this.state.innerSearch !== '') {
                    var innerSearch = _this.state.innerSearch
                    _data = _data.filter(function (item) {
                        return item['문의내용'].indexOf(innerSearch) >= 0 || item['확인내용'].indexOf(innerSearch) >= 0 || item['처리내용'].indexOf(innerSearch) >= 0 || item['보류내용'].indexOf(innerSearch) >= 0
                    })
                }

                if (_this.state.order === consts.FINDER_ORDER.LIKES) {
                    _data = _data.sort(function (a, b) {
                        return a['Likes'] > b['Likes'] ?
                            -1 :
                            a['Likes'] < b['Likes'] ?
                            1 :
                            0
                    })
                }


                // if (_data.length > _paging.perpage) {

                _data = _data.slice(
                    (_paging.curpage - 1) * _paging.perpage,
                    (_paging.curpage - 1) * _paging.perpage +
                    _paging.perpage
                )
                // }
                // var oIndex = (_paging.curpage - 1) * _paging.perpage
                _data.forEach(function (item) {
                    panel = $('<div/>').addClass('panel')
                    header = $('<div/>').addClass('panel-heading')
                    content = $('<div/>').addClass('panel-body')
                    footer = $('<div/>').addClass('panel-footer')

                    panel.addClass(
                        item['상태'] === 3 ? 'panel-default' : 'panel-info'
                    )
                    panel.addClass(' animated fadeIn')

                    header.append(
                        '<span class="pull-right badge">' +
                        (item['상태'] === 3 ? '보류' : '완료') +
                        '</span>' +
                        '<h5 class="panel-title">' +
                        item['기관명칭'] +
                        '</h5>'
                    )

                    if (_this.state.innerSearch !== '') {
                        var innerSearch = _this.state.innerSearch
                        item['문의내용'] = item['문의내용'].replace(
                            new RegExp(innerSearch + '(?!([^<]+)?<)', 'gi'),
                            '<b style="background-color:#ff0;font-size:100%">$&</b>'
                        )

                        item['확인내용'] = item['확인내용'].replace(
                            new RegExp(innerSearch + '(?!([^<]+)?<)', 'gi'),
                            '<b style="background-color:#ff0;font-size:100%">$&</b>'
                        )

                        item['처리내용'] = item['처리내용'].replace(
                            new RegExp(innerSearch + '(?!([^<]+)?<)', 'gi'),
                            '<b style="background-color:#ff0;font-size:100%">$&</b>'
                        )

                        item['보류내용'] = item['보류내용'].replace(
                            new RegExp(innerSearch + '(?!([^<]+)?<)', 'gi'),
                            '<b style="background-color:#ff0;font-size:100%">$&</b>'
                        )
                    }

                    comments = ''
                    comments += '<p>'
                    comments += '   <span class="badge">'
                    comments += item['인덱스']
                    comments += '   </span> '
                    comments += '   <span class="label label-primary">'
                    comments += EMR(item['프로그램']).name
                    comments += '   </span> '
                    comments += item['실행파일'].length ?
                        '<span class="label label-success">' +
                        item['실행파일'] + ' / ' + (item['실행메뉴'] || '') + ' / ' + (item['세부화면'] || '') +
                        '</span>' :
                        ''
                    comments += '</p>'
                    comments += '<dl>'
                    comments += '   <dt class="m-t-md">문의내용 '
                    comments +=
                        '				<small class="text-muted"><i class="fa fa-edit"></i> '
                    comments += item['접수일자']
                    comments += '		</small> '
                    comments += '	</dt>'
                    comments += '   <dd class="m-l-lg">'
                    comments += item['문의내용']
                    comments += '	</dd>'
                    comments += '   <dt class="m-t-md">확인내용 '
                    comments +=
                        '				<small class="text-muted"><i class="fa fa-edit"></i> '
                    comments += item['확인자'] + ' ' + item['확인일자']
                    comments += '		</small> '
                    comments += '	</dt>'
                    comments += '   <dd class="m-l-lg">'
                    comments += item['확인내용'].replace(/\n/gim, '<br>')
                    comments += '	</dd>'
                    comments += '   <dt class="m-t-md">처리내용 '
                    comments +=
                        '				<small class="text-muted"><i class="fa fa-edit"></i> '
                    comments += item['처리자'] + ' ' + item['처리일자']
                    comments += '		</small> '
                    comments += '	</dt>'
                    comments += '   <dd class="m-l-lg">'
                    comments += item['처리내용'].replace(/\n/gim, '<br>')
                    comments += '	</dd>'
                    comments += '   <dt class="m-t-md">보류내용 '
                    comments +=
                        '				<small class="text-muted"><i class="fa fa-edit"></i> '
                    comments += item['보류자'] + ' ' + item['보류일자']
                    comments += '		</small> '
                    comments += '	</dt>'
                    comments += '   <dd class="m-l-lg">'
                    comments += item['보류내용'].replace(/\n/gim, '<br>')
                    comments += '	</dd>'
                    comments += '</dl>'


                    content.append(comments)

                    footer.append(
                        '	<a href="/service/history/detail?index=' +
                        item['인덱스'] +
                        '&hospnum=' +
                        item['기관코드'] +
                        '" class="btn btn-default">자세히</a>' +
                        // '<div class="btn-group pull-right">' +
                        '<button type="button" ' + (!params ? 'disabled' : '') + ' class="btn btn-default pull-right finder-like" data-likes="' +
                        item['Likes'] +
                        '" data-index="' +
                        item['인덱스'] +
                        '" data-index-s="' +
                        (params ? params.index : '') +
                        '"><i class="fa fa-thumbs' +
                        (item['myLike'] !== 0 ? '' : '-o') +
                        '-up"></i> 답변채택(' +
                        item['Likes'] +
                        ')</button>' +

                        '<button type="button" class="btn btn-default pull-right finder-dislike" data-dislikes="' +
                        item['disLikes'] +
                        '" data-index="' +
                        item['인덱스'] +
                        '"><i class="fa fa-thumbs-down"></i> 제외</button>'

                        // '   <button type="button" class="btn btn-default"><i class="fa fa-thumbs-o-down"></i></button>' +
                        // '</div>'
                    )

                    panel
                        .append(header)
                        .append(content)
                        .append(footer)
                        .appendTo($container)
                })
            },
            renderCounter: function () {
                var counter = {
                    0: 0,
                    status: {},
                    programs: {},
                    apps: {}
                }
                _this.data.similarity.forEach(function (item) {
                    if (counter.programs[item['프로그램']]) {
                        counter.programs[item['프로그램']] += 1
                    } else {
                        counter.programs[item['프로그램']] = 1
                    }

                    if (counter.status[item['상태']]) {
                        counter.status[item['상태']] += 1
                    } else {
                        counter.status[item['상태']] = 1
                    }

                    if (counter.apps[item['실행파일']]) {
                        counter.apps[item['실행파일']] += 1
                    } else {
                        counter.apps[item['실행파일']] = 1
                    }
                    counter[0] += 1
                })
                _this.el.programs
                    .filter('[data-value="0"]')
                    .append(' <span class="badge">' + counter[0] + '</span>')
                _this.el.status
                    .filter('[data-value="0"]')
                    .append(' <span class="badge">' + counter[0] + '</span>')
                _this.el.apps
                    .filter('[data-value="0"]')
                    .append(' <span class="badge">' + counter[0] + '</span>')

                Object.keys(counter.programs).forEach(function (key) {
                    _this.el.programs
                        .filter('[data-value="' + key + '"]')
                        .append(
                            ' <span class="badge">' +
                            counter.programs[key] +
                            '</span>'
                        )
                })
                Object.keys(counter.status).forEach(function (key) {
                    _this.el.status
                        .filter('[data-value="' + key + '"]')
                        .append(
                            ' <span class="badge">' +
                            counter.status[key] +
                            '</span>'
                        )
                })
                Object.keys(counter.apps).forEach(function (key) {
                    _this.el.apps
                        .filter('[data-value="' + key + '"]')
                        .append(
                            ' <span class="badge">' +
                            counter.apps[key] +
                            '</span>'
                        )
                })
            },
            toggleLike: function (target) {
                var index = target.data('index')
                var index_s = target.data('index-s')
                var likes = parseInt(target.data('likes'))
                var thumbs = target.find('i')
                var axiosLike
                var data = {
                    index: index,
                    index_s: index_s,
                    user_id: params.user['인덱스']
                }
                if (thumbs.hasClass('fa-thumbs-o-up')) {
                    axiosLike = axios.post(API.FINDER.LIKE, data)
                    likes += 1
                } else {
                    axiosLike = axios.delete(API.FINDER.LIKE, {
                        data: data
                    })
                    likes -= 1
                }

                axiosLike
                    .then(function () {
                        thumbs = thumbs
                            .toggleClass('fa-thumbs-o-up fa-thumbs-up')
                            .clone()
                        target
                            .data('likes', likes)
                            .text('답변채택(' + likes + ')')
                            .prepend(thumbs)

                        var selectedData = _this.data.similarity.find(function (
                            item
                        ) {
                            return item['인덱스'] === index
                        })

                        selectedData['Likes'] = likes
                        selectedData['myLike'] = thumbs.hasClass(
                                'fa-thumbs-o-up'
                            ) ?
                            0 :
                            1
                        if (selectedData['myLike'] === 1) {
                            window.opener.postMessage({
                                인덱스: index_s,
                                처리구분: selectedData['처리구분'],
                                실행메뉴: selectedData['실행메뉴'],
                                세부화면: selectedData['세부화면'],
                                확인내용: selectedData['확인내용'],
                                처리내용: selectedData['처리내용'],
                                보류내용: selectedData['보류내용']
                            }, location.origin)
                        }
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            },
            toggleDislike: function (target) {
                var index = target.data('index')
                // var disLikes = parseInt(target.data('dislikes'))
                var thumbs = target.find('i')
                var data = {
                    index: index,
                    user_id: params.user['인덱스']
                }

                axios.post(API.FINDER.DISLIKE, data)
                    .then(function (result) {
                        // sessionStorage.setItem('prev', JSON.stringify(event.data))
                        // _this.actions.search(event.data)
                        if (_this.state.search) {
                            _this.actions.search(_this.actions.search)
                        } else {
                            _this.actions.search(JSON.parse(sessionStorage.getItem('prev')))
                        }
                    })
                    .catch(function (error) {
                        console.log(error)
                    })
            }
        }



        _this.consts = consts
        _this.state = state
        _this.el = el
        _this.data = data
        _this.parseData = parseData
        _this.actions = actions

        return _instance
    }



    exports.ASFinder = new Store()
    exports.ASFinder.actions.initialize()
    exports.addEventListener('message', ASFinder.actions.receiveMessage, false)


    setInterval(function () {
        if (window !== window.opener.Service.asFinder) {
            window.opener.Service.asFinder = window
        }
    }, 5000)
})(window)
