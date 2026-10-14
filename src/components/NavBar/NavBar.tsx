import style from "./navBar.module.css";

import { NavLink } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className={style.nav} aria-label="Розділи">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive ? `${style.link} ${style.active}` : style.link
        }
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
        <span>Календар</span>
      </NavLink>

      <NavLink
        to="/progress"
        end
        className={({ isActive }) =>
          isActive ? `${style.link} ${style.active}` : style.link
        }
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6" />
        </svg>
        <span>Прогрес</span>
      </NavLink>

      <NavLink
        to="/add"
        end
        className={({ isActive }) =>
          isActive ? `${style.plus} ${style.activePlus}` : style.plus
        }
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </NavLink>

      <NavLink
        to="/summary"
        end
        className={({ isActive }) =>
          isActive ? `${style.link} ${style.active}` : style.link
        }
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M3 10h18M3 15h18M10 4v16" />
        </svg>
        <span>Підсумок</span>
      </NavLink>

      <NavLink
        to="/exercises"
        end
        className={({ isActive }) =>
          isActive ? `${style.link} ${style.active}` : style.link
        }
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12" />
        </svg>
        <span>Вправи</span>
      </NavLink>
    </nav>
  );
};

export default NavBar;
