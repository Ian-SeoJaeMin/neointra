;(function(exports) {
    'use strict'

    var $PROJECTFORM = $('#project-form'),
        $PROJECTFILEADD = $('#project-files'),
        $UPLOADER = $('.btn-uploader'),
        $UPLOADLABEL = $PROJECTFILEADD.parents('.input-group').find(':text'),
        $DEVELOPPERIOD = $('.datepicker[name="project-development-period"]'),
        $DEVELOPTYPE = $('select[name="project-development-type"]'),
        $DEVELOPER = $('select[name="project-developer"]'),
        $PROJECTFILELIST = $('.project_files')

    $DEVELOPPERIOD
        .datetimepicker({
            format: $DEVELOPPERIOD.data('format'),
            defaultDate: moment()
                .add('d', 1)
                .format(),
            showTodayButton: true,
            ignoreReadonly: true,
            keepOpen: true,
            viewMode: $DEVELOPPERIOD.data('viewmode'),
            minDate: moment()
        })
        .bind('dp.change', function(event) {})

    $DEVELOPER.bind('changed.bs.select', function(event) {
        console.log($(this).selectpicker('val'))
        if ($(this).selectpicker('val').length) {
            $DEVELOPPERIOD.closest('.form-group').removeClass('hidden')
            $DEVELOPTYPE.closest('.form-group').removeClass('hidden')
        } else {
            $DEVELOPPERIOD.closest('.form-group').addClass('hidden')
            $DEVELOPTYPE.closest('.form-group').addClass('hidden')
        }
    })

    $PROJECTFILEADD.bind('change', function() {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input
                .val()
                .replace(/\\/g, '/')
                .replace(/.*\//, '')

        input.trigger('fileselect', [numFiles, label])
    })

    $PROJECTFILEADD.bind('fileselect', function(event, numfiles, label) {
        var log = numfiles > 1 ? numfiles + '개의 파일이 선택됨' : label
        // uploader = $(this).parents('.input-group').find('.btn-uploader');

        if ($UPLOADLABEL.length) {
            $UPLOADLABEL.val(log)
            $UPLOADER.removeClass('hidden')
        }
    })

    $UPLOADER.bind('click', function(event) {
        swal({
            title: '선택한 파일을 업로드하시겠습니까?',
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '확인',
            cancelButtonText: '취소'
        })
            .then(function() {
                var files = $PROJECTFILEADD.get(0).files
                var formData = new FormData()

                Object.keys(files).forEach(function(key) {
                    formData.append('uploadfile', files[key])
                }, this)
                formData.append(
                    'savepath',
                    'project/' + $PROJECTFILEADD.data('path')
                )

                $.ajax({
                    url: API.FILEMANAGER.UPLOAD,
                    processData: false,
                    contentType: false,
                    cache: false,
                    data: formData,
                    type: 'POST',
                    beforeSend: function() {
                        $UPLOADLABEL.val('업로드 준비중...')
                    },
                    xhr: function() {
                        var myXhr = $.ajaxSettings.xhr()
                        if (myXhr.upload) {
                            // check if upload property exists
                            myXhr.upload.addEventListener(
                                'progress',
                                updateProgress,
                                false
                            ) // for handling the progress of the upload
                        }
                        return myXhr
                    },
                    success: function(res) {
                        console.log(res)
                        params.files = params.files.concat(res)
                        params.files.forEach(function(_file, index) {
                            if (
                                res.find(function(_f) {
                                    return _f.name === _file.name
                                })
                            ) {
                                $PROJECTFILELIST.append(
                                    '<li class="m-t-xs m-b-xs p-b-xs">' +
                                        '    <i class="fa ' +
                                        _file.icon +
                                        '"></i> ' +
                                        _file.name +
                                        '    <button class="btn btn-xs btn-link project-file-delete red" type="button" data-index="' +
                                        index +
                                        '"><i class="fa fa-close"></i></button>' +
                                        '</li>'
                                )
                            }
                        })

                        // var input = $PROJECTFILEADD.parents('.input-group').find(':text'),
                        // uploader = $PROJECTFILEADD.parents('.input-group').find('.btn-uploader');
                        $PROJECTFILEADD.val('')
                        $UPLOADLABEL.val('')
                        $UPLOADER.addClass('hidden')
                    },
                    error: function(error) {
                        fn.errorNotify(error)
                    }
                })
            })
            .catch(function(error) {
                console.log(error)
                console.log('cancel')
            })
    })

    $PROJECTFILELIST.bind('click', function(event) {
        var $THIS = $(event.target)
        var $DELETEFILE = null
        if ($THIS[0].tagName === 'I' && $THIS.hasClass('fa-close')) {
            $DELETEFILE = $THIS.closest('button.project-file-delete')
        } else if (
            $THIS[0].tagName === 'BUTTON' &&
            $THIS.hasClass('project-file-delete')
        ) {
            $DELETEFILE = $THIS
        }

        if ($DELETEFILE) {
            DeleteFile($DELETEFILE)
        }
    })

    $PROJECTFORM.bind('submit', function(event) {
        event.preventDefault()

        var formData = {}
        $('input, select, textarea').each(function(idx, el) {
            var key = $(el).attr('name')
            if (key) {
                if (key.match('project-')) {
                    if (key.indexOf('period') >= 0) {
                        formData[$(el).attr('name')] = $(el)
                            .datetimepicker('date')
                            .format('YYYY-MM-DD')
                    } else {
                        formData[$(el).attr('name')] = $(el).val()
                    }
                }
            }
        })

        if (formData['project-manager'] !== '') {
            if (
                !formData['project-developer'].some(function(dev) {
                    return dev == formData['project-manager']
                })
            ) {
                formData['project-developer'].push(formData['project-manager'])
            }
            formData['project-managerName'] = params.users.find(function(user) {
                return user['인덱스'] == formData['project-manager']
            })['이름']
        }

        var isWriter = params.user['인덱스'] === params.project['등록자']
        if (!isWriter) {
            if (
                params.project['상태'] !== parseInt(formData['project-status'])
            ) {
                formData['로그'] =
                    params.user['이름'] + '님이 상태를 변경하였습니다.'
            }
        } else {
            formData['로그'] = ''
        }

        formData['project-writerName'] = params.project['등록자명']

        swal({
            title: '저장하시겠습니까?',
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '확인',
            cancelButtonText: '취소'
        })
            .then(function() {
                Save(formData)
                    .then(function(result) {
                        swal('저장되었습니다.!', '', 'success').then(
                            function() {
                                location.href =
                                    '/project/view?index=' +
                                    formData['project-index']
                            }
                        )
                    })
                    .catch(function(error) {
                        fn.errorNotify(error)
                    })
            })
            .catch(function(error) {
                console.log(error)
            })
    })

    function updateProgress(evt) {
        console.log('updateProgress')
        if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total
            percentComplete = parseInt(percentComplete * 100)
            if (percentComplete === 100) {
                $UPLOADLABEL.val('업로드 완료중...')
            } else {
                $UPLOADLABEL.val('업로드중...' + percentComplete + '%')
            }
        } else {
            // Unable to compute progress information since the total size is unknown
            console.log('unable to complete')
        }
    }

    function DeleteFile(el) {
        var $EL = el
        var selectFile = params.files[$EL.data('index')]
        var files = []
        files.push(selectFile)
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
        })
            .then(function() {
                axios
                    .delete(API.FILEMANAGER.DELETE, {
                        data: {
                            files: files
                        }
                    })
                    .then(function(result) {
                        $EL.closest('li').remove()
                    })
                    .catch(function(error) {
                        fn.errorNotify(error)
                    })
            })
            .catch(function() {
                console.log('cancel')
            })
    }

    function Save(data) {
        return new Promise(function(resolve, reject) {
            try {
                axios
                    .put(API.PROJECT.SAVE, data)
                    .then(function(result) {
                        resolve(result)
                    })
                    .catch(function(error) {
                        fn.errorNotify(error)
                        reject(error)
                    })
            } catch (error) {
                reject(error)
            }
        })
    }
})(window)
