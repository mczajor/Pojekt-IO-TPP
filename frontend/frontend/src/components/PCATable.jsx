import { useState } from "react";

export default function PCATable({title, columnVector, firstRow, secondRow, addToFrame}){

  const [columnName, setColumnName] = useState("");
  const [rowIndex, setRowIndex] = useState(-1);
  columnVector = ["Component", ...columnVector]
  firstRow = ["Principal 1", ...firstRow]
  secondRow = ["Principal 2", ... secondRow]

    function handleColumnClick(column) {
        if (column === columnName) {
          setColumnName("");
        } else {
          setColumnName(column);
        }
        setRowIndex(-1);
      }
    
      function handleRowClick(row, column) {
        if (row === rowIndex && column === columnName) {
          setColumnName("");
          setRowIndex(-1);
        } else {
          setColumnName(column);
          setRowIndex(row);
        }
      }

    return (
        <>
        <h1 id="pca-h1">{title}</h1>

          <table id="pca-table">
            <thead>
              <tr>
                {columnVector.map((item, index) => (
                  <th key={index} onClick = {() => handleColumnClick(index)}
                  className={(index === columnName && rowIndex === -1 ? "selected-column" : undefined)}>{item}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                {firstRow.map((item, index) => (
                  <td key={index} className={(index === columnName && rowIndex === -1 ? "selected-column" : undefined) + " " + (
                    rowIndex === 0 ? "selected-row" : undefined)}
                  onClick={() => handleRowClick(0, index)}
                  style={{
                    backgroundColor:
                      rowIndex === 0 &&
                      index === columnName
                        ? "rgb(68, 190, 59)"
                        : undefined,
                    opacity: 30,
                  }}>
                    {item}{index !== 0 ? addToFrame : undefined}
                  </td>
                ))}
              </tr>
              <tr>
                {secondRow.map((item, index) => (
                  <td key={index} className={(index === columnName && rowIndex === -1 ? "selected-column" : undefined) + " " + (
                  rowIndex === 1 ? "selected-row" : undefined)}
                  onClick={() => handleRowClick(1, index)}
                  style={{
                    backgroundColor:
                      rowIndex === 1 &&
                      index === columnName
                        ? "rgb(68, 190, 59)"
                        : undefined,
                    opacity: 30,
                  }}>
                    {item}{index !== 0 ? addToFrame : undefined}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          </>
    )
}