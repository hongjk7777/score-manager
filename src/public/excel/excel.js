import ExcelJS from "exceljs";
import { log } from "firebase-functions/logger";
import {putScoreToDB, getStudentIdByName, putTotalExamToDB, removeSamePNumStudent, 
        addStudentToDB, getCommonExamRound, addDeptToDB, deleteClassDB} from "../db/dbQuery.js";

/* 
TODO:
양식을 지정해서 쓰게 해주는 것도 좋을 듯?
*/


async function putExcelValToDB(file, classId) {
    const workbook = new ExcelJS.Workbook();
    const excel = await workbook.xlsx.readFile(file.path);
    const success = await deleteClassPrevDB(classId);
    if(success) {
        handleExamDatas(excel, classId);
        const worksheet = excel.worksheets[0];
        handleStudentDatas(worksheet, classId);
    }
    
}

function deleteClassPrevDB(classId) {
    return new Promise(resolve => {
        deleteClassDB(classId).then( success => {
                if(success){
                    console.log('success to delete class db');
                    resolve(true);
                } else{
                    console.log('fail to delete class db');
                    resolve(false);
                }
            }
        );
        
    });
}



function handleExamDatas(excel, classId) {
    const infos = getExamInfos(excel);

    console.log("시험 횟수: " + infos);
    infos.forEach(info => {
        console.log(info);
        const scoreRule = getExamScoreRule(excel, info.round);
        putTotalExamToDB(info, scoreRule, classId);
    });
}

function getExamInfos(excel) {
    const worksheet = excel.worksheets[0];
    const commonRow = worksheet.getRow(1);
    const roundRow = worksheet.getRow(2);

    let infos = [];
    console.log(roundRow._cells.length);
    for (let col = 0; col < roundRow._cells.length; col++) {
        const roundCell = roundRow._cells[col];

        if(!roundCell.value) {
            continue;
        }

        if(!isNaN(parseInt(roundCell.value[0])) && roundCell.value[1] === "회") {
            const round = parseInt(roundCell.value[0]);
            if(isNewRound(infos, round)) {
                let info = [];
                info.round = round;
                const scoreArr = getScoreArr(worksheet.getColumn(col + 4));
                info.totalTester = scoreArr.length;
                if(scoreArr.length > 0){
                    info.average = (scoreArr.reduce((a, b) => a + b) / info.totalTester).toFixed(2);
                    info.standardDeviation = (Math.sqrt(scoreArr.map(x => Math.pow(x - info.average, 2)).reduce((a, b) => a + b) / info.totalTester)).toFixed(2);
                } else {
                    info.average = 0;
                    info.standardDeviation = 0;
                }
                info.commonRound = getCommonRound(commonRow, col + 4);
                infos.push(info);
            }
        }
    }
    return infos;
}

function getScoreArr(col) {
    let scoreArr = [];
    col.eachCell({includeEmpty : true}, function(cell, rowNum) {
        if(cell.value?.result) {
            if(cell.value?.formula){
                if(cell.value.formula.includes("SUM")){
                    if(cell.value.result != 0) {
                        scoreArr.push(cell.value.result);
                    }
                } else {
                    console.log("안세는거 " + cell.value.result);
                }
            } else {
                if(cell.value.result != 0) {
                    scoreArr.push(cell.value.result);
                }
            }
        }
    });
    return scoreArr;
}


//FIXME: 이거 왜 오류가 나는지 몰겟음
/*
function isNewRound(infos, round) {
    infos.forEach(info => {
        // console.log(info);
        if(info.round === round){
            return false;
        }
    });
    return true;
}
*/
function isNewRound(infos, round) {
    let isNew = true;
    infos.forEach(info => {
        // console.log(info);
        if(info.round === round){
            isNew = false;
        }
    });
    return isNew;
}

function getCommonRound(commonRow, col) {
    let commonRound = 0;
    if(col < commonRow._cells.length) {
        const cell = commonRow.getCell(col + 1);
        if(cell.value) {
            console.log(cell.value);
            const value = cell.value.result? cell.value.result : cell.value;
            console.log(value);
            if(value.substring(0, 2) === "공통" && value.length >= 3) {
                return value.charAt(2);
            }
        } else {
            return 0;
        }
    }
    return commonRound;
}


