import React from "react";
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import DataInsert from "./components/DataInsert";

function App() {

  return (
    <Router>
      <div>
        {/* Define Routes */}
        <Routes>
          <Route path="/api/" element={<Login />} />
          <Route path="/api/dashboard" element={<Dashboard />} />
          <Route path="/api/datainsert" element={<DataInsert />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;