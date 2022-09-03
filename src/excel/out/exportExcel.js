import xlsx from "xlsx";
import Excel from "exceljs";
import { getCommontTestExcel } from "../../db/out/export";
import {removeExcelsDirectory} from '../excel'

const FILE_PATH = "src/excel/output/";
const FILE_NAME = "testExcel.xlsx";

async function makeCommonTestExcel(commonRound, res){
    // let workbook = new Excel.Workbook();
    removeExcelsDirectory(FILE_PATH, "");

    const workbook = xlsx.utils.book_new();
    const datas = await getCommontTestExcel(commonRound);

    // xlsx.utils.json_to_sheet
    // var data = [
    //     {name:"John", city: "Seattle"},
    //     {name:"Mike", city: "Los Angeles"},
    //     {name:"Zach", city: "New York"}
    // ];
    // var ws = xlsx.utils.json_to_sheet(data);

    // console.log(datas[1]);


    const scoreDistSheet = xlsx.utils.aoa_to_sheet(datas[0]);
    xlsx.utils.book_append_sheet(workbook, scoreDistSheet, "성적분포");

    const scoreRuleSheet = xlsx.utils.aoa_to_sheet(datas[1]);
    xlsx.utils.book_append_sheet(workbook, scoreRuleSheet, "채점기준");

    const originalSheet = xlsx.utils.aoa_to_sheet(datas[2]);
    xlsx.utils.book_append_sheet(workbook, originalSheet, "원본");

    xlsx.writeFile( workbook, FILE_PATH + FILE_NAME ); 

    // res.attachment(FILE_NAME);
    // res.setHeader(
    //     'Content-Type',
    //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //   );
    
    res.setHeader(
    'Content-Disposition',
    `attachment; filename= ${FILE_NAME}`,
    );


    res.sendFile('testExcel.xlsx', {root: FILE_PATH});
    // sendExcelFile(workbook, res)
}



export {makeCommonTestExcel}