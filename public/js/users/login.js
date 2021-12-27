(function (exports) {

    sessionStorage.clear();
    // var login = (function () {

    var $FORM = $('#login-form');
    var $REMEMBERME = $('#remember-me');

    function checkRemember() {

        var userInfo = localStorage.getItem('user');

        if (userInfo) {
            userInfo = JSON.parse(userInfo);
            $FORM.find('#username').val(userInfo['username'].trim());
            $FORM.find('#password').val(userInfo['password'].trim());
            $REMEMBERME.prop('checked', true);
            if (autoLogin === 1) {                
                $FORM.trigger('submit');
            }
        } else {
            $FORM.find('#username').val('');
            $FORM.find('#password').val('');
            $REMEMBERME.prop('checked', false);
        }

    }



    $FORM.validate({
        rules: {
            username: "required",
            password: "required"
        },
        messages: {
            username: {
                required: '아이디를 입력해주세요.'
            },
            password: {
                required: '비밀번호를 입력해주세요.'
            }
        },
        submitHandler: function (form) {
            var formData = $FORM.serializeArray();
            axios.get('/api/users/login', {
                params: {
                    username: formData.find(function (element) { return element.name === 'username'; }).value,
                    password: formData.find(function (element) { return element.name === 'password'; }).value
                }
            })
                .then(function (result) {
                    console.log(result);
                    if (result.data['상태'] === 1) {
                        swal({
                            title: '',
                            type: 'error',
                            text: '퇴사한 사원은 로그인할 수 없습니다.'
                        });
                    } else {

                        if ($REMEMBERME.is(':checked')) {
                            var userInfo = {
                                username: $FORM.find('#username').val().trim(),
                                password: $FORM.find('#password').val().trim()
                            };
                            localStorage.setItem('user', JSON.stringify(userInfo));
                        } else {
                            localStorage.removeItem('user');
                        }


                        location.href = exports.redirectUrl || "/";
                    }
                })
                .catch(function (error) {
                    // error = error.response;
                    // console.log(error);
                    if (error.response.status == 404) {
                        swal({
                            title: '',
                            type: 'error',
                            html: '사원정보를 찾을 수 없습니다. <br> 아이디, 비밀번호를 확인해주세요.'
                        });
                    } else {
                        // swal({
                        //     title: '오류가 발생하였습니다!',
                        //     type: 'error',
                        //     text: error.statusText
                        // });
                        fn.errorNotify(error);
                    }
                })
        }
    })

    checkRemember();

    // })();

})(window);