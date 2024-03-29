import { loadFile } from "./pythonConection";

export default function AddFile({updateDataContent, updateFileContent_callback, fileName, setSelectedFileName}) {
  async function handleAddFileClick() {
    loadFile((filePath) => {
      setSelectedFileName(fileName(filePath));
    });

    updateDataContent(updateFileContent_callback);
  }

  return (
    <div id="main-container" style={{ overflow: "hidden" }}>
      <div id="file-name"></div>
      <button id="add-btn" onClick={handleAddFileClick}>
        +<p>Dodaj plik by rozpocząć analizę</p>
      </button>
    </div>
  );
}
