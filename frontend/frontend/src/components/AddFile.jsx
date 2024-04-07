export default function AddFile({handleAddFileClick}) {
  

  return (
    <div id="main-container" style={{ overflow: "hidden" }}>
      <div id="file-name"></div>
      <button id="add-btn" onClick={handleAddFileClick}>
        +<p>Dodaj plik by rozpocząć analizę</p>
      </button>
    </div>
  );
}
