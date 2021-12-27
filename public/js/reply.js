(function (exports) {
    'use strict';
    var KEYWORD = {
        오류: {
            keyword: '오류.',
            tag: '<b class="red">오류</b>',
            replace: '<b class="red">[오류사항]</b>',
        },
        개선: {
            keyword: '개선.',
            tag: '<b class="orange">개선</b>',
            replace: '<b class="orange">[개선사항]</b>',
        },
        완료: {
            keyword: '완료.',
            tag: '<b class="blue">완료</b>',
            replace: '<b class="blue">[완료]</b>',
        },
        미완료: {
            keyword: '미완료.',
            tag: '<b class="red">미완료</b>',
            replace: '<b class="red">[미완료]</b>',
        }
    };

    var $FORM = $('.reply-form'),
        $MESSAGE = $FORM.find('textarea'),
        $GUBUN = $FORM.find('select[name="gubun"]'),
        $REPLYREPLY = $('.reply-addReply'),
        $REPLYWRITER = $('.reply-writer'),
        $DELETE = $('button.reply-delete');

    var table = $FORM.find('input[name="table"]').val();

    $FORM.find(':input[name="redirect"]').val(location.href);

    var $KEYWORDS = '';
    $KEYWORDS += '<h5 class="m-b-none">약속어</h5>';
    // $KEYWORDS += '<ul class="list-unstyled list-inline m-b-none">';
    $KEYWORDS += '<div class="btn-group m-b-xs">';
    Object.keys(KEYWORD).forEach(function (element) {
        // $KEYWORDS += '   <li>';
        $KEYWORDS +=
            '       <button type="button" class="btn btn-default btn-xs reply-keyword" data-keyword=' +
            element +
            '>' +
            KEYWORD[element].tag +
            '</button>';
        // $KEYWORDS += '   </li>';
    }, this);
    $KEYWORDS += '</div>';
    $FORM.prepend($KEYWORDS);

    $('.url').each(function () {
        var contains = $(this).html();
        $(this).html(
            contains
            .replace(/오류\./gim, KEYWORD.오류.replace)
            .replace(/개선\./gim, KEYWORD.개선.replace)
            .replace(/[^미]완료\./gim, KEYWORD.완료.replace)
            .replace(/미완료\./gim, KEYWORD.미완료.replace)
        );
    });

    $REPLYREPLY.bind('click', function (event) {
        var index = $(this).data('index');
        $(this).text($(this).text() === '댓글달기' ? '취소' : '댓글달기');
        $('.reply-child-form-' + index).toggleClass('hidden');
    });

    $REPLYWRITER
        .bind('mouseover', function () {
            $(this).css('cursor', 'pointer');
        })
        .bind('click', function (event) {
            event.preventDefault();
            var $this = $(this);
            var $replys = $('.reply-media');

            if ($this.hasClass('bg-muted')) {
                $this.addClass('bg-blue').removeClass('bg-muted').siblings().addClass('bg-muted').removeClass('bg-blue');

                $replys.each(function (index, element) {
                    if ($(element).data('writer') !== $this.data('writer')) {
                        $(element).addClass('hidden');
                    } else {
                        $(element).removeClass('hidden');
                    }
                });
            } else if ($this.hasClass('bg-blue')) {
                $this.addClass('bg-muted').removeClass('bg-blue').siblings().addClass('bg-muted').removeClass('bg-blue');

                $replys.each(function (index, element) {
                    $(element).removeClass('hidden');
                });
            }

        });

    $FORM.bind('click', function (event) {
        var $THIS = $(event.target);

        if (event.target.tagName === 'B') {
            $THIS = $THIS.parent();
        }
        if ($THIS.hasClass('reply-keyword')) {
            // var message = $MESSAGE.val ().trim ();
            var $_form = $THIS.closest('form');
            var message = $_form.find('textarea').val().trim();
            message +=
                (message.length <= 0 ? '' : '\n\n') +
                KEYWORD[$THIS.data('keyword')].keyword +
                '\n';
            $_form.find('textarea').val(message).focus();
        }
    });

    $FORM.bind('submit', function (event) {
        if (!$(this).hasClass('reply-child')) {
            if ($GUBUN.length) {
                $FORM
                    .find('input[name="category"]')
                    .val(
                        $GUBUN.selectpicker('val') === '' ? 0 : $GUBUN.selectpicker('val')
                    );
            }
        }
    });

    $DELETE.bind('click', function (event) {
        var index = $(this).data('index');

        swal({
            title: '댓글 삭제',
            text: '정말로 삭제하시겠습니까?',
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        }).then(
            function () {
                Delete(index);
            },
            function (dismiss) {
                console.log(dismiss);
            }
        );
    });

    function Delete(index) {
        axios
            .delete(API.REPLY, {
                data: {
                    index: index,
                    table: table,
                },
            })
            .then(function (result) {
                location.reload();
            })
            .catch(function (error) {
                fn.errorNotify(error);
            });
    }
})(window);
