const dayFromIdx = idx => {
    let re = '일';
    switch (idx) {
        case 0:
            re = '일';
            break;
        case 1:
            re = '월';
            break;
        case 2:
            re = '화';
            break;
        case 3:
            re = '수';
            break;
        case 4:
            re = '목';
            break;
        case 5:
            re = '금';
            break;
        case 6:
            re = '토';
            break;
    }
    return re;
};
const timeFromIdx = idx => {
    let text = '';
    if (idx <= 12) text += '오전 ';
    else text += '오후 ';

    if (idx > 12) text += `${idx - 12}시<br/>`;
    else text += `${idx}시<br/>`;

    if (idx < 10) {
        text += `(0${idx}:00)`;
    } else {
        text += `(${idx}:00)`;
    }
    return text;
};
const showDateRange = (now, flag, today) => {
    const sameDate = now.isSame(today);
    let html = '';
    if (flag === 'month') {
        html = now.format('YYYY년MM월');
    } else if (flag === 'week') {
        const thisWeekIdx = now.week();
        const minMonth = moment()
            .hour(0)
            .minute(0)
            .second(0)
            .millisecond(0)
            .week(thisWeekIdx)
            .startOf('week');
        const maxMonth = moment()
            .hour(0)
            .minute(0)
            .second(0)
            .millisecond(0)
            .week(thisWeekIdx)
            .endOf('week');
        if (minMonth.month() === maxMonth.month()) html = now.format('YYYY년MM월');
        else {
            if (minMonth.year() === maxMonth.year()) {
                html = `${minMonth.year()}년${minMonth.month() + 1}월 ~ ${maxMonth.month() + 1}월`;
            } else {
                html = `${minMonth.year()}년${minMonth.month() +
                    1}월 ~ ${maxMonth.year()}년${maxMonth.month() + 1}월`;
            }
        }
    } else if (flag === 'day') {
        html = now.format('YYYY년MM월DD일');
    }
    if (!sameDate) {
        html += `<div class="sel">Selected Day : (${now.format('YYYY년MM월DD일')})</div>`;
    }
    if (flag !== 'day' || !sameDate) {
        html += `<div class="today">Today : (${today.format('YYYY년MM월DD일')})</div>`;
    }
    return html;
};
class View {
    constructor() {
        this.render = this.render.bind(this);
        this.dateInputsChk = this.dateInputsChk.bind(this);
    }
    render(state) {
        const { changeNow, setTimeInput, addModal } = this.controllerAct;
        const { now, flag, showArr, saveData, today } = state;
        const cloneNow = now.clone();
        const cloneToday = today.clone();
        //팝업 내부 셀렉 select option채워넣기 : 처음만..
        if (!$('#popup .timeSelWrap select option').length) {
            // console.log(flag, showArr);
            // console.log('state:\n', state);
            let optHtml = '';
            for (let t = 0; t <= 24; t++) {
                optHtml += `<option value="${t}">${t < 10 ? '0' + t : t}시</option>`;
            }
            $('#popup .timeSelWrap select').html(optHtml);
        }
        //현재 셀렉 날짜 보여주기
        $('#head .selectedDate').html(showDateRange(cloneNow, flag, cloneToday));
        //월,주,일 버튼
        if ($('.cycleBtns .btn.active')) $('.cycleBtns .btn.active').removeClass('active');
        $('.cycleBtns .btn').each((i, v) => {
            if ($(v).data('cycle') === flag) {
                $(v).addClass('active');
                return false;
            }
        });
        //월간 달력 보여주기
        const $Calendar = $('<div class="container">');
        //헤드 부분 : 시작
        const $Chead = $('<div class="head">');
        $Chead.addClass(flag);
        if (flag === 'week' || flag === 'day') {
            const $div = $('<div class="dayWrap dayTxt">');
            $div.html(`<span class="dayOfTheWeek">요일</span>`);
            $Chead.append($div);
        }
        if (flag === 'day') {
            const thisDay = showArr[0].days[0].clone();
            const thisDayDay = thisDay.day();
            const $div = $('<div class="dayWrap">');
            if (thisDayDay === 0) {
                $div.addClass('sun');
            } else if (thisDayDay === 6) {
                $div.addClass('sat');
            }
            $div.html(`<span class="dayOfTheWeek">${dayFromIdx(thisDayDay)}</span>`);
            $Chead.append($div);
        } else {
            for (let c = 0; c < 7; c++) {
                const $div = $('<div class="dayWrap">');
                if (c === 0) {
                    $div.addClass('sun');
                } else if (c === 6) {
                    $div.addClass('sat');
                }
                $div.html(`<span class="dayOfTheWeek">${dayFromIdx(c)}</span>`);
                $Chead.append($div);
            }
        }
        $Calendar.append($Chead);
        //헤드부분 : 끝
        //몸통 부분 : 시작
        const thisMonth = cloneNow.month();
        const $Cbody = $('<div class="body">');
        $Cbody.addClass(flag);
        for (let a = 0; a < showArr.length; a++) {
            const weekData = showArr[a];
            const $row = $(`<div class="row" data-week="${weekData.week}">`);
            // 일정 두는 div 넣기
            // const firstDayFromWeek = showArr[a].days[0];
            // $row.append(
            //     `<div class="memoWrap" id="rowTime_${firstDayFromWeek.format('x')}"></div>`
            // );
            if (flag === 'week' || flag === 'day') {
                const $col = $(`<div class="col blank">`);
                $col.html('<div>시간/날짜</div>');
                $row.append($col);
            }
            for (let d = 0; d < weekData.days.length; d++) {
                const day = weekData.days[d];
                const timeStamp = day.format('x');
                const dayNum = day.day();
                const date = day.date();
                const dayMonth = day.month();
                // console.log(date, day);
                const $col = $(`<div class="col dayCol">`);
                if (d === 0) $col.addClass('firstDayFromWeek');
                $col.attr('id', `col_time_${timeStamp}`);
                $col.html(
                    `<div class="${
                        thisMonth === dayMonth ? 'dateBadge' : 'dateBadge noThisMonth'
                    }">${date}</div>`
                );
                //날짜 가 적혀있는 콜에 모달 팝업 Fn넣기
                $col.on('click', e => {
                    setTimeInput('startDate', false, [day.year(), dayMonth + 1, date, 0]);
                    setTimeInput('endDate', false, [day.year(), dayMonth + 1, date, 0]);
                    addModal();
                });
                if (dayNum === 0) {
                    $col.find('.dateBadge').addClass('sun');
                } else if (dayNum === 6) {
                    $col.find('.dateBadge').addClass('sat');
                }
                $col.find('.dateBadge').on('click', () => {
                    changeNow(day);
                });
                if (cloneNow.isSame(day)) {
                    $col.addClass('selectedDay');
                }
                if (cloneToday.isSame(day)) {
                    $col.addClass('today');
                }
                $row.append($col);
            }
            $Cbody.append($row);
        }
        if (flag === 'week' || flag === 'day') {
            let colLoop = 6;
            if (flag === 'day') colLoop = 0;
            for (let time = 0; time < 24; time++) {
                const $row = $(`<div class="row" data-week="${showArr[0].week}">`);
                //timeFromIdx
                for (let colIdx = -1; colIdx <= colLoop; colIdx++) {
                    const $col = $(`<div class="col">`);
                    if (colIdx === -1) {
                        $col.html(`<div class="timeBadge">${timeFromIdx(time)}</div>`);
                        $col.addClass('timeTxt');
                    } else {
                        const day = showArr[0].days[colIdx].clone();
                        const timeStamp = day
                            .clone()
                            .hour(time)
                            .format('x');
                        const dayNum = day.day();
                        const date = day.date();
                        const dayMonth = day.month();
                        $col.attr('id', `time_${timeStamp}`);
                        $col.on('click', () => {
                            setTimeInput('startDate', false, [
                                day.year(),
                                dayMonth + 1,
                                date,
                                time
                            ]);
                            setTimeInput('endDate', false, [
                                day.year(),
                                dayMonth + 1,
                                date,
                                time + 1
                            ]);
                            addModal();
                        });
                    }
                    $row.append($col);
                }
                $Cbody.append($row);
            }
        }
        $Calendar.append($Cbody);
        //몸통 부분 : 끝
        $('#calendar').html($Calendar);
        //saveData 순회해서 심기
        // console.log('saveData:\n', saveData);
        if (saveData.length) {
            for (let i = 0; i < saveData.length; i++) {
                // console.log(saveData[i]);
                const { colorChip, content, endTime, startTime, title } = saveData[i];
                const sT = moment(startTime);
                const startTimeDate = sT.date();
                const eT = moment(endTime);
                const startDayTimeStamp = sT
                    .clone()
                    .hour(0)
                    .format('x');
                const endDayTimeStamp = eT
                    .clone()
                    .hour(0)
                    .format('x');
                const dayDiff = eT.diff(sT, 'days');
                // console.log('dayDiff', dayDiff);
                if (
                    dayDiff === 0 &&
                    (flag === 'week' || flag === 'day') &&
                    (sT.hour() !== 0 || eT.hour() !== 0)
                ) {
                    const hourDiff = eT.diff(sT, 'hours');
                    for (let di = 0; di <= hourDiff; di++) {
                        let $timeDom = $(`#time_${Number(startTime) + di * 3600000}`);
                        // if (di) {
                        //     console.log($timeDom);
                        //     const memoLength = $timeDom.attr('data-memoLength');
                        //     if (memoLength) {
                        //         $timeDom.attr('data-memoLength', Number(memoLength) + 1);
                        //     } else {
                        //         $timeDom.attr('data-memoLength', 1);
                        //     }
                        // }
                        if (di === 0 && $timeDom.length) {
                            const memoLength = $timeDom.attr('data-memoLength');
                            const $memo = $(`<div class="timeMemo" data-savedataidx="${i}">`);
                            $memo.attr('data-startDayTimeStamp', startDayTimeStamp);
                            $memo.attr('data-range', hourDiff);
                            $memo.html(`<div>${title.substring(0, 10) + '...'}</div>`);
                            let newMemoLength;
                            if (memoLength) {
                                newMemoLength = Number(memoLength) + 1;
                                $timeDom.attr('data-memoLength', newMemoLength);
                            } else {
                                newMemoLength = 1;
                                $timeDom.attr('data-memoLength', 1);
                            }
                            $memo.css({
                                'background-color': colorChip,
                                left: Number(20 * (newMemoLength - 1)),
                                height: Number(112 * hourDiff)
                            });
                            $timeDom.append($memo);
                            $timeDom.addClass('memoExist');
                        }
                    }
                    // console.log(sT.format('YYYY-MM-DD'));
                    // console.log(eT.format('YYYY-MM-DD'));
                    // console.log(saveData[i]);
                    // console.log(eT.diff(sT, 'hours'));
                }
                for (let di = 0; di <= dayDiff; di++) {
                    let $timeDom = $(`#col_time_${Number(startDayTimeStamp) + di * 86400000}`);
                    // console.log($timeDom, Number(startDayTimeStamp) + di * 86400000);
                    if ($timeDom.length) {
                        const memoLength = $timeDom.attr('data-memoLength');
                        if (memoLength) {
                            $timeDom.attr('data-memoLength', Number(memoLength) + 1);
                        } else {
                            $timeDom.attr('data-memoLength', 1);
                        }
                        const $memo = $(`<div class="memo" data-savedataidx="${i}">`);
                        $memo.attr('data-startDayTimeStamp', startDayTimeStamp);
                        $memo.attr('data-range', dayDiff);
                        if (di === 0 || $timeDom.hasClass('firstDayFromWeek')) {
                            $memo.html(`<div>${title}</div>`);
                        }
                        if (!$timeDom.hasClass('firstDayFromWeek')) {
                            $memo.addClass('ml');
                        }
                        $memo.css('background-color', colorChip);
                        $timeDom.append($memo);
                        $timeDom.addClass('memoExist');
                    }
                }
            }
            //saveData bedge order 순회
            if ($('.body .col.memoExist').length) {
                $('.body .col.memoExist').each((ei, ev) => {
                    const $thisCol = $(ev);
                    if ($thisCol.find('.memo').length >= 1) {
                        let sortArr = [];
                        $thisCol.find('.memo').each((mi, mv) => {
                            const $memo = $(mv);
                            $memo.attr('id', `${$thisCol.attr('id')}_memo_${mi}`);
                            const memoObj = {
                                timeStamp: Number($memo.data('startdaytimestamp')),
                                range: Number($memo.data('range')),
                                domId: `#${$memo.attr('id')}`
                            };
                            sortArr.push(memoObj);
                        });
                        //우선순위
                        //1. 타임스템프가 작은것 우선
                        //2. 타임레인지가 큰것 우선
                        sortArr = [...sortArr].sort(function(a, b) {
                            if (a['timeStamp'] - b['timeStamp'] !== 0) {
                                if (a['timeStamp'] - b['timeStamp'] > 1) return 1;
                                else return -1;
                            } else {
                                if (a['range'] - b['range'] > 1) return -1;
                                else return 1;
                            }
                        });
                        // console.log(sortArr);
                        const $newDom = $('<div>');
                        for (let di = 0; di < sortArr.length; di++) {
                            $newDom.append($(sortArr[di].domId));
                        }
                        $thisCol.find('.dateBadge').after($newDom.html());
                    }
                });
                //재정렬 라스트
                /**
                 * 1. 위 솔트되어서 뿌려진 col을 기준으로 덤프를 밀어넣기,
                 * 2. 위 솔트되어서 뿌려진 col을 바로 하단 col과 자리배치를 바꾸어서 덤프 대신 밀어넣기
                 */
                $('.body .col.memoExist').each((ei, ev) => {
                    const $thisCol = $(ev);
                    if (!$thisCol.is('.firstDayFromWeek')) {
                        $thisCol.find('.memo').each((mi, mv) => {
                            const $memo = $(mv);
                            const savedataidx = $memo.data('savedataidx');
                            const order = $memo.index();
                            // const
                            // console.log($memo);
                            const $pare = $memo
                                .closest('.col')
                                .prev()
                                .find(`.memo[data-savedataidx="${savedataidx}"]`);
                            const swapElements = (elm1, elm2) => {
                                var parent1, next1, parent2, next2;

                                parent1 = elm1.parentNode;
                                next1 = elm1.nextSibling;
                                parent2 = elm2.parentNode;
                                next2 = elm2.nextSibling;

                                parent1.insertBefore(elm2, next1);
                                parent2.insertBefore(elm1, next2);
                            };
                            if ($pare.length) {
                                const pareOrder = $pare.index();
                                if (order !== pareOrder) {
                                    if (
                                        $memo
                                            .parent()
                                            .children()
                                            .eq(pareOrder).length
                                    ) {
                                        swapElements(
                                            $memo[0],
                                            $memo
                                                .parent()
                                                .children()
                                                .eq(pareOrder)[0]
                                        );
                                    } else {
                                        let needPullOut = pareOrder - order; //아래로 당겨져야할 숫자
                                        // console.log(needPullOut);
                                        for (let a = 1; a <= needPullOut; a++) {
                                            $memo.before('<div class="memo dump">');
                                        }
                                    }
                                }
                            }
                        });
                    } else if ($thisCol.closest('.row').prev().length) {
                        // console.log($thisCol, $thisCol.closest('.row').prev().find('.col').last());
                        $thisCol.find('.memo').each((mi, mv) => {
                            const $memo = $(mv);
                            const savedataidx = $memo.data('savedataidx');
                            const order = $memo.index();
                            // const
                            // console.log($memo);
                            const $pare = $memo
                                .closest('.row')
                                .prev()
                                .find('.col')
                                .last()
                                .find(`.memo[data-savedataidx="${savedataidx}"]`);
                            if ($pare.length) {
                                const pareOrder = $pare.index();
                                if (order !== pareOrder) {
                                    let needPullOut = pareOrder - order; //아래로 당겨져야할 숫자
                                    for (let a = 1; a <= needPullOut; a++) {
                                        if ($memo.next().length) {
                                            $memo.before($memo.next());
                                        } else {
                                            $memo.before('<div class="memo dump">');
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
                $('.body .col.memoExist').each((ei, ev) => {
                    const $thisCol = $(ev);
                    $thisCol.find('.memo').each((mi, mv) => {
                        const $memo = $(mv);
                        if (mi >= 4) {
                            $memo.hide();
                        }
                    });
                    if ($thisCol.find('.memo').length >= 5) {
                        $thisCol
                            .find('.dateBadge')
                            .after('<div class="allShowMemo">일정모두보기 +</div>');

                        $thisCol.find('.allShowMemo').on('click', e => {
                            e.stopPropagation(); //버블링 차단
                            const memeArr = [];
                            $thisCol.find('.memo').each((i, v) => {
                                if (!$(v).hasClass('dump')) memeArr.push($(v).data('savedataidx'));
                            });
                            // console.log(memeArr);
                            let $listHtml = $('<div>');
                            for (let a = 0; a < memeArr.length; a++) {
                                const data = saveData[memeArr[a]];
                                // console.log(saveData, data, memeArr[a]);
                                const $listDiv = $('<div class="listItem">');
                                $listDiv.text(`제목:${data.title}`);
                                $listDiv.on('click', e => {
                                    e.stopPropagation(); //버블링 차단
                                    const selData = { ...data };
                                    $('#popup2').addClass('hide');
                                    addModal(selData, memeArr[a]);
                                });
                                $listHtml.append($listDiv);
                            }
                            $('#popup2 .allList').html($listHtml);
                            $('#popup2').removeClass('hide');
                            // console.log(memeArr);
                        });
                    }
                });
                //evnet add
                $('.body .col.memoExist .memo, .body .col.memoExist .timeMemo').each((mi, mv) => {
                    if (!$(mv).hasClass('dump')) {
                        $(mv).on('click', e => {
                            e.stopPropagation(); //버블링 차단
                            const saveIdx = $(mv).data('savedataidx');
                            const selData = { ...saveData[saveIdx] };

                            // console.log(selData);
                            addModal(selData, saveIdx);
                        });
                    }
                });
            }
        }
    }
    dateInputsChk(state) {
        const { selDate, startDate, endDate } = state;
        $('.timeSelWrap').each((wi, wv) => {
            const chkTimeArr = (arr, t) => {
                let valArr = [...arr];
                let chk = true;
                for (let a = 0; a < 3; a++) {
                    if (arr[a] === '') {
                        chk = false;
                        break;
                    }
                }
                if (chk) valArr[1] = valArr[1] - 1;
                if (chk && moment(valArr).format('x') === 'Invalid date') {
                    chk = false;
                }
                $(t)
                    .find('input')
                    .each((i, v) => {
                        if (chk && valArr[i] !== '' && i === 1) {
                            $(v).val(valArr[i] + 1);
                        } else $(v).val(arr[i]);
                    });
                //시작일시,종료일시 부분 초기화
                if (arr[3] !== '') {
                    $(t)
                        .find('select')
                        .val(!chk ? 0 : arr[3]);
                }
                return chk;
            };
            if (wi === 0) {
                //selDate
                if (!chkTimeArr(selDate, wv)) $(wv).addClass('error');
                else if ($(wv).hasClass('error')) $(wv).removeClass('error');
            } else if (wi === 1) {
                //startDate
                if (!chkTimeArr(startDate, wv)) $(wv).addClass('error');
                else if ($(wv).hasClass('error')) $(wv).removeClass('error');
            } else if (wi === 2) {
                //endDate
                if (!chkTimeArr(endDate, wv)) $(wv).addClass('error');
                else if ($(wv).hasClass('error')) $(wv).removeClass('error');
            }
        });
    }
}
export default View;
