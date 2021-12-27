var SERVICE_TEMPLATE = {
    WORKFLOW: `
    <table class="table">
        <tr>
            <td><b>접수</b> {{접수자}} / {{연락처}} / {{접수일자}}</td>
        </tr>
        <tr class="hidden service-workflow" name="confirm" data-index="{{인덱스}}">
            <td><b>확인</b> {{확인자}} / {{확인일자}}</td>
        </tr>
        <tr class="hidden service-workflow" name="share" data-index="{{인덱스}}">
            <td><b>공유</b> {{공유자}} / {{공유일자}}</td>
        </tr>
        <tr class="hidden service-workflow" name="process" data-index="{{인덱스}}">
            <td><b>처리</b> {{처리자}} / {{처리일자}}</td>
        </tr>
        <tr class="hidden service-workflow" name="hold" data-index="{{인덱스}}">
            <td><b>보류</b> {{보류자}} / {{보류일자}}</td>
        </tr>
        <tr class="hidden service-workflow" name="done" data-index="{{인덱스}}">
            <td><b>완료</b> {{완료자}} / {{완료일자}}</td>
        </tr>
        <tr class="hidden service-workflow" name="feedback" data-index="{{인덱스}}">
            <td><b>피드백</b> {{피드백자}} / {{피드백일자}}</td>
        </tr>
    </table>
    `
}

function RenderWorkFlow(service) {
    var template = SERVICE_TEMPLATE.WORKFLOW

    template = template.replace(/{{인덱스}}/gim, service['인덱스'])
    template = template.replace(/{{접수자}}/gim, service['접수자'])
    template = template.replace(/{{연락처}}/gim, service['연락처'] + (service['내선번호'] ? '(내선: ' + service['내선번호'] + ')' : ''))
    template = template.replace(/{{접수일자}}/gim, moment(service['접수일자']).format('LLL') + '(' + moment(service['접수일자']).fromNow() + ')')

    if (service['확인자'] !== 0) {
        template = template.replace(/{{확인자}}/gim, service['확인자명'])
        template = template.replace(/{{확인일자}}/gim, moment(service['확인일자']).format('LLL') + '(' + moment(service['확인일자']).fromNow() + ')')
        template = removeHidden(template, 'confirm')
    }

    if (service['상태'] >= CONSTS.SERVICE_STATUS.SHARE && service['공유자'] !== 0) {
        template = template.replace(/{{공유자}}/gim, service['공유자명'])
        template = template.replace(/{{공유일자}}/gim, moment(service['공유일자']).format('LLL') + '(' + moment(service['공유일자']).fromNow() + ')')
        template = removeHidden(template, 'share')
    }

    if (service['상태'] >= CONSTS.SERVICE_STATUS.PROCESS && service['처리자'] !== 0) {
        template = template.replace(/{{처리자}}/gim, service['처리자명'])
        template = template.replace(/{{처리일자}}/gim, moment(service['처리일자']).format('LLL') + '(' + moment(service['처리일자']).fromNow() + ')')
        template = removeHidden(template, 'process')
    }

    if (service['상태'] >= CONSTS.SERVICE_STATUS.HOLD && service['보류자'] !== 0) {
        template = template.replace(/{{보류자}}/gim, service['보류자명'])
        template = template.replace(/{{보류일자}}/gim, moment(service['보류일자']).format('LLL') + '(' + moment(service['보류일자']).fromNow() + ')')
        template = removeHidden(template, 'hold')
    }

    if (service['상태'] >= CONSTS.SERVICE_STATUS.DONE && service['완료자'] !== 0) {
        template = template.replace(/{{완료자}}/gim, service['완료자명'])
        template = template.replace(/{{완료일자}}/gim, moment(service['완료일자']).format('LLL') + '(' + moment(service['완료일자']).fromNow() + ')')
        template = removeHidden(template, 'done')
    }

    function removeHidden(temp, name) {
        var $template = $(temp)
        $template.find('tr[name="' + name + '"]').removeClass('hidden')
        return $template[0].outerHTML
    }

    return template
}

