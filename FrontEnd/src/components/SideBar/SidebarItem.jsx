import { NavLink } from "react-router-dom";

const SidebarItem = ({ to, icon: IconComponent, text }) => {
  const activeColor = "#e8317e";
  const inActiveColor = "white";
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-center p-4 rounded-lg cursor-pointer duration-200 w-full
        transition-color ease-in-out
        ${isActive ? "border-l-2 border-pink " : ""}`
      }
    >
      {({ isActive }) => {
        const iconColor = isActive ? activeColor : inActiveColor;
        return <IconComponent color={iconColor} />;
      }}
    </NavLink>
  );
};

export default SidebarItem;
