import "../styles/header.css";

import { Link } from "react-router-dom";
import { useState } from "react";

export default function Header() {

  const [currentClicked, setCurrentClicked] = useState(0)

  return (
    <header>
      <Link to="/dane">
        <button className={currentClicked === 0 ? "clicked-btn" : undefined} onClick={() => setCurrentClicked(0)}>Dane</button>
      </Link>
      <Link to="/normalizacja">
        <button className={currentClicked === 1 ? "clicked-btn" : undefined} onClick={() => setCurrentClicked(1)}>Normalizacja</button>
      </Link>
      <Link to="/pca">
        <button className={currentClicked === 2 ? "clicked-btn" : undefined} onClick={() => setCurrentClicked(2)}>PCA</button>
      </Link>
      <Link to="/klasteryzacja">
        <button className={currentClicked === 3 ? "clicked-btn" : undefined} onClick={() => setCurrentClicked(3)}>Klasteryzacja</button>
      </Link>
    </header>
  );
}
