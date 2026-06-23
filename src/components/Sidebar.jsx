// import { NavLink } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const Sidebar = () => {
//   const { modules } = useAuth();

//   return (
//     <aside className="w-64 bg-[#2d2d31] text-white h-screen p-4 flex flex-col">
//       <h1 className="text-xl font-bold mb-6 text-center border-b border-gray-700 pb-4">
//         School ERP
//       </h1>
//       <nav className="flex-1 overflow-y-auto">
//         <ul className="space-y-1">
//           {modules
//             .filter((m) => m.can_view)
//             .map((m) => {
//               const path = `/${m.module_code.toLowerCase().replace(/_/g, '-')}`;
//               return (
//                 <li key={m.module_code}>
//                   <NavLink
//                     to={path}
//                     className={({ isActive }) =>
//                       `block px-4 py-2.5 rounded-md transition-all duration-200 
//                       ${isActive 
//                         ? 'bg-gray-700 text-white shadow-md border-l-4 border-red-500' 
//                         : 'hover:bg-gray-700/50 hover:text-gray-200'
//                       }`
//                     }
//                   >
//                     {m.module_name}
//                   </NavLink>
//                 </li>
//               );
//             })}
//         </ul>
//       </nav>
//       <div className="border-t border-gray-700 pt-4 text-xs text-gray-500 text-center">
//         v1.0.0
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuGroups } from '../config/menu';
import { FaChevronDown, FaChevronRight, FaSchool } from 'react-icons/fa';
import { useState } from 'react';

const Sidebar = () => {
  const { modules } = useAuth();
  const [open, setOpen] = useState({});

  const canView = new Set(modules.filter(m => m.can_view).map(m => m.module_code));

  const visible = menuGroups
    .map(g => ({
      ...g,
      items: g.items.filter(item => canView.has(item.code)),
    }))
    .filter(g => g.items.length > 0);

  const toggle = (label) => setOpen(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <aside className="w-64 bg-[#2d2d31] text-white h-screen p-4 flex flex-col">
      {/* Logo with icon + gradient text */}
      <div className="flex items-center justify-center gap-2 mb-4 border-b border-gray-700 pb-4">
        {/* <FaSchool className="text-[#d94d59]" size={24} />
        <h1 className="text-xl font-bold">
          <span className="bg-gradient-to-r from-[#d94d59] to-[#e47b4a] bg-clip-text text-transparent">
            School ERP
          </span>
        </h1> */}
      </div>

      <nav className="flex-1 overflow-y-auto">
        {visible.map(group => (
          <div key={group.label} className="mb-1">
            {group.top ? (
              group.items.map(item => (
                <NavLink
                  key={item.code}
                  to={`/${item.code.toLowerCase().replace(/_/g, '-')}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md transition
                    ${isActive ? 'bg-gray-700 border-l-4 border-[#d94d59]' : 'hover:bg-gray-700/50'}`
                  }
                >
                  <group.icon className="text-[#d94d59]" size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))
            ) : (
              <>
                <button
                  onClick={() => toggle(group.label)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-white transition rounded-md hover:bg-gray-700/30"
                >
                  <span className="flex items-center gap-3">
                    <group.icon className="text-[#d94d59]" size={18} />
                    {group.label}
                  </span>
                  {open[group.label] ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                </button>
                {open[group.label] && (
                  <ul className="ml-6 space-y-0.5">
                    {group.items.map(item => {
                      const ItemIcon = item.icon || group.icon;
                      return (
                        <li key={item.code}>
                          <NavLink
                            to={`/${item.code.toLowerCase().replace(/_/g, '-')}`}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition
                              ${isActive ? 'bg-gray-700 border-l-4 border-[#d94d59]' : 'hover:bg-gray-700/50'}`
                            }
                          >
                            <ItemIcon className="text-[#d94d59]" size={14} />
                            <span>{item.label}</span>
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-700 pt-4 text-xs text-gray-500 text-center">
        v1.0.0
      </div>
    </aside>
  );
};

export default Sidebar;