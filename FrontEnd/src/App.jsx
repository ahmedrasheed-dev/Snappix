import "./App.css";
import Sidebar from "./components/SideBar/Sidebar.jsx";
import { Outlet } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useInitialAuthCheck from "./hooks/useAuthCheck.js";

function App() {
  useInitialAuthCheck();
  return (
    <div className="flex bg-gray-900">
      <Sidebar />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
      <main className="flex flex-col overflow-auto justify-center w-full">
        <Outlet />{" "}
        {/* This is where the child routes will be rendered */}
      </main>
    </div>
  );
}

export default App;
