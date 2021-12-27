(function (exports) {

    'use strict';

    var $PROGRAM = $('.project-program'),
        $STATUS = $('.project-status'),
        $DEVELOPER = $('.project-developer'),
        $WRITER = $('.project-writer'),
        $SEARCH = $('input[name="project-search"]'),
        $LISTHEADER = $('.project-list').find('th'),
        $LISTDESKTOP = $('#project-desktop'),
        $LISTMOBILE = $('#project-mobile');

    var options = sessionStorage.getItem('projectOption') ? JSON.parse(sessionStorage.getItem('projectOption')) : {
        program: '',
        status: '',
        developer: '',
        writer: '',
        search: '',
        date: {
            start: moment().startOf('month').format('YYYY-MM-DD'),
            end: moment().endOf('month').format('YYYY-MM-DD')
        }
    };

    var sort = {
        field: '인덱스',
        sort: 'desc'
    };

    var projects = null;

    $PROGRAM.bind('changed.bs.select', function (event) {
        options.program = $(this).selectpicker('val');
        // options.program = options.program.join(',');
        Load();
    });

    $STATUS.bind('changed.bs.select', function (event) {
        options.status = $(this).selectpicker('val');
        Load();
    });

    $DEVELOPER.bind('changed.bs.select', function (event) {
        var filterData = [];

        options.developer = $(this).selectpicker('val');

        if (!options.developer) {
            filterData = projects;
        } else {
            var filterData = projects.filter(function (prj) {
                return prj['참여자'].find(function (dev) {
                    return dev['개발자'] === parseInt(options.developer);
                });
            });
        }
        Sorting(filterData);
    });

    $WRITER.bind('changed.bs.select', function (event) {
        var filterData = [];

        options.writer = $(this).selectpicker('val');

        if (!options.writer) {
            filterData = projects;
        } else {
            var filterData = projects.filter(function (prj) {
                return prj['등록자'] === parseInt(options.writer);
            });
        }
        Sorting(filterData);
    });

    $SEARCH.bind('keyup', function (event) {
        if (event.keyCode === 13) {
            options.search = $(this).val().trim();

            var filterData = [];
            if (!options.search) {
                filterData = projects;
            } else {
                var filterData = projects.filter(function (prj) {
                    if ($.isNumeric(options.search)) {
                        return prj['인덱스'] === parseInt(options.search);
                    } else {
                        return prj['상세내용'].toUpperCase().indexOf(options.search.toUpperCase()) !== -1 ||
                            prj['기대효과'].toUpperCase().indexOf(options.search.toUpperCase()) !== -1 ||
                            prj['프로젝트명'].toUpperCase().indexOf(options.search.toUpperCase()) !== -1;
                    }

                });
            }

            Sorting(filterData);

        }
    })


    $LISTHEADER.bind('click', function (event) {
        var $THIS = $(this);
        var $SORTICON = $THIS.find('i.sort');
        if (!$THIS.data('field')) return false;

        if ($SORTICON.length) {
            $SORTICON.toggleClass('fa-sort-amount-asc fa-sort-amount-desc');
            sort.order = sort.order === 'asc' ? 'desc' : 'asc';
        } else {
            $THIS.siblings().find('i.sort').remove();
            $THIS.append('<i class="m-l-xs fa sort fa-sort-amount-asc"></i>');
            sort.field = $THIS.data('field');
            sort.order = 'asc';
        }

        Sorting();
    });

    $LISTDESKTOP.bind('click', function (event) {
        var $TR;
        if (event.target.tagName !== 'TR') {
            $TR = $(event.target).closest('tr');
        } else {
            $TR = $(event.target);
        }
        if ($TR.length) {
            sessionStorage.setItem(CONSTS.PARENT_URL, CURRENT_URL);
            location.href = '/project/view?index=' + $TR.data('index');
        }
    })

    var ProjectDatePicker = new myDatePicker('.datepicker.project');
    ProjectDatePicker.fn.init({
        start: options.date.start,
        end: options.date.end
    }, Load);

    axios.get(API.PROJECT.DEVELOPER)
        .then(function (result) {
            result.data.forEach(function (dev) {
                $DEVELOPER.append('<option value="' + dev['개발자'] + '">' + dev['개발자명'] + '</option>')
            }, this);

            $DEVELOPER.selectpicker('refresh');
        })
        .catch(function (error) {
            fn.errorNotify(error);
        });
    axios.get(API.PROJECT.WRITER)
        .then(function (result) {
            result.data.forEach(function (dev) {
                $WRITER.append('<option value="' + dev['등록자'] + '">' + dev['등록자명'] + '</option>')
            }, this);

            $WRITER.selectpicker('refresh');
        })
        .catch(function (error) {
            fn.errorNotify(error);
        });

    function Clear() {
        $LISTDESKTOP.empty();
        $LISTMOBILE.empty();
    }

    function Load() {
        options.date.start = ProjectDatePicker.value.start;
        options.date.end = ProjectDatePicker.value.end;
        sessionStorage.setItem('projectOption', JSON.stringify(options))

        axios.get(API.PROJECT.LIST, {
                params: options
            })
            .then(function (result) {
                projects = result.data;
                // console.log(result);
                Sorting();
            })
            .catch(function (error) {
                fn.errorNotify(error);
            });
    }

    function Sorting(data) {
        data = data || projects;
        data = data.sort(function (a, b) {
            if (sort.order === 'asc') {
                return (a[sort.field] > b[sort.field]) ? 1 : ((a[sort.field] < b[sort.field]) ? -1 : 0);
            } else {
                return (b[sort.field] > a[sort.field]) ? 1 : ((b[sort.field] < a[sort.field]) ? -1 : 0);
            }
        });

        Clear();
        Render(data);
    }

    function Render(data) {
        var user = params.user
        var DKT_TEMPLATE = '';
        DKT_TEMPLATE += '<tr class="{{STATUS}}" data-index="{{인덱스}}">';
        DKT_TEMPLATE += '   <td>{{인덱스}}</td>';
        DKT_TEMPLATE += '   <td class="table-ellipsis">{{프로젝트명}}</td>';
        DKT_TEMPLATE += '   <td>{{프로그램}}</td>';
        DKT_TEMPLATE += '   <td>{{참여자}}</td>';
        DKT_TEMPLATE += '   <td>{{상태}}</td>';
        DKT_TEMPLATE += '   <td>{{등록자명}}</td>';
        DKT_TEMPLATE += '   <td>{{등록일자}}</td>';
        DKT_TEMPLATE += '   <td>{{수정일자}}</td>';
        DKT_TEMPLATE += '   <td>{{댓글}}</td>';
        if (user['인덱스'] === 196 || user['인덱스'] === 43 || user['인덱스'] === 13 || user['인덱스'] === 5 || user['인덱스'] === 89) {
            DKT_TEMPLATE += '   <td>{{정산}}</td>';
        }
        DKT_TEMPLATE += '</tr>';


        var $MOBILELISTS = '';
        $MOBILELISTS += '<div class="panel list-group project-list-group">';
        data.forEach(function (project) {
            var $DKTROW = DKT_TEMPLATE;

            $DKTROW = $DKTROW.replace('{{STATUS}}', (function () {
                if (CONSTS.PROJECT[project['상태']] === '보류') return 'prj-hold';
                else if (CONSTS.PROJECT[project['상태']] === '취소') return 'prj-cancel';
                else return '';
            })());

            $DKTROW = $DKTROW.replace(/{{인덱스}}/gim, project['인덱스']);
            $DKTROW = $DKTROW.replace('{{프로젝트명}}', project['프로젝트명']);
            $DKTROW = $DKTROW.replace('{{프로그램}}', project['프로그램'] === 0 ? '<span class="badge">공통</span>' : '<span class="badge ' + EMR(project['프로그램']).badge + '">' + EMR(project['프로그램']).name + '</span>');
            $DKTROW = $DKTROW.replace('{{참여자}}', (function () {

                var $DEVS = '<ul class="list-inline m-b-none">';

                project['참여자'].forEach(function (dev) {
                    $DEVS += ' <li class="' + (dev['책임자'] === 1 ? 'font-bold' : '') + '">' + dev['개발자명'] + '</li>';
                }, this);
                $DEVS += '</ul>';
                return $DEVS

            })());
            $DKTROW = $DKTROW.replace('{{상태}}', (function () {
                var $STATUS = '<b class="{{STATUS}}">' + CONSTS.PROJECT[project['상태']] + '</b>';
                switch (CONSTS.PROJECT[project['상태']]) {
                    case "접수":
                        return $STATUS.replace('{{STATUS}}', 'aero');
                    case "보류":
                        return $STATUS.replace('{{STATUS}}', '');
                    case "취소":
                        return $STATUS.replace('{{STATUS}}', '');
                    case "완료":
                        return $STATUS.replace('{{STATUS}}', 'blue');
                    default:
                        return $STATUS.replace('{{STATUS}}', 'green');
                }

            })());
            $DKTROW = $DKTROW.replace('{{등록자명}}', project['등록자명']);
            $DKTROW = $DKTROW.replace('{{등록일자}}', moment(project['등록일자']).calendar());
            $DKTROW = $DKTROW.replace('{{수정일자}}', moment(project['수정일자']).calendar());
            $DKTROW = $DKTROW.replace('{{댓글}}', project['댓글']);
            if (user['인덱스'] === 196 || user['인덱스'] === 43 || user['인덱스'] === 13 || user['인덱스'] === 5 || user['인덱스'] === 89) {
                // $DKTROW = $DKTROW.replace('{{정산}}', project['정산']);
                $DKTROW = $DKTROW.replace('{{정산}}', '<input type="checkbox" data-index="' + project['인덱스'] + '" ' + (project['정산'] == 1 ? 'checked' : '') + '/>')
            }

            $LISTDESKTOP.append($DKTROW);

            // $MOBILELISTS += '<div class="">';
            $MOBILELISTS += '   <a href="/project/view?index=' + project['인덱스'] + '" class="list-group-item ellipsis">[' + project['인덱스'] + '] ' + project['프로젝트명'];
            $MOBILELISTS += '       <br>';
            $MOBILELISTS += '       ' + project['프로그램'] === 0 ? '<span class="label">공통</span>' : '<span class="label ' + EMR(project['프로그램']).badge + '">' + EMR(project['프로그램']).name + '</span>';
            $MOBILELISTS += '       ' + (function () {
                var $STATUS = '<b class="badge {{STATUS}}">' + CONSTS.PROJECT[project['상태']] + '</b>';
                switch (CONSTS.PROJECT[project['상태']]) {
                    case "접수":
                        return $STATUS.replace('{{STATUS}}', 'bg-blue-sky');
                    case "보류":
                        return $STATUS.replace('{{STATUS}}', 'bg-dark');
                    case "취소":
                        return $STATUS.replace('{{STATUS}}', 'bg-red');
                    case "완료":
                        return $STATUS.replace('{{STATUS}}', 'bg-blue');
                    default:
                        return $STATUS.replace('{{STATUS}}', 'bg-green');
                }

            })();
            $MOBILELISTS += '       <br>';
            $MOBILELISTS += '       <small>등록: ' + project['등록자명'] + ' ' + moment(project['등록일자']).calendar() + '</small> / ';
            $MOBILELISTS += '       <small>수정: ' + moment(project['수정일자']).calendar() + '</small>';
            $MOBILELISTS += '   </a>';
            // $MOBILELISTS += '</div>';

        });
        $MOBILELISTS += '</div>';
        $LISTMOBILE.append($MOBILELISTS);


        $LISTDESKTOP.find('input[type="checkbox"]').iCheck({
            checkboxClass: 'icheckbox_flat-orange',
            radioClass: 'iradio_flat-orange'
        }).bind('ifChecked ifUnchecked', function (event) {
            var index = $(this).data('index');
            UpdateIncentive(index, event.type === 'ifChecked' ? 1 : 0)
        })
    }

    function UpdateIncentive(index, value) {

        axios.put(API.PROJECT.INCENTIVE, {
                index: index,
                incentive: value
            })
            .then(function (result) {
                location.reload()
            })
            .catch(function (error) {
                fn.errorNotify(error);
            });
    }

    Load();


})(window);
