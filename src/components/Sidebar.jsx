import { ChevronFirst, ChevronLast, MoreVertical } from "lucide-react";
import logo from "../assets/dashboardAdmin/logo putih.png";
import profile from "../assets/homepage/signin.svg";
import { createContext, useContext, useState } from "react";
import {Link} from "react-router-dom";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <>
      <aside className="min-h-screen sticky top-0">
        <nav className="h-full flex flex-col bg-gradient-to-r from-[#753799] to-[#100428] items-center border-r shadow-sm">
          <div className="p-4 pb-2 flex items-center w-full">
            <div className="flex-1 flex justify-center">
              <img
                src={logo}
                className={`overflow-hidden transition-all ${
                  expanded ? "w-32" : "w-0"
                }`}
              />
            </div>
            <button
              onClick={() => setExpanded((curr) => !curr)}
              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
            >
              {expanded ? <ChevronFirst /> : <ChevronLast />}
            </button>
          </div>

          <SidebarContext.Provider value={{ expanded }}>
            <ul className="flex-1 px-3">{children}</ul>
          </SidebarContext.Provider>

          <div className="border-t flex p-3">
            {/* <img src={profile} className="w-10 h-10 rounded-md" /> */}
            <div
              className={`flex justify-between items-center overflow-hidden transition-all ${
                expanded ? "w-52 ml-3" : "w-0"
              } `}
            >
              {/* <div className="leading-4">
                <h4 className="font-semibold">constGenius</h4>
                <span className="text-xs text-gray-600">
                  constgenius@gmail.com
                </span>
              </div> */}
              {/* <MoreVertical size={20} /> */}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}

export function SidebarItem({ icon, text, active, alert, to}) {
  const { expanded } = useContext(SidebarContext);
  return (
    <Link to={to}>
    <li
      className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${
        active
          ? "bg-gradient-to-tr from-[#710193] to-[#710193] text-indigo-800"
          : "hover:bg-[#710193] text-gray-600"
      }`}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
            expanded ? "" : "top-2"
          }`}
        ></div>
      )}

      {!expanded && (
        <div
          className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-[#710193] text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
        >
          {text}
        </div>
      )}
    </li>
    </Link>
  );
}
