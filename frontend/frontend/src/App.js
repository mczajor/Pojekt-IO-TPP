import "./App.css";
import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import Content from "./components/Content.jsx";
import EditPanel from "./components/EditPanel.jsx";
import Normalization from "./components/Normalization.jsx";
import Clusteriazation from "./components/Clusterization.jsx";
import PCA from "./components/PCA.jsx";
import { data, normalizedData, getDataWithClusterStatistics } from "./components/pythonConection.js";

function App() {

  const [normalized, setNormalized] = useState(false)

  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route
            path=""
            element={
              <Content
                key="data"
                HelperComponent={EditPanel}
                updateDataContent={data}
                setNormalized = {setNormalized}
                allData = {true}
              />
            }
          />
          <Route
            path="normalizacja"
            element={
              <Content
                key="normalization"
                HelperComponent={Normalization}
                updateDataContent={normalizedData}
                setNormalized = {setNormalized}
                allData = {true}
              />
            }
          />
          <Route path="pca" element={<Content
                key="pca"
                HelperComponent={PCA}
                updateDataContent={normalizedData}
                normalized = {normalized}
                setNormalized = {setNormalized}
                allData = {false}
              />} />
          <Route
            path="*"
            element={
              <Content
                key="normalization"
                HelperComponent={Normalization}
                updateDataContent={normalizedData}
                allData = {true}
              />
            }
          />
          <Route
            path="klasteryzacja"
            element={
              <Content
                key="clusterize"
                HelperComponent={Clusteriazation}
                updateDataContent={getDataWithClusterStatistics}
                normalized = {normalized}
                allData = {false}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
