var $el;
var options;
var dev;
var share
var datas;
var ParsedData;
const SERVICE_DATA_OPTIONS = "service_data_options"

$(document).ready(function () {
    Initialize();
    LoadOptions();
    SetEvents();
    LoadData();
});

function Initialize() {

    // 기본 옵션 세팅
    options = {
        date: {
            start: moment().format('YYYY-MM-DD'),
            end: moment().format('YYYY-MM-DD')
        },
        dev: true,
        developers: [],
        astype: [],
        search: ''
    };

    LoadOptions

    // element 변수 설정
    $el = {
        date: new myDatePicker('.datepicker.service'),
        searchBtn: $('button#service-search-btn'),
        exportExcel: $('button#export-excel'),
        astype: $('select.service-as-type'),
        share: $('select.service-share'),
        dev: $('select.service-done'),
        table: $('table.service-list'),
        tbody: $('table.service-list tbody')
    };

    //$el.table.body = $('table.service-list tbody')
    params.setting.service['처리구분'].forEach((item, index) => {
        $el.astype.append(`
            <option value="${index}">${item['구분명']}</option>
        `)
    });
    $el.astype.selectpicker('refresh');
    fn.init_users($el.share);
    fn.init_users($el.dev, null, null, true).then(function () {
        if (options.developers.length > 0) {
            $el.dev.selectpicker('val', options.developers);
        }
    });
    $el.dev.selectpicker('refresh');
}

function SetEvents() {
    $el.searchBtn.bind('click', function (event) {
        LoadData();
    });
    $el.date.fn.init({
        start: options.date.start,
        end: options.date.end
    }, function () {
        options.date = this.value;
    });

    $el.astype.bind('changed.bs.select', e => {
        options.astype = $el.astype.selectpicker('val');
        SaveOptions();
        Clear().then(function () { ParsingDatas() }).then(function () { Render() });
    });

    $el.dev.bind('changed.bs.select', e => {
        options.developers = $el.dev.selectpicker('val')

        SaveOptions();


        Clear().then(function () { ParsingDatas() }).then(function () {
            Render();
        })
    });

    $el.table.bind('click', e => {
        var $THIS = $(e.target);
        if (e.target.tagName.toUpperCase() === 'TD') {
            if ($THIS.hasClass('unlink')) {
                e.preventDefault();
                return false;
            }

            $THIS = $THIS.parent();
        }

        if ($THIS[0].tagName.toUpperCase() === 'TR') {
            var win = window.open($THIS.data('href'), '_blank');
            win.focus();
        }
    });

    $el.exportExcel.bind('click', e => {
        event.preventDefault();
        window.fn.ExportToExcel($el.table,
            "AS리스트" +
            "_" +
            Math.floor(Math.random() * 9999999 + 1000000));
    });
}

function Clear() {
    return new Promise(function (resolve, reject) {
        try {
            $el.tbody.empty();
            resolve();
        } catch (error) {
            reject(error);
        }
    })
}
function SaveOptions() {
    sessionStorage.setItem(SERVICE_DATA_OPTIONS, JSON.stringify(options))
}
function LoadOptions() {
    var _opt = sessionStorage.getItem(SERVICE_DATA_OPTIONS)
    if (_opt !== null) {
        options = JSON.parse(_opt);
    }

}
function LoadData(filteredData) {
    SaveOptions()

    axios.get(API.SERVICE.HISTORY, {
        params: options
    }).then(function (result) {
        datas = result.data;
        ParsedData = datas;
        Clear();
    })
        .then(function () {
            ParsingDatas();
        })
        .then(function () {
            Render();
        })
        .catch(function (error) {
            fn.errorNotify(error);
        });

}

function ParsingDatas() {
    return new Promise(function (resolve, reject) {
        try {

            ParsedData = datas;

            if (options.astype.length > 0) {
                ParsedData = ParsedData.filter(i => {
                    return options.astype.indexOf((i['처리구분'] - 1) + "") >= 0
                });
            }

            if (options.developers.length > 0) {
                ParsedData = ParsedData.filter(i => {
                    return options.developers.indexOf(i['완료자'] + "") >= 0
                });
            }

            resolve();
        } catch (error) {
            reject(error);
        }
    })
}

