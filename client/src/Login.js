import React, { useState } from 'react';
import axios from 'axios';

const COLORS = {
  background: '#FDF2F0',
  primary: '#E57373',
  text: '#8D6E63',
  white: '#FFFFFF',
  border: '#FDECE9'
};

function Login({ setToken, setShowRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/login', { username, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      setShowErrorModal(true);
    }
  };

  return (
    <div style={authWrapperStyle}>
      <div style={authCardStyle}>
        <h2 style={{ color: COLORS.primary, marginBottom: '10px', fontWeight: '600' }}>Welcome Back</h2>
        <p style={{ color: COLORS.text, marginBottom: '30px', fontSize: '14px' }}>Log in to monitor your health data</p>
        
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Username" 
            onChange={e => setUsername(e.target.value)} 
            style={inputStyle} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            onChange={e => setPassword(e.target.value)} 
            style={inputStyle} 
            required 
          />
          <button type="submit" style={buttonStyle}>Login</button>
        </form>

        <p style={{ marginTop: '25px', color: COLORS.text, fontSize: '14px' }}>
          Don't have an account? 
          <span onClick={() => setShowRegister(true)} style={linkStyle}> Sign Up</span>
        </p>
      </div>

      {/* --- THEME-COLORED MODAL --- */}
      {showErrorModal && (
        <div style={modalOverlayStyle}>
          <div style={themeModalBoxStyle}>
            {/* Warning Icon with Theme Background */}
            
            <h3 style={{ color: COLORS.primary, margin: '0 0 10px 0' }}>Login Failed</h3>
            <p style={{ color: COLORS.text, margin: '0 0 25px 0', fontSize: '14px', lineHeight: '1.5' }}>
              Please check your username and password and try again.
            </p>
            
            <button 
              onClick={() => setShowErrorModal(false)}
              style={{ 
                ...buttonStyle, 
                marginTop: 0, 
                width: 'auto', 
                padding: '10px 40px' 
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const authWrapperStyle = {
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  minHeight: '100vh', backgroundColor: COLORS.background, padding: '20px'
};

const authCardStyle = {
  background: COLORS.white, padding: '40px', borderRadius: '30px',
  width: '100%', maxWidth: '400px', textAlign: 'center',
  boxShadow: '0 10px 30px rgba(229, 115, 115, 0.1)'
};

const inputStyle = {
  width: '100%', padding: '15px', margin: '10px 0', borderRadius: '15px',
  border: `2px solid ${COLORS.border}`, fontSize: '16px', outline: 'none',
  boxSizing: 'border-box', color: COLORS.text
};

const buttonStyle = {
  width: '100%', padding: '15px', backgroundColor: COLORS.primary,
  color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer',
  fontWeight: 'bold', fontSize: '16px', marginTop: '15px',
  boxShadow: '0 5px 15px rgba(229, 115, 115, 0.3)'
};

const linkStyle = { color: COLORS.primary, cursor: 'pointer', fontWeight: '600', marginLeft: '5px' };

// --- New Theme Modal Styles ---
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(141, 110, 99, 0.4)', // Uses your text color with transparency for the backdrop
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000
};

const themeModalBoxStyle = {
  background: COLORS.white, 
  padding: '30px', 
  borderRadius: '30px', // Matches your main card's roundness
  textAlign: 'center', 
  maxWidth: '340px', 
  width: '90%',
  boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
  border: `2px solid ${COLORS.border}`
};

export default Login;