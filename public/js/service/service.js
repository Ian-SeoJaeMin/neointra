(function (exports) {
    "use strict";

    var Service = function () {
        var _instance = null,
            _this = this;

        Service = function () {
            return _instance;
        };
        Service.prototype = this;
        _instance = new Service();
        _instance.constructor = Service();

        var SERVICE_STATUS = $.extend({}, CONSTS.SERVICE_STATUS);
        var pageing = {
            curpage: 1,
            perpage: 10,
            maxpage: 0
        };
        _this.load = false;
        _this.asFinder = null;
        _this.$el = {
            $SERVICES: $("#service-accordion"),
            $SERVICENAV: $(".service-nav a"),
            $SERVICETAB: $(".service-tab-pane"),
            $SERVICEPROGRAM: $(".service-program"),
            $SERVICEEXE: $(".service-exe"),
            $SERVICEMENU: $('select.service-menu'),
            $SERVICEMENUBUTTON: $('select.service-button'),
            $SERVICETYPE: $(".service-type"),
            $SERVICEGROUP: $(".service-group"),
            $SERVICESEARCH: $('[name="service-search"]'),
            $ASFINDER: $("#as-finder"),
            $SERVICEHOSPITAL: $("#service-hospital"),
            $SERVICESORT: $("#service-sort"),
            $SERVICEDATEPICKER: new myDatePicker(".datepicker.service"),
            $SERVICEBTN: $(".service-search-btn")
        };

        _this.options = {
            status: 0,
            // status: params.user['지사코드'].match(/0000|0030|0031|0026|0034|0023/gim) && moment().format('dddd') !== '토요일' ? 7 : 0,
            search: "",
            program: 0,
            exe: "",
            menu: "",
            button: "",
            type: 0,
            group: 0,
            sort: false,
            date: {
                start: moment()
                    .subtract(30, "day")
                    .format("YYYY-MM-DD"),
                end: moment().format("YYYY-MM-DD")
            }
        };

        // if (moment().format('YYYYMMDD') === '20200101' && params.user['지사코드'].match(/0000|0030|0031|0026|0034|0023/gim)) {
        //     _this.options.status = 0;
        // }

        // _this.options = typeof _this.options === 'string' ? JSON.parse(_this.options) : _this.options

        _this.data = {
            Services: null,
            ServicesCount: null,
            Service: {
                as: null,
                replys: null,
                info: null,
                uniq: null,
                backup: null,
                extra: null
            },
            Pageing: null
        };

        _this.ServiceHelper = null;

        _this.$el.$SERVICEHOSPITAL
            .selectpicker({
                liveSearch: true,
                size: 10
            })
            .ajaxSelectPicker({
                ajax: {
                    url: API.CUSTOMER.LIST,
                    method: "GET",
                    dataType: "json",
                    data: function () {
                        var params = {
                            search: "{{{q}}}"
                        };
                        // debugger;
                        // if (gModel.selectedGroup().hasOwnProperty('ContactGroupID')) {
                        //     params.GroupID = gModel.selectedGroup().ContactGroupID;
                        // }
                        return params;
                    }
                },
                locale: {
                    emptyTitle: "병원코드, 명칭으로 검색..."
                },
                preprocessData: function (data) {
                    var hosps = [];
                    data.forEach(function (hosp) {
                        // hosps[hosp['ID']] = hosp['기관명칭'];
                        hosps.push({
                            value: hosp["기관코드"],
                            text:
                                hosp["기관명칭"] +
                                "/" +
                                hosp["담당지사"] +
                                (hosp["담당자"].trim().length > 0
                                    ? "/" + hosp["담당자"]
                                    : ""),
                            disabled: false
                        });
                    });

                    return hosps;
                },
                preserveSelected: false
            });
        _this.$el.$SERVICEHOSPITAL.bind("changed.bs.select", function (event) {
            _this.options.hospnum = $(this).selectpicker("val");
            // _this.fn.Load()
        });

        _this.$el.$SERVICENAV
            .bind("click", function (event) {
                _this.options.status = parseInt($(this).data("status"));
                _this.fn.Load();
            })
            .bind("hidden.bs.tab", function (event) {
                _this.$el.$SERVICETAB
                    .filter('[data-status="' + $(this).data("status") + '"]')
                    .empty();
            });

        // _this.$el.$SERVICEPROGRAM.bind('click', function (event) {
        //     var $THIS = $(this)
        //     if (_this.options.program !== parseInt($THIS.data('program'))) {
        //         $THIS
        //             .toggleClass('btn-default btn-primary')
        //             .siblings()
        //             .removeClass('btn-primary')
        //             .addClass('btn-default')
        //         _this.options.program = parseInt($THIS.data('program'))
        //     } else {
        //         _this.options.program = 0
        //         $THIS.toggleClass('btn-default btn-primary')
        //     }
        //     _this.fn.Load()
        // })
        _this.$el.$SERVICEPROGRAM.bind("changed.bs.select", function (event) {
            _this.options.program = $(this).selectpicker("val");
            // _this.fn.Load()
        });

        _this.$el.$SERVICEEXE.bind("changed.bs.select", function (event) {
            _this.options.exe = $(this).selectpicker("val");

            if (_this.options.exe !== "" && _this.options.program !== "") {

                $('.service-tag-menu').removeClass('hidden');
                _this.$el.$SERVICEMENU.empty();
                _this.fn
                    .LoadCategorys(_this.options.exe, "", _this.options.program, _this.options.date)
                    .then(function (result) {
                        result.forEach(function (menu) {
                            _this.$el.$SERVICEMENU.append(`<option value="${menu['실행메뉴']}">${menu['실행메뉴']}</option>`)
                        });
                        _this.$el.$SERVICEMENU.selectpicker('refresh');
                    });
            } else {
                $('.service-tag-menu').addClass('hidden');
            }
            // _this.fn.Load()
        });

        _this.$el.$SERVICEMENU.bind('changed.bs.select', function (event) {
            _this.options.menu = $(this).selectpicker("val");
            _this.$el.$SERVICEMENUBUTTON.empty();
            _this.fn
                .LoadCategorys(_this.options.exe, _this.options.menu, _this.options.program, _this.options.date)
                .then(function (result) {
                    result.forEach(function (menu) {
                        _this.$el.$SERVICEMENUBUTTON.append(`<option value="${menu['세부화면']}">${menu['세부화면']}</option>`)
                    });
                    _this.$el.$SERVICEMENUBUTTON.selectpicker('refresh');
                });
        });

        _this.$el.$SERVICEMENUBUTTON.bind('changed.bs.select', function (event) {
            _this.options.button = $(this).selectpicker('val');
        });

        // _this.$el.$SERVICETYPE.bind('click', function (event) {
        //     var $THIS = $(this)
        //     if (_this.options.type !== parseInt($THIS.data('type'))) {
        //         $THIS
        //             .toggleClass('btn-default btn-primary')
        //             .siblings()
        //             .removeClass('btn-primary')
        //             .addClass('btn-default')
        //         _this.options.type = parseInt($THIS.data('type'))
        //     } else {
        //         _this.options.type = 0
        //         $THIS.toggleClass('btn-default btn-primary')
        //     }
        //     _this.fn.Load()
        // })
        _this.$el.$SERVICETYPE.bind("changed.bs.select", function (event) {
            _this.options.type = $(this).selectpicker("val");
            // _this.fn.Load()
        });

        // _this.$el.$SERVICEGROUP.bind('click', function (event) {
        //     var $THIS = $(this)
        //     var type = parseInt($THIS.data('type'))

        //     if (_this.options.group === type) {
        //         _this.options.group = 0
        //     } else {
        //         _this.options.group = type
        //         _this.$el.$SERVICEGROUP.removeClass('btn-primary').addClass('btn-default')
        //     }
        //     $THIS.toggleClass('btn-default btn-primary')
        //     _this.fn.Load()
        // })
        _this.$el.$SERVICEGROUP.bind("changed.bs.select", function (event) {
            _this.options.group = $(this).selectpicker("val");
            if (_this.options.group == "") _this.options.group = 0;
            // _this.fn.Load()
        });

        _this.$el.$SERVICESEARCH.bind("keyup", function (event) {
            var $THIS = $(this);
            if (event.keyCode === 13) {
                _this.options.search = $THIS.val().trim();
                // if (!_this.options.search) {
                // swal('A/S 오류', '검색어를 입력해주세요.', 'error');
                // $THIS.focus();
                // } else {
                _this.$el.$SERVICESEARCH.val(_this.options.search.trim());
                _this.fn.Load();
                // }
            }
            // var keyword = $(this).val().trim().toLowerCase();
            // $('.tab-content .accordion .panel').filter(function(){
            //     $(this).toggle($(this).text().toLowerCase().indexOf(keyword) > -1);
            // });
        });

        _this.$el.$ASFINDER.bind("click", function (event) {
            event.preventDefault();
            _this.asFinder = window.open(
                "/service/finder",
                "ASFinder",
                "modal=yes,alwaysRaised=yes"
            );
        });

        if (_this.options.sort) {
            _this.$el.$SERVICESORT.toggleClass("btn-default btn-primary");
        }

        _this.$el.$SERVICESORT.bind("click", function (event) {
            _this.options.sort = !_this.options.sort;
            _this.$el.$SERVICESORT.toggleClass("btn-default btn-primary");

            _this.data.Pageing.curpage = 1;

            _this.fn.SortList();
        });

        _this.$el.$SERVICEDATEPICKER.fn.init(
            {
                start: _this.options.date.start,
                end: _this.options.date.end
            },
            function () {
                _this.options.date = this.value;
            }
        );

        _this.$el.$SERVICEBTN.bind("click", function () {
            event.preventDefault();
            _this.fn.Load();
        });

        _this.fn = {
            Load: function () {
                axios
                    .get(API.SERVICE.LIST, {
                        params: _this.options
                    })
                    .then(function (result) {
                        _this.data.oServices = result.data[0];
                        _this.data.ServicesCount = result.data[1][0];

                        // if (moment().format('dddd') !== '토요일') {
                        //     _this.data.oServices = _this.data.oServices.filter(function (item) {
                        //         if (exports.params.user['지사코드'].match(/0000|0030|0031|0026/)) {
                        //             if (item['지사코드'] === '0023' && item['프로그램'] !== 1) {
                        //                 return item
                        //             } else if (item['지사코드'] !== '0023') {
                        //                 return item
                        //             } else {
                        //                 _this.data.ServicesCount[_this.options.status] -= 1
                        //             }
                        //         } else {
                        //             return item
                        //         }
                        //     })
                        // }

                        _this.data.Pageing = $.extend({}, pageing);
                        _this.data.Pageing.maxpage = Math.ceil(
                            _this.data.oServices.length /
                            _this.data.Pageing.perpage
                        );

                        _this.fn.RenderCounter();
                        // _this.fn.RenderList()
                        _this.fn.SortList();
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                    });
            },
            LoadDetail: function (target) {
                var item = _this.data.Services[target.data("index")];
                if (item) {
                    axios
                        .get(API.SERVICE.DETAIL, {
                            params: {
                                index: item["인덱스"],
                                id: item["USER_ID"],
                                hospnum: item["기관코드"]
                            }
                        })
                        .then(function (result) {
                            _this.data.Service.as = result.data[0][0] || {};
                            _this.data.Service.replys = result.data[1] || [];
                            _this.data.Service.info = result.data[2][0] || {};
                            _this.data.Service.uniq = result.data[3][0] || {};
                            _this.data.Service.backup = result.data[4][0] || {};
                            _this.data.Service.extra = result.data[5] || [];
                            _this.data.Service.afk = result.data[6] || [];
                            _this.data.Service.temp = result.data[8][0] || [];
                            // return axios.get(API.CUSTOMER.MISU, {
                            //     params: {
                            //         id: item['USER_ID'],
                            //         startDate: moment().subtract(2, 'months').startOf('month').format('YYYY-MM-DD'), //moment($DATEPICKER_MISU.data('value')).startOf('month').format('YYYY-MM-DD'),
                            //         endDate: moment().endOf('month').format('YYYY-MM-DD')
                            //     }
                            // })
                            // if (_this.data.Service.as['실행메뉴'].length && _this.data.Service.as['세부화면']) {
                            //     return axios
                            //         .get(API.FINDER.MATCHINGCOUNT, {
                            //             params: {
                            //                 index: item['인덱스'],
                            //                 program: _this.data.Service.info['프로그램ID'],
                            //                 mainCategory: _this.data.Service.as['실행메뉴'],
                            //                 subCategory: _this.data.Service.as['세부화면'],
                            //                 exe: item['실행파일']
                            //             }
                            //         })
                            // } else {
                            //     return {
                            //         data: {
                            //             similarity: []
                            //         }
                            //     }
                            // }
                            return _this.fn.LoadCategorys(
                                _this.data.Service.as["실행파일"],
                                _this.data.Service.as["실행메뉴"]
                            );
                        })
                        .then(function (menus) {
                            _this.data.Service.menus = menus;

                            _this.fn.RenderDetail(target);
                            // if (!_this.asFinder || _this.asFinder.closed) {
                            //     _this.asFinder = window.open(
                            //         '/service/finder',
                            //         'ASFinder',
                            //         'modal=yes,alwaysRaised=yes'
                            //     )
                            // }

                            setTimeout(function () {
                                if (!_this.asFinder) {
                                    if (window.Service.asFinder)
                                        _this.asFinder =
                                            window.Service.asFinder;
                                }

                                if (_this.asFinder) {
                                    _this.asFinder.postMessage(
                                        {
                                            index: item["인덱스"],
                                            exe:
                                                _this.data.Service.as[
                                                "실행파일"
                                                ],
                                            mainCategory:
                                                _this.data.Service.as[
                                                "실행메뉴"
                                                ],
                                            subCategory:
                                                _this.data.Service.as[
                                                "세부화면"
                                                ],
                                            comment:
                                                _this.data.Service.as[
                                                "문의내용"
                                                ],
                                            program:
                                                _this.data.Service.info[
                                                "프로그램ID"
                                                ]
                                        },
                                        location.origin
                                    );
                                }
                            }, 1000);
                        })
                        .catch(function (error) {
                            fn.errorNotify(error);
                        });
                }
            },
            UpdateService: function (service) {
                var $CONFIRM = $("#comment-confirm-" + service["인덱스"]),
                    $PROCESS = $("#comment-process-" + service["인덱스"]),
                    $HOLD = $("#comment-hold-" + service["인덱스"]),
                    $DEVLOG = $('#comment-devlog-' + service['인덱스'])

                var updateData = {
                    인덱스: service["인덱스"],
                    실행파일: service["실행파일"],
                    처리예정일: service['처리예정일']
                };
                switch (service["상태"]) {
                    case SERVICE_STATUS.ACCEPT:
                        updateData["실행파일"] = service["실행파일"];
                        if ($CONFIRM.length) {
                            updateData["확인내용"] = $CONFIRM.val().trim();
                            updateData["확인내용"] = updateData["확인내용"]
                                .replace(/'/gim, "&#39;")
                                .replace(/"/gim, "&#34;");
                        }
                        if ($HOLD.length) {
                            updateData["보류내용"] = $HOLD.val().trim();
                            updateData["보류내용"] = updateData["보류내용"]
                                .replace(/'/gim, "&#39;")
                                .replace(/"/gim, "&#34;");
                        }
                        updateData["응급"] = service["응급"];
                        break;
                    case SERVICE_STATUS.SHARE:
                        updateData["실행파일"] = service["실행파일"];
                        if ($CONFIRM.length) {
                            updateData["확인내용"] = $CONFIRM.val().trim();
                            updateData["확인내용"] = updateData["확인내용"]
                                .replace(/'/gim, "&#39;")
                                .replace(/"/gim, "&#34;");
                        }
                        break;
                    case SERVICE_STATUS.PROCESS:
                        updateData["실행파일"] = service["실행파일"];
                        updateData["본사"] = service["본사"];
                        // if (service['확인자'] === params.user['인덱스']) {
                        if ($CONFIRM.length) {
                            updateData["확인내용"] = $CONFIRM.val().trim();
                            updateData["확인내용"] = updateData["확인내용"]
                                .replace(/'/gim, "&#39;")
                                .replace(/"/gim, "&#34;");
                        }
                        // }
                        if (service["처리자"] === params.user["인덱스"]) {
                            updateData["처리구분"] = service["처리구분"];
                            if ($PROCESS.length) {
                                updateData["처리내용"] = $PROCESS.val().trim();
                                updateData["처리내용"] = updateData["처리내용"]
                                    .replace(/'/gim, "&#39;")
                                    .replace(/"/gim, "&#34;");
                            }
                        }
                        break;
                    case SERVICE_STATUS.DONE:
                        updateData["본사"] = service["본사"];
                        if (service["처리자"] === params.user["인덱스"]) {
                            updateData["처리구분"] = service["처리구분"];
                            if ($PROCESS.length) {
                                updateData["처리내용"] = $PROCESS.val().trim();
                                updateData["처리내용"] = updateData["처리내용"]
                                    .replace(/'/gim, "&#39;")
                                    .replace(/"/gim, "&#34;");
                            }
                        }
                        break;
                }

                updateData["실행메뉴"] = service["실행메뉴"] || "";
                updateData["세부화면"] = service["세부화면"] || "";

                if ($DEVLOG.length) {
                    updateData['개발로그'] = $DEVLOG.val().trim();
                } else {
                    updateData['개발로그'] = service['개발로그'];
                }


                if (
                    (updateData["실행메뉴"].length <= 0 ||
                        updateData["세부화면"].length <= 0) &&
                    service["실행파일"] !== "기타" &&
                    service["상태"] > SERVICE_STATUS.ACCEPT
                ) {
                    return swal(
                        "A/S 내용변경",
                        "대분류/중분류를 선택해주세요.",
                        "error"
                    );
                } else if (
                    updateData.hasOwnProperty("확인내용") &&
                    updateData["확인내용"].length <= 0 &&
                    service["상태"] > SERVICE_STATUS.ACCEPT
                ) {
                    return swal(
                        "A/S 내용변경",
                        "확인내용을 작성해주세요.",
                        "error"
                    );
                } else if (
                    updateData.hasOwnProperty("처리내용") &&
                    updateData["처리내용"].length <= 0 &&
                    service["상태"] > SERVICE_STATUS.ACCEPT
                ) {
                    return swal(
                        "A/S 내용변경",
                        "처리내용을 작성해주세요.",
                        "error"
                    );
                } else {
                    swal({
                        title: "A/S 내용변경",
                        text: "변경한 내용을 저장하시겠습니까?",
                        type: "question",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33"
                    })
                        .then(function () {
                            return axios.put(API.SERVICE.SAVE, updateData);
                        })
                        .then(function (result) {
                            swal("A/S 내용변경", "저장되었습니다.", "success");
                            _this.fn.LoadDetail(
                                $("div#service-item-" + service["인덱스"])
                            );
                        })
                        .catch(function (error) {
                            fn.errorNotify(error);
                        });
                }
            },
            UpdateServiceStatus: function (service, status, useFinder) {
                _validation(service, status)
                    .then(function (data) {
                        axios
                            .put(API.SERVICE.DETAIL, data)
                            .then(function (result) {
                                result = result.data;
                                if (result.status === 200) {
                                    //완료거나 피드백인 경우
                                    //답변선택 채택되어있으면
                                    //Finder 답변채택 API 태워야함
                                    data.nextStatus =
                                        data.nextStatus == "4|6"
                                            ? CONSTS.SERVICE_STATUS.FEEDBACK
                                            : data.nextStatus;

                                    if (
                                        data.nextStatus ==
                                        CONSTS.SERVICE_STATUS.DONE ||
                                        data.nextStatus ==
                                        CONSTS.SERVICE_STATUS.FEEDBACK
                                    ) {
                                        if (service["답변채택"] == 1) {
                                            axios.post(API.FINDER.LIKE, {
                                                index: service["인덱스"],
                                                index_s: service["인덱스"],
                                                user_id: params.user["인덱스"]
                                            });
                                        }
                                    }

                                    if (typeof nSocket === "object") {
                                        nSocket.fn.UpdateService({
                                            index: data.index,
                                            user: params.user,
                                            status: data.nextStatus,
                                            prev_status: data.curStatus
                                        });
                                    }
                                    swal(
                                        "A/S 상태변경",
                                        "A/S의 상태를 변경하였습니다.",
                                        "success"
                                    ).then(function () {
                                        _this.fn.Load();
                                    });
                                } else {
                                    swal({
                                        title: "A/S 상태변경",
                                        html:
                                            '<p class="text-left">오류가 발생하였습니다<br>' +
                                            result.message +
                                            "</p>",
                                        type: "error"
                                    });
                                }
                            })
                            .catch(function (error) {
                                fn.errorNotify(error);
                            });
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                    });

                function _validation(service, status) {
                    return new Promise(function (resolve, reject) {
                        try {
                            //상태를 공유에서 접수로 보내는 경우 그냥 지나감

                            var $CONFIRM = $(
                                "#comment-confirm-" + service["인덱스"]
                            ),
                                $PROCESS = $(
                                    "#comment-process-" + service["인덱스"]
                                ),
                                $HOLD = $("#comment-hold-" + service["인덱스"]),
                                $DEVLOG = $("#comment-devlog-" + service["인덱스"]);
                            var data = {
                                index: service["인덱스"],
                                user: params.user,
                                nextStatus: status,
                                curStatus: service["상태"],
                                exe: service["실행파일"],
                                emergency: service["응급"],
                                internal: service["본사"],
                                gubun: service["처리구분"],
                                mainCategory: service["실행메뉴"] || "",
                                subCategory: service["세부화면"] || "",
                                comment: {
                                    confirm:
                                        $CONFIRM.length &&
                                            $CONFIRM.val().trim().length &&
                                            !useFinder
                                            ? $CONFIRM.val().trim()
                                            : service["확인내용"],
                                    process:
                                        $PROCESS.length &&
                                            $PROCESS.val().trim().length &&
                                            !useFinder
                                            ? $PROCESS.val().trim()
                                            : service["처리내용"],
                                    hold:
                                        $HOLD.length &&
                                            $HOLD.val().trim().length &&
                                            !useFinder
                                            ? $HOLD.val().trim()
                                            : service["보류내용"],
                                    devlog:
                                        $DEVLOG.length &&
                                            $DEVLOG.val().trim().length &&
                                            !useFinder
                                            ? $DEVLOG.val().trim()
                                            : service["개발로그"]
                                }
                            };
                            data.comment.confirm = data.comment.confirm
                                .replace(/'/gim, "&#39;")
                                .replace(/"/gim, "&#34;");
                            data.comment.process = data.comment.process
                                .replace(/'/gim, "&#39;")
                                .replace(/"/gim, "&#34;");
                            data.comment.hold = data.comment.hold
                                .replace(/'/gim, "&#39;")
                                .replace(/"/gim, "&#34;");
                            data.comment.devlog = data.comment.devlog
                                .replace(/'/gim, "&#39;")
                                .replace(/"/gim, "&#34;");
                            var notifyOption = {
                                title: "A/S 상태변경",
                                text: "",
                                type: "question",
                                showCancelButton: true,
                                confirmButtonColor: "#3085d6",
                                cancelButtonColor: "#d33"
                            };

                            if (status === SERVICE_STATUS.ACCEPT) {
                                resolve(data)
                                return
                            }

                            if (data.exe === "" || !data.exe) {
                                reject({
                                    title: "A/S 상태변경",
                                    text: "프로그램을 선택해주세요.",
                                    type: "error"
                                });
                            } else if (
                                (data.mainCategory === "" ||
                                    data.subCategory === "") &&
                                data.exe !== "기타" &&
                                data.mainCategory !== "기타" &&
                                status !== SERVICE_STATUS.PROCESS
                            ) {
                                reject({
                                    title: "A/S 상태변경",
                                    text: "메뉴/버튼을 선택해주세요.",
                                    type: "error"
                                });
                            } else {
                                switch (service["상태"]) {
                                    case SERVICE_STATUS.ACCEPT:
                                    case SERVICE_STATUS.CONFIRM:
                                        if (status === SERVICE_STATUS.HOLD) {
                                            notifyOption.html =
                                                "해당 A/S를 보류상태로 전환하시겠습니까?" +
                                                (data.comment.hold
                                                    ? ""
                                                    : '<p class="red"><strong>보류내용을 작성하지 않으셨습니다. <br>보류내용을 입력하면 나중에 확인할때 도움이될 수 있습니다.</strong></p>');
                                        } else {
                                            if (!data.comment.confirm) {
                                                return reject({
                                                    title: "A/S 상태변경.",
                                                    text:
                                                        "해당 A/S의 상태를 변경할 수 없습니다 <br> [확인내용]을 작성해주세요.",
                                                    type: "error",
                                                    target:
                                                        "#comment-confirm-" +
                                                        service["인덱스"]
                                                });
                                            } else {
                                                notifyOption.text =
                                                    "해당 A/S의 상태를 변경하시겠습니까?";
                                            }
                                        }
                                        break;
                                    case SERVICE_STATUS.SHARE:
                                        notifyOption.html =
                                            "해당 A/S를 처리상태로 변경하시겠습니까?" +
                                            '<p class="text-left font-bold red"><strong>' +
                                            "   1. 간단한 A/S일 경우 댓글을 달아서 담당자가 직접 처리하도록 할 수 있습니다." +
                                            "<br/>" +
                                            "   2.처리가 어려울 경우 처리상태에서 다시 공유상태로 변경할 수 있습니다." +
                                            "</strong></p>";
                                        break;
                                    case SERVICE_STATUS.PROCESS:
                                        if (status === SERVICE_STATUS.HOLD) {
                                            notifyOption.html =
                                                "해당 A/S를 보류상태로 전환하시겠습니까?" +
                                                (data.comment.hold
                                                    ? ""
                                                    : '<p class="red"><strong>보류내용을 작성하지 않으셨습니다. <br>보류내용을 입력하면 나중에 확인할때 도움이될 수 있습니다.</strong></p>');
                                        } else if (
                                            status === SERVICE_STATUS.DONE ||
                                            status ===
                                            SERVICE_STATUS.DONE +
                                            "|" +
                                            SERVICE_STATUS.FEEDBACK
                                        ) {
                                            if (!data.comment.process) {
                                                return reject({
                                                    title: "A/S 상태변경.",
                                                    text:
                                                        "해당 A/S의 상태를 변경할 수 없습니다 <br> [처리내용]을 작성해주세요.",
                                                    type: "error",
                                                    target:
                                                        "#process-confirm-" +
                                                        service["인덱스"]
                                                });
                                            } else if (data.gubun === 0) {
                                                return reject({
                                                    title: "A/S 상태변경.",
                                                    text:
                                                        "해당 A/S의 상태를 변경할 수 없습니다 <br> [처리구분]을 선택해주세요.",
                                                    type: "error"
                                                });
                                            } else if (
                                                status ===
                                                SERVICE_STATUS.DONE +
                                                "|" +
                                                SERVICE_STATUS.FEEDBACK
                                            ) {
                                                notifyOption.html =
                                                    "해당 A/S를 완료처리하고 피드백완료 상태로 변경하시겠습니까?";
                                            } else {
                                                notifyOption.html =
                                                    "해당 A/S를 완료상태로 변경하시겠습니까?";
                                            }
                                        } else if (
                                            status === SERVICE_STATUS.SHARE
                                        ) {
                                            if (!data.comment.confirm) {
                                                return reject({
                                                    title: "A/S 상태변경.",
                                                    text:
                                                        "해당 A/S의 상태를 변경할 수 없습니다 <br> [확인내용]을 작성해주세요.",
                                                    type: "error",
                                                    target:
                                                        "#comment-confirm-" +
                                                        service["인덱스"]
                                                });
                                            } else {
                                                notifyOption.html =
                                                    "해당 A/S를 공유상태로 변경하시겠습니까?";
                                            }
                                        }
                                        break;
                                    case SERVICE_STATUS.HOLD:
                                        notifyOption.html =
                                            "해당 A/S의 상태를 변경합니다. <br/>계속하시겠습니까?";
                                        break;
                                    case SERVICE_STATUS.DONE:
                                        break;
                                    case SERVICE_STATUS.FEEDBACK:
                                        notifyOption.html =
                                            "해당 A/S를 피드백완료 처리하시겠습니까?";
                                        break;
                                }
                                // (new PNotify(notifyOption)
                                // ).get().on('pnotify.confirm', function () {
                                //     resolve(data);
                                // }).on('pnotify.cancel', function () {
                                //     reject();
                                // });
                                swal(notifyOption)
                                    .then(function () {
                                        resolve(data);
                                    })
                                    .catch(function () {
                                        reject();
                                    });
                            }
                        } catch (error) {
                            reject(error);
                        }
                    });
                }
            },
            UpdateDevAS: function (index, field, data) {
                axios
                    .post(API.SERVICE.DEV, {
                        index: index,
                        field: field,
                        data: data
                    })
                    .then(function (result) {
                        if (result.data == "") {
                            // ServiceHistory()
                            new PNotify({
                                title: "AS 공유건",
                                text: "저장되었습니다.",
                                type: "success"
                            });
                            _this.fn.LoadDetail($("div#service-item-" + index));
                        }
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                    });
            },
            PassService: function (service) {
                swal({
                    text: "전달할 직원의 이름을 입력해주세요.",
                    input: "text",
                    inputPlaceholder: "전달할 직원이름",
                    showCancelButton: true
                })
                    .then(function (name) {
                        if (name.trim() === "") {
                            // swal('', '이름을 입력하셔야합니다.', 'error');
                        } else {
                            return axios.get(API.COMPANY.USERS, {
                                params: {
                                    search: name
                                }
                            });
                        }
                    })
                    .then(function (result) {
                        var users = result.data;
                        if (users.length === 1) {
                            return swal({
                                text: "전달할 직원이 맞습니까?",
                                html:
                                    "사원번호: " +
                                    users[0]["인덱스"] +
                                    "<br>" +
                                    "이름: " +
                                    users[0]["이름"] +
                                    "<br>" +
                                    "소속: " +
                                    users[0]["소속"] +
                                    "<br>" +
                                    "TEL: " +
                                    users[0]["휴대폰번호"],
                                type: "question",
                                showCancelButton: true,
                                confirmButtonColor: "#3085d6",
                                cancelButtonColor: "#d33",
                                preConfirm: function () {
                                    return new Promise(function (
                                        resolve,
                                        reject
                                    ) {
                                        resolve(users[0]["인덱스"]);
                                    });
                                }
                            });
                        } else {
                            var inputOptions = {};
                            users.forEach(function (user) {
                                inputOptions[user["인덱스"]] = user["이름"];
                            });
                            return swal({
                                // title: '전달할 직원을 선택해주세요.',
                                input: "select",
                                inputOptions: inputOptions,
                                inputPlaceholder: "직원 선택",
                                showCancelButton: true
                            });
                        }
                    })
                    .then(function (select) {
                        var updateData = {
                            인덱스: service["인덱스"],
                            처리자: select,
                            처리일자: "GETDATE()",
                            전달자: params["user"]["인덱스"],
                            전달일자: "GETDATE()"
                        };
                        return axios.put(API.SERVICE.SAVE, updateData);
                    })
                    .then(function (result) {
                        swal("A/S 전달", "전달하였습니다.", "success");
                        _this.fn.Load();
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                    });
            },
            CheckMissed: function (service, afk) {
                if (afk.length > 0) {
                    var afkList = [
                        {
                            수정일자: afk[0]["수정일자"]
                        },
                        {
                            수정일자: moment().format("YYYY-MM-DD HH:mm:ss")
                        }
                    ];
                    var data = {
                        index: service["인덱스"],
                        user: params.user,
                        nextStatus: SERVICE_STATUS.HOLD,
                        curStatus: service["상태"],
                        exe: service["실행파일"],
                        emergency: service["응급"],
                        internal: service["본사"],
                        gubun: service["처리구분"],
                        mainCategory: service["실행메뉴"] || "",
                        subCategory: service["세부화면"] || "",
                        comment: {
                            confirm: "(M)담당자와 연결이 안될 경우",
                            process: "",
                            hold:
                                "(M)담당자와 연결이 안될 경우\n1. " +
                                afkList[0]["수정일자"] +
                                "\n2. " +
                                afkList[1]["수정일자"]
                        }
                    };

                    swal({
                        title: "A/S 부재중",
                        text:
                            "이전에 부재중 체크한 기록이 있습니다. 접수자 PC에 알림메시지를 보내고 보류처리 하시겠습니까?",
                        type: "question",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33"
                    })
                        .then(function (result) {
                            return axios.delete(API.SERVICE.AFK, {
                                data: {
                                    index: service["인덱스"]
                                }
                            });
                        })
                        .then(function (result) {
                            return nSocket.fn.SendMessage({
                                index: service["인덱스"],
                                type: "부재중",
                                messages: afkList
                            });
                        })
                        .then(function () {
                            return axios.put(API.SERVICE.DETAIL, data);
                        })
                        .then(function (result) {
                            result = result.data;
                            if (result.status === 200) {
                                nSocket.fn.UpdateService({
                                    index: data.index,
                                    user: params.user,
                                    status: data.nextStatus,
                                    prev_status: data.curStatus
                                });
                                swal(
                                    "A/S 상태변경",
                                    "A/S의 상태를 변경하였습니다.",
                                    "success"
                                ).then(function () {
                                    _this.fn.Load();
                                });
                            } else {
                                swal({
                                    title: "A/S 상태변경",
                                    html:
                                        '<p class="text-left">오류가 발생하였습니다<br>' +
                                        result.message +
                                        "</p>",
                                    type: "error"
                                });
                            }
                        })
                        .catch(function (error) {
                            fn.errorNotify(error);
                        });
                } else {
                    swal({
                        title: "A/S 부재중",
                        text: "부재중기록을 남기시겠습니까?",
                        type: "question",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33"
                    })
                        .then(function (result) {
                            return axios.post(API.SERVICE.AFK, service);
                        })
                        .then(function (result) {
                            _this.fn.Load();
                            return swal(
                                "A/S 부재중",
                                "처리되었습니다.",
                                "success"
                            );
                        })
                        .catch(function (error) {
                            fn.errorNotify(error);
                        });
                }
            },
            SaveServiceReply: function (index) {
                var $REPLY = $("#service-reply-comment-" + index);

                _validation()
                    .then(function (params) {
                        axios
                            .post(API.SERVICE.REPLY, params)
                            .then(function (result) {
                                result = result.data;
                                if (!result.status) {
                                    new PNotify({
                                        title: "A/S 댓글 등록",
                                        text: "댓글이 등록되었습니다.",
                                        type: "success"
                                    });
                                    _this.fn.RenderNewReply(result);
                                    $REPLY.val("");
                                } else {
                                    new PNotify({
                                        title: "A/S 댓글 등록",
                                        text:
                                            "오류가 발생하였습니다. <br/>" +
                                            result.message,
                                        type: "error"
                                    });
                                }
                            })
                            .catch(function (error) {
                                fn.errorNotify(error);
                            });
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                    });

                function _validation() {
                    return new Promise(function (resolve, reject) {
                        var data = {
                            key: index,
                            user: params.user,
                            comment: $REPLY.val().trim() || ""
                        };
                        if (!data.comment) {
                            reject({
                                title: "A/S 댓글 등록",
                                text: "댓글 내용을 입력해주세요.",
                                type: "warning",
                                target: "#service-reply-comment-" + index
                            });
                        } else {
                            resolve(data);
                        }
                    });
                }
            },
            DeleteServiceReply: function (index) {
                var notifyOption = {
                    title: "A/S 댓글 삭제",
                    text: "해당 댓글을 삭제하시겠습니까?",
                    icon: "glyphicon glyphicon-question-sign",
                    hide: false,
                    confirm: {
                        confirm: true,
                        buttons: [
                            {
                                text: "네"
                            },
                            {
                                text: "아니오"
                            }
                        ]
                    },
                    buttons: {
                        closer: false,
                        sticker: false
                    },
                    history: {
                        history: false
                    },
                    addclass: "stack-modal",
                    stack: {
                        dir1: "down",
                        dir2: "right",
                        modal: true
                    }
                };

                new PNotify(notifyOption)
                    .get()
                    .on("pnotify.confirm", function () {
                        axios
                            .delete(API.SERVICE.REPLY, {
                                params: {
                                    index: index
                                }
                            })
                            .then(function (result) {
                                result = result.data;
                                if (!result.status) {
                                    new PNotify({
                                        title: "A/S 댓글 삭제",
                                        text: "댓글이 삭제되었습니다.",
                                        type: "success"
                                    });
                                    location.reload();
                                } else {
                                    new PNotify({
                                        title: "A/S 댓글 삭제",
                                        text:
                                            "오류가 발생하였습니다. <br/>" +
                                            result.message,
                                        type: "error"
                                    });
                                }
                            })
                            .catch(function (error) {
                                fn.errorNotify(error);
                            });
                    })
                    .on("pnotify.cancel", function () {
                        //cancel
                    });
            },
            RenderCounter: function () {
                // console.log(Data.ServicesCount);
                var emergenCount = 0;

                _this.data.oServices.forEach(function (item) {
                    if (item["응급"] != 0) {
                        emergenCount += 1;
                    }
                });
                Object.keys(_this.data.ServicesCount).forEach(function (key) {
                    // console.log($SERVICENAV.filter('[data-status="' + key + '"]')[0]);

                    if (key != "응급") {
                        _this.$el.$SERVICENAV
                            .filter('[data-status="' + key + '"]')
                            .find(".badge")
                            .text(_this.data.ServicesCount[key]);
                    } else {
                        _this.$el.$SERVICENAV
                            .filter('[data-status="1"]')
                            .find(".badge.emergency")
                            .text(_this.data.ServicesCount[key]);
                    }
                });
            },
            RenderList: function () {
                var _paging = _this.data.Pageing;
                var $CONTAINER = _this.$el.$SERVICETAB.filter(
                    '[data-status="' + _this.options.status + '"]'
                );
                var $ACCORDION = (function () {
                    // 페이징이 올라가면 이미 만들어논 객체를 찾아서 바인딩
                    if (_paging.curpage > 1) {
                        return $CONTAINER.find(
                            "div#service-accordion-" + _this.options.status
                        );
                    } else {
                        return $("<div />")
                            .addClass("accordion")
                            .attr({
                                id: "service-accordion-" + _this.options.status,
                                role: "tablist"
                            });
                    }
                })();
                var _data = _this.data.Services.slice(
                    (_paging.curpage - 1) * _paging.perpage,
                    (_paging.curpage - 1) * _paging.perpage + _paging.perpage
                );
                var oIndex = (_paging.curpage - 1) * _paging.perpage;
                _data.forEach(function (service, index) {
                    $ACCORDION.append(_DataToHtml(service, oIndex));
                    oIndex += 1;
                }, this);

                // 첫페이지 로딩시에만 이벤트 바인딩
                if (_paging.curpage <= 1) {
                    $CONTAINER.empty().append($ACCORDION);
                }
                $ACCORDION
                    .find("div.collapse")
                    .bind("show.bs.collapse", function (event) {
                        if (event.target.tagName === "DIV") {
                            if (
                                $(event.target)
                                    .attr("id")
                                    .indexOf("service-item-") >= 0
                            ) {
                                if (!_this.load) {
                                    _this.load = true;
                                    _this.fn.LoadDetail($(this));
                                }
                            }
                        }
                    })
                    .bind("shown.bs.collapse", function (event) {
                        if (event.target.tagName !== "UL") {
                            var $HEADER = $(
                                "#" + $(this).attr("aria-labelledby")
                            );
                            $("html, body").animate(
                                {
                                    scrollTop: $HEADER.offset().top
                                },
                                500,
                                function () {
                                    _this.load = false;
                                }
                            );
                        }
                    })
                    .bind("hidden.bs.collapse", function (event) {
                        if (
                            $(event.target)
                                .attr("id")
                                .indexOf("service-item-") >= 0
                        ) {
                            $(event.target).empty();
                        }
                    });

                function _DataToHtml(service, index) {
                    var isDeveloper = params.user['인덱스'] == 149 || params.user['부서'] === '개발실';
                    var item = "";
                    item += '<div class="panel animated fadeIn">';
                    item +=
                        '    <a class="panel-heading collapsed media {{응급배경}}" role="tab" id="header-{{접수번호}}" data-toggle="collapse" data-index="{{인덱스}}" data-parent="#service-accordion-' +
                        _this.options.status +
                        '" href="#service-item-{{접수번호}}"  aria-expanded="false" aria-controls="service-item-{{접수번호}}">';
                    item +=
                        '       <div class="media-left text-center {{DELAY}}">';
                    item += '           <i class="fa fa-clock-o fa-3x"></i>';
                    item += "           DELAY";
                    item += "       </div>";
                    item += '       <div class="media-body">';
                    item += '           <span class="pull-right text-right">';
                    item +=
                        "               <cite>#{{접수번호}} {{실행파일}}</cite>";
                    item += "{{리플수}}";
                    item += "{{개발실공유}}";
                    item += "           </span>";
                    item += '           <h4 class="panel-title m-b-sm">';
                    item +=
                        "               {{기관명칭}} <small>({{기관코드}})</small> ";
                    item += "           </h4>";
                    item +=
                        "           {{담당}} {{프로그램}} {{AS타입}} {{병원유형}} {{응급}} {{신규}} {{본사}}";
                    item += "           <br>";
                    item += "               {{상태}}";
                    item += "       </div>";
                    item += "    </a>";
                    item +=
                        '    <div class="panel-collapse collapse" role="tabpanel" aria-labelledby="header-{{접수번호}}" data-index="{{인덱스}}" id="service-item-{{접수번호}}"></div>';
                    item += "</div>";

                    item = item.replace(/{{접수번호}}/gim, service["인덱스"]);
                    item = item.replace(/{{인덱스}}/gim, index);
                    item = item.replace(/{{기관명칭}}/gim, service["기관명칭"]);
                    item = item.replace(/{{기관코드}}/gim, service["기관코드"]);
                    item = item.replace(
                        /{{실행파일}}/gim,
                        service["실행파일"] ? "#" + service["실행파일"] : ""
                    );
                    item = item.replace(
                        /{{담당}}/gim,
                        (function () {
                            return (
                                '<span class="badge">' +
                                service["지사"] +
                                (service["담당자이름"]
                                    ? "(<strong>" +
                                    service["담당자이름"] +
                                    "</strong>)"
                                    : "") +
                                "</span>"
                            );
                        })()
                    );
                    item = item.replace(
                        /{{프로그램}}/gim,
                        (function () {
                            var emr = EMR(service["프로그램"]);
                            return (
                                '<span class="badge ' +
                                emr.badge +
                                '">' +
                                emr.name +
                                "</span>"
                            );
                        })()
                    );
                    item = item.replace(
                        /{{AS타입}}/gim,
                        (function () {
                            if (service["타입"] === 1) {
                                return '<span class="badge bg-orange">장애</span>';
                            } else if (service["타입"] === 2) {
                                return '<span class="badge bg-green">사용법</span>';
                            } else {
                                return '<span class="badge">선택없음</span>';
                            }
                        })()
                    );
                    item = item.replace(
                        /{{병원유형}}/gim,
                        (function () {
                            if (service["병원유형"] === 0) {
                                return '<span class="badge">보통</span>';
                            } else if (service["병원유형"] === 1) {
                                return '<span class="badge bg-blue">우수</span>';
                            } else {
                                return '<span class="badge bg-red">주의</span>';
                            }
                        })()
                    );
                    item = item.replace(
                        /{{응급}}/gim,
                        (function () {
                            if (service["응급"] === 0) {
                                return "";
                            } else {
                                return '<span class="badge bg-red">응급</span>';
                            }
                        })()
                    );
                    item = item.replace(
                        /{{본사}}/gim,
                        (function () {
                            if (service["본사"] === 1) {
                                return "";
                            } else {
                                return '<span class="badge bg-white"><i class="fa fa-krw red"></i></span>';
                            }
                        })()
                    );
                    item = item.replace(
                        /{{응급배경}}/gim,
                        (function () {
                            if (service["응급"] === 0) {
                                return "";
                            } else {
                                return "bg-emergency";
                            }
                        })()
                    );
                    item = item.replace(
                        /{{상태}}/gim,
                        (function () {
                            var _status = "";
                            switch (service["상태"]) {
                                case SERVICE_STATUS.ACCEPT:
                                    _status =
                                        '접수: {{접수자}} ({{접수일자}}) <span class="red font-bold">{{경과시간}}</span> 접수됨.';
                                    _status = _status.replace(
                                        "{{접수자}}",
                                        "<strong>" +
                                        service["접수자"] +
                                        "</strong>"
                                    );
                                    _status = _status.replace(
                                        "{{접수일자}}",
                                        moment(service["접수일자"]).format(
                                            "LLL"
                                        )
                                    );
                                    _status = _status.replace(
                                        "{{경과시간}}",
                                        moment(service["접수일자"]).fromNow()
                                    );

                                    break;
                                case SERVICE_STATUS.CONFIRM:
                                    _status =
                                        '확인: {{확인자}} ({{확인일자}}) <span class="red font-bold">{{경과시간}}</span> 확인됨.';
                                    _status = _status.replace(
                                        "{{확인자}}",
                                        "<strong>" +
                                        service["확인자명"] +
                                        "</strong>"
                                    );
                                    _status = _status.replace(
                                        "{{확인일자}}",
                                        moment(service["확인일자"]).format(
                                            "LLL"
                                        )
                                    );
                                    _status = _status.replace(
                                        "{{경과시간}}",
                                        moment(service["확인일자"]).fromNow()
                                    );

                                    break;
                                case SERVICE_STATUS.SHARE:
                                    _status =
                                        '공유: {{공유자}} ({{공유일자}}) <span class="red font-bold">{{경과시간}}</span> 공유됨.';
                                    if (service["공유자"] !== 0) {
                                        _status = _status.replace(
                                            "{{공유자}}",
                                            "<strong>" +
                                            service["공유자명"] +
                                            "</strong>"
                                        );
                                        _status = _status.replace(
                                            "{{공유일자}}",
                                            moment(service["공유일자"]).format(
                                                "LLL"
                                            )
                                        );
                                    } else {
                                        _status = _status.replace(
                                            "{{공유자}}",
                                            "<strong>" +
                                            (service["담당자"] === 0
                                                ? service["지사"]
                                                : service["담당자이름"]) +
                                            "</strong>"
                                        );
                                        _status = _status.replace(
                                            "{{공유일자}}",
                                            '<span class="red font-bold">15분 자동공유</span>'
                                        );
                                    }
                                    _status = _status.replace(
                                        "{{경과시간}}",
                                        moment(service["공유일자"]).fromNow()
                                    );
                                    break;
                                case SERVICE_STATUS.PROCESS:
                                    _status = "처리: {{처리자}} ({{처리일자}})";
                                    _status = _status.replace(
                                        "{{처리자}}",
                                        service["처리자명"]
                                    );
                                    _status = _status.replace(
                                        "{{처리일자}}",
                                        moment(service["처리일자"]).format(
                                            "LLL"
                                        )
                                    );
                                    _status += service['처리예정일'].length ? ` / <span class="blue font-bold">처리예정일: ${service['처리예정일']}</span>` : ''
                                    break;
                                case SERVICE_STATUS.HOLD:
                                    _status = "보류: {{보류자}} ({{보류일자}})";
                                    _status = _status.replace(
                                        "{{보류자}}",
                                        service["보류자명"]
                                    );
                                    _status = _status.replace(
                                        "{{보류일자}}",
                                        moment(service["보류일자"]).format(
                                            "LLL"
                                        )
                                    );
                                    break;
                                case SERVICE_STATUS.DONE:
                                    _status = "완료: {{완료자}} ({{완료일자}})";
                                    _status = _status.replace(
                                        "{{완료자}}",
                                        service["완료자명"]
                                    );
                                    _status = _status.replace(
                                        "{{완료일자}}",
                                        moment(service["완료일자"]).format(
                                            "LLL"
                                        )
                                    );
                                    break;
                                case SERVICE_STATUS.CANCEL:
                                    break;
                            }
                            return _status
                                ? '<label class="m-t-xs">' +
                                _status +
                                "</label>"
                                : "";
                        })()
                    );
                    item = item.replace(
                        "{{리플수}}",
                        (function () {
                            var replyIcon = '';

                            if (isDeveloper && service['개발로그'] > 0) {
                                replyIcon = '<br> <span class="service-reply"><i class="fa fa-code fa-2x"></i></span>'
                            }

                            if (service["리플수"] > 0) {
                                replyIcon += (replyIcon.length > 0 ? '' : '<br>') +
                                    ' <span class="service-reply"> ' +
                                    '   <i class="fa fa-comment fa-2x red"></i> ' +
                                    service["리플수"] +
                                    "</span>";

                            }
                            return replyIcon;
                        })()
                    );

                    item = item.replace(
                        "{{개발실공유}}",
                        (function () {
                            if (
                                service["파일전달"] > 0 ||
                                service["버전"].trim().length > 0
                            ) {
                                var $shareBadge = "<br>";
                                if (service["파일전달"] > 0) {
                                    $shareBadge +=
                                        '<span class="badge bg-green pull-right">파일전달</span>';
                                }
                                if (service["버전"].trim().length > 0) {
                                    $shareBadge +=
                                        '<span class="badge bg-green pull-right">버전</span>';
                                }
                                return $shareBadge;
                            } else {
                                return "";
                            }
                        })()
                    );

                    // item = item.replace('{{DELAY}}', (function () {
                    var inDate = moment(service["접수일자"]);
                    var minutes = moment().diff(inDate, "minutes");
                    minutes = Math.floor(minutes / 5);
                    if (
                        minutes < 1 ||
                        service["상태"] !== SERVICE_STATUS.ACCEPT
                    ) {
                        item = item.replace("{{DELAY}}", "hidden");
                    } else {
                        item = item.replace(
                            "{{DELAY}}",
                            "service-delay" + (minutes >= 3 ? "-danger" : "")
                        );
                    }
                    // })());

                    if (service["계약일"].length) {
                        if (
                            moment().diff(service["계약일"].trim(), "month") <=
                            3
                        ) {
                            item = item.replace(
                                "{{신규}}",
                                '<span class="badge badge-red-4">신규</span>'
                            );
                        } else {
                            item = item.replace("{{신규}}", "");
                        }
                    } else {
                        item = item.replace("{{신규}}", "");
                    }

                    return item;
                }
            },
            RenderDetail: function (target) {
                // var $CONTENT = target;
                var $CONTENT = target,
                    $HOSP,
                    $TITLE,
                    $DIVIDELINE = '<div class="ln_solid"></div>';

                $CONTENT.empty();
                $CONTENT.append(
                    '<div class="x_panel"><div class="x_title"></div><div class="x_content"><div class="col-md-8 col-sm-12 col-xs-12 service-item"></div><div class="col-md-4 col-sm-12 col-xs-12 hospinfo-item"></div></div></div>'
                );
                $HOSP = $CONTENT.find(".hospinfo-item");
                $TITLE = $CONTENT.find(".x_title");
                $CONTENT = $CONTENT.find(".service-item");

                $TITLE.append(`
                <h4> A/S 처리시 <b class="red">반드시 연결고리를 고려</b>하여 진행합시다!</h4>
                <div class="clearfix"></div>
                <span style="color:blue !important;">[예] 시발점 : 데스크, 진료실, 마스터코드)</span>
                `)

                // AS Service 상태 변화
                $CONTENT.append(_workFlow(_this.data.Service.as));
                // $CONTENT.append(RenderWorkFlow(_this.data.Service.as))

                // 실행파일 선택 표시
                $CONTENT.append(_selectExe(_this.data.Service.as));
                _addExeEventListeners($CONTENT, _this.data.Service.as);

                // 태그 선택 표시

                if (_this.data.Service.as["실행메뉴"].length) {
                    _this.fn
                        .LoadCategorys(_this.data.Service.as["실행파일"], "")
                        .then(function (result) {
                            _this.data.Service.menus = result;
                            _this.fn.RenderMenu($CONTENT, _this.data.Service);
                            return _this.fn.LoadCategorys(
                                _this.data.Service.as["실행파일"],
                                _this.data.Service.as["실행메뉴"]
                            );
                        })
                        .then(function (result) {
                            _this.data.Service.btns = result;
                            _this.fn.RenderMenuButton(
                                $CONTENT,
                                _this.data.Service
                            );
                        });
                } else {
                    _this.fn.RenderMenu($CONTENT, _this.data.Service);
                }
                $CONTENT
                    .find(".service-exe-container")
                    .append(
                        _tag(
                            _this.data.Service.as,
                            _this.data.Service.similarity
                        )
                    );
                _addTagEventListener($CONTENT, _this.data.Service.as);
                // _addMenuEventListener($CONTENT, _this.data.Service.as)

                //응급여부표시
                $CONTENT.append(_emergency(_this.data.Service.as));
                _addEmergencyEventListener(_this.data.Service.as);

                //처리예정일 표시
                $CONTENT.append(_workSchedule(_this.data.Service.as));
                _addWorkScheduleEventListener(_this.data.Service.as);

                //문의내용
                $CONTENT.append(_comment(_this.data.Service.as));

                //첨부이미지
                $CONTENT.append(_images(_this.data.Service.as));
                _addAttachmentEventListener(_this.data.Service.as);

                //확인,처리,보류
                $CONTENT.append(
                    _careComment(_this.data.Service.as, _this.data.Service.afk)
                );
                _addServiceStatusEventListener(_this.data.Service);

                //댓글
                $CONTENT.append(
                    _replys(
                        _this.data.Service.as["인덱스"],
                        _this.data.Service.replys
                    )
                );
                _addReplyEventListener(_this.data.Service);

                // 병원정보, 특이사항, 백업
                $HOSP.append(_hospinfo(_this.data.Service));
                _hospinfoEventListener();

                _this.ServiceHelper = new ServiceHelper(
                    $(".service-helper-list"),
                    $(".helper-options"),
                    $(".helper-pagination"),
                    _this.data.Service.as["맥주소"]
                );
                // _this.ServiceHelper.renderTemplate()

                $('[data-toggle="tooltip"]').tooltip();

                // function _workFlow(RenderWorkFlow) {
                function _workFlow(service) {
                    var $WORKFLOW = "<div>";

                    if (service["상태"] >= SERVICE_STATUS.ACCEPT) {
                        $WORKFLOW += " <b>접수자:</b> " + service["접수자"];
                        $WORKFLOW +=
                            " <b>연락처:</b> " +
                            service["연락처"] +
                            (service["내선번호"]
                                ? "(내선: " + service["내선번호"] + ")"
                                : "");
                        $WORKFLOW +=
                            ' <b>접수일:</b> <span class="red">' +
                            moment(service["접수일자"]).format("LLL") +
                            "(" +
                            moment(service["접수일자"]).fromNow() +
                            ")</span>";
                    }

                    if (service["확인자"] !== 0) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>확인자:</b> <b class="blue">' +
                            service["확인자명"] +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>확인일:</b><span class="red">' +
                            moment(service["확인일자"]).format("LLL") +
                            "(" +
                            moment(service["확인일자"]).fromNow() +
                            ")</span>";
                    }

                    if (
                        service["상태"] >= SERVICE_STATUS.SHARE &&
                        service["공유자"] !== 0
                    ) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>공유자:</b> <b class="blue">' +
                            (service["공유자"] !== 0
                                ? service["공유자명"]
                                : Data.Service.info["담당"] || "") +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>공유일:</b><span class="red">' +
                            (service["공유자"] !== 0
                                ? moment(service["공유일자"]).format("LLL")
                                : "15분 자동공유") +
                            "(" +
                            moment(service["공유일자"]).fromNow() +
                            ")</span>";
                    }

                    if (
                        service["상태"] >= SERVICE_STATUS.PROCESS &&
                        service["처리자"] !== 0
                    ) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>처리자:</b> <b class="blue">' +
                            service["처리자명"] +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>처리일:</b><span class="red">' +
                            moment(service["처리일자"]).format("LLL") +
                            "(" +
                            moment(service["처리일자"]).fromNow() +
                            ")</span>";
                    }

                    if (
                        service["상태"] >= SERVICE_STATUS.HOLD &&
                        service["보류자"] !== 0
                    ) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>보류자:</b> <b class="blue">' +
                            service["보류자명"] +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>보류일:</b><span class="red">' +
                            moment(service["보류일자"]).format("LLL") +
                            "(" +
                            moment(service["보류일자"]).fromNow() +
                            ")</span>";
                    }

                    if (
                        service["상태"] >= SERVICE_STATUS.DONE &&
                        service["완료자"] !== 0
                    ) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>완료자:</b> <b class="blue">' +
                            service["완료자명"] +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>완료일:</b><span class="red">' +
                            moment(service["완료일자"]).format("LLL") +
                            "(" +
                            moment(service["완료일자"]).fromNow() +
                            ")</span>";
                    }

                    if (
                        service["상태"] >= SERVICE_STATUS.FEEDBACK &&
                        service["피드백자"] !== 0
                    ) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>피드백:</b> <b class="blue">' +
                            service["피드백자명"] +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>피드백일:</b><span class="red">' +
                            moment(service["피드백일자"]).format("LLL") +
                            "(" +
                            moment(service["피드백일자"]).fromNow() +
                            ")</span>";
                    }

                    $WORKFLOW += "</div>";

                    return $WORKFLOW;
                }

                function _selectExe(service) {
                    var $CATEGORY = "";
                    $CATEGORY =
                        '<div class="well p-xs service-exe-container m-b-none">';

                    if (
                        service["상태"] === SERVICE_STATUS.DONE ||
                        service["상태"] === SERVICE_STATUS.FEEDBACK ||
                        service["상태"] === SERVICE_STATUS.CANCEL
                    ) {
                        $CATEGORY +=
                            '<p class="m-b-none">실행파일: <b class="blue" id="service-exe-' +
                            service["인덱스"] +
                            '">' +
                            service["실행파일"] +
                            "</></p>";
                    } else {
                        // var $EXE = ''
                        $CATEGORY +=
                            '<p class="m-b-none">실행파일: </p><div class="btn-group service-exe-group" data-toggle="buttons">';
                        $CATEGORY += (function () {
                            var _exe = "";
                            CONSTS.EXES.forEach(function (exe) {
                                _exe +=
                                    '<label class="btn btn-xs ' +
                                    (service["실행파일"] === exe
                                        ? "btn-primary active"
                                        : "btn-default") +
                                    '">';
                                _exe +=
                                    '   <input type="radio" name="service-exe" value="' +
                                    exe +
                                    '" ' +
                                    (service["실행파일"] === exe
                                        ? 'checked="true"'
                                        : "") +
                                    "/>";
                                _exe += "   " + exe;
                                _exe += "</label>";
                            });
                            return _exe;
                        })();
                        $CATEGORY += "</div>";
                        //return $CATEGORY
                        $CATEGORY +=
                            '<p class="m-b-none m-t-xs">메뉴: <span class="red">실행파일 선택시 메뉴활성화</span></p> <div class="btn-group service-menu-group" data-toggle="buttons"></div>';
                        $CATEGORY +=
                            '<p class="m-b-none m-t-xs">버튼: <span class="red">메뉴선택시 버튼활성화</span></p> <div class="btn-group service-button-group" data-toggle="buttons"></div>';
                    }

                    $CATEGORY += "</div>";
                    return $CATEGORY;
                }

                function _addExeEventListeners(parent, service) {
                    parent
                        .find('[name="service-exe"]')
                        .bind("change", function (event) {
                            var $THIS = $(this);
                            var selectExe = $THIS.val();
                            if (service["실행파일"] !== selectExe) {
                                service["실행파일"] = selectExe;
                                service["실행메뉴"] = "";
                                service["세부화면"] = "";

                                $THIS
                                    .parent()
                                    .addClass("btn-primary")
                                    .removeClass("btn-default")
                                    .siblings()
                                    .removeClass("btn-primary")
                                    .addClass("btn-default");

                                parent.find(".service-menu-group").empty();
                                parent.find(".service-button-group").empty();
                                _this.fn
                                    .LoadCategorys(
                                        service["실행파일"],
                                        service["실행메뉴"]
                                    )
                                    .then(function (menus) {
                                        _this.data.Service.menus = menus;
                                        _this.fn.RenderMenu(
                                            parent,
                                            _this.data.Service
                                        );
                                    });
                            }
                        });
                }

                function _emergency(service) {
                    var $EMERGENCY = "";
                    if (
                        service["상태"] === SERVICE_STATUS.ACCEPT ||
                        service["상태"] === SERVICE_STATUS.PROCESS
                    ) {
                        $EMERGENCY += '<div class="checkbox">';
                        $EMERGENCY += '    <label class="p-l-none">';
                        $EMERGENCY +=
                            '         <input type="checkbox" name="service-emergency" id="service-emergency" value="' +
                            service["응급"] +
                            '" ' +
                            (service["응급"] === 1 ? 'checked="true"' : "") +
                            ' class="flat" /> 응급';
                        $EMERGENCY += "    </label>";
                        $EMERGENCY += ' <p class="font-bold red">';
                        $EMERGENCY += '     <ol class="font-bold red">';
                        $EMERGENCY +=
                            "         <li>진료를 진행할 수 없을정도의 심각한 오류</li>";
                        $EMERGENCY +=
                            "         <li>당장 환자가 기다리고 있는 경우(문서, 수납 등)</li>";
                        $EMERGENCY +=
                            "         <li>청구쪽 오류 불능건.(월초, 월말)</li>";
                        $EMERGENCY += "     </ol>";
                        $EMERGENCY += " </p>";
                        $EMERGENCY += "</div>";
                    } else {
                        // $EMERGENCY += '<p><span class="badge bg-red">응급</span></p>';
                    }

                    // 본사AS
                    if (
                        service["상태"] === SERVICE_STATUS.PROCESS ||
                        service["상태"] === SERVICE_STATUS.DONE
                    ) {
                        $EMERGENCY += '<div class="checkbox">';
                        $EMERGENCY += '    <label class="p-l-none">';
                        $EMERGENCY +=
                            '         <input type="checkbox" name="service-internal" id="service-internal" value="' +
                            service["본사"] +
                            '" ' +
                            (service["본사"] === 1 ? 'checked="true"' : "") +
                            ' class="flat" /> 본사A/S';
                        $EMERGENCY += "    </label>";
                        $EMERGENCY +=
                            '    <small class="blue">처리자가 지사로부터 수수료를 받으려면 체크를 해제합니다.</small>';
                        $EMERGENCY += "</div>";
                    }

                    return $EMERGENCY;
                }

                function _addEmergencyEventListener(service) {
                    $('[name="service-emergency"]')
                        .iCheck({
                            checkboxClass: "icheckbox_flat-red",
                            radioClass: "iradio_flat-red"
                        })
                        .bind("ifChanged", function (event) {
                            service["응급"] = service["응급"] === 0 ? 1 : 0;
                        });

                    var $INTERNAL = $('[name="service-internal"]');

                    if ($INTERNAL.length) {
                        $INTERNAL
                            .iCheck({
                                checkboxClass: "icheckbox_flat-blue",
                                radioClass: "iradio_flat-blue"
                            })
                            .bind("ifChanged", function (event) {
                                service["본사"] = service["본사"] === 0 ? 1 : 0;
                            });

                        if (service["상태"] === SERVICE_STATUS.PROCESS) {
                            if (params.user["인덱스"] !== service["처리자"]) {
                                $INTERNAL.iCheck("disable");
                            }
                        } else if (service["상태"] === SERVICE_STATUS.DONE) {
                            if (params.user["인덱스"] !== service["완료자"]) {
                                $INTERNAL.iCheck("disable");
                            }
                        }
                    }

                    $('[name="service-finder-add"]')
                        .iCheck({
                            checkboxClass: "icheckbox_flat-blue",
                            radioClass: "iradio_flat-blue"
                        })
                        .bind("ifChanged", function (event) {
                            // service['응급'] = service['응급'] === 0 ? 1 : 0
                            service["답변채택"] =
                                !service["답변채택"] || service["답변채택"] == 0
                                    ? 1
                                    : 0;
                            // console.log(service['답변채택'])
                        });
                }

                function _workSchedule(service) {
                    if (service['상태'] < CONSTS.SERVICE_STATUS.PROCESS) return false;

                    return `
                    <div class="form-inline">                            
                        <div class="form-group">
                            <label for="">처리예정일:</label>
                            ${service['처리자'] === params.user['인덱스'] ?
                            `<input type='text' class="form-control datepicker service-work-schedule-${service['인덱스']}" readonly />`
                            :
                            `<p class="form-control-static">${service['처리예정일']}</p>`
                        }   
                        </div>
                        ${service['처리자'] === params.user['인덱스'] ?
                            `<button class="btn btn-success m-t-xs service-save" data-index="${service['인덱스']}">저장</button>`
                            :
                            ''
                        }
                    </div>
                `;

                }
                function _addWorkScheduleEventListener(service) {
                    $('.service-work-schedule-' + service['인덱스']).datetimepicker({
                        format: "YYYY-MM-DD",
                        dayViewHeaderFormat: 'YYYY년MM월DD일',
                        ignoreReadonly: true,
                        showTodayButton: true,
                        useCurrent: false,
                        defaultDate: (service['처리예정일'].length ? service['처리예정일'] : null)
                    }).bind('dp.change', function (event) {
                        service['처리예정일'] = event.date.format('YYYY-MM-DD');
                    });
                }

                function _comment(service) {
                    var $COMMENT = "";
                    $COMMENT += $DIVIDELINE;
                    $COMMENT +=
                        '<h5 class="font-bold"><i class="fa fa-question-circle red"></i> 추가정보 or 문의내용</h5>';
                    $COMMENT += exports.fn.urlify(
                        service["문의내용"].replace(/\n/gim, "<br>")
                    );
                    $COMMENT +=
                        '<h5 class="font-bold"><i class="fa fa-check-circle green"></i> 전달내용</h5>';
                    $COMMENT += exports.fn.urlify(
                        service["전달내용"].replace(/\n/gim, "<br>")
                    );
                    return $COMMENT;
                }

                function _images(service) {
                    var $IMAGES = "";
                    $IMAGES += '<div class="attachment"><div class="row">';
                    if (service["컨버전"] > 0) {
                        var conversions = service["문의내용"];
                        conversions = conversions.replace(
                            /style="width: 100%;"/gim,
                            ""
                        );
                        conversions = conversions.replace(
                            /img-preview/gim,
                            "col-lg-12 no-padding as-image-preview"
                        );
                        conversions = conversions.replace(
                            /img-resonsive/gim,
                            ""
                        );
                        conversions = conversions.replace(
                            /src="uploads/gim,
                            'src="/uploads'
                        );
                        conversions = conversions.replace(
                            /src="\/uploads/gim,
                            'src="/uploads'
                        );
                        conversions = $(conversions);

                        conversions.find("img").each(function (index, value) {
                            $(value).data("imageviewer", "true");
                            $IMAGES += $(value)[0].outerHTML;
                            $(value).remove();
                        });
                        service["문의내용"] = conversions[0].outerHTML;
                    }

                    if (service["이미지"] && service["이미지"] !== "[]") {
                        // $IMAGES += '<div class="col-lg-1 col-md-6 col-sm-12 col-xs-12"
                        // $IMAGES += '<ul>';
                        JSON.parse(service["이미지"]).forEach(function (img) {
                            // img = 'http://115.68.114.16:4183' + img;
                            img =
                                img.indexOf("/uploads/service") < 0
                                    ? img.replace(
                                        "/capture",
                                        "/uploads/service"
                                    )
                                    : img;
                            img =
                                img.indexOf("/uploads") < 0
                                    ? "/uploads" + img
                                    : img;
                            //$IMAGES += '<li>';
                            img = img.toLowerCase();
                            if (
                                img.indexOf(".jpg") < 0 &&
                                img.indexOf(".jpeg") < 0 &&
                                img.indexOf(".png") < 0 &&
                                img.indexOf(".bmp") < 0 &&
                                img.indexOf(".gif") < 0
                            ) {
                                $IMAGES +=
                                    '<a href="' +
                                    img +
                                    '" class="btn btn-link">' +
                                    img.split("/")[img.split("/").length - 1] +
                                    "</a>";
                            } else {
                                $IMAGES +=
                                    '<div class="col-lg-3 col-md-3 col-sm-6 col-xs-12 atch-thumb no-padding">';
                                $IMAGES +=
                                    '<img style="width: 100%;" data-imageviewer="true" src="' +
                                    img +
                                    '" data-high-src="' +
                                    img +
                                    '" alt="이미지가 삭제되었습니다." data-placement="top" data-toggle="tooltip" data-original-tooltip="이미지를 더블클릭하면 크게 볼 수 있습니다."/>';
                                // $IMAGES += '    <div class="overlay">'
                                $IMAGES +=
                                    '        <button type="button" class="delete-attachment btn btn-link red fa fa-trash" data-value="' +
                                    img +
                                    '"></button>';
                                // $IMAGES += '    </div>'
                                $IMAGES += "</div>";
                            }
                            //$IMAGES += '</li>';
                            // $IMAGES += '<img class="img-thumbnail" src="' + img + '" data-high-src="' + img + '" data-tooltip="tooltip" title="이미지를 더블클릭하면 크게 볼 수 있습니다."/>';
                        });
                        //$IMAGES += '</ul>';
                    }

                    $IMAGES += "</div></div>";
                    $IMAGES += "<br>";
                    $IMAGES +=
                        '<label class="btn btn-primary btn-sm btn-file">';
                    $IMAGES +=
                        '    파일첨부 <input type="file" name="uploadfile" style="display: none;" multiple>';
                    $IMAGES += "</label>";
                    $IMAGES +=
                        '<span class="font-bold red">파일명에 쉼표(,) 띄어쓰기를 사용하지 마세요.</span>';

                    return $IMAGES;
                }

                function _addAttachmentEventListener(service) {
                    $(':input[name="uploadfile"]').bind("change", function () {
                        $(this).trigger("fileselect");
                    });
                    $(':input[name="uploadfile"]').bind(
                        "fileselect",
                        function () {
                            var $this = $(this);
                            // fn.UploadFile($(this).get(0).files);
                            var files = $(this).get(0).files;
                            var uploadFiles;
                            var formData = new FormData();

                            Object.keys(files).forEach(function (key) {
                                formData.append("uploadfile", files[key]);
                            }, this);

                            formData.append("savepath", "service");

                            axios
                                .post(API.FILEMANAGER.UPLOAD, formData)
                                .then(function (result) {
                                    console.log(result);
                                    uploadFiles = result.data;
                                    if (service["이미지"] == "[]") {
                                        service["이미지"] = "";
                                        uploadFiles.forEach(function (_file) {
                                            if (service["이미지"].length > 0) {
                                                service["이미지"] =
                                                    service["이미지"] + ",";
                                            }
                                            service["이미지"] +=
                                                '"' + _file["oPath"] + '"';
                                        });

                                        service["이미지"] =
                                            "[" + service["이미지"] + "]";
                                    } else {
                                        service["이미지"] = service[
                                            "이미지"
                                        ].replace(/]/gim, "");

                                        uploadFiles.forEach(function (_file) {
                                            if (service["이미지"].length > 0) {
                                                service["이미지"] =
                                                    service["이미지"] + ",";
                                            }
                                            service["이미지"] +=
                                                '"' + _file["oPath"] + '"';
                                        });
                                        service["이미지"] += "]";
                                    }
                                    service["이미지"] = service[
                                        "이미지"
                                    ].replace(/\\/gim, "/");

                                    var updateData = {
                                        인덱스: service["인덱스"],
                                        이미지: service["이미지"]
                                    };
                                    return axios.put(
                                        API.SERVICE.SAVE,
                                        updateData
                                    );
                                })
                                .then(function (result2) {
                                    var $IMAGES = "";
                                    uploadFiles.forEach(function (_f) {
                                        $IMAGES = "";
                                        var img = _f.oPath;
                                        img = img.toLowerCase();
                                        if (
                                            img.indexOf(".jpg") < 0 &&
                                            img.indexOf(".jpeg") < 0 &&
                                            img.indexOf(".png") < 0 &&
                                            img.indexOf(".bmp") < 0 &&
                                            img.indexOf(".gif") < 0
                                        ) {
                                            $this
                                                .closest(".atch-thumb")
                                                .append(
                                                    '<a href="' +
                                                    img +
                                                    '" class="btn btn-link">' +
                                                    img.split("/")[
                                                    img.split("/")
                                                        .length - 1
                                                    ] +
                                                    "</a>"
                                                );
                                        } else {
                                            $IMAGES +=
                                                '<div class="col-lg-3 col-md-3 col-sm-6 col-xs-12 atch-thumb no-padding">';
                                            $IMAGES +=
                                                '<img style="width: 100%;" data-imageviewer="true" src="' +
                                                img +
                                                '" data-high-src="' +
                                                img;
                                            $IMAGES +=
                                                '" alt="이미지가 삭제되었습니다." data-placement="top" data-toggle="tooltip" data-original-tooltip="이미지를 더블클릭하면 크게 볼 수 있습니다."/>';
                                            // $IMAGES += '    <div class="overlay">'
                                            $IMAGES +=
                                                '        <button type="button" class="delete-attachment btn btn-link red fa fa-trash" data-value="' +
                                                img +
                                                '"></button>';
                                            // $IMAGES += '    </div>'
                                            $IMAGES += "</div>";
                                            $this
                                                .parent()
                                                .parent()
                                                .find(".attachment>.row")
                                                .append($IMAGES);
                                        }
                                    });
                                })
                                .catch(function (error) {
                                    fn.errorNotify(error);
                                });
                            // $.ajax({
                            //     url: API.FILEMANAGER.UPLOAD,
                            //     processData: false,
                            //     contentType: false,
                            //     cache: false,
                            //     data: formData,
                            //     type: 'POST',
                            //     beforeSend: function () {},
                            //     success: function (res) {
                            //         $SERVICEINFO.filter('#captures').val(JSON.stringify(res))
                            //         fn.RenderCaptureImage()
                            //     },
                            //     error: function (error) {
                            //         fn.errorNotify(error)
                            //     }
                            // })
                        }
                    );
                    //첨부파일 삭제 이벤트
                    $(".delete-attachment").bind("click", function (event) {
                        var $this = $(this);
                        var attachment = $this.data("value");

                        swal({
                            title: "첨부파일 삭제",
                            text: "해당파일을 삭제할까요?",
                            type: "question",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33"
                        })
                            .then(function (result) {
                                if (result !== "cancel") {
                                    var targetObj = {
                                        oPath: attachment
                                    };
                                    return axios.delete(
                                        API.FILEMANAGER.DELETE,
                                        {
                                            data: {
                                                files: [targetObj]
                                            }
                                        }
                                    );
                                }
                            })
                            .then(function (result2) {
                                console.log(result2);
                                if (result2.status == 200) {
                                    service["이미지"] = service[
                                        "이미지"
                                    ].replace(/,| /gim, "");
                                    service["이미지"] = service[
                                        "이미지"
                                    ].replace('"' + attachment + '"', "");
                                    service["이미지"] = service[
                                        "이미지"
                                    ].replace(/""/gim, '","');

                                    var updateData = {
                                        인덱스: service["인덱스"],
                                        이미지: service["이미지"]
                                    };
                                    return axios.put(
                                        API.SERVICE.SAVE,
                                        updateData
                                    );
                                }
                            })
                            .then(function (result3) {
                                console.log(result3);
                                $this.closest(".atch-thumb").remove();
                            })
                            .catch(function (error) {
                                fn.errorNotify(error);
                            });
                    });
                }

                function _tag(service, similarity) {
                    var exe = service["실행파일"].trim();
                    var mainCategory = service["실행메뉴"].trim() || "";
                    var subCategory = service["세부화면"].trim() || "";
                    var $TAGS = "";
                    //서재민, 서영필, 황선주, 이종은, 정두영, 문승욱
                    $TAGS += '<div class="ln_solid m-t-xs m-b-xs"></div>';
                    // $TAGS += '<select class="form-control selectpicker show-tick category" data-width="fit" data-size="10" title="메뉴/버튼" ' + (service['상태'] == CONSTS.SERVICE_STATUS.DONE || service['상태'] == CONSTS.SERVICE_STATUS.FEEDBACK ? 'disabled' : '') + '>'
                    $TAGS +=
                        '<select class="form-control selectpicker show-tick category" data-width="fit" data-size="10" title="메뉴/버튼">';
                    if (mainCategory.length && subCategory.length) {
                        $TAGS +=
                            '<option value="' +
                            mainCategory +
                            " - " +
                            subCategory +
                            '" selected>' +
                            mainCategory +
                            " - " +
                            subCategory +
                            "</option>";
                    }
                    $TAGS += "</select>";

                    if (service["상태"] == CONSTS.SERVICE_STATUS.PROCESS) {
                        $TAGS += '<div class="checkbox">';
                        $TAGS += '    <label class="p-l-none">';
                        $TAGS +=
                            '         <input type="checkbox" name="service-finder-add" class="flat" /> 답변채택';
                        $TAGS += "    </label>";
                        $TAGS +=
                            '    <small class="blue">해당 AS건의 메뉴/버튼값을 답변채택리스트에 바로 추가합니다.</small>';
                        $TAGS += "</div>";
                    }
                    // if (similarity.length) {
                    //     $TAGS += '  <a href="#" class="btn btn-link orange asfinder-link">' + similarity[0]['건수'] + '개의 같은 태그로 처리된 AS를 발견하였습니다. AS Finder를 열려면 클릭하세요.</a>'
                    // }
                    // $TAGS += '<p class="font-bold blue">※ 문의내용이 발생한 메뉴/버튼 이름 검색 → 해당 메뉴/버튼이 위치한 검색물 지정 → AS Finder 클릭</p>'
                    // $TAGS += '<p class="font-bold blue">※ 문의내용이 발생한 메뉴/버튼 이름을 테그로 지정하는 방법 ('
                    // $TAGS += ' <a class="btn btn-link btn-xs expander" data-toggle="collapse" href="#tag_help_' + service['인덱스'] + '" aria-expanded="false" aria-controls="tag_help_' + service['인덱스'] + '">자세히</a>)</p>'
                    // $TAGS += '<p class="font-bold blue">※ 문의내용이 버튼을 눌렀을 때 발생되는 문제일 경우 버튼을 테그로 지정합니다. 지정하는 방법 ('
                    // $TAGS += ' <a class="btn btn-link btn-xs expander" data-toggle="collapse" href="#tag_help2_' + service['인덱스'] + '" aria-expanded="false" aria-controls="tag_help_' + service['인덱스'] + '">자세히</a>)</p>'
                    // $TAGS += '<img id="tag_help_' + service['인덱스'] + '" class="collapse" aria-expanded="false" style="width: 100%;" data-imageviewer="true" src="/images/tag4.jpg"/>'
                    // $TAGS += '<img id="tag_help2_' + service['인덱스'] + '" class="collapse" aria-expanded="false" style="width: 100%;" data-imageviewer="true" src="/images/tag6.jpg"/>'

                    return $TAGS;
                }

                function _addTagEventListener(parent, service) {
                    var exe = service["실행파일"].trim();
                    parent
                        .find("select.category")
                        .selectpicker({
                            liveSearch: true,
                            size: 10
                        })
                        .ajaxSelectPicker({
                            ajax: {
                                url: API.SERVICE.TAGS,
                                method: "GET",
                                dataType: "json",
                                data: function () {
                                    var params = {
                                        search: "{{{q}}}",
                                        app: service["실행파일"].trim()
                                    };
                                    // debugger;
                                    // if (gModel.selectedGroup().hasOwnProperty('ContactGroupID')) {
                                    //     params.GroupID = gModel.selectedGroup().ContactGroupID;
                                    // }
                                    return params;
                                }
                            },
                            locale: {
                                emptyTitle: "버튼명칭으로 검색"
                            },
                            preprocessData: function (data) {
                                var tags = [];
                                data.forEach(function (tag) {
                                    tags.push({
                                        value: tag,
                                        text: tag,
                                        disabled: false
                                    });
                                });

                                return tags;
                            },
                            preserveSelected: false
                        })
                        .bind("changed.bs.select", function (event) {
                            var selTag = $(this).val() || "";
                            if (selTag.length) {
                                service["실행메뉴"] = selTag
                                    .split("-")[0]
                                    .trim();
                                service["세부화면"] = selTag
                                    .split("-")[1]
                                    .trim();
                                _this.fn.LoadsimilarList();
                            }
                        });

                    $("a.asfinder-link").bind("click", function (event) {
                        event.preventDefault();
                        _this.asFinder = window.open(
                            "/service/finder",
                            "ASFinder",
                            "modal=yes,alwaysRaised=yes"
                        );

                        setTimeout(function () {
                            if (!_this.asFinder) {
                                if (window.Service.asFinder)
                                    _this.asFinder = window.Service.asFinder;
                            }

                            if (_this.asFinder) {
                                _this.asFinder.postMessage(
                                    {
                                        index: service["인덱스"],
                                        exe: service["실행파일"],
                                        mainCategory: service["실행메뉴"],
                                        subCategory: service["세부화면"],
                                        comment: service["문의내용"],
                                        program:
                                            _this.data.Service.info[
                                            "프로그램ID"
                                            ]
                                    },
                                    location.origin
                                );
                            }
                        }, 1000);
                    });
                }

                function _careComment(service, afk) {
                    var isDeveloper = params.user['인덱스'] == 149 || params.user['부서'] === '개발실';
                    var $COMMENT = "",
                        // $CONFIRM_TITLE = '<h5 class="font-bold"><i class="fa fa-info-circle blue"></i> 확인내용 <small class="red font-bold">총책임  : <span class="text-muted">장재혁 과장</span>    오류 발생 과정 및 테스트한 내용 등 담당자 확인내용 자세히 기재</small></h5>',
                        $CONFIRM_TITLE = '<h5 class="font-bold"><i class="fa fa-info-circle blue"></i> 확인내용 <small class="red font-bold">오류 발생 과정 및 테스트한 내용 등 담당자 확인내용 자세히 기재</small></h5>',
                        $CONFIRM_EDIT =
                            '<textarea class="form-control" id="comment-confirm-' +
                            service["인덱스"] +
                            '" rows="11">' +
                            (service["확인내용"] ||
                                params.setting.service["확인내용"]) +
                            "</textarea>",
                        $CONFIRM_READ =
                            exports.fn.urlify(
                                service["확인내용"].replace(/\n/gim, "<br>")
                            ) || " - ",
                        $HOLD_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-pause-circle"></i> 보류내용</h5>',
                        $HOLD_MACRO =
                            '<select class="selectpicker" id="hold-macro" data-target="#comment-hold-' +
                            service["인덱스"] +
                            '" data-width="fit">{{MACRO}}</select>',
                        $HOLD_EDIT =
                            '<textarea class="form-control" id="comment-hold-' +
                            service["인덱스"] +
                            '" rows="5">' +
                            service["보류내용"] +
                            "</textarea>",
                        $HOLD_READ =
                            exports.fn.urlify(
                                service["보류내용"].replace(/\n/gim, "<br>")
                            ) || " - ",
                        $PROCESS_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-check-circle green"></i> 처리내용</h5>',
                        $PROCESS_TYPE =
                            '<select class="selectpicker" id="process-type" data-target="#process-example" data-comment="#comment-process-' +
                            service["인덱스"] +
                            '" title="처리구분" data-width="fit">{{PROCESS}}</select><div class="well well-sm hidden" id="process-example"></div>',
                        $PROCESS_EDIT =
                            '<textarea class="form-control" id="comment-process-' +
                            service["인덱스"] +
                            '" rows="10">' +
                            service["처리내용"] +
                            "</textarea>",
                        $PROCESS_READ =
                            (service["처리구분"] > 0
                                ? '<h5 class="font-bold blue">처리구분: ' +
                                params.setting.service["처리구분"][
                                service["처리구분"] - 1
                                ]["구분명"] +
                                "</h5>"
                                : "") +
                            exports.fn.urlify(
                                service["처리내용"].replace(/\n/gim, "<br>")
                            ) || " - ",
                        $CANCEL_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-times-circle red"></i> 취소내용</h5>',
                        $CANCEL_READ =
                            exports.fn.urlify(
                                service["취소내용"].replace(/\n/gim, "<br>")
                            ) || " - ",
                        $DEVLOG_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-code"></i> 개발로그 <small class="font-bold red">입력창 더블클릭시 작성자/시간 등록됨</small></h5>',
                        $DEVLOG_EDIT =
                            '<textarea class="form-control" id="comment-devlog-' +
                            service["인덱스"] +
                            '" rows="10">' +
                            service["개발로그"] +
                            "</textarea>",
                        $BUTTON_SHARE =
                            '<button class="btn btn-info btn-sm service-status" {{권한}} data-index="' +
                            service["인덱스"] +
                            '" data-status="' +
                            SERVICE_STATUS.SHARE +
                            '">공유하기</button>',
                        $BUTTON_PROCESS =
                            '<button class="btn btn-info btn-sm service-status" data-index="' +
                            service["인덱스"] +
                            '" data-status="' +
                            SERVICE_STATUS.PROCESS +
                            '">처리하기</button>',
                        $BUTTON_DONE =
                            '<button class="btn btn-info btn-sm service-status" {{권한}} data-index="' +
                            service["인덱스"] +
                            '" data-status="' +
                            SERVICE_STATUS.DONE +
                            '">완료하기</button>',
                        $BUTTON_DONE_FEEDBACK =
                            '<button class="btn btn-info btn-sm service-status" {{권한}} data-index="' +
                            service["인덱스"] +
                            '" data-status="' +
                            SERVICE_STATUS.DONE +
                            "|" +
                            SERVICE_STATUS.FEEDBACK +
                            '">완료 + 피드백완료</button>',
                        $BUTTON_HOLD =
                            '<button class="btn btn-info btn-sm service-status" {{권한}} data-index="' +
                            service["인덱스"] +
                            '" data-status="' +
                            SERVICE_STATUS.HOLD +
                            '">보류하기</button>',
                        $BUTTON_PASS =
                            '<button class="btn btn-danger btn-sm" id="service-pass" {{권한}} data-index="' +
                            service["인덱스"] +
                            '" data-toggle="tooltip" data-original-title="상태변경없이 현재 A/S를 다른 직원에게 전달합니다.">전달하기</button>',
                        $BUTTON_GOACCEPT =
                            '<button class="btn btn-danger btn-sm" id="service-go-accept" data-index="' +
                            service["인덱스"] +
                            '" data-toggle="tooltip" data-original-title="현재 A/S를 접수상태로 변경합니다.">접수로 변경</button>',
                        $BUTTON_SAVE =
                            '<button class="btn btn-success btn-sm service-save" id="service-save" data-index="' +
                            service["인덱스"] +
                            '" data-toggle="tooltip" data-original-title="상태변경없이 변경내용만 저장합니다.">저장하기</button>',
                        $BUTTON_AFK =
                            '<button class="btn btn-warning btn-sm" id="service-afk" data-index="' +
                            service["인덱스"] +
                            '" data-toggle="tooltip" data-original-title="접수자와 연락이 안되는경우 접수자에게 부재중표시합니다.">부재중' +
                            (afk.length > 0 ? "(" + afk.length + ")" : "") +
                            "</button>",
                        $BUTTON_FEEDBACK =
                            '<button class="btn btn-success btn-sm" id="service-feedback" data-index="' +
                            service["인덱스"] +
                            '" data-toggle="tooltip" data-original-title="접수자에게 피드백을 전달하였을경우 피드백완료 상태로 변경합니다.">피드백완료</button>',
                        $LINKEDSERVICE_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-link"></i> 과거 공유/처리중인 AS</h5>',
                        $LINKEDSERVICE_READ = (function () {
                            var linkedService = service["연결AS"].split(",");
                            var links = "";
                            if (service["연결AS"].length > 0) {
                                linkedService.forEach(function (item) {
                                    links +=
                                        "<a href=\"javascript:window.open('/service/history/detail?index=" +
                                        item +
                                        "&id=" +
                                        _this.data.Service.info["ID"] +
                                        "&hospnum=" +
                                        _this.data.Service.info["기관기호"] +
                                        '\')" class="btn btn-link btn-xs">#' +
                                        item +
                                        "</a>";
                                });
                            }
                            return links;
                        })(),
                        $DEVSHARETABLE = `
                            <table class="table table-linked table-bordered jambo_table service-dev-share-${service["인덱스"]
                            }">
                                <thead>
                                    <th class="text-center">파일전달</th>
                                    <th class="text-center">파일테스트</th>
                                    <th class="text-center">버전</th>
                                    <th class="text-center">테스트</th>
                                </thead>
                                <tbody>
                                    <tr data-service-index="${service["인덱스"]
                            }">
                                        <td class="text-center">
                                            <!--input type="checkbox" data-field="파일전달" ${service["파일전달"] > 0
                                ? "checked"
                                : ""
                            } disabled/-->
                                            ${service["파일전달"] > 0
                                ? '<i class="fa fa-check blue"></i>'
                                : ""
                            }
                                        </td>
                                        <td class="text-center">
                                            <input type="checkbox" data-field="파일테스트" ${service["파일테스트"] > 0
                                ? "checked"
                                : ""
                            } ${service["파일전달"] == 0 ? "disabled" : ""
                            }/>
                                            ${service["파일테스터"]}
                                        </td>
                                        <td class="text-center">
                                            ${service["버전"] || "-"}
                                        </td>
                                        <td class="text-center form-group form-inline">
                                            <select class="form-control input-sm" ${!service["버전"].length
                                ? "disabled"
                                : ""
                            } style="width:fit-content; font-weight: bold;" data-field="업데이트테스트">
                                                <option style="color:#ccc;" value="0" ${service["테스트"] == 0
                                ? "selected"
                                : ""
                            }>미시행</option>
                                                <option style="color:green;" value="1" ${service["테스트"] > 0
                                ? "selected"
                                : ""
                            }>시행</option>
                                                <option style="color:red;" value="2" ' ${service["테스트"] < 0
                                ? "selected"
                                : ""
                            }>이상</option>
                                            </select>
                                            ${service["테스터"]}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        `;

                    var $MACRO = "";
                    $MACRO += '<option value="">보류 매크로</option>';
                    params.setting.service["보류매크로"].forEach(function (
                        macro
                    ) {
                        $MACRO +=
                            '<option value="' +
                            macro +
                            '">' +
                            macro +
                            "</option>";
                    });
                    $HOLD_MACRO = $HOLD_MACRO.replace("{{MACRO}}", $MACRO);

                    var $PROCESSTYPE = "";

                    params.setting.service["처리구분"].forEach(function (
                        processType,
                        index
                    ) {
                        $PROCESSTYPE +=
                            '<option value="' +
                            (index + 1) +
                            '" ' +
                            (service["처리구분"] === index + 1
                                ? "selected"
                                : "") +
                            ">" +
                            processType["구분명"] +
                            "</option>";
                    });
                    $PROCESS_TYPE = $PROCESS_TYPE.replace(
                        "{{PROCESS}}",
                        $PROCESSTYPE
                    );

                    $COMMENT += $DIVIDELINE;
                    switch (service["상태"]) {
                        case SERVICE_STATUS.ACCEPT:
                            $COMMENT +=
                                $CONFIRM_TITLE +
                                $CONFIRM_EDIT +
                                $HOLD_TITLE +
                                $HOLD_MACRO +
                                $HOLD_EDIT +
                                $DIVIDELINE +
                                $BUTTON_SHARE +
                                $BUTTON_HOLD +
                                $BUTTON_PROCESS +
                                $BUTTON_SAVE +
                                $BUTTON_AFK;
                            break;
                        case SERVICE_STATUS.CONFIRM:
                            $COMMENT +=
                                $CONFIRM_TITLE +
                                $CONFIRM_EDIT +
                                $LINKEDSERVICE_TITLE +
                                $LINKEDSERVICE_READ +
                                $HOLD_TITLE +
                                $HOLD_MACRO +
                                $HOLD_EDIT +
                                $DIVIDELINE +
                                $BUTTON_SHARE +
                                $BUTTON_HOLD +
                                $BUTTON_PROCESS +
                                $BUTTON_SAVE +
                                $BUTTON_AFK;
                            break;
                        case SERVICE_STATUS.SHARE:
                            // if (service["공유자"] === params.user["인덱스"]) {
                            $COMMENT +=
                                $CONFIRM_TITLE +
                                (service["공유자"] === params.user["인덱스"] ? $CONFIRM_EDIT : $CONFIRM_READ) +
                                (isDeveloper ? $DEVLOG_TITLE + $DEVLOG_EDIT : '') +
                                $DIVIDELINE +
                                $BUTTON_PROCESS +
                                (isDeveloper ? $BUTTON_GOACCEPT : '') +
                                (service["공유자"] === params.user["인덱스"] || isDeveloper ? $BUTTON_SAVE : '');
                            // } else {
                            //     $COMMENT +=
                            //         $CONFIRM_TITLE +
                            //         $CONFIRM_READ +
                            //         $DIVIDELINE +
                            //         $BUTTON_PROCESS;
                            // }
                            break;
                        case SERVICE_STATUS.PROCESS:
                            $COMMENT +=
                                $CONFIRM_TITLE +
                                (service["확인자"] === params.user["인덱스"] ||
                                    service["처리자"] === params.user["인덱스"]
                                    ? $CONFIRM_EDIT
                                    : $CONFIRM_READ) +
                                $PROCESS_TITLE +
                                (service["처리자"] === params.user["인덱스"]
                                    ? $PROCESS_TYPE + $PROCESS_EDIT
                                    : $PROCESS_READ) +
                                $HOLD_TITLE +
                                (service["처리자"] === params.user["인덱스"]
                                    ? $HOLD_MACRO + $HOLD_EDIT
                                    : $HOLD_READ) +
                                (isDeveloper ? $DEVLOG_TITLE + $DEVLOG_EDIT : '') +
                                $DIVIDELINE +
                                $BUTTON_SHARE +
                                $BUTTON_DONE +
                                $BUTTON_DONE_FEEDBACK +
                                $BUTTON_HOLD +
                                $BUTTON_PASS +
                                $BUTTON_SAVE +
                                (service["처리자"] === params.user["인덱스"]
                                    ? $BUTTON_AFK
                                    : "");
                            $COMMENT = $COMMENT.replace(
                                /{{권한}}/gim,
                                service["처리자"] === params.user["인덱스"]
                                    ? ""
                                    : "disabled"
                            );
                            // $COMMENT = $COMMENT.replace(/{{공유권한}}/gim, (service['처리자'] === params.user['인덱스'] ? '' : 'disabled'));
                            break;
                        case SERVICE_STATUS.HOLD:
                            $COMMENT +=
                                $CONFIRM_TITLE +
                                $CONFIRM_READ +
                                $HOLD_TITLE +
                                $HOLD_READ +
                                $DIVIDELINE +
                                $BUTTON_PROCESS;
                            break;
                        case SERVICE_STATUS.DONE:
                            $COMMENT +=
                                $CONFIRM_TITLE +
                                $CONFIRM_READ +
                                $PROCESS_TITLE +
                                (service["처리자"] === params.user["인덱스"]
                                    ? $PROCESS_TYPE + $PROCESS_EDIT
                                    : $PROCESS_READ) +
                                (isDeveloper ? $DEVLOG_TITLE + $DEVLOG_EDIT : '') +
                                $DIVIDELINE +
                                $DEVSHARETABLE +
                                $DIVIDELINE +
                                $BUTTON_SAVE +
                                $BUTTON_FEEDBACK;
                            break;
                        case SERVICE_STATUS.CANCEL:
                            $COMMENT +=
                                $CONFIRM_TITLE +
                                $CONFIRM_READ +
                                $CANCEL_TITLE +
                                $CANCEL_READ;
                            break;
                        case SERVICE_STATUS.FEEDBACK:
                            $COMMENT +=
                                $CONFIRM_TITLE +
                                $CONFIRM_READ +
                                $PROCESS_TITLE +
                                (service["처리자"] === params.user["인덱스"]
                                    ? $PROCESS_TYPE + $PROCESS_EDIT
                                    : $PROCESS_READ) +
                                $DIVIDELINE +
                                $BUTTON_SAVE;
                            break;
                    }
                    return $COMMENT;
                }

                function _addServiceStatusEventListener(service) {
                    $("button.service-status").bind("click", function (event) {
                        _this.fn.UpdateServiceStatus(
                            service.as,
                            $(this).data("status"),
                            false
                        );
                    });
                    var $SERVICESAVE = $("button.service-save");
                    if ($SERVICESAVE.length) {
                        $SERVICESAVE.bind("click", function () {
                            _this.fn.UpdateService(service.as);
                        });
                    }
                    var $SERVICEAFK = $(
                        'button#service-afk[data-index="' +
                        service.as["인덱스"] +
                        '"]'
                    );
                    if ($SERVICEAFK.length) {
                        $SERVICEAFK.bind("click", function (event) {
                            _this.fn.CheckMissed(service.as, service.afk);
                        });
                    }
                    var $HOLDMACRO = $("select#hold-macro");
                    if ($HOLDMACRO.length) {
                        $HOLDMACRO
                            .selectpicker()
                            .bind("changed.bs.select", function () {
                                var hold_comment = $(this).data("target");
                                var comment = $(hold_comment).val();
                                comment += comment.length ? "\n" : "";
                                comment += "(M)" + $(this).selectpicker("val");
                                $(hold_comment).val(comment);
                            });
                    }
                    var $PROCESSTYPE = $("select#process-type");
                    if ($PROCESSTYPE.length) {
                        $PROCESSTYPE
                            .selectpicker()
                            .bind("changed.bs.select", function () {
                                var $TARGET = $("#process-example");
                                $TARGET
                                    .html(
                                        "<h5>입력사항</h5>" +
                                        params.setting.service["처리구분"][
                                            $(this).selectpicker("val") - 1
                                        ]["입력사항"].replace(
                                            /\n/gim,
                                            "<br>"
                                        ) +
                                        "<h5>예시</h5>" +
                                        params.setting.service["처리구분"][
                                            $(this).selectpicker("val") - 1
                                        ]["예시"].replace(/\n/gim, "<br>")
                                    )
                                    .removeClass("hidden");

                                service.as["처리구분"] = $(this).selectpicker(
                                    "val"
                                );
                                var comment = $($(this).data("comment"));
                                var template = params.setting.service[
                                    "처리구분"
                                ][$(this).selectpicker("val") - 1][
                                    "예시"
                                ].split("\n");
                                var startPos = 0;
                                template = (function () {
                                    var _template = [];

                                    template.forEach(function (temp) {
                                        if (temp.indexOf(":") >= 0) {
                                            var arrTemp = temp.split(":");
                                            if (
                                                arrTemp[0].trim() ===
                                                "2) 옵션 / 설정"
                                            ) {
                                                arrTemp[0] =
                                                    "2) 옵션 / 설정 :  ->  ->  ->  \n";
                                            } else if (
                                                arrTemp[0].trim() ===
                                                "3) 순서 (동작 하나하나 기술)"
                                            ) {
                                                arrTemp[0] =
                                                    "3) 순서 (동작 하나하나 기술) : \n";
                                                arrTemp[0] += "\t 1. \n";
                                                arrTemp[0] += "\t 2. \n";
                                                arrTemp[0] += "\t 3. \n";
                                            } else {
                                                arrTemp[0] =
                                                    arrTemp[0] + " : \n";
                                            }
                                            _template.push(arrTemp[0]);
                                        }
                                    });
                                    return _template;
                                })();

                                // comment.val(template.join(': \n') + ': ')
                                comment.val(template.join(""));
                                startPos = comment.val().indexOf(":") + 2;
                                exports.fn.setCaretToPos(comment[0], startPos);
                                // comment.val(params.setting.service['처리구분'][$(this).selectpicker('val') - 1]['입력사항'].replace(/\n/gim, '\n\n') + '\n')
                            });

                        if (service.as["처리구분"] == 0) {
                            $PROCESSTYPE
                                .selectpicker("val", 3)
                                .trigger("changed.bs.select");
                        }
                    }
                    var $SERVICEPASS = $("button#service-pass");
                    if ($SERVICEPASS.length) {
                        $SERVICEPASS.bind("click", function () {
                            _this.fn.PassService(service.as);
                        });
                    }
                    var $SERVICEGOACCEPT = $("button#service-go-accept");
                    if ($SERVICEGOACCEPT.length) {
                        $SERVICEGOACCEPT.bind("click", function () {
                            swal({
                                title: "A/S 상태변경",
                                html: "해당 A/S를 접수상태로 변경합니다.<br>계속하시겠습니까?",
                                type: "question",
                                showCancelButton: true,
                                confirmButtonColor: "#3085d6",
                                cancelButtonColor: "#d33"
                            }).then(function () {
                                _this.fn.UpdateServiceStatus(
                                    service.as,
                                    SERVICE_STATUS.ACCEPT,
                                    false
                                );
                            }).catch(function (error) {
                                fn.errorNotify(error);
                            });

                        });
                    }
                    var $SERVICEFEEDBACK = $("button#service-feedback");
                    if ($SERVICEFEEDBACK.length) {
                        $SERVICEFEEDBACK.bind("click", function () {
                            _this.fn.UpdateServiceStatus(
                                service.as,
                                CONSTS.SERVICE_STATUS.FEEDBACK,
                                false
                            );
                        });
                    }
                    $("table.service-dev-share-" + service.as["인덱스"])
                        .find('input[type="checkbox"]')
                        .iCheck({
                            checkboxClass: "icheckbox_flat-green",
                            radioClass: "iradio_flat-green"
                        })
                        .bind("ifChecked ifUnchecked", function (event) {
                            var target = $(event.target);
                            var index = target
                                .closest("tr")
                                .data("service-index");
                            var field = target.data("field");

                            _this.fn.UpdateDevAS(
                                index,
                                field,
                                event.type === "ifChecked"
                                    ? params.user["인덱스"]
                                    : 0
                            );
                        });

                    $("table.service-dev-share-" + service.as["인덱스"])
                        .find("select")
                        .bind("change", function (event) {
                            var data = $(this).val();
                            var index = $(this)
                                .closest("tr")
                                .data("service-index");
                            var field = $(this).data("field");

                            if (data == 1) {
                                data = params.user["인덱스"];
                            } else if (data == 2) {
                                data = params.user["인덱스"] * -1;
                            }
                            _this.fn.UpdateDevAS(index, field, data);
                        });

                    $('#comment-devlog-' + service.as['인덱스']).bind('dblclick', function (event) {
                        event.preventDefault();
                        var $THIS = $(this);
                        $THIS.val($THIS.val() +
                            `------------------------------------------------------------------
${params.user['이름']} / ${moment().format('llll')}
`
                        );
                    })
                }

                function _replys(index, replys) {
                    var $REPLYS = "";
                    $REPLYS += $DIVIDELINE;
                    $REPLYS +=
                        '<h5 class="service-reply-header">댓글 (' +
                        replys.length +
                        ")</h5>";
                    $REPLYS += "<div>";
                    $REPLYS += '    <ul class="messages">';
                    $REPLYS += "        <li>";
                    $REPLYS += '            <div class="message_wrapper">';
                    $REPLYS +=
                        '                <textarea class="form-control" id="service-reply-comment-' +
                        index +
                        '" rows="5" data-key="' +
                        index +
                        '" placeholder="댓글을 입력해주세요..."></textarea>';
                    $REPLYS +=
                        '                <button class="btn btn-success btn-sm m-t-xs service-reply-save" data-key="' +
                        index +
                        '">등록</button>';
                    $REPLYS += "            </div>";
                    $REPLYS += "        </li>";
                    $REPLYS += "    </ul>";
                    $REPLYS +=
                        '    <ul class="messages" id="messages-' + index + '">';
                    replys.forEach(function (reply) {
                        $REPLYS += "<li>";
                        $REPLYS += '    <div class="message_date">';
                        $REPLYS +=
                            '        <p class="month">' +
                            moment(reply["작성일자"]).fromNow() +
                            "</p>";
                        if (params.user["인덱스"] === reply["작성자"]) {
                            $REPLYS += '        <p class="month">';
                            $REPLYS +=
                                '            <button class="btn btn-xs btn-default reply-comment-delete" data-index="' +
                                reply["인덱스"] +
                                '" data-key="' +
                                reply["서비스키"] +
                                '"><i class="fa fa-trash"></i></button>';
                            $REPLYS += "        </p>";
                        }
                        $REPLYS += "    </div>";
                        $REPLYS += '    <div class="message_wrapper">';
                        $REPLYS +=
                            '        <h5 class="heading blue"><i class="fa fa-user-circle"></i> ' +
                            reply["작성자명"] +
                            "</h5>";
                        $REPLYS +=
                            '        <p class="url">' +
                            reply["내용"].replace(/\n/gim, "<br>") +
                            "</p>";
                        $REPLYS += "    </div>";
                        $REPLYS += "</li>";
                    });
                    $REPLYS += "    </ul>";
                    $REPLYS += "</div>";
                    return $REPLYS;
                }

                function _addReplyEventListener(service) {
                    $(".service-reply-save").bind("click", function (event) {
                        _this.fn.SaveServiceReply($(this).data("key"));
                    });

                    $("ul#messages-" + service.as["인덱스"]).bind(
                        "click",
                        function (event) {
                            // console.log(event);
                            var $TARGET = $(event.target);
                            if (
                                $TARGET[0].tagName.toUpperCase() === "I" &&
                                $TARGET.hasClass("fa-trash")
                            ) {
                                $TARGET = $TARGET.parent();
                            }

                            if ($TARGET[0].tagName.toUpperCase() === "BUTTON") {
                                _this.fn.DeleteServiceReply(
                                    $TARGET.data("index")
                                );
                            }
                        }
                    );
                }

                function _hospinfo(data) {
                    var keys = [];
                    var $HOSPINFO = '<div class="hospinfo-container">';

                    if (params.user['부서'] !== '개발실' && params.user['인덱스'] != 149) {

                        $HOSPINFO += `
                        <h5 class="green">
                            <i class="fa fa-phone"></i> AS 처리 프로세스
                            <a class="btn btn-link btn-xs pull-right expander" data-toggle="collapse" href="#_script${data.as['인덱스']}" aria-expanded="false" aria-controls="_script${data.as['인덱스']}"><i class="fa fa-chevron-down"></i></a>
                        </h5> 
                        <ol class="user_data collapse in" id="_script${data.as['인덱스']}" aria-expanded="true">
                            <li class="m-b-sm">
                                접수된 A/S 확인<br>
                                “안녕하세요, 네오소프트뱅크입니다. <span class="red">A/S 남겨주셔서 연락 드렸습니다.</span>”                            
                            </li>
                            <li class="m-b-sm">
                                추가정보 및 필요한 내용 수집 <br>
                                “000건으로 <span class="red">원격으로</span> 문의주신 내용 <span class="red">순서대로</span> 설명 부탁 드립니다.”                      
                                <ol>
                                    <li>
                                        병원에서 <span class="font underline">여러 가지 문의를 한꺼번에 할 때</span><br>
                                        “선생님, <span class="red">하나씩</span> 해결해 나가도록 하겠습니다. 우선적으로 처리되었으면 하는 내용이 무엇인가요?”                        
                                    </li>
                                </ol>
                            </li>
                            <li class="m-b-sm">
                                A/S 접수한 내용에 대한 추가적인 정보 확보, <span class="font underline">필요 시 이미지 캡쳐</span><br>
                                “설명해주신 내용 확인했습니다.” Or “원활한 전달을 위해 <span class="red">화면 캡쳐</span> 좀 하겠습니다.”                         
                            </li>
                            <li class="m-b-sm">
                                처리 가능한 A/S는 처리<br>
                                “A/S 처리 완료되었습니다. 감사합니다.”                   
                            </li>
                            <li class="m-b-sm">
                                처리 불가능한 A/S는 개발실에 공유처리<br>
                                “<span class="red">개발실에서 확인이 필요한 건</span>으로 파악됩니다. <br>
                                개발실에 내용전달, 피드백 받는 대로 연락 드리겠습니다.”                    
                            </li>
                            <li>
                                공유 처리해서 완료된 건들 피드백<br>
                                “안녕하세요, 네오소프트뱅크입니다. <span class="red">000건 개발실에서 A/S 완료되어</span> 연락 드렸습니다.”                      
                            </li>
                        </ol>
                        `
                    }
                    // AS helper
                    $HOSPINFO += `
                    <h5 class="green">
                        <i class="fa fa-magic"></i> AS Helper
                        <a class="btn btn-link btn-xs pull-right expander" data-toggle="collapse" href="#_helper${data.as['인덱스']}" aria-expanded="false" aria-controls="_helper${data.as['인덱스']}"><i class="fa fa-chevron-down"></i></a>
                    </h5>                   
                    <ul class="list-unstyled user_data collapse" id="_helper${data.as['인덱스']}" aria-expanded="false">
                        <li>
                            <div class="x_panel p-w-none no-border">
                                <div class="x_content p-w-none">
                                    <div class="helper-options form-inline text-right">
                                        <div class="input-group input-group-sm">
                                            <input type="text" class="form-control helper-options-search" placeholder="검색">
                                            <!--div class="input-group-btn">
                                                <button type="button" class="btn btn-default service-helper-load">검색</button>
                                            </div-->
                                        </div>
                                    </div>
                                    <table class="table table-bordered jambo_table small m-b-none">
                                        <thead>
                                            <tr>
                                                <th>제목</th>
                                                <th class="text-center">메뉴얼</th>
                                                <th class="text-center">설치파일</th>
                                            </tr>
                                        </thead>
                                        <tbody class="service-helper-list"></tbody>
                                    </table>
                                    <ul class="helper-pagination pagination pagination-sm m-t-xs"></ul>
                                </div>
                            </div>
                        </li>
                    </ul>
                    `;

                    $HOSPINFO += '<h5 class="green">';
                    $HOSPINFO += '  <i class="fa fa-search"></i> AS Finder';
                    // $HOSPINFO +=
                    //     '  <a class="btn btn-link btn-xs pull-right expander" data-toggle="collapse" href="#_finder" aria-expanded="false" aria-controls="_finder"><i class="fa fa-chevron-down"></i></a>';
                    // $HOSPINFO +=
                    //     '<a class="brn brn-link btn-xs pull-right as-finder-quick-search" href="#"><i class="fa fa-search"></i></a>';
                    $HOSPINFO += "</h5>";
                    $HOSPINFO +=
                        '<div class="panel list-group care-list-group" name="_finder" aria-expanded="true" style="background: inherit;"> ';
                    $HOSPINFO += "</div>";

                    $HOSPINFO += $DIVIDELINE;
                    $HOSPINFO += '<div class="checkbox">';
                    $HOSPINFO += '    <label class="p-l-none">';
                    $HOSPINFO +=
                        '         <input type="checkbox" name="show-not-important" class="flat" /> 전체보기';
                    $HOSPINFO += "    </label>";
                    $HOSPINFO += "</div>";

                    //병원정보
                    keys = Object.keys(data.info);
                    if (keys.length) {
                        // $HOSPINFO += '  <h5><i class="fa fa-hospital-o"></i> 병원정보</h5>';
                        $HOSPINFO += '<h5 class="green">';
                        $HOSPINFO +=
                            '  <i class="fa fa-hospital-o"></i> 병원정보';
                        $HOSPINFO +=
                            '  <a class="btn btn-link btn-xs pull-right expander" data-toggle="collapse" href="#_hospinfo" aria-expanded="true" aria-controls="_hospinfo"><i class="fa fa-chevron-up"></i></a>';
                        $HOSPINFO += "</h5>";
                        $HOSPINFO +=
                            '<ul class="list-unstyled user_data collapse in" id="_hospinfo" aria-expanded="true">';
                        keys.forEach(function (key) {
                            if (key.indexOf("ID") < 0) {
                                $HOSPINFO +=
                                    '<li class="' +
                                    (key.match(
                                        /기관명칭|프로그램|전화번호|특이사항|실가동일/gim
                                    )
                                        ? "red font-bold"
                                        : "not-important hidden") +
                                    '"><b>' +
                                    key +
                                    ":</b> " +
                                    data.info[key] +
                                    "</li>";
                            }
                        });
                        // $HOSPINFO +=
                        //     '<li class="red font-bold"><b>실가동일:</b> ' +
                        //     data.backup['실가동일'] +
                        //     '</li>'
                        $HOSPINFO += "</ul>";
                    }

                    // 미수금
                    if (data.misu) {
                        $HOSPINFO += $DIVIDELINE;
                        $HOSPINFO += '<h5 class="red font-bold">';
                        $HOSPINFO +=
                            ' <i class="fa fa-credit-card"></i> 미수금';
                        $HOSPINFO +=
                            '  <a class="btn btn-link btn-xs pull-right expander" data-toggle="collapse" href="#_misu" aria-expanded="true" aria-controls="_extra"><i class="fa fa-chevron-up"></i></a>';
                        $HOSPINFO +=
                            '  <a class="brn brn-link btn-xs pull-right" href="/customer?id=' +
                            data.info.ID +
                            "&hospnum=" +
                            data.info["기관기호"] +
                            '"><i class="fa fa-search"></i></a>';
                        $HOSPINFO += "</h5>";
                        $HOSPINFO +=
                            ' <div id="_misu" class="collapse in" aria-expanded="true">';
                        $HOSPINFO +=
                            ' <table class="table table-bordered table-striped jambo_table small"> ';
                        $HOSPINFO += "     <thead>";
                        $HOSPINFO += "         <tr>";
                        $HOSPINFO += "             <th>일자</th>";
                        $HOSPINFO += "             <th>미수총액</th>";
                        $HOSPINFO += "             <th>입금액</th>";
                        $HOSPINFO += "             <th>총금액</th>";
                        $HOSPINFO += "             <th>구분</th>";
                        $HOSPINFO += "             <th>명칭</th>";
                        // $HOSPINFO += '             <th>수량</th>'
                        $HOSPINFO += "             <th>단가</th>";
                        // $HOSPINFO += '             <th>비고</th>'
                        $HOSPINFO += "         </tr>";
                        $HOSPINFO += "     </thead>";
                        $HOSPINFO += '     <tbody class="list-misu">';
                        data.misu.forEach(function (misu) {
                            $HOSPINFO += '<TR class="animate fadeIn">';
                            $HOSPINFO += "    <TD>" + misu["날짜"] + "</TD>";
                            $HOSPINFO +=
                                '    <TD class="red">' +
                                misu["미수총액"] +
                                "</TD>";
                            $HOSPINFO +=
                                '    <TD class="blue">' +
                                misu["입금액"] +
                                "</TD>";
                            $HOSPINFO += "    <TD>" + misu["총금액"] + "</TD>";
                            $HOSPINFO += "    <TD>" + misu["구분명"] + "</TD>";
                            $HOSPINFO += "    <TD>" + misu["명칭"] + "</TD>";
                            // $HOSPINFO += '    <TD>' + misu['수량'] + '</TD>';
                            $HOSPINFO += "    <TD>" + misu["단가"] + "</TD>";
                            // $HOSPINFO += '    <TD>' + misu['메모'] + '</TD>';
                            $HOSPINFO += "</TR>";
                        });
                        $HOSPINFO += "     </tbody>";
                        $HOSPINFO += " </table>";
                        $HOSPINFO += "</div>";
                    } else {
                        $HOSPINFO += $DIVIDELINE;
                        $HOSPINFO += '<h5 class="red font-bold">';
                        $HOSPINFO +=
                            ' <i class="fa fa-credit-card"></i> 미수금';
                        $HOSPINFO +=
                            '  <a class="btn btn-link btn-xs pull-right expander" data-toggle="collapse" href="#_misu" aria-expanded="true" aria-controls="_extra"><i class="fa fa-chevron-up"></i></a>';
                        $HOSPINFO +=
                            '  <a class="btn btn-link btn-xs pull-right" href="/customer?id=' +
                            data.info.ID +
                            "&hospnum=" +
                            data.info["기관기호"] +
                            '"><i class="fa fa-external-link"></i></a>';
                        $HOSPINFO +=
                            '  <button class="btn btn-link btn-xs pull-right service-misu-load" type="button" data-id="' +
                            data.info.ID +
                            '"><i class="fa fa-search"></i></a>';
                        $HOSPINFO += "</h5>";
                        $HOSPINFO +=
                            '<div id="_misu" class="collapse in" aria-expanded="true">';
                        $HOSPINFO +=
                            ' <table class="table table-bordered table-striped jambo_table small"> ';
                        $HOSPINFO += "     <thead>";
                        $HOSPINFO += "         <tr>";
                        $HOSPINFO += "             <th>일자</th>";
                        $HOSPINFO += "             <th>미수총액</th>";
                        $HOSPINFO += "             <th>입금액</th>";
                        $HOSPINFO += "             <th>총금액</th>";
                        $HOSPINFO += "             <th>구분</th>";
                        $HOSPINFO += "             <th>명칭</th>";
                        // $HOSPINFO += '             <th>수량</th>'
                        $HOSPINFO += "             <th>단가</th>";
                        // $HOSPINFO += '             <th>비고</th>'
                        $HOSPINFO += "         </tr>";
                        $HOSPINFO += "     </thead>";
                        $HOSPINFO +=
                            '     <tbody class="list-misu-' +
                            data.info.ID +
                            '">';
                        $HOSPINFO += "     </tbody>";
                        $HOSPINFO += " </table>";
                        $HOSPINFO += "</div>";
                    }

                    //부가서비스
                    if (data.extra) {
                        $HOSPINFO += $DIVIDELINE;
                        $HOSPINFO += '<h5 class="green not-important hidden">';
                        $HOSPINFO += '  <i class="fa fa-tags"></i> 부가서비스';
                        $HOSPINFO +=
                            '  <a class="btn btn-link btn-xs pull-right expander" data-toggle="collapse" href="#_extra" aria-expanded="true" aria-controls="_extra"><i class="fa fa-chevron-up"></i></a>';
                        $HOSPINFO += "</h5>";
                        $HOSPINFO +=
                            '<ul class="list-unstyled user_data collapse in not-important hidden" id="_extra" aria-expanded="true">';
                        $HOSPINFO +='<li>'
                        data.extra.forEach(function (extra) {
                            $HOSPINFO +=
                                '  <button type="button" class="btn btn-default btn-xs">' +
                                extra["부가서비스"] +
                                "</button>";
                        });
                        $HOSPINFO += "</li>";

                        if(data.temp['Pacs'] != ""){
                            var strPacs = ""
                            switch (parseInt(data.temp['Pacs'])) {
                                case 1: strPacs = "Infinity Pacs" 
                                    break;
                                case 2: strPacs = "PacsPlus" 
                                    break;
                                case 3: strPacs = "PPCLinic" 
                                    break;
                                case 4: strPacs = "iview" 
                                    break;
                                case 5: strPacs = "의료영상기술" 
                                    break;
                                case 6: strPacs = "제노레이" 
                                    break;
                                case 7: strPacs = "후지 GE PACS" 
                                    break;
                                case 8: strPacs = "태영" 
                                    break;
                                case 9: strPacs = "Infinity Pacs" 
                                    break;
                                case 10: strPacs = "PPClinic(신버전)" 
                                    break;
                                case 11: strPacs = "iview" 
                                    break;
                                case 12: strPacs = "메디엔" 
                                    break;
                                case 13: strPacs = "Infinity Pacs(신버전)" 
                                    break;
                                case 14: strPacs = "테크하임" 
                                    break;
                                case 15: strPacs = "메디엔(신버전)" 
                                    break;
                                case 16: strPacs = "UBCare" 
                                    break;
                                case 21: strPacs = "테크하임(신버전)" 
                                    break;
                                case 23: strPacs = "CLIT" 
                                    break;
                                case 25: strPacs = "제로팍스" 
                                    break;
                                case 26: strPacs = "후지 PACS" 
                                    break;
                                case 27: strPacs = "GE 팍스" 
                                    break;
                                case 28: strPacs = "Medical Standard KMI" 
                                    break;
                                case 24: strPacs = "DenteeView(M&P)" 
                                    break;
                                case 29: strPacs = "HIPacs" 
                                    break;
                                case 30: strPacs = "제타팍스" 
                                    break;
                                case 31: strPacs = "PacsPlus(신버전[HISIF])" 
                                    break;
                                case 18: strPacs = "Infinity Pacs(탄방엠블)" 
                                    break;
                                case 32: strPacs = "엠디팍스" 
                                    break;
                            }
                            $HOSPINFO +='<li>'
                            $HOSPINFO +=
                            '  <button type="button" class="btn btn-default outline-info btn-xs">' +
                            strPacs +
                            "</button>";
                            $HOSPINFO += "</li>";
                        }

                        if(data.temp['수탁검사정보'] != ""){
                            $HOSPINFO +='<li>'
                            $HOSPINFO +=
                            '  <button type="button" class="btn btn-default outline-warning btn-xs">' +
                            data.temp['수탁검사정보'] +
                            "</button>";
                            $HOSPINFO += "</li>";
                        }
                        $HOSPINFO += "</ul>";
                    }

                    //원격정보
                    keys = Object.keys(data.uniq).filter(function (key) {
                        return key.match(
                            /원격서버|원격아이디|원격비번|스탠바이이름|스탠바이비번/gim
                        );
                    });
                    if (keys.length) {
                        $HOSPINFO += $DIVIDELINE;
                        $HOSPINFO += '<h5 class="red font-bold">';
                        $HOSPINFO +=
                            '  <i class="fa fa-desktop"></i> 씨트롤 정보';
                        $HOSPINFO +=
                            '  <a class="btn btn-link btn-xs pull-right expander" data-toggle="collapse" href="#_seetrol" aria-expanded="true" aria-controls="_seetrol"><i class="fa fa-chevron-up"></i></a>';
                        $HOSPINFO += "</h5>";
                        $HOSPINFO +=
                            '<ul class="list-unstyled user_data collapse in" id="_seetrol" aria-expanded="true">';

                        keys.forEach(function (key) {
                            $HOSPINFO +=
                                '<li class="red font-bold"><b><i class="fa fa-circle"></i> ' +
                                key +
                                ":</b> " +
                                data.uniq[key] +
                                "</li>";
                        });
                        $HOSPINFO += "</ul>";
                    }

                    //특이사항
                    keys = Object.keys(data.uniq).filter(function (key) {
                        return !key.match(
                            /원격서버|원격아이디|원격비번|스탠바이이름|스탠바이비번/gim
                        );
                    });
                    if (keys.length) {
                        $HOSPINFO += $DIVIDELINE;
                        $HOSPINFO += '<h5 class="green">';
                        $HOSPINFO +=
                            '  <i class="fa fa-certificate"></i> 특이사항';
                        $HOSPINFO +=
                            '  <a class="btn btn-link btn-xs pull-right expander" data-toggle="collapse" href="#_certificate" aria-expanded="true" aria-controls="_certificate"><i class="fa fa-chevron-up"></i></a>';
                        $HOSPINFO += "</h5>";
                        $HOSPINFO +=
                            '<ul class="list-unstyled user_data collapse in" id="_certificate" aria-expanded="true">';
                        keys.forEach(function (key) {
                            if (key === "메모" || key === "메모2") {
                                $HOSPINFO +=
                                    '<li class="font-bold bg-danger p-xs" style="color:#000;">  <b>' +
                                    key +
                                    ":</b><br>";
                                if (data.uniq[key] && data.uniq[key].length) {
                                    $HOSPINFO +=
                                        "  " +
                                        data.uniq[key].replace(
                                            /\n/gim,
                                            "<br/>"
                                        );
                                }
                                $HOSPINFO += "<li>";
                                // $HOSPINFO += '  <pre class="unstyled-pre">' + data.uniq[key] + '</pre>';
                                // $HOSPINFO += exports.fn.urlify(data.uniq[key]);
                            } else if (key === "병원유형") {
                                $HOSPINFO +=
                                    '<li class="not-important hidden"><b>' +
                                    key +
                                    ':</b> <b class="{{병원유형}}">' +
                                    data.uniq[key] +
                                    "</b></li>";

                                if (data.uniq[key] === "우수") {
                                    $HOSPINFO = $HOSPINFO.replace(
                                        "{{병원유형}}",
                                        "blue"
                                    );
                                } else if (data.uniq[key] === "주의") {
                                    $HOSPINFO = $HOSPINFO.replace(
                                        "{{병원유형}}",
                                        "red"
                                    );
                                } else {
                                    $HOSPINFO = $HOSPINFO.replace(
                                        "{{병원유형}}",
                                        ""
                                    );
                                }
                            } else if (key !== "수정자" && key !== "수정일자") {
                                // $HOSPINFO += '<b>' + key + ':</b> ' + data.uniq[key] + '<br/>';
                                $HOSPINFO +=
                                    '<li class="not-important hidden"><b>' +
                                    key +
                                    ":</b> " +
                                    data.uniq[key] +
                                    "</li>";
                            }
                        });
                        $HOSPINFO +=
                            "<li><b>수정자:</b> " +
                            data.uniq["수정자"] +
                            " <b>수정일:</b> " +
                            data.uniq["수정일자"] +
                            "</li>";
                        $HOSPINFO += "</ul>";
                    }

                    //백업현황
                    keys = Object.keys(data.backup);
                    if (keys.length) {
                        $HOSPINFO += $DIVIDELINE;
                        $HOSPINFO += '<h5 class="green not-important hidden">';
                        $HOSPINFO +=
                            '  <i class="fa fa-database"></i> 백업정보';
                        $HOSPINFO +=
                            '  <a class="btn btn-link btn-xs pull-right expander" data-toggle="collapse" href="#_database" aria-expanded="true" aria-controls="_database"><i class="fa fa-chevron-up"></i></a>';
                        $HOSPINFO += "</h5>";
                        $HOSPINFO +=
                            '<ul class="list-unstyled user_data collapse in not-important hidden" id="_database" aria-expanded="true">';

                        data.backup["수가"] = Math.max(
                            data.backup["백업수가"],
                            data.backup["센스수가"],
                            data.backup["메디수가"]
                        ).toString();
                        data.backup["수가"] =
                            data.backup["수가"] == 0 ? "" : data.backup["수가"];
                        data.backup["약가"] = Math.max(
                            data.backup["백업약가"],
                            data.backup["센스약가"],
                            data.backup["메디약가"]
                        ).toString();
                        data.backup["약가"] =
                            data.backup["약가"] == 0 ? "" : data.backup["약가"];
                        data.backup["재료"] = Math.max(
                            data.backup["백업재료"],
                            data.backup["센스재료"],
                            data.backup["메디재료"]
                        ).toString();
                        data.backup["재료"] =
                            data.backup["재료"] == 0 ? "" : data.backup["재료"];

                        Object.keys(data.backup).forEach(function (key) {
                            switch (key) {
                                case "백업일시":
                                    data.backup[
                                        key
                                    ] = _this.fn.SetFeedBackLabel(
                                        data.backup[key],
                                        function (a) {
                                            return (
                                                a <
                                                moment()
                                                    .subtract(1, "days")
                                                    .format("YYYY-MM-DD")
                                            );
                                        }
                                    );
                                    break;
                                case "로그축소":
                                    data.backup[
                                        key
                                    ] = _this.fn.SetFeedBackLabel(
                                        data.backup[key],
                                        function (a) {
                                            return a !== "사용";
                                        }
                                    );
                                    break;
                                case "정품여부":
                                    data.backup[key] =
                                        data.backup[key] === 1
                                            ? "Standard"
                                            : "Express";
                                    data.backup[
                                        key
                                    ] = _this.fn.SetFeedBackLabel(
                                        data.backup[key],
                                        function (a) {
                                            return a !== "Standard";
                                        }
                                    );
                                    break;
                                case "수가":
                                case "약가":
                                case "재료":
                                    data.backup[
                                        key
                                    ] = _this.fn.SetFeedBackLabel(
                                        data.backup[key],
                                        function (a, b) {
                                            a = a || "";
                                            b = b || "";
                                            a = a.replace(/.|-/gim, "");
                                            b = b.replace(/.|-/gim, "");
                                            return a !== b;
                                        },
                                        data.backup["M" + key]
                                    );
                                    break;
                                case "백업경로용량":
                                    data.backup[
                                        key
                                    ] = _this.fn.SetFeedBackLabel(
                                        data.backup[key],
                                        function (a) {
                                            return a < 100;
                                        }
                                    );
                                    data.backup[key] = data.backup[key].replace(
                                        '<i class="fa"',
                                        ' GB <i class="fa'
                                    );
                                    break;
                            }
                            if (
                                !key.match(
                                    /S수가|S약가|S재료|M수가|M약가|M재료|백업수가|백업약가|백업재료|센스수가|센스약가|센스재료|메디수가|메디약가|메디재료/gim
                                ) &&
                                data.backup[key]
                            ) {
                                $HOSPINFO +=
                                    "<li><b>" +
                                    key +
                                    ":</b> " +
                                    data.backup[key] +
                                    "</li>";
                            }
                        });
                    }

                    $HOSPINFO += "</div>";
                    return $HOSPINFO;
                }

                function _hospinfoEventListener() {
                    $('[name="show-not-important"]')
                        .iCheck({
                            checkboxClass: "icheckbox_flat-red",
                            radioClass: "iradio_flat-red"
                        })
                        .bind("ifChanged", function (event) {
                            $(".not-important").toggleClass("hidden");
                        });

                    $(".service-misu-load").bind("click", function (event) {
                        event.preventDefault();
                        _this.fn.LoadMisu($(this).data("id"));
                    });

                    $(".as-finder-quick-search").bind("click", function (event) {
                        event.preventDefault();

                        _this.fn.LoadsimilarList();
                    });
                }
            },
            LoadMisu: function (id) {
                axios
                    .get(API.CUSTOMER.MISU, {
                        params: {
                            id: id,
                            startDate: moment()
                                .subtract(2, "months")
                                .startOf("month")
                                .format("YYYY-MM-DD"), //moment($DATEPICKER_MISU.data('value')).startOf('month').format('YYYY-MM-DD'),
                            endDate: moment()
                                .endOf("month")
                                .format("YYYY-MM-DD")
                        }
                    })
                    .then(function (misu) {
                        _this.data.Service.misu = misu.data;
                        _this.fn.RenderMisu(id);
                    })
                    .catch(function (error) {
                        console.log(error);
                        fn.errorNotify(error);
                    });
            },
            RenderMisu: function (id) {
                var $TARGET = $("tbody.list-misu-" + id);
                var $HOSPINFO = "";
                $TARGET.empty();

                _this.data.Service.misu.forEach(function (misu) {
                    $HOSPINFO += '<TR class="animate fadeIn">';
                    $HOSPINFO += "    <TD>" + misu["날짜"] + "</TD>";
                    $HOSPINFO +=
                        '    <TD class="red">' + misu["미수총액"] + "</TD>";
                    $HOSPINFO +=
                        '    <TD class="blue">' + misu["입금액"] + "</TD>";
                    $HOSPINFO += "    <TD>" + misu["총금액"] + "</TD>";
                    $HOSPINFO += "    <TD>" + misu["구분명"] + "</TD>";
                    $HOSPINFO += "    <TD>" + misu["명칭"] + "</TD>";
                    // $HOSPINFO += '    <TD>' + misu['수량'] + '</TD>';
                    $HOSPINFO += "    <TD>" + misu["단가"] + "</TD>";
                    // $HOSPINFO += '    <TD>' + misu['메모'] + '</TD>';
                    $HOSPINFO += "</TR>";
                });
                $TARGET.append($HOSPINFO);
            },
            RenderNewReply: function (reply) {
                try {
                    var $REPLYBADGE = $("#header-" + reply[0]["서비스키"]).find(
                        ".service-reply"
                    );
                    var $REPLYHEADER = $("#item-" + reply[0]["서비스키"]).find(
                        ".service-reply-header"
                    );
                    var $MESSAGELIST = $("#messages-" + reply[0]["서비스키"]);
                    var $REPLY = "";
                    $REPLYBADGE
                        .empty()
                        .append(
                            '<i class="fa fa-comment fa-2x red"></i> ' +
                            reply.length
                        );
                    $REPLYHEADER.text = "댓글 (" + reply.length + ")";
                    $REPLY += "<li>";
                    $REPLY += '    <div class="message_date">';
                    $REPLY +=
                        '        <p class="month">' +
                        moment(reply[0]["작성일자"]).fromNow() +
                        "</p>";
                    if (params.user["인덱스"] === reply[0]["작성자"]) {
                        $REPLY += '        <p class="month">';
                        $REPLY +=
                            '            <button class="btn btn-xs btn-default reply-comment-delete" data-index="' +
                            reply[0]["인덱스"] +
                            '" data-key="' +
                            reply[0]["서비스키"] +
                            '"><i class="fa fa-trash"></i></button>';
                        $REPLY += "        </p>";
                    }
                    $REPLY += "    </div>";
                    $REPLY += '    <div class="message_wrapper">';
                    $REPLY +=
                        '        <h5 class="heading blue"><i class="fa fa-user-circle"></i> ' +
                        reply[0]["작성자명"] +
                        "</h5>";
                    $REPLY +=
                        '        <p class="url">' +
                        exports.fn.urlify(reply[0]["내용"]) +
                        "</p>";
                    $REPLY += "    </div>";
                    $REPLY += "</li>";
                    $MESSAGELIST.append($REPLY);
                    $("html, body").animate(
                        {
                            scrollTop: $MESSAGELIST
                                .find("li:last-child")
                                .offset().top
                        },
                        "slow"
                    );
                } catch (error) {
                    console.log(error);
                }
            },
            SetFeedBackLabel: function (item, compare, to) {
                if (compare(item, to)) {
                    item += ' <i class="fa fa-items-circle"></i>';
                    item = '<span class="red">' + item + "</span>";
                } else {
                    item += ' <i class="fa fa-check-circle"></i>';
                    item = '<span class="blue">' + item + "</span>";
                }
                return item;
            },
            saveTag: function (index, tags) {
                axios
                    .put(API.SERVICE.TAG, {
                        index,
                        tags
                    })
                    .then(function (result) { })
                    .catch(function (error) { });
            },
            receiveMessage: function (event) {
                console.log(event);
                var data = event.data;
                // $('#comment-process-' + data['인덱스']).val(data['처리내용'])
                // $('#hold-process-' + data['인덱스']).val(data['보류내용'])

                if (!data['처리구분']) return false;

                _this.data.Service.as["처리구분"] = data["처리구분"];
                _this.data.Service.as["실행메뉴"] = data["실행메뉴"];
                _this.data.Service.as["세부화면"] = data["세부화면"];
                _this.data.Service.as["확인내용"] = data["확인내용"];
                _this.data.Service.as["처리내용"] = data["처리내용"];
                _this.data.Service.as["보류내용"] = data["보류내용"];
                _this.fn.UpdateServiceStatus(
                    _this.data.Service.as,
                    CONSTS.SERVICE_STATUS.PROCESS,
                    true
                );
            },
            SortList: function () {
                if (!_this.options.sort) {
                    _this.data.Services = _this.data.oServices.slice(0);
                } else {
                    var field = (function () {
                        switch (_this.options.status) {
                            case CONSTS.SERVICE_STATUS.ACCEPT:
                                return "접수일자";
                            case CONSTS.SERVICE_STATUS.SHARE:
                                return "공유일자";
                            case CONSTS.SERVICE_STATUS.PROCESS:
                                return "처리일자";
                            case CONSTS.SERVICE_STATUS.DONE:
                                return "완료일자";
                            case CONSTS.SERVICE_STATUS.HOLD:
                                return "보류일자";
                            case CONSTS.SERVICE_STATUS.FEEDBACK:
                                return "피드백일자";
                        }
                    })();

                    _this.data.Services = _this.data.oServices.slice(0);
                    _this.data.Services = _this.data.Services.sort(function (
                        a,
                        b
                    ) {
                        return b[field] > a[field]
                            ? 1
                            : b[field] < a[field]
                                ? -1
                                : 0;
                    });

                    // _this.data.Services = _this.data.oServices.sort(function (a, b) {
                    //     return (b[field] > a[field]) ? 1 : ((b[field] < a[field]) ? -1 : 0);
                    // }).slice(0);
                }

                // if (params.user['인덱스'] === 149 && _this.options.status == CONSTS.SERVICE_STATUS.ACCEPT) {
                //     _this.data.Services = _this.data.Services.filter(function (b) { return b['기관코드'] == '34320270' || b['기관코드'] == '34202978' })
                // }

                return _this.fn.RenderList();
            },
            RenderMenu: function ($target, data) {
                var menus = data.menus;
                var $MENUS = "";

                if (
                    data["상태"] == CONSTS.SERVICE_STATUS.DONE ||
                    data["상태"] == CONSTS.SERVICE_STATUS.FEEDBACK
                ) {
                } else {
                    $MENUS += (function () {
                        var _menus = "";

                        menus.forEach(function (menu) {
                            // if (!menu['실행메뉴']) debugger
                            _menus +=
                                '<label class="btn btn-xs ' +
                                (data.as["실행메뉴"] === menu["실행메뉴"]
                                    ? "btn-primary"
                                    : "btn-default") +
                                '">';
                            _menus +=
                                '   <input type="radio" name="service-menu" value="' +
                                menu["실행메뉴"] +
                                '" ' +
                                (data.as["실행메뉴"] === menu["실행메뉴"]
                                    ? 'checked="true"'
                                    : "") +
                                "/>";
                            _menus +=
                                "   " +
                                menu["실행메뉴"] +
                                "(" +
                                menu["채택수"] +
                                ")";
                            _menus += "</label>";
                        });
                        return _menus;
                    })();

                    $target.find(".service-menu-group").append($MENUS);

                    $target
                        .find('[name="service-menu"]')
                        .bind("change", function (event) {
                            var $THIS = $(this);
                            var selectMenu = $THIS.val();
                            if (
                                _this.data.Service.as["실행메뉴"] !== selectMenu
                            ) {
                                _this.data.Service.as["실행메뉴"] = selectMenu;
                                _this.data.Service.as["세부화면"] = "";

                                $THIS
                                    .parent()
                                    .addClass("btn-primary")
                                    .removeClass("btn-default")
                                    .siblings()
                                    .removeClass("btn-primary")
                                    .addClass("btn-default");

                                $target.find(".service-button-group").empty();
                                _this.fn
                                    .LoadCategorys(
                                        _this.data.Service.as["실행파일"],
                                        _this.data.Service.as["실행메뉴"]
                                    )
                                    .then(function (btns) {
                                        _this.data.Service.btns = btns;
                                        _this.fn.RenderMenuButton(
                                            $target,
                                            _this.data.Service
                                        );
                                    });
                            }
                        });
                }
            },
            RenderMenuButton: function ($target, data) {
                var btns = data.btns;
                var $BUTTONS = "";
                // $BUTTONS +=
                ("");
                $BUTTONS += (function () {
                    var _btns = "";

                    btns.forEach(function (btn) {
                        _btns +=
                            '<label class="btn btn-xs ' +
                            (data.as["세부화면"] === btn["세부화면"]
                                ? "btn-primary"
                                : "btn-default") +
                            '">';
                        _btns +=
                            '   <input type="radio" name="service-button" value="' +
                            btn["세부화면"] +
                            '" ' +
                            (data.as["세부화면"] === btn["세부화면"]
                                ? 'checked="true"'
                                : "") +
                            "/>";
                        _btns +=
                            "   " + btn["세부화면"] + "(" + btn["채택수"] + ")";
                        _btns += "</label>";
                    });
                    return _btns;
                })();
                // $BUTTONS += '</div>'
                $target.find(".service-button-group").append($BUTTONS);
                $target
                    .find('[name="service-button"]')
                    .bind("change", function (event) {
                        var $THIS = $(this);
                        var selectButton = $THIS.val();
                        if (
                            _this.data.Service.as["세부화면"] !== selectButton
                        ) {
                            _this.data.Service.as["세부화면"] = selectButton;

                            $THIS
                                .parent()
                                .addClass("btn-primary")
                                .removeClass("btn-default")
                                .siblings()
                                .removeClass("btn-primary")
                                .addClass("btn-default");

                            // $target.find('.service-button-group').remove()
                            // _this.fn.LoadCategorys()
                            //     .then(function (btns) {
                            //         _this.data.Service.btns = btns
                            //         _this.fn.RenderMenuButton($target, _this.data.Service)
                            //     })
                            return _this.fn.LoadsimilarList();
                        }
                    });
            },
            LoadCategorys: function (exe, menu, program, date) {
                return new Promise(function (resolve, reject) {

                    if (_this.data.Service.as !== null) {
                        program = _this.data.Service.as['프로그램'];
                    }

                    if (date !== null) {
                        date = {
                            start: moment()
                                .subtract(3, "month")
                                .startOf("month")
                                .format("YYYY-MM-DD"),
                            end: moment().format("YYYY-MM-DD")
                        }
                    }

                    var _params = {
                        date: date,
                        program: program, //_this.data.Service.as["프로그램"], // EMR(_this.data.Service.as['프로그램']).name, //_this.data.Service.info['프로그램'],
                        exe: exe, //_this.data.Service.as['실행파일'],
                        menu: menu //_this.data.Service.as['실행메뉴']
                    };
                    var apiUrl =
                        menu && menu.length
                            ? API.STATIC.FINDER.BUTTON
                            : API.STATIC.FINDER.MENU;

                    axios
                        .get(apiUrl, {
                            params: _params
                        })
                        .then(function (result) {
                            resolve(result.data);
                        })
                        .catch(function (error) {
                            fn.errorNotify(error);
                            reject(error);
                        });
                });
            },
            LoadsimilarList: function () {
                // ${params.index ? 'AND N.인덱스 <> ' + params.index : ''}
                //                 AND N.실행파일 = '${params.exe}'
                //                 ${params.mainCategory !== '' ? "AND ISNULL(N.실행메뉴, '') = '" + params.mainCategory + "'" : ""}
                //                 ${params.subCategory !== '' ? "AND ISNULL(N.세부화면, '') = '" + params.subCategory + "'" : ""}
                //                 ${params.program ? "AND 프로그램 = " + params.program : ""}
                var _service = _this.data.Service.as;
                axios
                    .get(API.STATIC.FINDER.LIST, {
                        params: {
                            program: _service["프로그램"],
                            exe: _service["실행파일"],
                            menu: _service["실행메뉴"],
                            button: _service["세부화면"],
                            index: _service["인덱스"],
                            date: {
                                start: moment()
                                    .subtract(3, "month")
                                    .startOf("month")
                                    .format("YYYY-MM-DD"),
                                end: moment().format("YYYY-MM-DD")
                            }
                        }
                    })
                    .then(function (result) {
                        _this.data.Service.similarity = result.data;
                        _this.fn.RenderSimilarList();
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                    });
            },
            RenderSimilarList: function () {
                var $target = $('div[name="_finder"]');
                var similars = _this.data.Service.similarity;
                var item = "";
                $target
                    .attr(
                        "id",
                        "similar-accordion-" + _this.data.Service.as["인덱스"]
                    )
                    .empty();
                similars.forEach(function (similar, index) {
                    console.log(similar);
                    item +=
                        '    <a class="panel-heading collapsed media {{응급배경}}" role="tab" id="similar-header-{{접수번호}}" data-toggle="collapse" data-index="{{인덱스}}" data-parent="#similar-accordion-' +
                        _this.data.Service.as["인덱스"] +
                        '" href="#similar-item-{{접수번호}}"  aria-expanded="true" aria-controls="similar-item-{{접수번호}}">';
                    item += '       <div class="media-body">';
                    item += '           <span class="pull-right text-right">';
                    item +=
                        "               <cite>#{{접수번호}} / {{채택수}}</cite>";
                    // item += '               <br> <span class="service-selected-count"></span>'
                    item += "           </span>";
                    item += '           <h4 class="panel-title">';
                    item +=
                        "               {{기관명칭}} <small>({{기관코드}})</small> ";
                    item += "           </h4>";
                    //item += '           {{담당}} {{프로그램}} {{AS타입}} {{병원유형}} {{응급}} {{신규}} {{본사}}'
                    // item += '           <br>'
                    //item += '               {{상태}}'
                    item += "       </div>";
                    item += "    </a>";
                    item +=
                        '    <div class="panel-collapse collapse in" role="tabpanel" aria-labelledby="similar-header-{{접수번호}}" data-index="{{인덱스}}" id="similar-item-{{접수번호}}">';
                    item += '   <dt class="m-t-md">문의내용 ';
                    item +=
                        '				<small class="text-muted"><i class="fa fa-edit"></i> ';
                    item += similar["접수일자"];
                    item += "		</small> ";
                    item += "	</dt>";
                    item += '   <dd class="m-l-lg">';
                    item += similar["문의내용"];
                    item += "	</dd>";
                    item += '   <dt class="m-t-md">확인내용 ';
                    item +=
                        '				<small class="text-muted"><i class="fa fa-edit"></i> ';
                    item += similar["확인자명"] + " " + similar["확인일자"];
                    item += "		</small> ";
                    item += "	</dt>";
                    item += '   <dd class="m-l-lg">';
                    item += similar["확인내용"].replace(/\n/gim, "<br>");
                    item += "	</dd>";
                    item += '   <dt class="m-t-md">처리내용 ';
                    item +=
                        '				<small class="text-muted"><i class="fa fa-edit"></i> ';
                    item += similar["처리자명"] + " " + similar["처리일자"];
                    item += "		</small> ";
                    item += "	</dt>";
                    item += '   <dd class="m-l-lg">';
                    item += similar["처리내용"].replace(/\n/gim, "<br>");
                    item += "	</dd>";
                    item += '   <dt class="m-t-md">보류내용 ';
                    item +=
                        '				<small class="text-muted"><i class="fa fa-edit"></i> ';
                    item += similar["보류자명"] + " " + similar["보류일자"];
                    item += "		</small> ";
                    item += "	</dt>";
                    item += '   <dd class="m-l-lg">';
                    item += similar["보류내용"].replace(/\n/gim, "<br>");
                    item += "	</dd>";
                    item += "</dl>";
                    item += '       <div class="container">';
                    item +=
                        '           <button type="button" class="btn btn-success pull-right finder-like" data-index="{{접수번호}}" data-index-s="{{접수번호2}}">답변채택</button>';
                    item += "       </div>";
                    item += "    </div>";
                    item += "</div>";

                    item = item.replace(/{{접수번호}}/gim, similar["인덱스"]);
                    item = item.replace(
                        /{{접수번호2}}/gim,
                        _this.data.Service.as["인덱스"]
                    );
                    item = item.replace(/{{인덱스}}/gim, index);
                    item = item.replace(/{{기관명칭}}/gim, similar["기관명칭"]);
                    item = item.replace(/{{기관코드}}/gim, similar["기관코드"]);
                    item = item.replace(
                        /{{채택수}}/gim,
                        "채택:" + similar["채택수"]
                    );
                });
                $target.append(item);

                $(".finder-like").bind("click", function (event) {
                    _this.fn.toggleLike($(this));
                });
            },
            toggleLike: function (target) {
                var index = target.data("index");
                var index_s = target.data("index-s");

                var axiosLike;
                var data = {
                    index: index,
                    index_s: index_s,
                    user_id: params.user["인덱스"]
                };
                // if (thumbs.hasClass('fa-thumbs-o-up')) {
                axiosLike = axios.post(API.FINDER.LIKE, data);
                // } else {
                //     axiosLike = axios.delete(API.FINDER.LIKE, {
                //         data: data
                //     })
                // }

                axiosLike
                    .then(function (result) {
                        // UpdateServiceStatus: function (service, status) {
                        // var data = {
                        //     index: service['인덱스'],
                        //     user: params.user,
                        //     nextStatus: status,
                        //     curStatus: service['상태'],
                        //     exe: service['실행파일'],
                        //     emergency: service['응급'],
                        //     internal: service['본사'],
                        //     gubun: service['처리구분'],
                        //     mainCategory: service['실행메뉴'] || '',
                        //     subCategory: service['세부화면'] || '',
                        //     comment: {
                        //         confirm: $CONFIRM.length ?
                        //             $CONFIRM.val().trim() : service['확인내용'],
                        //         process: $PROCESS.length ?
                        //             $PROCESS.val().trim() : service['처리내용'],
                        //         hold: $HOLD.length ?
                        //             $HOLD.val().trim() : service['보류내용']
                        //     }
                        // }
                        var service = _this.data.Service.as;
                        var selectedService = _this.data.Service.similarity.find(
                            function (item) {
                                return item["인덱스"] === index;
                            }
                        );
                        console.log(service, selectedService);

                        // $('#comment-confirm-' + service['인덱스']).val('')
                        // $('#comment-process-' + service['인덱스']).val('')
                        // $('#comment-hold-' + service['인덱스']).val('')
                        // service['확인내용'] =
                        service["확인내용"] = selectedService["확인내용"];
                        service["처리내용"] = selectedService["처리내용"];
                        service["보류내용"] = selectedService["보류내용"];
                        service["처리구분"] = selectedService["처리구분"];

                        _this.fn.UpdateServiceStatus(
                            service,
                            CONSTS.SERVICE_STATUS.PROCESS,
                            true
                        );
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        };

        return _instance;
    };

    $(exports).bind("scroll", function (event) {
        if (
            $(exports).scrollTop() + $(exports).height() >=
            $(document).height()
        ) {
            if (!exports.Service.load && exports.Service.data.Pageing) {
                exports.Service.data.Pageing.curpage += 1;
                if (
                    exports.Service.data.Pageing.maxpage <
                    exports.Service.data.Pageing.curpage
                ) {
                    exports.Service.data.Pageing.curpage -= 1;
                } else {
                    exports.Service.fn.RenderList();
                }
            }
        }
    });

    // Load();
    exports.Service = new Service();
    exports.Service.fn.Load();
    exports.addEventListener(
        "message",
        exports.Service.fn.receiveMessage,
        false
    );
})(window);
