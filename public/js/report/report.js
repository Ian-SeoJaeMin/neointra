(function (exports) {
    "use strict";

    var $CALENDAR = $(".report-calendar"),
        $DATEPICKER = $(".datepicker"),
        $DATEMOVER = $(".datemover"),
        $AREAPICKER = $(".report-area"),
        $DEPARTMENT = $(".report-department"),
        $REPORTER = $(".report-writer"),
        $LIST = $(".report-list"),
        $ETCMODAL = $(".etc-modal"),
        $ETCFORM = $("#report-add-form"),
        $REPORTWRITE = $("#report-write"),
        $REPORTSEARCH = $("#report-search"),
        $TEMPLATE = $("#report-template");

    var options = {
        date: moment().format("YYYY-MM-DD"), //'2017-09-14',
        area: params.user["지사코드"]
    };

    var reports = {
        depart: null,
        reporter: null,
        reports: null
    };

    $CALENDAR.datetimepicker({
        defaultDate: moment().format("YYYY-MM-DD"), //'2017-09-14',
        dayViewHeaderFormat: "YYYY년MM월",
        format: "YYYY-MM-DD",
        showTodayButton: true,
        useCurrent: false,
        inline: true,
        sideBySide: false
    });

    $DATEPICKER.datetimepicker({
        defaultDate: moment().format("YYYY-MM-DD"), //'2017-09-14',
        dayViewHeaderFormat: "YYYY년MM월",
        format: "YYYY-MM-DD",
        showTodayButton: true,
        useCurrent: false,
        sideBySide: false,
        ignoreReadonly: true
    });

    exports.fn
        .init_area($AREAPICKER, true)
        .then(function () {
            // _this.el.$MONTHPICKER.val(moment(_this.options.date.start).format('YYYY년 M월'));
            // $areaSelect.find('option[value="0000"]').remove()
            // $AREAPICKER.selectpicker("val", []);
            // $AREAPICKER.selectpicker("refresh");
        })
        .catch(function (error) {
            fn.errorNotify(error);
        });
    $AREAPICKER.bind("changed.bs.select", function (event) {
        options.area = $(this).selectpicker("val");
        Load();
    });

    $REPORTWRITE
        .find("select")
        .selectpicker()
        .bind("changed.bs.select", function (event) {
            if (
                $(this).selectpicker("val")[0] &&
                $(this)
                    .selectpicker("val")[0]
                    .match(/0|1/)
            ) {
                $REPORTWRITE
                    .find("#report-depart-name")
                    .removeAttr("disabled")
                    .focus();
            } else {
                $REPORTWRITE
                    .find("#report-depart-name")
                    .attr("disabled", "disabled")
                    .val("");
            }
        });

    $CALENDAR.bind("dp.change", function (event) {
        options.date = event.date.format("YYYY-MM-DD");
        $DATEPICKER.data("DateTimePicker").date(options.date);
        if ($CALENDAR.is(":visible")) {
            $REPORTSEARCH.val("");
            options.search = "";
            Load();
        }
    });

    $DATEPICKER.bind("dp.change", function (event) {
        options.date = event.date.format("YYYY-MM-DD");
        $CALENDAR.data("DateTimePicker").date(options.date);
        if ($DATEPICKER.is(":visible")) {
            $REPORTSEARCH.val("");
            options.search = "";
            Load();
        }
    });

    $DATEMOVER.bind("click", function (event) {
        var $THIS = $(this);
        var curDate = $DATEPICKER.data("value");
        var moveDate = "";
        if ($THIS.data("range") === "left") {
            moveDate = moment(curDate)
                .subtract(1, "day")
                .format("YYYY-MM-DD");
        } else {
            moveDate = moment(curDate)
                .add(1, "day")
                .format("YYYY-MM-DD");
        }
        $DATEPICKER.data("value", moveDate);
        $DATEPICKER.data("DateTimePicker").date(moveDate);
        // options.date.month = $DATEPICKER.data('value');
        // Load();
    });

    $DEPARTMENT.bind("click", function (event) {
        if (event.target.tagName === "BUTTON") {
            var $THIS = $(event.target);
            if ($THIS.find("i").length) {
                $THIS.find("i").remove();
                Render(reports.reports);
            } else {
                $DEPARTMENT.find("i").remove();
                $REPORTER.find("i").remove();
                $THIS.prepend('<i class="fa fa-check"></i>');

                Filtering("부서", event.target.dataset.depart);
            }
        }
    });

    $REPORTER.bind("click", function (event) {
        if (event.target.tagName === "BUTTON") {
            var $THIS = $(event.target);
            if ($THIS.find("i").length) {
                $THIS.find("i").remove();
                Render(reports.reports);
            } else {
                $DEPARTMENT.find("i").remove();
                $REPORTER.find("i").remove();
                $THIS.prepend('<i class="fa fa-check"></i>');

                Filtering("작성자", event.target.dataset.reporter);
            }
        }
    });

    $LIST.bind("click", function (event) {
        var $THIS;
        if (event.target.tagName === "BUTTON") {
            $THIS = $(event.target);
        } else if (event.target.tagName === "I") {
            if (event.target.parentElement.tagName === "BUTTON") {
                $THIS = $(event.target.parentElement);
            }
        }
        if ($THIS) {
            if ($THIS.hasClass("report-editable")) {
                if ($THIS.data("edittype") === "edit") {
                    RenderEdit($THIS.data("index"));
                    $THIS
                        .parent()
                        .parent()
                        .remove();
                } else {
                    Delete($THIS.data("index"));
                }
            }
        }
    });

    $REPORTSEARCH.bind("keypress", function (event) {
        if (event.keyCode === 13) {
            options.search = $(this)
                .val()
                .trim();
            Load();
        }
    });

    $ETCMODAL
        .bind("shown.bs.modal", function (event) {
            $ETCFORM
                .find(":text")
                .eq(0)
                .focus();
        })
        .bind("hidden.bs.modal", function (event) {
            $ETCFORM.trigger("reset");
        });

    $ETCFORM.bind("submit", function (event) {
        event.preventDefault();
        InsertRow();
    });

    $REPORTWRITE.find("table").bind("click", function (event) {
        if (event.target.tagName === "BUTTON") {
            var $THIS = $(event.target);
            if ($THIS.data("type") === "edit") {
                var $ROW = $THIS.closest("tr");
                var rowData = {};
                $ETCFORM.find('[id="id"]').val($ROW.attr("id"));
                $ROW.find("td").each(function (index, el) {
                    var $EL = $(el);
                    if ($EL.data("name")) {
                        rowData[$EL.data("name")] = $EL.text();
                        $ETCFORM
                            .find('[data-name="' + $EL.data("name") + '"]')
                            .val($EL.html());
                    }
                });
                $ETCFORM.find('[data-name="내용"]').val(
                    $ETCFORM
                        .find('[data-name="내용"]')
                        .val()
                        .replace(/<br>/gim, "\n")
                );
                $ETCMODAL.modal("show");
            } else if ($THIS.data("type") === "delete") {
                $THIS.closest("tr").remove();
            }
        }
    });

    $REPORTWRITE.find("#report-save").bind("click", function (event) {
        Save($(this));
    });

    function Filtering(key, value) {
        var filterData = reports.reports.filter(function (report) {
            return report[key] == value;
        });

        Render(filterData);
    }

    function Load() {
        axios
            .get(API.REPORT, {
                params: {
                    date: options.date,
                    area: options.area, //params.user["지사코드"],
                    user: params.user["인덱스"],
                    search: options.search
                }
            })
            .then(function (result) {
                console.log(result);
                reports = result.data;
                RenderDepartments(reports.depart);
                RenderReporters(reports.reporter);
                Render(reports.reports);
            })
            .catch(function (error) {
                fn.errorNotify(error);
            });
    }

    function RenderDepartments(depart) {
        $DEPARTMENT.empty();

        depart = depart || reports.depart;

        depart.forEach(function (depart) {
            $DEPARTMENT.append(
                '<li class="p-l-none p-r-none">' +
                '   <button class="btn btn-sm btn-warning no-border" type="button" data-depart="' +
                depart["부서"] +
                '">' +
                depart["부서명"] +
                "   </button>" +
                "</li>"
            );
        });

        return;
    }

    function RenderReporters(reporters) {
        $REPORTER.empty();

        reporters = reporters || reports.reporter;

        reporters[0].forEach(function (reporter) {
            $REPORTER.append(
                '<li class="p-l-none p-r-none">' +
                '   <button class="btn btn-sm btn-success no-border" type="button" data-reporter="' +
                reporter["작성자"] +
                '">' +
                "" +
                reporter["작성자명"] +
                "   </button>" +
                "</li>"
            );
        });
        reporters[1].forEach(function (reporter) {
            $REPORTER.append(
                '<li class="p-l-none p-r-none">' +
                '   <button class="btn btn-sm btn-info no-border" disabled type="button" data-reporter="' +
                reporter["ID"] +
                '">' +
                "" +
                reporter["이름"] +
                "   </button>" +
                "</li>"
            );
        });

        return;
    }

    function Render(rprts) {
        try {
            var $REPORT, $ETC, $ETCMOBILE, $VISIT, $CALL, $SERVICE;
            var visits, calls, services;
            var editable = false;

            $LIST.empty();
            $REPORTWRITE
                .find("select#report-depart")
                .selectpicker("deselectAll");
            $REPORTWRITE.find("input#report-depart-name").val("");
            $REPORTWRITE.find("tbody#report-etc").empty();
            $REPORTWRITE.addClass("hidden");

            rprts = rprts || reports.reports;

            if (rprts.length) {
                if (
                    !reports.reports.find(function (rpt) {
                        return rpt["작성자"] === params.user["인덱스"];
                    })
                ) {
                    RenderWrite();
                }

                rprts.forEach(function (rpt, index) {
                    visits = reports.visit.filter(function (v) {
                        return v["작성자"] === rpt["작성자"];
                    });
                    calls = reports.call.filter(function (c) {
                        return c["작성자"] === rpt["작성자"];
                    });
                    services = reports.service.filter(function (s) {

                        switch (s['상태ID']) {
                            case CONSTS.SERVICE_STATUS.FEEDBACK:
                                return s['피드백자'] === rpt['작성자'] || s['완료자'] === rpt['작성자'];
                            case CONSTS.SERVICE_STATUS.DONE:
                                return s['완료자'] === rpt['작성자'];
                            case CONSTS.SERVICE_STATUS.PROCESS:
                                return s['처리자'] === rpt['작성자'];
                            case CONSTS.SERVICE_STATUS.SHARE:
                                return s['공유자'] === rpt['작성자'];
                        }

                        // if (
                        //     (s["완료자"] === rpt["작성자"]) ||
                        //     (s['공유자'] === rpt['작성자'] && s['처리자'] === 0) ||
                        //     (s['처리자'] === rpt['작성자'])
                        // ) {
                        //     return true;
                        // } else {
                        //     return false;
                        // }


                    });

                    editable = rpt["작성자"] === params.user["인덱스"];

                    $REPORT = $TEMPLATE.clone();
                    $ETC = $REPORT.find("#report-etc");
                    $ETCMOBILE = $REPORT.find(".report-list-etc-mobile");
                    $VISIT = $REPORT.find(".report-list-visit");
                    $CALL = $REPORT.find(".report-list-call");
                    $SERVICE = $REPORT.find(".report-list-service");
                    $REPORT.removeClass("hidden");
                    $REPORT.data("index", rpt["인덱스"]);
                    $REPORT
                        .find(".report-editable")
                        .data("index", rpt["인덱스"]);
                    if (!editable) {
                        $REPORT.find(".report-editable").addClass("hidden");
                    }
                    $REPORT.find(".report-in").addClass("hidden");
                    $REPORT
                        .find("#report-date")
                        .text(
                            moment(rpt["보고일자"]).format("LL") + " 업무보고서"
                        );
                    $REPORT
                        .find("#report-info")
                        .html(
                            "<b>" +
                            rpt["부서명"] +
                            " / " +
                            (rpt["팀명"]
                                ? rpt["팀명"] + " / " + rpt["작성자명"]
                                : rpt["작성자명"]) +
                            "</b>" +
                            '<span class="pull-right"><i class="fa fa-edit"></i> ' +
                            moment(rpt["작성일자"]).format("LLL") +
                            "</span>"
                        );

                    if (visits.length > 0) {
                        $VISIT.parent().attr("id", "visit-" + rpt["인덱스"]);
                        var visitDetail = '';
                        visits.forEach(function (visit) {
                            if (typeof (visit['첨부파일']) !== 'object') {
                                visit['첨부파일'] = JSON.parse(visit['첨부파일'])
                            }
                            if (
                                visit["방문유형"] === CONSTS.VISITTYPE.WATCH ||
                                visit["방문유형"] === CONSTS.VISITTYPE.OFFICE
                            ) {
                                $VISIT.append(
                                    // '     <div class="list-group-item">' +
                                    '         <li class="list-group-item">' +
                                    "             [" +
                                    visit["인덱스"] +
                                    "] " +
                                    visit["유형"] +
                                    "         </li>"
                                    // '     </div>'
                                );
                            } else {

                                visitDetail = `
                                    <a class="list-group-item overflow-ellipsis" data-toggle="collapse" href="#visit-detail-${visit['인덱스']}" aria-expanded="false" aria-controls="visit-detail-${visit['인덱스']}" data-parent="#visit-${visit['인덱스']}">
                                        [${visit['인덱스']}] ${visit['유형'] + " " + visit['기관명칭']}
                                    </a>
                                    <div id="visit-detail-${visit['인덱스']}" class="collapse" aria-expanded="false">
                                        <div class="panel-body">
                                            ${visit['내용'].replace(/\n/gim, "<br>")}
                                            {{첨부파일}}                                            
                                        </div>
                                    </div>
                                `;

                                var attachment, indicator, images;
                                if (visit['첨부파일'].length > 0) {
                                    attachment = `
                                    <div id="carousel-visit-${rpt['인덱스']}" class="carousel slide" data-interval="false" data-ride="carousel">
                                        <ol class="carousel-indicators">
                                            {{인디케이터}}
                                        </ol>
                                        <div class="carousel-inner">
                                        {{이미지}}
                                        </div>
                                        <!-- Left and right controls -->
                                        <a class="left carousel-control" href="#carousel-visit-${rpt['인덱스']}" data-slide="prev">
                                            <span class="glyphicon glyphicon-chevron-left"></span>
                                            <span class="sr-only">Previous</span>
                                        </a>
                                        <a class="right carousel-control" href="#carousel-visit-${rpt['인덱스']}" data-slide="next">
                                            <span class="glyphicon glyphicon-chevron-right"></span>
                                            <span class="sr-only">Next</span>
                                        </a>
                                    </div>
                                `;
                                    indicator = '';
                                    images = ''
                                    visit['첨부파일'].forEach(function (item, index) {
                                        indicator += `<li data-target="#carousel-visit-${rpt['인덱스']}" data-slide-to="${index}" ${index === 0 ? 'active' : ''}></li>`
                                        images += `
                                    <div class="item ${index === 0 ? 'active' : ''}">
                                        <img style="width:100%;" class="upload-file upload-file-${(index + 1)}"
                                            data-imageviewer="true" src="${item['oPath']}"
                                            data-high-src="${item['oPath']}" data-tooltip="tooltip"
                                            title="이미지를 더블클릭하면 크게 볼 수 있습니다." />
                                    </div>
                                    `
                                    });
                                    attachment = attachment.replace('{{인디케이터}}', indicator).replace('{{이미지}}', images);
                                } else { attachment = '' }
                                visitDetail = visitDetail.replace('{{첨부파일}}', attachment);
                                $VISIT.append(visitDetail)
                            }
                        });
                    } else {
                        $VISIT.append(
                            '<div class="list-group-item">방문일지가 없습니다.</div>'
                        );
                    }

                    if (calls.length > 0) {
                        $CALL.parent().attr("id", "call-" + rpt["인덱스"]);
                        calls.forEach(function (call) {
                            // debugger;
                            $CALL.append(
                                // '     <div class="list-group-item">' +
                                '         <a class="list-group-item overflow-ellipsis" data-toggle="collapse" href="#call-detail-' +
                                call["인덱스"] +
                                '" aria-expanded="false" aria-controls="call-detail-' +
                                call["인덱스"] +
                                '" data-parent="#call-' +
                                rpt["인덱스"] +
                                '">' +
                                "             [" +
                                call["인덱스"] +
                                "] " +
                                call["기관명칭"] +
                                (call["USER_ID"] === -1
                                    ? ' <span class="badge">미등록</span>'
                                    : "") +
                                (call["상태"] === 1
                                    ? ' <span class="badge bg-red"><b>미완료</b></span>'
                                    : "") +
                                "         </a>" +
                                // '         <div id="call-detail-' + call['인덱스'] + '" class="collapse" aria-expanded="false"><div class="panel-body">' + call['내용'].replace(/\n/gim, '<br>') + '</div></div>'
                                // '     </div>'
                                '         <div id="call-detail-' +
                                call["인덱스"] +
                                '" class="collapse" aria-expanded="false"><div class="panel-body">' +
                                "           <h5>[문의내용]</h5>" +
                                call["문의내용"].replace(/\n/gim, "<br>") +
                                "           <h5>[처리내용]</h5>" +
                                call["처리내용"].replace(/\n/gim, "<br>") +
                                "           <h5>[기타]</h5>" +
                                call["기타"].replace(/\n/gim, "<br>") +
                                "         </div></div>"
                            );
                        });
                    } else {
                        $CALL.append(
                            '<div class="list-group-item">상담일지가 없습니다.</div>'
                        );
                    }

                    if (services.length > 0) {
                        $SERVICE
                            .parent()
                            .attr("id", "service-" + rpt["인덱스"]);
                        services.forEach(function (service) {
                            $SERVICE.append(`
                                <a class="list-group-item overflow-ellipsis ${service['상태ID'] == 1 || service['상태ID'] == 2 ? 'bg-warning' : ''}"  
                                    data-toggle="collapse" 
                                    href="#service-detail-${service['인덱스']}" 
                                    area-expanded="false" 
                                    aria-controls="service-detail-${service['인덱스']}"
                                    data-parent="#service-${rpt['인덱스']}">
                                    [${service['인덱스']}] ${service['기관명칭']} <small>${service['기관코드']}</small>
                                    <span class="pull-right">${service['상태']}</span>                                    
                                    <span class="pull-right m-r-md">${service['완료일자'] !== '' ? moment(service['완료일자']).format('lll') : ''}</span>
                                </a>
                                <div id="service-detail-${service['인덱스']}"
                                    class="collapse"
                                    aria-expanded="false">
                                    <div class="panel-body">
                                        <table class="table small">
                                            <tr>
                                                <td>${EMR(service["프로그램"]).name}</td>
                                                <td><b>공유자:</b>${service['공유자명']}</td>
                                            </tr>
                                        </table>
                                        <h5>[문의내용]</h5>
                                        ${service["문의내용"].replace(/\n/gim, "<br>")}
                                        <h5>[확인내용]</h5>
                                        ${service["확인내용"].replace(/\n/gim, "<br>")}
                                        <h5>[처리내용]</h5>
                                        ${service["처리내용"].replace(/\n/gim, "<br>")}
                                    </div>
                                </div>
                            `);
                        });
                    } else {
                        $SERVICE.append(
                            '<div class="list-group-item">완료한 A/S가 없습니다.</div>'
                        );
                    }

                    if (
                        typeof rpt["기타업무"] !== "object" ||
                        typeof rpt["기타업무"] === "string"
                    ) {
                        rpt["기타업무"] = JSON.parse(rpt["기타업무"]);
                    }
                    if (
                        typeof rpt["기타업무"] !== "object" ||
                        typeof rpt["기타업무"] === "string"
                    ) {
                        rpt["기타업무"] = JSON.parse(rpt["기타업무"]);
                    }
                    $ETCMOBILE.parent().attr("id", "etc-" + rpt["인덱스"]);

                    rpt["기타업무"].forEach(function (etc, subindex) {
                        $ETC.append(
                            '<tr id="' +
                            etc["id"] +
                            '">' +
                            '   <td data-name="구분">' +
                            etc["구분"] +
                            "</td>" +
                            '   <td data-name="프로그램">' +
                            etc["프로그램"] +
                            "</td>" +
                            '   <td data-name="요청자">' +
                            etc["요청자"] +
                            "</td>" +
                            '   <td data-name="거래처">' +
                            etc["거래처"] +
                            "</td>" +
                            '   <td data-name="상태">' +
                            etc["상태"] +
                            "</td>" +
                            '   <td data-name="내용" style="max-width: 500px;">' +
                            etc["내용"].replace(/\n/gim, "<br>") +
                            "</td>" +
                            "</tr>"
                        );

                        $ETCMOBILE.append(
                            // '     <div class="list-group-item">' +
                            '         <a class="list-group-item" data-toggle="collapse" href="#etc-detail-' +
                            etc["id"] +
                            '" aria-expanded="false" aria-controls="etc-detail-' +
                            etc["id"] +
                            '" data-parent="#etc-' +
                            rpt["인덱스"] +
                            '">' +
                            "             [" +
                            etc["구분"] +
                            "] " +
                            etc["프로그램"] +
                            ' <span class="badge bg-blue">' +
                            etc["상태"] +
                            "</span>" +
                            '               <cite class="text-muted">' +
                            etc["내용"].substring(0, 13) +
                            "...</cite>" +
                            "         </a>" +
                            '         <div id="etc-detail-' +
                            etc["id"] +
                            '" class="collapse" aria-expanded="false">' +
                            '           <div class="panel-body">' +
                            "               <b>요청자</b> " +
                            etc["요청자"] +
                            "<br>" +
                            "               <b>거래처</b> " +
                            etc["거래처"] +
                            "<br>" +
                            "               <h5><b>내용</b></h5>" +
                            etc["내용"].replace(/\n/gim, "<br>") +
                            "           </div>" +
                            "         </div>"
                            // '     </div>'
                        );
                    });

                    $LIST.append($REPORT);
                });
            } else {
                RenderWrite();
            }
        } catch (e) {
            console.log(e);
        }
    }

    function RenderWrite() {
        $REPORTWRITE
            .find("#report-date")
            .text(moment(options.date).format("LL") + " 업무보고서 작성");
        $REPORTWRITE.find("#report-save").removeData("index");
        $REPORTWRITE.removeClass("hidden");
    }

    function RenderEdit(key) {
        var report = reports.reports.find(function (report) {
            return report["인덱스"] == key;
        });

        var $TABLE = $REPORTWRITE.find("table");
        $REPORTWRITE.find("#report-save").data("index", key);
        $REPORTWRITE
            .find("select")
            .selectpicker("val", report["부서"])
            .trigger("changed.bs.select");
        $REPORTWRITE
            .find("#report-date")
            .text(moment(report["보고일자"]).format("LL") + " 업무보고서 수정");
        $REPORTWRITE.find("#report-depart-name").val(report["팀명"]);
        $REPORTWRITE.removeClass("hidden");

        report["기타업무"].forEach(function (etc) {
            $TABLE.append(
                '<tr id="' +
                etc["id"] +
                '">' +
                '   <td data-name="구분">' +
                etc["구분"] +
                "</td>" +
                '   <td data-name="프로그램">' +
                etc["프로그램"] +
                "</td>" +
                '   <td data-name="요청자">' +
                etc["요청자"] +
                "</td>" +
                '   <td data-name="거래처">' +
                etc["거래처"] +
                "</td>" +
                '   <td data-name="상태">' +
                etc["상태"] +
                "</td>" +
                '   <td data-name="내용" style="max-width: 500px;">' +
                etc["내용"].replace(/\n/gim, "<br>") +
                "</td>" +
                '   <td style="width:10%;" class="text-right">' +
                '       <button class="btn btn-default fa fa-edit text-right" data-type="edit" type="button"></button>' +
                '       <button class="btn btn-dark fa fa-trash text-right" data-type="delete" type="button"></button>' +
                "   </td>" +
                "</tr>"
            );
        });
    }

    function InsertRow() {
        var rowData = {};
        var $TABLE = $REPORTWRITE.find("table");
        var $ROW = "";
        $ETCFORM.find("input, textarea").each(function (index, el) {
            rowData[$(el).data("name")] = $(el)
                .val()
                .trim();
        });

        if (rowData.id) {
            $ROW = $TABLE.find("tr#" + rowData.id);
            $ROW.find("td").each(function (index, el) {
                var $EL = $(el);
                if ($EL.data("name")) {
                    $EL.html(
                        rowData[$EL.data("name")].replace(/\n/gim, "<br>")
                    );
                }
            });
            $ETCMODAL.modal("hide");
        } else {
            $ROW += '<tr id="' + moment().format("YYYYMMDDHHmmssSSS") + '">';
            $ROW += '   <td data-name="구분">' + rowData["구분"] + "</td>";
            $ROW +=
                '   <td data-name="프로그램">' + rowData["프로그램"] + "</td>";
            $ROW += '   <td data-name="요청자">' + rowData["요청자"] + "</td>";
            $ROW += '   <td data-name="거래처">' + rowData["거래처"] + "</td>";
            $ROW += '   <td data-name="상태">' + rowData["상태"] + "</td>";
            $ROW +=
                '   <td data-name="내용" style="max-width: 500px;">' +
                rowData["내용"].replace(/\n/gim, "<br>") +
                "</td>";
            $ROW += '   <td style="width:10%;" class="text-right">';
            $ROW +=
                '       <button class="btn btn-default fa fa-edit text-right" data-type="edit" type="button"></button>';
            $ROW +=
                '       <button class="btn btn-dark fa fa-trash text-right" data-type="delete" type="button"></button>';
            $ROW += "   </td>";
            $ROW += "</tr>";

            $TABLE.append($ROW);

            $ETCFORM.trigger("reset");
            $ETCFORM
                .find(":text")
                .eq(0)
                .focus();
        }
    }

    function Save(el) {
        var report = null;
        if (el.data("index")) {
            report = reports.reports.find(function (report) {
                return report["인덱스"] == el.data("index");
            });

            report["부서"] = $REPORTWRITE
                .find("select#report-depart")
                .selectpicker("val")[0];
            report["팀명"] = $REPORTWRITE.find("#report-depart-name").val();

            report["기타업무"] = [];
            $REPORTWRITE
                .find("tbody#report-etc")
                .find("tr")
                .each(function (index, row) {
                    var $ROW = $(row);
                    var rowData = {};
                    rowData["id"] = $ROW.attr("id");
                    $ROW.find("td").each(function (index, el) {
                        var $EL = $(el);
                        if ($EL.data("name")) {
                            rowData[$EL.data("name")] = $EL.html();
                            rowData[$EL.data("name")] = rowData[
                                $EL.data("name")
                            ].replace(/<br>/gim, "\n");
                            // $ETCFORM.find('[data-name="' + $EL.data('name') + '"]').val($EL.html());
                        }
                    });
                    // rowData[$EL.data('name')] = rowData[$EL.data('name')].replace(/<br>/gim, '\n');
                    report["기타업무"].push(rowData);
                });

            axios
                .put(API.REPORT, report)
                .then(function (result) {
                    Load();
                })
                .catch(function (error) {
                    fn.errorNotify(error);
                    Load();
                });
        } else {
            if (
                !$REPORTWRITE.find("#report-depart").selectpicker("val").length
            ) {
                swal("부서를 선택해주세여", "", "error");
                $REPORTWRITE.find("#report-depart").focus();
            } else {
                report = {
                    작성자: params.user["인덱스"],
                    보고일자: options.date,
                    부서: $REPORTWRITE
                        .find("#report-depart")
                        .selectpicker("val")[0],
                    팀명: $REPORTWRITE
                        .find("#report-depart-name")
                        .val()
                        .trim(),
                    기타업무: (function () {
                        var etc = [];
                        $REPORTWRITE
                            .find("tbody#report-etc")
                            .find("tr")
                            .each(function (index, row) {
                                var rowData = {};
                                var $ROW = $(row);
                                rowData["id"] = $ROW.attr("id");
                                $ROW.find("td").each(function (index, el) {
                                    var $EL = $(el);
                                    if ($EL.data("name")) {
                                        rowData[$EL.data("name")] = $EL.html();
                                        rowData[$EL.data("name")] = rowData[
                                            $EL.data("name")
                                        ].replace(/<br>/gim, "\n");
                                    }
                                });
                                etc.push(rowData);
                            });

                        return JSON.stringify(etc);
                    })()
                };

                axios
                    .post(API.REPORT, report)
                    .then(function (result) {
                        Load();
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                        Load();
                    });
            }
        }
    }

    function Delete(key) {
        swal({
            title: "업무보고 삭제",
            text: "해당 업무보고서를 삭제하시겠습니까?",
            type: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33"
        }).then(
            function () {
                axios
                    .delete(API.REPORT, {
                        data: {
                            인덱스: key
                        }
                    })
                    .then(function (result) {
                        Load();
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                        Load();
                    });
            },
            function (dismiss) {
                console.log(dismiss);
            }
        );
    }

    Load();
})(window);
