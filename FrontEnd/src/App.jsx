import "./App.css";
import Sidebar from "./components/SideBar/Sidebar.jsx";
import { Outlet } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchLoggedInUser } from "./store/features/userSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import Topbar from "./components/Topbar/Topbar";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLoggedInUser());
  }, [dispatch]);

  return (
    <div className="grid grid-cols-[80px_1fr] bg-gray-900 h-screen overflow-y-scroll">
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
      <div className="flex flex-col w-full">
        <Topbar classes="fixed top-0 left-[80px] right-0 py-4 w-[calc(100%-80px)] bg-gray-900/50 backdrop-blur-lg border-b border-white/10 z-50  h-16" />
        <main className="flex-1 overflow-auto mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
