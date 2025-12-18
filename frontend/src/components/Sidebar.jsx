import PropTypes from "prop-types";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

function Sidebar({ isOpen, onToggle, theme = "light" }) {
  const isDark = theme === "dark";

  return (
    <aside
      className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--collapsed"} ${
        isDark ? "sidebar--dark" : ""
      }`}
    >
      <div className="sidebar__header">
        <div className="sidebar__header-content">
          <span className="sidebar__eyebrow">Navigation</span>
          <h2>Control Center</h2>
        </div>
        <button
          type="button"
          className="sidebar__toggle"
          onClick={onToggle}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? "<<" : ">>"}
        </button>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <a key={item.id} href={`#${item.id}`} className="sidebar__nav-item">
            <span className="sidebar__nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="sidebar__nav-label">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  theme: PropTypes.oneOf(["light", "dark"]),
};

export default Sidebar;
