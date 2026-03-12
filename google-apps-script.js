/**
 * Google Apps Script для синхронизации с Engly
 * 
 * ИНСТРУКЦИЯ ПО УСТАНОВКЕ:
 * 1. Создайте Google Таблицу
 * 2. Расширения → Apps Script
 * 3. Вставьте этот код
 * 4. Развертывание → Новое развертывание → Веб-приложение
 * 5. Доступ: "Все" (Anyone)
 * 6. Скопируйте URL веб-приложения
 * 
 * СТРУКТУРА ТАБЛИЦЫ (лист "Sheet1" или "Слова"):
 * | russian | english | rating |
 * |---------|---------|--------|
 * | кошка   | cat     | 0      |
 */

const SHEET_NAME = 'Sheet1'; // Или измените на название вашего листа

function doGet(e) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Проверяем, есть ли заголовки
  const hasHeaders = headers[0] === 'russian' || headers[0] === 'русский';
  const rows = hasHeaders ? data.slice(1) : data;
  
  const words = rows.filter(row => row[0] && row[1]).map(row => ({
    russian: String(row[0]).trim(),
    english: String(row[1]).trim(),
    rating: typeof row[2] === 'number' ? row[2] : 0
  }));
  
  return ContentService
    .createTextOutput(JSON.stringify({ words, timestamp: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet();
    
    // Очищаем лист и записываем новые данные
    sheet.clearContents();
    
    // Заголовки
    sheet.getRange(1, 1, 1, 3).setValues([['russian', 'english', 'rating']]);
    
    // Данные
    if (data.words && data.words.length > 0) {
      const rows = data.words.map(w => [w.russian, w.english, w.rating || 0]);
      sheet.getRange(2, 1, rows.length, 3).setValues(rows);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        timestamp: new Date().toISOString(),
        count: data.words ? data.words.length : 0 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.getSheets()[0]; // Берём первый лист
  }
  
  return sheet;
}
