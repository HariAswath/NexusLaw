// src/components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdGavel, MdAddCircle, MdSearch,
  MdLinkOff, MdPeople, MdLogout, MdBalance, MdAutoAwesome, MdHelpCenter, MdSupportAgent
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard',  icon: <MdDashboard />,  label: 'Dashboard' },
  { to: '/cases',      icon: <MdGavel />,       label: 'Cases' },
  { to: '/cases/search', icon: <MdSearch />,    label: 'Search & Filter' },
  { to: '/draft-assistant', icon: <MdAutoAwesome />, label: 'AI Assistant' },
  { to: '/support',         icon: <MdHelpCenter />,  label: 'Help & Support' },
];

const ADMIN_NAV = [
  { to: '/cases/new',     icon: <MdAddCircle />,   label: 'Add Case' },
  { to: '/admin/support', icon: <MdSupportAgent />, label: 'Support Desk' },
];

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <MdBalance />
        </div>
        <div>
          <div className="sidebar-logo-text">NexusLaw</div>
          <div className="sidebar-logo-sub">Legal Intelligence</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Main Menu</span>

        {NAV.map(({ to, icon, label }) => {
          // Hide "Help & Support" from Admin Main Menu since they have Support Desk
          if (isAdmin && label === 'Help & Support') return null;
          
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-item-icon">{icon}</span>
              {label}
            </NavLink>
          );
        })}

        {isAdmin && (
          <>
            <span className="nav-section-label">Admin</span>
            {ADMIN_NAV.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-item-icon">{icon}</span>
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User Card */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {user?.name?.charAt(0) ?? 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div className="user-role">
              {user?.role === 'admin' ? 'Administrator' : 'Legal User'}
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <MdLogout />
          </button>
        </div>
      </div>
    </aside>
  );
}
