/**
 * TODOS
 * 검색 기능
 * 페이징 기능
 * 다운로드
 * 전송기능
 */
function ServiceHelper(container, optionContainer, paginationContainer, macAddr) {
    this.container = container;
    this.optionContainer = optionContainer;
    this.paginationContainer = paginationContainer;

    this.macAddr = macAddr;
    this.options = {
        finder: params.finder,
        search: "",
        useReply: 1,
        "게시판ID": 25
    };
    this.paging = {
        currentPage: 1,
        perPage: 5,
        maxPage: 0
    };

    this.originData = null;
    this.filterData = null;
    this.load();
}

ServiceHelper.prototype.load = function () {
    const _this = this;
    axios.get(API.BOARD.BOARD, {
            params: this.options
        })
        .then(function (result) {
            _this.originData = result.data;
            return _this.filtering();
        })
        // .then(function () {
        //     return _this.pagination();
        // })
        .then(function () {
            return _this.sorting();
        })
        .then(function () {
            return _this.renderOptions();
        })
        .then(function () {
            console.log('ready to render')
            _this.pagination();
        })
    // .then(function () {
    //     _this.render();
    // });
};


ServiceHelper.prototype.pagination = function () {
    var _this = this
    // return new Promise(function (resolve, reject) {
    //     try {
    //         _this.paging.currentPage = 1;
    //         _this.paging.maxPage = Math.ceil(_this.filterData.length / _this.paging.perPage);
    //         resolve();
    //     } catch (error) {
    //         reject(error);
    //     }
    // })

    this.paginationContainer.pagination({
        dataSource: this.filterData,
        pageSize: 5,
        showPageNumbers: true,
        showNavigator: true,
        callback: function (data, pagination) {
            // template method of yourself
            // var html = _this.render(data);
            // dataContainer.html(html);
            _this.render(data);
        }
    })
};


ServiceHelper.prototype.sorting = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
        try {
            _this.filterData = _this.filterData.sort(function (a, b) {
                var title_a = a['데이터']['제목'];
                var title_b = b['데이터']['제목'];
                var counter_a = (localStorage.getItem(title_a) || 0) * 1;
                var counter_b = (localStorage.getItem(title_b) || 0) * 1;

                return (counter_b > counter_a) ? 1 : ((counter_b < counter_a) ? -1 : 0);

            })
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

ServiceHelper.prototype.clear = function () {
    this.container.empty();
};

ServiceHelper.prototype.renderOptions = function () {
    var _this = this;
    var optionContainer = this.optionContainer;
    optionContainer.find('.helper-option-finder').remove();

    this.options.finder.forEach(function (option) {
        optionContainer.prepend(
            `<div class="helper-option-finder form-group form-group-sm m-b-sm">
                <select class="${option.class}" data-size="5" data-field="${option.label}" data-width="fit" title="${option.label}">
                    <option value="">선택안함</option>
                    ${
                        (function() {
                            var optionItems = '';
                            option.listitem.forEach(function(item){
                                optionItems += `
                                    <option value="${item === '전체'? '' : item}">${item}</option>
                                `
                            })
                            return optionItems;
                        })()
                    }
                </select>
            </div>
            `
        );
    });

    var optionFinders = $('.selectpicker', optionContainer)
    optionFinders.selectpicker('render');
    optionFinders.bind('changed.bs.select', function (event) {
        event.preventDefault();
        _this.filteringByFinder($(this).data('field'), $(this).selectpicker('val'))
            .then(function () {
                return _this.sorting();
            })
            .then(function () {
                // console.log('ready to render')
                _this.pagination();
            })

    });
    $('.helper-options-search', optionContainer).bind('keyup', function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            _this.filtering($(this).val().trim())
                .then(function () {
                    return _this.sorting();
                })
                .then(function () {
                    // console.log('ready to render')
                    _this.pagination();
                })
        }
    });
}

