import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/home";
import Schedule from "./pages/schedule";
import Campus from "./pages/campus";
import Presence from "./pages/presence";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/campus" element={<Campus />} />
          <Route path="/presence" element={<Presence />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
