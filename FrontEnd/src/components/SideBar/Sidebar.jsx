import { Navigate } from "react-router-dom";
import { Homeicon, Profileicon, Logo } from "../../assets/index.js";
import SidebarItem from "./SidebarItem.jsx";

const Sidebar = () => {
  return (
    <section className="flex flex-col items-center h-screen bg-main-black w-20">
      <div className="mb-16">
        <Logo color="#e8317e" />
      </div>

      {/* Navigation items */}
      <div className="flex flex-col gap-4">
        <SidebarItem to="/" icon={Homeicon} text="Home" />
        <SidebarItem to="/profile" icon={Profileicon} text="Profile" />
        
        {/* <SidebarItem
          to="/subscriptions"
          icon={Subscriptionsicon}
          text="Subscriptions"
        /> */}

        {/* Spacer to push items to the bottom */}
        <div className="flex-grow"></div>

        {/* Settings/etc. at the bottom */}
        {/* <SidebarItem to="/settings" icon={Settingsicon} text="Settings" /> */}
      </div>
    </section>
  );
};

export default Sidebar;
