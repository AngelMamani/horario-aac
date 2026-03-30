import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpenText,
  CalendarDays,
  ChartColumnBig,
  Cog,
  GraduationCap,
  LayoutDashboard,
  Users,
  UsersRound,
  Library,
  CalendarCheck,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import logoAac from '../../assets/logo_aac.png'

const menu = [
  { to: '/', label: 'Panel general', icon: LayoutDashboard },
  { to: '/estudiantes', label: 'Estudiantes', icon: Users },
  { to: '/docentes', label: 'Docentes', icon: UsersRound },
  { to: '/horarios', label: 'Horarios', icon: CalendarDays },
  { to: '/gestion-horarios', label: 'Gestión de Horarios', icon: CalendarCheck },
  { to: '/cursos', label: 'Cursos', icon: BookOpenText },
  { to: '/grados', label: 'Grados', icon: GraduationCap },
  { to: '/asignacion-docentes', label: 'Asignación Docentes', icon: Library },
  { to: '/reportes', label: 'Reportes', icon: ChartColumnBig },
  { to: '/configuracion', label: 'Configuración', icon: Cog },
]

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const closeSidebar = () => setIsSidebarOpen(false)

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('mobile-menu-open')
    } else {
      document.body.classList.remove('mobile-menu-open')
    }

    return () => {
      document.body.classList.remove('mobile-menu-open')
    }
  }, [isSidebarOpen])

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${isSidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="brand-card">
          <img className="brand-card__logo" src={logoAac} alt="Escudo del colegio" />
          <div className="brand-block">
            <p className="brand-block__label">I.E.P.</p>
            <h1>Andrés Avelino Cáceres</h1>
            <span>Puerto Maldonado</span>
          </div>
        </div>

        <p className="menu-title">Navegación principal</p>

        <nav aria-label="Navegación principal">
          <ul className="menu-list">
            {menu.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `menu-list__item ${isActive ? 'menu-list__item--active' : ''}`
                  }
                >
                  <MenuLinkIcon icon={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="admin-content">
        <button
          type="button"
          className="hamburger-btn"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          aria-label="Abrir menu"
          aria-expanded={isSidebarOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <Outlet />
      </main>

      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Cerrar menu"
          onClick={closeSidebar}
        />
      )}
    </div>
  )
}

type MenuLinkIconProps = {
  icon: LucideIcon
}

function MenuLinkIcon({ icon: Icon }: MenuLinkIconProps) {
  return (
    <span className="menu-list__icon" aria-hidden="true">
      <Icon size={17} />
    </span>
  )
}