function getExamScoreRule(excel, round) {
    const sheetName = `테스트(${round}) 채점기준`;
    const worksheet = excel.getWorksheet(sheetName);
    const col = worksheet.getColumn(1);
    let scoreRule = "";
    col.eachCell({includeEmpty : true}, function(cell, colNumber) {
        if(cell.value){
            //cell 내부에서 font가 다른 경우 richText로 나눠져서 해당 처리를 함
            if(cell.value.richText){
                cell.value.richText.forEach(obj => {
                    // console.log(obj.text);
                    scoreRule += obj.text;
                });
                
            } else{
                // console.log(cell.value);
                scoreRule += cell.value;
            }
            scoreRule += "\n";

        } else{
            scoreRule += "$";
            scoreRule += "\n";
        }
    });
    // console.log(scoreRule);
    return scoreRule;
}

function handleStudentDatas(worksheet, classId) {
    const studentStartRow = getStudentStartRow(worksheet);
    console.log("학생이 나오는 건" + studentStartRow + "row 부터");
    console.log(getStudentNum(studentStartRow, worksheet) + "명의 학생이 있습니다");
    const rows = worksheet.getRows(studentStartRow, getStudentNum(studentStartRow, worksheet));
    // console.log(getStudentNum(3, worksheet) + "명의 학생이 있습니다");
    // const rows = worksheet.getRows(3, getStudentNum(3, worksheet));
    const maxCol = getMaxCol(worksheet);
    const scoreStartCol = getScoreStartCol(worksheet);
    const phoneNumCol = getPhoneNumCol(worksheet);
    const schoolCol = getSchoolCol(worksheet);
    console.log(schoolCol);
    console.log("성적이 나오는 건 " + scoreStartCol + "col 부터 입니다");
    rows.forEach(row => {
        putStudentDatasToDB(row, scoreStartCol, phoneNumCol, schoolCol, classId, maxCol);
    });
}

//TODO: _cells는 공백을 없애서 getColumn과는 완전히 다름 오류가 날수도 있으니 고치자
function getStudentStartRow(worksheet) {
    const colValues = worksheet.getColumn(2).values;
    console.log("column: " + colValues.length);
    for (let row = 2; row < colValues.length; row++) {
        const cellValue = colValues[row];
        if(!cellValue) {
            continue;
        }
        const value = cellValue.result? cellValue.result:cellValue;
        // console.log(value);
        if(value && value != "이름"){
            return row;
        }
        
    }

    return 3;
}

function getPhoneNumCol(worksheet) {
    const row = worksheet.getRow(2);
    let ret = -1;
    let count = 1;
    row.eachCell(function(cell, colNumber) {
        if(cell.value && cell.value.includes("학부모")) {
            ret = count;
        }
        count++;
    });

    if(ret < 0) {
        return 3;
    }
    return ret;
}

function getSchoolCol(worksheet) {
    const row = worksheet.getRow(2);
    let ret = -1;
    let count = 1;
    row.eachCell(function(cell, colNumber) {
        if(cell.value && cell.value.includes("학교")) {
            ret = count;
        }
        count++;
    });

    return ret;
}

function getDepartmentCol(worksheet) {
    const row = worksheet.getRow(2);
    let ret = -1;
    let count = 1;
    row.eachCell(function(cell, colNumber) {
        if(cell.value && cell.value == "지원학과") {
            ret = count;
        }
        count++;
    });

    return ret;
}

function getStudentNum(startRow, worksheet) {
    let count = 0;
    for (let i = startRow; ; i++) {
        const row = worksheet.getRow(i);
        if(row.getCell(2).value){
            count++;
        } else {
            break;
        }
    }

    return count;
}


function getScoreStartCol(worksheet) {
    const row = worksheet.getRow(2);
    for (let col = 0; col < row._cells.length; col++) {
        const cell = row._cells[col];
        if(cell.value){
            const value = cell.value.result? cell.value.result:cell.value;

            if(value.substring(0,2) === "1회"){
                return col + 1;
            }
        }
        
    }

    return 5;
}



function getMaxCol(worksheet) {
    let count = 1;
    const row = worksheet.getRow(2);
    // console.log(row);
    while (row.getCell(count).value != null) {
        count++;
    }

    count--;

    return count;
}

