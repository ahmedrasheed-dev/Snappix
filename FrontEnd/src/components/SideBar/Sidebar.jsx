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
const Sidebar = ({ isOpen, onClose }) => {
  const { isLoggedIn } = useSelector((state) => state.user);
  const user = useSelector((state) => state.user.user);

  return (
    <section
      className={`
        fixed top-0 left-0  h-full bg-[#0f0f0f] 
        flex flex-col items-center justify-between transition-transform duration-300 ease-in-out
        w-30 md:w-20  z-100
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}
    >
      <div className="flex flex-col items-center w-full">
        <div className="mb-16 mt-4 flex justify-between items-center px-4">
          <Logo color="#e8317e" />
          <button onClick={onClose} className="md:hidden text-white hover:text-pink-500">
            ✕
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex flex-col gap-4 items-center">
          <SidebarItem to="/" icon={Homeicon} text="Home" />
          {isLoggedIn && (
            <SidebarItem to={`/channel/${user?.username}`} icon={Profileicon} text="Profile" />
          )}
          <SidebarItem to="/history" icon={WatchHistory} text="History" />
          <SidebarItem to="/subscriptions" icon={SubscriptionsIcon} text="Subscriptions" />
          <SidebarItem to="/tweets" icon={CommunityIcon} text="Community" />
        </div>
      </div>

      <SidebarItem to="/settings" icon={Settingsicon} text="Settings" />
    </section>
  );
};

export default Sidebar;