function serviceItemTemplate() {
    return `
    <tr data-index="{{인덱스}}" data-user-id="{{USER_ID}}" data-hospnum="{{기관코드}}">
        <td class="text-center font-bold">{{인덱스}}</td>
        <td class="text-center">{{기관코드}}</td>
        <td>{{기관명칭}}</td>
        <td class="text-center font-bold">{{타입}}</td>
        <td class="text-center font-bold">{{병원유형}}</td>
        <td class="text-center font-bold">{{신규}}</td>
        <td class="text-right">{{프로그램}}</td>
        <td>{{지사}}</td>
        <td>{{실행파일}}</td>
        <td class="text-right">{{접수일자}}</td>
    </tr>
    `
}

function serviceItemDetailTemplate() {
    return `
    <form class="form-horizontal form-label-left">
        <div class="form-group">
            <label class="control-label col-md-3 col-sm-3 col-xs-12">
                <strong class="orange">1. 접수정보</strong>
            </label>
            <div class="col-md-9 col-sm-9 col-xs-12">
                <p class="form-control-static">{{접수정보}}</p>
            </div>
        </div>
        <div class="divider-dashed"></div>
        <div class="form-group">
            <label class="control-label col-md-3 col-sm-3 col-xs-12">
                <strong class="orange">2. 프로그램</strong>
            </label>
            <div class="col-md-9 col-sm-9 col-xs-12">
                <div class="form-control-static">
                    {{프로그램}}
                </div>
            </div>
        </div>
        <div class="divider-dashed"></div>
        <div class="form-group">
            <label class="control-label col-md-3 col-sm-3 col-xs-12">
                <strong class="orange">3. 문의내용</strong>
            </label>
            <div class="col-md-9 col-sm-9 col-xs-12">
                <div class="form-control-static">
                    {{문의내용}}
                </div>
            </div>
        </div>
        <div class="form-group">
            <label class="control-label col-md-3 col-sm-3 col-xs-12">
                <strong class="orange">3.1. 전달사항</strong>
            </label>
            <div class="col-md-9 col-sm-9 col-xs-12">
                <textarea class="form-control" rows="5" id="service-pass-comment">{{전달내용}}</textarea>
                <br>
                {{첨부파일}}
            </div>
        </div>


        <div class="divider-dashed"></div>
        <div class="form-group">
            <label class="control-label col-md-3 col-sm-3 col-xs-12">
                <strong class="orange">4. 실행파일</strong>
            </label>
            <div class="col-md-9 col-sm-9 col-xs-12">
                <div class="form-control-static">
                    {{실행파일}}
                </div>
            </div>
        </div>


        <div class="form-group">
            <label class="control-label col-md-3 col-sm-3 col-xs-12">
                <strong class="orange">5. 메뉴/버튼</strong>
            </label>
            <div class="col-md-9 col-sm-9 col-xs-12">
                {{메뉴버튼}}
            </div>
        </div>
        <div class="divider-dashed"></div>
        <div class="form-group">
            <label class="control-label col-md-3 col-sm-3 col-xs-12">
                <strong class="orange">6. 응급A/S</strong>
            </label>
            <div class="col-md-9 col-sm-9 col-xs-12">
                <div class="form-control-static">
                    <div class="checkbox">
                        <label class="p-l-none">
                            <input type="checkbox" name="service-emergency" id="service-emergency" class="flat" /> 응급
                        </label>
                        <p class="font-bold red">
                            <ol class="font-bold red">
                                <li>진료를 진행할 수 없을정도의 심각한 오류</li>
                                <li>당장 환자가 기다리고 있는 경우(문서, 수납 등)</li>
                                <li>청구쪽 오류 불능건.(월초, 월말)</li>
                            </ol>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div class="divider-dashed"></div>
        <div class="form-group">
            <label class="control-label col-md-3 col-sm-3 col-xs-12">
                <strong class="orange">7. 공유/처리중인 A/S 인덱스</strong>
            </label>
            <div class="col-md-9 col-sm-9 col-xs-12">
                <div class="form-control-static">
                    <div class="input-group">
                        <input type="text" class="form-control" id="service-past" placeholder="A/S인덱스"/>
                        <span class="input-group-btn">
                            <button type="button" class="btn btn-default" data-toggle="modal" data-target="#modal-search">찾아보기</button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <!--
        <div class="divider-dashed"></div>
        <div class="form-group">
            <label class="control-label col-md-3 col-sm-3 col-xs-12">
                <strong class="orange">8. 확인내용</strong>
            </label>
            <div class="col-md-9 col-sm-9 col-xs-12">
                {{확인내용}}

                <div class="form-group">
                    <input type="text" class="form-control" placeholder="환자정보(챠트번호, 이름 등)">
                </div>
                <div class="form-group">
                    <input type="text" class="form-control" placeholder="진료일자">
                </div>
                <div class="form-group">
                    <input type="text" class="form-control" placeholder="처방코드">
                </div>
                <div class="form-group">
                    <input type="text" class="form-control" placeholder="특정자리 여부(전체, 특정자리) / 빈도수 (항상, 자주, 간헐)">
                </div>
                <div class="form-group">
                    <input type="text" class="form-control" placeholder="현상순서 (테스트결과: 현상 나타남 / 나타나지 않음)">
                </div>
                <div class="form-group">
                    <textarea class="form-control" rows="10" data-provide="markdown" placeholder="본인이 확인했던 내용들 기재"></textarea>
                </div>
                <div class="form-group">
                    <textarea class="form-control" rows="5" data-provide="markdown" placeholder="서버 정보 혹은 클라이언트 pc 정보 기재 ( 사용 가능 시간 포함 / 그밖의 주의 사항 )"></textarea>
                </div>

            </div>
        </div>
        -->
        <div class="divider"></div>
        <div class="form-group text-center">
            <button type="button" class="btn btn-sm btn-primary" name="service-confirm-done">확인완료</button>
            <button type="button" class="btn btn-sm btn-default" name="service-save">임시저장</button>
            <button type="button" class="btn btn-sm btn-warning hidden" name="service-afk">부재중</button>
        </div>
    </form>
    `
}

