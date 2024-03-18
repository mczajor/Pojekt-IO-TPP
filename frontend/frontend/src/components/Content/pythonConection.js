export const eel = window.eel;
eel.set_host("ws://localhost:8080");

export async function downloadFileWithDelay(file, delay) {
    const blobUrl = window.URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = file.name;
    link.click();
    return new Promise(resolve => setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      resolve();
    }, delay));
  }
  
  export function print_python_response(dataString) {
    console.log(dataString);
  }

  export async function updateContent(updateFileContent_callback) {
    setTimeout(() => {
      eel.DataService_data()(updateFileContent_callback);
    }, 1000);
  }

  export function downloadFile(fileName){
    eel.DataService_load("C:/Users/ltmol/Downloads/" + fileName);
    // można dodać (print_python_response)
  }

  export function renameColumn(columnName, tempColumnName){
    eel.DataService_rename_column(columnName, tempColumnName);
  }

  export function removeColumn(columnName){
    eel.DataService_remove_columns(columnName)
  }

  export function removeRow(rowIndex){
    eel.DataService_remove_rows(rowIndex)
  }

  export function modifyValueAt(rowIndex, columnName, newValue){
    eel.DataService_modify_value_at(rowIndex, columnName, newValue);
  }
  
  export function saveToFile(){  
    eel.DataService_save()
  }
  