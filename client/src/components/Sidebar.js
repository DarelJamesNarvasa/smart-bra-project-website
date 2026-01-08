// client/src/components/Sidebar.js
import React from 'react';

// Color palette matching your app's theme
const COLORS = {
  primary: '#E57373',    // Soft Coral/Red for active items
  text: '#8D6E63',       // Warm Brown-Grey for text
  sidebarBg: '#F8E1DE',  // A slightly darker pink for the sidebar background
  white: '#FFFFFF'
};

const Sidebar = ({ handleLogout }) => {
  return (
    <div style={sidebarStyle}>
      {/* Profile Section */}
      <div style={profileSectionStyle}>
        <img
          src="https://i.pravatar.cc/150?img=35" // Placeholder profile image for a female user
          alt="Profile"
          style={profileImageStyle}
        />
        <h3 style={profileNameStyle}>Jane Doe</h3>
        <p style={profileRoleStyle}>Patient</p>
      </div>

      {/* Navigation Links */}
      <ul style={navListStyle}>
        <li style={activeNavItemStyle}>
          <span style={iconStyle}>📊</span> Dashboard
        </li>
        {/* These are placeholders for future pages */}
        <li style={navItemStyle}>
          <span style={iconStyle}>📅</span> History
        </li>
        <li style={navItemStyle}>
          <span style={iconStyle}>👤</span> Profile
        </li>
      </ul>

      {/* Logout Button at the bottom */}
      <div style={logoutSectionStyle}>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          <span style={iconStyle}>🚪</span> Logout
        </button>
      </div>
    </div>
  );
};

// --- Styles ---
const sidebarStyle = {
  width: '260px',
  height: '100vh', // Full viewport height
  backgroundColor: COLORS.sidebarBg,
  padding: '30px',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed', // Fix the sidebar to the left
  left: 0,
  top: 0,
  boxShadow: '2px 0 10px rgba(229, 115, 115, 0.1)',
  zIndex: 100
};

const profileSectionStyle = {
  textAlign: 'center',
  marginBottom: '50px'
};

const profileImageStyle = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  objectFit: 'cover',
  marginBottom: '15px',
  boxShadow: '0 5px 15px rgba(229, 115, 115, 0.2)',
  border: `3px solid ${COLORS.white}`
};

const profileNameStyle = {
  color: COLORS.text,
  fontWeight: '600',
  fontSize: '20px',
  margin: '0'
};

const profileRoleStyle = {
    color: '#BDBDBD',
    fontSize: '14px',
    margin: '5px 0 0 0'
}

const navListStyle = {
  listStyle: 'none',
  padding: '0',
  margin: '0',
  flex: 1 // This will push the logout button to the bottom
};

const navItemStyle = {
  padding: '15px 20px',
  borderRadius: '15px',
  marginBottom: '10px',
  color: COLORS.text,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.2s',
  fontWeight: '500',
  fontSize: '16px'
};

// Style for the currently active link
const activeNavItemStyle = {
  ...navItemStyle,
  backgroundColor: COLORS.white,
  color: COLORS.primary,
  boxShadow: '0 5px 15px rgba(229, 115, 115, 0.15)'
};

const iconStyle = {
  marginRight: '15px',
  fontSize: '20px'
};

const logoutSectionStyle = {
    marginTop: 'auto'
}

const logoutButtonStyle = {
  ...navItemStyle,
  width: '100%',
  border: 'none',
  backgroundColor: 'transparent',
  textAlign: 'left',
  fontSize: '16px'
}

export default Sidebar;