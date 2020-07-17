import React from "react";
import Maze from "./components/Maze";
import "./App.scss";

function App() {
  return (
    <div className="App">
      <h1>MAZE</h1>
      <Maze size={900} axis={30} />
    </div>
  );
}

export default App;
