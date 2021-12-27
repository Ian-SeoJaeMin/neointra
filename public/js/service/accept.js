// LIST ELEMENTS
var $SERVICETABLE = $('table.service-list')
var $SERVICEHEADER = $SERVICETABLE.find('thead').find('th')
var $SERVICEBODY = $SERVICETABLE.find('tbody')
var $SERVICECOUNT = $('span.service-count')

// OPTION ELEMENTS
var $PROGRAM = $('select.service-program')
var $EXE = $('select.service-exe')
var $HOSPITAL = $('select.service-hospital')
var $SEARCH = $('input[name="service-search"]')

// objects
var tempOption = sessionStorage.getItem('acceptOptions')
var options = tempOption ? JSON.parse(tempOption) : {
    status: 0,
    search: '',
    program: 0,
    exe: '',
    type: 0,
    hospnum: '',
    group: 0
}
var sort = {
    order: 'desc',
    field: '접수일자'
}
var paging = {
    currentPage: 1,
    perPage: 50,
    maxPage: 0
}
var services = {
    data: null,
    count: 0,
    paging: null
}

var loaded = false

// events
$(document).ready(function () {

    //기관검색
    $HOSPITAL.selectpicker({
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

                var hosps = [{
                    'value': '',
                    'text': '초기화',
                    'disabled': false
                }];
                data.forEach(function (hosp) {
                    // hosps[hosp['ID']] = hosp['기관명칭'];
                    hosps.push({
                        'value': hosp['기관코드'],
                        'text': hosp['기관명칭'] + '/' + hosp['담당지사'] + (hosp['담당자'].trim().length > 0 ? '/' + hosp['담당자'] : ''),
                        'disabled': false
                    })
                });

                return hosps;
            },
            preserveSelected: false
        });
    $HOSPITAL.bind('changed.bs.select', function (event) {
        if (options.hospnum != $(this).selectpicker('val')) {
            options.hospnum = $(this).selectpicker('val');
            getServiceList()
        }
    });

    //프로그램
    $PROGRAM.bind('changed.bs.select', function (event) {
        var $THIS = $(this)
        if (options.program !== parseInt($THIS.selectpicker('val'))) {
            options.program = parseInt($THIS.selectpicker('val'))
            if (loaded) {
                getServiceList()
            }
        }
    })

    //실행파일
    $EXE.bind('changed.bs.select', function (event) {
        var $THIS = $(this)
        if (options.exe !== $THIS.selectpicker('val')) {
            options.exe = $THIS.selectpicker('val')
            if (loaded) {
                getServiceList()
            }
        }
    })

    //검색어 검색
    $SEARCH.bind('keyup', function (event) {
        var $THIS = $(this)
        if (event.keyCode === 13) {
            options.search = $THIS.val().trim()
            $SEARCH.val(options.search.trim())
            getServiceList()
        }
    })

    //리스트 정렬
    //필요없음 19-11-18
    // $SERVICEHEADER.bind('click', function (event) {
    //     var $THIS = $(this);
    //     var $SORTICON = $THIS.find('i.sort');
    //     if (!$THIS.data('field')) return false;

    //     if ($SORTICON.length) {
    //         $SORTICON.toggleClass('fa-sort-amount-asc fa-sort-amount-desc');
    //         sort.order = sort.order === 'asc' ? 'desc' : 'asc';
    //     } else {
    //         $THIS.siblings().find('i.sort').remove();
    //         $THIS.append('<i class="m-l-xs fa sort fa-sort-amount-asc"></i>');
    //         sort.field = $THIS.data('field');
    //         sort.order = 'asc';
    //     }

    //     // sessionStorage.setItem('serviceSort', JSON.stringify(sort))

    //     sortingData()
    //         .then(renderData())
    //         .catch(function (error) {
    //             fn.errorNotify(error)
    //         })
    // });

    $SERVICEBODY.bind('click', function (event) {
        event.preventDefault()
        var $THIS = $(event.target)

        var $ROW = $THIS.closest('tr')

        var rowData = $ROW.data() || null

        if (rowData && rowData.index) {
            console.log(rowData.index, rowData.userId, rowData.hospnum)
            location.href = `/service/accept/detail?index=${rowData.index}&id=${rowData.userId}&hospnum=${rowData.hospnum}`
        }

    })

    if (options.search.length) {
        $SEARCH.val(options.search)
    }
    if (options.program != 0) {
        $PROGRAM.selectpicker('val', options.program)
    }
    if (options.exe.length) {
        $EXE.selectpicker('val', options.exe)
    }

    getServiceList()

    loaded = true

})

