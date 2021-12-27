(function (exports) {
    'use strict';

    var $PROJECTDELETE = $('.project-delete');

    $PROJECTDELETE.bind('click', function (event) {
        swal({
            title: '프로젝트를 삭제하시겠습니까?',
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '확인',
            cancelButtonText: '취소'
        }).then(function () {
            Delete();
        }).catch(function () {
            console.log('cancel');
        })
    });


    function Delete() {
        axios.delete(API.PROJECT.DELETE, {
            data: {
                index: $PROJECTDELETE.data('index')
            }
        }).then(function () {
            swal('삭제되었습니다', '', 'success')
                .then(function () {
                    location.href = '/project';
                })
        }).catch(function (error) {
            fn.errorNotify(error);
        })
    }

})(window)