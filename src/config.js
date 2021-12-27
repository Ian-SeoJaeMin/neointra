var env = process.env.NODE_ENV || "development";
var ENV_DEVELOPMENT = env == "development";
var Config = (function () {
    var serverOption = {
        ocs: {
            user: "",
            password: "",
            server: "",
            port: "",
            database: "NeoAS",
            pool: {
                max: 10,
                min: 5,
                idleTimeoutMillis: 130000
            }
        },
        test: {
            user: "",
            password: "",
            server: "",
            port: "",
            database: "NeoAS_test"
        },
        company: {
            user: "",
            password: "",
            server: "",
            database: "NEO_COMPANY"
        }
    };

    var webOption = {
        title: {
            company_e: "NeoSoftBank",
            company_k: "네오소프트뱅크",
            HOME: "HOME",
            AS: "A/S 서비스",
            AS_ACCEPT: "A/S 접수",
            AS_HISTORY: "A/S 기록",
            AS_STATIC: "A/S 통계",
            CUSTOMER: "거래처",
            CUSTOMER_MANAGE: "거래처 관리",
            CUSTOMER_VISIT: "방문일지",
            CUSTOMER_VISIT_ADD: "방문일지 등록",
            CUSTOMER_VISIT_VIEW: "방문일지",
            CUSTOMER_CALL: "상담일지",
            CUSTOMER_CALL_ADD: "상담일지 등록",
            CUSTOMER_CALL_VIEW: "상담일지",
            PROJECT: "프로젝트",
            SCHEDULE: "스케줄",
            REPORT: "업무보고",
            SCALEUP: "Scale-Up"
        },

        menu: {
            HOME: 0,
            AS: 1,
            AS_HISTORY: 11,
            AS_STATIC: 12,
            AS_ACCEPT: 13,
            CUSTOMER: 3,
            CUSTOMER_MANAGE: 31,
            CUSTOMER_MANAGE_DETAIL: 311,
            CUSTOMER_VISIT: 32,
            CUSTOMER_VISIT_ADD: 321,
            CUSTOMER_VISIT_VIEW: 322,
            CUSTOMER_CALL: 33,
            CUSTOMER_CALL_EDIT: 331,
            CUSTOMER_CALL_VIEW: 332,
            PROJECT: 4,
            SCHEDULE: 5,
            REPORT: 6,
            SCALEUP: 7,
            BOARD: 8
        }
    };

    var consts = {
        SERVICE_STATUS: {
            ACCEPT: 0,
            SHARE: 1,
            PROCESS: 2,
            HOLD: 3,
            DONE: 4,
            CANCEL: 5,
            FEEDBACK: 6,
            CONFIRM: 7
        },
        DB_NEOCOMPANY: "NEO_COMPANY.NEO_COMPANY.DBO",
        DB_OCS: "MEDICHART.DBO",
        DB_NEOAS: ENV_DEVELOPMENT ? "NEOAS_test.DBO" : "NEOAS.DBO",
        SQL_SUCCESS: "Select 200 as status, 'SUCCESS' as message ",
        SQL_ERROR:
            "Select ERROR_NUMBER() as status, ERROR_MESSAGE() as message",
        BOARD: {
            DEFAULT_TEMPLATE:
                '[{"name":"제목","type":"텍스트","label":"제목","require":true,"placeholder":"제목을 입력해주세요.","tooltip":false,"default":""},{"name":"내용","type":"멀티텍스트","label":"내용","require":true,"placeholder":"내용을 입력해주세요.","tooltip":false,"rows":15,"default":""}]'
        },
        EXES: [
            "데스크",
            "입원수납",
            "청구심사",
            "진료실",
            "병동",
            "진료지원",
            "병원관리",
            "문서관리",
            "통계",
            "메인",
            "부가서비스",
            "기타"
        ],
        DOCS: {
            saleprice:
                //"https://docs.google.com/spreadsheets/d/1EmTC9JK8pB-5MIaLZy-1ghpFZkEOiBoPSy_VzPLmnNQ/edit?usp=sharing",
                "https://docs.google.com/spreadsheets/d/1psX7VMkYIkK5t95xQnm0ssCVGGtdXcU5glNUuWccUrk/edit?usp=sharing",
            carrepair:
                "https://docs.google.com/spreadsheets/d/15l1Z-NRRixgg4CiCO2VtvmMmBHMK0HzBVEgAR9b_7fU/edit?usp=sharing",
            dashboard:
                "https://docs.google.com/spreadsheets/d/14QcuysJlaM-8Y2fpUxqxmZTuVXs7sWFE_-jEabNKHKc/edit?usp=sharing",
            business:
                "https://docs.google.com/spreadsheets/d/1wZzcyu4ekGiP7TbwUrPOoSpJOfB8jWpFtsm1YLYh0UQ/edit?usp=sharing",
            dev:
                "https://docs.google.com/spreadsheets/d/1W8nOomCo3JWz95l-6sTYA0i_WgaYjz5-6YzjgR0EYR0/edit?usp=sharing",
            net: "https://docs.google.com/spreadsheets/d/1gzikchJPAFgIeobF9MS9hQOQJ5LLTOOI36MAqCicaF8/edit?usp=sharing"
        },
        MENUS: [
            {
                name: "HOME",
                section: "",
                icon: "fa-home",
                href: "/"
            },
            {
                name: "개발표준",
                section: "",
                icon: "fa-code",
                href: 'javascript:window.open("/html/dev/dvl000.html")',
                permission: {
                    position: "개발실",
                    users: [5, 13, 149]
                }
            },
            {
                name: "신입교육",
                section: "",
                icon: "fa-book",
                href: 'javascript:window.open("/html/curriculum/curri.html")'
            },
            {
                name: "직원정산",
                section: "ACCOUNTING",
                icon: "fa-bank",
                href: "/settlement/member"
            },
            {
                name: "지사정산",
                section: "ACCOUNTING",
                icon: "fa-bank",
                href: "/settlement/area"
            },
            {
                name: "신규매출",
                section: "ACCOUNTING",
                icon: "fa-balance-scale",
                href: "/settlement/sales"
            },
            // {
            //     name: 'A/S 접수',
            //     section: 'A/S SERVICE',
            //     icon: 'fa-question-circle',
            //     href: '/service/accept',
            //     permission: {
            //         area: ['0000', '0030', '0031', '0026', '0034', '0023']
            //     }
            // },          
            {
                name: "A/S",
                section: "A/S SERVICE",
                icon: "fa-question-circle",
                href: "/service"
            },
            {
                name: "근무외 A/S",
                section: "A/S SERVICE",
                icon: "fa-question-circle",
                href: "/serviceemergen"
            },
            {
                name: "A/S 내역",
                section: "A/S SERVICE",
                icon: "fa-database",
                href: "/service/history"
            },
            {
                name: "A/S 통계",
                section: "A/S SERVICE",
                icon: "fa-bar-chart",
                href: "/service/static"
            },
            {
                name: "A/S 수수료(구)",
                section: "A/S SERVICE",
                icon: "fa-money",
                href: "/service/fee",
                permission: {
                    users: [5, 13, 89]
                }
            },
            {
                name: "A/S 수수료",
                section: "A/S SERVICE",
                icon: "fa-money",
                href: "/service/fee2020"
                // permission: {
                //     users: [5, 13, 89]
                // }
            },
            {
                name: "A/S 관리",
                section: "A/S SERVICE",
                icon: "fa-bug",
                href: "/service/data"
                // permission: {
                //     position: "개발실",
                //     users: [149]
                // }
            },
            {
                name: "거래처관리",
                section: "CUSTOMERS",
                icon: "fa-hospital-o",
                href: "/customer"
            },
            {
                name: "방문일지",
                section: "CUSTOMERS",
                icon: "fa-car",
                href: "/customer/visit"
            },
            {
                name: "상담일지",
                section: "CUSTOMERS",
                icon: "fa-phone",
                href: "/customer/call"
            },
            {
                name: "미수금관리",
                section: "CUSTOMERS",
                icon: "fa-money",
                href: "/amount"
            },
            {
                name: "기안서",
                section: "COMPANY",
                icon: "fa-certificate",
                href: "/drafting"
            },
            {
                name: "부가서비스",
                section: "COMPANY",
                icon: "fa-tags",
                href:
                    "javascript:window.open('http://www.neochart.co.kr/admin_etc?i=1')"
            },
            {
                name: "사업관리",
                section: "COMPANY",
                icon: "fa-tags",
                href: "/sheet?name=사업관리&sheet=business",
                permission: {
                    users: [1, 5, 13, 78, 89]
                }
            },
            {
                name: "프로젝트",
                section: "COMPANY",
                icon: "fa-tasks",
                href: "/project"
            },
            {
                name: "스케줄",
                section: "COMPANY",
                icon: "fa-calendar",
                href: "/schedule"
            },
            {
                name: "업무보고",
                section: "COMPANY",
                icon: "fa-archive",
                href: "/report"
            },
            // {
            //     name: "견적발주",
            //     section: "COMPANY",
            //     icon: "fa-briefcase",
            //     href: "/quoteorder"
            // },
            {
                name: "납품단가",
                section: "COMPANY",
                icon: "fa-tags",
                href: "/sheet?name=납품단가&sheet=saleprice",
                breakpoints: "breakpoints-sm breakpoints-xs"
            },
            {
                name: "차량정비",
                section: "COMPANY",
                icon: "fa-wrench",
                href: "/sheet?name=차량정비&sheet=carrepair",
                breakpoints: "breakpoints-sm breakpoints-xs"
            },
            {
                name: "차량운행기록",
                section: "COMPANY",
                icon: "fa-road",
                href: "/sheet?name=차량운행기록&sheet=dashboard",
                breakpoints: "breakpoints-sm breakpoints-xs"
            },
            {
                name: "업데이트",
                section: "COMPANY",
                icon: "fa-history",
                href: "/update"
            },
            {
                name: "개발실 작업현황",
                section: "COMPANY",
                icon: "fa-history",
                href: "/sheet?name=개발실작업리스트&sheet=dev",
                breakpoints: "breakpoints-sm breakpoints-xs"
            },
            {
                name: ".NET 개발현황",
                section: "COMPANY",
                icon: "fa-bug",
                href: "/sheet?name=.NET개발현황&sheet=net",
                breakpoints: "breakpoints-sm breakpoints-xs"
            }
        ]
    };

    return {
        server: serverOption,
        web: webOption,
        CONSTS: consts
    };
})();

module.exports = global.Config = Config;
