(function (exports) {
    'use strict';

    // var modifyMode = params.editable;

    var COMMENTTEMPLATE = '1. 특이사항\n\n2. 부서별 오류 / 요청사항\n\n3. AS 접수내역 및 개발진행 상황\n\n4. 센스 업그레이드에 대한 반응\n\n5.기타\n\n6. 면담자(성명 + 전화번호) 필수기재 (해피콜 만족도 조사용)';

    var $VISITHOSPITAL = $('#visit-hospital');
    var $VISITUNREG = $('#visit-unreg');
    var $VISITUNREGHOSPITAL = $('#visit-unreg-hospital');
    var $VISITCAR = $('#visit-car');
    var $VISITTYPE = $('#visit-type');
    var $VISITGUBUN = $('input[name="visit-gubun"]');
    var $VISITSTARTDATE = $('#visit-start-date');
    var $VISITSTARTTIME = $('#visit-start-time');
    var $VISITENDDATE = $('#visit-end-date');
    var $VISITENDTIME = $('#visit-end-time');
    var $VISITCHECKER = $('.visit-checker');
    var $VISITCOMMENT = $('#visit-comment');
    var $VISITDELETE = $('#visit-delete');
    var $VISITSAVE = $('#visit-save');
    var $UPLOAD = $('.element-upload');

    var data = {
        USER_ID: '',
        hospital: '',
        car: '',
        type: '',
        start: {
            date: $VISITSTARTDATE.val() || moment().format('YYYY-MM-DD'),
            time: $VISITSTARTTIME.val() || moment().format('HH:00')
        },
        end: {
            date: $VISITENDDATE.val() || moment().format('YYYY-MM-DD'),
            time: $VISITENDTIME.val() || moment().format('HH:00')
        },
        comment: $VISITCOMMENT.val() || COMMENTTEMPLATE,
        writer: params.user['인덱스'],
        uploads: []
    }

    $VISITHOSPITAL.selectpicker({
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
                        'value': hosp['ID'],
                        'text': hosp['기관명칭'] + '/' + hosp['담당지사'] + (hosp['담당자'].trim().length > 0 ? '/' + hosp['담당자'] : ''),
                        'disabled': false
                    })
                });

                return hosps;
            },
            preserveSelected: false
        });
    // $VISITHOSPITAL.bind('changed.bs.select', function (event) {
    //     data.USER_ID = $(this).selectpicker('val');
    // });
    $VISITUNREG.bind('ifChecked ifUnchecked', function (event) {
        if (event.type === 'ifChecked') {
            $VISITHOSPITAL.attr('disabled', 'disabled').selectpicker('refresh');
            $VISITUNREGHOSPITAL.removeClass('hidden');
            data.USER_ID = '-1';
        } else {
            $VISITHOSPITAL.removeAttr('disabled').selectpicker('refresh');
            $VISITUNREGHOSPITAL.addClass('hidden');
            data.USER_ID = '';
        }
    });
    $VISITUNREGHOSPITAL.bind('change', function (event) {
        // var $THIS = $(this);
        // data.hospital = $THIS.val().trim();
    })
    $VISITCAR.bind('change', function (event) {
        // data.car = $(this).val();
    });
    $VISITTYPE.bind('change', function (event) {
        data.type = $(this).val();
    });
    $VISITGUBUN.bind('ifChecked', function () {
        var gubun = $(this).val() * 1;
        if (gubun === CONSTS.VISITTYPE.OFFICE || gubun === CONSTS.VISITTYPE.WATCH) {
            data.type = $(this).val();
            $VISITHOSPITAL.attr('disabled', 'disabled').selectpicker('refresh');
            $VISITUNREG.iCheck('disable');
            $VISITCAR.attr('disabled', 'disabled').selectpicker('refresh');
            $VISITTYPE.attr('disabled', 'disabled').selectpicker('refresh');
        } else {
            data.type = '';
            $VISITHOSPITAL.removeAttr('disabled').selectpicker('refresh');
            $VISITUNREG.iCheck('enable');
            $VISITCAR.removeAttr('disabled').selectpicker('refresh');
            $VISITTYPE.removeAttr('disabled').selectpicker('refresh');
        }
    })

    $VISITSTARTDATE.datetimepicker({
        format: "YYYY-MM-DD",
        dayViewHeaderFormat: 'YYYY년MMMM',
        ignoreReadonly: true,
        showTodayButton: true
    });
    $VISITENDDATE.datetimepicker({
        format: "YYYY-MM-DD",
        dayViewHeaderFormat: 'YYYY년MMMM',
        ignoreReadonly: true,
        showTodayButton: true,
        useCurrent: false
    });

    $VISITSTARTDATE.val(data.start.date)
        .bind('dp.change', function (event) {
            $VISITENDDATE.data('DateTimePicker').minDate(event.date);
        });
    $VISITENDDATE.val(data.end.date)
        .bind('dp.change', function (event) {
            $VISITSTARTDATE.data('DateTimePicker').maxDate(event.date);
        });
    $VISITSTARTTIME.bind('change', function (event) {
        data.start.time = $(this).val();
        if (data.start.time > data.end.time) {
            data.end.time = data.start.time;
            $VISITENDTIME.selectpicker('val', data.end.time);
        }
    });
    $VISITENDTIME.bind('change', function (event) {
        data.end.time = $(this).val();
        if (data.end.time < data.start.time) {
            data.start.time = data.end.time;
            $VISITSTARTTIME.selectpicker('val', data.start.time);
        }
    });

    $VISITCHECKER.bind('click', function (event) {
        var $THIS = $(this);
        var index = $THIS.data('index');
        var checkerType = $THIS.data('type');
        if (checkerType === 'start') {
            swal({
                title: '거래처 방문을 시작합니다',
                html: '<b class="red">한번 입력하면 수정할 수 없습니다.</b>',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33'
            }).then(function () {
                $THIS.attr('disabled', 'true');
                $THIS.data(checkerType, moment().format('YYYY-MM-DD HH:mm:ss'));
                $THIS.text($THIS.data(checkerType));
                SaveVisitTime(checkerType, index, $THIS.data(checkerType));
            }).catch(function () {
                console.log('cancel');
            })
        } else {
            if ($VISITCHECKER.filter('[data-type="start"]').is(':disabled')) {
                swal({
                    title: '거래처 방문을 종료합니다',
                    html: '<b class="red">한번 입력하면 수정할 수 없습니다.</b>',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33'
                }).then(function () {
                    $THIS.attr('disabled', 'true');
                    $THIS.data(checkerType, moment().format('YYYY-MM-DD HH:mm:ss'));
                    $THIS.text($THIS.data(checkerType));
                    SaveVisitTime(checkerType, index, $THIS.data(checkerType));
                }).catch(function () {
                    console.log('cancel');
                })
            } else {
                swal('방문시작을 먼저 입력해주세요.', '', 'error');
            }
        }
    })

    if ($VISITCOMMENT.data('convert') === 1) {
        $VISITCOMMENT.html($VISITCOMMENT.val());
    } else {
        $VISITCOMMENT.val(data.comment);
    }

    $VISITCOMMENT.bind('change blur focus', function (event) {
        data.comment = $(this).val().trim();
        if (!data.comment) {
            $(this).val(COMMENTTEMPLATE);
        }
    });

    $VISITSAVE.bind('click', function (event) {
        ModifySchedule();
    })

    $VISITDELETE.bind('click', function (event) {
        swal({
            title: '방문일정 삭제',
            text: "일정을 삭제하시겠습니까?",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        })
            .then(function () {
                DeleteSchedule();
            }, function (dismiss) {
                console.log(dismiss);
            })
    });

    if ($UPLOAD.length) {
        data.uploads = params.uploads;
        $UPLOAD.each(function () {
            var $UPLOADFILE = $(this).find(':input[name="uploadfile"]'),
                $UPLOADER = $(this).find('.btn-uploader'),
                $FILELIST = $(this).find('.uploaded-file-list'),
                $UPLOADLABEL = $UPLOADFILE.parents('.input-group').find(':text');

            $UPLOADFILE.bind('change', function () {
                var input = $(this),
                    numFiles = input.get(0).files ? input.get(0).files.length : 1,
                    label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

                input.trigger('fileselect', [numFiles, label]);
            });

            $UPLOADFILE.bind('fileselect', function (event, numfiles, label) {

                var log = numfiles > 1 ? numfiles + '개의 파일이 선택됨' : label;
                // uploader = $(this).parents('.input-group').find('.btn-uploader');

                if ($UPLOADLABEL.length) {
                    $UPLOADLABEL.val(log);
                    $UPLOADER.removeClass('hidden');
                }
            });

            $UPLOADER.bind('click', function (event) {
                var $THIS = $(this);
                swal({
                    title: '선택한 파일을 업로드하시겠습니까?',
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: '확인',
                    cancelButtonText: '취소'
                }).then(function () {

                    var files = $UPLOADFILE.get(0).files;
                    var formData = new FormData();

                    Object.keys(files).forEach(function (key) {
                        formData.append('uploadfile', files[key]);
                    }, this);
                    formData.append('savepath', 'visit');

                    $.ajax({
                        url: API.FILEMANAGER.UPLOAD,
                        processData: false,
                        contentType: false,
                        cache: false,
                        data: formData,
                        type: 'POST',
                        beforeSend: function () {
                            $UPLOADLABEL.val('업로드 준비중...');
                        },
                        xhr: function () {
                            var myXhr = $.ajaxSettings.xhr();
                            if (myXhr.upload) { // check if upload property exists
                                myXhr.upload.addEventListener('progress', function (evt) {
                                    if (evt.lengthComputable) {
                                        var percentComplete = evt.loaded / evt.total;
                                        percentComplete = parseInt(percentComplete * 100);
                                        if (percentComplete === 100) {
                                            $UPLOADLABEL.val('업로드 완료중...');
                                        } else {
                                            $UPLOADLABEL.val('업로드중...' + percentComplete + '%')
                                        }
                                    } else {
                                        // Unable to compute progress information since the total size is unknown
                                        console.log('unable to complete');
                                    }
                                }, false); // for handling the progress of the upload
                            }
                            return myXhr;
                        },
                        success: function (res) {
                            console.log(res);

                            data.uploads = data.uploads.concat(res);

                            $FILELIST.empty();
                            data.uploads.forEach(function (_file, index) {
                                $FILELIST.append(
                                    '<li class="m-t-xs m-b-xs p-b-xs">' +
                                    '    <i class="fa ' + _file.icon + '"></i> ' + _file.name +
                                    '    <button class="btn btn-xs btn-link upload-file-delete red" type="button" data-index="' + index + '"><i class="fa fa-close"></i></button>' +
                                    '</li>'
                                )
                            })

                            // var input = $PROJECTFILEADD.parents('.input-group').find(':text'),
                            // uploader = $PROJECTFILEADD.parents('.input-group').find('.btn-uploader');
                            $UPLOADFILE.val('');
                            $UPLOADLABEL.val('');
                            $THIS.addClass('hidden');
                        },
                        error: function (error) {
                            fn.errorNotify(error);
                        }
                    });
                }).catch(function (error) {
                    console.log(error);
                    console.log('cancel');
                })
            });

            $FILELIST.bind('click', function (event) {
                var $THIS = $(event.target);
                var $DELETEFILE = null;
                if ($THIS[0].tagName === 'I' && $THIS.hasClass('fa-close')) {
                    $DELETEFILE = $THIS.closest('button.upload-file-delete');
                } else if ($THIS[0].tagName === 'BUTTON' && $THIS.hasClass('upload-file-delete')) {
                    $DELETEFILE = $THIS;
                }

                if ($DELETEFILE.length) {
                    DeleteFile($DELETEFILE);
                }
            });

        })



        function DeleteFile(el) {
            var $EL = el;

            var selectFile = data.uploads;
            selectFile = selectFile[$EL.data('index')];
            var files = []; files.push(selectFile);
            swal({
                title: '파일을 삭제하시겠습니까?',
                text: '삭제된 파일은 복구할 수 없습니다.',
                type: 'warning',
                // imageUrl: selectFile.oPath,
                // imageWidth: 400,
                // imageHeight: 200,
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '삭제',
                cancelButtonText: '취소'
            }).then(function () {

                axios.delete(API.FILEMANAGER.DELETE, {
                    data: {
                        files: files
                    }
                })
                    .then(function (result) {
                        $EL.closest('li').remove();
                        data.uploads.splice($EL.data('index'), 1);
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                    })

            }).catch(function () {
                console.log('cancel');
            })

        }
    }

    function SaveVisitTime(type, index, time) {
        axios.put(API.CUSTOMER.VISITTIME, {
            index: index,
            type: type,
            time: time
        }).then(function (result) {
            console.log(result);
        }).catch(function (error) {
            fn.errorNotify(error);
        });
    }

    function DeleteSchedule() {

        axios.delete(API.CUSTOMER.VISIT, {
            data: {
                index: $VISITDELETE.data('index')
            }
        })
            .then(function (result) {
                swal({
                    title: '일정삭제',
                    text: '삭제되었습니다.',
                    type: 'success'
                }).then(function () {
                    location.href = '/customer/visit';
                })
            })
            .catch(function (err) {
                // console.log(JSON.stringify(err, null, 4));
                // swal('일정삭제 실패', err['response'] || err['message'], 'error');
                fn.errorNotify(err);
            })

    }

    function ModifySchedule() {

        if ($VISITUNREG.is(':checked')) {
            data.USER_ID = '-1';
        }

        if (data.USER_ID === '-1') {
            data.hospital = $VISITUNREGHOSPITAL.val().trim();
        } else {
            data.USER_ID = $VISITHOSPITAL.selectpicker('val');
            data.hospital = '';
        }

        data.index = $VISITSAVE.data('index');
        data.car = $VISITCAR.selectpicker('val');
        // data.type = $VISITTYPE.selectpicker('val');
        if (parseInt($VISITGUBUN.filter(':checked').val()) >= CONSTS.VISITTYPE.OFFICE) {
            data.type = $VISITGUBUN.filter(':checked').val();
        } else {
            data.type = $VISITTYPE.selectpicker('val');
        }
        data.start.date = $VISITSTARTDATE.val();
        data.start.time = $VISITSTARTTIME.selectpicker('val');
        data.end.date = $VISITENDDATE.val();
        data.end.time = $VISITENDTIME.selectpicker('val');

        CheckValidate()
            .then(Save)
            .catch(function (message) {
                swal(message, '', 'error');
                // message = '<b>' + message + '</b>';
                // new PNotify({
                //     title: message
                // });
            })
    }

    function CheckValidate() {
        return new Promise(function (resolve, reject) {
            if (parseInt(data.type) === CONSTS.VISITTYPE.OFFICE || parseInt(data.type) === CONSTS.VISITTYPE.WATCH) {
                data.USER_ID = -1;
                data.hospital = parseInt(data.type) === CONSTS.VISITTYPE.OFFICE ? '내근' : '당직';
                resolve();
            } else if (data.USER_ID === '' || data.USER_ID === null) {
                reject('병원을 선택해주세요.');
            } else if (data.USER_ID === '-1' && data.hospital === '') {
                reject('방문하신 병원명칭을 입력해주세요.');
            } else if (!data.type) {
                reject('방문유형을 선택해주세요.');
            } else {
                resolve();
            }
        })
    }

    function Save() {

        axios.put(API.CUSTOMER.VISIT, data)
            .then(function (result) {
                swal('일정수정', '일정을 수정하였습니다.', 'success')
                    .then(function () {
                        location.href = '/customer/visit';
                    })
            })
            .catch(function (err) {
                console.log(JSON.stringify(err, null, 4));
                // swal('일정수정 실패', err['response'] || err['message'], 'error');
                fn.errorNotify(err);
            })

    }
    /*
        $VISITADD.bind('click', function (event) {
            SaveSchedule();
        });

        $VISITMODIFY.bind('click', function (event) {
            swal({
                title: '방문일정 수정',
                text: "입력하신 내용으로 수정하시겠습니까?",
                type: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33'
            })
                .then(function () {
                    ModifySchedule();
                }, function (dismiss) {
                    console.log(dismiss);
                })
        })





        function ModifySchedule() {
            data.index = $VISITMODIFY.data('index');
            data.USER_ID = $VISITHOSPITAL.selectpicker('val');
            data.car = $VISITCAR.selectpicker('val');
            data.type = $VISITTYPE.selectpicker('val');
            data.start.date = $VISITSTARTDATE.val();
            data.start.time = $VISITSTARTTIME.selectpicker('val');
            data.end.date = $VISITENDDATE.val();
            data.end.time = $VISITENDTIME.selectpicker('val');



            CheckValidate()
                .then(Save)
                .catch(function (message) {
                    // message = '<b>' + message + '</b>';
                    // swal('', message, 'error');
                    new PNotify({
                        title: message
                    });
                })

        }

        function SaveSchedule() {


            data.USER_ID = $VISITUNREG.is(':checked') ? data.USER_ID : $VISITHOSPITAL.selectpicker('val');

            CheckValidate()
                .then(Save)
                .catch(function (message) {
                    // message = '<b>' + message + '</b>';
                    // swal('', message, 'error');
                    new PNotify({
                        title: message
                    });
                })
        }

        function CheckValidate() {
            return new Promise(function (resolve, reject) {
                if (data.USER_ID === '' || data.USER_ID === null) {
                    reject('병원을 선택해주세요.');
                } else if (data.USER_ID === '-1' && data.hospital === '') {
                    reject('방문하신 병원명칭을 입력해주세요.');
                } else if (!data.type) {
                    reject('방문유형을 선택해주세요.');
                } else {
                    resolve();
                }
            })
        }

        function Save() {
            if (!params.editable && params.writable) {
                axios.post(API.CUSTOMER.VISIT, data)
                    .then(function (result) {
                        swal('일정등록', '새로운 일정을 등록하였습니다.', 'success')
                            .then(function () {
                                location.href = '/customer/visit';
                            })
                    })
                    .catch(function (err) {
                        console.log(JSON.stringify(err, null, 4));
                        // swal('일정등록 실패', err['response'] || err['message'], 'error');
                        fn.errorNotify(err);
                    })
            } else if (params.editable && !params.writable) {
                axios.put(API.CUSTOMER.VISIT, data)
                    .then(function (result) {
                        swal('일정수정', '일정을 수정하였습니다.', 'success')
                            .then(function () {
                                location.href = '/customer/visit';
                            })
                    })
                    .catch(function (err) {
                        console.log(JSON.stringify(err, null, 4));
                        // swal('일정수정 실패', err['response'] || err['message'], 'error');
                        fn.errorNotify(err);
                    })
            }
        }

        return {

        };
    */
    // exports.Customer.Manage.methods.Load();

})(window);
