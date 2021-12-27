(function (exports) {

    'use strict';

    var $SERVICEDESKTOP = $('#service-desktop'),
        $SERVICEAREA = $('.selectpicker.history-area'),
        $SERVICEHEADER = $('thead').find('th'),
        $SERVICEHISTORYDEVBTN = $('button[name="history-dev-btn"]'),
        $SERVICEALLBODY = $('table.service-list').find('tbody'),
        $SERVICEDEVBODY = $('table.service-dev-list').find('tbody');


    var $SERVICEEMR = $('.selectpicker.history-emr'),
        $SERVICESHARE = $('.selectpicker.history-share'),
        $SERVICEDONE = $('.selectpicker.history-done'),
        $SERVICESTATUS = $('.selectpicker.history-status'),
        $SERVICEHOSPITAL = $('.selectpicker.history-hospital'),
        $SERVICESEARCH = $('input[name="history-search"]'),
        $SERVICESEARCHBTN = $('button[name="history-search-btn"]'),
        $SERVICEEXE = $('.selectpicker.history-exe'),
        $SERVICEMENU = $('select.history-menu'),
        $SERVICEMENUBUTTON = $('select.history-button'),
        $SERVICEHOSPTYPE = $('.selectpicker.history-type'),
        $SERVICEEXCELEXPORT = $('#export-excel');

    var options = sessionStorage.getItem('historyOption') ? JSON.parse(sessionStorage.getItem('historyOption')) : {
        date: {
            start: moment().format('YYYY-MM-DD'),
            end: moment().format('YYYY-MM-DD')
        },
        area: params.user['지사코드'],
        dev: false,
        emr: [1, 8, 10, 20, 21],
        share: '',
        done: '',
        status: ["0", "1", "2", "3", "4", "6", "7"],
        hospital: '',
        search: '',
        exe: '',
        menu: '',
        button: '',
        new: 0,
        relation: null
    };

    var sort = sessionStorage.getItem('historySort') ? JSON.parse(sessionStorage.getItem('historySort')) : {
        field: '접수일자',
        order: 'asc'
    };

    var services = null;
    var finderUsage = null;

    // $('.selectpicker').each(function (i, v) {
    //     if ($(v).attr('multiple')) {
    //         $(v).selectpicker('selectAll');
    //     }
    // });
    var loaded = false
    exports.fn.init_area($SERVICEAREA)
        .then(function () {
            return exports.fn.init_users($SERVICESHARE)
            // loaded = true


        }).then(function () {
            return exports.fn.init_users($SERVICEDONE)
        }).then(function () {
            $SERVICEAREA.attr('disabled', false).selectpicker('refresh');
            $SERVICESHARE.attr('disabled', false).selectpicker('refresh');
            $SERVICEDONE.attr('disabled', false).selectpicker('refresh');

            $SERVICEEMR.selectpicker('val', options.emr)
            $SERVICEAREA.selectpicker('val', options.area)
            $SERVICESHARE.selectpicker('val', options.share)
            $SERVICEDONE.selectpicker('val', options.done)
            $SERVICESTATUS.selectpicker('val', options.status)
            if (options.exe !== '') {
                $SERVICEEXE.selectpicker('val', options.exe.replace(/'/gim, "").split(','));
            }
            $SERVICEHOSPTYPE.selectpicker('val', (function () {
                var values = [];
                if (options.new != 0) {
                    values.push('신규');
                }
                if (options.relation !== null) {
                    values.push(options.relation)
                }
                return values;
            })())
            loaded = true
            if (options.dev) {
                $SERVICEHISTORYDEVBTN.addClass('btn-primary').removeClass('btn-default')
            } else {
                $SERVICEHISTORYDEVBTN.addClass('btn-default').removeClass('btn-primary')
            }
        })


    $SERVICEAREA.bind('changed.bs.select', function (event) {
        var $THIS = $(this);
        options.area = $THIS.selectpicker('val');
        // if (loaded) {
        //     ServiceHistory();
        // }
    });

    $SERVICEEMR.bind('changed.bs.select', function (event) {
        var $THIS = $(this);
        options.emr = $THIS.selectpicker('val');
        // if (loaded) {
        //     ServiceHistory();
        // }
    });

    $SERVICESHARE.bind('changed.bs.select', function (event) {
        var $THIS = $(this);
        options.share = $THIS.selectpicker('val');
        // if (loaded) {
        //     ServiceHistory();
        // }
    });

    $SERVICEDONE.bind('changed.bs.select', function (event) {
        var $THIS = $(this);
        options.done = $THIS.selectpicker('val');
        // if (loaded) {
        //     ServiceHistory();
        // }
    });

    $SERVICESTATUS.bind('changed.bs.select', function (event) {
        var $THIS = $(this);
        options.status = $THIS.selectpicker('val');
        // if (loaded) {
        //     ServiceHistory();
        // }
    });

    $SERVICEEXE.bind('changed.bs.select', function (event) {
        var $THIS = $(this);
        options.exe = "'" + $THIS.selectpicker('val').join("','") + "'";
        if (options.exe !== "" && options.program !== "") {

            $('.history-tag-menu').removeClass('hidden');
            $SERVICEMENU.empty();

            LoadCategorys($THIS.selectpicker('val').join("','"), "", options.program, options.date)
                .then(function (result) {
                    result.forEach(function (menu) {
                        $SERVICEMENU.append(`<option value="${menu['실행메뉴']}">${menu['실행메뉴']}</option>`)
                    });
                    $SERVICEMENU.selectpicker('refresh');
                });
        } else {
            $('.history-tag-menu').addClass('hidden');
        }
    });

    $SERVICEMENU.bind('changed.bs.select', function (event) {
        options.menu = $(this).selectpicker("val");
        $SERVICEMENUBUTTON.empty();

        LoadCategorys($SERVICEEXE.selectpicker('val').join("','"), options.menu, options.program, options.date)
            .then(function (result) {
                result.forEach(function (menu) {
                    $SERVICEMENUBUTTON.append(`<option value="${menu['세부화면']}">${menu['세부화면']}</option>`)
                });
                $SERVICEMENUBUTTON.selectpicker('refresh');
            });
    });

    $SERVICEMENUBUTTON.bind('changed.bs.select', function (event) {
        options.button = $(this).selectpicker('val');
    });



    $SERVICEHOSPTYPE.bind('changed.bs.select', function (event) {
        var values = $(this).selectpicker('val')
        if (values.length == 2) {
            options.new = 1;
            options.relation = parseInt(values[1]);
        } else if (values[0] === '신규') {
            options.new = 1;
            options.relation = null;
        } else if (values[0] >= 0) {
            options.new = 0;
            options.relation = parseInt(values[0]);
        }
        // console.log(options.new, options.relation);
    });

    $SERVICESEARCH.bind('keyup', function (event) {
        event.preventDefault();
        var $THIS = $(this)
        if (event.keyCode === 13) {
            options.search = $THIS.val().trim()
            // if (!_this.options.search) {
            // swal('A/S 오류', '검색어를 입력해주세요.', 'error');
            // $THIS.focus();
            // } else {
            $SERVICESEARCH.val(options.search.trim())
            ServiceHistory();
            // }
        }
        // var keyword = $(this).val().trim().toLowerCase();
        // $('.tab-content .accordion .panel').filter(function(){
        //     $(this).toggle($(this).text().toLowerCase().indexOf(keyword) > -1);
        // });
    });


    $SERVICEHISTORYDEVBTN.bind('click', function (event) {
        loaded = false
        options.dev = !options.dev
        if (options.dev) {
            options.status = ["1", "2", "3", "4"]
            options.emr = [8, 20]
            $SERVICESTATUS.selectpicker('val', options.status)
            $SERVICEEMR.selectpicker('val', options.emr)
            $SERVICEHISTORYDEVBTN.addClass('btn-primary').removeClass('btn-default')
        } else {
            options.status = ["0", "1", "2", "3", "4", "6", "7"]
            options.emr = [1, 8, 10, 20, 21]
            $SERVICESTATUS.selectpicker('val', options.status)
            $SERVICEEMR.selectpicker('val', options.emr)
            $SERVICEHISTORYDEVBTN.addClass('btn-default').removeClass('btn-primary')
        }
        loaded = true
        // ServiceHistory();
        // toggleColumn()
        // Sorting()
    })

    $SERVICEHOSPITAL.selectpicker({
        liveSearch: true,
        size: 10
    })
        .ajaxSelectPicker({
            ajax: {
                url: API.CUSTOMER.LIST,
                method: 'GET',
                dataType: 'json',
                data: function () {
                    var params = {
                        search: '{{{q}}}'
                    };
                    // debugger;
                    // if (gModel.selectedGroup().hasOwnProperty('ContactGroupID')) {
                    //     params.GroupID = gModel.selectedGroup().ContactGroupID;
                    // }
                    return params;
                }
            },
            locale: {
                emptyTitle: '병원코드, 명칭으로 검색...'
            },
            preprocessData: function (data) {

                var hosps = [];
                data.forEach(function (hosp) {
                    // hosps[hosp['ID']] = hosp['기관명칭'];
                    hosps.push({
                        'value': hosp['기관코드'],
                        'text': hosp['기관명칭'] + '/' + hosp['담당지사'],
                        'disabled': false
                    })
                });

                return hosps;
            },
            preserveSelected: false
        });
    $SERVICEHOSPITAL.bind('changed.bs.select', function (event) {
        options.hospital = $(this).selectpicker('val');
        // if (loaded) {
        //     ServiceHistory()
        // }
    });

    $SERVICESEARCHBTN.bind('click', function (event) {
        options.search = $SERVICESEARCH.val().trim();
        ServiceHistory()
    });

    $SERVICEEXCELEXPORT.bind("click", function (event) {
        event.preventDefault();
        window.fn.ExportToExcel($('table.service-list'),
            "AS내역" +
            "_" +
            Math.floor(Math.random() * 9999999 + 1000000));
    });


    function toggleColumn() {
        sessionStorage.setItem('historyOption', JSON.stringify({
            date: HistoryDatePicker.value,
            area: options.area,
            dev: options.dev,
            emr: options.emr,
            share: options.share,
            done: options.done,
            status: options.status,
            hospital: '', //options.hospital
            search: options.search,
            exe: options.exe,
            new: options.new,
            relation: options.relation
        }))
        var $STATICLIST = $('.history-static-list')

        if (options.dev) {
            $SERVICEALLBODY.closest('table').addClass('hidden')
            $SERVICEDEVBODY.closest('table').removeClass('hidden')
            $('.history-dev-help').removeClass('hidden')
            $STATICLIST.addClass('hidden')
        } else {
            $SERVICEALLBODY.closest('table').removeClass('hidden')
            $SERVICEDEVBODY.closest('table').addClass('hidden')
            $('.history-dev-help').addClass('hidden')
            $STATICLIST.removeClass('hidden')
        }


        // var $SERVICELIST = $('.service-list')

        // if (options.dev) {
        //     $SERVICELIST.find('.history-all').addClass('hidden')
        //     $STATICLIST.addClass('hidden')
        //     $SERVICELIST.find('.history-dev').removeClass('hidden')
        // } else {
        //     $SERVICELIST.find('.history-dev').addClass('hidden')
        //     $STATICLIST.removeClass('hidden')
        //     $SERVICELIST.find('.history-all').removeClass('hidden')
        // }
    }

    $SERVICEHEADER.bind('click', function (event) {
        var $THIS = $(this);
        var $SORTICON = $THIS.find('i.sort');
        if (!$THIS.data('field')) return false;

        if ($SORTICON.length) {
            $SORTICON.toggleClass('fa-sort-amount-asc fa-sort-amount-desc');
            sort.order = sort.order === 'asc' ? 'desc' : 'asc';
        } else {
            $THIS.siblings().find('i.sort').remove();
            $THIS.append('<i class="m-l-xs fa sort fa-sort-amount-asc"></i>');
            sort.field = $THIS.data('field');
            sort.order = 'asc';
        }

        sessionStorage.setItem('historySort', JSON.stringify(sort))

        Sorting();
    });

    $('tbody').bind('click', function (event) {
        var $THIS;
        var collpaseTarget;
        if (event.target.tagName === 'TD') {
            $THIS = $(event.target);
            if ($THIS.index() > 0) {
                collpaseTarget = $THIS.closest('tr').data('target')
                $(collpaseTarget).collapse('toggle')
            }
        }

    })


    var HistoryDatePicker = new myDatePicker('.datepicker.service');
    HistoryDatePicker.fn.init({
        start: options.date.start,
        end: options.date.end
    }, function () { });


    function ServiceHistory() {

        sessionStorage.setItem('historyOption', JSON.stringify({
            date: HistoryDatePicker.value,
            area: options.area,
            dev: options.dev,
            emr: options.emr,
            share: options.share,
            done: options.done,
            status: options.status,
            hospital: options.hospital,
            search: options.search,
            exe: options.exe,
            menu: options.menu,
            button: options.button,
            new: options.new,
            relation: options.relation
        }))

        axios.get(API.SERVICE.HISTORY, {
            params: {
                date: HistoryDatePicker.value,
                area: options.area,
                emr: options.emr,
                share: options.share,
                done: options.done,
                status: options.status,
                hospital: options.hospital,
                search: options.search,
                exe: options.exe,
                menu: options.menu,
                button: options.button,
                new: options.new,
                relation: options.relation
            }
        }).then(function (result) {
            services = result.data;
            return axios.get(API.STATIC.ASFINDER, {
                params: {
                    date: HistoryDatePicker.value
                }
            })
            // Sorting();
        }).then(function (finderResult) {
            finderUsage = finderResult.data
            return duringTime()
        }).then(function () {
            Sorting();
            toggleColumn()
        }).catch(function (error) {
            fn.errorNotify(error);
        });

    }

    function duringTime() {
        return new Promise(function (resolve, reject) {
            var confirmTime = ''
            var start, end, during
            var area = options.area.match(/0000|0030|0031|0026|0034/gim) ? false : true
            services.forEach(function (service, pos) {
                start = end = during = 0
                service['확인시간'] = service['완료시간'] = service['전체시간'] = ''
                service['확인자명'] = service['확인자명'] || service['공유자명'] || service['보류자명'] || service['처리자명'];

                // if (!area) {
                //     confirmTime = service['확인일자']
                // } else {
                confirmTime = service['확인일자'] || service['공유일자'] || service['보류일자'] || service['처리일자'];
                // }

                if (confirmTime) {
                    start = moment(confirmTime);
                    end = moment(service['접수일자']);

                    during = start.diff(end, 'minutes')
                    if (during >= 60) {
                        during = start.diff(end, 'hours');
                        if (during >= 24) {
                            during = start.diff(end, 'days');
                            during += '일';
                        } else {
                            during += '시간';
                        }
                    } else {
                        during += '분';
                    }
                    service['확인시간'] = during
                    if (service['완료일자'] !== '') {
                        end = start;
                        start = moment(service['완료일자']);
                        during = start.diff(end, 'minutes')
                        if (during >= 60) {
                            during = start.diff(end, 'hours');
                            if (during >= 24) {
                                during = start.diff(end, 'days');
                                during += '일';
                            } else {
                                during += '시간';
                            }
                        } else {
                            during += '분';
                        }
                        service['완료시간'] = during

                        end = moment(service['접수일자']);
                        during = start.diff(end, 'minutes')
                        if (during >= 60) {
                            during = start.diff(end, 'hours');
                            if (during >= 24) {
                                during = start.diff(end, 'days');
                                during += '일';
                            } else {
                                during += '시간';
                            }
                        } else {
                            during += '분';
                        }
                        service['전체시간'] = during
                    }
                }

            })
            resolve()
        })
    }

    function Sorting() {

        services = services.sort(function (a, b) {
            var _a, _b
            if (sort.field.match(/확인시간|완료시간|전체시간/)) {

                _a = a[sort.field].indexOf('시간') > -1 ? (a[sort.field].replace('시간', '')) * 60 : a[sort.field].replace('분', '')
                _b = b[sort.field].indexOf('시간') > -1 ? (b[sort.field].replace('시간', '')) * 60 : b[sort.field].replace('분', '')

            } else {
                _a = a[sort.field]
                _b = b[sort.field]
            }

            if ($.isNumeric(_a) && $.isNumeric(_b)) {
                _a = parseInt(_a)
                _b = parseInt(_b)
            }

            if (sort.order === 'asc') {
                return (_a > _b) ? 1 : ((_a < _b) ? -1 : 0);
            } else {

                return (_b > _a) ? 1 : ((_b < _a) ? -1 : 0);
            }
        });


        Render()
            .then(function () {
                RenderStatic();
            })
    }

    function RenderStatic() {
        try {
            var tempArray;
            var confirmPerson = [],
                completePerson = [];

            //확인자 추출
            tempArray = services.filter(function (service) {
                return service['확인자'] > 0
            }).map(function (service) {
                return {
                    id: service['확인자'],
                    name: service['확인자명'],
                    lt10: 0,
                    lt20: 0,
                    lt30: 0,
                    lt40: 0,
                    lt50: 0,
                    lt1h: 0,
                    lt2h: 0,
                    mt2h: 0,
                    total: 0
                }
            });
            confirmPerson = tempArray.filter(function (obj, pos, arr) {
                return arr.map(function (mapObj) {
                    return mapObj['id'];
                }).indexOf(obj['id']) === pos;
            });

            // 완료자 추출
            tempArray = services.filter(function (service) {
                return service['완료자'] > 0
            }).map(function (service) {
                return {
                    id: service['완료자'],
                    name: service['완료자명'],
                    lt10: 0,
                    lt20: 0,
                    lt30: 0,
                    lt40: 0,
                    lt50: 0,
                    lt1h: 0,
                    lt2h: 0,
                    mt2h: 0,
                    total: 0,
                    finderUsage: 0
                }
            });
            completePerson = tempArray.filter(function (obj, pos, arr) {
                return arr.map(function (mapObj) {
                    return mapObj['id'];
                }).indexOf(obj['id']) === pos;
            });

            var start, end, during;
            var _confirmP = null,
                _completeP = null,
                _finderUser = null;
            services.forEach(function (service) {

                _confirmP = null;
                _completeP = null;
                _finderUser = null;

                _confirmP = confirmPerson.find(function (person) {
                    return person.id === service['확인자']
                });

                _completeP = completePerson.find(function (person) {
                    return person.id === service['완료자']
                })

                if (_confirmP) {
                    // start = moment(service['확인일자']);
                    // end = moment(service['접수일자']);

                    // during = start.diff(end, 'minutes')
                    during = (function () {
                        var _during = parseInt(service['확인시간'].replace(/분|시간/gim, ''))
                        if (service['확인시간'].lastIndexOf('시간') >= 0) {
                            return _during * 60
                        } else return _during
                    })()

                    if (during >= 120) {
                        _confirmP.mt2h += 1;
                    } else if (during < 120 && during >= 60) {
                        _confirmP.lt2h += 1;
                    } else if (during < 60 && during >= 50) {
                        _confirmP.lt1h += 1;
                    } else if (during < 50 && during >= 40) {
                        _confirmP.lt50 += 1;
                    } else if (during < 40 && during >= 30) {
                        _confirmP.lt40 += 1;
                    } else if (during < 30 && during >= 20) {
                        _confirmP.lt30 += 1;
                    } else if (during < 20 && during >= 10) {
                        _confirmP.lt20 += 1;
                    } else if (during < 10) {
                        _confirmP.lt10 += 1;
                    }

                    _confirmP.total += 1;
                }

                if (_completeP) {
                    // start = moment(service['완료일자']);
                    // end = moment(service['접수일자']);

                    // during = start.diff(end, 'minutes')
                    // during = parseInt(service['완료시간'].replace(/분|시간/gim, ''))
                    during = (function () {
                        var _during = parseInt(service['완료시간'].replace(/분|시간/gim, ''))
                        if (service['완료시간'].lastIndexOf('시간') >= 0) {
                            return _during * 60
                        } else return _during
                    })()

                    if (during >= 120) {
                        _completeP.mt2h += 1;
                    } else if (during < 120 && during >= 60) {
                        _completeP.lt2h += 1;
                    } else if (during < 60 && during >= 50) {
                        _completeP.lt1h += 1;
                    } else if (during < 50 && during >= 40) {
                        _completeP.lt50 += 1;
                    } else if (during < 40 && during >= 30) {
                        _completeP.lt40 += 1;
                    } else if (during < 30 && during >= 20) {
                        _completeP.lt30 += 1;
                    } else if (during < 20 && during >= 10) {
                        _completeP.lt20 += 1;
                    } else if (during < 10) {
                        _completeP.lt10 += 1;
                    }

                    _completeP.total += 1;

                    if (_completeP.finderUsage <= 0) {
                        _finderUser = finderUsage.find(function (finder) {
                            return finder['USER_ID'] === _completeP.id
                        })
                        if (_finderUser) {
                            _completeP.finderUsage = _finderUser['건수']
                        }
                    }

                }


            });

            var total = {
                lt10: 0,
                lt20: 0,
                lt30: 0,
                lt40: 0,
                lt50: 0,
                lt1h: 0,
                lt2h: 0,
                mt2h: 0,
                total: 0
            };
            var $STATIC1 = $('#history-static-1'),
                $STATIC2 = $('#history-static-2');
            $STATIC1.empty();
            $STATIC2.empty();

            confirmPerson.sort(function (a, b) {
                return a.name > b.name ? 1 : (a.name < b.name ? -1 : 0);
            });
            completePerson.sort(function (a, b) {
                return a.name > b.name ? 1 : (a.name < b.name ? -1 : 0);
            });

            confirmPerson.forEach(function (person) {
                Object.keys(total).forEach(function (key) {
                    total[key] += person[key];
                });
                $STATIC1.append(
                    '<tr>' +
                    '    <th class="text-center">' + person.name + '</th>' +
                    '    <td class="text-right" data-content="' + person.lt10 + '">' + person.lt10 + '</td>' +
                    '    <td class="text-right" data-content="' + person.lt20 + '">' + person.lt20 + '</td>' +
                    '    <td class="text-right" data-content="' + person.lt30 + '">' + person.lt30 + '</td>' +
                    '    <td class="text-right" data-content="' + person.lt40 + '">' + person.lt40 + '</td>' +
                    '    <td class="text-right" data-content="' + person.lt50 + '">' + person.lt50 + '</td>' +
                    '    <td class="text-right" data-content="' + person.lt1h + '">' + person.lt1h + '</td>' +
                    '    <td class="text-right" data-content="' + person.lt2h + '">' + person.lt2h + '</td>' +
                    '    <td class="text-right" data-content="' + person.mt2h + '">' + person.mt2h + '</td>' +
                    '    <td class="bg-success text-right h5" data-content="' + person.total + '">' + person.total + '</td>' +
                    '    <td></td>' +
                    '</tr>'
                );
            })
            $STATIC1.append(
                '<tr>' +
                '    <th class="bg-green text-center">TOTAL</th>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt10 + '">' + total.lt10 + '(' + (Math.ceil(total.lt10 / total.total * 100)) + '%)</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt20 + '">' + total.lt20 + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt30 + '">' + total.lt30 + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt40 + '">' + total.lt40 + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt50 + '">' + total.lt50 + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt1h + '">' + total.lt1h + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt2h + '">' + total.lt2h + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.mt2h + '">' + total.mt2h + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.total + '">' + total.total + '</td>' +
                '    <td></td>' +
                '</tr>'
            );

            total = {
                lt10: 0,
                lt20: 0,
                lt30: 0,
                lt40: 0,
                lt50: 0,
                lt1h: 0,
                lt2h: 0,
                mt2h: 0,
                total: 0,
                finderUsage: 0
            };

            completePerson.forEach(function (person) {
                Object.keys(total).forEach(function (key) {
                    total[key] += person[key];
                });
                $STATIC2.append(
                    '<tr>' +
                    '    <th class="text-center">' + person.name + '</th>' +
                    '    <td class="text-right" data-content="' + person.lt10 + '">' + person.lt10 + '</td>' +
                    '    <td class="text-right" data-content="' + person.lt20 + '">' + person.lt20 + '</td>' +
                    '    <td class="text-right" data-content="' + person.lt30 + '">' + person.lt30 + '</td>' +
                    '    <td class="text-right" data-content="' + person.lt40 + '">' + person.lt40 + '</td>' +
                    '    <td class="text-right" data-content="' + person.lt50 + '">' + person.lt50 + '</td>' +
                    '    <td class="text-right" data-content="' + person.lt1h + '">' + person.lt1h + '</td>' +
                    '    <td class="text-right" data-content="' + person.lt2h + '">' + person.lt2h + '</td>' +
                    '    <td class="text-right" data-content="' + person.mt2h + '">' + person.mt2h + '</td>' +
                    '    <td class="bg-success text-right h5" data-content="' + person.total + '">' + person.total + '</td>' +
                    '    <td class="bg-danger text-right h5" data-content="' + person.finderUsage + '">' + person.finderUsage + '</td>' +
                    '</tr>'
                );
            })
            $STATIC2.append(
                '<tr>' +
                '    <th class="bg-green text-center">TOTAL</th>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt10 + '">' + total.lt10 + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt20 + '">' + total.lt20 + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt30 + '">' + total.lt30 + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt40 + '">' + total.lt40 + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt50 + '">' + total.lt50 + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt1h + '">' + total.lt1h + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.lt2h + '">' + total.lt2h + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.mt2h + '">' + total.mt2h + '</td>' +
                '    <td class="bg-success text-right h5" data-content="' + total.total + '">' + total.total + '</td>' +
                '    <td class="bg-danger text-right h5" data-content="' + total.finderUsage + '">' + total.finderUsage + '</td>' +
                // '    <td></td>' +
                '</tr>' +
                '<tr>' +
                '    <th class="bg-blue text-center">평균소요시간</th>' +
                '    <td class="bg-info h5" colspan="10">' + Math.ceil(((total.lt10 * 4.5) + (total.lt20 * 14.5) + (total.lt30 * 24.5) + (total.lt40 * 34.5) + (total.lt50 * 44.5) + (total.lt1h * 54.5) + (total.lt2h * 89.5) + (total.mt2h * 120)) / total.total) + '분</td>' +
                '</tr>'
            );

        } catch (error) {
            fn.errorNotify(error);
        }
    }

    function Render() {

        return new Promise(function (resolve, reject) {
            try {
                var $ROW, $DEVROW;
                // var during, start, end;
                // var week, day, hour, minutes;
                // var confirmTime;
                var satisfaction, satisfactionClass;

                // $SERVICEDESKTOP.empty();
                $SERVICEALLBODY.empty();
                $SERVICEDEVBODY.empty();

                services.forEach(function (service, pos) {

                    if (service['만족도'] == 1) {
                        satisfaction = "만족";
                        satisfactionClass = "bg-green"
                    } else if (service['만족도'] == 2) {
                        satisfaction = "보통";
                        satisfactionClass = "bg-orange"
                    } else if (service['만족도'] == 3) {
                        satisfaction = "불만족";
                        satisfactionClass = "bg-red"
                    } else {
                        satisfaction = ""
                        satisfactionClass = ""
                    }


                    var params = {
                        index: service['인덱스'],
                        id: service['USER_ID'],
                        hospnum: service['기관코드']
                    }

                    // service['확인자명'] = service['확인자명'] || service['공유자명'] || service['보류자명'] || service['처리자명'];
                    $ROW = $('<tr data-target="#all-comment-' + service['인덱스'] + '" />');
                    $ROW.attr('data-index', pos);
                    $ROW.append('<td style="width:10px;"><a href="/service/history/detail?' + $.param(params) + '"><i class="fa fa-search"></i></a></td>');
                    $ROW.append('<td>' + service['인덱스'] + '</td>');
                    $ROW.append('<td>' + service['기관코드'] + '</td>');
                    $ROW.append('<td>' + service['기관명칭'] + '</td>');
                    $ROW.append('<td>' + service['프로그램명'] + '</td>');
                    $ROW.append('<td>' + (service['신규'] <= 3 ? '<span class="badge bg-red">NEW</span>' : '') + '</td>');
                    $ROW.append('<td>' + ((function () {
                        if (service["병원유형"] == 0) {
                            return '<span class="badge">보통</span>';
                        } else if (service["병원유형"] == 1) {
                            return '<span class="badge bg-blue">우수</span>';
                        } else {
                            return '<span class="badge bg-red">주의</span>';
                        }
                    })()) + '</td>');
                    // $ROW.append('<td class="history-dev">' + service['실행파일'] + '</td>');
                    $ROW.append('<td>' + service['상태명'] + '</td>');
                    $ROW.append('<td class="' + satisfactionClass + '">' + satisfaction + '</td>');
                    $ROW.append('<td class="text-center red">' + (service['응급'] == 1 ? '<i class="fa fa-exclamation-circle"></i> 응급' : '') + '</td>');
                    $ROW.append('<td>' + service['지사명'] + '</td>');
                    $ROW.append('<td>' + service['담당자명'] + '</td>');
                    $ROW.append('<td class="text-right">' + service['접수일'] + '(' + moment(service['접수일자']).fromNow() + ')</td>');
                    $ROW.append(`
                        <td class="text-right">
                            ${!service['처리예정일'].length ? '' :
                            service['처리예정일']
                        }
                        </td>
                    `);

                    $ROW.append('<td>' + service['확인자명'] + '</td>');
                    $ROW.append('<td>' + service['처리자명'] + '</td>');
                    // $ROW.append('<td class="history-dev">' + service['공유자명'] + '</td>');
                    // $ROW.append('<td class="history-dev">' + (service['공유일자'].length ? moment(service['공유일자']).format('YYYY-MM-DD') : '') + '</td>');
                    $ROW.append('<td>' + service['완료자명'] + '</td>');
                    $ROW.append('<td class="text-center">' + (service['댓글수'] === 0 ? '-' : service['댓글수']) + '</td>');
                    // $ROW.append('<td class="history-dev">' + (service['완료일자'].length ? moment(service['완료일자']).format('YYYY-MM-DD') : '') + '</td>');
                    // $ROW.append('<td class="history-dev" style="max-width:200px;">' + service['문의내용'].replace(/\n/gim, '<br>') + '</td>');
                    // $ROW.append('<td class="history-dev" style="max-width:200px;">' + service['확인내용'] + '</td>');
                    // $ROW.append('<td class="history-dev" style="max-width:200px;">' + service['처리내용'] + '</td>');
                    // $ROW.append('<td class="history-dev">' + service['버전'] + '</td>');
                    // $ROW.append('<td class="history-dev">' + service['테스트'] + '</td>');

                    if (service['확인시간'] == '') {
                        $ROW.append('<td class="history-all"></td>');
                        $ROW.append('<td class="history-all"></td>');
                        $ROW.append('<td class="history-all"></td>');
                    } else {

                        $ROW.append('<td class="text-right bg-orange history-all" data-toggle="tooltip" data-placement="top" title="" data-original-title="접수: ' + service['접수일자'] + ' <br> 확인: ' + (service['확인일자'] || service['공유일자'] || service['보류일자'] || service['처리일자']) + '">' + service['확인시간'] + '</td>');
                        // service['확인시간'] = during
                        if (service['완료시간'] == '') {
                            $ROW.append('<td class="history-all"></td>');
                            $ROW.append('<td class="history-all"></td>');
                        } else {

                            $ROW.append('<td class="text-right bg-blue-sky history-all" data-toggle="tooltip" data-placement="top" title="" data-original-title="확인: ' + (service['공유일자'] || service['처리일자']) + ' <br> 완료: ' + service['완료일자'] + '">' + service['완료시간'] + '</td>');

                            $ROW.append('<td class="text-right bg-blue" data-toggle="tooltip" data-placement="left" title="" data-original-title="접수: ' + service['접수일자'] + ' <br> 완료: ' + service['완료일자'] + '">' + service['전체시간'] + '</td>');

                        }
                    }

                    if (service['상태'] === CONSTS.SERVICE_STATUS.HOLD) {
                        $ROW.addClass('bg-dark');
                    } else if (service['상태'] === CONSTS.SERVICE_STATUS.SHARE) {
                        $ROW.addClass('bg-warning');
                    } else if (service['상태'] === CONSTS.SERVICE_STATUS.PROCESS) {
                        $ROW.addClass('bg-success');
                    } else if (service['상태'] >= CONSTS.SERVICE_STATUS.DONE) {
                        $ROW.addClass('bg-info');
                    }

                    // $ROW.append('<td>' + service['인덱스'] + '</td>');

                    // $ROW.append('<td>' + service['인덱스'] + '</td>');
                    // $ROW.appendTo($SERVICEDESKTOP);
                    $ROW.appendTo($SERVICEALLBODY);



                    // 문의,확인,처리 내용 감춤
                    $ROW = $('<tr />').addClass("collapse").attr({
                        'id': 'all-comment-' + service['인덱스'],
                        'data-index': service['인덱스']
                    })
                    $ROW.append('<td/>')
                    $ROW.append('<td/>')
                    $ROW.find('td:eq(0)').attr('style', 'border-right: 0px !important')
                    $ROW.find('td:eq(1)').attr({
                        'colspan': 15,
                        'style': 'border-left: 0px !important'
                    }).append(
                        '        <h5 style="border-bottom:1px solid #ddd;">문의내용</h5> ' + service['문의내용'].replace(/\n/gim, '<br>') + '<br/>' +
                        '        <h5 style="border-bottom:1px solid #ddd;">확인내용</h5>' + service['확인내용'].replace(/\n/gim, '<br>') + '<br/>' +
                        '        <h5 style="border-bottom:1px solid #ddd;">처리내용</h5>' + service['처리내용'].replace(/\n/gim, '<br>') + '<br/>' +
                        '        <h5 style="border-bottom:1px solid #ddd;">보류내용</h5>' + service['보류내용'].replace(/\n/gim, '<br>')
                    )
                    $ROW.appendTo($SERVICEALLBODY)

                    // 여기서부턴 개발실 AS 공유건 리스트
                    if (service['상태'] > 0 && service['공유자'] > 0) {
                        $DEVROW = $('<tr data-target="#dev-comment-' + service['인덱스'] + '" />');
                        $DEVROW.attr('data-index', pos);
                        $DEVROW.attr('data-service-index', service['인덱스']);
                        $DEVROW.append('<td style="width:10px;"><a href="/service/history/detail?' + $.param(params) + '"><i class="fa fa-search"></i></a></td>');
                        $DEVROW.append('<td>' + service['인덱스'] + '</td>');
                        $DEVROW.append('<td>' + service['기관코드'] + '</td>');
                        $DEVROW.append('<td>' + service['기관명칭'] + '</td>');
                        $DEVROW.append('<td>' + service['프로그램명'] + '</td>');
                        $DEVROW.append('<td>' + (service['신규'] <= 3 ? '<span class="badge bg-red">NEW</span>' : '') + '</td>');
                        $DEVROW.append('<td>' + ((function () {
                            if (service["병원유형"] == 0) {
                                return '<span class="badge">보통</span>';
                            } else if (service["병원유형"] == 1) {
                                return '<span class="badge bg-blue">우수</span>';
                            } else {
                                return '<span class="badge bg-red">주의</span>';
                            }
                        })()) + '</td>');
                        $DEVROW.append('<td class="history-dev">' + service['실행파일'] + '</td>');
                        $DEVROW.append('<td>' + service['상태명'] + '</td>');
                        $DEVROW.append('<td class="text-center red">' + (service['응급'] == 1 ? '<i class="fa fa-exclamation-circle"></i> 응급' : '') + '</td>');
                        $DEVROW.append('<td>' + service['지사명'] + '</td>');
                        $DEVROW.append('<td>' + service['공유자명'] + '</td>');
                        $DEVROW.append('<td>' + (service['공유일자'].length ? moment(service['공유일자']).format('YYYY-MM-DD') : '') + '</td>');
                        $DEVROW.append(`
                            <td>
                                ${!service['처리예정일'].length ? '' :
                                service['처리예정일']
                            }
                            </td>
                        `);
                        $DEVROW.append('<td>' + service['완료자명'] + '</td>');
                        $DEVROW.append('<td>' + (service['완료일자'].length ? moment(service['완료일자']).format('YYYY-MM-DD') : '') + '</td>');
                        $DEVROW.append('<td class="text-center">' + (service['댓글수'] === 0 ? '-' : service['댓글수']) + '</td>');
                        $DEVROW.append('<td class="history-dev"><input type="checkbox" data-field="파일전달" ' + (service['파일전달'] > 0 ? 'checked' : '') + '/></td>');
                        $DEVROW.append('<td class="history-dev"><input type="checkbox" data-field="파일테스트" ' + (service['파일테스트'] > 0 ? 'checked' : '') + '/> ' + service['파일테스터'] + '</td>');
                        $DEVROW.append('<td class="history-dev" style="width:130px;"><input type="text" class="form-control input input-sm" data-field="업데이트버전" value="' + service['버전'] + '" placeholder=""/></td>');
                        // $DEVROW.append('<td class="history-dev"><input type="checkbox" data-field="업데이트테스트" ' + (service['테스트'] > 0 ? 'checked' : '') + '/> ' + service['테스터'] + '</td>');

                        var selectStyle = ''
                        if (service['테스트'] == 0) selectStyle = 'color:#ccc;'
                        else if (service['테스트'] > 0) selectStyle = 'color:green;'
                        else if (service['테스트'] < 0) selectStyle = 'color:red;'

                        $DEVROW.append(
                            '<td class="history-dev form-group form-inline">' +
                            '    <select class="form-control input-sm" ' + (!service['버전'].length ? 'disabled' : '') + ' style="width:fit-content; font-weight: bold; ' + selectStyle + '" data-field="업데이트테스트">' +
                            '        <option style="color:#ccc;" value="0" ' + (service['테스트'] == 0 ? 'selected' : '') + '>미시행</option>' +
                            '        <option style="color:green;" value="1" ' + (service['테스트'] > 0 ? 'selected' : '') + '>시행</option>' +
                            '        <option style="color:red;" value="2" ' + (service['테스트'] < 0 ? 'selected' : '') + '>이상</option>' +
                            '    </select> ' + service['테스터'] + '</td>');

                        if (service['상태'] === CONSTS.SERVICE_STATUS.HOLD) {
                            $DEVROW.addClass('bg-dark');
                        } else if (service['상태'] === CONSTS.SERVICE_STATUS.SHARE) {
                            $DEVROW.addClass('bg-warning');
                        } else if (service['상태'] === CONSTS.SERVICE_STATUS.PROCESS) {
                            $DEVROW.addClass('bg-success');
                        } else if (service['상태'] >= CONSTS.SERVICE_STATUS.DONE) {
                            $DEVROW.addClass('bg-info');
                        }

                        $DEVROW.appendTo($SERVICEDEVBODY);
                        $DEVROW = $($ROW.clone())
                        $DEVROW.attr('id', 'dev-comment-' + service['인덱스'])
                        $DEVROW.find('td:eq(1)').attr({
                            'colspan': 16,
                            'style': 'border-left: 0px !important'
                        })
                        $DEVROW.appendTo($SERVICEDEVBODY); //상세내용
                    }
                })
                $('[data-toggle="tooltip"]').tooltip({
                    placement: "left",
                    html: true,
                    container: '#service-desktop'
                })
                $('table').find('input[type="checkbox"]').iCheck({
                    checkboxClass: 'icheckbox_flat-green',
                    radioClass: 'iradio_flat-green'
                }).bind('ifChecked ifUnchecked', function (event) {
                    var target = $(event.target)
                    var index = target.closest('tr').data('service-index')
                    var field = target.data('field')

                    UpdateDevAS(index, field, (event.type === 'ifChecked' ? params.user['인덱스'] : 0))

                });
                $('table').find('input[type="text"]').bind('keyup', function (event) {
                    event.preventDefault()
                    if (event.keyCode === 13) {
                        var target = $(event.target)
                        var index = target.closest('tr').data('service-index')
                        var field = target.data('field')
                        var data = target.val()
                        UpdateDevAS(index, field, data)
                    }
                })

                $('table').find('select').bind('change', function (event) {
                    var data = $(this).val()
                    var index = $(this).closest('tr').data('service-index')
                    var field = $(this).data('field')

                    if (data == 1) {
                        data = params.user['인덱스']
                    } else if (data == 2) {
                        data = params.user['인덱스'] * -1
                    }
                    UpdateDevAS(index, field, data)
                })

                $('.collapse').bind('show.bs.collapse', function (event) {
                    console.log(event)
                    var $ROW = $(this).closest('tr')
                    var index = $ROW.data('index')
                    var $REPLYCONTAINER = $('#all-comment-' + index).find('#messages-' + index)
                    if (!$REPLYCONTAINER.length) {
                        axios.get(API.SERVICE.REPLY, {
                            params: {
                                index: index
                            }
                        }).then(function (result) {
                            console.log(result)

                            var replys = result.data

                            if (replys.length) {
                                $('#all-comment-' + index).find('td:eq(1)').append(_replys(index, replys))
                                $('#dev-comment-' + index).find('td:eq(1)').append(_replys(index, replys))
                            }

                        }).catch(function (error) {
                            fn.errorNotify(error)
                        })
                    }
                })
                resolve();
            } catch (error) {
                reject(error);
            }
        })
    }

    function UpdateDevAS(index, field, data) {

        axios.post(API.SERVICE.DEV, {
            index: index,
            field: field,
            data: data
        }).then(function (result) {
            if (result.data == '') {
                ServiceHistory()
                new PNotify({
                    title: 'AS 공유건',
                    text: '저장되었습니다.',
                    type: 'success'
                });
            }
        }).catch(function (error) {
            fn.errorNotify(error)
        })

    }

    function _replys(index, replys) {
        var $REPLYS = ''
        $REPLYS += '<div class="ln_solid"></div>'
        $REPLYS +=
            '<h5 class="history-reply-header">댓글 (' +
            replys.length +
            ')</h5>'
        $REPLYS +=
            '    <ul class="messages" id="messages-' + index + '">'
        replys.forEach(function (reply) {
            $REPLYS += '<li>'
            $REPLYS += '    <div class="message_date">'
            $REPLYS +=
                '        <p class="month">' +
                moment(reply['작성일자']).fromNow() +
                '</p>'
            if (params.user['인덱스'] === reply['작성자']) {
                $REPLYS += '        <p class="month">'
                $REPLYS +=
                    '            <button class="btn btn-xs btn-default reply-comment-delete" data-index="' +
                    reply['인덱스'] +
                    '" data-key="' +
                    reply['서비스키'] +
                    '"><i class="fa fa-trash"></i></button>'
                $REPLYS += '        </p>'
            }
            $REPLYS += '    </div>'
            $REPLYS += '    <div class="message_wrapper">'
            $REPLYS +=
                '        <h5 class="heading blue"><i class="fa fa-user-circle"></i> ' +
                reply['작성자명'] +
                '</h5>'
            $REPLYS +=
                '        <p class="url">' +
                exports.fn.urlify(reply['내용']) +
                '</p>'
            $REPLYS += '    </div>'
            $REPLYS += '</li>'
        })
        $REPLYS += '    </ul>'
        $REPLYS += '</div>'
        return $REPLYS
    }

    function LoadCategorys(exe, menu, program, date) {
        return new Promise(function (resolve, reject) {
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



            console.log(_params);
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
    }

    // ServiceHistory();


})(window);
