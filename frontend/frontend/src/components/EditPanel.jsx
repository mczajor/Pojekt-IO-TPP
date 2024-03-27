import { saveToFile } from "./Content/pythonConection";

export default function EditPanel({
  editMode,
  tempColumnName,
  selectedColumnName,
  confirmChanges,
  deleteColumn,
  newValue,
  handleInputValues,
  handleNewValue,
  changeValue,
  selectedCurrentRowIndex,
  deleteRow,
}) {
  return (
    <>
      {editMode && (
        <>
          {selectedCurrentRowIndex === -1 && (
            <div className="input-btn-container">
              <input
                type="text"
                value={tempColumnName}
                onChange={handleInputValues}
                className="change-input"
              />
              <button onClick={confirmChanges} className="change-btn">
                Zmień nazwę
              </button>
              <button
                onClick={() => deleteColumn(tempColumnName)}
                className="delete-btn"
              >
                Usuń kolumnę
              </button>
            </div>
          )}
          {selectedCurrentRowIndex !== -1 && (
            <div className="input-btn-container">
              <input
                type="text"
                value={newValue}
                placeholder={
                  "(" +
                  selectedCurrentRowIndex +
                  ", " +
                  selectedColumnName +
                  ")"
                }
                onChange={handleNewValue}
                className="change-input"
              />
              <button onClick={changeValue} className="change-btn">
                Zmień wartość
              </button>
              {selectedCurrentRowIndex !== -1 && (
                <button onClick={deleteRow} className="delete-btn">
                  Usuń rząd: {selectedCurrentRowIndex}
                </button>
              )}
            </div>
          )}
        </>
      )}

      <div className="input-btn-container">
        <button onClick={saveToFile} className="selected-row" id="save-btn">
          Zapisz
        </button>
      </div>
    </>
  );
}
