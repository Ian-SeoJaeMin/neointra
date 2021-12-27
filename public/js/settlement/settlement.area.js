(function (exports) {
    "use strict";

    var Settlement = function () {
        var _instance = null,
            _this = this;

        Settlement = function () {
            return _instance;
        };

        Settlement.prototype = this;
        _instance = new Settlement();
        _instance.constructor = Settlement();

        var isLoaded = false;
        var isAdmin =
            params.user["인덱스"] == 5 || params.user["인덱스"] == 43
                ? false
                : true;

        var $areaDatePicker = $(".datepicker.area");
        var $staticDatePicker = $(".datepicker.static");
        var $areaSelect = $(".areas");
        var $excelExport = $("#export");
        var $payment = $("#payment");
        var $closed = $("#closed");
        var $staticList = $("#static-body");

        var areaMaster = {
            "0013": 31260,
            "0007": 27667,
            "0009": 31260,
            "0023": 30960,
            "0017": 37420,
            "0025": 37420,
            "0019": 31260,
            "0021": 34040, //울산
            "0012": 31260,
            "0010": 39500,
            "0028": 30960
        };

        var options = sessionStorage.getItem("settlement_areaOption")
            ? JSON.parse(sessionStorage.getItem("settlement_areaOption"))
            : {
                date: {
                    start: moment()
                        .startOf("month")
                        .format("YYYY-MM-DD"),
                    end: moment()
                        .endOf("month")
                        .format("YYYY-MM-DD"),
                    misu: moment().format("YYYY-MM-DD") //moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
                },
                area:
                    params.user["지사코드"] === "0000"
                        ? ""
                        : params.user["지사코드"]
            };

        // var settlements = null;
        _this.settlementSum = {
            유지보수금액: 0,
            월입금: 0,
            유지보수: 0,
            관리수당: 0,
            미수금: 0
        };

        _this.options = options;
        _this.settlements = null;

        if (!isAdmin) {
            // _this.el.$ADDROW.hide();
            $closed.hide();
        } else {
            $closed.bind("click", function (event) {
                if (_this.options.area === "") {
                    return new PNotify({
                        title: "지사정산",
                        text: "지사를 선택해주세요.",
                        type: "info"
                    });
                }

                swal({
                    title: "마감하시겠습니까?",
                    text: "작성하신 내용으로 정산마감합니다.",
                    type: "question",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "네"
                })
                    .then(function (result) {
                        CloseSettlement();
                    })
                    .catch(function () {
                        console.log("cancel");
                    });
            });
        }

        $excelExport.bind("click", function (event) {
            event.preventDefault();

            if (options.area === "") {
                return new PNotify({
                    title: "지사정산",
                    text: "지사를 선택해주세요.",
                    type: "info"
                });
            }

            //getting data from our table
            var data_type = "data:application/vnd.ms-excel";
            var table_div = $("table.settlement.wrapper").clone();

            if (options.area !== "0021") {
                table_div.find(".area_0021").remove();
                // table_div.find('#nambu').remove();
            }

            table_div.removeClass("table table-hover").attr("border", 1);
            $(table_div.find(".settlement"))
                .removeClass("table table-hover")
                .attr("border", 1);
            table_div.find("button").remove();
            table_div.find("input").each(function (i, v) {
                $(v)
                    .closest("td")
                    .text(
                        $(v)
                            .val()
                            .trim()
                    );
                $(v).remove();
            });
            table_div
                .find("#emrCount")
                .closest("table")
                .remove();
            table_div.find("textarea").each(function (i, v) {
                $(v)
                    .closest("td")
                    .html(
                        $(v)
                            .val()
                            .replace(/\n/gim, "<br>")
                    );
                $(v).remove();
            });

            var table_html = table_div[0].outerHTML.replace(/ /g, "%20");
            table_html = table_html.replace(/폴라#|메디#|부산#/g, "");
            var a = document.createElement("a");
            a.href = data_type + ", " + table_html;
            a.download =
                "지사정산_" +
                exports.params.areas.find(function (area) {
                    return area["지사코드"] == options.area;
                })["지사명"] +
                "_" +
                options.date.end.substr(0, 7) +
                ".xls";
            a.click();
        });

        $areaDatePicker
            .datetimepicker({
                format: "YYYY년 M월",
                defaultDate: options.date.start || moment().format(),
                showTodayButton: true,
                ignoreReadonly: true,
                keepOpen: true,
                viewMode: "months"
            })
            .bind("dp.change", function (event) {
                options.date.start = event.date
                    .startOf("month")
                    .format("YYYY-MM-DD");
                options.date.end = event.date
                    .endOf("month")
                    .format("YYYY-MM-DD");
                options.date.misu = event.date.format("YYYY-MM-DD"); //event.date.subtract(1, 'month').endOf('month').format('YYYY-MM-DD');

                if (options.area === "") {
                    new PNotify({
                        title: "지사정산",
                        text: "지사를 선택해주세요.",
                        type: "info"
                    });
                } else {
                    Load();
                }
            });

        $staticDatePicker
            .datetimepicker({
                format: "YYYY년",
                defaultDate: moment().format(),
                showTodayButton: true,
                ignoreReadonly: true,
                keepOpen: true,
                viewMode: "years"
            })
            .bind("dp.change", function (event) {
                LoadStatic(event.date.format("YYYY"));
            });

        exports.fn
            .init_area($areaSelect)
            .then(function () {
                // _this.el.$MONTHPICKER.val(moment(_this.options.date.start).format('YYYY년 M월'));
                // $areaSelect.find('option[value="0000"]').remove()
                $areaSelect.selectpicker("val", []);
                $areaSelect.selectpicker("refresh");
                if (options.area !== "") {
                    $areaSelect.selectpicker("val", options.area);
                    Load();
                }

                isLoaded = true;
            })
            .catch(function (error) {
                fn.errorNotify(error);
            });
        $areaSelect.bind("changed.bs.select", function (event) {
            if (isLoaded) {
                options.area = $(this).selectpicker("val");
                Load();
            }
        });

        $(".nav-tabs a").on("shown.bs.tab", function (event) {
            var x = $(event.target).text(); // active tab
            var y = $(event.relatedTarget).text(); // previous tab
            console.log(event.target, event.relatedTarget);
            if ($(event.target).attr("href") === "#tab-as-static") {
                LoadStatic(moment().format("YYYY"));
            }
        });

        /**
         * 지사정산 부분 시작
         */
        function Load() {
            sessionStorage.setItem(
                "settlement_areaOption",
                JSON.stringify(options)
            );
            axios
                .get(API.SETTLEMENT.AREA, {
                    params: options
                })
                .then(function (result) {
                    _this.settlements = result.data;
                    $payment.empty();

                    if (_this.settlements.closed) {
                        isAdmin =
                            params.user["인덱스"] === 13 ||
                                params.user["인덱스"] === 89
                                ? true
                                : false;
                        // $closed.hide();
                    } else {
                        isAdmin =
                            params.user["인덱스"] == 5 ||
                                params.user["인덱스"] == 43
                                ? false
                                : true;
                    }
                    if (isAdmin) {
                        $closed.show();
                    }

                    _this.settlementSum = {
                        유지보수금액: 0,
                        월입금: 0,
                        유지보수: 0,
                        관리수당: 0,
                        미수금: 0
                    };

                    console.log(_this.settlements);
                    if (options.area === "0021") {
                        var a = null,
                            b = null;
                        $(".area_0021").removeClass("hidden");

                        if (!_this.settlements.closed) {
                            _this.settlements["busan"] = _this.settlements[
                                "cms"
                            ].filter(function (item) {
                                // if (item['기관명칭'].indexOf('이석용') >= 0) {debugger;}
                                return item["기관명칭"].indexOf("부산#") >= 0;
                            });

                            _this.settlements["busan"] = _this.settlements[
                                "busan"
                            ].concat(
                                _this.settlements["account"].filter(function (
                                    item
                                ) {
                                    return (
                                        item["기관명칭"].indexOf("부산#") >= 0
                                    );
                                })
                            );

                            a = _this.settlements["cms"].filter(function (item) {
                                return item["기관명칭"].indexOf("폴라#") >= 0;
                            });

                            b = _this.settlements["account"].filter(function (
                                item
                            ) {
                                return item["기관명칭"].indexOf("폴라#") >= 0;
                            });
                            _this.settlements["polaris"] = a.concat(b);

                            (a = null), (b = null);
                            a = _this.settlements["cms"].filter(function (item) {
                                return item["기관명칭"].indexOf("메디#") >= 0;
                            });

                            b = _this.settlements["account"].filter(function (
                                item
                            ) {
                                return item["기관명칭"].indexOf("메디#") >= 0;
                            });

                            _this.settlements["nambu"] = a.concat(b);

                            // settlements['nambu'] = settlements['cms'].filter(function (item) {
                            //     return item['기관명칭'].indexOf('메디#') >= 0;
                            // });

                            // console.log(settlements['nambu'])

                            // settlements['nambu'].concat(settlements['account'].filter(function (item) {
                            //     return item['기관명칭'].indexOf('메디#') >= 0;
                            // }));
                            // console.log(settlements['nambu'])

                            _this.settlements["cms"] = _this.settlements[
                                "cms"
                            ].filter(function (item) {
                                return (
                                    item["기관명칭"].indexOf("부산#") < 0 &&
                                    item["기관명칭"].indexOf("메디#") < 0 &&
                                    item["기관명칭"].indexOf("폴라#") < 0
                                );
                            });

                            _this.settlements["account"] = _this.settlements[
                                "account"
                            ].filter(function (item) {
                                return (
                                    item["기관명칭"].indexOf("부산#") < 0 &&
                                    item["기관명칭"].indexOf("메디#") < 0 &&
                                    item["기관명칭"].indexOf("폴라#") < 0
                                );
                            });
                        }

                        Render("busan");
                        RenderCMSMinus("busan");
                        Render("nambu");
                        RenderCMSMinus("nambu");
                        Render("polaris");
                        RenderCMSMinus("polaris");
                    } else {
                        // if (_this.options.area === '0034') {
                        //     var row = '';
                        //     row += '<tr class="">';
                        //     row += '    <td class="text-center">지사수금(D)</td>';
                        //     row += '    <td></td>';
                        //     row += '    <td class="text-right">20,000</td>';
                        //     row += '    <td></td>';
                        //     row += '    <td></td>';
                        //     row += '    <td></td>';
                        //     row += '    <td></td>';
                        //     row += '</tr>';
                        //     $payment.append(row);
                        // }
                        $(".area_0021").addClass("hidden");
                    }

                    Render("year_maintaince");
                    Render("cms");
                    RenderCMSMinus("cms");
                    Render("account");
                    RenderPayment();
                    RenderEmrCounter();
                    RenderArea($areaSelect.selectpicker("val"));
                    RenderCMSFee();
                    RenderExtraService();
                    RenderSettlementMemo();
                })
                .catch(function (error) {
                    fn.errorNotify(error);
                });
        }

        function Render(key) {
            var $table = $("#" + key);
            var datas = _this.settlements[key];
            var isUlsan = key === "busan" || key === "nambu";
            // console.log(datas);

            $table.empty();

            if (!datas.length) return;

            var row = "";
            var sum = {
                유지보수금액: 0,
                월입금: 0,
                유지보수: 0,
                관리수당: 0,
                미수금: 0
            };
            datas.forEach(function (item, index) {
                row = _addRow(item, index);
                $table.append(row);

                sum["유지보수금액"] += item["유지보수금액"];
                sum["월입금"] += item["월입금"];

                if (item["관리수당"] > 100) {
                    sum["관리수당"] += item["관리수당"];
                } else if (item["관리수당"] > 0 && item["관리수당"] < 100) {
                    sum["유지보수"] += Math.floor(
                        (item["유지보수금액"] * item["관리수당"]) / 100
                    );
                }
                sum["미수금"] += item["미수금"];

                if (!isUlsan) {
                    _this.settlementSum["유지보수금액"] += item["유지보수금액"];
                    _this.settlementSum["월입금"] += item["월입금"];

                    if (item["관리수당"] > 100) {
                        _this.settlementSum["관리수당"] += item["관리수당"];
                    } else if (item["관리수당"] > 0 && item["관리수당"] < 100) {
                        _this.settlementSum["유지보수"] += Math.floor(
                            (item["유지보수금액"] * item["관리수당"]) / 100
                        );
                    }
                    _this.settlementSum["미수금"] += item["미수금"];
                }
            });

            // if (_this.settlements[key + '-minus']) {
            //     sum['월입금'] -= _this.settlements[key + '-minus'].total;
            // }

            row = "";
            row += '<tr id="' + key + '-total" class="bg-success">';
            row += '    <td class="text-center">합계</td>';
            row += "    <td></td>";
            row += "    <td></td>";
            row += "    <td></td>";
            row += "    <td></td>";
            row +=
                '    <td class="text-right" data-origin-data="' +
                sum["유지보수금액"] +
                '" data-field="유지보수금액">' +
                sum["유지보수금액"].toLocaleString() +
                "</td>";
            row +=
                '    <td class="text-right" data-origin-data="' +
                sum["월입금"] +
                '" data-field="월입금">' +
                sum["월입금"].toLocaleString() +
                "</td>";
            row +=
                '    <td class="text-right" data-origin-data="' +
                sum["유지보수"] +
                '" data-field="유지보수">' +
                sum["유지보수"].toLocaleString() +
                "</td>";
            row +=
                '    <td class="text-right" data-origin-data="' +
                sum["관리수당"] +
                '" data-field="관리수당">' +
                sum["관리수당"].toLocaleString() +
                "</td>";
            row += "    <td></td>";
            row +=
                '    <td class="text-right red">' +
                sum["미수금"].toLocaleString() +
                "</td>";
            row += "    <td></td>";
            row += "    <td></td>";
            row += "</tr>";
            $table.append(row);

            var title = "";
            switch (key) {
                case "year_maintaince":
                    title = "연유지합계(A)";
                    break;
                case "cms":
                    title = "CMS입금합계(B)";
                    break;
                case "account":
                    title = "계좌입금합계(C)";
                    break;
                case "busan":
                case "nambu":
                case "polaris":
                    break;
            }
            if (title !== "") {
                row = "";
                row += '<tr id="' + key + '-payment" class="payment-row">';
                row += '    <td class="text-center">' + title + "</td>";
                // row += '    <td></td>';
                row +=
                    '    <td class="text-right" data-field="유지보수금액" data-origin-data="' +
                    sum["유지보수금액"] +
                    '">' +
                    sum["유지보수금액"].toLocaleString() +
                    "</td>";
                row +=
                    '    <td class="text-right" data-origin-data="' +
                    sum["월입금"] +
                    '" data-field="월입금">' +
                    sum["월입금"].toLocaleString() +
                    "</td>";

                if (
                    _this.options.area === "0006" &&
                    key === "year_maintaince"
                ) {
                    row +=
                        '    <td class="text-right" data-field="유지보수" data-origin-data="' +
                        Math.floor((sum["유지보수"] + sum["관리수당"]) / 12) +
                        '">' +
                        Math.floor(
                            (sum["유지보수"] + sum["관리수당"]) / 12
                        ).toLocaleString() +
                        "</td>";
                } else {
                    row +=
                        '    <td class="text-right" data-field="유지보수" data-origin-data="' +
                        (sum["유지보수"] + sum["관리수당"]) +
                        '">' +
                        (sum["유지보수"] + sum["관리수당"]).toLocaleString() +
                        "</td>";
                }
                // row += '    <td class="text-right">' + sum['관리수당'].toLocaleString() + '</td>';
                // row += '    <td></td>';
                row +=
                    '    <td class="text-right red" data-field="미수금" data-origin-data="' +
                    sum["미수금"] +
                    '">' +
                    sum["미수금"].toLocaleString() +
                    "</td>";
                row += "    <td></td>";
                row += "    <td></td>";
                row += "</tr>";
                $payment.append(row);
            }
            $table
                .bind("keyup", function (event) {
                    event.stopImmediatePropagation();
                    if (event.target.tagName === "INPUT") {
                        var $THIS = $(event.target);
                        if ($THIS.hasClass("cms-" + key + "-minus"))
                            return false;
                        if ($THIS.attr("type") === "number") {
                            var _key = $THIS.data("key");
                            var _index = $THIS.data("index");
                            var _field = $THIS.data("field");
                            var cmsMinus = _this.settlements[
                                _key + "-minus"
                            ] || {
                                count: 0,
                                price: 0,
                                total: 0
                            };
                            _this.settlements[_key][_index][_field] = parseInt(
                                $THIS.val()
                            );

                            var sum = 0;
                            $table
                                .find('input[type="number"]')
                                .each(function (i, v) {
                                    if (
                                        !$(this).hasClass(
                                            "cms-" + key + "-minus"
                                        )
                                    ) {
                                        sum += parseInt($(v).val());
                                    }
                                });
                            sum = sum - cmsMinus.total;
                            $(
                                $table.find(
                                    "#" + key + '-total>td[data-field="월입금"]'
                                )
                            ).text(sum.toLocaleString());
                            $("#" + key + '-payment>td[data-field="월입금"]')
                                .text(sum.toLocaleString())
                                .data("origin-data", sum);
                            RenderPayment();
                            RenderArea(_this.options.area);
                        }
                    }
                })
                .bind("click", function (event) {
                    var $THIS;
                    if (event.target.tagName === "I") {
                        $THIS = $(event.target).parent();
                    } else if (event.target.tagName === "BUTTON") {
                        $THIS = $(event.target);
                    }
                    if ($THIS && $THIS.length) {
                        var memo = $THIS
                            .closest("tr")
                            .find("input.memo")
                            .val()
                            .trim();
                        // if (memo.length) {
                        SaveMemo($THIS.data("hosp"), memo);
                        // }
                    }
                });

            function _addRow(data, index) {
                var row = "";
                row += "<tr>";
                row += '    <td class="text-center">' + (index + 1) + "</td>";
                row +=
                    '    <td class="text-center">' +
                    data["병원구분명칭"] +
                    "</td>";
                row +=
                    '    <td class="text-center">' + data["기관코드"] + "</td>";
                row += "    <td>" + data["기관명칭"] + "</td>";
                row +=
                    '    <td class="text-center">' + data["프로그램"] + "</td>";
                row +=
                    '    <td class="text-right">' +
                    data["유지보수금액"].toLocaleString() +
                    "</td>";
                if (isAdmin) {
                    row +=
                        '	<td><input type="number" data-key="' +
                        key +
                        '" data-index="' +
                        index +
                        '" class="form-control input input-sm text-right" data-field="월입금" value="' +
                        data["월입금"] +
                        '"/></td>';
                } else {
                    row +=
                        '    <td class="text-right">' +
                        data["월입금"].toLocaleString() +
                        "</td>";
                }

                if (data["관리수당"] > 100) {
                    row += "    <td></td>";
                    row +=
                        '    <td class="text-right">' +
                        data["관리수당"].toLocaleString() +
                        "</td>";
                    row += "    <td></td>";
                } else if (data["관리수당"] > 0 && data["관리수당"] < 100) {
                    row +=
                        '    <td class="text-right">' +
                        Math.floor(
                            (data["유지보수금액"] * data["관리수당"]) / 100
                        ).toLocaleString() +
                        "</td>";
                    row += "    <td></td>";
                    row +=
                        '    <td class="text-right">' +
                        data["관리수당"] +
                        "%</td>";
                } else {
                    row += "    <td></td>";
                    row += "    <td></td>";
                    row += "    <td></td>";
                }
                row +=
                    '    <td class="text-right red">' +
                    data["미수금"].toLocaleString() +
                    "</td>";
                if (isAdmin) {
                    row +=
                        '	<td><input type="text" class="form-control input input-sm memo" value="' +
                        data["메모"] +
                        '"/></td>';
                    row +=
                        '	<td><button type="button" data-hosp="' +
                        data["ID"] +
                        '" class="btn btn-success btn-sm m-b-none"><i class="fa fa-floppy-o"></i></button></td>';
                } else {
                    row += "    <td>" + data["메모"] + "</td>";
                    row += "    <td></td>";
                }
                row += "</tr>";

                return row;
            }
        }

        function RenderCMSMinus(key) {
            var $table = $("#" + key);
            var $totalRow = $table.find("tr#" + key + "-total");
            var cmsDatas = _this.settlements[key];
            var cmsMinus = _this.settlements[key + "-minus"] || {
                count: 0,
                price: 0,
                total: 0
            };

            var $row = "";
            $row += `
                <tr id="${key}-minus" class="bg-warning">
                    <td colspan="4" class="text-center">CMS출금 수수료</td>
                    <td><div class="input-group input-group-sm m-b-none"><input type="number" class="form-control input-sm cms-${key}-minus" value="${cmsMinus.count}"/><span class="input-group-addon">개</span></div></td>
                    <td><div class="input-group input-group-sm m-b-none"><input type="number" class="form-control input-sm cms-${key}-minus" value="${cmsMinus.price}"/><span class="input-group-addon">원</span></div></td>
                    <td id="${key}-minus-total" class="text-right">${cmsMinus.total}</td>
                </tr>
            `;
            $totalRow.after($row);

            $(".cms-" + key + "-minus").bind("keyup", function (event) {
                try {
                    var sum = 1;
                    $(".cms-" + key + "-minus").each(function (el) {
                        sum *= $(this).val() * 1;
                    });
                    _this.settlements[key + "-minus"] = {
                        count: $(".cms-" + key + "-minus:eq(0)").val() * 1,
                        price: $(".cms-" + key + "-minus:eq(1)").val() * 1,
                        total: sum
                    };
                    // var total = cmsDatas.reduce(function (a, b) {
                    //     return a + b['월입금'];
                    // }, 0)
                    // total = total - sum;

                    $("#" + key + "-minus-total").text(sum.toLocaleString());
                    // $($table.find('#' + key + '-total>td[data-field="월입금"]')).text(total.toLocaleString());
                    // $('#' + key + '-payment>td[data-field="월입금"]').text(total.toLocaleString()).data('origin-data', total);
                    RenderPayment();
                    RenderArea(_this.options.area);
                } catch (error) {
                    $("#" + key + "-minus-total").text(error);
                }
            });
        }

        function RenderPayment() {
            var row = "";

            _this.settlementSum = (function () {
                var keys = Object.keys(_this.settlementSum);

                keys.forEach(function (key) {
                    _this.settlementSum[key] = (function (field) {
                        var _sum = 0;
                        $payment
                            .find('td[data-field="' + field + '"]')
                            .each(function (i, v) {
                                _sum += parseInt($(v).data("origin-data"));
                            });
                        return _sum;
                    })(key);
                });

                return _this.settlementSum;
            })();

            row += '<tr id="payment-total" class="bg-success">';
            row += '    <td class="text-center">합계(T)</td>';
            row +=
                '    <td class="text-right">' +
                _this.settlementSum["유지보수금액"].toLocaleString() +
                "</td>";
            row +=
                '    <td class="text-right">' +
                _this.settlementSum["월입금"].toLocaleString() +
                "</td>";

            row +=
                '    <td class="text-right">' +
                (
                    _this.settlementSum["유지보수"] +
                    _this.settlementSum["관리수당"]
                ).toLocaleString() +
                "</td>";
            // row += '    <td class="text-right">' + sum['관리수당'].toLocaleString() + '</td>';
            // row += '    <td></td>';
            row +=
                '    <td class="text-right red">' +
                _this.settlementSum["미수금"].toLocaleString() +
                "</td>";
            row += "    <td></td>";
            row += "    <td></td>";
            row += "</tr>";
            $payment.find("#payment-total").remove();
            $payment.append(row);
        }

        function RenderEmrCounter() {
            var keys = Object.keys(_this.settlements);
            var data = [];
            keys.forEach(function (key) {
                if (
                    typeof _this.settlements[key] === "object" &&
                    !key.match(/-minus/gim)
                ) {
                    data = data.concat(_this.settlements[key]);
                }
            });

            data = data.sort(function (a, b) {
                return a["프로그램"] > b["프로그램"]
                    ? -1
                    : a["프로그램"] < b["프로그램"]
                        ? 1
                        : 0;
            });

            var _programs = data.map(function (item) {
                return item["프로그램"];
            });
            var programs = _programs.reduce(function (a, b) {
                if (a.indexOf(b) < 0) a.push(b);
                return a;
            }, []);

            var emrObj = {};
            programs.forEach(function (emr) {
                emrObj[emr] = {
                    정률: {
                        40: [0, 0],
                        50: [0, 0],
                        60: [0, 0]
                    },
                    정액: {
                        지사금액: 0,
                        기타: 0
                    },
                    기타: [0, 0]
                };
            });
            var sumEmrObj = {
                정률: {
                    40: 0,
                    50: 0,
                    60: 0
                },
                정액: {
                    지사금액: 0,
                    기타: 0
                },
                기타: 0,
                총합: 0
            };

            // console.log(emrObj, data)
            var tempObj = null;

            programs.forEach(function (emr) {
                var eachProgram = data.filter(function (_item) {
                    return _item["프로그램"] == emr;
                });
                // console.log(eachProgram)

                tempObj = emrObj[emr];
                eachProgram.forEach(function (item) {
                    if (item["기관명칭"].indexOf("폴라#") < 0) {
                        if (item["관리수당"] > 100) {
                            if (item["관리수당"] == areaMaster[options.area]) {
                                tempObj["정액"]["지사금액"] += 1;
                            } else {
                                tempObj["정액"]["기타"] += 1;
                                sumEmrObj["정액"]["기타"] += item["관리수당"];
                                sumEmrObj["총합"] += item["관리수당"];
                            }
                        } else if (
                            item["관리수당"] > 0 &&
                            item["관리수당"] <= 100
                        ) {
                            tempObj["정률"][item["관리수당"]][0] += 1;
                            if (item["연유지"] == 1 && options.area == "0006") {
                                //부산 연유지는 나누기 12 로 함
                                tempObj["정률"][item["관리수당"]][1] +=
                                    (item["유지보수금액"] * item["관리수당"]) /
                                    100 /
                                    12;
                            } else {
                                tempObj["정률"][item["관리수당"]][1] +=
                                    (item["유지보수금액"] * item["관리수당"]) /
                                    100;
                            }
                        } else {
                            tempObj["기타"][0] += 1;
                            tempObj["기타"][1] += item["관리수당"] * 1;
                        }
                    }
                });
            });

            var $TARGET = $("#emrCount");
            var $ROW = "";
            $TARGET.empty();
            var totalCount = 0;
            keys = Object.keys(emrObj);
            keys.forEach(function (key) {
                totalCount = 0;

                $ROW = "<tr>";
                $ROW += '    <th class="text-center">' + key + "</th> ";
                $ROW +=
                    '    <td class="text-center">' +
                    emrObj[key]["정률"][40][0] +
                    "</td>";
                $ROW +=
                    '    <td class="text-center">' +
                    emrObj[key]["정률"][50][0] +
                    "</td>";
                $ROW +=
                    '    <td class="text-center">' +
                    emrObj[key]["정률"][60][0] +
                    "</td>";

                $ROW +=
                    '    <td class="text-center">' +
                    emrObj[key]["정액"]["지사금액"] +
                    "</td>";
                $ROW +=
                    '    <td class="text-center">' +
                    emrObj[key]["정액"]["기타"] +
                    "</td>";

                $ROW +=
                    '    <td class="text-center">' +
                    emrObj[key]["기타"][0] +
                    "</td>";

                totalCount += emrObj[key]["정률"][40][0];
                totalCount += emrObj[key]["정률"][50][0];
                totalCount += emrObj[key]["정률"][60][0];
                totalCount += emrObj[key]["기타"][0];
                totalCount += emrObj[key]["정액"]["지사금액"];
                totalCount += emrObj[key]["정액"]["기타"];

                $ROW +=
                    '    <td class="text-center bg-success">' +
                    totalCount +
                    "</td>";
                $ROW += "</tr>";

                sumEmrObj["정률"][40] += emrObj[key]["정률"][40][1];
                sumEmrObj["정률"][50] += emrObj[key]["정률"][50][1];
                sumEmrObj["정률"][60] += emrObj[key]["정률"][60][1];
                sumEmrObj["기타"] += emrObj[key]["기타"][1];
                sumEmrObj["총합"] += emrObj[key]["정률"][40][1];
                sumEmrObj["총합"] += emrObj[key]["정률"][50][1];
                sumEmrObj["총합"] += emrObj[key]["정률"][60][1];
                sumEmrObj["총합"] += emrObj[key]["기타"][1];
                if (areaMaster[options.area]) {
                    sumEmrObj["정액"]["지사금액"] +=
                        areaMaster[options.area] *
                        emrObj[key]["정액"]["지사금액"];
                    sumEmrObj["총합"] +=
                        areaMaster[options.area] *
                        emrObj[key]["정액"]["지사금액"];
                }

                // console.log(areaMaster[options.area] * emrObj[key]['정액']['지사금액'])
                // sumEmrObj['정액']['기타'] += areaMaster[options.area] * emrObj[key]['정액']['기타']

                // console.log($ROW)
                $TARGET.append($ROW);
            });

            $ROW = '<tr class="bg-success">';
            $ROW += '    <th class="text-center">합계</th>';
            $ROW +=
                '    <td class="text-center">' +
                Math.floor(sumEmrObj["정률"][40]).toLocaleString() +
                "</td>";
            $ROW +=
                '    <td class="text-center">' +
                Math.floor(sumEmrObj["정률"][50]).toLocaleString() +
                "</td>";
            $ROW +=
                '    <td class="text-center">' +
                Math.floor(sumEmrObj["정률"][60]).toLocaleString() +
                "</td>";
            $ROW +=
                '    <td class="text-center">' +
                Math.floor(sumEmrObj["정액"]["지사금액"]).toLocaleString() +
                "</td>";
            $ROW +=
                '    <td class="text-center">' +
                Math.floor(sumEmrObj["정액"]["기타"]).toLocaleString() +
                "</td>";
            $ROW +=
                '    <td class="text-center">' +
                Math.floor(sumEmrObj["기타"]).toLocaleString() +
                "</td>";
            $ROW +=
                '    <td class="text-center">' +
                Math.floor(sumEmrObj["총합"]).toLocaleString() +
                "</td>";
            $ROW += "</tr>";
            $TARGET.append($ROW);
        }

        function RenderArea(area) {
            var parentFee = 0;
            var areaFee = 0;
            $("#parent").empty();
            $("#area").empty();

            switch (area) {
                case "0006": // 부산지사
                    _render0006();
                    break;
                case "0009": // 대구지사
                case "0010": // 제주지사
                case "0011": // 충청지사
                case "0012": // 전주지사
                case "0013": // 강원지사
                case "0017": // 서울강북
                case "0019": // 안동지사
                case "0023": // 서울강동
                case "0025": // 서울서부
                case "0028": // 최종용                
                    _renderPublic();
                    break;

                case "0034": // 711-김기엽
                case "0046": // 김찬희
                    _render0034();
                    break;
                case "0042": // 충청 - 최종용
                case "0043": // 충청 - 서울강동
                case "0036": // 711-서울서부
                    _render0036();
                    break;
                case "0041": // 폴라리스
                    _render0041();
                    break;
                case "0021": // 울산지사
                    _render0021();
                    break;
            }
            if (_this.settlements.closed && !isAdmin) {
                $("#parent").text(
                    parseInt(_this.settlements.parentFee).toLocaleString()
                );
                $("#area").text(
                    parseInt(_this.settlements.areaFee).toLocaleString()
                );
            } else {
                _this.settlements.parentFee = parseInt(parentFee);
                _this.settlements.areaFee = parseInt(areaFee);
            }

            $('#area').find('input').bind('keyup', function (event) {
                event.preventDefault();
                _this.settlements.areaFee = $(this).val() * 1;
                $("#cms-fee .cms-fee").trigger('keyup');
            })

            function _renderPublic() {
                parentFee =
                    _this.settlementSum["유지보수"] +
                    _this.settlementSum["관리수당"];
                areaFee = _this.settlementSum["월입금"];

                if (areaFee !== _this.settlements.areaFee && _this.settlements.closed == 1) {
                    areaFee = _this.settlements.areaFee;
                }
                if (!isAdmin) {
                    $("#parent").text(parentFee.toLocaleString());
                    $("#area").text(areaFee.toLocaleString());
                } else {
                    $("#parent").append(
                        '<input type="number" class="form-control input input-sm" value="' +
                        parentFee +
                        '"/>'
                    );
                    $("#area").append(
                        '<input type="number" class="form-control input input-sm" value="' +
                        areaFee +
                        '"/>'
                    );
                }

                $("#parent-explain").text("= 유지보수총액");
                $("#area-explain").text("= T");
            }

            function _render0006() {
                parentFee =
                    _this.settlementSum["유지보수"] +
                    _this.settlementSum["관리수당"];
                areaFee = _this.settlementSum["월입금"] - parentFee;
                // $('#parent').text(parentFee.toLocaleString());
                // $('#area').text(areaFee.toLocaleString());

                if (areaFee !== _this.settlements.areaFee && _this.settlements.closed == 1) {
                    areaFee = _this.settlements.areaFee;
                }

                if (!isAdmin) {
                    $("#parent").text(parentFee.toLocaleString());
                    $("#area").text(areaFee.toLocaleString());
                } else {
                    $("#parent").append(
                        '<input type="number" class="form-control input input-sm" value="' +
                        parentFee +
                        '"/>'
                    );
                    $("#area").append(
                        '<input type="number" class="form-control input input-sm" value="' +
                        areaFee +
                        '"/>'
                    );
                }

                $("#parent-explain").text("= 유지보수총액");
                $("#area-explain").text("= T - G");
            }

            function _render0034() {
                // 지사정산-711김기엽
                // 합계에서 지사수금(D)항목 삭제(20,000)
                // 본사금액, 지사금액은
                // 합계(T)/2 으로 수정요청 18.06.01

                // parentFee = (Math.floor(_this.settlementSum['월입금'] / 2) + 20000);
                // _this.settlementSum['월입금'] += 20000;
                // areaFee = (_this.settlementSum['월입금'] - parentFee);
                // parentFee = (Math.floor(_this.settlementSum['월입금'] / 2));
                // areaFee = parentFee;
                // if (!isAdmin) {
                //     $('#parent').text(parentFee.toLocaleString());
                //     $('#area').text(areaFee.toLocaleString());
                // } else {
                //     $('#parent').append('<input type="number" class="form-control input input-sm" value="' + parentFee + '"/>');
                //     $('#area').append('<input type="number" class="form-control input input-sm" value="' + areaFee + '"/>');
                // }
                // $('#parent-explain').text('= T / 2');
                // $('#area-explain').text('= T / 2');

                // 본사 60 : 김기엽 40 으로 다시 수정 18.10.05
                // _render0036();

                parentFee = Math.floor(_this.settlementSum["월입금"] * 0.6);
                areaFee = Math.floor(_this.settlementSum["월입금"] * 0.4);

                if (areaFee !== _this.settlements.areaFee && _this.settlements.closed == 1) {
                    areaFee = _this.settlements.areaFee;
                }

                if (!isAdmin) {
                    $("#parent").text(parentFee.toLocaleString());
                    $("#area").text(areaFee.toLocaleString());
                } else {
                    $("#parent").append(
                        '<input type="number" class="form-control input input-sm" value="' +
                        parentFee +
                        '"/>'
                    );
                    $("#area").append(
                        '<input type="number" class="form-control input input-sm" value="' +
                        areaFee +
                        '"/>'
                    );
                }

                $("#parent-explain").text("= T * 60%");
                $("#area-explain").text("= T * 40%");
            }

            function _render0036() {
                parentFee = Math.floor(_this.settlementSum["월입금"] / 2);
                areaFee = Math.floor(_this.settlementSum["월입금"] / 2);

                if (areaFee !== _this.settlements.areaFee && _this.settlements.closed == 1) {
                    areaFee = _this.settlements.areaFee;
                }

                if (!isAdmin) {
                    $("#parent").text(parentFee.toLocaleString());
                    $("#area").text(areaFee.toLocaleString());
                } else {
                    $("#parent").append(
                        '<input type="number" class="form-control input input-sm" value="' +
                        parentFee +
                        '"/>'
                    );
                    $("#area").append(
                        '<input type="number" class="form-control input input-sm" value="' +
                        areaFee +
                        '"/>'
                    );
                }

                $("#parent-explain").text("= T / 2");
                $("#area-explain").text("= T / 2");
            }

            function _render0041() {
                parentFee = Math.floor(_this.settlementSum["월입금"] / 2);
                areaFee = Math.floor(_this.settlementSum["월입금"] / 2);

                if (areaFee !== _this.settlements.areaFee && _this.settlements.closed == 1) {
                    areaFee = _this.settlements.areaFee;
                }

                if (!isAdmin) {
                    $("#parent").text(parentFee.toLocaleString());
                    $("#area").text(areaFee.toLocaleString());
                } else {
                    $("#parent").append(
                        '<input type="number" class="form-control input input-sm" value="' +
                        parentFee +
                        '"/>'
                    );
                    $("#area").append(
                        '<input type="number" class="form-control input input-sm" value="' +
                        areaFee +
                        '"/>'
                    );
                }

                $("#parent-explain").text("= T / 2");
                $("#area-explain").text("= T / 2");
            }

            function _render0021() {
                // var $table = $('#cms');
                // var $busan = $('#busan');
                // var $nambu = $('#nambu');

                // $table.find("td:contains('부산#')").parent().appendTo($busan);
                // $("td:contains('메디#')").parent().appendTo($nambu);
                parentFee =
                    _this.settlementSum["유지보수"] +
                    _this.settlementSum["관리수당"];
                areaFee = _this.settlementSum["월입금"];

                var busanSum = $("#busan")
                    .find("tr:nth-last-child(2)")
                    .find("td:eq(6)")
                    .text();
                var nambuSum = $("#nambu")
                    .find("tr:nth-last-child(2)")
                    .find("td:eq(6)")
                    .text();
                var polarisSum = $("#polaris")
                    .find("tr:nth-last-child(2)")
                    .find("td:eq(6)")
                    .text();

                busanSum = busanSum.split(",").join("");
                nambuSum = nambuSum.split(",").join("");
                polarisSum = polarisSum.split(",").join("");
                console.log(
                    _this.settlementSum["유지보수"],
                    _this.settlementSum["관리수당"]
                );
                console.log(
                    parentFee,
                    busanSum / 2,
                    nambuSum / 2,
                    polarisSum / 2
                );
                console.log(
                    parentFee + busanSum / 2 + nambuSum / 2 + polarisSum / 2
                );
                parentFee = Math.floor(
                    parentFee + busanSum / 2 + nambuSum / 2 + polarisSum / 2
                );
                areaFee = Math.floor(
                    areaFee + busanSum / 2 + nambuSum / 2 + polarisSum / 2
                );

                if (areaFee !== _this.settlements.areaFee && _this.settlements.closed == 1) {
                    areaFee = _this.settlements.areaFee;
                }

                if (!isAdmin) {
                    $("#parent").text(parentFee.toLocaleString());
                    $("#area").text(areaFee.toLocaleString());
                } else {
                    $("#parent").append(
                        '<input type="number" class="form-control input input-sm" value="' +
                        parentFee +
                        '"/>'
                    );
                    $("#area").append(
                        '<input type="number" class="form-control input input-sm" value="' +
                        areaFee +
                        '"/>'
                    );
                }

                $("#parent-explain").text(
                    "= 유지보수합계 + 부산본사거래처합계 / 2 + 메디남부거래처합계 / 2 + 폴라리스거래처합계 / 2"
                );
                $("#area-explain").text(
                    "= 입금내역합계 + 부산본사거래처합계 / 2 + 메디남부거래처합계 / 2 + 폴라리스거래처합계 / 2"
                );
            }
        }

        function RenderCMSFee() {
            console.log(_this.settlements);
            var $AREAFINAL = $("#area-final"),
                $EXTRATOTAL = $("#extra-service"),
                $CMSFEE = $("#cms-fee");

            $AREAFINAL.empty();
            $CMSFEE.empty();
            _this.settlements.areaFinal = _this.settlements.areaFinal || 0;
            _this.settlements.cmsFee = _this.settlements.cmsFee || 0;

            $AREAFINAL.text(_this.settlements.areaFinal.toLocaleString());
            if (!isAdmin) {
                // $AREAFINAL.text(_this.settlements.AREAFINAL.toLocaleString());
                $CMSFEE.text(_this.settlements.cmsFee.toLocaleString());
            } else {
                // $AREAFINAL.append('<input type="number" class="form-control input input-sm area-final" value="' + (_this.settlements.areaFinal || '') + '"/>')
                // $AREAFINAL.text(_this.settlements.AREAFINAL.toLocaleString());
                $CMSFEE.append(
                    '<input type="number" class="form-control input input-sm cms-fee" value="' +
                    (_this.settlements.cmsFee || "") +
                    '"/>'
                );

                $CMSFEE.find(".cms-fee").bind("keyup", function (event) {
                    var total = _this.settlements.areaFee - $(this).val() * 1;
                    var extraTotal = $EXTRATOTAL.text();
                    extraTotal = Number(extraTotal.replace(/,/gim, ""));

                    $AREAFINAL.text(total.toLocaleString());
                    $("#area-total").text(
                        (extraTotal + total).toLocaleString()
                    );
                });
            }
        }

        function RenderExtraService() {
            console.log(_this.settlements);
            var $EXTRACRM = $("#extra-service-crm"),
                $EXTRACARD = $("#extra-service-card"),
                $AREAFINAL = $("#area-final");
            // $EXTRATOTAL = $('#extra-service')
            $EXTRACARD.empty();
            $EXTRACRM.empty();
            $("#extra-service").empty();
            $("#area-total").empty();

            _this.settlements.extraServiceCRM =
                _this.settlements.extraServiceCRM || 0;
            _this.settlements.extraServiceCard =
                _this.settlements.extraServiceCard || 0;
            _this.settlements.extraServiceTotal =
                _this.settlements.extraServiceTotal || 0;
            _this.settlements.areaTotal = _this.settlements.areaTotal || 0;

            if (!isAdmin) {
                $EXTRACRM.text(
                    _this.settlements.extraServiceCRM.toLocaleString()
                );
                $EXTRACARD.text(
                    _this.settlements.extraServiceCard.toLocaleString()
                );
                $("#extra-service").text(
                    _this.settlements.extraServiceTotal.toLocaleString()
                );
                $("#area-total").text(
                    _this.settlements.areaTotal.toLocaleString()
                );
            } else {
                $EXTRACRM.append(
                    '<input type="number" class="form-control input input-sm extra-service" value="' +
                    (_this.settlements.extraServiceCRM || "") +
                    '"/>'
                );
                $EXTRACARD.append(
                    '<input type="number" class="form-control input input-sm extra-service" value="' +
                    (_this.settlements.extraServiceCard || "") +
                    '"/>'
                );
                $("#extra-service").text(_this.settlements.extraServiceTotal);
                $("#area-total").text(
                    _this.settlements.areaTotal.toLocaleString()
                );
                // console.log($('.extra-service'))
                $(".extra-service").bind("keyup", function (event) {
                    var sum =
                        $EXTRACRM.find('input[type="number"]').val() * 1 +
                        $EXTRACARD.find('input[type="number"]').val() * 1;
                    var areaFinal = Number(
                        $AREAFINAL.text().replace(/,/gim, "")
                    );
                    $("#extra-service").text(sum.toLocaleString());
                    $("#area-total").text((sum + areaFinal).toLocaleString());
                });
            }
        }

        function RenderSettlementMemo() {
            var $target = $("#settlement-memo");
            $target.empty();
            if (!isAdmin) {
                $target.html(_this.settlements.memo.replace(/\n/gim, "<br>"));
            } else {
                $target.append(
                    '<textarea class="form-control" rows="10"></textarea><button class="btn btn-success">저장</button>'
                );
                if (_this.settlements.memo.length) {
                    $target.find("textarea").val(_this.settlements.memo);
                }

                $target.find("button").bind("click", function (event) {
                    var memo = $target
                        .find("textarea")
                        .val()
                        .trim();
                    SaveAreaMemo(memo);
                });
            }
        }

        function SaveMemo(id, memo) {
            axios
                .post(API.SETTLEMENT.MEMO, {
                    id: id,
                    memo: memo
                })
                .then(function () {
                    new PNotify({
                        title: "지사정산",
                        text: "저장되었습니다.",
                        type: "success"
                    });
                })
                .catch(function (error) {
                    fn.errorNotify(error);
                });
        }

        function SaveAreaMemo(memo) {
            axios
                .post(API.SETTLEMENT.AREAMEMO, {
                    area: _this.options.area,
                    sDate: _this.options.date.end.substr(0, 7),
                    memo: memo
                })
                .then(function () {
                    new PNotify({
                        title: "지사정산",
                        text: "저장되었습니다.",
                        type: "success"
                    });
                })
                .catch(function (error) {
                    fn.errorNotify(error);
                });
        }

        function CloseSettlement() {
            _this.settlements.parentFee = $("#parent")
                .find("input")
                .val();
            _this.settlements.areaFee = $("#area")
                .find("input")
                .val();
            _this.settlements.cmsFee = $("#cms-fee")
                .find("input")
                .val();
            _this.settlements.areaFinal = $("#area-final").text();
            _this.settlements.extraServiceCRM = $("#extra-service-crm")
                .find("input")
                .val();
            _this.settlements.extraServiceCard = $("#extra-service-card")
                .find("input")
                .val();
            _this.settlements.extraServiceTotal = $("#extra-service").text();

            _this.settlements.areaTotal = $("#area-total").text();

            if (_this.settlements.areaTotal == 0) {
                _this.settlements.areaTotal =
                    _this.settlements.areaFee * 1 +
                    _this.settlements.extraServiceTotal * 1;
                _this.settlements.areaTotal = _this.settlements.areaTotal.toLocaleString();
            }
            // _this.settlements.memo = $('#settlement-memo').find('textarea').val();

            var axiosClose = _this.settlements.closed
                ? axios.put(API.SETTLEMENT.CLOSE, {
                    정산일: _this.options.date.end.substr(0, 7),
                    지사코드: _this.options.area,
                    정산서: _this.settlements
                })
                : axios.post(API.SETTLEMENT.CLOSE, {
                    정산일: _this.options.date.end.substr(0, 7),
                    지사코드: _this.options.area,
                    정산서: _this.settlements
                });

            axiosClose
                .then(function (result) {
                    console.log(result);
                    return swal({
                        title: "저장되었습니다.",
                        text: "정산마감이 완료되어 새로고침됩니다.",
                        type: "info"
                    });
                })
                .then(function () {
                    location.reload();
                })
                .catch(function (error) {
                    fn.errorNotify(error);
                });
        }
        /**
         * 지사정산 부분 끝
         */

        /**
         * 통계시작
         */
        function LoadStatic(year) {
            $staticList.empty();

            axios
                .get(API.SETTLEMENT.AREASTATIC, {
                    params: {
                        year: year
                    }
                })
                .then(function (result) {
                    console.log(result);
                    RenderStatic(result.data);
                })
                .catch(function (error) {
                    fn.errorNotify(error);
                });
        }

        function RenderStatic(stmts) {
            //1. 지사 로우 만들기
            //2. 정산월 컬럼 찾기
            //3. 금액 붙히기
            var $row, $col;
            stmts.forEach(function (stmt) {
                $row = $staticList.find("tr." + stmt["지사코드"]);
                if (!$row.length) {
                    $row = $(".static-row-template").clone();
                    $row.find("tr")
                        .addClass(stmt["지사코드"])
                        .each(function () {
                            $(this)
                                .find(".area-name")
                                .text(stmt["지사명"]);
                            $(this)
                                .find("td")
                                .addClass(stmt["지사코드"]);
                            $(this).appendTo($staticList);
                        });
                }
                $col = $staticList.find(
                    "td." + stmt["지사코드"] + "#parent-" + stmt["정산월"]
                );
                $col.text((stmt["본사금액"] * 1).toLocaleString());
                $col = $staticList.find(
                    "td." + stmt["지사코드"] + "#area-" + stmt["정산월"]
                );
                $col.text((stmt["지사금액"] * 1).toLocaleString());
                $col = $staticList.find(
                    "td." + stmt["지사코드"] + "#extra-" + stmt["정산월"]
                );

                $col.text(
                    stmt["부가서비스"]
                        ? (
                            Number(
                                stmt["부가서비스"].replace(/[^0-9.-]+/g, "")
                            ) * 1
                        ).toLocaleString()
                        : 0
                );
                $col = $staticList.find(
                    "td." + stmt["지사코드"] + "#areaextra-" + stmt["정산월"]
                );
                $col.text(
                    stmt["지사총액"]
                        ? (
                            Number(
                                stmt["지사총액"].replace(/[^0-9.-]+/g, "")
                            ) * 1
                        ).toLocaleString()
                        : (stmt["지사금액"] * 1).toLocaleString()
                );
            });
        }

        _this.el = {
            $areaDatePicker: $areaDatePicker,
            $areaSelect: $areaSelect,
            $excelExport: $excelExport
        };

        return _instance;
    };

    exports.Settlement = new Settlement();
    // exports.Settlement.fn.Init();

    $(document).on("focus", "input[type=number]", function (e) {
        $(this).on("wheel.disableScroll", function (e) {
            e.preventDefault();
        });
    });
    $(document).on("blur", "input[type=number]", function (e) {
        $(this).off("wheel.disableScroll");
    });
})(window);
