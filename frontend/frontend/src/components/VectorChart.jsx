import Plot from "react-plotly.js";
export default function VectorChart({ columnVector, xData, yData }) {
  const vectorsData = xData.map((x, i) => ({
    x: [0, x],
    y: [0, yData[i]],
    mode: "lines",
    name: columnVector[i]
    
  }));
  return (
    <div id="plot-pca-sticky">
      <Plot
        className="plot"
        data={vectorsData}
        layout={{
          width: 700,
          height: 500,
          title: "Wektory własne Principal Components",
          xaxis: { title: "X" },
          yaxis: { title: "Y" },
        }}
      />
    </div>
  );
}
