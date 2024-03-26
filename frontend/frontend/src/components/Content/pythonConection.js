export const eel = window.eel;
eel.set_host("ws://localhost:8080");
  
  export function print_python_response(dataString) {
    console.log(dataString);
  }

  export async function updateContent(updateFileContent_callback) {
      await eel.DataService_data()(updateFileContent_callback);
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

  export function loadFile(setFileName) {
    eel.DataService_load()(setFileName);
  }

  export function normalize(columns = null, selectedNumericalNormalization, selectedCategoricalNormalization){
    if (columns.length === 0) {
      eel.DataService_normalize(null, selectedNumericalNormalization, selectedCategoricalNormalization);
    } else{
      eel.DataService_normalize(columns, selectedNumericalNormalization, selectedCategoricalNormalization);
    }
    
    
  }
  
  export function clusterize(columns, clusterization_method_type){
    eel.DataService_clusterize(columns, clusterization_method_type)(print_python_response)
}
  export async function viualizeData(vizualize_callback){
      await eel.VisualizationService_visualize_pca()(vizualize_callback)
  }