function Render() {
    return new Promise(function (resolve, reject) {
        try {
            var row, style;
            ParsedData.forEach(element => {
                row = ServiceDataRowTemplate();

                row = row.replace(/{{인덱스}}/gim, element['인덱스'])
                row = row.replace(/{{기관코드}}/gim, element['기관코드'])
                row = row.replace(/{{기관명칭}}/gim, element['기관명칭'])
                row = row.replace(/{{상태}}/gim, element['상태명'])
                row = row.replace(/{{프로그램}}/gim, element['프로그램명'])
                row = row.replace(/{{실행파일}}/gim, element['실행파일'])
                row = row.replace(/{{상세}}/gim, element['실행메뉴'] + "/" + element['세부화면'])
                row = row.replace(/{{응급}}/gim, (element['응급'] == 1 ? '<i class="fa fa-exclamation-circle"></i> 응급' : ''))
                row = row.replace(/{{응급Style}}/gim, (element['응급'] == 1 ? 'bg-danger' : ''))
                row = row.replace(/{{지사}}/gim, element['지사명'])
                row = row.replace(/{{처리구분}}/gim, params.setting.service['처리구분'][element['처리구분'] - 1]['구분명'])
                row = row.replace(/{{공유일}}/gim, moment(element['공유일자']).format('YYYY-MM-DD'))
                row = row.replace(/{{공유자}}/gim, element['공유자명'])
                row = row.replace(/{{완료일}}/gim, moment(element['완료일자']).format('YYYY-MM-DD'))
                row = row.replace(/{{완료자}}/gim, element['완료자명'])
                row = row.replace(/{{파일전달}}/gim, '<input type="checkbox" data-field="파일전달" ' + (element['파일전달'] > 0 ? 'checked' : '') + '/>')
                row = row.replace(/{{파일테스트}}/gim, '<input type="checkbox" data-field="파일테스트" ' + (element['파일테스트'] > 0 ? 'checked' : '') + '/> ' + element['파일테스터'])
                row = row.replace(/{{버전}}/gim, '<input type="text" class="form-control input input-sm" data-field="업데이트버전" value="' + element['버전'] + '" placeholder=""/>')
                row = row.replace(/{{테스트}}/gim, `
                    <select class="form-control input-sm" ${!element['버전'].length ? 'disabled' : ''} style="width:fit-content; font-weight: bold;" data-field="업데이트테스트">
                        <option style="color:#ccc;" value="0" ${element['테스트'] == 0 ? 'selected' : ''}>미시행</option>' +
                        <option style="color:green;" value="1" ${element['테스트'] > 0 ? 'selected' : ''}>시행</option>' +
                        <option style="color:red;" value="2" ${element['테스트'] < 0 ? 'selected' : ''}>이상</option>' +
                    </select></td>'
                `)
                row = row.replace(/{{테스터}}/gim, element['테스터'])
                row = row.replace('{{링크}}', '/service/history/detail?index=' + element['인덱스'] + '&hospnum=' + element['기관코드']);

                $el.tbody.append(row);
            });


            $el.tbody.find('input[type="checkbox"]').iCheck({
                checkboxClass: 'icheckbox_flat-green',
                radioClass: 'iradio_flat-green'
            }).bind('ifChecked ifUnchecked', function (event) {
                var target = $(event.target)
                var index = target.closest('tr').data('index')
                var field = target.data('field')

                UpdateDevAS(index, field, (event.type === 'ifChecked' ? params.user['인덱스'] : 0))

            });
            $el.tbody.find('input[type="text"]').bind('keyup', function (event) {
                event.preventDefault()
                if (event.keyCode === 13) {
                    var target = $(event.target)
                    var index = target.closest('tr').data('index')
                    var field = target.data('field')
                    var data = target.val()
                    UpdateDevAS(index, field, data)
                }
            })

            $el.tbody.find('select').bind('change', function (event) {
                var data = $(this).val()
                var index = $(this).closest('tr').data('index')
                var field = $(this).data('field')

                if (data == 1) {
                    data = params.user['인덱스']
                } else if (data == 2) {
                    data = params.user['인덱스'] * -1
                }
                UpdateDevAS(index, field, data)
            })

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

function UpdateDevAS(index, field, data) {

    axios.post(API.SERVICE.DEV, {
        index: index,
        field: field,
        data: data
    }).then(function (result) {
        if (result.data == '') {
            LoadData();
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


Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};