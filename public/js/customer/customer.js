(function (exports) {
    "use strict";

    var $CUSTOMERPROGRAM = $(".customer-program"),
        $CUSTOMERGWA = $(".customer-gwa"),
        $CUSTOMERSTATUS = $(".customer-status"),
        $CUSTOMERAREA = $(".customer-area"),
        $CUSTOMERMANAGER = $(".customer-manager"),
        $CUSTOMERMASTERUPDATE = $(".customer-master-update"),
        $CUSTOMERSIDO = $(".customer-sido"),
        $CUSTOMERSI = $(".customer-si"),
        $CUSTOMERMAPTOGGLE = $("#toggle-map"),
        $CUSTOMERMAP = $("#map"),
        $CUSTOMERSEARCH = $('input[name="customer-search"]'),
        $CUSTOMERHEADER = $(".customer-list-header").find("th"),
        $CUSTOMERLIST = $(".customer-list"),
        $EXCELEXPORT = $("#export-excel"),
        $CUSTOMERSEARCHBTN = $("button[name='customer-search-button']"),
        $DATACOUNTER = $("#data-count");

    var options = sessionStorage.getItem("customerOption")
        ? JSON.parse(sessionStorage.getItem("customerOption"))
        : {
            status: "0",
            program: "",
            area: params.user["지사코드"],
            manager: "",
            masterUpdate: "",
            search: "",
            sido: "",
            si: "",
            gwa: ""
        };

    var sort = {
        field: "프로그램",
        order: "asc"
    };

    var customers = null;
    if (typeof daum !== "undefined") {
        var mapContainer = document.getElementById("map"), // 지도를 표시할 div
            mapOption = {
                center: new daum.maps.LatLng(
                    37.5663176911162,
                    126.97782838162229
                ), // 지도의 중심좌표
                level: 8 // 지도의 확대 레벨
            };

        // 지도를 생성합니다
        var map = new daum.maps.Map(mapContainer, mapOption);
        // 주소-좌표 변환 객체를 생성합니다
        var geocoder = new daum.maps.services.Geocoder();
    }

    var markers = [];
    var markerInfos = [];
    var overWindowInfo = null;

    $(document).ready(function () {
        exports.fn
            .init_area($CUSTOMERAREA, true)
            .then(function () {

                if (params.user['지사코드'] === '0023' || params.user['지사코드'] == '0028') {
                    $CUSTOMERAREA.removeAttr("disabled")
                    $CUSTOMERAREA.find('option').each(function (index, el) {
                        var $opt = $(el);
                        if (!$opt.val().match(/0023|0028/gim) && $opt.text() !== '전체') {
                            $opt.remove();
                        }
                    });
                    $CUSTOMERAREA.selectpicker('refresh');
                }

                return exports.fn.init_manage($CUSTOMERMANAGER);
            })
            .then(function () {
                if (options.status !== "") {
                    $CUSTOMERSTATUS.selectpicker("val", options.status);
                }
                if (options.program !== "") {
                    $CUSTOMERPROGRAM.selectpicker("val", options.program);
                }
                if (options.gwa !== "") {
                    $CUSTOMERGWA.selectpicker("val", options.gwa);
                }
                if (options.area !== "") {
                    $CUSTOMERAREA.selectpicker("val", options.area);
                }
                if (options.manager !== "") {
                    $CUSTOMERMANAGER.selectpicker("val", options.manager);
                }
                if (options.search !== "") {
                    $CUSTOMERSEARCH.val(options.search);
                }

                $CUSTOMERMASTERUPDATE.selectpicker("val", options.masterUpdate);

                // Load();
            })
            .catch(function () {
                //reject
            });

        exports.JUSO.SIDO.forEach(function (sido) {
            $CUSTOMERSIDO.append(
                '<option value="' +
                sido +
                '" ' +
                (options.sido == sido ? "selected" : "") +
                ">" +
                sido +
                "</option>"
            );
        });
        $CUSTOMERSIDO.selectpicker("refresh");
        $CUSTOMERSIDO.bind("changed.bs.select", function (event) {
            var sido = $(this).selectpicker("val");
            options.sido = sido == "선택없음" ? "" : sido;
            options.si = "";
            $CUSTOMERSI.find("option").remove();
            $CUSTOMERSI.selectpicker("refresh");
            if (options.sido !== "") {
                exports.JUSO.SI[sido].forEach(function (si) {
                    $CUSTOMERSI.append(
                        '<option value="' +
                        si +
                        '" ' +
                        (options.si == si ? "selected" : "") +
                        ">" +
                        si +
                        "</option>"
                    );
                });
                $CUSTOMERSI.selectpicker("refresh");
            }
            // Load();
            setCenterMap(options.sido);
        });

        if (options.sido !== "") {
            exports.JUSO.SI[options.sido].forEach(function (si) {
                $CUSTOMERSI.append(
                    '<option value="' +
                    si +
                    '" ' +
                    (options.si == si ? "selected" : "") +
                    ">" +
                    si +
                    "</option>"
                );
            });
            $CUSTOMERSI.selectpicker("refresh");
        }

        $CUSTOMERSI.bind("changed.bs.select", function (event) {
            options.si = $(this).selectpicker("val");
            options.si = options.si == "선택없음" ? "" : options.si;
            // Load();
            setCenterMap(options.sido + " " + options.si);
        });

        $CUSTOMERMAPTOGGLE.bind("click", function (event) {
            $(this).toggleClass("btn-default btn-primary");
            if ($(this).hasClass("btn-primary")) {
                $CUSTOMERMAP.removeClass("hidden");
                // if (map) map.relayout();
                makeMarker();
                setCenterMap(options.sido + " " + options.si);
            } else {
                $CUSTOMERMAP.addClass("hidden");
            }
        });

        if (typeof daum === "undefined") {
            $CUSTOMERSI.selectpicker("hide");
            $CUSTOMERSIDO.selectpicker("hide");
            $CUSTOMERMAPTOGGLE.hide();
        }
    });

    $CUSTOMERSTATUS.bind("changed.bs.select", function (event) {
        var $THIS = $(this);
        options.status = $THIS.selectpicker("val");
        // Load();
    });

    $CUSTOMERPROGRAM.bind("changed.bs.select", function (event) {
        var $THIS = $(this);
        options.program = $THIS.selectpicker("val");
        // Load();
    });

    $CUSTOMERGWA.bind("changed.bs.select", function (event) {
        var $THIS = $(this);
        options.gwa = $THIS.selectpicker("val");
        // Load();
    });

    $CUSTOMERAREA.bind("changed.bs.select", function (event) {
        var $THIS = $(this);
        options.area = $THIS.selectpicker("val");
        // Load();
    });

    $CUSTOMERMANAGER.bind("changed.bs.select", function (event) {
        var $THIS = $(this);
        options.manager = $THIS.selectpicker("val");
        // Load();
    });

    $CUSTOMERMASTERUPDATE.bind("changed.bs.select", function (event) {
        options.masterUpdate = $(this).selectpicker("val");
        Render();
    });

    $CUSTOMERSEARCH.bind("keyup", function (event) {
        var $THIS = $(this);
        if (event.keyCode === 13) {
            options.search = $THIS.val().trim();
            // if (options.search) {
            Load();
            // }
        }
    });

    $CUSTOMERHEADER.bind("click", function (event) {
        var $THIS = $(this);
        var $SORTICON = $THIS.find("i.sort");
        if (!$THIS.data("field")) return false;

        if ($SORTICON.length) {
            $SORTICON.toggleClass("fa-sort-amount-asc fa-sort-amount-desc");
            sort.order = sort.order === "asc" ? "desc" : "asc";
        } else {
            $THIS
                .siblings()
                .find("i.sort")
                .remove();
            $THIS.append('<i class="m-l-xs fa sort fa-sort-amount-asc"></i>');
            sort.field = $THIS.data("field");
            sort.order = "asc";
        }

        Sorting();
    });

    $CUSTOMERLIST.bind("click", function (event) {
        var $TARGET = $(event.target);
        var $TR = $TARGET.closest("tr");
        var index = $TR.data("index");
        console.log(customers[index]);
        location.href =
            "/customer?id=" +
            customers[index]["ID"] +
            "&hospnum=" +
            customers[index]["기관코드"];
    });

    $CUSTOMERLIST.bind("mouseover", function (event) {
        var $TARGET = $(event.target);
        var $TR = $TARGET.closest("tr");
        var index = $TR.data("index");
        console.log(customers[index]);
        if (customers[index].marker) {
            overWindowInfo = new daum.maps.InfoWindow({
                content:
                    '<div style="width:fit-content;text-align:center;">' +
                    customers[index]["기관명칭"] +
                    "<br>" +
                    customers[index]["주소"] +
                    "</div>"
            });
            overWindowInfo.open(map, customers[index].marker);
            map.setCenter(customers[index].marker.k);
        }
    });

    $CUSTOMERLIST.bind("mouseout", function (event) {
        if (overWindowInfo) {
            overWindowInfo.close();
            overWindowInfo = null;
        }
    });

    $EXCELEXPORT.bind("click", function (event) {
        event.preventDefault();
        window.fn.ExportToExcel($CUSTOMERLIST.closest("table"),
            "거래처리스트" +
            "_" +
            Math.floor(Math.random() * 9999999 + 1000000));
    });

    $CUSTOMERSEARCHBTN.bind("click", function (event) {
        Load();
    });

    function Sorting() {
        if (sort.field === "담당자") {
            if (!options.area.match(/0000|0026|0030|0031/)) {
                sort.field = "담당지사";
            }
        }

        customers = customers.sort(function (a, b) {
            if (sort.order === "asc") {
                return a[sort.field] > b[sort.field]
                    ? 1
                    : a[sort.field] < b[sort.field]
                        ? -1
                        : 0;
            } else {
                return b[sort.field] > a[sort.field]
                    ? 1
                    : b[sort.field] < a[sort.field]
                        ? -1
                        : 0;
            }
        });

        Render();
    }

    function Load() {
        sessionStorage.setItem("customerOption", JSON.stringify(options));

        removeMarkers();
        axios
            .get(API.CUSTOMER.LIST, {
                params: options
            })
            .then(function (result) {
                console.log(result);
                customers = result.data;
                Render();
                makeMarker();
            })
            .catch(function (error) {
                fn.errorNotify(error);
            });
    }

    function makeMarker() {
        if (options.sido !== "" && !$CUSTOMERMAP.hasClass("hidden")) {
            customers.forEach(function (item, index) {
                RenderMaker(item, index);
            });
        }
    }

    function Render() {
        var filterData;

        $CUSTOMERLIST.empty();

        if (options.masterUpdate === "") {
            if (customers.length) {
                customers.forEach(function (element, index) {
                    $CUSTOMERLIST.append(_newItem(element, index));
                });
            } else {
                $CUSTOMERLIST.append(_emptyItem());
            }

            $DATACOUNTER.text(customers.length + "건");
        } else {
            filterData = customers.filter(function (customer) {
                if (options.masterUpdate === "완료") {
                    return (
                        customer["수가"] !== 1 &&
                        customer["약가"] !== 1 &&
                        customer["재료"] !== 1
                    );
                } else if (options.masterUpdate === "미완료") {
                    return (
                        customer["수가"] === 1 ||
                        customer["약가"] === 1 ||
                        customer["재료"] === 1
                    );
                } else if (options.masterUpdate === "미완료2") {
                    return (
                        customer["백업용량"] !== 2 &&
                        (customer["수가"] === 1 ||
                            customer["약가"] === 1 ||
                            customer["재료"] === 1)
                    );
                }
            });

            if (filterData.length) {
                filterData.forEach(function (element, index) {
                    $CUSTOMERLIST.append(_newItem(element, index));
                });
            } else {
                $CUSTOMERLIST.append(_emptyItem());
            }

            $DATACOUNTER.text(filterData.length + "건");
        }

        function _newItem(item, index) {
            var program = EMR(item["프로그램"]).id;
            var $ITEM = "";
            $ITEM += '<tr data-index="{{인덱스}}" class="{{폐업}}">';
            $ITEM +=
                '  <td class="breakpoints-sm breakpoints-xs"><span>{{넘버}}</span></td>';
            $ITEM += "  <td><span>{{기관코드}}</span></td>";
            $ITEM +=
                '  <td class="table-ellipsis"><span>{{기관명칭}} {{요약}}</span></td>';
            $ITEM +=
                '  <td class="breakpoints-sm breakpoints-xs"><span>{{프로그램}}</span></td>';
            $ITEM +=
                '  <td class="breakpoints-sm breakpoints-xs"><span>{{현재버전}}</span></td>';
            $ITEM +=
                '  <td class=""><span>{{담당자}}</span></td>';
            $ITEM +=
                '  <td class="breakpoints-sm breakpoints-xs"><span>{{최근방문일}}</span></td>';
            $ITEM +=
                '  <td class="breakpoints-sm breakpoints-xs"><span>{{유지보수금액}}</span></td>';
            $ITEM +=
                '  <td class="breakpoints-sm breakpoints-xs"><span>{{관계}}</span></td>';
            $ITEM +=
                '  <td class="breakpoints-sm breakpoints-xs"><span>{{백업용량}}</span></td>';
            $ITEM +=
                '  <td class="breakpoints-sm breakpoints-xs">{{상병차수}}</td>';
            $ITEM +=
                '  <td class="breakpoints-sm breakpoints-xs">{{수가}}</td>';
            $ITEM +=
                '  <td class="breakpoints-sm breakpoints-xs">{{약가}}</td>';
            $ITEM +=
                '  <td class="breakpoints-sm breakpoints-xs">{{재료}}</td>';
            $ITEM += "</tr>";

            $ITEM = $ITEM.replace(
                /{{폐업}}/gim,
                item["폐업"] ? "customer-closed" : ""
            );
            $ITEM = $ITEM.replace(/{{인덱스}}/gim, index);
            $ITEM = $ITEM.replace(/{{넘버}}/gim, index + 1);
            $ITEM = $ITEM.replace(/{{기관코드}}/gim, item["기관코드"]);
            $ITEM = $ITEM.replace(/{{기관명칭}}/gim, item["기관명칭"].trim());
            $ITEM = $ITEM.replace(
                /{{프로그램}}/gim,
                item["폐업"]
                    ? ""
                    : '<span class="badge ' +
                    EMR(item["프로그램"]).badge +
                    '">' +
                    item["프로그램"] +
                    "</span>"
            );
            $ITEM = $ITEM.replace(/{{현재버전}}/gim, item["현재버전"]);
            $ITEM = $ITEM.replace(
                /{{담당자}}/gim,
                item["담당지사"] +
                (item["담당자"] ? "(" + item["담당자"] + ")" : "")
            );
            $ITEM = $ITEM.replace(
                /{{최근방문일}}/gim,
                item["최근방문일"].trim()
            );
            $ITEM = $ITEM.replace(
                /{{유지보수금액}}/gim,
                item["유지보수금액"].toLocaleString() + "원"
            );
            $ITEM = $ITEM.replace(
                /{{관계}}/gim,
                (function () {
                    var _color = "";
                    if (item["병원유형ID"] === 1) {
                        _color = "blue";
                    } else if (item["병원유형ID"] === 2) {
                        _color = "red font-bold";
                    }

                    return (
                        '<span class="' +
                        _color +
                        '">' +
                        item["병원유형"] +
                        "</span>"
                    );
                })()
            );
            $ITEM = $ITEM.replace(
                /{{상병차수}}/gim,
                (function () {
                    var val = item["상병차수"];
                    if (val == 0) {
                        val = '';
                    }
                    return (
                        '<span>' +
                        val +
                        "</span>"
                    );
                })()
            );
            $ITEM = $ITEM.replace(
                /{{백업용량}}/gim,
                (function () {
                    if (
                        program === 1 ||
                        program === 8 ||
                        program === 10 ||
                        program === 20 ||
                        program === 21 ||
                        program === 24
                    ) {
                        if (item["백업용량"] === 2) {
                            item["백업정렬"] = 0;
                            return '<span class="text-muted">미사용</span>';
                        } else if (item["백업용량"] === 1) {
                            item["백업정렬"] = 1;
                            return '<span class="red">용량부족</span>';
                        } else {
                            if (item["백업일시"] === 1) {
                                item["백업정렬"] = 2;
                                return '<span class="red">미실행</span>';
                            } else {
                                item["백업정렬"] = 3;
                                return '<span class="blue"><i class="fa fa-check"></i></span>';
                            }
                        }
                    } else {
                        return "";
                    }
                })()
            );
            $ITEM = $ITEM.replace(
                /{{수가}}/gim,
                (function () {
                    item["로컬수가"] = Math.max(
                        item["백업수가"],
                        item["센스수가"],
                        item["메디수가"]
                    ).toString();
                    item["로컬수가"] =
                        item["로컬수가"] == 0 ? "" : item["로컬수가"];
                    if (
                        program === 1 ||
                        program === 8 ||
                        program === 10 ||
                        program === 20 ||
                        program === 21 ||
                        program === 24
                    ) {
                        // if (item['수가'] === 1) {
                        // return '<span class="red"><i class="fa fa-close"></i></span>'
                        return (
                            '<span class="' +
                            (item["마스터수가"] > item["로컬수가"]
                                ? "red"
                                : "blue") +
                            '">' +
                            item["로컬수가"] +
                            "</span>"
                        );
                        // } else {
                        // return '<span class="blue"><i class="fa fa-check"></i></span>';
                        // }
                    } else {
                        return "";
                    }
                })()
            );
            $ITEM = $ITEM.replace(
                /{{약가}}/gim,
                (function () {
                    item["로컬약가"] = Math.max(
                        item["백업약가"],
                        item["센스약가"],
                        item["메디약가"]
                    ).toString();
                    item["로컬약가"] =
                        item["로컬약가"] == 0 ? "" : item["로컬약가"];
                    if (
                        program === 1 ||
                        program === 8 ||
                        program === 10 ||
                        program === 20 ||
                        program === 21 ||
                        program === 24
                    ) {
                        // if (item['약가'] === 1) {
                        //     return '<span class="red"><i class="fa fa-close"></i></span>'
                        // } else {
                        //     return '<span class="blue"><i class="fa fa-check"></i></span>';
                        // }
                        // return '<span class="' + (item['약가'] === 1 ? 'red' : 'blue') + '">' + item['S약가'] + '</span>'
                        return (
                            '<span class="' +
                            (item["마스터약가"] > item["로컬약가"]
                                ? "red"
                                : "blue") +
                            '">' +
                            item["로컬약가"] +
                            "</span>"
                        );
                    } else {
                        return "";
                    }
                })()
            );
            $ITEM = $ITEM.replace(
                /{{재료}}/gim,
                (function () {
                    item["로컬재료"] = Math.max(
                        item["백업재료"],
                        item["센스재료"],
                        item["메디재료"]
                    ).toString();
                    item["로컬재료"] =
                        item["로컬재료"] == 0 ? "" : item["로컬재료"];
                    if (
                        program === 1 ||
                        program === 8 ||
                        program === 10 ||
                        program === 20 ||
                        program === 21 ||
                        program === 24
                    ) {
                        // if (item['재료'] === 1) {
                        //     return '<span class="red"><i class="fa fa-close"></i></span>'
                        // } else {
                        //     return '<span class="blue"><i class="fa fa-check"></i></span>';
                        // }
                        // return '<span class="' + (item['재료'] === 1 ? 'red' : 'blue') + '">' + item['S재료'] + '</span>'
                        return (
                            '<span class="' +
                            (item["마스터재료"] > item["로컬재료"]
                                ? "red"
                                : "blue") +
                            '">' +
                            item["로컬재료"] +
                            "</span>"
                        );
                    } else {
                        return "";
                    }
                })()
            );

            $ITEM = $ITEM.replace(
                /{{요약}}/gim,
                (function () {
                    var _summ = "";
                    if (
                        program === 1 ||
                        program === 8 ||
                        program === 10 ||
                        program === 20 ||
                        program === 21 ||
                        program === 24
                    ) {
                        if (item["백업용량"] === 1) {
                            _summ +=
                                '<i class="fa fa-exclamation-circle"></i>용량 ';
                        }
                        if (item["백업일시"] === 1) {
                            _summ +=
                                '<i class="fa fa-exclamation-circle"></i>백업 ';
                        }
                        if (
                            item["수가"] === 1 ||
                            item["약가"] === 1 ||
                            item["재료"] === 1
                        ) {
                            _summ +=
                                '<i class="fa fa-exclamation-circle"></i>약수치 ';
                        }

                        _summ = '<small class="red">' + _summ + "</small>";
                    }
                    return _summ;
                })()
            );

            return $ITEM;
        }

        function _emptyItem() { }
    }

    function RenderMaker(hosp, index) {
        // 주소로 좌표를 검색합니다
        geocoder.addressSearch(hosp["주소"], function (result, status) {
            // 정상적으로 검색이 완료됐으면
            if (status === daum.maps.services.Status.OK) {
                var coords = new daum.maps.LatLng(result[0].y, result[0].x);

                // 결과값으로 받은 위치를 마커로 표시합니다
                var marker = new daum.maps.Marker({
                    map: map,
                    position: coords
                });

                marker.setMap(map);
                markers.push(marker);
                customers[index].marker = marker;

                // 인포윈도우로 장소에 대한 설명을 표시합니다
                var infowindow = new daum.maps.InfoWindow({
                    content:
                        '<div style="width:fit-content;text-align:center;">' +
                        hosp["기관명칭"] +
                        "<br>" +
                        hosp["주소"] +
                        "</div>"
                });
                // markerInfos.push(infowindow)
                // infowindow.open(map, marker);

                // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
                // map.setCenter(coords);
                daum.maps.event.addListener(marker, "mouseover", function () {
                    infowindow.open(map, marker);
                });
                daum.maps.event.addListener(marker, "mouseout", function () {
                    infowindow.close();
                });
            }
        });
    }

    function setCenterMap(address) {
        geocoder.addressSearch(address, function (result, status) {
            if (status === daum.maps.services.Status.OK) {
                var coords = new daum.maps.LatLng(result[0].y, result[0].x);
                map.setCenter(coords);
            }
        });
    }

    function removeMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }
})(window);
