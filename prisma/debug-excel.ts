import * as XLSX from 'xlsx';
import path from 'path';

// ⚠️ ปรับ Path ไฟล์ตามโครงสร้างโฟลเดอร์ของคุณ
const FILE_PATHS = {
  SCOPUS: path.join(__dirname, 'D:\\coding file\\journal-app\\prisma\\seeds\\data\\ext_list_May_2026.xlsx'),
  SCIMAGO: path.join(__dirname, 'D:\\coding file\\journal-app\\prisma\\seeds\\data\\Scimagojr2025.xlsx'),
  AJG: path.join(__dirname, 'D:\\coding file\\journal-app\\prisma\\seeds\\data\\JQL-72_subject.xlsx'),
  ABDC: path.join(__dirname, 'D:\\coding file\\journal-app\\prisma\\seeds\\data\\ABDC-JQL-2025-v2-270526.xlsx'),
};

function testRead(name: string, filePath: string) {
  console.log(`\n=================== DEBUG: ${name} ===================`);
  console.log(`Checking path: ${filePath}`);
  
  try {
    const workbook = XLSX.readFile(filePath);
    console.log(`Sheet Names in File:`, workbook.SheetNames);
    
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[sheetName]);
    
    console.log(`Total Rows Read: ${rows.length}`);
    if (rows.length > 0) {
      console.log(`First Row Column Headers (Keys):`, Object.keys(rows[0]));
      console.log(`First Row Sample Data:`, rows[0]);
    } else {
      console.log(`❌ WARNING: File is empty or sheet format is invalid!`);
    }
  } catch (err: any) {
    console.error(`❌ ERROR Reading File: ${err.message}`);
  }
}

testRead('AJG', FILE_PATHS.AJG);
testRead('ABDC', FILE_PATHS.ABDC);