ServiceHelper.prototype.render = function (data) {
    var _this = this;
    var target = this.container;
    // var paging = this.paging;
    var manuals, installs;

    target.empty();
    // this.optionContainer.find('.helper-option-finder').remove();
    // this.paginationContainer.empty();

    // options
    // console.log(this.options.finder);


    // pagination
    // var arrowBtn = {
    //     prevArrow: paging.currentPage <= 3 ? 'disabled' : '',
    //     nextArrow: paging.currentPage >= (paging.maxPage - 2) ? 'disabled' : ''
    // }

    // this.paginationContainer.append(`
    //     <li class="${arrowBtn.prevArrow}">
    //         <a href="#" class="pagination-item" data-page="${paging.currentPage - 3}"><i class="fa fa-chevron-left"></i></a>
    //     </li>
    // `);
    // for (var a = 2; a > 0; a--) {
    //     if (paging.currentPage - a > 0) {
    //         this.paginationContainer.append(`
    //             <li class="">
    //                 <a href="#" class="pagination-item" data-page="${paging.currentPage - a}">${paging.currentPage - a}</a>
    //             </li>
    //         `);
    //     }
    // }

    // this.paginationContainer.append(`
    //     <li class="active">
    //         <a href="#" class="pagination-item" data-page="${paging.currentPage}">${paging.currentPage}</a>
    //     </li>
    // `);

    // for (var a = 1; a <= 2; a++) {
    //     if (paging.currentPage + a <= paging.maxPage) {
    //         this.paginationContainer.append(`
    //             <li class="">
    //                 <a href="#" class="pagination-item" data-page="${paging.currentPage + a}">${paging.currentPage + a}</a>
    //             </li>
    //         `);
    //     }
    // }

    // this.paginationContainer.append(`
    //     <li class="${arrowBtn.nextArrow}">
    //         <a href="#" class="pagination-item" data-page="${paging.currentPage + 3}"><i class="fa fa-chevron-right"></i></a>
    //     </li>
    // `);
    // pagination

    // list
    // var data = this.filterData.slice(
    //     (paging.currentPage - 1) * paging.perPage,
    //     (paging.currentPage - 1) * paging.perPage + paging.perPage,
    // )

    target.empty();
    data.forEach(function (item, index) {
        manuals = item['데이터']['메뉴얼'] || [];
        installs = item['데이터']['설치파일'] || [];
        // <td class="text-center">${item['데이터']['다운로드 경로']}</td>
        // <td class="text-center">${item['데이터']['실행여부']}</td>
        target.append(
            `
                <tr>
                    <td>${item['데이터']['제목']}</td>

                    <td class="text-right">
                        ${
                            manuals.length > 0 ?
                            '<button data-index="'+item['인덱스']+'" data-type="메뉴얼" class="m-b-none btn btn-default btn-xs btn-down btn-down-manual" type="button">다운</button><button data-index="'+item['인덱스']+'" data-type="메뉴얼" class="m-b-none btn btn-default btn-xs btn-transfer btn-transfer-manual" type="button" data-toggle="tooltip" data-placement="left" title="" data-original-title="전송경로: '+(item['데이터']['다운로드 경로'] || item['데이터']['전송경로']) +'<br>'+item['데이터']['실행여부']+'">전송</button>' : ''
                        }
                    </td>
                    <td class="text-right">${installs.length > 0 ? '<button data-index="'+item['인덱스']+'" data-type="설치파일" class="m-b-none btn btn-default btn-xs btn-down btn-down-install" type="button">다운</button><button data-index="'+item['인덱스']+'" data-type="설치파일" class="m-b-none btn btn-default btn-xs btn-transfer btn-transfer-install" type="button" data-toggle="tooltip" data-placement="left" title="" data-original-title="전송경로: '+(item['데이터']['다운로드 경로'] || item['데이터']['전송경로']) +'<br>'+item['데이터']['실행여부']+'">전송</button>' : ''}</td>
                </tr>
            `
        );
        // if (!_this.macAddr.length || !nfSocket.fn.isAlive(_this.macAddr)) {
        if (!_this.macAddr.length) {
            target.find('.btn-transfer').attr('disabled', true);
        }
    });



    target.find('[data-toggle="tooltip"]').tooltip({
        placement: "left",
        html: true,
        container: '.service-helper-list'
    })

    target.find('.btn-down').bind('click', function (event) {
        event.preventDefault();
        var data = $(this).data();
        // var files = _this.filterData[data.index]['데이터'][data.type];
        var selData = _this.filterData.find(function (d) {
            return d['인덱스'] === data.index;
        });

        if (!selData) return false;

        var files = selData['데이터'][data.type];

        // 클릭카운터
        var clickCounter = localStorage.getItem(selData['데이터']['제목']) || 0;
        clickCounter *= 1;
        localStorage.setItem(selData['데이터']['제목'], ++clickCounter);

        files.forEach(function (file) {
            var downLink = document.createElement('a');
            downLink.download = file.name;
            downLink.href = file.oPath;
            downLink.click();
        });
    });

    target.find('.btn-transfer').bind('click', function (event) {
        event.preventDefault();
        var data = $(this).data();
        // var files = _this.filterData[data.index]['데이터'][data.type];
        var selData = _this.filterData.find(function (d) {
            return d['인덱스'] === data.index;
        });

        if (!selData) return false;

        var files = selData['데이터'][data.type];

        // 클릭카운터
        var clickCounter = localStorage.getItem(selData['데이터']['제목']) || 0;
        clickCounter *= 1;
        localStorage.setItem(selData['데이터']['제목'], ++clickCounter);

        switch (selData['데이터']['전송경로']) {
            case '바탕화면':
                selData['데이터']['전송경로'] = '%UserProfile%\\DESKTOP';
                break;
            case '시스템드라이브(C:)':
                selData['데이터']['전송경로'] = '%SystemDrive%';
                break;
            default:
                selData['데이터']['전송경로'] = selData['데이터']['전송경로'];
                break;
        }


        nfSocket.fn.transferFile(_this.macAddr, {
            savePath: selData['데이터']['전송경로'],
            execute: selData['데이터']['실행여부'],
            files: files
        });
    });

    // this.paginationContainer.bind('click', function (event) {
    //     event.preventDefault();
    //     var $TARGET = (event.target.tagName === 'LI' ? $(event.target).find('a') : $(event.target));
    //     $TARGET = (event.target.tagName === 'I') ? $(event.target).closest('a') : $(event.target);
    //     if ($TARGET.length) {
    //         // console.log($TARGET.data('page'));
    //         if ($TARGET.closest('li').hasClass('disabled')) {
    //             return false;
    //         } else if ($TARGET.data('page') === paging.currentPage || $TARGET.data('page') > paging.maxPage || $TARGET.data('page') < 1) {
    //             return false;
    //         } else {
    //             _this.paging.currentPage = $TARGET.data('page');
    //             _this.render();
    //         }
    //     }
    // })
};


