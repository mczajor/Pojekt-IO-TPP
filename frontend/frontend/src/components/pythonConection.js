export const eel = window.eel;
eel.set_host("ws://localhost:8080");

export function print_python_response(dataString) {
  console.log(dataString);
}

export async function data(updateFileContent_callback) {
  await eel.DataService_data()(updateFileContent_callback);
}

export function renameColumn(columnName, tempColumnName) {
  eel.DataService_rename_column(columnName, tempColumnName);
}

export function removeColumn(columnName) {
  eel.DataService_remove_columns(columnName);
}

export function removeRow(rowIndex) {
  eel.DataService_remove_rows(rowIndex);
}

export function modifyValueAt(rowIndex, columnName, newValue) {
  eel.DataService_modify_value_at(rowIndex, columnName, newValue);
}

export function saveToFile() {
  eel.DataService_save();
}

export function loadFile(setFileName) {
  eel.DataService_load()(setFileName);
}

export function normalize(
  selectedNumericalNormalization,
  selectedCategoricalNormalization
) {
  eel.DataService_normalize(
    null,
    selectedNumericalNormalization,
    selectedCategoricalNormalization
  );
}

export function normalizedData(updateFileContent_callback){
  eel.DataService_normalized_data()(updateFileContent_callback)
}

export function clusterize(
  columns,
  clusterization_method_type,
  convertStrToArr,
  selectedNbOfClusters = 2,
) {
  columns.length === 0
    ? eel.DataService_clusterize(
        null,
        clusterization_method_type,
        selectedNbOfClusters
      )(convertStrToArr)
    : eel.DataService_clusterize(
        columns,
        clusterization_method_type,
        selectedNbOfClusters
      )(convertStrToArr);
}
export async function viualizeData(vizualize_callback) {
  await eel.VisualizationService_visualize_pca()(vizualize_callback);
}

export function getFileName(fileName_callback){
  eel.DataService_file_name()(fileName_callback)
}
