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
                chan: {
                    inTime: null
                },
                share: {
                    inTime: null,
                    inEmergency: null
                }
            },
            month: moment().format("YYYY-MM")
            // datePicker: new myDatePicker('.datepicker.fee')
        };

        var el = {
            $MEMBERTABLE: $("table>tbody.fee-member"),
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
                        format: "YYYY년 M월",
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
                    _this.actions.renderList(_this.state.data.fees);
                });

                _this.el.$UNFEEBUTTON.bind("click", function (event) {
                    _this.actions.renderList(_this.state.data.fees, true);
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
                        _this.state.data.fees.filter(function (item) {
                            return item["완료자"] == member;
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
                        _this.state.data.fees.filter(function (item) {
                            if (isParent) {
                                return item["지사코드"].match(/0000|0030|0031|0026/gim);
                            } else if (area.match(/0023|0028/gim)) {
                                return item["지사코드"].match(/0023|0028/gim);
                            } else {
                                return item["지사코드"] == area;
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
                    table_html = table_html.replace(/<i%20class="fa%20fa-check"><\/i>/gim, "√");
                    table_html = table_html.replace(/<span%20class="badge%20bg-red">응급<\/span>/gim, "√");
                    table_html = table_html.replace(/<span%20class="badge%20bg-blue">본사<\/span>/gim, "√");
                    var a = document.createElement("a");
                    a.href = data_type + ", " + table_html;
                    a.download =
                        "AS수수료리스트" +
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
                    var table_div = _this.el.$MEMBERTABLE.closest(
                        // "div.x_content"
                        "section"
                    );

                    var table_html =
                        "<h3>직원 A/S 인센티브(콜센터 건당x600원,개발실 건당x1,000원)</h3>" +
                        table_div[0].outerHTML.replace(/ /g, "%20");
                    table_div = _this.el.$AREATABLE.closest("div.x_content");
                    table_html +=
                        "<h3>지사 공유처리 수수료</h3>" +
                        table_div[0].outerHTML.replace(/ /g, "%20");
                    table_html = "<h1>월별 A/S 수수료 정산</h1>" + table_html;
                    var a = document.createElement("a");
                    a.href = data_type + ", " + table_html;
                    a.download =
                        "AS수수료" +
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
                _this.el.$AREATABLE.empty();

                axios
                    .get(API.STATIC.FEE2020, {
                        params: {
                            date: _this.state.month //_this.state.datePicker.value
                        }
                    })
                    .then(function (result) {
                        console.log("데이터 조회 완료")
                        return _this.actions.parsing(result.data);
                    })
                    .then(function (total) {
                        console.log("데이터 변환 및 수수료 계산")
                        return _this.actions.render(total);
                    })
                    .then(function () {
                        console.log("데이터 랜더링")
                        if (
                            params.user["인덱스"] !== 13 &&
                            params.user["인덱스"] !== 5 &&
                            params.user["인덱스"] !== 43 &&
                            params.user["인덱스"] !== 89
                        ) {
                            if (!params.user["지사코드"].match(/0000|0030|0031|0026/gim)) {
                                _this.el.$MEMBERPICKER
                                    .attr("disabled", true)
                                    .selectpicker("refresh");
                                _this.el.$AREAPICKER.selectpicker(
                                    "val",
                                    params.user["지사코드"]
                                );
                                _this.el.$AREAPICKER
                                    .attr("disabled", true)
                                    .selectpicker("refresh");
                                _this.el.$AREAPICKER.trigger("changed.bs.select");
                            } else {
                                _this.el.$MEMBERPICKER.selectpicker(
                                    "val",
                                    params.user["인덱스"]
                                );
                                _this.el.$MEMBERPICKER
                                    .attr("disabled", true)
                                    .selectpicker("refresh");
                                _this.el.$AREAPICKER
                                    .attr("disabled", true)
                                    .selectpicker("refresh");
                                _this.el.$MEMBERPICKER.trigger("changed.bs.select");
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
                        //마감체크
                        if (originData.closed == 1) {
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
                        _this.state.closed = originData.closed;
                        _this.state.data = {
                            fees: originData.data,
                            member: {
                                qc: [],
                                dev: [],
                                area: [],
                                memberFee: [],
                                areaFee: []
                            },
                            parent: {
                                except: [],
                                inTime: [],
                                outTime: [],
                                devInTime: [],
                                devOutTime: []
                            },
                            kim: { inTime: [], devInTime: [], devOutTime: [] },
                            west: { inTime: [], devInTime: [], devOutTime: [] },
                            chan: { inTime: [], devInTime: [], devOutTime: [] },
                            share: {
                                inTime: [],
                                devInTime: [],
                                devInEmergency: [],
                                devOutTime: [],
                                inEmergency: [],
                                except: []
                            }
                        };

                        var feeItem = {
                            member: 0,
                            name: "",
                            parent: {
                                inTime: 0,
                                outTime: 0,
                                except: 0,
                                fee: 0
                            },
                            kim: {
                                inTime: 0,
                                outTime: 0,
                                fee: 0
                            },
                            west: {
                                inTime: 0,
                                outTime: 0,
                                fee: 0
                            },
                            chan: {
                                inTime: 0,
                                outTime: 0,
                                fee: 0
                            },
                            share: {
                                inTime: 0,
                                outTime: 0,
                                emergency: 0,
                                fee: 0
                            },
                            count: 0,
                            feeTotal: 0
                        };
                        var sumItem = window.fn.cloneObject(feeItem);
                        // sumItem.feeTotal = 0;
                        // sumItem.counter = 0;
                        sumItem.member = 999;
                        sumItem.name = '합계';

                        var areaItem = {
                            area: 0,
                            name: "",
                            normal: 0,
                            normalFee: 0,
                            emergency: 0,
                            emergencyFee: 0,
                            total: 0
                        }
                        var areaSumItem = window.fn.cloneObject(areaItem);
                        areaSumItem.area = 999;
                        areaSumItem.name = '합계';

                        originData.data.forEach(function (item) {
                            /**
                             * 부서 = 2 : Q/C , = 3 : 개발
                             * 149: 함준혁 (개발자), 193: 박수형 (직영)
                             * 18: 강동형 (연구소장)
                             * 183: 김성태 (지사장)
                             */
                            /* QC && DEV && AREA 추출 */
                            if (
                                (
                                    item['부서'] == 2
                                    && !item['완료자'].toString().match(/^149$|^193$/gim)
                                    && item['완료자지사'].match(/0000|0030|0031|0026/gim)
                                ) ||
                                item['완료자'].toString().match(/^18$|^183$/gim)) {
                                _this.state.data.member.qc.push(item['완료자']);
                            } else if (
                                (
                                    item['부서'] == 3
                                    && item['완료자'] !== 18
                                ) || item['완료자'] === 149
                            ) {
                                _this.state.data.member.dev.push(item['완료자']);
                            }
                            // 본사 (00,30,31,26), 김기엽(34), 서울서부(45), 김찬희(46)
                            if (!item['지사코드'].match(/0000|0030|0031|0026|0034|0045|0046/gim)) {
                                _this.state.data.member.area.push(item['지사코드']);
                            }

                            /* 업무시간 예외 데이터 추출 */
                            var acceptTime = moment(item['접수일자']).format("HH:MM");
                            var doneTime = moment(item['완료일자']);
                            var doneTimeCap = doneTime.diff(item['접수일자'], "minutes");
                            var doneTimeCapDev = doneTime.diff(item['공유일자'], "minutes");

                            // 본사 (00,30,31,26), 김기엽(34), 서울서부(45), 김찬희(46)
                            if (item["지사코드"].match(/0000|0030|0031|0026/gim)) {

                                // 토요일 업무시간외 처리건
                                if (moment(item['접수일자']).format('dddd') === '토요일') {

                                    if (acceptTime < "09:00" || acceptTime >= "13:00") {
                                        _this.state.data.parent.except.push(item);
                                    } else {
                                        if (
                                            acceptTime < "09:00"  //업무시간 이전
                                            || acceptTime >= "13:00" && acceptTime <= "14:00"   //점심
                                            || acceptTime > "18:00" // 업무시간 이후
                                        ) {
                                            _this.state.data.parent.except.push(item);
                                        } else if (doneTimeCap < 20) { // 30) { '21-02-15 20분이내로 변경
                                            _this.state.data.parent.inTime.push(item);
                                        } else if (doneTimeCap >= 20) { //30) {'21-02-15 20분이내로 변경
                                            _this.state.data.parent.outTime.push(item);

                                            if (doneTimeCapDev < 180) {
                                                _this.state.data.parent.devInTime.push(item);
                                            } else {
                                                _this.state.data.parent.devOutTime.push(item);
                                            }

                                        } else if (item["지사코드"] === "0034") {
                                            _this.state.data.kim.inTime.push(item);
                                        } else if (item["지사코드"] === "0045") {
                                            _this.state.data.west.inTime.push(item);
                                        } else if (item["지사코드"] === "0046") {
                                            _this.state.data.chan.inTime.push(item);
                                        }
                                    }
                                    // 일요일은 무조건 업무처리시간외로 카운트
                                } else if (moment(item['접수일자']).format('dddd') === '일요일') {
                                    _this.state.data.parent.except.push(item);
                                } else {

                                    if (
                                        acceptTime < "09:00"  //업무시간 이전
                                        || acceptTime >= "13:00" && acceptTime <= "14:00"   //점심
                                        || acceptTime > "18:00" // 업무시간 이후
                                    ) {
                                        _this.state.data.parent.except.push(item);
                                    } else if (doneTimeCap < 20) { // 30) { '21-02-15 20분이내로 변경
                                        _this.state.data.parent.inTime.push(item);
                                    } else if (doneTimeCap >= 20) { //30) {'21-02-15 20분이내로 변경
                                        _this.state.data.parent.outTime.push(item);

                                        if (doneTimeCapDev < 180) {
                                            _this.state.data.parent.devInTime.push(item);
                                        } else {
                                            _this.state.data.parent.devOutTime.push(item);
                                        }

                                    } else if (item["지사코드"] === "0034") {
                                        _this.state.data.kim.inTime.push(item);
                                    } else if (item["지사코드"] === "0045") {
                                        _this.state.data.west.inTime.push(item);
                                    } else if (item["지사코드"] === "0046") {
                                        _this.state.data.chan.inTime.push(item);
                                    }

                                }
                            } else if (item["지사코드"] === "0034") {
                                _this.state.data.kim.inTime.push(item);
                                if (item['공유일자'] != null) {
                                    if (doneTimeCapDev < 180) {
                                        _this.state.data.kim.devInTime.push(item);
                                    } else {
                                        _this.state.data.kim.devOutTime.push(item);
                                    }
                                }
                            } else if (item["지사코드"] === "0045") {
                                _this.state.data.west.inTime.push(item);
                                if (item['공유일자'] != null) {
                                    if (doneTimeCapDev < 180) {
                                        _this.state.data.west.devInTime.push(item);
                                    } else {
                                        _this.state.data.west.devOutTime.push(item);
                                    }
                                }
                            } else if (item["지사코드"] === "0046") {
                                _this.state.data.chan.inTime.push(item);
                                if (item['공유일자'] != null) {
                                    if (doneTimeCapDev < 180) {
                                        _this.state.data.chan.devInTime.push(item);
                                    } else {
                                        _this.state.data.chan.devOutTime.push(item);
                                    }
                                }
                            } else {
                                if (item['응급'] == 0) {
                                    _this.state.data.share.inTime.push(item);
                                    if (item['공유일자'] != null) {
                                        if (doneTimeCapDev < 180) {
                                            _this.state.data.share.devInTime.push(item);
                                        } else {
                                            _this.state.data.share.devOutTime.push(item);
                                        }
                                    }
                                } else if (item['응급'] == 1) {
                                    _this.state.data.share.inEmergency.push(item);
                                    if (item['공유일자'] != null) {
                                        if (doneTimeCapDev < 180) {
                                            _this.state.data.share.devInEmergency.push(item);
                                        } else {
                                            _this.state.data.share.devOutTime.push(item);
                                        }
                                    }
                                } else {
                                    console.log('unexpected data', item);
                                }
                            }



                        });

                        _this.state.data.member.qc = window.fn.arrayUnique(_this.state.data.member.qc);
                        _this.state.data.member.dev = window.fn.arrayUnique(_this.state.data.member.dev);
                        _this.state.data.member.area = window.fn.arrayUnique(_this.state.data.member.area);

                        /* QC AS건 카운팅 및 수수료 계산 */
                        _this.state.data.member.qc.forEach((member, index) => {
                            var memberFeeItem = window.fn.cloneObject(feeItem);
                            memberFeeItem.member = member;

                            /* 업무시간 이외 AS건 */
                            _this.state.data.parent.except.forEach(item => {
                                if (item['완료자'] === member) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }
                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.parent.except += 1;
                                        sumItem.parent.except += 1;
                                        memberFeeItem.parent.fee += 1000;
                                        item['수수료'] = 1000;
                                    } else {
                                        // memberFeeItem.parent.complain += 1;
                                        // sumItem.parent.complain += 1;
                                        item['수수료'] = 0;
                                    }
                                    item.except = true;
                                }
                            });

                            /* 30분내 AS건  210215 20분으로 변경 */
                            _this.state.data.parent.inTime.forEach(item => {
                                if (item['완료자'] === member) {
                                    if (memberFeeItem.name === "") {
                                        memberFeeItem.name = item['완료자명'];
                                    }
                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.parent.inTime += 1;
                                        // memberFeeItem.complain += 1;
                                        sumItem.parent.inTime += 1;
                                        memberFeeItem.parent.fee += 1000;
                                        item['수수료'] = 1000;
                                    } else {
                                        // memberFeeItem.parent.complain += 1;
                                        // sumItem.parent.complain += 1;
                                        item['수수료'] = 0;
                                    }
                                    item.inTime = true;
                                }
                            });

                            /* 30분 이상 AS건 210215 20분으로 변경 */
                            _this.state.data.parent.outTime.forEach(item => {
                                if (item['완료자'] === member) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }
                                    memberFeeItem.parent.outTime += 1;
                                    memberFeeItem.count += 1;
                                    sumItem.parent.outTime += 1;
                                    item['수수료'] = 0;
                                }
                            });

                            /*김기엽지사 */
                            _this.state.data.kim.inTime.forEach(item => {
                                if (item['완료자'] === member) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }

                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.kim.inTime += 1;
                                        sumItem.kim.inTime += 1;
                                        memberFeeItem.kim.fee += 1000;
                                        item['수수료'] = 1000;
                                    } else {
                                        // memberFeeItem.kim.complain += 1;
                                        // sumItem.kim.complain += 1;
                                        item['수수료'] = 0;
                                    }
                                    item.kim = true;
                                }
                            });

                            /*서울서부 지사 */
                            _this.state.data.west.inTime.forEach(item => {
                                if (item['완료자'] === member) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }

                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.west.inTime += 1;
                                        sumItem.west.inTime += 1;
                                        memberFeeItem.west.fee += 1000;
                                        item['수수료'] = 1000;
                                    } else {
                                        // memberFeeItem.west.complain += 1;
                                        // sumItem.west.complain += 1;
                                        item['수수료'] = 0;
                                    }
                                    item.west = true;
                                }
                            });

                            /*김찬희지사 */
                            _this.state.data.chan.inTime.forEach(item => {
                                if (item['완료자'] === member) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }

                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.chan.inTime += 1;
                                        sumItem.chan.inTime += 1;
                                        memberFeeItem.chan.fee += 1000;
                                        item['수수료'] = 1000;
                                    } else {
                                        // memberFeeItem.kim.complain += 1;
                                        // sumItem.kim.complain += 1;
                                        item['수수료'] = 0;
                                    }
                                    item.chan = true;
                                }
                            });

                            /* 다른 지사 일반 AS */
                            _this.state.data.share.inTime.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }


                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.share.inTime += 1;
                                        sumItem.share.inTime += 1;
                                        memberFeeItem.share.fee += 1000;
                                        item['수수료'] = 3000;
                                    } else {
                                        // memberFeeItem.share.complain += 1;
                                        // sumItem.share.complain += 1;
                                        item['수수료'] = 0;
                                    }
                                    item.share = true;
                                }
                            });

                            /* 다른 지사 응급 AS */
                            _this.state.data.share.inEmergency.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }

                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.share.emergency += 1;
                                        sumItem.share.emergency += 1;
                                        memberFeeItem.share.fee += 1000;
                                        item['수수료'] = 3000;
                                    } else {
                                        // memberFeeItem.share.complain += 1;
                                        // sumItem.share.complain += 1;
                                        item['수수료'] = 0;
                                    }
                                    item.share = true;
                                }
                            });

                            memberFeeItem.feeTotal = memberFeeItem.parent.fee + memberFeeItem.kim.fee + memberFeeItem.west.fee + memberFeeItem.chan.fee + memberFeeItem.share.fee;
                            sumItem.parent.fee += memberFeeItem.parent.fee;
                            sumItem.kim.fee += memberFeeItem.kim.fee;
                            sumItem.west.fee += memberFeeItem.west.fee;
                            sumItem.chan.fee += memberFeeItem.chan.fee;
                            sumItem.share.fee += memberFeeItem.share.fee;
                            sumItem.feeTotal += memberFeeItem.feeTotal;
                            _this.state.data.member.memberFee.push(memberFeeItem);

                        });

                        /* 개발실 AS건 카운팅 및 수수료 계산 */
                        _this.state.data.member.dev.forEach((member, index) => {
                            var memberFeeItem = window.fn.cloneObject(feeItem);
                            memberFeeItem.member = member;

                            /* 업무시간 이외 AS건 */
                            _this.state.data.parent.except.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }

                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.parent.except += 1;
                                        sumItem.parent.except += 1;
                                        memberFeeItem.parent.fee += 2000;
                                        item['수수료'] = 2000;
                                    } else {
                                        // memberFeeItem.parent.complain += 1;
                                        // sumItem.parent.complain += 1;
                                        item['수수료'] = 0;
                                    }
                                    item.dev = true;
                                    item.except = true;
                                }
                            });

                            /* 30분내 AS건 210215 20분내로 변경 */
                            _this.state.data.parent.inTime.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === "") {
                                        memberFeeItem.name = item['완료자명'];
                                    }


                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.parent.inTime += 1;
                                        sumItem.parent.inTime += 1;
                                        memberFeeItem.parent.fee += 2000;
                                        item['수수료'] = 2000;
                                    } else {
                                        // memberFeeItem.parent.complain += 1;
                                        // sumItem.parent.complain += 1;
                                        item['수수료'] = 0;
                                    }
                                    item.dev = true;
                                }
                            });

                            _this.state.data.parent.devInTime.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === "") {
                                        memberFeeItem.name = item['완료자명'];
                                    }


                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.parent.inTime += 1;
                                        sumItem.parent.inTime += 1;
                                        memberFeeItem.parent.fee += 2000;
                                        item['수수료'] = 2000;
                                    } else {
                                        // memberFeeItem.parent.complain += 1;
                                        // sumItem.parent.complain += 1;
                                        item['수수료'] = 0;
                                    }
                                    item.dev = true;
                                }
                            })

                            /* 30분 이상 AS건 */
                            //_this.state.data.parent.outTime.forEach(item => {
                            _this.state.data.parent.devOutTime.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }
                                    memberFeeItem.parent.outTime += 1;
                                    memberFeeItem.count += 1;
                                    sumItem.parent.outTime += 1;
                                    item['수수료'] = 0;
                                }
                                item.dev = true;

                            });

                            /*김기엽지사 */
                            //_this.state.data.kim.inTime.forEach(item => {
                            _this.state.data.kim.devInTime.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }

                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.kim.inTime += 1;
                                        sumItem.kim.inTime += 1;
                                        memberFeeItem.kim.fee += 2000;
                                        item['수수료'] = 2000;
                                    } else {
                                        // memberFeeItem.kim.complain += 1;
                                        // sumItem.kim.complain += 1;
                                        item['수수료'] = 0;
                                    }

                                    item.dev = true;
                                }
                            });
                            _this.state.data.kim.devOutTime.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }
                                    memberFeeItem.kim.outTime += 1;
                                    memberFeeItem.count += 1;
                                    sumItem.kim.outTime += 1;
                                    item['수수료'] = 0;
                                }
                                item.dev = true;

                            });

                            /*서울서부 지사 */
                            //_this.state.data.west.inTime.forEach(item => {
                            _this.state.data.west.devInTime.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }

                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.west.inTime += 1;
                                        sumItem.west.inTime += 1;
                                        memberFeeItem.west.fee += 2000;
                                        item['수수료'] = 2000;
                                    } else {
                                        // memberFeeItem.west.complain += 1;
                                        // sumItem.west.complain += 1;
                                        item['수수료'] = 0;
                                    }
                                    item.dev = true;
                                }
                            });
                            _this.state.data.west.devOutTime.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }
                                    memberFeeItem.west.outTime += 1;
                                    memberFeeItem.count += 1;
                                    sumItem.west.outTime += 1;
                                    item['수수료'] = 0;
                                }
                                item.dev = true;
                            });

                            /*김찬희지사 */
                            //_this.state.data.kim.inTime.forEach(item => {
                            _this.state.data.chan.devInTime.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }

                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.chan.inTime += 1;
                                        sumItem.chan.inTime += 1;
                                        memberFeeItem.chan.fee += 2000;
                                        item['수수료'] = 2000;
                                    } else {
                                        // memberFeeItem.kim.complain += 1;
                                        // sumItem.kim.complain += 1;
                                        item['수수료'] = 0;
                                    }

                                    item.dev = true;
                                }
                            });
                            _this.state.data.chan.devOutTime.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }
                                    memberFeeItem.chan.outTime += 1;
                                    memberFeeItem.count += 1;
                                    sumItem.chan.outTime += 1;
                                    item['수수료'] = 0;
                                }
                                item.dev = true;

                            });

                            /* 다른 지사 일반 AS */
                            //_this.state.data.share.inTime.forEach(item => {
                            _this.state.data.share.devInTime.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }

                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.share.inTime += 1;
                                        sumItem.share.inTime += 1;
                                        memberFeeItem.share.fee += 3000;
                                        item['수수료'] = 3000;
                                    } else {
                                        // memberFeeItem.share.complain += 1;
                                        // sumItem.share.complain += 1;
                                        item['수수료'] = 0;
                                    }
                                    item.dev = true;
                                }
                            });
                            _this.state.data.share.devOutTime.forEach(item => {
                                if (item['완료자'] === member && item['본사'] === 0) {
                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }
                                    memberFeeItem.share.outTime += 1;
                                    memberFeeItem.count += 1;
                                    sumItem.share.outTime += 1;
                                    item['수수료'] = 0;
                                }
                                item.dev = true;
                            });

                            /* 다른 지사 응급 AS */
                            //_this.state.data.share.inEmergency.forEach(item => {
                            _this.state.data.share.devInEmergency.forEach(item => {

                                if (item['완료자'] === member && item['본사'] === 0) {

                                    if (memberFeeItem.name === '') {
                                        memberFeeItem.name = item['완료자명'];
                                    }


                                    memberFeeItem.count += 1;
                                    if (item['이의'] == 0) {
                                        memberFeeItem.share.emergency += 1;
                                        sumItem.share.emergency += 1;
                                        memberFeeItem.share.fee += 5000;
                                        item['수수료'] = 5000;
                                    } else {
                                        // memberFeeItem.share.complain += 1;
                                        // sumItem.share.complain += 1;
                                        item['수수료'] = 0;
                                    }
                                    item.dev = true;
                                }
                            });

                            memberFeeItem.feeTotal = memberFeeItem.parent.fee + memberFeeItem.kim.fee + memberFeeItem.west.fee + memberFeeItem.chan.fee + memberFeeItem.share.fee;
                            sumItem.parent.fee += memberFeeItem.parent.fee;
                            sumItem.kim.fee += memberFeeItem.kim.fee;
                            sumItem.west.fee += memberFeeItem.west.fee;
                            sumItem.chan.fee += memberFeeItem.chan.fee;
                            sumItem.share.fee += memberFeeItem.share.fee;
                            sumItem.feeTotal += memberFeeItem.feeTotal;
                            _this.state.data.member.memberFee.push(memberFeeItem);

                        });

                        /* 지사 AS 건 카운팅 및 수수료 계산 */
                        _this.state.data.member.area.forEach(area => {
                            var areaFeeItem = window.fn.cloneObject(areaItem);
                            areaFeeItem.area = area;
                            originData.data.forEach(item => {
                                if (item['수수료'] != 0) {
                                    if (
                                        item['지사코드'] !== item['완료자지사'] &&
                                        area === item['지사코드'] &&
                                        item['본사'] === 0 &&
                                        item['이의'] == 0
                                    ) {
                                        areaFeeItem.name = item['지사'];
                                        if (item['응급'] == 0) {
                                            areaFeeItem.normal += 1;
                                            areaFeeItem.normalFee += 3000;
                                            areaFeeItem.total += 3000;

                                            areaSumItem.normal += 1;
                                            areaSumItem.normalFee += 3000;
                                            areaSumItem.total += 3000;
                                        } else {
                                            areaFeeItem.emergency += 1;
                                            areaFeeItem.emergencyFee += 5000;
                                            areaFeeItem.total += 5000;

                                            areaSumItem.emergency += 1;
                                            areaSumItem.emergencyFee += 5000;
                                            areaSumItem.total += 5000;
                                        }
                                    }
                                }
                            });
                            if (areaFeeItem.name !== "") {
                                _this.state.data.member.areaFee.push(areaFeeItem);
                            }
                        })


                        console.log(_this.state.data);
                        resolve({
                            memberTotal: sumItem,
                            areaTotal: areaSumItem
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
                        $TABLE.parent().removeClass('hidden');
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

                        _this.state.data.member.memberFee.forEach(function (item) {
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
                                (item.parent.except === 0 ? "-" : item.parent.except) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent">' +
                                (item.parent.inTime === 0 ? "-" : item.parent.inTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent">' +
                                (item.parent.outTime === 0 ? "-" : item.parent.outTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-parent fee-parent-fee">' +
                                (item.parent.fee === 0
                                    ? "-"
                                    : item.parent.fee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-kim">' +
                                (item.kim.inTime === 0 ? "-" : item.kim.inTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-kim">' +
                                (item.kim.outTime === 0 ? "-" : item.kim.outTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-kim fee-kim-fee">' +
                                (item.kim.fee === 0
                                    ? "-"
                                    : item.kim.fee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-west">' +
                                (item.west.inTime === 0 ? "-" : item.west.inTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-west">' +
                                (item.west.outTime === 0 ? "-" : item.west.outTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-west fee-west-fee">' +
                                (item.west.fee === 0
                                    ? "-"
                                    : item.west.fee.toLocaleString()) +
                                "</td>"
                            );
                            
                            $ROW.append(
                                '<td class="text-right fee-chan">' +
                                (item.chan.inTime === 0 ? "-" : item.chan.inTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-chan">' +
                                (item.chan.outTime === 0 ? "-" : item.chan.outTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-chan fee-chan-fee">' +
                                (item.chan.fee === 0
                                    ? "-"
                                    : item.chan.fee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-share">' +
                                (item.share.inTime === 0 ? "-" : item.share.inTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-share">' +
                                (item.share.outTime === 0 ? "-" : item.share.outTime) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-share">' +
                                (item.share.emergency === 0
                                    ? "-"
                                    : item.share.emergency) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-share fee-share-fee">' +
                                (item.share.fee === 0
                                    ? "-"
                                    : item.share.fee.toLocaleString()) +
                                "</td>"
                            );
                            $ROW.append(
                                '<td class="text-right fee-total">' +
                                (item.feeTotal === 0
                                    ? "-"
                                    : item.feeTotal.toLocaleString()) +
                                "</td>"
                            );
                            // if ($ROW.hasClass("member-qc")) {
                            $ROW.append(
                                '<td class="text-right fee-count">' +
                                item.count +
                                "</td>"
                            );
                            // } else {
                            //     $ROW.append(
                            //         '<td class="text-right fee-count">-</td>'
                            //     );
                            // }
                            // }

                            if (item.member !== 999) {
                                if ($ROW.hasClass("member-dev")) {
                                    addOption(
                                        item,
                                        "개발팀",
                                        _this.el.$MEMBERPICKER
                                    );
                                } else {
                                    addOption(
                                        item,
                                        "QC&외근팀",
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
                                name: "본 사"
                            },
                            "",
                            _this.el.$AREAPICKER,
                            true
                        );

                        $TABLE.find('tr').each(function (index, row) {
                            var $ROW = $(row)
                            if ($ROW.find('td').length == 0) { $ROW.remove() }

                        })

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
                    "건</th>" +
                    '    <th colspan="12"></th>' +
                    "    <th>" +
                    sumFee.toLocaleString() +
                    "원</th>" +
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
                        data[_index]["이의"] =
                            data[_index]["이의"] == 0 ? 1 : 0;
                        if (data[_index]["이의"] == 1) {
                            $THIS.closest("tr").addClass("bg-danger");
                        } else {
                            $THIS.closest("tr").removeClass("bg-danger");
                        }
                        _this.actions.update(data[_index]);
                    });

                function addRow(item, index) {
                    if (item["수수료"] <= 0 && unfee && item["이의"] == 0)
                        return;
                    rowNumber += 1;
                    sumFee += parseInt(item["수수료"]);

                    // var isParent, isKim, isInTime, isDev

                    // isParent = item['지사코드'].match(/0000|0030|0031|0026/gim)
                    // isKim = item['지사코드'] == '0034'
                    // isInTime = isParent ? moment(item['완료일자']).diff(item['접수일자'], 'minutes') < 45 : false
                    // isDev = isParent ? (item['부서'] == 3 && item['완료자'] !== 18) || item['완료자'] === 149 : false

                    /**
                     * 본사 AS이면
                     * QC가 한건지 따지고
                     * 맞으면 45분 따지고
                     * 아니면 그냥 천원
                     *
                     */
                    var timeClass = "",
                        timeTooltip = "",
                        devClass = "",
                        devTooltip = "",
                        areaClass = "",
                        areaTooltip = "",
                        kimClass = "",
                        kimTooltip = "",
                        chanClass = "",
                        chanTooltip = "";

                    if (item.except) {
                        timeClass = "bg-blue-sky";
                        timeTooltip =
                            'data-toggle="tooltip" data-placement="top" title="" data-original-title="업무시간외 발생한 A/S"';
                    } else if (item.inTime) {
                        timeClass = "bg-green";
                        timeTooltip =
                            'data-toggle="tooltip" data-placement="top" title="" data-original-title="30분내 처리된 A/S"';
                    }

                    if (item.dev) {
                        devClass = "bg-green";
                        devTooltip =
                            'data-toggle="tooltip" data-placement="top" title="" data-original-title="개발실에서 처리된 A/S"';
                    }

                    if (item.share) {
                        areaClass = "bg-green";
                        areaTooltip =
                            'data-toggle="tooltip" data-placement="top" title="" data-original-title="공유에서 처리된 A/S(개발실X)"';
                    }

                    if (item.kim) {
                        kimClass = "bg-green";
                        kimTooltip =
                            'data-toggle="tooltip" data-placement="top" title="" data-original-title="김기엽 지사 A/S"';
                    }

                    if (item.west) {
                        kimClass = "bg-green";
                        kimTooltip =
                            'data-toggle="tooltip" data-placement="top" title="" data-original-title="서울서부2 지사 A/S"';
                    }

                    if (item.chan) {
                        chanClass = "bg-green";
                        chanTooltip =
                            'data-toggle="tooltip" data-placement="top" title="" data-original-title="김찬희 지사 A/S"';
                    }

                    var complain = "";
                    // if (item["정산"] == "") {
                    if (_this.state.closed != 1) {
                        complain =
                            '<input type="checkbox" data-index="' +
                            index +
                            '" ' +
                            (item["이의"] == 1 ? "checked" : "") +
                            ">";
                    } else {
                        complain =
                            item["이의"] == 1
                                ? '<i class="fa fa-check"></i>'
                                : "";
                    }

                    $TABLE.append(
                        '<tr class="' + (item["이의"] == 1 ? "bg-danger" : "") + '">' + "    <th>" +
                        rowNumber +
                        "</th>" +
                        "    <td>" + item["인덱스"] + "</td>" +
                        "    <td>" + item["기관코드"] + "</td>" +
                        '    <td>' +
                        '       <a href="javascript:Fee.actions.showServiceDetailModal(' + item["인덱스"] + ')">' +
                        item["기관명칭"] +
                        "       </a>" +
                        "    </td>" +
                        '    <td class="' + areaClass + " " + kimClass + " " + chanClass + '" ' + areaTooltip + " " + kimTooltip + " " + chanTooltip + ">" +
                        item["지사"] +
                        "</td>" +
                        '    <td class="' + timeClass + '" ' + timeTooltip + ">" +
                        item["접수일자"] +
                        "</td>" +
                        '    <td class="' + timeClass + '" ' + timeTooltip + ">" +
                        item["공유일자"] +
                        "</td>" +
                        '    <td class="' + timeClass + '" ' + timeTooltip + ">" +
                        item["완료일자"] + "(" + moment(item["완료일자"]).diff(item["접수일자"], "minutes") +
                        (item['공유일자'] != null ? "/" + moment(item["완료일자"]).diff(item["공유일자"], "minutes") : "") +
                        ")</td>" +
                        // "    <td>" +
                        // item["확인자명"] +
                        // "</td>" +
                        "    <td>" +
                        item["공유자명"] +
                        "</td>" +
                        '    <td class="' + devClass + '" ' + devTooltip + ">" +
                        item["완료자명"] +
                        "</td>" +
                        "    <td>" +
                        (item["응급"] == 1 ? '<span class="badge bg-red">응급</span>' : "") +
                        "</td>" +
                        "    <td>" +
                        (item["본사"] == 1 ? '<span class="badge bg-blue">본사</span>' : "") +
                        "</td>" +
                        "    <td>" +
                        complain +
                        "</td>" +
                        "    <td>" +
                        (item["수수료"] > 0 ? item["수수료"].toLocaleString() : "-") +
                        "</td>" +
                        // "<td>" +
                        // item["정산"] +
                        // "</td>" +
                        "</tr>"
                    );
                }
            },
            showServiceDetailModal: function (id) {
                // console.log(id)
                var $modal = $(".detail-modal");
                var $el = $modal.find("#service-detail");
                // var detailUrl = "/service/history/detail?index={{INDEX}}&id={{USERID}}&hospnum={{HOSPNUM}}"
                var target = _this.state.data.fees.find(function (item) {
                    return item["인덱스"] === id;
                });
                var detailData = {
                    service: {},
                    replys: []
                };

                $el.empty();

                loadDetail(target);

                // detailUrl = detailUrl.replace('{{INDEX}}', id)
                // detailUrl = detailUrl.replace('{{USERID}}', target['USER_ID'])
                // detailUrl = detailUrl.replace('{{HOSPNUM}}', target['기관코드'])

                // $modal.find('iframe').attr('src', detailUrl)
                // $modal.modal('show')
                function loadDetail(item) {
                    axios
                        .get(API.SERVICE.DETAIL, {
                            params: {
                                index: item["인덱스"],
                                id: item["USER_ID"],
                                hospnum: item["기관코드"]
                            }
                        })
                        .then(function (result) {
                            detailData.service = result.data[0][0] || {};
                            detailData.replys = result.data[1] || [];
                            $modal
                                .find("#service-title")
                                .text(
                                    "[" +
                                    item["인덱스"] +
                                    "] " +
                                    item["기관명칭"]
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

                    if (service["상태"] >= CONSTS.SERVICE_STATUS.ACCEPT) {
                        $WORKFLOW += " <b>접수자:</b> " + service["접수자"];
                        $WORKFLOW +=
                            " <b>연락처:</b> " +
                            service["연락처"] +
                            (service["내선번호"]
                                ? "(내선: " + service["내선번호"] + ")"
                                : "");
                        $WORKFLOW +=
                            ' <b>접수일:</b> <span class="red">' +
                            moment(service["접수일자"]).calendar() +
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
                            service["확인일자"] +
                            "</span>";
                    }

                    if (
                        service["상태"] >= CONSTS.SERVICE_STATUS.SHARE &&
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
                                ? moment(service["공유일자"]).calendar()
                                : "15분 자동공유") +
                            "(" +
                            moment(service["공유일자"]).fromNow() +
                            ")</span>";
                    }

                    if (
                        service["상태"] >= CONSTS.SERVICE_STATUS.PROCESS &&
                        service["처리자"] !== 0
                    ) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>처리자:</b> <b class="blue">' +
                            service["처리자명"] +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>처리일:</b><span class="red">' +
                            moment(service["처리일자"]).calendar() +
                            "(" +
                            moment(service["처리일자"]).fromNow() +
                            ")</span>";
                    }

                    if (
                        service["상태"] >= CONSTS.SERVICE_STATUS.HOLD &&
                        service["보류자"] !== 0
                    ) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>보류자:</b> <b class="blue">' +
                            service["보류자명"] +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>보류일:</b><span class="red">' +
                            moment(service["보류일자"]).calendar() +
                            "(" +
                            moment(service["보류일자"]).fromNow() +
                            ")</span>";
                    }

                    if (
                        service["상태"] >= CONSTS.SERVICE_STATUS.DONE &&
                        service["완료자"] !== 0
                    ) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            ' <b>완료자:</b> <b class="blue">' +
                            service["완료자명"] +
                            "</b>";
                        $WORKFLOW +=
                            ' <b>완료일:</b><span class="red">' +
                            moment(service["완료일자"]).calendar() +
                            "(" +
                            moment(service["완료일자"]).fromNow() +
                            ")</span>";
                    }

                    if (service["응급"] === 1) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            '<span class="badge bg-red">응급 A/S</span>';
                    }
                    if (service["본사"] === 1) {
                        $WORKFLOW += "<br>";
                        $WORKFLOW +=
                            '<span class="badge bg-blue">본사 A/S</span>';
                    }

                    $WORKFLOW += '<div class="ln_solid"></div>';
                    $WORKFLOW += "<b>실행파일:</b> " + service["실행파일"];
                    $WORKFLOW += "<br>";
                    $WORKFLOW +=
                        '<b class="red">버튼/메뉴: ' +
                        service["실행메뉴"] +
                        " - " +
                        service["세부화면"] +
                        "</b>";
                    // $WORKFLOW += '<br>';
                    // $WORKFLOW += '<b>중분류:</b> ' + service['세부화면'];

                    $WORKFLOW += "</div>";

                    $el.append($WORKFLOW);
                }

                function serviceRender() {
                    var service = detailData.service;
                    // var $el = _this.el.$service;
                    var images =
                        service["이미지"].trim().length > 0
                            ? service["이미지"].split(",")
                            : null;

                    var $COMMENT = "",
                        $DIVIDELINE = '<div class="ln_solid"></div>',
                        $QUESTION_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-question-circle orange"></i> 문의내용</h5>',
                        $QUESTION_READ =
                            exports.fn.urlify(
                                service["문의내용"].replace(/\n/gim, "<br>")
                            ) || " - ",
                        $CONFIRM_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-info-circle blue"></i> 확인내용</h5>',
                        $CONFIRM_READ =
                            exports.fn.urlify(
                                service["확인내용"].replace(/\n/gim, "<br>")
                            ) || " - ",
                        $HOLD_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-pause-circle"></i> 보류내용</h5>',
                        $HOLD_READ =
                            exports.fn.urlify(
                                service["보류내용"].replace(/\n/gim, "<br>")
                            ) || " - ",
                        $PROCESS_TITLE =
                            '<h5 class="font-bold"><i class="fa fa-check-circle green"></i> 처리내용</h5>',
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
                            ) || " - ";
                    //     $TAG_TITLE = '<h5 class="font-bold"><i class="fa fa-tag"> 태그</i></h5>';

                    // var tags = service['태그'].length ? service['태그'].split('||') : [];
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
                            moment(reply["작성일자"]).fromNow() +
                            "</p>";
                        $REPLYS += "    </div>";
                        $REPLYS +=
                            '    <div class="message_wrapper m-l-none m-r-none">';
                        $REPLYS +=
                            '        <h5 class="heading blue"><i class="fa fa-user-circle"></i> ' +
                            reply["작성자명"] +
                            "</h5>";
                        $REPLYS +=
                            '        <p class="url">' +
                            exports.fn.urlify(reply["내용"]) +
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
                        //     title: '수정되었습니다.',
                        //     text: '페이지 상단의 [재계산]버튼을 누르면 재계산됩니다.',
                        //     type: 'success'
                        // });
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                    });
            },
            feeLock: function () {
                axios
                    .post(API.STATIC.FEE2020, {
                        endMonth: _this.state.month,
                        data: _this.state.data.fees.map(item => item['인덱스'])
                    })
                    .then(function (result) {
                        _this.el.$AREAPICKER.val("");
                        _this.el.$MEMBERPICKER.val("");
                        _this.el.$AREAPICKER.selectpicker("refresh");
                        _this.el.$MEMBERPICKER.selectpicker("refresh");
                        _this.el.$FEETABLE.empty();
                        _this.el.$FEEREFRESH.trigger("click");
                        // return new PNotify({
                        //     title: '수정되었습니다.',
                        //     text: '페이지 상단의 [재계산]버튼을 누르면 재계산됩니다.',
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
