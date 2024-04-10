import Plot from "react-plotly.js";

export default function PCAChart({ title, columnVector, yVector, color }) {
  return (
        <Plot
        data={[
            {
            x: columnVector,
            y: yVector,
            type: "bar",
            marker: { color: color },
            },
        ]}
        layout={{
            width: 700,
            height: 500,
            title: title,
            xaxis: { title: "Nazwa kolumny" },
            yaxis: { title: "Wpływ na Principal Component [%]" },
        }}
        />
  );
}