async function putStudentDatasToDB(row, scoreStartCol, phoneNumCol, schoolStartCol, classId, maxCol) {
    const studentName = row.getCell(2).value;
    // console.log("전화번호는" + row.getCell(4).value);
    // FIXME: 현재 엄마전화번호를 쓰는데 변수명은 studentPhoneNum임
    const studentPhoneNum =  getOnlyNumber(row.getCell(phoneNumCol).value);
    let schoolName = "";
    if(schoolStartCol >= 0) {
        schoolName = row.getCell(schoolStartCol);
    }

    //TODO: 이것도 다시 기입햇을 때 조금만 다르면 바꿔줘야 되지 않나?
    await removeSamePNumStudent(studentName, studentPhoneNum, classId, schoolName);
    await addStudentToDB(studentName, studentPhoneNum, classId, schoolName);

    const studentId = await getStudentIdByName(studentName, classId, studentPhoneNum);
    // console.log(studentId);
    //json으로 해볼가?
    let round = 1;
    for (let col = scoreStartCol; col < maxCol; col+=5, round++ ) {
        let scoreInfo = [];
        const firstScore = row.getCell(col).value;
        const secondScore = row.getCell(col + 1).value;
        const thirdScore = row.getCell(col + 2).value;
        const scoreSum = row.getCell(col + 3).value? row.getCell(col + 3).value.result : 0;
        const ranking = row.getCell(col + 4).value? row.getCell(col + 4).value.result : 0;
        const commonRound = await getCommonExamRound(round, classId);

        // console.log("여기에요" + firstScore, secondScore, thirdScore, scoreSum, ranking, commonRound);
        if(!checkValidity(firstScore, secondScore, thirdScore, scoreSum, ranking, commonRound)) {
            continue;
        }
        // console.log(studentName + firstScore + secondScore + thirdScore + scoreSum + ranking);
        putScoreToDB(studentId, classId, round, commonRound, firstScore, secondScore, thirdScore, scoreSum, ranking);
    }
}

function getOnlyNumber(phoneNum) {
    if(typeof phoneNum === 'number') {
        phoneNum = phoneNum.toString();
    }

    if(phoneNum){
        return phoneNum.replace(/\(|\)|-| /g, '');
    } else {
        return "";
    }
}

function checkValidity(firstScore, secondScore, thirdScore, scoreSum, ranking, commonRound) {
    if(typeof firstScore === 'number' && typeof secondScore === 'number' && typeof thirdScore === 'number' &&
        typeof scoreSum === 'number' && typeof ranking === 'number' && typeof commonRound === 'number'){
            return true;
    } else{
        return false;
    }
}

async function putDeptValToDB(file, classId) {
    const workbook = new ExcelJS.Workbook();
    const excel = await workbook.xlsx.readFile(file.path);
    const worksheet = excel.worksheets[0];

    handleDeptDatas(worksheet, classId);
}

function handleDeptDatas(worksheet, classId) {
    // const column = worksheet.getColumn(6);
    // console.log(column);
    const studentStartRow = getStudentStartRow(worksheet);
    const pNumCol = getPNumCol(worksheet);

    const row = worksheet.getRow(2);
    const row2 = worksheet.getRow(3);
    
    const rows = worksheet.getRows(studentStartRow, getStudentNum(studentStartRow, worksheet));
    const maxCol = getMaxCol(worksheet);
    console.log(maxCol);

    rows.forEach(row => {
        putDeptDatasToDB(row, pNumCol, classId, maxCol);
    });
    // console.log(row.getCell(5).value);
    // console.log(row2.getCell(5).value);
}

function getPNumCol(worksheet) {
    const row = worksheet.getRow(2);
    for (let col = 1; col <= row._cells.length; col++) {
        const cellValue = row.getCell(col).value;
        if(cellValue){
            cellValue = cellValue.replace(/(\r\n|\n|\r)/gm, "").replaceAll(" ", "");
            if(cellValue === "학부모전번"){
                console.log(col);
                return col;
            }
        }

       
        // if(cellValue) {
        //     if(cellValue === "학부모")
        // }
    }
    return 5;
}

async function putDeptDatasToDB(row, pNumCol, classId, maxCol) {
    const studentName = row.getCell(2).value;
    const studentPhoneNum =  getOnlyNumber(row.getCell(pNumCol).value);
    const deptStartCol = pNumCol + 1;

    //TODO: id를 전화번호로 받아올까?
    const studentId = await getStudentIdByName(studentName, classId, studentPhoneNum);
    // console.log(studentId);
    //json으로 해볼가?
    let commonRound = 1;
    for (let col = deptStartCol; col < maxCol; col+=2, commonRound++ ) {
        let scoreInfo = [];
        const seoulDept = row.getCell(col).value;
        const yonseiDept = row.getCell(col + 1).value;
        if(!checkDeptValidity(seoulDept, yonseiDept)) {
            continue;
        }
        // console.log(studentName + firstScore + secondScore + thirdScore + scoreSum + ranking);
        addDeptToDB(seoulDept, yonseiDept, studentId, commonRound);
    }
}

function checkDeptValidity(seoulDept, yonseiDept) {
    return typeof seoulDept === 'string' &&  typeof yonseiDept === 'string';
}

export {putExcelValToDB, putDeptValToDB}