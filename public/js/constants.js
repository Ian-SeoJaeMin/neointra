(function (exports) {
    exports.CONSTS = {
        PARENT_URL: "parent_url",
        NOTIFY_POS: {
            dir1: "right",
            dir2: "up",
            push: "top"
        },
        CALENDAR_EVENT_NAME: {
            SCHEDULES: {
                1: "행사",
                2: "일정",
                3: "휴무",
                4: "월차",
                5: "기타",
                6: "공지"
            },
            VISITS: {
                1: "정기",
                2: "요청",
                3: "긴급",
                4: "영업",
                5: "기타"
            }
        },
        CALENDAR_EVENT_ID: {
            SCHEDULES: {
                1: "EVENT",
                2: "SCHEDULE",
                3: "HOLIDAY",
                4: "BREAKMONTH",
                5: "ETC",
                6: "NOTICE"
            },
            VISITS: {
                1: "REGULAR",
                2: "REQUEST",
                3: "EMERGENCY",
                4: "SALES",
                5: "ETC"
            }
        },
        CALENDAR_EVENT_COLOR: {
            SCHEDULES: {
                EVENT: {
                    backgroundColor: "#FF9484",
                    borderColor: "#FF9484",
                    textColor: "#000"
                },
                SCHEDULE: {
                    backgroundColor: "#849CE7",
                    borderColor: "#849CE7",
                    textColor: "#FFF"
                },
                HOLIDAY: {
                    backgroundColor: "#A5DE63",
                    borderColor: "#A5DE63",
                    textColor: "#000"
                },
                BREAKMONTH: {
                    backgroundColor: "#E7E7D6",
                    borderColor: "#E7E7D6",
                    textColor: "#000"
                },
                NOTICE: {
                    backgroundColor: "#0077D7",
                    borderColor: "#0077D7",
                    textColor: "#FFF"
                },
                ETC: {
                    backgroundColor: "#FFB573",
                    borderColor: "#FFB573",
                    textColor: "#000"
                }
            },
            VISITS: {
                REGULAR: {
                    backgroundColor: "#7CB77E",
                    borderColor: "#7CB77E",
                    textColor: "#FFF"
                },
                REQUEST: {
                    backgroundColor: "#3A87AD",
                    borderColor: "#3A87AD",
                    textColor: "#FFF"
                },
                EMERGENCY: {
                    backgroundColor: "#E47675",
                    borderColor: "#E47675",
                    textColor: "#FFF"
                },
                SALES: {
                    backgroundColor: "#8E74C8",
                    borderColor: "#8E74C8",
                    textColor: "#FFF"
                },
                ETC: {
                    backgroundColor: "#7F7F7F",
                    borderColor: "#7F7F7F",
                    textColor: "#FFF"
                }
            }
        },
        SERVICE_STATUS: {
            ACCEPT: 0,
            SHARE: 1,
            PROCESS: 2,
            HOLD: 3,
            DONE: 4,
            CANCEL: 5,
            FEEDBACK: 6,
            CONFIRM: 7
        },
        EXES: [
            "데스크",
            "입원수납",
            "청구심사",
            "진료실",
            "병동",
            "진료지원",
            "병원관리",
            "문서관리",
            "통계",
            "메인",
            "부가서비스",
            "기타"
        ],
        CHART_COLOR: {
            RED: "rgb(255, 99, 132)",
            ORANGE: "rgb(255, 159, 64)",
            YELLOW: "rgb(255, 205, 86)",
            GREEN: "rgb(75, 192, 192)",
            BLUE: "rgb(54, 162, 235)",
            PURPLE: "rgb(153, 102, 255)",
            GREY: "rgba(229, 229, 229, 1)",
            21: {
                backgroundColor: "rgba(128, 141, 153, 0.2)",
                borderColor: "rgba(128, 141, 153, 0.8)",
                pointBorderColor: "rgba(128, 141, 153, 0.2)",
                pointBackgroundColor: "rgba(128, 141, 153, 0.2)"
            },
            20: {
                backgroundColor: "rgba(63, 123, 249, 0.2)",
                borderColor: "rgba(63, 123, 249, 0.8)",
                pointBorderColor: "rgba(63, 123, 249, 0.2)",
                pointBackgroundColor: "rgba(63, 123, 249, 0.2)"
            },
            10: {
                backgroundColor: "rgba(214, 130, 60, 0.2)",
                borderColor: "rgba(214, 130, 60, 0.8)",
                pointBorderColor: "rgba(214, 130, 60, 0.2)",
                pointBackgroundColor: "rgba(214, 130, 60, 0.2)"
            },
            8: {
                backgroundColor: "rgba(68, 107, 189, 0.2)",
                borderColor: "rgba(68, 107, 189, 0.8)",
                pointBorderColor: "rgba(68, 107, 189, 0.2)",
                pointBackgroundColor: "rgba(68, 107, 189, 0.2)"
            },
            1: {
                backgroundColor: "rgba(53, 162, 70, 0.2)",
                borderColor: "rgba(53, 162, 70, 0.8)",
                pointBorderColor: "rgba(53, 162, 70, 0.2)",
                pointBackgroundColor: "rgba(53, 162, 70, 0.2)"
            }
        },
        VISITTYPE: {
            REGULAR: 1,
            REQUEST: 2,
            EMERGENCY: 3,
            SALES: 4,
            ETC: 5,
            OFFICE: 6,
            WATCH: 7,
            OPEN: 8
        },
        PROJECT: [
            "접수",
            "회의중",
            "개발중",
            "개발테스트",
            "개발완료",
            "사용테스트",
            "완료",
            "보류",
            "",
            "",
            "취소"
        ],
        ASFEELOCKTYPE: {
            "MIN45": 0,
            "CONFIRM": 1,
            "MIN30": 2
        }
    };

    exports.API = {
        SERVICE: {
            LIST: "/api/service/list",
            DETAIL: "/api/service/detail",
            REPLY: "/api/service/reply",
            HISTORY: "/api/service/history",
            STATUS: "/api/service/status",
            CANCEL: "/api/service/cancel",
            SAVE: "/api/service/save",
            TAG: "/api/service/tag", // AS 상세보기에서 입력
            TAGS: "/api/service/tags", // AS 접수 태그
            AFK: "/api/service/afk",
            FEEDBACK: "/api/service/feedback",
            DEV: "/api/service/dev", // 개발실 공유건
            LAB: "/api/service/lab"
        },
        FINDER: {
            SEARCH: "/api/finder/search",
            MAP: "/api/finder/map",
            LIKE: "/api/finder/like",
            DISLIKE: "/api/finder/dislike",
            MATCHINGCOUNT: "/api/finder/matching"
        },
        STATIC: {
            STATUS: "/api/static/status",
            PROGRAM: "/api/static/program",
            AREA: "/api/static/area",
            EXE: "/api/static/exe",
            EXEDETAIL: "/api/static/exedetail",
            FEE: "/api/static/fee",
            FEE2020: "/api/static/fee2020",
            ACCEPTDAYS: "/api/static/acceptdays",
            ASFINDER: "/api/static/asfinder",
            CATEGORYS: "/api/static/categorys",
            FINDER: {
                MENU: "/api/static/finder/menu",
                BUTTON: "/api/static/finder/btn",
                LIST: "/api/static/finder/list"
            },
            CAUTION: "/api/static/caution"
        },
        COMPANY: {
            SCHEDULE: "/api/company/schedule",
            AREAS: "/api/company/areas",
            MANAGERS: "/api/company/managers",
            USERS: "/api/users/users"
        },
        CUSTOMER: {
            LIST: "/api/customer/list",
            DETAIL: "/api/customer/detail",
            MISU: "/api/customer/misu",
            VISITS: "/api/customer/visits",
            VISIT: "/api/customer/visit",
            VISITTIME: "/api/customer/visit/time",
            CALLS: "/api/customer/calls",
            SERVICES: "/api/customer/services",
            REMOTE: "/api/customer/remote",
            SPECIFIC: "/api/customer/specific",
            FEE: "/api/customer/fee"
        },
        PROJECT: {
            LIST: "/api/project/list",
            DEVELOPER: "/api/project/developer",
            WRITER: "/api/project/writer",
            SAVE: "/api/project/save",
            DELETE: "/api/project/delete",
            INCENTIVE: "/api/project/incen"
        },
        FILEMANAGER: {
            UPLOAD: "/api/fm/upload",
            DELETE: "/api/fm/delete"
        },
        REPORT: "/api/report",
        BOARD: {
            BOARD: "/api/board",
            MANAGE: "/api/board/manage",
            SORT: "/api/board/manage/sort"
        },
        SCHEDULE: "/api/schedule",
        REPLY: "/api/reply",
        ADMIN: {
            GLOBAL: "/api/admin",
            USER: "/api/admin/user"
        },
        AMOUNT: {
            OUTAMOUNTS: "/api/amount"
        },
        SETTLEMENT: {
            MEMBER: "/api/settlement/member",
            AREA: "/api/settlement/area",
            AREASTATIC: "/api/settlement/areastatic",
            MEMO: "/api/settlement/memo",
            AREAMEMO: "/api/settlement/areamemo",
            SALEPRODUCT: "/api/settlement/saleproduct",
            NEWSALE: "/api/settlement/newsale",
            CLOSE: "/api/settlement/close",
            SALE: "/api/settlement/sale",
            SALESTATIC: "/api/settlement/salestatic"
        },
        QUOTEORDER: {
            PACKAGES: "/api/quoteorder/packages",
            PRODUCTS: "/api/quoteorder/products",
            PRODUCTSUBJECT: "/api/quoteorder/subjects",
            PRODUCTMODEL: "/api/quoteorder/models",
            ORDER: "/api/quoteorder/order"
        },
        EMERGEN: {
            LIST: "/api/emergen/list",
            DETAIL: "/api/emergen/detail"
        },
        DRAFTING: {
            LIST: "/api/drafting/list",
            DRAFT: "/api/drafting/item",
            // EDIT: '/api/drafting/edit',
            APPROVAL: "/api/drafting/approval"
            // DELETE: '/api/drafting/delete'
        },
        SERVICEDATA: {
            LIST: "/api/servicedata/list"
        }
    };

    exports.EMR = function (id) {
        var _emr = {
            id: id,
            name: "",
            badge: "",
            backGroundColor: ""
        };

        if ($.isNumeric(id)) {
            switch (id) {
                case 1:
                    _emr.id = 1;
                    _emr.name = "Eplus";
                    _emr.badge = "badge-eplus";
                    _emr.backgroundColor = "#35a246";
                    break;
                case 2:
                    _emr.id = 2;
                    _emr.name = "Hplus";
                    _emr.badge = "badge-eplus";
                    _emr.backgroundColor = "#35a246";
                    break;
                case 6:
                    _emr.id = 6;
                    _emr.name = "EplusCL";
                    _emr.badge = "badge-eplus";
                    _emr.backgroundColor = "#35a246";
                    break;
                case 7:
                    _emr.id = 7;
                    _emr.name = "EChart";
                    _emr.badge = "badge-echart";
                    _emr.backgroundColor = "#8d3bff";
                    break;
                case 8:
                    _emr.id = 8;
                    _emr.name = "MediChart";
                    _emr.badge = "badge-medi";
                    _emr.backgroundColor = "#446bbd";
                    break;
                case 10:
                    _emr.id = 10;
                    _emr.name = "HanimacPro";
                    _emr.badge = "badge-medi";
                    _emr.backgroundColor = "#D2732A";
                    break;
                case 20:
                    _emr.id = 20;
                    _emr.name = "SenseChart";
                    _emr.badge = "badge-sense";
                    _emr.backgroundColor = "#3f7bf9";
                    break;
                case 21:
                    _emr.id = 21;
                    _emr.name = "SenseChart(한방)";
                    _emr.badge = "badge-sense-h";
                    _emr.backgroundColor = "#808D99";
                    break;
                case 24:
                    _emr.id = 24;
                    _emr.name = "SensePlus";
                    _emr.badge = "badge-sense-plus";
                    _emr.backgroundColor = "#2A3F54";
                    break;
                default:
                    _emr.id = 0;
                    _emr.name = "정보없음";
                    _emr.badge = "";
                    break;
            }
        } else {
            switch (id.toUpperCase()) {
                case "EPLUS":
                    _emr.id = 1;
                    _emr.name = "Eplus";
                    _emr.badge = "badge-eplus";
                    _emr.backgroundColor = "#35a246";
                    break;
                case "HPLUS":
                    _emr.id = 2;
                    _emr.name = "Hplus";
                    _emr.badge = "badge-eplus";
                    _emr.backgroundColor = "#35a246";
                    break;
                case "EPLUSCL":
                    _emr.id = 6;
                    _emr.name = "EplusCL";
                    _emr.badge = "badge-eplus";
                    _emr.backgroundColor = "#35a246";
                    break;
                case "ECHART":
                    _emr.id = 7;
                    _emr.name = "EChart";
                    _emr.badge = "badge-echart";
                    _emr.backgroundColor = "#8d3bff";
                    break;
                case "MEDICHART":
                    _emr.id = 8;
                    _emr.name = "MediChart";
                    _emr.badge = "badge-medi";
                    _emr.backgroundColor = "#446bbd";
                    break;
                case "HANIMACPRO":
                    _emr.id = 10;
                    _emr.name = "HanimacPro";
                    _emr.badge = "badge-medi";
                    _emr.backgroundColor = "#446bbd";
                    break;
                case "SENSE":
                    _emr.id = 20;
                    _emr.name = "SenseChart";
                    _emr.badge = "badge-sense";
                    _emr.backgroundColor = "#3f7bf9";
                    break;
                case "SENSE(한방)":
                    _emr.id = 21;
                    _emr.name = "SenseChart(한방)";
                    _emr.badge = "badge-sense-h";
                    _emr.backgroundColor = "#808D99";
                    break;
                case "SENSE PLUS":
                    _emr.id = 24;
                    _emr.name = "SensePlus";
                    _emr.badge = "badge-sense-plus";
                    _emr.backgroundColor = "#2A3F54";
                    break;
                default:
                    _emr.id = 0;
                    _emr.name = "정보없음";
                    _emr.badge = "";
                    break;
            }
        }
        return _emr;
    };

    exports.fn = exports.fn || {};
    exports.fn.urlify = function (text) {
        var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
        return text.replace(urlRegex, function (url) {
            return (
                '<a class="btn btn-link btn-xs" href="' +
                url +
                '">' +
                url +
                "</a>"
            );
        });
    };
    exports.fn.errorNotify = function (error) {
        if (error.data) {
            if (error.data.code === "ELOGIN") {
                return location.reload();
            }
        } else {
            if (error.response) {
                error = error.response;
                if (error.status === 500) {
                    if (
                        error.data.code === "ELOGIN" ||
                        error.data.code === "ECONNCLOSED"
                    ) {
                        new PNotify({
                            title: "서버 내부 오류",
                            text:
                                "요청한 데이터를 불러오는 중 오류가 발생하였습니다. 새로고침 후 다시 시도해주세요.",
                            confirm: {
                                confirm: true
                            },
                            type: "error"
                        })
                            .get()
                            .on("pnotify.confirm", function () {
                                location.reload();
                            });
                    } else if (error.data.toString().indexOf("DOCTYPE") >= 0) {
                        $("html")
                            .empty()
                            .append(error.data);
                    }
                }
            } else if (error.title && error.text && error.type) {
                // new PNotify(error);
                swal({
                    title: error.title,
                    html: error.text,
                    type: error.type
                });
                if (error.target) {
                    $("html, body").animate(
                        {
                            scrollTop: $(error.target).offset().top - 100
                        },
                        function () {
                            $(error.target).focus();
                        }
                    );
                }
            } else if (error.stack) {
                console.log(error.message, error.stack);
            }
        }
        console.log(JSON.stringify(error, null, 4));
    };

    exports.fn.getArea = function (areaId) {
        return new Promise(function (resolve, reject) {
            axios
                .get(API.COMPANY.AREAS)
                .then(function (result) {
                    var areas = result.data[0];
                    var area = areas.find(function (area) {
                        return area["지사코드"] === areaId;
                    });
                    resolve(area);
                })
                .catch(function (error) {
                    fn.errorNotify(error);
                    reject();
                });
        });
    };

    exports.fn.init_area = function (el, permission, all) {
        return new Promise(function (resolve, reject) {
            if (params.user["지사코드"] !== "0000") {
                el.attr("disabled", true); //.addClass('hidden');
                // reject();
            }

            if (permission === "all") {
                el.removeAttr("disabled");
            } else if (permission) {
                if (
                    typeof params.user["설정"].admin === "undefined" ||
                    params.user["설정"].admin === 0
                ) {
                    if (
                        typeof params.user["설정"]["지사선택"] ===
                        "undefined" ||
                        params.user["설정"]["지사선택"] === 0
                    ) {
                        if (params.user["지사코드"] !== "0000") {
                            el.attr("disabled", true);
                        }
                    } else if (params.user["설정"]["지사선택"] === 1) {
                        el.removeAttr("disabled");
                    }
                } else {
                    el.removeAttr("disabled");
                }
            }

            axios
                .get(API.COMPANY.AREAS)
                .then(function (result) {
                    if (result.status === 200) {
                        exports.params.areas = result.data[0];
                        _renderAreas(result.data[0]);
                    }
                })
                .catch(function (error) {
                    fn.errorNotify(error);
                    reject();
                });

            function _renderAreas(areas) {
                if (all) {
                    el.append('<option value="">전체</option>');
                }

                areas.forEach(function (element) {
                    el.append(
                        '<option value="' +
                        element["지사코드"] +
                        '" ' +
                        (element["지사코드"] === params.user["지사코드"]
                            ? "selected"
                            : "") +
                        ">" +
                        element["지사명"] +
                        "</option>"
                    );
                }, this);

                el.selectpicker("refresh");

                return resolve();
            }
        });
    };

    exports.fn.setSelectionRange = function (
        input,
        selectionStart,
        selectionEnd
    ) {
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
        } else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd("character", selectionEnd);
            range.moveStart("character", selectionStart);
            range.select();
        }
    };

    exports.fn.setCaretToPos = function (input, pos) {
        exports.fn.setSelectionRange(input, pos, pos);
    };

    exports.fn.SetFeedBackLabel = function (item, compare, to) {
        if (compare(item, to)) {
            item += ' <i class="fa fa-items-circle"></i>';
            item = '<span class="red">' + item + "</span>";
        } else {
            item += ' <i class="fa fa-check-circle"></i>';
            item = '<span class="blue">' + item + "</span>";
        }
        return item;
    };

    exports.fn.init_manage = function (el, permission, all) {
        return new Promise(function (resolve, reject) {
            if (params.user["지사코드"] !== "0000") {
                el.attr("disabled", true); //.addClass('hidden');
                // reject();
            }
            if (permission) {
                if (
                    typeof params.user["설정"].admin === "undefined" ||
                    params.user["설정"].admin === 0
                ) {
                    if (
                        typeof params.user["설정"]["담당자선택"] ===
                        "undefined" ||
                        params.user["설정"]["담당자선택"] === 0
                    ) {
                        el.attr("disabled", true);
                    }
                } else {
                    el.removeAttr("disabled");
                }
            }

            axios
                .get(API.COMPANY.MANAGERS)
                .then(function (result) {
                    if (result.status === 200) {
                        exports.params.managers = result.data[0];
                        _renderManagers(result.data[0]);
                    }
                })
                .catch(function (error) {
                    fn.errorNotify(error);
                    reject();
                });

            function _renderManagers(managers) {
                if (all) {
                    el.append('<option value="">전체</option>');
                }
                managers.forEach(function (element) {
                    el.append(
                        '<option value="' +
                        element["USER_ID"] +
                        '" ' +
                        (element["USER_ID"] === params.user["인덱스"]
                            ? "selected"
                            : "") +
                        ">" +
                        element["USER_NAME"] +
                        "</option>"
                    );
                }, this);

                el.selectpicker("refresh");
                return resolve();
            }
        });
    };

    exports.fn.init_users = function (el, all, permission, dev) {
        return new Promise(function (resolve, reject) {
            if (!permission) {
                if (params.user["지사코드"] !== "0000") {
                    el.attr("disabled", true); //.addClass('hidden');
                    // reject();
                }
            }

            var defaultSelect = el.data("default");

            axios
                .get(API.COMPANY.USERS)
                .then(function (result) {
                    if (result.status === 200) {
                        exports.params.users = result.data;

                        exports.params.users = exports.params.users.sort(
                            function (a, b) {
                                return a["이름"] > b["이름"]
                                    ? 1
                                    : a["이름"] < b["이름"]
                                        ? -1
                                        : 0;
                            }
                        );

                        _renderUsers(exports.params.users, dev);
                    }
                })
                .catch(function (error) {
                    fn.errorNotify(error);
                    reject();
                });

            function _renderUsers(users, dev) {
                if (all) {
                    el.append('<option value="">전체</option>');
                }

                if (dev) {
                    users = users.filter(function (i) { return i['부서코드'] === 3 || i['인덱스'] === 149 });
                }

                users.forEach(function (element) {
                    el.append(
                        '<option value="' +
                        element["인덱스"] +
                        '" ' +
                        (element["인덱스"] === defaultSelect
                            ? "selected"
                            : "") +
                        ">" +
                        element["이름"] +
                        "</option>"
                    );
                }, this);

                el.selectpicker("refresh");
                return resolve();
            }
        });
    };

    exports.fn.arrayUnique = function (arr) {
        return arr.filter(function (item, index) {
            return arr.indexOf(item) >= index;
        })
    }
    exports.fn.cloneObject = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    exports.fn.ExportToExcel = function (obj, title) {

        var tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>";
        var textRange; var j = 0;
        var tab = obj[0]; //tab = document.getElementById(tableid);//.getElementsByTagName('table'); // id of table
        if (tab == null) {
            return false;
        }
        if (tab.rows.length == 0) {
            return false;
        }

        //header    
        tab_text = tab_text + tab.rows[0].innerHTML + "</tr>";
        // for (j = 0; j < tab.rows.length; j++) {

        //     //tab_text=tab_text+"</tr>";
        // }
        // Create body column
        obj.find(" tbody tr").each(function () {
            tab_text = tab_text + "<tr>";
            $(this).find("td").each(function () {
                if ($(this).find("input,select").length === 0) {
                    var value = $(this).html();
                    tab_text = tab_text + "<td>" + value + "</td>";
                }
                else {
                    $(this).find("input,select").each(function () {
                        var value = "";

                        if ($(this).prop("type") == 'select-one') {
                            value = $('option:selected', this).text();
                        } else if ($(this).prop('type') == 'checkbox') {
                            value = $(this).prop('checked') ? "O" : "X";
                        } else {
                            value = $(this).val();
                        }

                        if (!$(this).closest("td").hasClass("NoExport") &&
                            !$(this).hasClass("NoExport")) { // NoExport is used for TD 
                            // or tan input tag that not needs to be exported
                            tab_text = tab_text + "<td align='center'>" + value + "</td>";
                        }
                    });
                }
            });
            tab_text = tab_text + "</tr>";
        });

        tab_text = tab_text + "</table>";
        tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
        tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
        //tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
        {
            txtArea1.document.open("txt/html", "replace");
            txtArea1.document.write(tab_text);
            txtArea1.document.close();
            txtArea1.focus();
            sa = txtArea1.document.execCommand("SaveAs", true, title + ".xls");
        }
        else                 //other browser not tested on IE 11
            //sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
            try {
                var blob = new Blob([tab_text], { type: "application/vnd.ms-excel" });
                window.URL = window.URL || window.webkitURL;
                link = window.URL.createObjectURL(blob);
                a = document.createElement("a");
                if (document.getElementById("caption") != null) {
                    a.download = document.getElementById("caption").innerText;
                }
                else {
                    a.download = 'download';
                }
                a.download = title + '.xls';
                a.href = link;

                document.body.appendChild(a);

                a.click();

                document.body.removeChild(a);
            } catch (e) {
            }


        return false;
        //return (sa);

    }

    if (exports.params && exports.params.user) {
        // axios.defaults.headers.common['user'] = JSON.stringify(exports.params.user)
        axios.defaults.params = {};
        axios.defaults.params.user = exports.params.user;
    }
})(window);