ServiceHelper.prototype.filteringByFinder = function (key, value) {
    var _this = this;
    this.filterData = this.originData;
    return new Promise(function (resolve, reject) {
        try {
            // _this.options.finder.forEach(function (opt) {
            //     if (opt.value) {
            if (value.length) {
                _this.filterData = _this.filterData.filter(function (article) {
                    return article['데이터'][key] === value
                })
            }
            // }
            // })
            resolve()
        } catch (e) {
            reject(e);
        }
    })
};

ServiceHelper.prototype.filtering = function (keyword) {
    var _this = this;
    this.filterData = this.originData;
    return new Promise(function (resolve, reject) {
        if (!keyword) {
            resolve();
        } else {
            try {
                _this.filterData = _this.originData.filter(function (item) {
                    if (item['데이터']['제목'].indexOf(keyword) >= 0 || item['데이터']['내용'].indexOf(keyword) >= 0) {
                        return true;
                    } else {
                        return false;
                    }
                })
                resolve();
            } catch (e) {
                reject(e);
            }
        }
    })
};

ServiceHelper.prototype.renderTemplate = function () {
    let template = `
        <h5 class="green">
            <i class="fa fa-magic"></i> AS Helper
        </h5>
        <div class="x_panel p-w-none no-border">
            <div class="x_title m-b-none">
                <div class="form-inline text-right">
                    <div class="input-group input-group-sm">
                        <input type="text" class="form-control" placeholder="검색">
                        <div class="input-group-btn">
                            <button type="button" class="btn btn-default service-helper-load">검색</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="x_content p-w-none">
                <table class="table table-bordered jambo_table small">
                    <thead>
                        <tr>
                            <th rowspan="2">제목</th>
                            <th colspan="2">메뉴얼</th>
                            <th colspan="2">설치파일</th>
                        </tr>
                        <tr>
                            <th width="15%">다운</th>
                            <th width="15%">전송</th>
                            <th width="15%">다운</th>
                            <th width="15%">전송</th>
                        </tr>
                    </thead>
                    <tbody class="service-heler-list"></tbody>
                </table>
            </div>
        </div>
    `;

    this.container.prepend(template);
    this.listContainer = this.container.find('.service-helper-list');
};
