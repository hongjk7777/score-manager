import { Workbook } from "exceljs";


export default class WorksheetService {

    findWorkbookIdByName(name, excel) {
        let excelId = -1;
        excel.eachSheet((worksheet, id) => {
            if(worksheet.name.includes(name)) {
                excelId = id;
            }
        });

        return excelId;
    }

    
}