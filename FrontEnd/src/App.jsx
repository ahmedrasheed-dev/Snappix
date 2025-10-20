import "./App.css";
import Sidebar from "./components/SideBar/Sidebar.jsx";
import { Outlet } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchLoggedInUser } from "./store/features/userSlice";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react"; 
import Topbar from "./components/Topbar/Topbar";

function App() {
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchLoggedInUser());
  }, [dispatch]);

  const handleMenuClick = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="relative md:grid md:grid-cols-[80px_1fr]  h-screen overflow-y-scroll">
      
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

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

      <div className="flex flex-col w-full bg-[#0f0f0f]">
        <Topbar
          onMenuClick={handleMenuClick} 
          classes="fixed top-0 left-0 md:left-[80px] right-0 py-4 md:w-[calc(100%-80px)] backdrop-blur-lg border-b border-white/10 z-50 h-16"
        />
        <main className="flex-1 overflow-auto mt-18">
          <Outlet />
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
