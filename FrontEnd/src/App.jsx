import "./App.css";
import Sidebar from "./components/SideBar/Sidebar.jsx";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 overflow-auto p-8">
        <Outlet /> {/* This is where the child routes will be rendered */}
      </main>
    </div>
  );
}

export default App;
