;
(function (exports) {
    'use strict'
    var $SERVICEINFO = $('.service-info')
    var $CAPTURELIST = $('.preview-container')
    var $ATTACHMENT = $(':input[name="uploadfile"]')
    var $GOMAIN = $('#go-main')
    var $LANDINGPAGE = $('div.landingscreen')
    var $LANDINGBTN = $('#show-accept-page')
    var $ACCEPTPAGE = $('div.acceptscreen')
    var captureImage = []
    var clientInfo = {}
    $.get('https://www.cloudflare.com/cdn-cgi/trace', function (data) {
        console.log(data);
        var arrTemp = data.split("\n");
        arrTemp.forEach(function (prop) {
            var arrSubTemp = prop.split("=");
            clientInfo[arrSubTemp[0]] = arrSubTemp[1];
        });

        if (clientInfo.hasOwnProperty('ip')) {
            if (clientInfo.ip === '103.129.185.116') {
                $SERVICEINFO.filter("#hospnum").val('99990090')
                $SERVICEINFO.filter("#hospname").val('스케일업병원')
                $SERVICEINFO.filter("#area").val('0000')
                $SERVICEINFO.filter("#program").val('20')
                // $SERVICEINFO.filter("#exe").val('')
                // $SERVICEINFO.filter("#pcinfo").val()
                // $SERVICEINFO.filter("#curversion").val()
                // $SERVICEINFO.filter("#bohum").val()
                // $SERVICEINFO.filter("#hosp_contact").val()
                // $SERVICEINFO.filter("#pacs").val()
                // $SERVICEINFO.filter("#servername").val()
                // $SERVICEINFO.filter("#serverid").val()
                // $SERVICEINFO.filter("#serverpw").val()
                // $SERVICEINFO.filter("#dbname").val()
                // $SERVICEINFO.filter("#certpw").val()
                // $SERVICEINFO.filter("#openperson").val()
                // $SERVICEINFO.filter("#sutak").val()
                // $SERVICEINFO.filter("#os").val()
                // $SERVICEINFO.filter("#sqlversion").val()
                // $SERVICEINFO.filter("#masterDrug").val()
                // $SERVICEINFO.filter("#masterSuga").val()
                // $SERVICEINFO.filter("#masterMaterial").val()
                // $SERVICEINFO.filter("#manager").val()
                // $SERVICEINFO.filter("#captures").val()
                // $SERVICEINFO.filter("#tag").val()
                // $SERVICEINFO.filter("#requires").val()
                // $SERVICEINFO.filter("#macaddress").val()
                // $SERVICEINFO.filter("#emrtype").val()
            }
        }

    });

    exports.fn.RenderCaptureImage = function () {
        var newCapture = $SERVICEINFO
            .filter('#captures')
            .val()
            .trim()

        $SERVICEINFO.filter('#captures').val('')

        if (newCapture === '') return false
        else newCapture = JSON.parse(newCapture.replace(/\\\\/gim, '/'))

        // if (typeof captureImage === 'object') {
        captureImage = captureImage.concat(newCapture)
        // } else {
        // captureImage = newCapture
        // }
        // $SERVICEINFO.filter('#captures').val(JSON.stringify(captureImage));

        newCapture.forEach(function (newImg) {
            var preview = ''
            preview +=
                '<div class="preview-image-wrapper text-center" onclick="fn.PopupImage(event, {{POPUP}})">'
            if (newImg.type.match(/xlsx|xls|doc/gim)) {
                preview += '    <i class="fa fa-file fa-4x"></i>'
            } else {
                preview += '    <img src="{{PATH}}" class="preview-image" alt="">'
            }
            preview += '    <div class="overlay">'
            preview +=
                '        <button type="button" class="btn btn-link" data-value="{{PATH}}" onclick="fn.DeleteCaptureImage(this);">&times;</button>'
            preview += '    </div>'
            preview += '</div>'

            // preview = preview.replace('{{NAME}}', newCapture[0]['name']);
            preview = preview.replace(/{{PATH}}/gim, newImg['oPath'])
            preview = preview.replace(
                '{{POPUP}}',
                "'" +
                newImg['oPath'] +
                "','캡쳐이미지', 'titlebar=0, fullscreen=1, status=0, toolbar=0, scrollbars=1, resizable=1'"
            )

            $CAPTURELIST.append(preview)
        })

        $('html, body').animate({
            scrollTop: $CAPTURELIST.offset().top
        },
            800
        )
    }
    exports.fn.PopupImage = function (event, image) {
        if (event.target.tagName !== 'BUTTON') {
            var popup = window.open(image)
            popup.moveTo(0, 0)
        }
    }

    exports.fn.DeleteCaptureImage = function (b) {
        var selIndex = -1
        var imgPath = b.dataset.value
        var imgObj = captureImage.find(function (img, index) {
            if (img['oPath'] === imgPath) {
                selIndex = index
                return true
            }
        })

        axios
            .delete(API.FILEMANAGER.DELETE, {
                data: {
                    files: [imgObj]
                }
            })
            .then(function (result) {
                $(b)
                    .closest('.preview-image-wrapper')
                    .remove()
                captureImage.splice(selIndex, 1)
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

        formData.append('savepath', 'service')

        $.ajax({
            url: API.FILEMANAGER.UPLOAD,
            processData: false,
            contentType: false,
            cache: false,
            data: formData,
            type: 'POST',
            beforeSend: function () { },
            success: function (res) {
                $SERVICEINFO.filter('#captures').val(JSON.stringify(res))
                fn.RenderCaptureImage()
            },
            error: function (error) {
                fn.errorNotify(error)
            }
        })
    }

    exports.fn.RenderRequiredInfo = function (tag) {
        var RequiredInfo = $('#service-tag-required')
        RequiredInfo.empty()
        $SERVICEINFO.filter('#tag').val('')
        $SERVICEINFO.filter('#requires').val('')
        if (!tag.required.length) {
            return false
        }
        $SERVICEINFO.filter('#tag').val(tag.name)
        var info = ''
        tag.required.forEach(function (require) {
            if (require.length) {
                var label = require
                var placeholder = ''
                if (label.indexOf('예시') > -1) {
                    var start, end
                    start = label.indexOf('(') + 1
                    end = label.indexOf(')')
                    placeholder = label.substring(start, end)
                    label = label.replace('(' + placeholder + ')', '')
                }

                var requires = $SERVICEINFO.filter('#requires').val()
                if (requires.length) {
                    requires += ',' + label
                } else {
                    requires = label
                }
                $SERVICEINFO.filter('#requires').val(requires)

                info += '<div class="input-group m-b-xs">'
                info +=
                    '    <span class="input-group-addon">' + label + '</span>'
                info +=
                    '    <input type="text" class="form-control input" name="service-require" required placeholder="' +
                    placeholder +
                    '" />'
                info += '</div>'
            }
        })

        RequiredInfo.append(info)
    }

    $(document).ready(function (event) {
        var program = $SERVICEINFO.filter('[name="program"]').val()
        if (program == 20) {
            $LANDINGBTN.bind('click', function (event) {
                event.preventDefault();
                $LANDINGPAGE.addClass('hidden')
                $ACCEPTPAGE.removeClass('hidden')
            })
        } else {
            $LANDINGPAGE.addClass('hidden')
            $ACCEPTPAGE.removeClass('hidden')
        }

        $.fn.selectpicker.defaults.noneResultsText = '{0} 검색 결과가 없습니다. <br> 찾으시는 문의문구가 없을경우 <br> 프로그램 선택에서 [기타]를 선택하시면 문의내용을 입력할 수 있습니다.'

        if ($('input[name="program"]').val() != 8 && $('input[name="program"]').val() != 10 && $('input[name="program"]').val() != 20 && $('input[name="program"]').val() != 21) {
            // $('button#service-document').addClass('hidden')
            $('a[name="service-document"]').addClass('hidden')
        } else {
            // $('button#service-document').removeClass('hidden')
            $('a[name="service-document"]').removeClass('hidden')
        }

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
                    return files[key].type.indexOf('image/') < 0
                }) &&
                $('#exe').val() !== '문서추가'
            ) {
                swal('이미지만 첨부할 수 있습니다.', '', 'error')
            } else {
                fn.UploadFile(files)
            }
        })

        $('#service_tag')
            .selectpicker()
            .bind('changed.bs.select', function (event) {
                var tagIndex = $(this).selectpicker('val')
                var tag = exports.tags.find(function (_tag) {
                    return _tag.exe === $('input[name="exe"]').val()
                })
                $SERVICEINFO.filter('#tag').val(tag.mainCategory[tagIndex].name)
            })

        $GOMAIN.bind('click', function () {
            // onclick="location.href='/service/hospital/talk'"
            var formData = $('form').serialize()
            location.href = '/service/hospital/talk?' + formData
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
            });

        $SERVICEINFO.filter('input[type="radio"]').bind('change', function (e) {
            if ($(this).val() == 3 && $(this).is(':checked')) {
                swal('', '[수납관련 문의]를 선택하셨습니다. <br> 수납, 청구, 금액관련 문의내용만 입력해주세요.', 'warning')
            }
        })

        $('#accept-service').bind('click', function (event) {
            var formData = $(this).closest('form').serializeArray()

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

            if ($SERVICEINFO.filter('#exe').val() === '기타') {
                if ($('[name="comment"]').val().trim() === "") {
                    swal('', '문의내용을 입력해주세요.', 'warning')
                    return false
                }
            }

            var asTypeRadio = document.getElementsByName('astype');
            if (!(asTypeRadio[0].checked || asTypeRadio[1].checked || asTypeRadio[2].checked)) {
                swal('', 'AS 분류를 선택해주세요.', 'warning');
                return false;
            }

            if (!captureImage.length) {
                if ($('#exe').val() == '문서추가') {
                    swal(
                        '',
                        '추가요청할 문서파일을 첨부하여 주세요.',
                        'warning'
                    )
                } else {
                    swal(
                        '',
                        '오류화면 또는 사용법과 관련된 화면을 [③ 화면캡쳐] 기능을 통해 첨부하여 주세요.',
                        'warning'
                    )
                }
                return false
            } else {
                $SERVICEINFO
                    .filter('#captures')
                    .val(JSON.stringify(captureImage))

                $('[name="comment"]').val($('[name="comment"]').val().replace(/'|"/gim, '＂'));
                
                var emrtypeID = $SERVICEINFO.filter('#emrtype').val() * 1;
                var programID = $SERVICEINFO.filter('#program').val() * 1;

                // if ($SERVICEINFO.filter('#emrtype').val() !== '' && ($SERVICEINFO.filter('#program').val() !== $SERVICEINFO.filter('#emrtype').val())) {
                if (emrtypeID !== programID && emrtypeID !== 0 ) {
                    event.preventDefault();
                    swal({
                        title: '',
                        html: '양방, 한방 모두 사용중입니다. <br>문의하시는 내용에 해당하는 과목을 선택해주세요.',
                        showCancelButton: true,
                        confirmButtonText: '양방',
                        cancelButtonText: '한방'
                    }).then(function (result) {
                        $('#accept-service').closest('form').submit();
                    }).catch(function () {
                        $SERVICEINFO.filter('#program').val($SERVICEINFO.filter('#emrtype').val())
                        $('#accept-service').closest('form').submit();
                    })
                } else {
                    $('#accept-service').closest('form').submit();
                }
            }
        })

        // axios
        //     .get(API.SERVICE.TAGS)
        //     .then(function (result) {
        //         console.log(result)
        //         var origins = result.data.tags
        //         exports.tags = []
        //         // preserve newlines, etc - use valid JSON
        //         origins = origins
        //             .replace(/\\n/g, '\\n')
        //             .replace(/\\'/g, "\\'")
        //             .replace(/\\"/g, '\\"')
        //             .replace(/\\&/g, '\\&')
        //             .replace(/\\r/g, '\\r')
        //             .replace(/\\t/g, '\\t')
        //             .replace(/\\b/g, '\\b')
        //             .replace(/\\f/g, '\\f')
        //         // remove non-printable and other non-valid JSON chars
        //         origins = origins.replace(/[\u0000-\u0019]+/g, '')
        //         origins = JSON.parse(origins)

        //         exports.tags = origins
        //     })
        //     .catch(function (error) {
        //         console.log(error)
        //     })

        $('[name="service-exe"]').bind('click', function (event) {
            var exe = $(this).val()
            if ($('input[name="exe"]').val() === exe) {
                return false
            }

            $('input[name="exe"]').val(exe)
            $('[name="service-exe"]')
                .removeClass('btn-success')
                .addClass('btn-default')
            $(this)
                .addClass('btn-success')
                .removeClass('btn-default')
            $('textarea[name="comment"]').removeAttr('disabled')
            $('.service-document-help').addClass('hidden')
        })

        $('button#service-document').bind('click', function (event) {
            if ($(this).hasClass('btn-success')) {
                $('.service-document-help').removeClass('hidden')
                $('textarea[name="comment"]').val('문서(공용or기타문서): \n\n수정/신규: \n\n저장위치(문서위치): \n\n요청내용(상세히): \n\n')
            } else {
                $('.service-document-help').addClass('hidden')
                $('textarea[name="comment"]').val('')
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



        // $('#service_tag').selectpicker({
        //         liveSearch: true,
        //         size: 10
        //     })
        //     .ajaxSelectPicker({
        //         ajax: {
        //             url: API.SERVICE.TAGS,
        //             method: 'GET',
        //             dataType: 'json'
        //         },
        //         preprocessData: function (data) {
        //             var origins = data.tags
        //             var tags = []
        //             // preserve newlines, etc - use valid JSON
        //             origins = origins.replace(/\\n/g, "\\n")
        //                 .replace(/\\'/g, "\\'")
        //                 .replace(/\\"/g, '\\"')
        //                 .replace(/\\&/g, "\\&")
        //                 .replace(/\\r/g, "\\r")
        //                 .replace(/\\t/g, "\\t")
        //                 .replace(/\\b/g, "\\b")
        //                 .replace(/\\f/g, "\\f");
        //             // remove non-printable and other non-valid JSON chars
        //             origins = origins.replace(/[\u0000-\u0019]+/g, "");
        //             origins = JSON.parse(origins)

        //             origins.forEach(function (tag) {
        //                 // hosps[hosp['ID']] = hosp['기관명칭'];
        //                 console.log(tag)
        //                 // tags.push({
        //                 //     'value': tag['ID'] + '|' + hosp['기관코드'],
        //                 //     'text': hosp['기관명칭'] + '/' + hosp['담당지사'] + (hosp['담당자'].trim().length > 0 ? '/' + hosp['담당자'] : ''),
        //                 //     'disabled': false
        //                 // })
        //             });

        //             return hosps;
        //         },
        //         preserveSelected: false
        //     });
    })
})(window)
