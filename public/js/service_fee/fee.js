(function (exports) {
    "use strict";

    var Fee = function () {
        var _instance = null,
            _this = this;

        Fee = function () {
            return _instance;
        };
        Fee.prototype = this;
        _instance = new Fee();
        _instance.constructor = Fee();

        var state = {
            fees: null,
            data: {
                origin: null,
                member: {
                    qc: [],
                    dev: [],
                    area: [],
                    fee: [],
                    areaFee: []
                },
                parent: {
                    except: null,
                    inTime: null,
                    outTime: null
                },
                kim: {
                    inTime: null
                },
                share: {
                    inTime: null,
                    inEmergency: null
                }
            },
            month: moment().format("YYYY-MM"),
            asLockType: null
            // datePicker: new myDatePicker('.datepicker.fee')
        };

        var el = {
            $MEMBERTABLE: $("table>tbody.fee-member"),
            $MEMBERTABLE2: $("table>tbody.fee-member-2"),
            $MEMBERTABLE3: $("table>tbody.fee-member-3"),
            $CURRENTTABLE: null,
            $AREATABLE: $("table>tbody.fee-area"),
            $ALLBUTTON: $("button.fee-all"),
            $UNFEEBUTTON: $("button.fee-all-except-unfee"),
            $MEMBERPICKER: $("select#member"),
            $AREAPICKER: $("select#area"),
            $FEETABLE: $("table>tbody.fee-list"),
            $FEETABLEEXCEL: $("#fee-all-excel"),
            $FEEEXCEL: $("#fee-excel"),
            $FEEREFRESH: $("#fee-refresh"),
            $FEELOCK: $("#fee-lock"),
            $FEELOAD: $("#fee-load"),
            $FEEDATEPICKER: $(".datepicker.month")
        };

        var actions = {
            initialize: function () {
                // state.datePicker.fn.init({
                //     start: moment().startOf('month').format('YYYY-MM-DD'),
                //     end: moment().endOf('month').format('YYYY-MM-DD')
                // },
                //     // _this.actions.load
                // )
                _this.el.$FEEDATEPICKER
                    .datetimepicker({
                        format: "YYYY??? M???",
                        defaultDate: moment().format(),
                        showTodayButton: true,
                        ignoreReadonly: true,
                        keepOpen: true,
                        viewMode: "months"
                    })
                    .bind("dp.change", function (event) {
                        state.month = event.date.format("YYYY-MM");
                    });

                _this.el.$ALLBUTTON.bind("click", function (event) {
                    _this.actions.renderList(_this.state.data.origin);
                });

                _this.el.$UNFEEBUTTON.bind("click", function (event) {
                    _this.actions.renderList(_this.state.data.origin, true);
                });

                _this.el.$MEMBERPICKER.bind("changed.bs.select", function (
                    event
                ) {
                    var member = $(this).selectpicker("val");
                    // _this.el.$AREAPICKER.selectpicker('val', '')
                    _this.el.$AREAPICKER.val("");
                    _this.el.$AREAPICKER.selectpicker("refresh");
                    // _this.el.$AREAPICKER.selectpicker('deselectAll')
                    _this.actions.renderList(
                        _this.state.data.origin.filter(function (item) {
                            return item["?????????"] == member;
                        }),
                        true
                    );
                });

                _this.el.$AREAPICKER.bind("changed.bs.select", function (event) {
                    var area = $(this).selectpicker("val");
                    var isParent = area === "0000";
                    // _this.el.$MEMBERPICKER.selectpicker('val', '')
                    _this.el.$MEMBERPICKER.val("");
                    _this.el.$MEMBERPICKER.selectpicker("refresh");
                    _this.actions.renderList(
                        _this.state.data.origin.filter(function (item) {
                            if (isParent) {
                                return item["????????????"].match(
                                    /0000|0030|0031|0026/gim
                                );
                            } else {
                                return item["????????????"] == area;
                            }
                        }),
                        true
                    );
                });

                _this.el.$FEETABLEEXCEL.bind("click", function (event) {
                    event.preventDefault();

                    if (!_this.el.$FEETABLE.find("tr").length) {
                        return false;
                    }
                    // var type = $(this).data('fee');
                    // $FEEPRINT = $('.fee-print-container[data-fee="days"]').find('tbody#fee-print')
                    //getting data from our table
                    var data_type = "data:application/vnd.ms-excel";
                    var table_div = _this.el.$FEETABLE.closest("div.x_content");
                    var table_html = table_div[0].outerHTML.replace(
                        / /g,
                        "%20"
                    );
                    table_html = table_html.replace(
                        /<i%20class="fa%20fa-check"><\/i>/gim,
                        "???"
                    );
                    var a = document.createElement("a");
                    a.href = data_type + ", " + table_html;
                    a.download =
                        "AS??????????????????" +
                        "_" +
                        Math.floor(Math.random() * 9999999 + 1000000) +
                        ".xls";
                    a.click();
                });

                _this.el.$FEEEXCEL.bind("click", function (event) {
                    event.preventDefault();

                    // var type = $(this).data('fee');
                    // $FEEPRINT = $('.fee-print-container[data-fee="days"]').find('tbody#fee-print')
                    //getting data from our table
                    var data_type = "data:application/vnd.ms-excel";
                    var table_div = _this.el.$CURRENTTABLE.closest(
                        // "div.x_content"
                        "section"
                    );

                    var table_html =
                        "<h3>?????? A/S ????????????(????????? ??????x600???,????????? ??????x1,000???)</h3>" +
                        table_div[0].outerHTML.replace(/ /g, "%20");
                    table_div = _this.el.$AREATABLE.closest("div.x_content");
                    table_html +=
                        "<h3>?????? ???????????? ?????????</h3>" +
                        table_div[0].outerHTML.replace(/ /g, "%20");
                    table_html = "<h1>?????? A/S ????????? ??????</h1>" + table_html;
                    var a = document.createElement("a");
                    a.href = data_type + ", " + table_html;
                    a.download =
                        "AS?????????" +
                        "_" +
                        Math.floor(Math.random() * 9999999 + 1000000) +
                        ".xls";
                    a.click();
                });

                _this.el.$FEEREFRESH.bind("click", function (event) {
                    _this.actions.load();
                });

                _this.el.$FEELOCK.bind("click", function (event) {
                    _this.actions.feeLock();
                });

                _this.el.$FEELOAD.bind("click", function () {
                    _this.actions.load();
                });

                _this.actions.load();
            },
            load: function () {
                _this.el.$FEETABLE.empty();
                _this.el.$MEMBERTABLE.parent().addClass("hidden");
                _this.el.$MEMBERTABLE2.parent().addClass("hidden");
                _this.el.$MEMBERTABLE3.parent().addClass("hidden");

                axios
                    .get(API.STATIC.FEE, {
                        params: {
                            date: _this.state.month //_this.state.datePicker.value
                        }
                    })
                    .then(function (result) {
                        // console.log(result);
                        if (_this.state.month < "2020-01") {
                            _this.state.asLockType = CONSTS.ASFEELOCKTYPE.MIN45
                        } else if (_this.state.month > "2020-01") {
                            _this.state.asLockType = CONSTS.ASFEELOCKTYPE.MIN30
                        } else {
                            _this.state.asLockType = CONSTS.ASFEELOCKTYPE.CONFIRM
                        }
                        // _this.state.asLockType = result.data[0]["????????????"];
                        return _this.actions.parsing(result.data);
                    })
                    .then(function (total) {
                        // console.log(_this.state.fees)

                        switch (_this.state.asLockType) {
                            case CONSTS.ASFEELOCKTYPE.MIN45: // 0
                                return _this.actions.render(total);
                            case CONSTS.ASFEELOCKTYPE.CONFIRM: // 1
                                return _this.actions.render2(total);
                            case CONSTS.ASFEELOCKTYPE.MIN30:
                                return _this.actions.render3(total);
                        }

                        // return _this.actions.render2(total)
                        //     .then(function () {
                        //         _this.actions.render(total)
                        //     });

                        // return _this.actions.render(total)
                    })
                    .then(function () {
                        switch (_this.state.asLockType) {
                            case CONSTS.ASFEELOCKTYPE.MIN45:
                                _this.el.$MEMBERTABLE
                                    .parent()
                                    .removeClass("hidden");
                                _this.el.$CURRENTTABLE = _this.el.$MEMBERTABLE;
                                break;
                            case CONSTS.ASFEELOCKTYPE.CONFIRM:
                                _this.el.$MEMBERTABLE2
                                    .parent()
                                    .removeClass("hidden");
                                _this.el.$CURRENTTABLE = _this.el.$MEMBERTABLE2;
                                break;
                            case CONSTS.ASFEELOCKTYPE.MIN30:
                                _this.el.$MEMBERTABLE3
                                    .parent()
                                    .removeClass("hidden");
                                _this.el.$CURRENTTABLE = _this.el.$MEMBERTABLE3;
                                break;
                        }

                        if (
                            params.user["?????????"] !== 13 &&
                            params.user["?????????"] !== 5 &&
                            params.user["?????????"] !== 43 &&
                            params.user["?????????"] !== 89
                        ) {
                            if (
                                !params.user["????????????"].match(
                                    /0000|0030|0031|0026/gim
                                )
                            ) {
                                _this.el.$MEMBERPICKER
                                    .attr("disabled", true)
                                    .selectpicker("refresh");
                                _this.el.$AREAPICKER.selectpicker(
                                    "val",
                                    params.user["????????????"]
                                );
                                _this.el.$AREAPICKER
                                    .attr("disabled", true)
                                    .selectpicker("refresh");
                                _this.el.$AREAPICKER.trigger(
                                    "changed.bs.select"
                                );
                            } else {
                                _this.el.$MEMBERPICKER.selectpicker(
                                    "val",
                                    params.user["?????????"]
                                );
                                _this.el.$MEMBERPICKER
                                    .attr("disabled", true)
                                    .selectpicker("refresh");
                                _this.el.$AREAPICKER
                                    .attr("disabled", true)
                                    .selectpicker("refresh");
                                _this.el.$MEMBERPICKER.trigger(
                                    "changed.bs.select"
                                );
                            }
                        }
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                    });
            },
            parsing: function (originData) {
                return new Promise(function (resolve, reject) {
                    try {
                        //????????????
                        if (originData[0]["??????"]) {
                            _this.el.$FEELOCK
                                .removeClass("btn-primary")
                                .addClass("btn-danger");
                            _this.el.$FEELOCK
                                .find("i")
                                .removeClass("fa-unlock")
                                .addClass("fa-lock");
                        } else {
                            _this.el.$FEELOCK
                                .removeClass("btn-danger")
                                .addClass("btn-primary");
                            _this.el.$FEELOCK
                                .find("i")
                                .removeClass("fa-lock")
                                .addClass("fa-unlock");
                        }

                        _this.state.data = {
                            origin: originData,
                            member: {
                                qc: [],
                                dev: [],
                                area: [],
                                fee: [],
                                areaFee: []
                            },
                            parent: {
                                except: null,
                                inTime: null,
                                inTime30: null,
                                outTime: null,
                                outTime30: null,
                                confirmInTime: null,
                                confirmOutTime: null,
                                feedbackInTime: null,
                                feedbackOutTime: null
                            },
                            kim: {
                                inTime: null
                            },
                            west: {
                                inTime: null
                            },
                            share: {
                                inTime: null,
                                inEmergency: null
                            }
                        };

                        //QC ??????
                        var temp = originData.filter(function (item) {
                            return (
                                (item["??????"] == 2 &&
                                    item["?????????"] !== 193 &&
                                    item["?????????"] !== 149 &&
                                    item["????????????"].match(
                                        /0000|0030|0031|0026/gim
                                    )) ||
                                item["?????????"] === 18 ||
                                item["?????????"] === 183 ||
                                item["?????????"] === 71
                            );
                        });
                        temp = temp.map(function (item) {
                            return item["?????????"];
                        });
                        //????????????
                        $.each(temp, function (i, el) {
                            if (
                                $.inArray(el, _this.state.data.member.qc) === -1
                            )
                                _this.state.data.member.qc.push(el);
                        });
                        //DEV ??????
                        temp = originData.filter(function (item) {
                            return (
                                (item["??????"] == 3 &&
                                    item["?????????"] !== 18 &&
                                    item["?????????"] !== 71) ||
                                item["?????????"] === 149
                            );
                        });
                        temp = temp.map(function (item) {
                            return item["?????????"];
                        });
                        //????????????
                        $.each(temp, function (i, el) {
                            if (
                                $.inArray(el, _this.state.data.member.dev) ===
                                -1
                            )
                                _this.state.data.member.dev.push(el);
                        });
                        //????????????
                        temp = originData.filter(function (item) {
                            return !item["????????????"].match(
                                /0000|0030|0031|0026|0034|0045/gim
                            );
                        });
                        temp = temp.map(function (item) {
                            return item["????????????"];
                        });
                        //????????????
                        $.each(temp, function (i, el) {
                            if (
                                $.inArray(el, _this.state.data.member.area) ===
                                -1
                            )
                                _this.state.data.member.area.push(el);
                        });

                        var prevData,
                            midData,
                            overData,
                            exceptData,
                            exceptUniqData;

                        //???????????? ?????? ???????????????
                        prevData = originData.filter(function (item) {
                            return (
                                moment(item["????????????"]).format("HH:MM") <
                                "09:00" &&
                                item["????????????"].match(/0000|0030|0031|0026/gim)
                            );
                        });
                        //???????????? ???????????????
                        midData = originData.filter(function (item) {
                            return (
                                moment(item["????????????"]).format("HH:MM") >=
                                "13:00" &&
                                moment(item["????????????"]).format("HH:MM") <=
                                "14:00" &&
                                item["????????????"].match(/0000|0030|0031|0026/gim)
                            );
                        });
                        //???????????? ?????? ???????????????
                        overData = originData.filter(function (item) {
                            return (
                                moment(item["????????????"]).format("HH:MM") >
                                "18:00" &&
                                item["????????????"].match(/0000|0030|0031|0026/gim)
                            );
                        });

                        //??????
                        (exceptData = []), (exceptUniqData = []);
                        exceptData = exceptData.concat(prevData);
                        exceptData = exceptData.concat(midData);
                        exceptData = exceptData.concat(overData);

                        //????????????
                        $.each(exceptData, function (i, el) {
                            if ($.inArray(el, exceptUniqData) === -1)
                                exceptUniqData.push(el);
                        });

                        _this.state.data.parent.except = exceptUniqData;

                        //?????? ????????? ??????
                        var filteredData = originData.filter(function (item) {
                            return !exceptUniqData.some(function (_item) {
                                return _item["?????????"] === item["?????????"];
                            });
                        });

                        //45????????? ???????????? ?????????
                        _this.state.data.parent.inTime = filteredData.filter(
                            function (item) {
                                return (
                                    moment(item["????????????"]).diff(
                                        item["????????????"],
                                        "minutes"
                                    ) < 45 &&
                                    item["????????????"].match(
                                        /0000|0030|0031|0026/gim
                                    )
                                );
                            }
                        );

                        //45??? ????????? ?????????
                        _this.state.data.parent.outTime = filteredData.filter(
                            function (item) {
                                return (
                                    moment(item["????????????"]).diff(
                                        item["????????????"],
                                        "minutes"
                                    ) >= 45 &&
                                    item["????????????"].match(
                                        /0000|0030|0031|0026/gim
                                    )
                                );
                            }
                        );

                        //30????????? ???????????? ?????????
                        _this.state.data.parent.inTime30 = filteredData.filter(
                            function (item) {
                                return (
                                    moment(item["????????????"]).diff(
                                        item["????????????"],
                                        "minutes"
                                    ) < 30 &&
                                    item["????????????"].match(
                                        /0000|0030|0031|0026/gim
                                    )
                                );
                            }
                        );

                        //30??? ????????? ?????????
                        _this.state.data.parent.outTime30 = filteredData.filter(
                            function (item) {
                                return (
                                    moment(item["????????????"]).diff(
                                        item["????????????"],
                                        "minutes"
                                    ) >= 30 &&
                                    item["????????????"].match(
                                        /0000|0030|0031|0026/gim
                                    )
                                );
                            }
                        );

                        //??????-?????? 10?????????
                        _this.state.data.parent.confirmInTime = filteredData.filter(
                            function (item) {
                                return (
                                    moment(item["????????????"]).diff(
                                        item["????????????"],
                                        "minutes"
                                    ) < 10 &&
                                    item["????????????"].match(
                                        /0000|0030|0031|0026/gim
                                    )
                                );
                            }
                        );
                        //??????-?????? 10?????????
                        _this.state.data.parent.confirmOutTime = filteredData.filter(
                            function (item) {
                                return (
                                    moment(item["????????????"]).diff(
                                        item["????????????"],
                                        "minutes"
                                    ) >= 10 &&
                                    item["????????????"].match(
                                        /0000|0030|0031|0026/gim
                                    )
                                );
                            }
                        );
                        //??????-?????????(??????) 20?????????
                        _this.state.data.parent.feedbackInTime = filteredData.filter(
                            function (item) {
                                if (
                                    moment(item["????????????"]).format("dddd") ===
                                    "?????????" ||
                                    moment(item["????????????"]).format(
                                        "YYYYMMDD"
                                    ) === "20200101"
                                ) {
                                    return (
                                        moment(item["????????????"]).diff(
                                            item["????????????"],
                                            "minutes"
                                        ) < 10 &&
                                        item["????????????"].match(
                                            /0000|0030|0031|0026/gim
                                        )
                                    );
                                } else {
                                    return (
                                        moment(item["????????????"]).diff(
                                            item["????????????"],
                                            "minutes"
                                        ) < 10 &&
                                        item["????????????"].match(
                                            /0000|0030|0031|0026/gim
                                        )
                                    );
                                }
                            }
                        );
                        //??????-?????????(??????) 20?????????
                        _this.state.data.parent.feedbackOutTime = filteredData.filter(
                            function (item) {
                                // return moment(item['????????????']).diff(item['????????????'], 'minutes') >= 10 && item['????????????'].match(/0000|0030|0031|0026/gim)
                                if (
                                    moment(item["????????????"]).format("dddd") ===
                                    "?????????" ||
                                    moment(item["????????????"]).format(
                                        "YYYYMMDD"
                                    ) === "20200101"
                                ) {
                                    return (
                                        moment(item["????????????"]).diff(
                                            item["????????????"],
                                            "minutes"
                                        ) >= 10 &&
                                        item["????????????"].match(
                                            /0000|0030|0031|0026/gim
                                        )
                                    );
                                } else {
                                    return (
                                        moment(item["????????????"]).diff(
                                            item["????????????"],
                                            "minutes"
                                        ) >= 10 &&
                                        item["????????????"].match(
                                            /0000|0030|0031|0026/gim
                                        )
                                    );
                                }
                            }
                        );

                        //????????? ??????
                        _this.state.data.kim.inTime = filteredData.filter(
                            function (item) {
                                return (
                                    item["????????????"] === "0034" &&
                                    item["??????"] !==
                                    CONSTS.SERVICE_STATUS.CONFIRM
                                );
                            }
                        );

                        //????????????2 ??????
                        _this.state.data.west.inTime = filteredData.filter(
                            function (item) {
                                return (
                                    item["????????????"] === "0045" &&
                                    item["??????"] !==
                                    CONSTS.SERVICE_STATUS.CONFIRM
                                );
                            }
                        );

                        //?????? ??????
                        _this.state.data.share.inTime = filteredData.filter(
                            function (item) {
                                return (
                                    !item["????????????"].match(
                                        /0000|0030|0031|0026|0034|0045/gim
                                    ) &&
                                    item["??????"] === 0 &&
                                    item["??????"] === 0 &&
                                    item["??????"] !==
                                    CONSTS.SERVICE_STATUS.CONFIRM
                                );
                            }
                        );
                        _this.state.data.share.inEmergency = filteredData.filter(
                            function (item) {
                                return (
                                    !item["????????????"].match(
                                        /0000|0030|0031|0026|0034|0045/gim
                                    ) &&
                                    item["??????"] === 1 &&
                                    item["??????"] === 0 &&
                                    item["??????"] !==
                                    CONSTS.SERVICE_STATUS.CONFIRM
                                );
                            }
                        );

                        var feeObj = {
                            member: 0,
                            name: "",
                            inTime: 0,
                            inTime30: 0,
                            outTime: 0,
                            outTime30: 0,
                            confirmInTime: 0,
                            confirmOutTime: 0,
                            feedbackInTime: 0,
                            feedbackOutTime: 0,
                            except: 0,
                            parentFee: 0,
                            parentFee2: 0,
                            kim: 0,
                            kimFee: 0,
                            west: 0,
                            westFee: 0,
                            share: 0,
                            shareEmergency: 0,
                            shareFee: 0,
                            total: 0,
                            total2: 0,
                            count: 0
                        };

                        var totalObj = $.extend({}, feeObj);
                        totalObj.member = 999;
                        totalObj.name = "??????";

                        _this.state.data.member.qc.forEach(function (
                            member,
                            index
                        ) {
                            var _feeObj = $.extend({}, feeObj);

                            _feeObj.member = member;

                            // ???????????? ?????????
                            _this.state.data.parent.except.forEach(function (
                                item,
                                index
                            ) {
                                // item.except = false
                                if (
                                    item["?????????"] === member &&
                                    item["??????"] == 0
                                ) {
                                    if (_feeObj.name === "")
                                        _feeObj.name = item["????????????"];
                                    _feeObj.except += 1;
                                    _feeObj.count += 1;
                                    totalObj.except += 1;

                                    if (item["??????"] == 0) {
                                        _feeObj.parentFee += 600;
                                        _feeObj.parentFee2 += 600;
                                        item["?????????"] = 600;
                                    } else {
                                        item["?????????"] = 0;
                                    }
                                    item.except = true;
                                }
                            });

                            if (
                                _this.state.asLockType ===
                                CONSTS.ASFEELOCKTYPE.MIN45
                            ) {
                                _this.state.data.parent.inTime.forEach(function (
                                    item
                                ) {
                                    // item.inTime = false
                                    if (
                                        item["?????????"] === member &&
                                        item["??????"] == 0
                                    ) {
                                        if (_feeObj.name === "")
                                            _feeObj.name = item["????????????"];
                                        _feeObj.inTime += 1;
                                        _feeObj.count += 1;
                                        totalObj.inTime += 1;
                                        if (item["??????"] == 0) {
                                            _feeObj.parentFee += 600;
                                            item["?????????"] = 600;
                                        } else {
                                            item["?????????"] = 0;
                                        }
                                        item.inTime = true;
                                    }
                                });

                                _this.state.data.parent.outTime.forEach(
                                    function (item) {
                                        if (
                                            item["?????????"] === member &&
                                            item["??????"] == 0
                                        ) {
                                            if (_feeObj.name === "")
                                                _feeObj.name = item["????????????"];
                                            _feeObj.outTime += 1;
                                            _feeObj.count += 1;
                                            totalObj.outTime += 1;
                                            item["?????????"] = 0;
                                        }
                                    }
                                );
                            } else if (
                                _this.state.asLockType ===
                                CONSTS.ASFEELOCKTYPE.MIN30
                            ) {
                                _this.state.data.parent.inTime30.forEach(
                                    function (item) {
                                        // item.inTime = false
                                        if (
                                            item["?????????"] === member &&
                                            item["??????"] == 0
                                        ) {
                                            if (_feeObj.name === "")
                                                _feeObj.name = item["????????????"];
                                            _feeObj.inTime += 1;
                                            _feeObj.count += 1;
                                            totalObj.inTime += 1;
                                            if (item["??????"] == 0) {
                                                _feeObj.parentFee += 600;
                                                item["?????????"] = 600;
                                            } else {
                                                item["?????????"] = 0;
                                            }
                                            item.inTime = true;
                                        }
                                    }
                                );

                                _this.state.data.parent.outTime30.forEach(
                                    function (item) {
                                        if (
                                            item["?????????"] === member &&
                                            item["??????"] == 0
                                        ) {
                                            if (_feeObj.name === "")
                                                _feeObj.name = item["????????????"];
                                            _feeObj.outTime += 1;
                                            _feeObj.count += 1;
                                            totalObj.outTime += 1;
                                            item["?????????"] = 0;
                                        }
                                    }
                                );
                            }

                            _this.state.data.parent.confirmInTime.forEach(
                                function (item) {
                                    if (
                                        item["?????????"] === member &&
                                        item["??????"] == 0
                                    ) {
                                        if (_feeObj.name === "")
                                            _feeObj.name = item["????????????"];
                                        _feeObj.confirmInTime += 1;
                                        // _feeObj.count += 1;
                                        totalObj.confirmInTime += 1;
                                        if (item["??????"] == 0) {
                                            _feeObj.parentFee2 += 100;
                                            item["???????????????"] += 100;
                                        } else {
                                            item["???????????????"] = 0;
                                        }
                                        item.confirmInTime = true;
                                    }
                                }
                            );
                            _this.state.data.parent.confirmOutTime.forEach(
                                function (item) {
                                    if (
                                        item["?????????"] === member &&
                                        item["??????"] == 0
                                    ) {
                                        if (_feeObj.name === "")
                                            _feeObj.name = item["????????????"];
                                        _feeObj.confirmOutTime += 1;
                                        // _feeObj.count += 1;
                                        totalObj.confirmOutTime += 1;
                                        item["???????????????"] = 0;
                                    }
                                }
                            );

                            _this.state.data.parent.feedbackInTime.forEach(
                                function (item) {
                                    if (
                                        item["?????????"] === member &&
                                        item["??????"] == 0
                                    ) {
                                        if (_feeObj.name === "")
                                            _feeObj.name = item["????????????"];
                                        _feeObj.feedbackInTime += 1;
                                        // _feeObj.count += 1;
                                        totalObj.feedbackInTime += 1;
                                        if (item["??????"] == 0) {
                                            _feeObj.parentFee2 += 500;
                                            item["???????????????"] += 500;
                                        } else {
                                            item["???????????????"] = 0;
                                        }
                                        item.feedbackInTime = true;
                                    }
                                }
                            );
                            _this.state.data.parent.feedbackOutTime.forEach(
                                function (item) {
                                    if (
                                        item["?????????"] === member &&
                                        item["??????"] == 0
                                    ) {
                                        if (_feeObj.name === "")
                                            _feeObj.name = item["????????????"];
                                        _feeObj.feedbackOutTime += 1;
                                        // _feeObj.count += 1;
                                        totalObj.feedbackOutTime += 1;
                                        item["???????????????"] = 0;
                                    }
                                }
                            );

                            _this.state.data.kim.inTime.forEach(function (item) {
                                // item.kim = false
                                if (
                                    item["?????????"] === member &&
                                    item["??????"] == 0
                                ) {
                                    if (_feeObj.name === "")
                                        _feeObj.name = item["????????????"];
                                    _feeObj.kim += 1;
                                    _feeObj.count += 1;
                                    totalObj.kim += 1;
                                    if (item["??????"] == 0) {
                                        _feeObj.kimFee += 600;
                                        item["?????????"] = 600;
                                    } else {
                                        item["?????????"] = 0;
                                    }
                                    item.kim = true;
                                }
                            });

                            _this.state.data.west.inTime.forEach(function (
                                item
                            ) {
                                // item.kim = false
                                if (
                                    item["?????????"] === member &&
                                    item["??????"] == 0
                                ) {
                                    if (_feeObj.name === "")
                                        _feeObj.name = item["????????????"];
                                    _feeObj.west += 1;
                                    _feeObj.count += 1;
                                    totalObj.west += 1;
                                    if (item["??????"] == 0) {
                                        _feeObj.westFee += 600;
                                        item["?????????"] = 600;
                                    } else {
                                        item["?????????"] = 0;
                                    }
                                    item.west = true;
                                }
                            });

                            _this.state.data.share.inTime.forEach(function (
                                item
                            ) {
                                // item.share = false
                                if (
                                    item["?????????"] === member &&
                                    item["??????"] === 0 &&
                                    item["??????"] == 0
                                ) {
                                    if (_feeObj.name === "")
                                        _feeObj.name = item["????????????"];
                                    _feeObj.count += 1;
                                    if (item["??????"] == 1) {
                                        _feeObj.shareEmergency += 1;
                                        totalObj.shareEmergency += 1;
                                    } else {
                                        _feeObj.share += 1;
                                        totalObj.share += 1;
                                    }
                                    if (item["??????"] == 0) {
                                        _feeObj.shareFee += 600;
                                        item["?????????"] = 3000;
                                    } else {
                                        item["?????????"] = 0;
                                    }
                                    item.share = true;
                                }
                            });
                            _feeObj.total =
                                _feeObj.parentFee +
                                _feeObj.kimFee +
                                _feeObj.westFee +
                                _feeObj.shareFee;
                            _feeObj.total2 =
                                _feeObj.parentFee2 +
                                _feeObj.kimFee +
                                _feeObj.westFee +
                                _feeObj.shareFee;
                            totalObj.parentFee += _feeObj.parentFee;
                            totalObj.parentFee2 += _feeObj.parentFee2;
                            totalObj.kimFee += _feeObj.kimFee;
                            totalObj.westFee += _feeObj.westFee;
                            totalObj.shareFee += _feeObj.shareFee;
                            totalObj.total += _feeObj.total;
                            totalObj.total2 += _feeObj.total2;
                            _this.state.data.member.fee.push(_feeObj);
                        });

                        _this.state.data.member.dev.forEach(function (
                            member,
                            index
                        ) {
                            var _feeObj = $.extend({}, feeObj);

                            _feeObj.member = member;

                            // ???????????? ?????????
                            _this.state.data.parent.except.forEach(function (
                                item
                            ) {
                                // item.dev = false
                                if (
                                    item["?????????"] === member &&
                                    item["??????"] === 0 &&
                                    item["??????"] == 0
                                ) {
                                    if (_feeObj.name === "")
                                        _feeObj.name = item["????????????"];
                                    _feeObj.inTime += 1;
                                    totalObj.inTime += 1;

                                    _feeObj.feedbackInTime += 1;
                                    totalObj.feedbackInTime += 1;

                                    if (item["??????"] == 0) {
                                        _feeObj.parentFee += 1000;
                                        item["?????????"] = 1000;
                                    } else {
                                        item["?????????"] = 0;
                                    }
                                    item.dev = true;
                                }
                            });

                            _this.state.data.parent.inTime.forEach(function (
                                item
                            ) {
                                // item.dev = false
                                if (
                                    item["?????????"] === member &&
                                    item["??????"] === 0 &&
                                    item["??????"] == 0
                                ) {
                                    if (_feeObj.name === "")
                                        _feeObj.name = item["????????????"];
                                    _feeObj.inTime += 1;
                                    totalObj.inTime += 1;

                                    _feeObj.feedbackInTime += 1;
                                    totalObj.feedbackInTime += 1;

                                    if (item["??????"] == 0) {
                                        _feeObj.parentFee += 1000;
                                        item["?????????"] = 1000;
                                    } else {
                                        item["?????????"] = 0;
                                    }
                                    item.dev = true;
                                }
                            });

                            _this.state.data.parent.outTime.forEach(function (
                                item
                            ) {
                                // item.dev = false
                                if (
                                    item["?????????"] === member &&
                                    item["??????"] === 0 &&
                                    item["??????"] == 0
                                ) {
                                    if (_feeObj.name === "")
                                        _feeObj.name = item["????????????"];

                                    _feeObj.inTime += 1;
                                    totalObj.inTime += 1;

                                    _feeObj.feedbackInTime += 1;
                                    totalObj.feedbackInTime += 1;

                                    if (item["??????"] == 0) {
                                        _feeObj.parentFee += 1000;
                                        item["?????????"] = 1000;
                                    } else {
                                        item["?????????"] = 0;
                                    }
                                    item.dev = true;
                                }
                            });

                            _this.state.data.kim.inTime.forEach(function (item) {
                                // item.dev = false
                                if (
                                    item["?????????"] === member &&
                                    item["??????"] === 0 &&
                                    item["??????"] == 0
                                ) {
                                    if (_feeObj.name === "")
                                        _feeObj.name = item["????????????"];
                                    _feeObj.kim += 1;
                                    totalObj.kim += 1;
                                    if (item["??????"] == 0) {
                                        _feeObj.kimFee += 1000;
                                        item["?????????"] = 1000;
                                    } else {
                                        item["?????????"] = 0;
                                    }
                                    item.dev = true;
                                }
                            });

                            _this.state.data.west.inTime.forEach(function (
                                item
                            ) {
                                // item.dev = false
                                if (
                                    item["?????????"] === member &&
                                    item["??????"] === 0 &&
                                    item["??????"] == 0
                                ) {
                                    if (_feeObj.name === "")
                                        _feeObj.name = item["????????????"];
                                    _feeObj.west += 1;
                                    totalObj.west += 1;
                                    if (item["??????"] == 0) {
                                        _feeObj.westFee += 1000;
                                        item["?????????"] = 1000;
                                    } else {
                                        item["?????????"] = 0;
                                    }
                                    item.dev = true;
                                }
                            });

                            _this.state.data.share.inTime.forEach(function (
                                item
                            ) {
                                // item.dev = false
                                if (
                                    item["?????????"] === member &&
                                    item["??????"] === 0 &&
                                    item["??????"] == 0
                                ) {
                                    if (_feeObj.name === "")
                                        _feeObj.name = item["????????????"];

                                    _feeObj.share += 1;
                                    totalObj.share += 1;
                                    if (item["??????"] == 0) {
                                        _feeObj.shareFee += 3000;
                                        item["?????????"] = 3000;
                                    } else {
                                        item["?????????"] = 0;
                                    }
                                    item.dev = true;
                                }
                            });

                            _this.state.data.share.inEmergency.forEach(function (
                                item
                            ) {
                                // item.dev = false
                                if (
                                    item["?????????"] === member &&
                                    item["??????"] === 0 &&
                                    item["??????"] == 0
                                ) {
                                    if (_feeObj.name === "")
                                        _feeObj.name = item["????????????"];

                                    _feeObj.shareEmergency += 1;
                                    totalObj.shareEmergency += 1;
                                    if (item["??????"] == 0) {
                                        _feeObj.shareFee += 5000;
                                        item["?????????"] = 5000;
                                    } else {
                                        item["?????????"] = 0;
                                    }

                                    item.dev = true;
                                }
                            });

                            _feeObj.parentFee2 = _feeObj.parentFee;
                            _feeObj.total =
                                _feeObj.parentFee +
                                _feeObj.kimFee +
                                _feeObj.westFee +
                                _feeObj.shareFee;
                            _feeObj.total2 =
                                _feeObj.parentFee2 +
                                _feeObj.kimFee +
                                _feeObj.westFee +
                                _feeObj.shareFee;
                            totalObj.parentFee += _feeObj.parentFee;
                            totalObj.parentFee2 += _feeObj.parentFee;
                            totalObj.kimFee += _feeObj.kimFee;
                            totalObj.westFee += _feeObj.westFee;
                            totalObj.shareFee += _feeObj.shareFee;
                            totalObj.total += _feeObj.total;
                            totalObj.total2 += _feeObj.total2;
                            _this.state.data.member.fee.push(_feeObj);
                        });

                        feeObj = {
                            area: 0,
                            name: "",
                            normal: 0,
                            normalFee: 0,
                            emergency: 0,
                            emergencyFee: 0,
                            total: 0
                        };

                        var areaTotalObj = $.extend({}, feeObj);
                        areaTotalObj.area = 999;
                        areaTotalObj.name = "??????";

                        _this.state.data.member.area.forEach(function (
                            area,
                            index
                        ) {
                            var _feeObj = $.extend({}, feeObj);

                            _feeObj.area = area;

                            originData.forEach(function (item) {
                                if (
                                    item["????????????"] !== item["???????????????"] &&
                                    area === item["????????????"] &&
                                    item["??????"] === 0 &&
                                    item["??????"] == 0
                                ) {
                                    if (_feeObj.name === "")
                                        _feeObj.name = item["??????"];
                                    if (item["??????"] === 0) {
                                        _feeObj.normal += 1;
                                        _feeObj.normalFee += 3000;
                                        _feeObj.total += 3000;
                                        areaTotalObj.normal += 1;
                                        areaTotalObj.normalFee += 3000;
                                        areaTotalObj.total += 3000;
                                    } else {
                                        _feeObj.emergency += 1;
                                        _feeObj.emergencyFee += 5000;
                                        _feeObj.total += 5000;
                                        areaTotalObj.emergency += 1;
                                        areaTotalObj.emergencyFee += 5000;
                                        areaTotalObj.total += 5000;
                                    }
                                }
                            });
                            if (_feeObj.name !== "") {
                                _this.state.data.member.areaFee.push(_feeObj);
                            }
                        });

                        console.log(_this.state.data.member.fee);

                        resolve({
                            memberTotal: totalObj,
                            areaTotal: areaTotalObj
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            },
            render: function (total) {
                return new Promise(function (resolve, reject) {
                    try {
                        var $TABLE = _this.el.$MEMBERTABLE;
                        $TABLE.empty();

                        _this.el.$MEMBERPICKER.find("option").remove();
                        _this.el.$MEMBERPICKER.selectpicker("refresh");
                        _this.el.$AREAPICKER.find("option").remove();
                        _this.el.$AREAPICKER.selectpicker("refresh");

                        _this.state.data.member.qc.forEach(function (
                            member,
                            index
                        ) {
                            addRow(member, index, "member-qc");
                        });

                        _this.state.data.member.dev.forEach(function (
                            member,
                            index
                        ) {
                            addRow(member, index, "member-dev");
                        });

                        addRow(999, 0, "fee-total");

                        _this.state.data.member.fee.forEach(function (item) {
                            addItem(item);
                        });

                        addItem(total.memberTotal);

                        function addRow(id, index, className) {
                            $TABLE.append(
                                '<tr class="' +
                                className +
                                '" data-member="' +
                                id +
                                '" data-index="' +
                                index +
                                '"></tr>'
                            );
                        }

                        function addItem(item) {
                            var $ROW = $TABLE.find(
                                '[data-member="' + item.member + '"]'
                            );
                            // if (!$ROW.find('td.member-name').length) {
                            $ROW.append(
                                '<td class="text-right">' + item.name + "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent">' +
                                (item.except === 0 ? "-" : item.except) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent">' +
                                (item.inTime === 0 ? "-" : item.inTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent">' +
                                (item.outTime === 0 ? "-" : item.outTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent fee-parent-fee">' +
                                (item.parentFee === 0
                                    ? "-"
                                    : item.parentFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-kim">' +
                                (item.kim === 0 ? "-" : item.kim) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-kim fee-kim-fee">' +
                                (item.kimFee === 0
                                    ? "-"
                                    : item.kimFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-share">' +
                                (item.share === 0 ? "-" : item.share) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-share">' +
                                (item.shareEmergency === 0
                                    ? "-"
                                    : item.shareEmergency) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-share fee-share-fee">' +
                                (item.shareFee === 0
                                    ? "-"
                                    : item.shareFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-total">' +
                                (item.total === 0
                                    ? "-"
                                    : item.total.toLocaleString()) +
                                "</td>"
                            );
                            if ($ROW.hasClass("member-qc")) {
                                $ROW.append(
                                    '<td class="text-right fee-count">' +
                                    item.count +
                                    "</td>"
                                );
                            } else {
                                $ROW.append(
                                    '<td class="text-right fee-count">-</td>'
                                );
                            }
                            // }

                            if (item.member !== 999) {
                                if ($ROW.hasClass("member-dev")) {
                                    addOption(
                                        item,
                                        "?????????",
                                        _this.el.$MEMBERPICKER
                                    );
                                } else {
                                    addOption(
                                        item,
                                        "QC&?????????",
                                        _this.el.$MEMBERPICKER
                                    );
                                }
                            }
                        }

                        $TABLE = _this.el.$AREATABLE;
                        $TABLE.empty();

                        _this.state.data.member.area.forEach(function (
                            area,
                            index
                        ) {
                            addRow(area, index, "member-area");
                        });

                        addRow(999, 0, "fee-total");

                        _this.state.data.member.areaFee.forEach(function (item) {
                            addAreaItem(item);
                        });

                        addAreaItem(total.areaTotal);
                        addOption(
                            {
                                area: "0000",
                                name: "??? ???"
                            },
                            "",
                            _this.el.$AREAPICKER,
                            true
                        );

                        // function addAraeRow(id, index, className) {
                        //     $TABLE.append('<tr class="' + className + '" data-member="' + id + '" data-index="' + index + '"></tr>')
                        // }

                        function addAreaItem(item) {
                            var $ROW = $TABLE.find(
                                '[data-member="' + item.area + '"]'
                            );
                            // if (!$ROW.find('td.member-name').length) {
                            $ROW.append(
                                '<td class="text-right">' + item.name + "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right">' +
                                (item.normal === 0 ? "-" : item.normal) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-normal">' +
                                (item.normalFee === 0
                                    ? "-"
                                    : item.normalFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right">' +
                                (item.emergency === 0
                                    ? "-"
                                    : item.emergency) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-emergency">' +
                                (item.emergencyFee === 0
                                    ? "-"
                                    : item.emergencyFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-total">' +
                                (item.total === 0
                                    ? "-"
                                    : item.total.toLocaleString()) +
                                "</td>"
                            );
                            // }

                            if (item.area !== 999) {
                                addOption(item, "", _this.el.$AREAPICKER);
                            }
                        }

                        function addOption(option, groupName, el, isPrepend) {
                            if (groupName) {
                                var optGroup = el.find(
                                    'optgroup[label="' + groupName + '"]'
                                );
                                if (
                                    !optGroup.find(
                                        'option[value="' + option.member + '"]'
                                    ).length
                                ) {
                                    optGroup.append(
                                        '<option value="' +
                                        option.member +
                                        '">' +
                                        option.name +
                                        "</option>"
                                    );
                                    el.selectpicker("refresh");
                                }
                            } else {
                                if (isPrepend) {
                                    el.prepend(
                                        '<option value="' +
                                        option.area +
                                        '">' +
                                        option.name +
                                        "</option>"
                                    );
                                } else {
                                    el.append(
                                        '<option value="' +
                                        option.area +
                                        '">' +
                                        option.name +
                                        "</option>"
                                    );
                                }
                                el.selectpicker("refresh");
                            }
                        }

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            },
            render2: function (total) {
                return new Promise(function (resolve, reject) {
                    try {
                        var $TABLE = _this.el.$MEMBERTABLE2;
                        $TABLE.empty();

                        _this.state.data.member.qc.forEach(function (
                            member,
                            index
                        ) {
                            addRow(member, index, "member-qc");
                        });

                        _this.state.data.member.dev.forEach(function (
                            member,
                            index
                        ) {
                            addRow(member, index, "member-dev");
                        });

                        addRow(999, 0, "fee-total");

                        _this.state.data.member.fee.forEach(function (item) {
                            addItem(item);
                        });

                        addItem(total.memberTotal);

                        function addRow(id, index, className) {
                            $TABLE.append(
                                '<tr class="' +
                                className +
                                '" data-member="' +
                                id +
                                '" data-index="' +
                                index +
                                '"></tr>'
                            );
                        }

                        function addItem(item) {
                            var $ROW = $TABLE.find(
                                '[data-member="' + item.member + '"]'
                            );

                            // if (!$ROW.find('td.member-name').length) {
                            $ROW.append(
                                '<td class="text-right">' + item.name + "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent">' +
                                (item.except === 0 ? "-" : item.except) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent">' +
                                (item.confirmInTime === 0
                                    ? "-"
                                    : item.confirmInTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent">' +
                                (item.confirmOutTime === 0
                                    ? "-"
                                    : item.confirmOutTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent">' +
                                (item.feedbackInTime === 0
                                    ? "-"
                                    : item.feedbackInTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent">' +
                                (item.feedbackOutTime === 0
                                    ? "-"
                                    : item.feedbackOutTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent fee-parent-fee">' +
                                (item.parentFee2 === 0
                                    ? "-"
                                    : item.parentFee2.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-kim">' +
                                (item.kim === 0 ? "-" : item.kim) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-kim fee-kim-fee">' +
                                (item.kimFee === 0
                                    ? "-"
                                    : item.kimFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-west">' +
                                (item.west === 0 ? "-" : item.west) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-west fee-west-fee">' +
                                (item.westFee === 0
                                    ? "-"
                                    : item.westFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-share">' +
                                (item.share === 0 ? "-" : item.share) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-share">' +
                                (item.shareEmergency === 0
                                    ? "-"
                                    : item.shareEmergency) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-share fee-share-fee">' +
                                (item.shareFee === 0
                                    ? "-"
                                    : item.shareFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-total">' +
                                (item.total2 === 0
                                    ? "-"
                                    : item.total2.toLocaleString()) +
                                "</td>"
                            );
                            // if ($ROW.hasClass('member-qc')) {
                            //     $ROW.append('<td class="text-right fee-count">' + item.count + '</td>')
                            // } else {
                            //     $ROW.append('<td class="text-right fee-count">-</td>')
                            // }
                            // }

                            // if (item.member !== 999) {

                            //     if ($ROW.hasClass('member-dev')) {
                            //         addOption(item, '?????????', _this.el.$MEMBERPICKER)
                            //     } else {
                            //         addOption(item, 'QC&?????????', _this.el.$MEMBERPICKER)
                            //     }
                            // }
                        }

                        // function addOption(option, groupName, el, isPrepend) {
                        //     if (groupName) {
                        //         var optGroup = el.find('optgroup[label="' + groupName + '"]')
                        //         if (!optGroup.find('option[value="' + option.member + '"]').length) {
                        //             optGroup.append('<option value="' + option.member + '">' + option.name + '</option>')
                        //             el.selectpicker('refresh')
                        //         }
                        //     } else {
                        //         if (isPrepend) {
                        //             el.prepend('<option value="' + option.area + '">' + option.name + '</option>')
                        //         } else {
                        //             el.append('<option value="' + option.area + '">' + option.name + '</option>')
                        //         }
                        //         el.selectpicker('refresh')
                        //     }
                        // }

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            },
            render3: function (total) {
                return new Promise(function (resolve, reject) {
                    try {
                        var $TABLE = _this.el.$MEMBERTABLE3; //tbody
                        var $TABLEHEAD = $TABLE.parent().find("thead");

                        $TABLEHEAD.find("th:eq(2)").html(
                            $TABLEHEAD
                                .find("th:eq(2)")
                                .html()
                                .replace("45", "30")
                                .trim()
                        );
                        $TABLEHEAD.find("th:eq(3)").html(
                            $TABLEHEAD
                                .find("th:eq(3)")
                                .html()
                                .replace("45", "30")
                                .trim()
                        );

                        $TABLE.empty();

                        _this.el.$MEMBERPICKER.find("option").remove();
                        _this.el.$MEMBERPICKER.selectpicker("refresh");
                        _this.el.$AREAPICKER.find("option").remove();
                        _this.el.$AREAPICKER.selectpicker("refresh");

                        _this.state.data.member.qc.forEach(function (
                            member,
                            index
                        ) {
                            addRow(member, index, "member-qc");
                        });

                        _this.state.data.member.dev.forEach(function (
                            member,
                            index
                        ) {
                            addRow(member, index, "member-dev");
                        });

                        addRow(999, 0, "fee-total");

                        _this.state.data.member.fee.forEach(function (item) {
                            addItem(item);
                        });

                        addItem(total.memberTotal);

                        function addRow(id, index, className) {
                            $TABLE.append(
                                '<tr class="' +
                                className +
                                '" data-member="' +
                                id +
                                '" data-index="' +
                                index +
                                '"></tr>'
                            );
                        }

                        function addItem(item) {
                            var $ROW = $TABLE.find(
                                '[data-member="' + item.member + '"]'
                            );
                            // if (!$ROW.find('td.member-name').length) {
                            $ROW.append(
                                '<td class="text-right">' + item.name + "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent">' +
                                (item.except === 0 ? "-" : item.except) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent">' +
                                (item.inTime === 0 ? "-" : item.inTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent">' +
                                (item.outTime === 0 ? "-" : item.outTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent fee-parent-fee">' +
                                (item.parentFee === 0
                                    ? "-"
                                    : item.parentFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-kim">' +
                                (item.kim === 0 ? "-" : item.kim) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-kim fee-kim-fee">' +
                                (item.kimFee === 0
                                    ? "-"
                                    : item.kimFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-west">' +
                                (item.west === 0 ? "-" : item.west) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-west fee-west-fee">' +
                                (item.westFee === 0
                                    ? "-"
                                    : item.westFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-share">' +
                                (item.share === 0 ? "-" : item.share) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-share">' +
                                (item.shareEmergency === 0
                                    ? "-"
                                    : item.shareEmergency) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-share fee-share-fee">' +
                                (item.shareFee === 0
                                    ? "-"
                                    : item.shareFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-total">' +
                                (item.total === 0
                                    ? "-"
                                    : item.total.toLocaleString()) +
                                "</td>"
                            );
                            if ($ROW.hasClass("member-qc")) {
                                $ROW.append(
                                    '<td class="text-right fee-count">' +
                                    item.count +
                                    "</td>"
                                );
                            } else {
                                $ROW.append(
                                    '<td class="text-right fee-count">-</td>'
                                );
                            }
                            // }

                            if (item.member !== 999) {
                                if ($ROW.hasClass("member-dev")) {
                                    addOption(
                                        item,
                                        "?????????",
                                        _this.el.$MEMBERPICKER
                                    );
                                } else {
                                    addOption(
                                        item,
                                        "QC&?????????",
                                        _this.el.$MEMBERPICKER
                                    );
                                }
                            }
                        }

                        $TABLE = _this.el.$AREATABLE;
                        $TABLE.empty();

                        _this.state.data.member.area.forEach(function (
                            area,
                            index
                        ) {
                            addRow(area, index, "member-area");
                        });

                        addRow(999, 0, "fee-total");

                        _this.state.data.member.areaFee.forEach(function (item) {
                            addAreaItem(item);
                        });

                        addAreaItem(total.areaTotal);
                        addOption(
                            {
                                area: "0000",
                                name: "??? ???"
                            },
                            "",
                            _this.el.$AREAPICKER,
                            true
                        );

                        // function addAraeRow(id, index, className) {
                        //     $TABLE.append('<tr class="' + className + '" data-member="' + id + '" data-index="' + index + '"></tr>')
                        // }

                        function addAreaItem(item) {
                            var $ROW = $TABLE.find(
                                '[data-member="' + item.area + '"]'
                            );
                            // if (!$ROW.find('td.member-name').length) {
                            $ROW.append(
                                '<td class="text-right">' + item.name + "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right">' +
                                (item.normal === 0 ? "-" : item.normal) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-normal">' +
                                (item.normalFee === 0
                                    ? "-"
                                    : item.normalFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right">' +
                                (item.emergency === 0
                                    ? "-"
                                    : item.emergency) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-emergency">' +
                                (item.emergencyFee === 0
                                    ? "-"
                                    : item.emergencyFee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-total">' +
                                (item.total === 0
                                    ? "-"
                                    : item.total.toLocaleString()) +
                                "</td>"
                            );
                            // }

                            if (item.area !== 999) {
                                addOption(item, "", _this.el.$AREAPICKER);
                            }
                        }

                        function addOption(option, groupName, el, isPrepend) {
                            if (groupName) {
                                var optGroup = el.find(
                                    'optgroup[label="' + groupName + '"]'
                                );
                                if (
                                    !optGroup.find(
                                        'option[value="' + option.member + '"]'
                                    ).length
                                ) {
                                    optGroup.append(
                                        '<option value="' +
                                        option.member +
                                        '">' +
                                        option.name +
                                        "</option>"
                                    );
                                    el.selectpicker("refresh");
                                }
                            } else {
                                if (isPrepend) {
                                    el.prepend(
                                        '<option value="' +
                                        option.area +
                                        '">' +
                                        option.name +
                                        "</option>"
                                    );
                                } else {
                                    el.append(
                                        '<option value="' +
                                        option.area +
                                        '">' +
                                        option.name +
                                        "</option>"
                                    );
                                }
                                el.selectpicker("refresh");
                            }
                        }

                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            },
            renderList: function (data, unfee) {
                var $TABLE = _this.el.$FEETABLE;
                var rowNumber = 0,
                    sumFee = 0;
                $TABLE.empty();

                data.forEach(function (item, index) {
                    addRow(item, index);
                });

                $TABLE.append(
                    '<tr class="bg-navy">' +
                    "    <th>" +
                    rowNumber +
                    "???</th>" +
                    '    <th colspan="12"></th>' +
                    "    <th>" +
                    sumFee.toLocaleString() +
                    "???</th>" +
                    "</tr>"
                );

                $('[data-toggle="tooltip"]').tooltip({
                    placement: "left",
                    html: true,
                    container: ".fee-list"
                });

                $TABLE
                    .find("input:checkbox")
                    .iCheck({
                        checkboxClass: "icheckbox_flat-orange",
                        radioClass: "iradio_flat-orange"
                    })
                    .bind("ifChecked ifUnchecked", function (event) {
                        var $THIS = $(this);
                        var _index = $THIS.data("index");
                        data[_index]["??????"] =
                            data[_index]["??????"] == 0 ? 1 : 0;
                        if (data[_index]["??????"] == 1) {
                            $THIS.closest("tr").addClass("bg-danger");
                        } else {
                            $THIS.closest("tr").removeClass("bg-danger");
                        }
                        _this.actions.update(data[_index]);
                    });

                function addRow(item, index) {
                    if (item["?????????"] <= 0 && unfee && item["??????"] == 0)
                        return;
                    rowNumber += 1;
                    sumFee += parseInt(item["?????????"]);

                    // var isParent, isKim, isInTime, isDev

                    // isParent = item['????????????'].match(/0000|0030|0031|0026/gim)
                    // isKim = item['????????????'] == '0034'
                    // isInTime = isParent ? moment(item['????????????']).diff(item['????????????'], 'minutes') < 45 : false
                    // isDev = isParent ? (item['??????'] == 3 && item['?????????'] !== 18) || item['?????????'] === 149 : false

                    /**
                     * ?????? AS??????
                     * QC??? ????????? ?????????
                     * ????????? 45??? ?????????
                     * ????????? ?????? ??????
                     *
                     */
                    var timeClass = "",
                        timeTooltip = "",
                        devClass = "",
                        devTooltip = "",
                        areaClass = "",
                        areaTooltip = "",
                        kimClass = "",
                        kimTooltip = "";
                    if (item.except) {
                        timeClass = "bg-blue-sky";
                        timeTooltip =
                            'data-toggle="tooltip" data-placement="top" title="" data-original-title="??????????????? ????????? A/S"';
                    } else if (item.inTime) {
                        timeClass = "bg-green";
                        timeTooltip =
                            'data-toggle="tooltip" data-placement="top" title="" data-original-title="45?????? ????????? A/S"';
                    }

                    if (item.dev) {
                        devClass = "bg-green";
                        devTooltip =
                            'data-toggle="tooltip" data-placement="top" title="" data-original-title="??????????????? ????????? A/S"';
                    }

                    if (item.share) {
                        areaClass = "bg-green";
                        areaTooltip =
                            'data-toggle="tooltip" data-placement="top" title="" data-original-title="???????????? ????????? A/S(?????????X)"';
                    }

                    if (item.kim) {
                        kimClass = "bg-green";
                        kimTooltip =
                            'data-toggle="tooltip" data-placement="top" title="" data-original-title="????????? ?????? A/S"';
                    }

                    var complain = "";
                    if (item["??????"] == "") {
                        complain =
                            '<input type="checkbox" data-index="' +
                            index +
                            '" ' +
                            (item["??????"] == 1 ? "checked" : "") +
                            ">";
                    } else {
                        complain =
                            item["??????"] == 1
                                ? '<i class="fa fa-check"></i>'
                                : "";
                    }

                    $TABLE.append(
                        '<tr class="' +
                        (item["??????"] == 1 ? "bg-danger" : "") +
                        '">' +
                        "    <th>" +
                        rowNumber +
                        "</th>" +
                        "    <td>" +
                        item["?????????"] +
                        "</td>" +
                        "    <td>" +
                        item["????????????"] +
                        "</td>" +
                        '    <td><a href="javascript:Fee.actions.showServiceDetailModal(' +
                        item["?????????"] +
                        ')">' +
                        item["????????????"] +
                        "</a></td>" +
                        '    <td class="' +
                        areaClass +
                        " " +
                        kimClass +
                        '" ' +
                        areaTooltip +
                        " " +
                        kimTooltip +
                        ">" +
                        item["??????"] +
                        "</td>" +
                        '    <td class="' +
                        timeClass +
                        '" ' +
                        timeTooltip +
                        ">" +
                        item["????????????"] +
                        "</td>" +
                        '    <td class="' +
                        timeClass +
                        '" ' +
                        timeTooltip +
                        ">" +
                        item["????????????"] +
                        "</td>" +
                        '    <td class="' +
                        timeClass +
                        '" ' +
                        timeTooltip +
                        ">" +
                        item["????????????"] +
                        "(" +
                        moment(item["????????????"]).diff(
                            item["????????????"],
                            "minutes"
                        ) +
                        ")</td>" +
                        "    <td>" +
                        item["????????????"] +
                        "</td>" +
                        "    <td>" +
                        item["????????????"] +
                        "</td>" +
                        '    <td class="' +
                        devClass +
                        '" ' +
                        devTooltip +
                        ">" +
                        item["????????????"] +
                        "</td>" +
                        "    <td>" +
                        (item["??????"] == 1
                            ? '<i class="fa fa-check"></i>'
                            : "") +
                        "</td>" +
                        "    <td>" +
                        (item["??????"] == 1
                            ? '<i class="fa fa-check"></i>'
                            : "") +
                        "</td>" +
                        "    <td>" +
                        complain +
                        "</td>" +
                        "    <td>" +
                        (item["?????????"] > 0
                            ? item["?????????"].toLocaleString()
                            : "-") +
                        "</td>" +
                        "<td>" + item['??????'] + "</td>" +
                        "</tr>"
                    );
                }
            },
            showServiceDetailModal: function (id) {
                // console.log(id)
                var $modal = $(".detail-modal");
                var $el = $modal.find("#service-detail");
                // var detailUrl = "/service/history/detail?index={{INDEX}}&id={{USERID}}&hospnum={{HOSPNUM}}"
                var target = _this.state.data.origin.find(function (item) {
                    return item["?????????"] === id;
                });
                var detailData = {
                    service: {},
                    replys: []
                };

                $el.empty();

                loadDetail(target);

                // detailUrl = detailUrl.replace('{{INDEX}}', id)
                // detailUrl = detailUrl.replace('{{USERID}}', target['USER_ID'])
                // detailUrl = detailUrl.replace('{{HOSPNUM}}', target['????????????'])

                // $modal.find('iframe').attr('src', detailUrl)
                // $modal.modal('show')
                function loadDetail(item) {
                    axios
                        .get(API.SERVICE.DETAIL, {
                            params: {
                                index: item["?????????"],
                                id: item["USER_ID"],
                                hospnum: item["????????????"]
                            }
                        })
                        .then(function (result) {
                            detailData.service = result.data[0][0] || {};
                            detailData.replys = result.data[1] || [];
                            $modal
                                .find("#service-title")
                                .text(
                                    "[" +
                                    item["?????????"] +
                                    "] " +
                                    item["????????????"]
                                );
                            workflowRender();
                            serviceRender();
                            replysRender();
                            $modal.modal("show");
                        });
                }

                function workflowRender() {
                    var service = detailData.service;
                    // var $el = _this.el.$service;
                    var $WORKFLOW = "";
                    $WORKFLOW += "<div>";

                    if (service["??????"] >= CONSTS.SERVICE_STATUS.ACCEPT) {
                        $WORKFLOW += " <b>?????????:</b> " + service["?????????"];
                        $WORKFLOW +=
                            " <b>?????????:</b> " +
                            service["?????????"] +
                            (service["????????????"]
                                ? "(??????: " + service["????????????"] + ")"
                                : "");
                        $WORKFLOW +=
                            ' <b>?????????:</b> <span class="red">' +
                            moment(service["????????????"]).calendar() +
                            "(" +
                            moment(service["????????????"]).fromNow() +
                            ")</span>";
                    }

                    if (service["?????????"] !== 0) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>?????????:</b> <b class="blue">' +
                            service["????????????"] +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>?????????:</b><span class="red">' +
                            service["????????????"] +
                            "</span>";
                    }

                    if (
                        service["??????"] >= CONSTS.SERVICE_STATUS.SHARE &&
                        service["?????????"] !== 0
                    ) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>?????????:</b> <b class="blue">' +
                            (service["?????????"] !== 0
                                ? service["????????????"]
                                : Data.Service.info["??????"] || "") +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>?????????:</b><span class="red">' +
                            (service["?????????"] !== 0
                                ? moment(service["????????????"]).calendar()
                                : "15??? ????????????") +
                            "(" +
                            moment(service["????????????"]).fromNow() +
                            ")</span>";
                    }

                    if (
                        service["??????"] >= CONSTS.SERVICE_STATUS.PROCESS &&
                        service["?????????"] !== 0
                    ) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>?????????:</b> <b class="blue">' +
                            service["????????????"] +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>?????????:</b><span class="red">' +
                            moment(service["????????????"]).calendar() +
                            "(" +
                            moment(service["????????????"]).fromNow() +
                            ")</span>";
                    }

                    if (
                        service["??????"] >= CONSTS.SERVICE_STATUS.HOLD &&
                        service["?????????"] !== 0
                    ) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>?????????:</b> <b class="blue">' +
                            service["????????????"] +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>?????????:</b><span class="red">' +
                            moment(service["????????????"]).calendar() +
                            "(" +
                            moment(service["????????????"]).fromNow() +
                            ")</span>";
                    }

                    if (
                        service["??????"] >= CONSTS.SERVICE_STATUS.DONE &&
                        service["?????????"] !== 0
                    ) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>?????????:</b> <b class="blue">' +
                            service["????????????"] +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>?????????:</b><span class="red">' +
                            moment(service["????????????"]).calendar() +
                            "(" +
                            moment(service["????????????"]).fromNow() +
                            ")</span>";
                    }

                    if (service["??????"] === 1) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            '<span class="badge bg-red">?????? A/S</span>';
                    }
                    if (service["??????"] === 1) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            '<span class="badge bg-blue">?????? A/S</span>';
                    }

                    $WORKFLOW += '<div class="ln_solid"></div>';
                    $WORKFLOW += "<b>????????????:</b> " + service["????????????"];
                    $WORKFLOW += "<br>";
                    $WORKFLOW +=
                        '<b class="red">??????/??????: ' +
                        service["????????????"] +
                        " - " +
                        service["????????????"] +
                        "</b>";
                    // $WORKFLOW += '<br>';
                    // $WORKFLOW += '<b>?????????:</b> ' + service['????????????'];

                    $WORKFLOW += "</div>";

                    $el.append($WORKFLOW);
                }

                function serviceRender() {
                    var service = detailData.service;
                    // var $el = _this.el.$service;
                    var images =
                        service["?????????"].trim().length > 0
                            ? service["?????????"].split(",")
                            : null;

                    var $COMMENT = "",
                        $DIVIDELINE = '<div class="ln_solid"></div>',
                        $QUESTION_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-question-circle orange"></i> ????????????</h5>',
                        $QUESTION_READ =
                            exports.fn.urlify(
                                service["????????????"].replace(/\n/gim, "<br>")
                            ) || " - ",
                        $CONFIRM_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-info-circle blue"></i> ????????????</h5>',
                        $CONFIRM_READ =
                            exports.fn.urlify(
                                service["????????????"].replace(/\n/gim, "<br>")
                            ) || " - ",
                        $HOLD_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-pause-circle"></i> ????????????</h5>',
                        $HOLD_READ =
                            exports.fn.urlify(
                                service["????????????"].replace(/\n/gim, "<br>")
                            ) || " - ",
                        $PROCESS_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-check-circle green"></i> ????????????</h5>',
                        $PROCESS_READ =
                            (service["????????????"] > 0
                                ? '<h5 class="font-bold blue">????????????: ' +
                                params.setting.service["????????????"][
                                service["????????????"] - 1
                                ]["?????????"] +
                                "</h5>"
                                : "") +
                            exports.fn.urlify(
                                service["????????????"].replace(/\n/gim, "<br>")
                            ) || " - ",
                        $CANCEL_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-times-circle red"></i> ????????????</h5>',
                        $CANCEL_READ =
                            exports.fn.urlify(
                                service["????????????"].replace(/\n/gim, "<br>")
                            ) || " - ";
                    //     $TAG_TITLE = '<h5 class="font-bold"><i class="fa fa-tag"> ??????</i></h5>';

                    // var tags = service['??????'].length ? service['??????'].split('||') : [];
                    // var $TAG = '';
                    // if (tags.length) {
                    //     tags.forEach(function (tag) {
                    //         $TAG += '<div class="chip">#' + tag + '</div>'
                    //     });
                    // }

                    $COMMENT +=
                        $DIVIDELINE +
                        $QUESTION_TITLE +
                        $QUESTION_READ +
                        $DIVIDELINE +
                        $CONFIRM_TITLE +
                        $CONFIRM_READ +
                        $DIVIDELINE +
                        $PROCESS_TITLE +
                        $PROCESS_READ +
                        $DIVIDELINE +
                        $HOLD_TITLE +
                        $HOLD_READ +
                        $DIVIDELINE +
                        $CANCEL_TITLE +
                        $CANCEL_READ;
                    // $DIVIDELINE + $TAG_TITLE + $TAG;

                    $el.append($COMMENT);
                }

                function replysRender() {
                    var replys = detailData.replys;
                    // var $el = _this.el.$replys;
                    var $REPLYS = "";
                    $REPLYS += '    <ul class="messages">';
                    replys.forEach(function (reply) {
                        $REPLYS += "<li>";
                        $REPLYS += '    <div class="message_date">';
                        $REPLYS +=
                            '        <p class="month">' +
                            moment(reply["????????????"]).fromNow() +
                            "</p>";
                        $REPLYS += "    </div>";
                        $REPLYS +=
                            '    <div class="message_wrapper m-l-none m-r-none">';
                        $REPLYS +=
                            '        <h5 class="heading blue"><i class="fa fa-user-circle"></i> ' +
                            reply["????????????"] +
                            "</h5>";
                        $REPLYS +=
                            '        <p class="url">' +
                            exports.fn.urlify(reply["??????"]) +
                            "</p>";
                        $REPLYS += "    </div>";
                        $REPLYS += "</li>";
                    });
                    $REPLYS += "    </ul>";
                    $el.append($REPLYS);
                }
            },
            update: function (data) {
                axios
                    .put(API.STATIC.FEE, data)
                    .then(function (result) {
                        _this.el.$FEEREFRESH.trigger("click");
                        // return new PNotify({
                        //     title: '?????????????????????.',
                        //     text: '????????? ????????? [?????????]????????? ????????? ??????????????????.',
                        //     type: 'success'
                        // });
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                    });
            },
            feeLock: function () {
                axios
                    .post(API.STATIC.FEE, {
                        endMonth: _this.state.month, //moment(_this.state.datePicker.value.start).format('YYYY-MM'),
                        lockType: CONSTS.ASFEELOCKTYPE.MIN30
                    })
                    .then(function (result) {
                        _this.el.$AREAPICKER.val("");
                        _this.el.$MEMBERPICKER.val("");
                        _this.el.$AREAPICKER.selectpicker("refresh");
                        _this.el.$MEMBERPICKER.selectpicker("refresh");
                        _this.el.$FEETABLE.empty();
                        _this.el.$FEEREFRESH.trigger("click");
                        // return new PNotify({
                        //     title: '?????????????????????.',
                        //     text: '????????? ????????? [?????????]????????? ????????? ??????????????????.',
                        //     type: 'success'
                        // });
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                    });
            }
        };

        _this.state = state;
        _this.el = el;
        _this.actions = actions;

        return _instance;
    };

    exports.Fee = new Fee();
    exports.Fee.actions.initialize();
})(window);
