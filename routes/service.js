var express = require('express')
var router = express.Router()
var config = require('../src/config')
var url = require('url')

var fee = require('./service_fee')
var fee2020 = require('./service_fee2020')
var history = require('./service_history')
var finder = require('./service_finder')
var tags = require('./service_tags')
var accept = require('./service_accept')
var serviceData = require('./service_data')

var multer = require('multer'),
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/uploads/')
        },
        filename: function (req, file, cb) {
            cb(null, new Date().valueOf() + '_' + file.originalname)
        }
    })
upload = multer({
    storage: storage
})

var Service = Server.Service
var Kakao = Server.Kakao
var Customer = Server.Customer
var FileManager = Server.FileManager

router.get('/', function (req, res, next) {
    var Board = Server.Board;
    var sendData = {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.AS,
        useBoards: req.boards,
        setting: req.setting
    }

    // 설치 연동 테이블
    Board.Find.Board({
        query: {
            index: 25
        }
    })
        .then(function (board) {
            board[0]['입력필드'] = board[0]['입력필드'] === '' || board[0]['입력필드'] === 'undefined' ? [] : JSON.parse(board[0]['입력필드']);
            sendData.board = board[0];
            sendData.header = board[0]['입력필드'].filter(function (field) {
                return field['header'] === true;
            });
            sendData.finder = board[0]['입력필드'].filter(function (field) {
                console.log(field);
                return field['finder'] === true;
            });


            res.render('service', sendData);
        })
        .catch(function (error) {
            res.render('error', {
                title: '500',
                message: '오류가 발생하였습니다.',
                detail: error
            });
        })

    // res.render('service', {
    //     title: config.web.title,
    //     user: req.session.user,
    //     // menus: config.web.menu,
    //     // menu: config.web.menu.AS,
    //     useBoards: req.boards,
    //     setting: req.setting
    // });

})

router.get('/static', function (req, res, next) {
    res.render('service_static_2', {
        title: config.web.title,
        user: req.session.user,
        // menus: config.web.menu,
        // menu: config.web.menu.AS_STATIC,
        useBoards: req.boards,
        setting: req.setting
    })
})

router.get('/hospital', function (req, res, next) {
    var sendData = {
        title: config.web.title,
        user: req.session.user
        // menus: config.web.menu,
        // menu: config.web.menu.AS
    }

    res.render('hospital', sendData)
})
router.get('/document', function (req, res, next) {
    var sendData = {
        title: config.web.title,
        user: req.session.user
        // menus: config.web.menu,
        // menu: config.web.menu.AS
    }

    res.render('hospital/document', sendData)
})

router.post('/hospital', function (req, res, next) {
    var _service, _count
    Customer.Find.HospitalInfoByHospNum({
        query: {
            hospitalNum: req.body.hospnum
        }
    }).then(function (result) {
        var params = req.body;        
        if (result.length >= 1) {            
            params.userid = result[0]['user_id'];
            params.area = result[0]['INFO_AREA'];

            if (typeof(params.program) ==='undefined') {
                params.program = result[0]['USER_PROGRAM'];
            } else {
                if (params.program * 1 == 0 || params.program.trim() == "") {
                    params.program = result[0]['USER_PROGRAM'];
                }                
            }
        } else {
            params.userid = 0;
        }
        return Service.Insert.Service({body: params});
    }).then(function (result) {
        _service = result[0][0]
        _count = result[1][0]

        var message = ''
        message += `[ A/S가 접수되었습니다. ]\n\n`
        message += `접수일자: ${moment().format('LLL')}\n`
        message += `접수번호: ${_service['인덱스']}\n`
        message += `병원명: ${_service['기관명칭']}\n`
        message += `실행파일: ${_service['실행파일']}\n`
        message += `접수자: ${_service['접수자']}\n`
        message += `연락처: ${_service['연락처'] +
            (_service['내선번호'] !== ''
                ? '(' + _service['내선번호'] + ')'
                : '')}\n\n`
        message += `대분류: ${_service['실행화면']}\n`
        message += `추가정보 or 문의내용\n`
        message += `${_service['문의내용']}\n`


        if (_service['지사코드'] !== '0000') {
            // return Kakao.Insert.Push(message, _service['지사'])
            _service['지사'] = _service['지사'].trim()
            if (_service['지사'] === '서울서부2' || _service['지사'] === '711-서울서부') {
                _service['지사'] = '서울서부';
            } else if (_service['지사'] === '김기엽') {
                _service['지사'] = '711-김기엽';
            }

            return Kakao.Insert.Push(
                message,
                _service['지사코드'] === '0028' ?
                    '경기동부' :
                    _service['지사']
            )
        } else {
            return Kakao.Insert.Push(message, "네오공지")
        }
    }).then(function () {
        global.io.emit('new_service', {
            index: _service['인덱스'],
            hospname: _service['기관명칭'],
            manager: _service['담당자'],
            area: _service['지사코드']
        })
        _service['이미지'] = ''
        res.redirect(
            url.format({
                pathname: '/service/hospital/talk',
                query: {
                    service: JSON.stringify(_service),
                    count: JSON.stringify(_count),
                    hospnum: req.body.hospnum,
                    hospname: req.body.hospname,
                    area: req.body.area,
                    manager: req.query.manager
                }
            })
        )
    }).catch(function (error) {
        console.log(error)
        res.render('error', {
            title: '500',
            message: '오류가 발생하였습니다.',
            detail: error
        })
    })


})

