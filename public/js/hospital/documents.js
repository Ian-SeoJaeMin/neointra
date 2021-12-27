;
(function (exports) {
    'use strict'
    var $SERVICEINFO = $('.service-info')
    var $CAPTURELIST = $('.preview-container')
    var $ATTACHMENT = $(':input[name="uploadfile"]')
    var $GOMAIN = $('#go-main')
    var documents = []


    exports.fn.RenderDocuments = function () {
        var $DOCUMENTSLIST = $('#document-file-list')
        $DOCUMENTSLIST.empty()

        documents.forEach(function (item) {
            $DOCUMENTSLIST.append(
                '<li><i class="fa ' + item.icon + '"></i> ' + item.name +
                '    <button type="button" class="btn btn-link btn-xs m-b-xs" data-value="' + item.oPath + '" onclick="fn.DeleteDocument(this);"><i class="fa fa-trash"></i></button>' +
                '</li>'
            )
        })

    }

    exports.fn.DeleteDocument = function (b) {
        var selIndex = -1

        var docPath = b.dataset.value
        var docObj = documents.find(function (doc, index) {
            if (doc['oPath'] === docPath) {
                selIndex = index
                return true
            }
        })

        axios
            .delete(API.FILEMANAGER.DELETE, {
                data: {
                    files: [docObj]
                }
            })
            .then(function (result) {
                $(b)
                    .closest('li')
                    .remove()
                documents.splice(selIndex, 1)
                // $EL.closest('li').remove();
                // params.board['데이터'][$EL.data('label')].splice($EL.data('index'), 1);
            })
            .catch(function (error) {
                fn.errorNotify(error)
            })
    }

    exports.fn.UploadFile = function (files) {
        var formData = new FormData()

        Object.keys(files).forEach(function (key) {
            formData.append('uploadfile', files[key])
        }, this)

        formData.append('savepath', 'document')

        $.ajax({
            url: API.FILEMANAGER.UPLOAD,
            processData: false,
            contentType: false,
            cache: false,
            data: formData,
            type: 'POST',
            beforeSend: function () {},
            success: function (res) {
                documents = documents.concat(res)
                $SERVICEINFO.filter('#documents').val(JSON.stringify(documents))
                fn.RenderDocuments()
            },
            error: function (error) {
                fn.errorNotify(error)
            }
        })
    }


    $(document).ready(function (event) {

        //빈값에 자동 포커스
        $SERVICEINFO.each(function (i, v) {
            var $THIS = $(v)
            if ($THIS[0].tagName.match(/INPUT|TEXTAREA/)) {
                if (!$THIS.attr('type') || $THIS.attr('type') !== 'hidden') {
                    if ($THIS.attr('name') !== 'client_contact2') {
                        if ($THIS.val().trim() === '') {
                            $THIS.focus()
                            return false
                        }
                    }
                }
            }
        })

        $ATTACHMENT.bind('change', function () {
            $(this).trigger('fileselect')
        })
        $ATTACHMENT.bind('fileselect', function () {
            // fn.UploadFile($(this).get(0).files);
            var files = $(this).get(0).files

            if (
                Object.keys(files).some(function (key) {
                    return files[key].type.indexOf('image/') < 0 && files[key].name.indexOf('.xls') < 0 && files[key].name.indexOf('.xlsx') < 0 && files[key].name.indexOf('.doc') < 0
                })
            ) {
                swal('이미지(jpg, gif, ...), 워드(word), 엑셀(excel)파일만 첨부하실 수 있습니다.', '', 'error')
            } else {
                fn.UploadFile(files)
            }
        })

        $GOMAIN.bind('click', function () {
            // onclick="location.href='/service/hospital/talk'"
            var formData = $('form').serialize()
            location.href = '/service/hospital'
        })


        $SERVICEINFO.filter('#client_contact')
            .bind('keydown', function (event) {
                if (!$.isNumeric(event.key)) {
                    if (event.keyCode !== 8 && event.keyCode !== 9 && event.keyCode !== 13 && event.keyCode !== 46 && event.keyCode !== 37 && event.keyCode !== 39 && event.keyCode !== 35 && event.keyCode !== 36) {
                        return event.preventDefault()
                    }
                } else if ($(this).val().replace(/-/g, '').length >= 11) {
                    if (event.keyCode !== 8 && event.keyCode !== 9 && event.keyCode !== 13 && event.keyCode !== 46 && event.keyCode !== 37 && event.keyCode !== 39 && event.keyCode !== 35 && event.keyCode !== 36) {
                        return event.preventDefault()
                    }
                }
            })
            .bind('keyup', function (event) {
                var $this = $(this)
                $this.val(autoHypenPhone($this.val()))
                // var curVal = $this.val().replace(/-/g, '')
                // if (curVal.length >= 6) {
                //     if (curVal.length >= 11) {
                //         $this.val(curVal.substring(0, 3) + '-' + curVal.substring(3, 7) + '-' + curVal.substring(7, curVal.length))
                //     } else {
                //         $this.val(curVal.substring(0, 3) + '-' + curVal.substring(3, 6) + '-' + curVal.substring(6, curVal.length))
                //     }
                // }
            })

        $SERVICEINFO.filter('#client_contact2')
            .bind('keydown', function (event) {
                console.log(event)
                if (!$.isNumeric(event.key)) {
                    if (event.keyCode !== 8 && event.keyCode !== 9 && event.keyCode !== 13 && event.keyCode !== 46 && event.keyCode !== 37 && event.keyCode !== 39 && event.keyCode !== 35 && event.keyCode !== 36) {
                        return event.preventDefault()
                    }
                } else if ($(this).val().length >= 5) {
                    if (event.keyCode !== 8 && event.keyCode !== 9 && event.keyCode !== 13 && event.keyCode !== 46 && event.keyCode !== 37 && event.keyCode !== 39 && event.keyCode !== 35 && event.keyCode !== 36) {
                        return event.preventDefault()
                    }
                }
            })

        $('form').bind('submit', function (event) {
            var formData = $(this).serializeArray()

            if ($SERVICEINFO.filter('#hospnum').val().trim() === '') {
                swal('', '병원정보를 불러오는데 실패하였습니다.<br>AS예약 프로그램을 완전히 종료 후 프로그램에서 다시 AS예약 버튼을 눌러 접수해주세요.', 'warning')
                // location.href = location.href;
                return false
            }
            if (
                $SERVICEINFO
                .filter('#client_contact')
                .val()
                .trim() === '010-'
            ) {
                swal('', '연락가능한 연락처를 입력해주세요.', 'warning')
                // event.preventDefault();
                return false
            }


            if ($('[name="comment"]').val().trim() === "") {
                swal('', '요청내용을 입력해주세요.', 'warning')
                return false
            }


            if (!documents.length) {

                swal(
                    '',
                    '추가요청할 문서파일을 첨부하여 주세요.',
                    'warning'
                )

                return false
            } else {

                var areaId = $SERVICEINFO.filter('#area').val()

                exports.fn.getArea(areaId)
                    .then(function (area) {
                        if (!area) {
                            $SERVICEINFO.filter('#area').val("본 사")
                        } else {
                            $SERVICEINFO.filter('#area').val(area['지사명'])
                        }
                    })
                    .catch(function (error) {
                        $SERVICEINFO.filter('#area').val("본 사")
                    })

                var programId = $SERVICEINFO.filter('#program').val()
                var program = exports.EMR(parseInt(programId))

                $SERVICEINFO.filter('#program').val(program.name)

                $SERVICEINFO
                    .filter('#documents')
                    .val(JSON.stringify(documents))

                areaId = null
                programId = null
                program = null

                alert('접수되었습니다.');

                return true
            }
        })


        function autoHypenPhone(str) {
            str = str.replace(/[^0-9]/g, '');
            var tmp = '';
            if (str.length < 4) {
                return str;
            } else if (str.length < 7) {
                tmp += str.substr(0, 3);
                tmp += '-';
                tmp += str.substr(3);
                return tmp;
            } else if (str.length < 11) {
                tmp += str.substr(0, 3);
                tmp += '-';
                tmp += str.substr(3, 3);
                tmp += '-';
                tmp += str.substr(6);
                return tmp;
            } else {
                tmp += str.substr(0, 3);
                tmp += '-';
                tmp += str.substr(3, 4);
                tmp += '-';
                tmp += str.substr(7);
                return tmp;
            }
            return str;
        }

    })
})(window)
