const a = `
동일 보험유형 외래접수를 입원으로 전환	챠트번호	입원일자(예시=YYYY.MM.DD)
두번접수	챠트번호	진료일자(예시=YYYY.MM.DD)
마감시간변경	마감일자	마감자	마감건수
마감일자변경	마감일자	마감자	마감건수
마감취소	마감일자	마감자	마감건수
마취과전문의
매크로	매크로대상
미수금금액	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
미수금액	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
미수입금	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
미수처리	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
연말정산미신고취소	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
병동	챠트번호	입원일자(예시=YYYY.MM.DD)	병동
병실	챠트번호	입원일자(예시=YYYY.MM.DD)	병동	병실
병실변경내역	챠트번호	입원일자(예시=YYYY.MM.DD)	병동	병실
보장시설	챠트번호	보장시설종류
보험구분	챠트번호	보험종류(예시=보험,보호,산재,자보 등)
보험상실정보	챠트번호	보험종류(예시=보험,보호,산재,자보 등)
보험정보	챠트번호	보험종류(예시=보험,보호,산재,자보 등)
보험종별	챠트번호	보험종류(예시=보험,보호,산재,자보 등)
보험증번호	챠트번호	보험종류(예시=보험,보호,산재,자보 등)
보호자 전화번호	챠트번호
보훈번호	챠트번호
비밀번호	챠트번호
사생활보호	챠트번호
사업자명칭	챠트번호	보험종류
사업장기호	챠트번호	보험종류
상세주소	챠트번호
상해외인	챠트번호	보험종류
새화면
선수금금액	챠트번호	수납일자(예시=YYYY.MM.DD)
선수금액	챠트번호	수납일자(예시=YYYY.MM.DD)
선수금입금	챠트번호	수납일자(예시=YYYY.MM.DD)
선택진료	챠트번호	진료일자(예시=YYYY.MM.DD)
수납관리	챠트번호	진료일자(예시=YYYY.MM.DD)
수납마감	챠트번호	진료일자(예시=YYYY.MM.DD)	마감일자(예시=YYYY.MM.DD)
수납액	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
수납할인	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)

수진자명	챠트번호
승인실패	챠트번호	진료일자(예시=YYYY.MM.DD)
신규
신생아체중	챠트번호
실수납조회	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
연말정산미신고	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
영수증발행	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
영수증재발행	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
영수증출력	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
예약접수	챠트번호	예약일자(예시=YYYY.MM.DD)
예외사유	챠트번호	진료일자(예시=YYYY.MM.DD)	처방코드
외래접수	챠트번호	진료일자(예시=YYYY.MM.DD)
우편번호	챠트번호
원내조제사유	챠트번호	진료일자(예시=YYYY.MM.DD)	처방코드
유형구분	챠트번호	진료일자(예시=YYYY.MM.DD)

유형변경	챠트번호	진료일자(예시=YYYY.MM.DD)	보험정보

의무기록	챠트번호	진료일자(예시=YYYY.MM.DD)
이중유형	챠트번호	진료일자(예시=YYYY.MM.DD)
인적메모	챠트번호
인적사항	챠트번호
임부여부	챠트번호	진료일자(예시=YYYY.MM.DD)
임산부특정내역	챠트번호	진료일자(예시=YYYY.MM.DD)
입원경로	챠트번호	입원일자(예시=YYYY.MM.DD)
입원메모	챠트번호	입원일자(예시=YYYY.MM.DD)
입원상태	챠트번호	입원일자(예시=YYYY.MM.DD)
입원시간	챠트번호	입원일자(예시=YYYY.MM.DD)
입원유형	챠트번호	입원일자(예시=YYYY.MM.DD)
입원이력	챠트번호	입원일자(예시=YYYY.MM.DD)
입원일	챠트번호	입원일자(예시=YYYY.MM.DD)
입원일자	챠트번호
입원정보	챠트번호	입원일자(예시=YYYY.MM.DD)
자격조회	챠트번호
저장	챠트번호
적용일자	챠트번호
전과내역	챠트번호	입원일자(예시=YYYY.MM.DD)
전달사항	챠트번호
전실내역	챠트번호	입원일자(예시=YYYY.MM.DD)
전체메모	챠트번호
전화번호	챠트번호
접수상태	챠트번호	진료일자(예시=YYYY.MM.DD)
접수이력	챠트번호	진료일자(예시=YYYY.MM.DD)
접수취소	챠트번호	진료일자(예시=YYYY.MM.DD)
정보동의	챠트번호
조산아특정내역	챠트번호	진료일자(예시=YYYY.MM.DD)
종별	챠트번호
주민번호	챠트번호
주소검색	챠트번호
중증번호	챠트번호	보험종류
진료결과	챠트번호	진료일자(예시=YYYY.MM.DD)
진료내역승인	챠트번호	진료일자(예시=YYYY.MM.DD)
진료비납입확인서	챠트번호	진료일자(예시=YYYY.MM.DD)	진료기간(예시=YYYY.MM.DD~YYYY.MM.DD)
진료비명세서출력	챠트번호	진료일자(예시=YYYY.MM.DD)	진료기간(예시=YYYY.MM.DD~YYYY.MM.DD)
진료실	챠트번호
진찰구분	챠트번호	진료일자(예시=YYYY.MM.DD)
차트결합	원본챠트번호	변경챠트번호
차트번호	챠트번호
차트복구	챠트번호	수진자명
차트복사	챠트번호

챠트삭제	챠트번호
챠트조회	챠트번호
처방금지	챠트번호	처방코드
처방전발행	챠트번호	진료일자(예시=YYYY.MM.DD)
처방전출력	챠트번호	진료일자(예시=YYYY.MM.DD)
처방전출력(상병포함)	챠트번호	진료일자(예시=YYYY.MM.DD)
청구구분	챠트번호	진료일자(예시=YYYY.MM.DD)
초진차트	챠트번호
최초입원일	챠트번호	입원일자(예시=YYYY.MM.DD)
치매질환사전등록번호	챠트번호	보험종류
침실	챠트번호
토요야간	챠트번호	진료일자(예시=YYYY.MM.DD)
퇴원시간	챠트번호	입원일자(예시=YYYY.MM.DD)	퇴원일자(예시=YYYY.MM.DD)
특정기호	챠트번호	보험종류
프린터	챠트번호
할인적용	챠트번호	진료일자(예시=YYYY.MM.DD)
화면조정	챠트번호
환불영수증	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
환자유형	챠트번호

휴대전화	챠트번호
CRM	챠트번호

가족관계	챠트번호
가족등록	챠트번호
가족정보	챠트번호
건강검진	챠트번호	진료일자(예시=YYYY.MM.DD)
검진	챠트번호	진료일자(예시=YYYY.MM.DD)
계좌입금	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
계좌입금확인	챠트번호	진료일자(예시=YYYY.MM.DD)	수납일자(예시=YYYY.MM.DD)
기본바이탈	챠트번호
기본주소	챠트번호
기타정보	챠트번호
낮병동입원	챠트번호	입원일자(예시=YYYY.MM.DD)
달력	챠트번호
당일접수내역	챠트번호	진료일자(예시=YYYY.MM.DD)
도착경로	챠트번호	입원일자(예시=YYYY.MM.DD)
가입자명	챠트번호

`

let b = a.split('\n')

b.sort()
b = b.map(item => item.trim())
b = b.filter(item => item.length > 0)

// console.log(b)

let c = b.map(element => {
    let tempArray = element.split('\t')
    return {
        name: tempArray[0],
        required: (function(){
            if (tempArray.length > 1) {
                tempArray.reverse().pop()
                return tempArray.reverse()
            } else {
                return []
            }
        })()
    }
});

c = JSON.stringify(c)
c = c.replace(/"/g, "'")

console.log(c)