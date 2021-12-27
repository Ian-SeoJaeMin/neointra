(function (exports) {
    'use strict';

    var $BOARDFORM = $('form'),
        $NOTICE = $('.selectpicker[name="notice"]'),
        $DATEPICKER = $('.datepicker'),
        $DATEMONTH = $('.datemonth'),
        $UPLOAD = $('.element-upload');
    // $UPLOADFILE = $(':input[name="uploadfile"]'),
    // $UPLOADER = $('.btn-uploader'),
    // $FILELIST = $('.uploaded-file-list');

    if ($UPLOAD.length) {

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
                    formData.append('savepath', 'board/' + params.board['게시판ID']);

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
                            var key = $THIS.data('label');
                            params.board['데이터'] = params.board['데이터'] || {};
                            params.board['데이터'][key] = params.board['데이터'][key] || [];
                            params.board['데이터'][key] = params.board['데이터'][key].concat(res);
                            params.board['데이터'][key].forEach(function (_file, index) {
                                if (res.find(function (_f) { return _f.name === _file.name })) {
                                    $FILELIST.append(
                                        '<li class="m-t-xs m-b-xs p-b-xs">' +
                                        '    <i class="fa ' + _file.icon + '"></i> ' + _file.name +
                                        '    <button class="btn btn-xs btn-link upload-file-delete red" type="button" data-label="' + $THIS.data('label') + '" data-index="' + index + '"><i class="fa fa-close"></i></button>' +
                                        '</li>'
                                    )
                                }
                            });

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

            var selectFile = params.board['데이터'][$EL.data('label')];
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
                        params.board['데이터'][$EL.data('label')].splice($EL.data('index'), 1);
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                    })

            }).catch(function () {
                console.log('cancel');
            })

        }
    }

    if ($DATEPICKER.length) {
        $DATEPICKER.datetimepicker({
            format: $DATEPICKER.data('format'),
            defaultDate: $DATEPICKER.data('value'),
            showTodayButton: true,
            ignoreReadonly: true,
            keepOpen: true
        });

        $DATEPICKER.bind('dp.change', function (event) {
            $DATEPICKER.data('value', event.date.format('YYYY-MM-DD'));
            // data.date = $CALLDATE.data('value');

        });

        $DATEMONTH.bind('click', function (event) {
            var $THIS = $(this);
            var currentMonth = $DATEPICKER.data('value');
            if ($THIS.data('range') === 'left') {
                $DATEPICKER.data('value', moment(currentMonth).subtract(1, 'day').format('YYYY-MM-DD'));
                $DATEPICKER.val(moment(currentMonth).subtract(1, 'day').format($DATEPICKER.data('format')));
            } else {
                $DATEPICKER.data('value', moment(currentMonth).add(1, 'day').format('YYYY-MM-DD'));
                $DATEPICKER.val(moment(currentMonth).add(1, 'day').format($DATEPICKER.data('format')));
            }
            // data.date = $CALLDATE.data('value');
        });
    }

    $BOARDFORM.bind('submit', function (event) {
        event.preventDefault();
        var formData = {
            '게시판ID': params.board['게시판ID'],
            '작성자': params.user['인덱스'],
            '입력필드': params.board['입력필드'],
            '공지': $NOTICE.selectpicker('val'),
            '데이터': {},
            '로그': {
                '변경자': params.user['인덱스'],
                '메세지': ''                
            }
        };
        var inputFields = formData['입력필드'];
        var unUpload = false;
        var isEdit = false;
        var isWriter = true;
        if (params.board['인덱스']) {
            isEdit = true;
            formData['게시글ID'] = params.board['인덱스'];
            formData['입력필드'] = params.board['입력필드2'];
            isWriter = params.user['인덱스'] === params.board['작성자'];
            if (!isWriter) {
                formData['작성자'] = params.board['작성자'];                
            }
        }
        formData['게시판명칭'] = params.board['명칭'];
        formData['공지'] = formData['공지'] === '' ? 0 : formData['공지'];
        formData['그룹방명칭'] = params.board['그룹방명칭'];
        inputFields.forEach(function (field) {

            var $FIELD = $('[data-name="' + field['name'] + '"][data-label="' + field['label'] + '"]');
            var value, label;

            switch ($FIELD[0].tagName) {
                case 'SELECT':
                    value = $FIELD.attr('multiple') ? $FIELD.selectpicker('val').join(',') : $FIELD.selectpicker('val');
                    break;
                case 'TEXTAREA':
                    value = $FIELD.val().trim().replace(/'/gim, "''");
                    break;
                default:
                    value = $FIELD.val().trim();

                    if (field['type'] === '파일첨부') {

                        label = $FIELD.data('label');

                        if (params.board['데이터']) {
                            if (params.board['데이터'][label] && params.board['데이터'][label].length) {
                                value = params.board['데이터'][label];
                            }
                        }
                    }

                    break;
            }

            if (value.indexOf('fakepath') >= 0) {
                unUpload = true;
            }

            formData['데이터'][field['label']] = value;
            if (!isWriter) {
                if (formData['데이터'][field.label] !== params.board['데이터'][field.label]) {
                    formData['로그']['메세지'] += params.user['이름'] + '님이 ' + field.label + '을(를) 변경하였습니다.\n';
                }
            }
        });


        console.log(formData);
        
        if (unUpload) {
            swal('', '첨부파일 업로드를 먼저해주세요.', 'error');
            event.preventDefault();
        } else {

            swal({
                title: '저장하시겠습니까?',
                type: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '확인',
                cancelButtonText: '취소'
            }).then(function () {
                return Save(formData, isEdit);
            }).then(function () {
                swal(
                    '',
                    '저장되었습니다.!',
                    'success'
                ).then(function () {
                    if (isEdit) {
                        location.href = '/board/view?index=' + params.board['게시판ID'] + '&article=' + params.board['인덱스'];
                    } else {
                        location.href = '/board?index=' + params.board['게시판ID'];
                    }
                });
            }).catch(function (error) {
                console.log(error);
            })
        }
    })




    function Save(data, isEdit) {
        return new Promise(function (resolve, reject) {
            try {
                var axiosHttp = isEdit ? axios.put(API.BOARD.BOARD, data) : axios.post(API.BOARD.BOARD, data)

                axiosHttp
                    .then(function (result) {
                        resolve(result);
                    })
                    .catch(function (error) {
                        fn.errorNotify(error);
                        reject(error);
                    })
            } catch (error) {
                reject(error);
            }
        })
    }


})(window);