router.post('/document', function (req, res, next) {

    var Board = Server.Board;
    var params = req.body;

    console.log(params)

    var body = {
        "게시판ID": 17,
        "데이터": {
            "요청병원": params.hospname,
            "요청 지사선택": params.area,
            "요청 직원선택": "병원관계자",
            "수정/신규": params['document-new-modify'],
            "작업자": '',
            "내용": "접수자: " + params.client_name + "\n\n" +
                "연락처: " + params.client_contact + "\n\n" +
                "저장위치: " + params.savepos + "\n\n" +
                "문서구분: " + params['document-type'] + "\n\n" +
                params.comment,
            "문서양식 파일첨부": JSON.parse(params.documents),
            "문서완료 희망 날짜": moment().format('YYYY-MM-DD'),
            "총 문서 장수": "1",
            "진행상태": "접수",
            "진료과목": "",
            "지원부서": "",
            "프로그램선택": params.program
        },
        "작성자": 19,
        "공지": 0,
        "입력필드": [{
            "name": "제목",
            "type": "텍스트",
            "label": "요청병원",
            "require": true,
            "placeholder": "요청한 병원 명칭을 입력해주세요.",
            "tooltip": false,
            "default": "",
            "header": true,
            "finder": true,
            "ejs": "../elements/텍스트.ejs"
        }, {
            "name": "지사선택5",
            "type": "지사선택",
            "label": "요청 지사선택",
            "require": true,
            "placeholder": "문서를 요청한 지사를 선택합니다.",
            "tooltip": true,
            "default": "",
            "multiple": false,
            "listitem": ["본 사", "경기남부", "부산지사", "광주지사", "부산본사", "대구지사", "제주지사", "충청지사", "전주지사", "강원지사", "서울강북", "안동지사", "울산지사", "서울강동", "서울서부", "한방사업부", "최종용", "영업부", "메디본사", "메디남부", "메디광주", "김진우", "711-김기엽", "711-최종용", "711-서울서부", "711-김진우", "업체", "폴라리스"],
            "class": "form-control selectpicker",
            "header": true,
            "finder": true,
            "ejs": "../elements/드롭박스.ejs"
        }, {
            "name": "직원선택7",
            "type": "직원선택",
            "label": "요청 직원선택",
            "require": true,
            "placeholder": "문서를 요청한 직원을 선택합니다.",
            "tooltip": true,
            "default": "",
            "multiple": false,
            "listitem": ["김일환", "서무길", "이병민", "구상정", "권성진", "김성현(김영복)", "김영복", "문승욱", "박수형", "서영필", "성기정", "안원국", "이인원", "이종은", "장재혁", "장지웅", "정두영", "진영래", "최대영", "함준혁", "강동형", "박정수", "박찬권", "박희빈", "서재민", "신명주", "이정일", "조원섭", "한가람", "허경호", "김성태", "오강훈", "최수현", "장원표", "조종우", "양주식", "이완식", "장성영", "이동우", "구복채", "김민아", "김영술", "김찬희", "온대경", "김동철", "남경록", "유태식", "최종용", "최주석", "김기엽", "도지덕", "박대호", "이슬기"],
            "class": "form-control selectpicker",
            "header": true,
            "finder": true,
            "ejs": "../elements/드롭박스.ejs"
        }, {
            "name": "드롭박스10",
            "type": "드롭박스",
            "label": "수정/신규",
            "require": true,
            "placeholder": "신규문서 추가 or 기존문서 수정인지의 여부를 선택합니다.",
            "tooltip": false,
            "default": "신규",
            "multiple": false,
            "listitem": ["신규", "수정"],
            "class": "form-control selectpicker",
            "header": true,
            "finder": true,
            "ejs": "../elements/드롭박스.ejs"
        }, {
            "name": "텍스트12",
            "type": "텍스트",
            "label": "작업자",
            "require": true,
            "placeholder": "문서 작업을 진행할 사람을 입력합니다.",
            "tooltip": false,
            "default": "",
            "class": "form-control",
            "header": true,
            "finder": true,
            "ejs": "../elements/텍스트.ejs"
        }, {
            "name": "내용",
            "type": "멀티텍스트",
            "label": "내용",
            "require": true,
            "placeholder": "요청한 문서 리스트와 특정 기능( Ex)합계 등.)이 필요한 경우 자세하게 서술하고, 내용이 길 경우 첨부 파일에 내용 첨부해주세요.",
            "tooltip": false,
            "rows": "20",
            "default": "",
            "header": false,
            "finder": true,
            "ejs": "../elements/멀티텍스트.ejs"
        }, {
            "name": "파일첨부3",
            "type": "파일첨부",
            "label": "문서양식 파일첨부",
            "require": true,
            "placeholder": "※파일첨부는 엑셀파일 또는 이미지파일로 첨부해주시기 바랍니다.",
            "tooltip": false,
            "accept": "",
            "multiple": false,
            "class": "input-group",
            "header": false,
            "finder": false,
            "ejs": "../elements/파일첨부.ejs"
        }, {
            "name": "날짜8",
            "type": "날짜",
            "label": "문서완료 희망 날짜",
            "require": true,
            "placeholder": "문서가 완료되기 희망하는 날짜를 입력합니다.",
            "tooltip": true,
            "format": "YYYY-MM-DD",
            "class": "form-control datepicker",
            "header": true,
            "finder": true,
            "ejs": "../elements/날짜.ejs"
        }, {
            "name": "텍스트13",
            "type": "텍스트",
            "label": "총 문서 장수",
            "require": true,
            "placeholder": "요청문서의 총 장수를 입력합니다.",
            "tooltip": false,
            "default": "1",
            "class": "form-control",
            "header": true,
            "finder": false,
            "ejs": "../elements/텍스트.ejs"
        }, {
            "name": "드롭박스9",
            "type": "드롭박스",
            "label": "진행상태",
            "require": true,
            "placeholder": "현재 진행중인 상태를 입력해주세요.",
            "tooltip": true,
            "default": "접수",
            "multiple": false,
            "listitem": ["접수", "진행중", "완료"],
            "class": "form-control selectpicker",
            "header": true,
            "finder": true,
            "ejs": "../elements/드롭박스.ejs"
        }, {
            "name": "드롭박스8",
            "type": "드롭박스",
            "label": "진료과목",
            "require": false,
            "placeholder": "특정 진료과에서만 사용하는 경우 입력해주세요.",
            "tooltip": true,
            "default": "",
            "multiple": true,
            "listitem": ["내과", "신경과", "정신과", "일반외과", "정형외과", "신경외과", "흉곽외과", "성형외과", "마취과", "산부인과", "소아과", "안과", "이비인후과", "피부과", "비뇨기과", "방사선과", "해부병리과", "임상병리과", "결핵과", "재활의학과", "핵의학과", "가정의학과", "응급의학과", "요양병원", "한방과"],
            "class": "form-control selectpicker",
            "header": false,
            "finder": false,
            "ejs": "../elements/드롭박스.ejs"
        }, {
            "name": "드롭박스7",
            "type": "드롭박스",
            "label": "지원부서",
            "require": false,
            "placeholder": "특정 지원부서에서만 사용하는 경우 선택해주세요.",
            "tooltip": true,
            "default": "",
            "multiple": true,
            "listitem": ["검사실", "내시경실", "물리치료실", "총무과", "초음파실", "처치실", "약국", "응급실", "원무과", "예진실", "영양실", "신생아실", "수술실", "사회복지실", "불임연구소", "분만실", "주사실", "방사선실", "데스크", "진료실", "병동"],
            "class": "form-control selectpicker",
            "header": false,
            "finder": false,
            "ejs": "../elements/드롭박스.ejs"
        }, {
            "name": "프로그램선택11",
            "type": "프로그램선택",
            "label": "프로그램선택",
            "require": true,
            "placeholder": "문서가 적용될 프로그램을 선택합니다.",
            "tooltip": false,
            "default": "SenseChart",
            "multiple": true,
            "listitem": ["SenseChart", "WorkingChart"],
            "class": "form-control selectpicker",
            "header": true,
            "finder": true,
            "ejs": "../elements/드롭박스.ejs"
        }]
    }


    Board.Insert.Article({
        body: body
    })
        .then(function (result) {
            var params = req.body;
            var message = '';
            message += '문서관리 게시판에 새로운 글이 등록되었습니다. \n';
            message += req.protocol + '://' + req.get('host') + '/board/view?index=17&article=' + result['인덱스'];

            if (process.env.NODE_ENV === 'build') {
                Kakao.Insert.PushGroup(message, '문서추가요청');
            } else {
                Kakao.Insert.Push(message, '서재민');
            }

            // res.json(result);
            res.redirect(
                url.format({
                    pathname: '/service/hospital'
                })
            )
        })
        .catch(function (error) {
            console.log(error);
            res.render('error', {
                title: '500',
                message: '오류가 발생하였습니다.',
                detail: error
            })
        })



    // var _service, _count

    // Service.Insert.Service(req)
    //     .then(function(result) {
    //         _service = result[0][0]
    //         _count = result[1][0]

    //         var message = ''
    //         message += `[ A/S가 접수되었습니다. ]\n\n`
    //         message += `접수번호: ${_service['인덱스']}\n`
    //         message += `병원명: ${_service['기관명칭']}\n`
    //         message += `실행파일: ${_service['실행파일']}\n`
    //         message += `접수자: ${_service['접수자']}\n`
    //         message += `연락처: ${_service['연락처'] +
    //             (_service['내선번호'] !== ''
    //                 ? '(' + _service['내선번호'] + ')'
    //                 : '')}\n\n`
    //         message += `대분류: ${_service['실행화면']}\n`
    //         message += `추가정보 or 문의내용\n`
    //         message += `${_service['문의내용']}\n`

    //         if (_service['담당자'] !== 0) {
    //             return Kakao.Insert.Push(message, _service['담당자명'])
    //         } else if (_service['지사코드'] !== '0000') {
    //             // return Kakao.Insert.Push(message, _service['지사'])
    //             return Kakao.Insert.Push(
    //                 message,
    //                 _service['지사코드'] === '0028'
    //                     ? '경기동부'
    //                     : _service['지사']
    //             )
    //         }
    //     })
    //     .then(function() {
    //         global.io.emit('new_service', {
    //             index: _service['인덱스'],
    //             hospname: _service['기관명칭'],
    //             manager: _service['담당자'],
    //             area: _service['지사코드']
    //         })
    //         _service['이미지'] = ''
    //         res.redirect(
    //             url.format({
    //                 pathname: '/service/hospital/talk',
    //                 query: {
    //                     service: JSON.stringify(_service),
    //                     count: JSON.stringify(_count),
    //                     hospnum: req.body.hospnum,
    //                     hospname: req.body.hospname,
    //                     area: req.body.area,
    //                     manager: req.query.manager
    //                 }
    //             })
    //         )
    //     })
    //     .catch(function(error) {
    //         console.log(error)
    //         res.render('error', {
    //             title: '500',
    //             message: '오류가 발생하였습니다.',
    //             detail: error
    //         })
    //     })
})

router.get('/hospital/talk', function (req, res, next) {
    console.log(req.query)
    var sendData = {
        title: config.web.title,
        user: req.session.user,
        service: req.query.service ? JSON.parse(req.query.service) : undefined,
        count: req.query.count ? JSON.parse(req.query.count) : undefined,
        hospital: {
            hospnum: req.query.hospnum,
            hospname: req.query.hospname,
            area: req.query.area,
            manager: req.query.manager
        }
        // menu: config.web.menu.AS
    }

    console.log(sendData)

    res.render('hospital/talk', sendData)
})

router.post('/api/fm/capture', upload.array('uploadfile'), function (
    req,
    res,
    next
) {
    console.log(req.body, req.files)
    FileManager.AddFile({
        savepath: 'service'
    },
        req.files
    )
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            console.log(error)
            res.status(500).json(error)
        })
})

router.use('/fee', fee)
router.use('/fee2020', fee2020)
router.use('/history', history)
router.use('/finder', finder)
router.use('/tags', tags)
router.use('/accept', accept)
router.use('/data', serviceData)

module.exports = router
