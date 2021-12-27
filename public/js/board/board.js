(function (exports) {
    "use strict";

    // var $DATEPICKER = $('.datepicker');
    var $MONTHMOVE = $("button.datemonth");
    var $BOARDFINDER = $(".board-finder");
    var $BOARDSEARCH = $(':input[name="board-search"]');
    var $BOARD_DESKTOP = $("tbody#board-desktop");
    var $BOARD_MOBILE = $("#board-mobile");
    var $BOARD_PAGINATION = $(".pagination");

    // var DATEKEY = 'boarddate' + params.board['게시판ID'];
    var OPTIONKEY = "boardoption" + params.board["게시판ID"];
    // var sort = {
    //     field: '인덱스',
    //     sort: 'desc'
    // };

    var options = sessionStorage.getItem(OPTIONKEY)
        ? JSON.parse(sessionStorage.getItem(OPTIONKEY))
        : {
            게시판ID: params.board["게시판ID"],
            useReply: params.board["댓글"],
            // date: {
            //     // month: moment().format('YYYY-MM'),
            //     start: moment().startOf('month').format('YYYY-MM-DD'),
            //     end: moment().endOf('month').format('YYYY-MM-DD')
            // },
            search: "",
            finder: params.finder
        };
    var paging = {
        currentPage: 1,
        perPage: 50,
        maxPage: 0
    };

    var articles = null;
    var filterData = null;

    // 세션에 검색 옵션 저장되어있으면 적용
    if (sessionStorage.getItem(OPTIONKEY)) {
        options = JSON.parse(sessionStorage.getItem(OPTIONKEY));
        $BOARDSEARCH.val(options.search);
        options.finder.forEach(function (opt) {
            $BOARDFINDER
                .filter('[data-field="' + opt.label + '"]')
                .selectpicker("val", opt.value);
        });
        // $DATEPICKER.val(options.date.month);
        // $DATEPICKER.data('value', options.date.month);
    }

    // 달력
    var BoardDatePicker = new myDatePicker(".datepicker.board");
    BoardDatePicker.fn.init(options.date, ChangeDate);

    function ChangeDate() {
        options.date.start = BoardDatePicker.value.start;
        options.date.end = BoardDatePicker.value.end;
        Load();
    }

    // 검색 옵션
    $BOARDSEARCH.bind("keyup", function (event) {
        if (event.keyCode === 13) {
            options.search = $(this)
                .val()
                .trim();
            sessionStorage.setItem(OPTIONKEY, JSON.stringify(options));
            TextFiltering(options.search)
                // .then(function () {
                //     return Pagination()
                // })
                .then(function () {
                    return Sorting();
                })
                .then(function () {
                    Pagination();
                })
                .catch(function (error) {
                    fn.errorNotify(error);
                });
        }
    });

    // 게시판 아이템 클릭
    $BOARD_DESKTOP.bind("click", function (event) {
        var $TR;
        if (event.target.tagName !== "TR") {
            $TR = $(event.target).closest("tr");
        } else {
            $TR = $(event.target);
        }
        location.href =
            "/board/view?index=" +
            params.board["게시판ID"] +
            "&article=" +
            $TR.data("index");
    });

    // 게시판별 검색 옵션 클릭 이벤트
    $BOARDFINDER.bind("changed.bs.select", function (event) {
        var $THIS = $(this);
        options.finder.find(function (opt) {
            return opt.label === $THIS.data("field");
        }).value = $THIS.selectpicker("val");
        sessionStorage.setItem(OPTIONKEY, JSON.stringify(options));
        Filtering($THIS.data("field"), $THIS.selectpicker("val"))
            // .then(function () {
            //     return Pagination()
            // })
            .then(function () {
                return Sorting();
            })
            .then(function () {
                Pagination();
            })
            .catch(function (error) {
                fn.errorNotify(error);
            });
    });

    // $BOARD_PAGINATION.bind('click', function (event) {
    //     event.preventDefault();
    //     var $TARGET = (event.target.tagName === 'LI' ? $(event.target).find('a') : $(event.target));
    //     $TARGET = (event.target.tagName === 'I') ? $(event.target).closest('a') : $(event.target);
    //     if ($TARGET.length) {
    //         console.log($TARGET.data('page'));
    //         if ($TARGET.closest('li').hasClass('disabled')) {
    //             return false;
    //         } else if ($TARGET.data('page') === paging.currentPage || $TARGET.data('page') > paging.maxPage || $TARGET.data('page') < 1) {
    //             return false;
    //         } else {
    //             paging.currentPage = $TARGET.data('page');
    //             Render();
    //         }
    //     }
    // })

    function Clear() {
        $BOARD_DESKTOP.empty();
        $BOARD_MOBILE.empty();
        // $BOARD_PAGINATION.empty();
    }

    function TextFiltering(value) {
        return new Promise(function (resolve, reject) {
            try {
                if (value.length) {
                    var _filterData = (filterData = []);
                    var finders = params.finder.map(function (find) {
                        return find["label"];
                    });

                    finders.forEach(function (key) {
                        var particle = [];
                        particle = articles.filter(function (article) {
                            return article["데이터"][key]
                                ? article["데이터"][key].indexOf(value) >= 0
                                : false;
                        });
                        _filterData = _filterData.concat(particle);
                    });

                    $.each(_filterData, function (i, el) {
                        if ($.inArray(el, filterData) === -1)
                            filterData.push(el);
                    });
                } else {
                    filterData = null;
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    function Filtering(key, value) {
        // if (value) {

        //     filterData = articles.filter(function (article) {
        //         return article['데이터'][key] === value;
        //     });

        // } else {
        //     filterData = null;
        // }
        return new Promise(function (resolve, reject) {
            try {
                filterData = articles;
                options.finder.forEach(function (opt) {
                    if (opt.value) {
                        filterData = filterData.filter(function (article) {
                            if (!article["데이터"][opt.label]) return false;
                            return (
                                article["데이터"][opt.label].indexOf(
                                    opt.value
                                ) >= 0
                            );
                        });
                    }
                });
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    function Pagination() {
        // return new Promise(function (resolve, reject) {
        //     try {
        //         paging.currentPage = 1
        //         paging.maxPage = Math.ceil(filterData.length / paging.perPage);
        //         resolve();
        //     } catch (error) {
        //         reject(error);
        //     }
        // })
        $BOARD_PAGINATION.pagination({
            dataSource: filterData,
            pageSize: 30,
            showPageNumbers: true,
            showNavigator: true,
            callback: function (data, pagination) {
                // template method of yourself
                Render(data);
            }
        });
    }

    function Sorting() {
        return new Promise(function (resolve, reject) {
            try {
                var startDate = "";
                var noticeData = filterData.filter(function (item) {
                    return item["공지"] == 9;
                });
                var normalData = filterData.filter(function (item) {
                    return item["공지"] == 0;
                });

                // noticeData = noticeData.sort(function(a, b) {
                //     return a["인덱스"] > b["인덱스"]
                //         ? 1
                //         : a["인덱스"] < b["인덱스"]
                //         ? -1
                //         : 0;
                // });

                normalData = normalData.sort(function (a, b) {
                    return a["인덱스"] > b["인덱스"]
                        ? -1
                        : a["인덱스"] < b["인덱스"]
                            ? 1
                            : 0;
                });

                // normalData = normalData.sort(function (a, b) {
                //     return a['작성일자'] < b['작성일자'] ? 1 : a['작성일자'] > b['작성일자'] ? -1 : 0;
                // });

                // console.log(noticeData);
                filterData = noticeData.concat(normalData);

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    function Load() {
        sessionStorage.setItem(OPTIONKEY, JSON.stringify(options));
        axios
            .get(API.BOARD.BOARD, {
                params: options
            })
            .then(function (result) {
                console.log(result);
                filterData = null;
                articles = result.data;
                return Filtering();
            })
            // .then(function () {
            //     return Pagination()
            // })
            .then(function () {
                return Sorting();
            })
            .then(function () {
                // Render(filterData);
                Pagination();
            })
            .catch(function (error) {
                fn.errorNotify(error);
            });
    }

    function Render(data) {
        Clear();

        data.forEach(function (article) {
            var $ROW = "";
            var $MOBILELIST = "";

            var notice = (function (ntc) {
                var label = '<label class="label label-danger">NOTICE</label>';
                var startDate = "";
                switch (ntc) {
                    case 0:
                        startDate = article["작성일자"];
                        break;
                    case 7:
                        startDate = moment()
                            .subtract(7, "days")
                            .format("YYYY-MM-DD");
                        break;
                    case 30:
                        startDate = moment()
                            .subtract(1, "month")
                            .format("YYYY-MM-DD");
                        break;
                    case 60:
                        startDate = moment()
                            .subtract(2, "month")
                            .format("YYYY-MM-DD");
                        break;
                    default:
                        startDate = moment(article["작성일자"])
                            .subtract(1, "days")
                            .format("YYYY-MM-DD");
                }

                if (article["작성일자"] <= startDate) {
                    label = "";
                }

                return label;
            })(article["공지"]);

            $ROW += '<tr data-index="' + article["인덱스"] + '">';
            $ROW += "    <td>" + article["인덱스"] + "</td>";
            $ROW += "    <td>" + notice + "</td>";
            params.header.forEach(function (header) {
                $ROW +=
                    "   <td>" +
                    (article["데이터"][header["label"]] || "") +
                    "</td>";
            });
            $ROW += "    <td>" + article["작성자명"] + "</td>";
            $ROW += "    <td>" + article["작성일자"] + "</td>";
            if (article["댓글"] >= 0) {
                $ROW += "    <td>" + article["댓글"] + "</td>";
            }
            $ROW += "</tr>";

            $MOBILELIST +=
                '<a class="list-group-item ellipsis" href="/board/view?index=' +
                params.board["게시판ID"] +
                "&article=" +
                article["인덱스"] +
                '">';
            $MOBILELIST +=
                '    <span class="badge">' + article["댓글"] + "</span>";
            $MOBILELIST += "    [" + article["인덱스"] + "] " + notice + " ";

            var $LABEL = "<span>",
                $TITLE = "";
            params.header.forEach(function (header) {
                if (header.hasOwnProperty("listitem")) {
                    $LABEL +=
                        ' <label class="label label-board">' +
                        (article["데이터"][header["label"]] || "") +
                        "</label>";
                } else {
                    $TITLE +=
                        " " + (article["데이터"][header["label"]] || "") + "";
                }
            });
            $MOBILELIST += $TITLE;
            $MOBILELIST += "    <br>";
            $MOBILELIST +=
                "    " +
                $LABEL +
                "</span><small> " +
                article["작성자명"] +
                "/" +
                article["작성일자"] +
                "</small>";
            $MOBILELIST += "</a>";

            if (notice) {
                $BOARD_DESKTOP.append($ROW);
                $BOARD_MOBILE.append($MOBILELIST);
            } else {
                $BOARD_DESKTOP.append($ROW);
                $BOARD_MOBILE.append($MOBILELIST);
            }
        });
    }

    Load();
})(window);