// scroll paging
$(window).bind('scroll', function (event) {
    if (
        $(window).scrollTop() + $(window).height() >=
        $(document).height()
    ) {
        if (services.paging.maxPage > 0) {
            // exports.Service.data.Pageing.curpage += 1
            services.paging.currentPage += 1
            if (
                services.paging.maxPage <
                services.paging.currentPage
            ) {
                services.paging.currentPage -= 1
            } else {
                // exports.Service.fn.RenderList()
                renderData()
            }
        }
    }
})

// functions

function getServiceList() {

    sessionStorage.setItem('acceptOptions', JSON.stringify(options))

    services = {
        data: null,
        count: 0,
        paging: null
    }

    axios.get(API.SERVICE.LIST, {
            params: options
        })
        .then(function (result) {
            return parsingData(result.data[0])
        })
        .then(function () {
            return sortingData()
        })
        .then(function () {
            return renderData()
        })
        .catch(function (error) {
            fn.errorNotify(error)
        })

}

function parsingData(data) {
    return new Promise(function (resolve, reject) {
        try {
            services.data = data
            services.count = services.data.length

            services.paging = $.extend({}, paging)
            services.paging.maxPage = Math.ceil(
                services.count / services.paging.perPage
            )
            resolve()
        } catch (error) {
            reject(e)
        }
    })

}
// 정렬기능 뺌
function sortingData() {
    return new Promise(function (resolve, reject) {
        try {
            // var _services = services.data.slice(0)
            // _services = _services.sort(function (a, b) {
            //     if (sort.order === 'asc') {
            //         return (a[sort.field] > b[sort.field]) ? 1 : ((a[sort.field] < b[sort.field]) ? -1 : 0)
            //     } else {
            //         return (b[sort.field] > a[sort.field]) ? 1 : ((b[sort.field] < a[sort.field]) ? -1 : 0)
            //     }
            // })
            // services.data = _services
            resolve()
        } catch (error) {
            reject(e)
        }
    })


}

function renderData() {

    if (services.paging.currentPage <= 1) {
        $SERVICEBODY.empty()
    }

    $SERVICECOUNT.text(services.count + '건')

    var data = services.data.slice(
        (services.paging.currentPage - 1) * services.paging.perPage,
        (services.paging.currentPage - 1) * services.paging.perPage + services.paging.perPage
    )

    data.forEach(function (item, index) {
        $SERVICEBODY.append(renderItem(item))
    })


}

function renderItem(item) {

    var $ROW = serviceItemTemplate()

    $ROW = $ROW.replace(/{{인덱스}}/gim, item['인덱스'])
    $ROW = $ROW.replace(/{{기관코드}}/gim, item['기관코드'])
    $ROW = $ROW.replace(/{{기관명칭}}/gim, item['기관명칭'])
    $ROW = $ROW.replace(
        /{{프로그램}}/gim,
        (function () {
            var emr = EMR(item['프로그램'])
            return (
                '<span >' +
                emr.name +
                '</span>'
            )
        })()
    )
    $ROW = $ROW.replace(
        /{{타입}}/gim,
        (function () {
            if (item['타입'] === 1) {
                // return '<span class="badge bg-orange">장애</span>'
                return '<span class="orange">장애</span>'
            } else if (item['타입'] === 2) {
                // return '<span class="badge bg-green">사용법</span>'
                return '<span class="green">사용법</span>'
            } else {
                // return '<span class="badge">선택없음</span>'
                return '<span>선택없음</span>'
            }
        })()
    )
    $ROW = $ROW.replace(
        /{{병원유형}}/gim,
        (function () {
            if (item['병원유형'] === 0) {
                // return '<span class="badge">보통</span>'
                return '<span class="">보통</span>'
            } else if (item['병원유형'] === 1) {
                // return '<span class="badge bg-blue">우수</span>'
                return '<span class="blue">우수</span>'
            } else {
                // return '<span class="badge bg-red">주의</span>'
                return '<span class="red">주의</span>'
            }
        })()
    )

    $ROW = $ROW.replace(/{{신규}}/gim, (
        function () {
            if (item['계약일'].trim().length) {
                if (moment().diff(item['계약일'], 'month') <= 3) {
                    // return '<span class="badge badge-red-4">신규</span>'
                    return '<i class="fa fa-check red"></i>'
                } else {
                    return ''
                }
            } else {
                return ''
            }
        }
    ))

    $ROW = $ROW.replace(/{{지사}}/gim, item['지사'])
    $ROW = $ROW.replace(/{{실행파일}}/gim, item['실행파일'])
    // $ROW = $ROW.replace(/{{접수자}}/gim, item['접수자'])
    $ROW = $ROW.replace(/{{접수일자}}/gim, moment(item['접수일자']).format('LLL') + '(' + moment(item['접수일자']).fromNow() + ')')
    $ROW = $ROW.replace(/{{USER_ID}}/gim, item['USER_ID'])
    return $ROW
}

// getServiceList()
