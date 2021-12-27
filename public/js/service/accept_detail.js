var $INFO = $('.x_content#info')
var $REMOTE = $('.x_content#remote')
var $BACKUP = $('.x_content#backup')
var $UNIQ = $('.x_content#uniq')

var $SERVICE = $('.x_content#service')
var $FILES = $('.x_content#files')

var $BTNCONFIRM = $('button[name="service-confirm-done"]')
var $BTNSAVE = $('button[name="service-save"]')
var $BTNAFK = $('button[name="service-afk"]')

var $MODAL = $('#modal-search')
var $SEARCHSERVICE = $('.pastService[name="search-btn"]')
var $PASTSERVICESTATUS = $('select.past-service-status')

var service = window.params.service
var PastServiceDatePicker

var SERVICE_STATUS = CONSTS.SERVICE_STATUS

function Service(_service) {


    var service = {
        info: null,
        replys: null,
        afk: null
    }
    // var category = {
    //     menus: null,
    //     buttons: null
    // }
    var hospital = {
        info: null,
        unique: null,
        backup: null,
        extra: null
    }

    function getServiceInfo() {
        axios.get(API.SERVICE.DETAIL, {
                params: _service
            })
            .then(function (result) {
                return parsingData(result.data)
            })
            // .then(function () {
            //     return getServiceCategory()
            // })
            .then(function () {
                return renderHospitalInfo()
            })
            .then(function () {
                return renderServiceInfo()
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    function parsingData(data) {
        return new Promise(function (resolve, reject) {
            try {
                service.info = data[0][0] || {}
                service.replys = data[1] || []
                service.afk = data[6] || []

                hospital.info = data[2][0] || {}
                hospital.unique = data[3][0] || {}
                hospital.backup = data[4][0] || {}
                hospital.extra = data[5] || []
                resolve()
            } catch (error) {
                reject(error)
            }

        })
    }

    function getServiceCategory() {

        var params = {

            date: {
                start: moment().subtract(3, 'month').startOf('month').format('YYYY-MM-DD'),
                end: moment().format('YYYY-MM-DD')
            },
            program: service.info['프로그램'],
            exe: service.info['실행파일'].trim(), //_this.data.Service.as['실행파일'],
            menu: service.info['실행메뉴'].trim(), //_this.data.Service.as['실행메뉴']

        }

        var apiUrl = params.menu && params.menu.length ? API.STATIC.FINDER.BUTTON : API.STATIC.FINDER.MENU

        return new Promise(function (resolve, reject) {
            axios.get(apiUrl, {
                    params: params
                })
                .then(function (result) {
                    if (params.menu && params.menu.length) {
                        category.buttons = result.data
                    } else {
                        category.menus = result.data
                    }
                    resolve()
                })
                .catch(function (error) {
                    reject(error)
                })
        })
    }

    function getPastServiceList() {
        // var SERVICE_STATUS = CONSTS.SERVICE_STATUS
        var params = {
            date: PastServiceDatePicker.value,
            hospital: hospital.info['기관기호'],
            // status: [SERVICE_STATUS.CONFIRM, SERVICE_STATUS.SHARE, SERVICE_STATUS.PROCESS, SERVICE_STATUS.HOLD, SERVICE_STATUS.DONE, SERVICE_STATUS.FEEDBACK], //["0", "1", "2", "3", "4",  "7"],
            status: $PASTSERVICESTATUS.selectpicker('val'),
            emr: [hospital.info['프로그램ID']],
            share: '',
            done: '',
            search: ''
        }
        axios.get(API.SERVICE.HISTORY, {
                params: params
            })
            .then(function (result) {
                renderPastServiceList(result.data)
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    // AS 내용 랜더링
    function renderServiceInfo() {
        var $el = $SERVICE
        var $el2 = $FILES
        var template = serviceItemDetailTemplate()
        var html = ''

        // 접수정보
        html = ' <b>접수자:</b> ' + service.info['접수자'];
        html += ' <b>연락처:</b> ' + service.info['연락처'] + (service.info['내선번호'] ? '(내선: ' + service.info['내선번호'] + ')' : '');
        html += ' <b>접수일:</b> <span class="red">' + moment(service.info['접수일자']).calendar() + '(' + moment(service.info['접수일자']).fromNow() + ')</span>';
        template = template.replace(/{{접수정보}}/gim, html)
        html = ''

        template = template.replace(/{{프로그램}}/gim, EMR(service.info['프로그램']).name)

        //문의내용
        template = template.replace(/{{문의내용}}/gim, marked(service.info['문의내용']))
        template = template.replace(/{{전달내용}}/gim, service.info['전달내용'] || '')
        var images = service.info['이미지'].trim().length > 0 ? JSON.parse(service.info['이미지']) : null;

        if (images && images.length) {
            html = renderImages(images)
            $el2.html(renderAttachmentFiles(images))
        }

        template = template.replace(/{{첨부파일}}/gim, html)

        template = template.replace(/{{실행파일}}/gim, renderExe())
        template = template.replace(/{{메뉴버튼}}/gim, renderCategory())

        // template = template.replace(/{{확인내용}}/gim, renderConfirmContents())

        $el.html(template)

        $('.carousel').carousel({
            interval: false
        })

        if (service.info['응급'] == 1) {
            $('[name="service-emergency"]').attr('checked', true)
        }

        $('#service-past').val(service.info['연결AS'])


        // 이벤트 등록
        eventsRegister($el)

    }

    // 병원정보, 부가서비스, 백업정보, 씨트롤정보, 특이사항 랜더링
    function renderHospitalInfo() {
        return new Promise(function (resolve, reject) {
            try {

                $('#title').text('[' + service.info['인덱스'] + '] ' + hospital.info['기관명칭']);

                var $el;
                var html = '';
                var keys = [];

                // 병원정보 && 부가서비스

                // 병원정보 & 부가서비스
                $el = $INFO;
                keys = Object.keys(hospital.info);
                if (keys.length) {
                    html += '<ul class="list-unstyled user_data collapse in" id="_hospinfo" aria-expanded="true">';
                    keys.forEach(function (key) {
                        // console.log(key.match(/ID|기관기호|기관명칭|프로그램ID|/gim))
                        // if (!key.match(/ID|기관기호|기관명칭|프로그램ID|/gim)) {
                        if (!key.match(/기관기호|기관명칭|프로그램ID|ID/gim)) {
                            html += '<li class="' + (key.match(/기관명칭|프로그램|전화번호|특이사항|실가동일/gim) ? 'red font-bold' : 'not-important') + '"><b>' + key + ':</b> ' + hospital.info[key] + '</li>';
                        }
                    });
                    html += '</ul>';
                }
                if (hospital.extra) {
                    html += '<div class="ln_solid"></div>';
                    html += '<h5 class="">';
                    html += '  부가서비스';
                    html += '</h5>';
                    html += '<ul class="list-unstyled user_data" id="_extra">';
                    hospital.extra.forEach(function (extra) {
                        html += '  <button type="button" class="btn btn-default btn-xs">' + extra['부가서비스'] + '</button>';
                    });
                    html += '</ul>';
                }
                $el.append(html);

                //원격정보
                html = '';
                $el = $REMOTE;
                keys = Object.keys(hospital.unique).filter(function (key) {
                    return key.match(/원격서버|원격아이디|원격비번|스탠바이이름|스탠바이비번/gim);
                });
                if (keys.length) {
                    html += '<ul class="list-unstyled user_data collapse in" id="_seetrol" aria-expanded="true">';
                    keys.forEach(function (key) {
                        html += '<li><b>' + key + ':</b> ' + hospital.unique[key] + '</li>';
                    });
                    html += '</ul>';
                }
                $el.append(html);

                //특이사항
                html = '';
                $el = $UNIQ;
                keys = Object.keys(hospital.unique).filter(function (key) {
                    return !key.match(/원격서버|원격아이디|원격비번|스탠바이이름|스탠바이비번/gim);
                });
                if (keys.length) {
                    html += '<ul class="list-unstyled user_data collapse in" id="_certificate" aria-expanded="true">';
                    keys.forEach(function (key) {
                        if (key === '메모') {
                            html += '<li>  <b>' + key + ':</b><br>';
                            if (hospital.unique[key] && hospital.unique[key].length) {
                                html += '  ' + hospital.unique[key].replace(/\n/gim, '<br/>');
                            }
                            html += '<li>';
                            // html += '  <pre class="unstyled-pre">' + hospital.unique[key] + '</pre>';
                            // html += exports.fn.urlify(hospital.unique[key]);
                        } else if (key === '병원유형') {
                            html += '<li><b>' + key + ':</b> <b class="{{병원유형}}">' + hospital.unique[key] + '</b></li>';

                            if (hospital.unique[key] === '우수') {
                                html = html.replace('{{병원유형}}', 'blue');
                            } else if (hospital.unique[key] === '주의') {
                                html = html.replace('{{병원유형}}', 'red');
                            } else {
                                html = html.replace('{{병원유형}}', '');
                            }
                        } else if (key !== '수정자' && key !== '수정일자') {
                            // html += '<b>' + key + ':</b> ' + hospital.unique[key] + '<br/>';
                            html += '<li><b>' + key + ':</b> ' + hospital.unique[key] + '</li>';
                        }
                    });
                    html += '<li><b>수정자:</b> ' + hospital.unique['수정자'] + ' <b>수정일:</b> ' + hospital.unique['수정일자'] + '</li>';
                    html += '</ul>';
                }
                $el.append(html);

                //백업현황
                html = '';
                $el = $BACKUP;
                keys = Object.keys(hospital.backup);
                if (keys.length) {
                    html += '<ul class="list-unstyled user_data collapse in" id="_database" aria-expanded="true">';
                    Object.keys(hospital.backup).forEach(function (key) {
                        switch (key) {
                            case '백업일시':
                                hospital.backup[key] = SetFeedBackLabel(hospital.backup[key], function (a) {
                                    return a < moment().subtract(1, 'days').format('YYYY-MM-DD');
                                })
                                break;
                            case '로그축소':
                                hospital.backup[key] = SetFeedBackLabel(hospital.backup[key], function (a) {
                                    return a !== '사용';
                                })
                                break;
                            case '정품여부':
                                hospital.backup[key] = hospital.backup[key] === 1 ? 'Standard' : 'Express';
                                hospital.backup[key] = SetFeedBackLabel(hospital.backup[key], function (a) {
                                    return a !== 'Standard';
                                })
                                break;
                            case '수가':
                            case '약가':
                            case '재료':
                                hospital.backup[key] = hospital.backup[key] || hospital.backup['S' + key];
                                hospital.backup[key] = hospital.backup[key] == null ? '' : hospital.backup[key];
                                hospital.backup[key] = SetFeedBackLabel(hospital.backup[key], function (a, b) {
                                    a = a.replace(/./gim, '');
                                    b = b.replace(/./gim, '');
                                    return a !== b;
                                }, hospital.backup['M' + key]);
                                break;
                            case '백업경로용량':
                                hospital.backup[key] = SetFeedBackLabel(hospital.backup[key], function (a) {
                                    return a < 100;
                                });
                                hospital.backup[key] = hospital.backup[key].replace('<i class="fa"', ' GB <i class="fa');
                                break;
                        }
                        if (!key.match(/S수가|S약가|S재료|M수가|M약가|M재료/gim) && hospital.backup[key]) {
                            html += '<li><b>' + key + ':</b> ' + hospital.backup[key] + '</li>';
                        }
                    })
                }
                $el.append(html);
                resolve()
            } catch (error) {
                reject(error)
            }

        })
    }
    // 백업정보 색상표기
    function SetFeedBackLabel(item, compare, to) {
        if (compare(item, to)) {
            item += ' <i class="fa fa-items-circle"></i>';
            item = '<span class="red">' + item + '</span>';
        } else {
            item += ' <i class="fa fa-check-circle"></i>';
            item = '<span class="blue">' + item + '</span>';
        }
        return item;
    }
    // 첨부이미지
    function renderImages(images) {
        var carouselId = "carousel" + moment().format('YYYYMMDDHHmmSS')
        var carousel = imageCarouselTemplate()
        var indicator = ''
        var imageItem = ''
        var imageUrl = params.env === 'dev' ? '' : 'http://115.68.114.16:4183/'

        images.forEach(function (image, index) {
            image = image.indexOf('/uploads/service') < 0 ? image.replace('/capture', '/uploads/service') : image;
            image = image.indexOf('/uploads') < 0 ? '/uploads' + image : image;
            // html += '    <img style="width:100%;" data-imageviewer="true" src="http://115.68.114.16:4183/' + img + '" data-high-src="http://115.68.114.16:4183/' + img + '" data-tooltip="tooltip" title="이미지를 더블클릭하면 크게 볼 수 있습니다.">';

            indicator += '<li data-target="#' + carouselId + '" data-slide-to="' + index + '" class="' + (index == 0 ? 'active' : '') + '" style="width: ' + (100 / images.length) + '%"></li>'
            imageItem += '<div class="item ' + (index == 0 ? 'active' : '') + '">'
            imageItem += '  <img data-imageviewer="true" src="' + imageUrl + image + '" data-high-src="' + imageUrl + image + '" data-tooltip="tooltip" title="이미지를 더블클릭하면 크게 볼 수 있습니다." />'
            imageItem += '</div>'
        })
        carousel = carousel.replace(/{{CAROUSELID}}/gim, carouselId)
        carousel = carousel.replace(/{{INDICATORS}}/gim, indicator)
        carousel = carousel.replace(/{{IMAGES}}/gim, imageItem)

        return carousel

    }
    // 실행파일 선택
    function renderExe() {
        var $CATEGORY = ''
        $CATEGORY +=
            '<p class="m-b-none"></p><div class="btn-group service-exe-group" data-toggle="buttons">'
        $CATEGORY += (function () {
            var _exe = ''
            CONSTS.EXES.forEach(function (exe) {
                _exe +=
                    '<label class="btn btn-sm m-b-sm ' +
                    (service.info['실행파일'] === exe ?
                        'btn-primary active' :
                        'btn-default') +
                    '">'
                _exe +=
                    '   <input type="radio" name="service-exe" value="' +
                    exe +
                    '" ' +
                    (service.info['실행파일'] === exe ?
                        'checked="true"' :
                        '') +
                    '/>'
                _exe += '   ' + exe
                _exe += '</label>'
            })
            return _exe
        })()
        $CATEGORY += '</div>'

        return $CATEGORY
    }
    // 메뉴/버튼
    function renderCategory() {
        return `
            <select class="form-control selectpicker show-tick service-category" data-width="100%" data-size="10" title="메뉴/버튼">
            ${(service.info['실행메뉴'] && service.info['세부화면'] ? '<option selected value="'+ service.info['실행메뉴'] + ' - '  + service.info['세부화면'] + '">'+ service.info['실행메뉴'] + ' - '  + service.info['세부화면'] + '</option>' : '')}
            </select>
        `
    }
    // 확인내용
    // 안씀
    function renderConfirmContents() {
        var confirms = window.params.setting.service['확인내용']
        var $el = ''

        confirms.forEach(function (confirm, index) {
            $el += '<div class="form-group">'
            if (confirm.multiline) {
                $el += '<textarea id="confirm-' + index + '" class="form-control service-confirm-content" rows="' + confirm.rows + '" required="' + (confirm.required ? 'true' : 'false') + '" placeholder="' + confirm.placeholder + '"></textarea>'
            } else {
                $el += '<input id="confirm-' + index + '" class="form-control service-confirm-content" type="text" required="' + (confirm.required ? 'true' : 'false') + '" placeholder="' + confirm.placeholder + '" />'
            }
            $el += '</div>'
        })

        return $el
    }
    // 첨부파일 섹션
    // 안씀
    function renderAttachmentFiles(files) {

        var $el = '<ul class="list-unstyled">'
        var fileUrl = params.env === 'dev' ? '' : 'http://115.68.114.16:4183/'

        files.forEach(function (file) {
            file = file.indexOf('/uploads/service') < 0 ? file.replace('/capture', '/uploads/service') : file;
            file = file.indexOf('/uploads') < 0 ? '/uploads' + file : file;
            // html += '    <img style="width:100%;" data-imageviewer="true" src="http://115.68.114.16:4183/' + img + '" data-high-src="http://115.68.114.16:4183/' + img + '" data-tooltip="tooltip" title="이미지를 더블클릭하면 크게 볼 수 있습니다.">';

            // indicator += '<li data-target="#' + carouselId + '" data-slide-to="' + index + '" class="' + (index == 0 ? 'active' : '') + '" style="width: ' + (100 / images.length) + '%"></li>'
            // imageItem += '<div class="item ' + (index == 0 ? 'active' : '') + '">'
            // imageItem += '  <img data-imageviewer="true" src="' + imageUrl + image + '" data-high-src="' + imageUrl + image + '" data-tooltip="tooltip" title="이미지를 더블클릭하면 크게 볼 수 있습니다." />'
            // imageItem += '</div>'

            $el += '<li>'
            $el += '    <a href="' + fileUrl + file + '" download><i class="fa fa-file"></i> ' + file + '</a><button class="btn btn-link btn-xs">X</button>'
            $el += '</li>'
        })

        return $el

    }

    //과거 AS 리스트
    function renderPastServiceList(data) {
        var $el = $('#service-list')
        $el.empty()
        var itemTemplate = ''
        data.forEach(function (item) {
            if (item['인덱스'] !== service.info['인덱스']) {
                itemTemplate = pastServiceItemTemplate()
                itemTemplate = itemTemplate.replace(/{{인덱스}}/gim, item['인덱스'])
                itemTemplate = itemTemplate.replace(/{{문의내용}}/gim, item['문의내용'].replace(/\n/gim, '<br>') + (item['전달내용'].trim().length ? item['전달내용'].replace(/\n/gim, '<br>') : ''))

                itemTemplate = itemTemplate.replace(/{{실행파일}}/gim, item['실행파일'])
                itemTemplate = itemTemplate.replace(/{{실행메뉴}}/gim, item['실행메뉴'] || '-')
                itemTemplate = itemTemplate.replace(/{{세부화면}}/gim, item['세부화면'] || '-')
                itemTemplate = itemTemplate.replace(/{{접수일자}}/gim, moment(item['접수일자']).format('YYYY/MM/DD HH:mm:ss'))
                itemTemplate = itemTemplate.replace(/{{상태명}}/gim, item['상태명'])

                itemTemplate = $(itemTemplate)

                switch (item['상태']) {
                    case CONSTS.SERVICE_STATUS.HOLD:
                        itemTemplate.addClass('bg-dark');
                        break;
                    case CONSTS.SERVICE_STATUS.SHARE:
                        itemTemplate.addClass('bg-warning');
                        break;
                    case CONSTS.SERVICE_STATUS.PROCESS:
                        itemTemplate.addClass('bg-success');
                        break;
                    case CONSTS.SERVICE_STATUS.DONE:
                    case CONSTS.SERVICE_STATUS.FEEDBACK:
                        itemTemplate.addClass('bg-info');

                }

                $el.append(itemTemplate)
            }
        })
    }

    // 이벤트 등록
    function eventsRegister($el) {

        PastServiceDatePicker = new myDatePicker('.datepicker.pastService');
        PastServiceDatePicker.fn.init({
            start: moment().startOf('month').format('YYYY-MM-DD'),
            end: moment().endOf('month').format('YYYY-MM-DD')
        }, function () {

        });
        $BTNCONFIRM = $('button[name="service-confirm-done"]')
        $BTNSAVE = $('button[name="service-save"]')
        $BTNAFK = $('button[name="service-afk"]')

        $('[name="service-emergency"]')
            .iCheck({
                checkboxClass: 'icheckbox_flat-red',
                radioClass: 'iradio_flat-red'
            })
            .bind('ifChanged', function (event) {
                service.info['응급'] = service.info['응급'] === 0 ? 1 : 0
            })

        // 실행파일 선택 이벤트
        $el.find('[name="service-exe"]').bind('change', function (event) {
            var $THIS = $(this)
            var selectExe = $THIS.val()
            if (service.info['실행파일'] !== selectExe) {
                service.info['실행파일'] = selectExe
                service.info['실행메뉴'] = ''
                service.info['세부화면'] = ''

                $THIS
                    .parent()
                    .addClass('btn-primary')
                    .removeClass('btn-default')
                    .siblings()
                    .removeClass('btn-primary')
                    .addClass('btn-default')

                $el.find('select.service-category').selectpicker('refresh')

            }
        })

        // 메뉴/버튼 검색 이벤트
        $el.find('select.service-category').selectpicker({
                liveSearch: true,
                size: 10
            })
            .ajaxSelectPicker({
                ajax: {
                    url: API.SERVICE.TAGS,
                    method: 'GET',
                    dataType: 'json',
                    data: function () {
                        var params = {
                            search: '{{{q}}}',
                            app: service.info['실행파일'].trim()
                        };
                        return params;
                    }
                },
                locale: {
                    emptyTitle: '버튼명칭으로 검색'
                },
                cache: false,
                preprocessData: function (data) {

                    var tags = [];
                    data.forEach(function (tag) {
                        tags.push({
                            'value': tag,
                            'text': tag,
                            'disabled': false
                        })
                    });

                    return tags;
                },
                preserveSelected: false,
                requestDelay: 500
            })
            .bind('changed.bs.select', function (event) {
                var selTag = $(this).val() || ''
                if (selTag.length) {
                    service.info['실행메뉴'] = selTag.split('-')[0].trim()
                    service.info['세부화면'] = selTag.split('-')[1].trim()
                }

            })

        // 확인완료 클릭이벤트
        $BTNCONFIRM.bind('click', function (event) {

            event.preventDefault()

            confirmService(true)

        })

        // 임시저장 클릭 이벤트
        $BTNSAVE.bind('click', function (event) {
            event.preventDefault()
            confirmService(false)
        })

        //과거 AS 상태 옵션

        $PASTSERVICESTATUS.selectpicker('val', [SERVICE_STATUS.ACCEPT, SERVICE_STATUS.CONFIRM, SERVICE_STATUS.SHARE, SERVICE_STATUS.PROCESS, SERVICE_STATUS.HOLD, SERVICE_STATUS.DONE, SERVICE_STATUS.FEEDBACK])


        //과거 AS 찾아보기 이벤트
        $MODAL.bind('show.bs.modal', function (event) {
            $('#search-list').empty()
            $('#search-detail').empty()
        })
        $SEARCHSERVICE.bind('click', function (event) {
            getPastServiceList()
        })


        // 과거 AS 리스트 선택
        $('#service-list').bind('click', function (event) {
            var $item = $(event.target).closest('tr')
            $item.toggleClass('active')
        })

        // 과거 AS 리스트 선택완료
        $('#search-select').bind('click', function (event) {
            event.preventDefault()
            var $selectedItems = $('#service-list').find('tr.active')

            $.fn.getDatas = function (key) {
                if (this.length <= 0) return undefined
                var data = []
                this.each(function (i, v) {
                    data.push($(v).data(key))
                })
                return data
            }

            $('#service-past').val($selectedItems.getDatas('index'))
            // service.info['연결AS'] = $('#service-past').val()
            $MODAL.modal('hide')
        })
        // $('#service-past').bind('change', function (event) {
        //     console.log($(this).val())
        // })
    }

    function confirmService(confirm) {
        var confirmData = {}
        validationCheck(confirm)
            .then(function (data) {
                confirmData = data
                return confirm ? axios.put(API.SERVICE.DETAIL, data) : axios.put(API.SERVICE.SAVE, data)
            })
            .then(function (result) {
                if (result.data.status === 200 && confirm) {
                    if (typeof nSocket === 'object') {
                        nSocket.fn.UpdateService({
                            index: confirmData.index,
                            user: params.user,
                            status: confirmData.nextStatus,
                            prev_status: confirmData.curStatus
                        })
                    }
                    swal(
                        'A/S 상태변경',
                        'A/S의 상태를 변경하였습니다.',
                        'success'
                    ).then(function () {
                        // window.history.back();
                        location.href = '/service/accept'
                    })
                } else {
                    swal('A/S 내용변경', '저장되었습니다.', 'success')
                }
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    function validationCheck(_confirm) {
        var data = {
            index: service.info['인덱스'],
            user: params.user,
            nextStatus: CONSTS.SERVICE_STATUS.CONFIRM,
            curStatus: CONSTS.SERVICE_STATUS.ACCEPT,
            exe: service.info['실행파일'],
            emergency: service.info['응급'],
            internal: service.info['본사'],
            gubun: service.info['처리구분'],
            mainCategory: service.info['실행메뉴'] || '',
            subCategory: service.info['세부화면'] || '',
            comment: {
                confirm: '',
                process: '',
                hold: '',
                pass: ($('#service-pass-comment').val() + '').trim()
            },
            linkedService: $('#service-past').val().trim()
        }

        // confirms = window.params.setting.service['확인내용']
        // confirms.forEach(function (confirm, index) {
        //     if (confirm.multiline) {
        //         data.comment.confirm += confirm.placeholder + " : <br/><b>" + $('#confirm-' + index).val() + '</b><br/>'
        //     } else {
        //         data.comment.confirm += confirm.placeholder + " : <b>" + $('#confirm-' + index).val() + '</b><br/>'
        //     }
        // })


        return new Promise(function (resolve, reject) {
            if (_confirm) {
                if ((data.mainCategory === '' || data.subCategory === '') && data.exe !== '기타' && data.mainCategory !== '기타' && status !== SERVICE_STATUS.PROCESS) {
                    reject({
                        title: 'A/S 상태변경',
                        text: '메뉴/버튼을 선택해주세요.',
                        type: 'error'
                    })
                } else if (data.linkedService.length > 0 && !$.isNumeric(data.linkedService.replace(/,/gim, ''))) {
                    reject({
                        title: 'A/S 상태변경',
                        text: '공유/처리중인 A/S 인덱스에는 인덱스번호와 컴마(,)만 입력할 수 있습니다.',
                        type: 'error'
                    })
                } else {
                    resolve(data)
                }

            } else {

                resolve({
                    인덱스: data.index,
                    확인내용: data.comment.confirm,
                    실행파일: data.exe,
                    실행메뉴: data.mainCategory,
                    세부화면: data.subCategory,
                    응급: data.emergency,
                    연결AS: data.linkedService,
                    전달내용: data.comment.pass
                })
            }
        })
    }

    return {
        data: {
            service: service,
            // category: category,
            hospital: hospital
        },
        fn: {
            getServiceInfo: getServiceInfo
        }
    }
}


if (service && service.index) {
    var accept = new Service(service)

    accept.fn.getServiceInfo()
}
