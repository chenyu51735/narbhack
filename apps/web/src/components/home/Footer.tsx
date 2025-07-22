import React from "react";
import Logo from "../common/Logo";
import Menu from "../common/Menu";

const menuItems = [
  { title: "Home", url: "/" },
  { title: "Benefits", url: "#Benefits" },
  { title: "Get Started", url: "/auth" },
  { title: "Reviews", url: "#reviews" },
];

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Logo isMobile={false} />
        </div>
        <div className="flex items-center gap-6">
          <Menu menuItems={menuItems} />
        </div>
      </div>
      <div className="container mx-auto px-4 pb-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400">
        <div className="mb-2 md:mb-0">© 2024 Voxxi. All rights reserved.</div>
        <div>Icons by Icons8</div>
      </div>
    </footer>
  );
};

export default Footer;
