

function addExcelExportBtnEvent() {
    const excelExportBtns = document.querySelectorAll("#excel-export-btn");
    const curUrl = window.location.href;
    
    for (let i = 0; i < excelExportBtns.length; i++) {
        const btn = excelExportBtns[i];
        const commonRound = i + 1;
        btn.addEventListener("click", (e) => {
            location.href=`${curUrl}/export-excel?commonRound=${commonRound}`;
        })
    }
}

addExcelExportBtnEvent();
