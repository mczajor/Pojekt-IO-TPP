import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import Content from "./components/Content.jsx";
import EditPanel from "./components/EditPanel.jsx";
import Normalization from "./components/Normalization.jsx";
import Clusteriazation from "./components/Clusterization.jsx";
import PCA from "./components/PCA.jsx";
import { data, normalizedData } from "./components/pythonConection.js";

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route
            path="dane"
            element={<Content key="data" HelperComponent={EditPanel} updateDataContent={data}/>}
          />
          <Route
            path="normalizacja"
            element={<Content key="normalization" HelperComponent={Normalization} updateDataContent={normalizedData}/>}
          />
          <Route path="pca" element={<PCA />} />
          <Route
            path="klasteryzacja"
            element={<Content key="clusterize" HelperComponent={Clusteriazation} updateDataContent={data}/>}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
