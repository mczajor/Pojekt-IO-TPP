import React from "react";
import Plot from "react-plotly.js";

export default function ClusterChart({ clusters, columnNames }) {
  const clusterCounts = clusters.reduce((acc, cluster) => {
    acc[cluster] = (acc[cluster] || 0) + 1;
    return acc;
  }, {});

  const xValues = Object.keys(clusterCounts).map(Number);
  const yValues = Object.values(clusterCounts);
  const data_2 = {};
  clusters.forEach((cluster, record) => {
    if (!data_2[cluster]) {
      data_2[cluster] = {
        x:[],
        y:[],
        mode: "markers",
        name: "Klaster " + cluster
      }
    }
    data_2[cluster].x.push(record)
    data_2[cluster].y.push(cluster)
  })
  
  const data_1 = xValues.map((cluster, index) => ({
    x:[cluster],
    y:[yValues[index]],
    type: 'bar',
    name: "Klaster "+ index
  }))
  const data = Object.keys(data_2).map(cluster => data_2[cluster]);

  return (
    <>
      {xValues.length !== 0 && (
        <>
          <div>
            <h1>Klastry kolumn:</h1>
            <p>{columnNames}</p>
          </div>
          <Plot
            data={data_1}
            layout={{
              width: 700,
              height: 500,
              title: "Ilość rekordów w klastrze",
              xaxis: { title: "Numer Klastru" },
              yaxis: { title: "Ilość rekordów" },
            }}
          />

          <Plot
            data={data}
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
