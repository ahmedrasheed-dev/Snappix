import {
  Homeicon,
  Profileicon,
  Logo,
  WatchHistory,
  SubscriptionsIcon,
  Settingsicon,
  CommunityIcon,
} from "../../assets/index.js";
import SidebarItem from "./SidebarItem.jsx";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const { isLoggedIn } = useSelector((state) => state.user);
  const user = useSelector((state) => state.user.user);
  return (
    <section className="fixed left-0 z-20 justify-between flex flex-col items-center min-h-screen  w-20 bg-gray-900/70r  bg-[#0f0f0f] ">
      <div>
        <div className="mb-16 flex flex-col items-center ">
          <Logo color="#e8317e" />
        </div>

        {/* Navigation items */}
        <div className="flex flex-col gap-4">
          <SidebarItem to="/" icon={Homeicon} text="Home" />
          {isLoggedIn && (
            <SidebarItem to={`/channel/${user?.username}`} icon={Profileicon} text="Profile" />
          )}

          <SidebarItem to="/history" icon={WatchHistory} text="history" />

          <SidebarItem to="/subscriptions" icon={SubscriptionsIcon} text="Subscriptions" />
          <SidebarItem to="/tweets" icon={CommunityIcon} text="Community" />
        </div>

        {/* Spacer to push items to the bottom */}
        <div className="flex-grow"></div>

        {/* Settings/etc. at the bottom */}
        {/* <SidebarItem to="/settings" icon={Settingsicon} text="Settings" /> */}
      </div>
      <SidebarItem to="/settings" icon={Settingsicon} text="Settings" />
    </section>
  );
};

export default Sidebar;
