(function (exports) {
    'use strict';

    $('a.board-tools').bind('click', function (event) {
        if ($(this).attr('disabled')) {
            event.preventDefault();
        }
    });

    $('button.board-delete').bind('click', function (event) {
        var boardIdx = $(this).data('index');
        swal({
            title: '게시판 삭제',
            html: '해당 게시판을 삭제하시겠습니까?<br>게시판의 게시글과 댓글들이 영구적으로 삭제됩니다.<br>그래도 삭제할까요?',
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then(function () {
            return axios.delete(API.BOARD.MANAGE, {
                data: {
                    index: boardIdx
                }
            })
        }).then(function () {
            return swal('', '삭제하였습니다.', 'success')
        }).then(function () {
            location.reload();
        }).catch(function (error) {
            console.log(error);
        })
    })

    $('.board-list>tbody').sortable({
        update: function () {
            var $THIS = $('.board-list>tbody>tr')
            var data = []
            $THIS.each(function (index, elem) {
                $(elem).data('number', index + 1)
                $(elem).attr('data-number', index + 1)
                //data[$(elem).data('id')] = index + 1
                data.push({
                    '게시판ID': $(elem).data('id'),
                    '순서': index + 1
                });
            });

            axios.put(API.BOARD.SORT, data)
            .then(function (result) {
                swal('저장되었습니다.', '', 'success')

            })
            .catch(function (error) {
                fn.errorNotify(error);
            })

        }
    });

})(window);
