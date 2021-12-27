(function (exports) {

    'use strict';

    var $BOARTOOLS = $('.board-tools');

    $BOARTOOLS.bind('click', function (event) {
        var tool = $(this).data('tool');
        if (tool === 'edit') {
            location.href = '/board/edit?index=' + params.board['게시판ID'] + '&article=' + params.board['인덱스'];
        } else if (tool === 'delete') {
            swal({
                title: '게시글 삭제',
                text: '정말로 삭제하시겠습니까?',
                type: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33'
            }).then(function () {
                DeleteBoard();
            }, function (dismiss) {
                console.log(dismiss);
            })
        }
    })

    function DeleteBoard() {
        axios.delete(API.BOARD.BOARD, {
            data: {
                category: params.board['게시판ID'],
                article: params.board['인덱스']
            }
        }).then(function (result) {
            location.href = '/board?index=' + params.board['게시판ID'];
        }).catch(function (error) {
            fn.errorNotify(error);
        })
    }

})(window);