import React, { useState } from 'react';
import axios from 'axios';

const COLORS = {
  background: '#FDF2F0', 
  primary: '#E57373', 
  success: '#81C784',
  text: '#8D6E63', 
  border: '#FDECE9'
};

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

function Register({ setShowRegister }) {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({ username: '', password: '', name: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // 2. Use the dynamic variable here
      await axios.post(`${API_BASE_URL}/api/register`, formData);
      
      setShowSuccessModal(true); 
      setTimeout(() => {
        setShowSuccessModal(false);
        setShowRegister(false);
      }, 2500);
    } catch (err) { 
      setShowErrorModal(true); 
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h2 style={{color: COLORS.primary, marginBottom: '20px', fontWeight: '600'}}>Create Account</h2>
        <form onSubmit={handleRegister}>
          <input name="username" placeholder="Username" onChange={handleChange} style={inputStyle} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} style={inputStyle} required />
          <hr style={{margin: '20px 0', opacity: 0.1}} />
          <input name="name" placeholder="Full Name" onChange={handleChange} style={inputStyle} required />
          <button type="submit" style={buttonStyle}>Register</button>
        </form>
        <p style={{marginTop: '20px', color: COLORS.text, fontSize: '14px'}}>
          Already have an account? <span onClick={() => setShowRegister(false)} style={linkStyle}>Login</span>
        </p>
      </div>

      {/* --- Theme-Colored Success Modal --- */}
      {showSuccessModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{...iconCircle, background: '#E8F5E9', color: COLORS.success}}>✓</div>
            <h3 style={{ color: COLORS.success, margin: '10px 0' }}>Success!</h3>
            <p style={{ color: COLORS.text, margin: 0, fontSize: '14px' }}>Account created successfully.</p>
          </div>
        </div>
      )}

      {/* --- Theme-Colored Error Modal --- */}
      {showErrorModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{...iconCircle, background: '#FDECE9', color: COLORS.primary}}>⚠️</div>
            <h3 style={{ color: COLORS.primary, margin: '10px 0' }}>Registration Failed</h3>
            <p style={{ color: COLORS.text, marginBottom: '20px', fontSize: '14px' }}>Please check your credentials and try again.</p>
            <button onClick={() => setShowErrorModal(false)} style={modalConfirmBtn}>Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles based on your existing theme ---
const wrapperStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: COLORS.background, padding: '20px' };
const cardStyle = { background: 'white', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 30px rgba(229, 115, 115, 0.1)' };
const inputStyle = { width: '100%', padding: '15px', margin: '8px 0', borderRadius: '15px', border: `2px solid ${COLORS.border}`, boxSizing: 'border-box', outline: 'none', fontSize: '16px' };
const buttonStyle = { width: '100%', padding: '15px', background: COLORS.primary, color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '15px' };
const linkStyle = { color: COLORS.primary, cursor: 'pointer', fontWeight: '600' };

// Modal styles matching image_d03ee2.png
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(141, 110, 99, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 };
const modalBoxStyle = { background: 'white', padding: '30px', borderRadius: '30px', textAlign: 'center', maxWidth: '340px', width: '90%', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' };
const iconCircle = { width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '30px' };
const modalConfirmBtn = { background: COLORS.primary, color: 'white', border: 'none', padding: '10px 30px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };

export default Register;