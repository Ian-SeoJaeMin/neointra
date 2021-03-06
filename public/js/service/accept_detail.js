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
            program: service.info['????????????'],
            exe: service.info['????????????'].trim(), //_this.data.Service.as['????????????'],
            menu: service.info['????????????'].trim(), //_this.data.Service.as['????????????']

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
            hospital: hospital.info['????????????'],
            // status: [SERVICE_STATUS.CONFIRM, SERVICE_STATUS.SHARE, SERVICE_STATUS.PROCESS, SERVICE_STATUS.HOLD, SERVICE_STATUS.DONE, SERVICE_STATUS.FEEDBACK], //["0", "1", "2", "3", "4",  "7"],
            status: $PASTSERVICESTATUS.selectpicker('val'),
            emr: [hospital.info['????????????ID']],
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

    // AS ?????? ?????????
    function renderServiceInfo() {
        var $el = $SERVICE
        var $el2 = $FILES
        var template = serviceItemDetailTemplate()
        var html = ''

        // ????????????
        html = ' <b>?????????:</b> ' + service.info['?????????'];
        html += ' <b>?????????:</b> ' + service.info['?????????'] + (service.info['????????????'] ? '(??????: ' + service.info['????????????'] + ')' : '');
        html += ' <b>?????????:</b> <span class="red">' + moment(service.info['????????????']).calendar() + '(' + moment(service.info['????????????']).fromNow() + ')</span>';
        template = template.replace(/{{????????????}}/gim, html)
        html = ''

        template = template.replace(/{{????????????}}/gim, EMR(service.info['????????????']).name)

        //????????????
        template = template.replace(/{{????????????}}/gim, marked(service.info['????????????']))
        template = template.replace(/{{????????????}}/gim, service.info['????????????'] || '')
        var images = service.info['?????????'].trim().length > 0 ? JSON.parse(service.info['?????????']) : null;

        if (images && images.length) {
            html = renderImages(images)
            $el2.html(renderAttachmentFiles(images))
        }

        template = template.replace(/{{????????????}}/gim, html)

        template = template.replace(/{{????????????}}/gim, renderExe())
        template = template.replace(/{{????????????}}/gim, renderCategory())

        // template = template.replace(/{{????????????}}/gim, renderConfirmContents())

        $el.html(template)

        $('.carousel').carousel({
            interval: false
        })

        if (service.info['??????'] == 1) {
            $('[name="service-emergency"]').attr('checked', true)
        }

        $('#service-past').val(service.info['??????AS'])


        // ????????? ??????
        eventsRegister($el)

    }

    // ????????????, ???????????????, ????????????, ???????????????, ???????????? ?????????
    function renderHospitalInfo() {
        return new Promise(function (resolve, reject) {
            try {

                $('#title').text('[' + service.info['?????????'] + '] ' + hospital.info['????????????']);

                var $el;
                var html = '';
                var keys = [];

                // ???????????? && ???????????????

                // ???????????? & ???????????????
                $el = $INFO;
                keys = Object.keys(hospital.info);
                if (keys.length) {
                    html += '<ul class="list-unstyled user_data collapse in" id="_hospinfo" aria-expanded="true">';
                    keys.forEach(function (key) {
                        // console.log(key.match(/ID|????????????|????????????|????????????ID|/gim))
                        // if (!key.match(/ID|????????????|????????????|????????????ID|/gim)) {
                        if (!key.match(/????????????|????????????|????????????ID|ID/gim)) {
                            html += '<li class="' + (key.match(/????????????|????????????|????????????|????????????|????????????/gim) ? 'red font-bold' : 'not-important') + '"><b>' + key + ':</b> ' + hospital.info[key] + '</li>';
                        }
                    });
                    html += '</ul>';
                }
                if (hospital.extra) {
                    html += '<div class="ln_solid"></div>';
                    html += '<h5 class="">';
                    html += '  ???????????????';
                    html += '</h5>';
                    html += '<ul class="list-unstyled user_data" id="_extra">';
                    hospital.extra.forEach(function (extra) {
                        html += '  <button type="button" class="btn btn-default btn-xs">' + extra['???????????????'] + '</button>';
                    });
                    html += '</ul>';
                }
                $el.append(html);

                //????????????
                html = '';
                $el = $REMOTE;
                keys = Object.keys(hospital.unique).filter(function (key) {
                    return key.match(/????????????|???????????????|????????????|??????????????????|??????????????????/gim);
                });
                if (keys.length) {
                    html += '<ul class="list-unstyled user_data collapse in" id="_seetrol" aria-expanded="true">';
                    keys.forEach(function (key) {
                        html += '<li><b>' + key + ':</b> ' + hospital.unique[key] + '</li>';
                    });
                    html += '</ul>';
                }
                $el.append(html);

                //????????????
                html = '';
                $el = $UNIQ;
                keys = Object.keys(hospital.unique).filter(function (key) {
                    return !key.match(/????????????|???????????????|????????????|??????????????????|??????????????????/gim);
                });
                if (keys.length) {
                    html += '<ul class="list-unstyled user_data collapse in" id="_certificate" aria-expanded="true">';
                    keys.forEach(function (key) {
                        if (key === '??????') {
                            html += '<li>  <b>' + key + ':</b><br>';
                            if (hospital.unique[key] && hospital.unique[key].length) {
                                html += '  ' + hospital.unique[key].replace(/\n/gim, '<br/>');
                            }
                            html += '<li>';
                            // html += '  <pre class="unstyled-pre">' + hospital.unique[key] + '</pre>';
                            // html += exports.fn.urlify(hospital.unique[key]);
                        } else if (key === '????????????') {
                            html += '<li><b>' + key + ':</b> <b class="{{????????????}}">' + hospital.unique[key] + '</b></li>';

                            if (hospital.unique[key] === '??????') {
                                html = html.replace('{{????????????}}', 'blue');
                            } else if (hospital.unique[key] === '??????') {
                                html = html.replace('{{????????????}}', 'red');
                            } else {
                                html = html.replace('{{????????????}}', '');
                            }
                        } else if (key !== '?????????' && key !== '????????????') {
                            // html += '<b>' + key + ':</b> ' + hospital.unique[key] + '<br/>';
                            html += '<li><b>' + key + ':</b> ' + hospital.unique[key] + '</li>';
                        }
                    });
                    html += '<li><b>?????????:</b> ' + hospital.unique['?????????'] + ' <b>?????????:</b> ' + hospital.unique['????????????'] + '</li>';
                    html += '</ul>';
                }
                $el.append(html);

                //????????????
                html = '';
                $el = $BACKUP;
                keys = Object.keys(hospital.backup);
                if (keys.length) {
                    html += '<ul class="list-unstyled user_data collapse in" id="_database" aria-expanded="true">';
                    Object.keys(hospital.backup).forEach(function (key) {
                        switch (key) {
                            case '????????????':
                                hospital.backup[key] = SetFeedBackLabel(hospital.backup[key], function (a) {
                                    return a < moment().subtract(1, 'days').format('YYYY-MM-DD');
                                })
                                break;
                            case '????????????':
                                hospital.backup[key] = SetFeedBackLabel(hospital.backup[key], function (a) {
                                    return a !== '??????';
                                })
                                break;
                            case '????????????':
                                hospital.backup[key] = hospital.backup[key] === 1 ? 'Standard' : 'Express';
                                hospital.backup[key] = SetFeedBackLabel(hospital.backup[key], function (a) {
                                    return a !== 'Standard';
                                })
                                break;
                            case '??????':
                            case '??????':
                            case '??????':
                                hospital.backup[key] = hospital.backup[key] || hospital.backup['S' + key];
                                hospital.backup[key] = hospital.backup[key] == null ? '' : hospital.backup[key];
                                hospital.backup[key] = SetFeedBackLabel(hospital.backup[key], function (a, b) {
                                    a = a.replace(/./gim, '');
                                    b = b.replace(/./gim, '');
                                    return a !== b;
                                }, hospital.backup['M' + key]);
                                break;
                            case '??????????????????':
                                hospital.backup[key] = SetFeedBackLabel(hospital.backup[key], function (a) {
                                    return a < 100;
                                });
                                hospital.backup[key] = hospital.backup[key].replace('<i class="fa"', ' GB <i class="fa');
                                break;
                        }
                        if (!key.match(/S??????|S??????|S??????|M??????|M??????|M??????/gim) && hospital.backup[key]) {
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
    // ???????????? ????????????
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
    // ???????????????
    function renderImages(images) {
        var carouselId = "carousel" + moment().format('YYYYMMDDHHmmSS')
        var carousel = imageCarouselTemplate()
        var indicator = ''
        var imageItem = ''
        var imageUrl = params.env === 'dev' ? '' : 'http://115.68.114.16:4183/'

        images.forEach(function (image, index) {
            image = image.indexOf('/uploads/service') < 0 ? image.replace('/capture', '/uploads/service') : image;
            image = image.indexOf('/uploads') < 0 ? '/uploads' + image : image;
            // html += '    <img style="width:100%;" data-imageviewer="true" src="http://115.68.114.16:4183/' + img + '" data-high-src="http://115.68.114.16:4183/' + img + '" data-tooltip="tooltip" title="???????????? ?????????????????? ?????? ??? ??? ????????????.">';

            indicator += '<li data-target="#' + carouselId + '" data-slide-to="' + index + '" class="' + (index == 0 ? 'active' : '') + '" style="width: ' + (100 / images.length) + '%"></li>'
            imageItem += '<div class="item ' + (index == 0 ? 'active' : '') + '">'
            imageItem += '  <img data-imageviewer="true" src="' + imageUrl + image + '" data-high-src="' + imageUrl + image + '" data-tooltip="tooltip" title="???????????? ?????????????????? ?????? ??? ??? ????????????." />'
            imageItem += '</div>'
        })
        carousel = carousel.replace(/{{CAROUSELID}}/gim, carouselId)
        carousel = carousel.replace(/{{INDICATORS}}/gim, indicator)
        carousel = carousel.replace(/{{IMAGES}}/gim, imageItem)

        return carousel

    }
    // ???????????? ??????
    function renderExe() {
        var $CATEGORY = ''
        $CATEGORY +=
            '<p class="m-b-none"></p><div class="btn-group service-exe-group" data-toggle="buttons">'
        $CATEGORY += (function () {
            var _exe = ''
            CONSTS.EXES.forEach(function (exe) {
                _exe +=
                    '<label class="btn btn-sm m-b-sm ' +
                    (service.info['????????????'] === exe ?
                        'btn-primary active' :
                        'btn-default') +
                    '">'
                _exe +=
                    '   <input type="radio" name="service-exe" value="' +
                    exe +
                    '" ' +
                    (service.info['????????????'] === exe ?
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
    // ??????/??????
    function renderCategory() {
        return `
            <select class="form-control selectpicker show-tick service-category" data-width="100%" data-size="10" title="??????/??????">
            ${(service.info['????????????'] && service.info['????????????'] ? '<option selected value="'+ service.info['????????????'] + ' - '  + service.info['????????????'] + '">'+ service.info['????????????'] + ' - '  + service.info['????????????'] + '</option>' : '')}
            </select>
        `
    }
    // ????????????
    // ??????
    function renderConfirmContents() {
        var confirms = window.params.setting.service['????????????']
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
    // ???????????? ??????
    // ??????
    function renderAttachmentFiles(files) {

        var $el = '<ul class="list-unstyled">'
        var fileUrl = params.env === 'dev' ? '' : 'http://115.68.114.16:4183/'

        files.forEach(function (file) {
            file = file.indexOf('/uploads/service') < 0 ? file.replace('/capture', '/uploads/service') : file;
            file = file.indexOf('/uploads') < 0 ? '/uploads' + file : file;
            // html += '    <img style="width:100%;" data-imageviewer="true" src="http://115.68.114.16:4183/' + img + '" data-high-src="http://115.68.114.16:4183/' + img + '" data-tooltip="tooltip" title="???????????? ?????????????????? ?????? ??? ??? ????????????.">';

            // indicator += '<li data-target="#' + carouselId + '" data-slide-to="' + index + '" class="' + (index == 0 ? 'active' : '') + '" style="width: ' + (100 / images.length) + '%"></li>'
            // imageItem += '<div class="item ' + (index == 0 ? 'active' : '') + '">'
            // imageItem += '  <img data-imageviewer="true" src="' + imageUrl + image + '" data-high-src="' + imageUrl + image + '" data-tooltip="tooltip" title="???????????? ?????????????????? ?????? ??? ??? ????????????." />'
            // imageItem += '</div>'

            $el += '<li>'
            $el += '    <a href="' + fileUrl + file + '" download><i class="fa fa-file"></i> ' + file + '</a><button class="btn btn-link btn-xs">X</button>'
            $el += '</li>'
        })

        return $el

    }

    //?????? AS ?????????
    function renderPastServiceList(data) {
        var $el = $('#service-list')
        $el.empty()
        var itemTemplate = ''
        data.forEach(function (item) {
            if (item['?????????'] !== service.info['?????????']) {
                itemTemplate = pastServiceItemTemplate()
                itemTemplate = itemTemplate.replace(/{{?????????}}/gim, item['?????????'])
                itemTemplate = itemTemplate.replace(/{{????????????}}/gim, item['????????????'].replace(/\n/gim, '<br>') + (item['????????????'].trim().length ? item['????????????'].replace(/\n/gim, '<br>') : ''))

                itemTemplate = itemTemplate.replace(/{{????????????}}/gim, item['????????????'])
                itemTemplate = itemTemplate.replace(/{{????????????}}/gim, item['????????????'] || '-')
                itemTemplate = itemTemplate.replace(/{{????????????}}/gim, item['????????????'] || '-')
                itemTemplate = itemTemplate.replace(/{{????????????}}/gim, moment(item['????????????']).format('YYYY/MM/DD HH:mm:ss'))
                itemTemplate = itemTemplate.replace(/{{?????????}}/gim, item['?????????'])

                itemTemplate = $(itemTemplate)

                switch (item['??????']) {
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

    // ????????? ??????
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
                service.info['??????'] = service.info['??????'] === 0 ? 1 : 0
            })

        // ???????????? ?????? ?????????
        $el.find('[name="service-exe"]').bind('change', function (event) {
            var $THIS = $(this)
            var selectExe = $THIS.val()
            if (service.info['????????????'] !== selectExe) {
                service.info['????????????'] = selectExe
                service.info['????????????'] = ''
                service.info['????????????'] = ''

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

        // ??????/?????? ?????? ?????????
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
                            app: service.info['????????????'].trim()
                        };
                        return params;
                    }
                },
                locale: {
                    emptyTitle: '?????????????????? ??????'
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
                    service.info['????????????'] = selTag.split('-')[0].trim()
                    service.info['????????????'] = selTag.split('-')[1].trim()
                }

            })

        // ???????????? ???????????????
        $BTNCONFIRM.bind('click', function (event) {

            event.preventDefault()

            confirmService(true)

        })

        // ???????????? ?????? ?????????
        $BTNSAVE.bind('click', function (event) {
            event.preventDefault()
            confirmService(false)
        })

        //?????? AS ?????? ??????

        $PASTSERVICESTATUS.selectpicker('val', [SERVICE_STATUS.ACCEPT, SERVICE_STATUS.CONFIRM, SERVICE_STATUS.SHARE, SERVICE_STATUS.PROCESS, SERVICE_STATUS.HOLD, SERVICE_STATUS.DONE, SERVICE_STATUS.FEEDBACK])


        //?????? AS ???????????? ?????????
        $MODAL.bind('show.bs.modal', function (event) {
            $('#search-list').empty()
            $('#search-detail').empty()
        })
        $SEARCHSERVICE.bind('click', function (event) {
            getPastServiceList()
        })


        // ?????? AS ????????? ??????
        $('#service-list').bind('click', function (event) {
            var $item = $(event.target).closest('tr')
            $item.toggleClass('active')
        })

        // ?????? AS ????????? ????????????
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
            // service.info['??????AS'] = $('#service-past').val()
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
                        'A/S ????????????',
                        'A/S??? ????????? ?????????????????????.',
                        'success'
                    ).then(function () {
                        // window.history.back();
                        location.href = '/service/accept'
                    })
                } else {
                    swal('A/S ????????????', '?????????????????????.', 'success')
                }
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    function validationCheck(_confirm) {
        var data = {
            index: service.info['?????????'],
            user: params.user,
            nextStatus: CONSTS.SERVICE_STATUS.CONFIRM,
            curStatus: CONSTS.SERVICE_STATUS.ACCEPT,
            exe: service.info['????????????'],
            emergency: service.info['??????'],
            internal: service.info['??????'],
            gubun: service.info['????????????'],
            mainCategory: service.info['????????????'] || '',
            subCategory: service.info['????????????'] || '',
            comment: {
                confirm: '',
                process: '',
                hold: '',
                pass: ($('#service-pass-comment').val() + '').trim()
            },
            linkedService: $('#service-past').val().trim()
        }

        // confirms = window.params.setting.service['????????????']
        // confirms.forEach(function (confirm, index) {
        //     if (confirm.multiline) {
        //         data.comment.confirm += confirm.placeholder + " : <br/><b>" + $('#confirm-' + index).val() + '</b><br/>'
        //     } else {
        //         data.comment.confirm += confirm.placeholder + " : <b>" + $('#confirm-' + index).val() + '</b><br/>'
        //     }
        // })


        return new Promise(function (resolve, reject) {
            if (_confirm) {
                if ((data.mainCategory === '' || data.subCategory === '') && data.exe !== '??????' && data.mainCategory !== '??????' && status !== SERVICE_STATUS.PROCESS) {
                    reject({
                        title: 'A/S ????????????',
                        text: '??????/????????? ??????????????????.',
                        type: 'error'
                    })
                } else if (data.linkedService.length > 0 && !$.isNumeric(data.linkedService.replace(/,/gim, ''))) {
                    reject({
                        title: 'A/S ????????????',
                        text: '??????/???????????? A/S ??????????????? ?????????????????? ??????(,)??? ????????? ??? ????????????.',
                        type: 'error'
                    })
                } else {
                    resolve(data)
                }

            } else {

                resolve({
                    ?????????: data.index,
                    ????????????: data.comment.confirm,
                    ????????????: data.exe,
                    ????????????: data.mainCategory,
                    ????????????: data.subCategory,
                    ??????: data.emergency,
                    ??????AS: data.linkedService,
                    ????????????: data.comment.pass
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
