import React, { useState } from "react";
import Quiz from "./components/Quiz";
import "./App.css";

function App() {
  const [section, setSection] = useState("section");

  return (
    <div className="App">
      <h1>Quiz App</h1>
      <Quiz section={section} />
    </div>
  );
}

export default App;
