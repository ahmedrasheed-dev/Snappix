import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./store";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home, Profile } from "./components";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
      <Provider store={store}>
        <Routes>
          
          <Route path="/" element={<App />}>
            {/* Child routes that will be rendered inside the Outlet */}
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="history" element={<Home />} />
            <Route path="subscriptions" element={<Home />} />
            <Route path="settings" element={<Home />} />
          </Route>
        </Routes>
      </Provider>
    </StrictMode>
  </BrowserRouter>
);
