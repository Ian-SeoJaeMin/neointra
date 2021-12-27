;(function(exports) {
    'use strict'

    var Store = function() {
        var _instance = null,
            _this = this

        Store = function() {
            return _instance
        }
        Store.prototype = this
        _instance = new Store()
        _instance.constructor = Store()

        var consts = {
            FINDER_TYPE: {
                CONTENT: 0,
                TAG: 1
            }
        }

        var state = {
            program: localStorage.getItem('finder-program') || 0,
            type:
                localStorage.getItem('finder-type') ||
                consts.FINDER_TYPE.CONTENT,
            search: '',
            running: false
        }

        var data = null
        var parseData = null
        var mapData = null

        var el = {
            programs: null,
            types: null,
            listContainer: null,
            search: null
        }

        var actions = {
            initialize: function() {
                el.programs = $('.finder-programs')
                el.types = $('.finder-types')
                el.listContainer = $('.finder-list-wrapper')
                el.search = $('.finder-search')

                el.programs
                    .filter('[data-value="' + state.program + '"]')
                    .prepend('<i class="fa fa-check" aria-hidden="true"></i> ')
                el.programs.bind('click', function(event) {
                    event.stopPropagation()
                    var $THIS = $(this)
                    state.program = $THIS.data('value')

                    el.programs.find('.fa-check').remove()
                    $THIS.prepend(
                        '<i class="fa fa-check" aria-hidden="true"></i> '
                    )
                    console.log(state)
                })
                el.types
                    .filter('[data-value="' + state.type + '"]')
                    .prepend('<i class="fa fa-check" aria-hidden="true"></i> ')
                el.types.bind('click', function(event) {
                    event.stopPropagation()
                    var $THIS = $(this)
                    state.type = $THIS.data('value')

                    el.types.find('.fa-check').remove()
                    $THIS.prepend(
                        '<i class="fa fa-check" aria-hidden="true"></i> '
                    )

                    console.log(state)
                })

                el.search.bind(
                    'keyup',
                    _.debounce(function(event) {
                        event.preventDefault()
                        // state.search = el.search.val()
                        // actions.search()
                    }, 500)
                )

                actions.loadMap()
            },
            loadMap: function() {
                axios
                    .get(API.FINDER.MAP)
                    .then(function(resp) {
                        _this.mapData = resp.data
                    })
                    .catch(function(error) {
                        console.log(error)
                    })
            },
            receiveMessage: function(event) {
                if (_this.state.running) return false
                _this.state.running = true
                if (event.data && $.isNumeric(event.data)) {
                    _this.actions.search(event.data)
                }
            },
            search: function(index) {
                axios
                    .get(API.FINDER.SEARCH, {
                        params: {
                            index: index
                        }
                    })
                    .then(function(resp) {
                        console.log(resp.data)
                        _this.data = resp.data
                        return _this.actions.parsing()
                    })
                    .then(function() {
                        _this.state.running = false
                        _this.actions.renderCounter()
                        _this.actions.renderList()
                    })
                    .catch(function(error) {
                        console.log(error)
                    })
            },
            clear: function() {
                return new Promise(function(resolve, reject) {
                    el.programs.find('.badge').remove()
                    el.listContainer.empty()
                    resolve()
                })
            },
            parsing: function() {
                console.log(_this.data, _this.mapData)
                return new Promise(function(resolve, reject) {
                    // _this.lunr = lunr(function() {
                    //     this.field('내용', { boost: 10 })

                    //     _this.mapData.forEach(function(item) {
                    //         this.add(item)
                    //     }, this)
                    // })

                    var options = {
                        caseSensitive: false,
                        shouldSort: true,
                        tokenize: true,
                        matchAllTokens: false,
                        findAllMatches: true,
                        includeScore: true,
                        includeMatches: true,
                        threshold: 0.6,
                        location: 0,
                        distance: 100,
                        minMatchCharLength: 3,
                        maxPatternLength: 32,
                        keys: ['내용']
                    }

                    _this.fuse = new Fuse(_this.mapData, options)
                    var token = _this.data.pharases.map(function(item) {
                        if (item.text.length > 1) {
                            return item.text
                        }
                    })
                    var result = _this.fuse.search(token.join(' '))
                    _this.el.listContainer.empty().append('<pre>'+JSON.stringify(result, null, 4)+'</pre>')
                    resolve()
                })
            },
            renderList: function() {},
            renderCounter: function() {}
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
})(window)
