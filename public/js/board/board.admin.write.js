(function (exports) {

    'use strict';

    var $ICONS = $('.board-icon-list'),
        $FORM = $('form'),
        $TITLE = $('#board-name'),
        $USE = $(':radio[name="board-use"]'),
        $SHOWMAIN = $(':checkbox[name="board-home"]'),
        $EDITABLE = $(':checkbox[name="board-editable"]'),
        $REPLYS = $(':radio[name="board-replys"]'),
        $REPLYTEMPLATE = $('textarea#board-reply-template'),
        $AUTH = $('select'),
        $DESCRIPT = $('#board-description'),
        $KAKAO_GROUP = $('#board-kakao'),
        $KAKAO_LINK = $('#board-kakao-link');

    $FORM.bind('submit', function (event) {
        var formData = {};
        formData['명칭'] = $TITLE.val().trim();
        formData['사용'] = $USE.filter(':checked').val();
        formData['메인표시'] = $SHOWMAIN.is(':checked') ? 1 : 0;
        formData['수정제한'] = $EDITABLE.is(':checked') ? 1 : 0;
        formData['댓글'] = $REPLYS.filter(':checked').val();
        formData['권한'] = $AUTH.selectpicker('val').trim();
        formData['설명'] = $DESCRIPT.val().trim();
        formData['아이콘'] = $('.board-icon.bg-green').data('icon') || 'fa-list-alt';
        formData['생성자'] = params.user['인덱스'];
        formData['그룹방명칭'] = $KAKAO_GROUP.val().trim();
        formData['그룹방링크'] = $KAKAO_LINK.val().trim();
        formData['댓글양식'] = $REPLYTEMPLATE.val().trim();

        // console.log(formData);

        event.preventDefault();

        Save(formData);

    });

    $REPLYS.bind('ifChanged', function (event) {
        var replyUse = parseInt($REPLYS.filter(':checked').val());
        if (replyUse === 0 || replyUse === 1) {
            if (replyUse === 1) {
                $REPLYTEMPLATE.attr('disabled', true)
            } else {
                $REPLYTEMPLATE.removeAttr('disabled');
            }
        }
    })

    $ICONS.bind('click', function (event) {
        var $THIS;
        if (event.target.tagName === 'BUTTON') {
            $THIS = $(event.target);
        } else if (event.target.tagName === 'I' || event.target.tagName === 'LI') {
            $THIS = $(event.target).closest('button');
        }
        if ($THIS && $THIS.length) {
            $('.board-icon').removeClass('bg-green');
            $THIS.addClass('bg-green');
        }
    })

    function LoadFontAwesomeIcons() {
        $ICONS.empty();
        var faIcons = icons.split(',');

        // $.get('https://rawgit.com/FortAwesome/Font-Awesome/master/src/icons.yml', function (data) {
        // $.get('https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/metadata/icons.yml', function (data) {

        //     var parsedYaml = jsyaml.load(data);

        $.each(faIcons, function (index, icon) {
            if (icon.id === 'list-alt') {
                $ICONS.prepend('<li><button class="bg-green btn btn-app m-b-xs board-icon p-t-none p-b-none" type="button" data-icon="fa-' + icon + '" title="' + icon + '"><i class="fa fa-' + icon + '" title="' + icon + '"></i>' + icon + '</button></li>');
            } else {
                $ICONS.append('<li><button class="btn btn-app m-b-xs board-icon p-t-none p-b-none" type="button" data-icon="fa-' + icon + '" title="' + icon + '"><i class="fa fa-' + icon + '" title="' + icon + '"></i>' + icon + '</button></li>');
            }
        })
        // });
    }

    function Save(formData) {
        axios.post(API.BOARD.MANAGE, formData)
            .then(function (result) {
                swal('게시판 관리', '저장되었습니다.', 'success')
                    .then(function () {
                        location.href = '/board/manage';
                    });
                // location.href = '/board/manage/input?index=' + result.data['게시판ID'];
            })
            .catch(function (error) {
                fn.errorNotify(error);
            })
    }

    LoadFontAwesomeIcons();

})(window);
