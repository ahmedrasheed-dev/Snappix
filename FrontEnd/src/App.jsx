import "./App.css";
import Sidebar from "./components/SideBar/Sidebar.jsx";
import { Outlet } from "react-router-dom";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchLoggedInUser } from "./store/features/userSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLoggedInUser());
  }, [dispatch]);
  
  return (
    <div className="grid grid-cols-[80px_1fr] bg-gray-900">
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
      <main className="flex flex-col overflow-auto justify-center">
        <Outlet />{" "}
      </main>
    </div>
  );
}

export default App;