function imageCarouselTemplate() {

    return `
        <div id="{{CAROUSELID}}" class="carousel slide">
            <ol class="carousel-indicators">
                {{INDICATORS}}
            </ol>
            <div class="carousel-inner" role="listbox">
                {{IMAGES}}
            </div>

            <a class="left carousel-control" href="#{{CAROUSELID}}" data-slide="prev">
                <span class="glyphicon glyphicon-chevron-left"></span>
                <span class="sr-only">Previous</span>
            </a>
            <a class="right carousel-control" href="#{{CAROUSELID}}" data-slide="next">
                <span class="glyphicon glyphicon-chevron-right"></span>
                <span class="sr-only">Next</span>
            </a>
        </div>
    `
}

function pastServiceItemTemplate() {
    return `
        <tr data-index="{{인덱스}}">
            <td>{{인덱스}}</td>
            <td>{{실행파일}}</td>
            <td>{{실행메뉴}}</td>
            <td>{{세부화면}}</td>
            <td>{{상태명}}</td>
            <td>{{접수일자}}</td>
            <td>{{문의내용}}</td>
        </tr>

    `
}


function ServiceDataRowTemplate() {
    return `
        <tr class="service-item" data-href="{{링크}}" data-index="{{인덱스}}">            
            <td class="text-center">{{인덱스}}</td>
            <td class="text-center fit">{{기관코드}}</td>
            <td class="text-center fit">{{기관명칭}}</td>
            <td class="text-center">{{상태}}</td>
            <td class="text-center">{{프로그램}}</td>            
            <td class="text-center">{{실행파일}}</td>  
            <td class="text-left">{{상세}}</td>  
            <td class="text-center {{응급Style}}" >{{응급}}</td>
            <td class="text-center fit">{{지사}}</td>
            <td class="text-center fit">{{처리구분}}</td>
            <td class="text-center">{{공유일}}</td>
            <td class="text-center">{{공유자}}</td>
            <td class="text-center">{{완료일}}</td>
            <td class="text-center">{{완료자}}</td>
            <td class="text-center unlink">{{파일전달}}</td>                        
            <td class="text-center unlink">{{파일테스트}}</td>
            <td class="text-center unlink" style="width:100px;">{{버전}}</td>
            <td class="text-center unlink">{{테스트}}</td>
            <td class="text-center unlink">{{테스터}}</td>
        </tr>
    `
}