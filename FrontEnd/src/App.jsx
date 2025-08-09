import "./App.css";
import Sidebar from "./components/SideBar/Sidebar.jsx";
import { Outlet } from "react-router-dom";

function App() {
  return (
      <div className="flex bg-gradient-to-tl from-[#071d2b] to-main-black">
        <Sidebar />

        <main className="flex-1 overflow-auto">
          <Outlet /> {/* This is where the child routes will be rendered */}
        </main>
      </div>
  );
}

export default App;
