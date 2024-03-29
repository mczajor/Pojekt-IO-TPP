import React from "react";
import Plot from "react-plotly.js";

export default function ClusterChart({ clusters, columnNames }) {
  const clusterCounts = clusters.reduce((acc, cluster) => {
    acc[cluster] = (acc[cluster] || 0) + 1;
    return acc;
  }, {});

  const xValues = Object.keys(clusterCounts).map(Number);
  const yValues = Object.values(clusterCounts);
 

  return (
    <>
      {xValues.length !== 0 && (
        <>
          <div>
            <h1>Klastry kolumn:</h1>
            <p>{columnNames}</p>
          </div>
          <Plot
            data={[
              {
                x: xValues,
                y: yValues,
                type: "bar",
                marker: { color: "red" },
              },
            ]}
            layout={{
              width: 700,
              height: 500,
              title: "Ilość rekordów w klastrze",
              xaxis: { title: "Numer Klastru" },
              yaxis: { title: "Ilość rekordów" },
            }}
          />

          <Plot
            data={[
              {
                x: clusters.map((_, index) => index),
                y: clusters,
                mode: "markers",
                marker: { color: "blue" },
              },
            ]}
            layout={{
              width: 700,
              height: 500,
              title: "Przynależność do klastru",
              xaxis: { title: "Wiersz rekordu" },
              yaxis: { title: "Numer Clastru" },
            }}
          />
        </>
      )}
    </>
  );
}
