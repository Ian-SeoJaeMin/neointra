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
            tags: null,
            filteredTags: null
        }

        // var el = {
        // }

        var actions = {
            initialize: function () {
                /**
                 * element binding
                 * element event defined
                 * load tags
                 */
                //actions.getTags()

            },
            filter: function (exe) {
                if (!state.tags || !state.tags.length) return false
                state.filteredTags = state.tags.find(function (tag) {
                    return tag.exe === exe
                })
                return state.filteredTags
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
            }
        }

        _this.state = state
        // _this.el = el
        _this.actions = actions

        return _instance
    }

    exports.Tags = new Tags()
    exports.Tags.actions.initialize()
})(window)
