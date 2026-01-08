import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Login from './Login';
import Register from './Register';
import Profile from './components/Profile';

import heartIcon from './assets/icons/heart.png';
import lungsIcon from './assets/icons/lungs.png';
import respirationIcon from './assets/icons/respiration.png';
import dashboardIcon from './assets/icons/monitor.png';
import historyIcon from './assets/icons/history.png';
import logoutIcon from './assets/icons/logout.png';

const COLORS = { background: '#f9f9f9ff', sidebar: '#FDECE9', primary: '#E57373', secondary: '#81C784', text: '#000000ff' };
const socket = io('http://localhost:5001');

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(141, 110, 99, 0.4)', // Uses theme text color for the backdrop
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000,
  padding: '20px'
};

const themeModalBoxStyle = {
  background: 'white', 
  padding: '35px 30px', 
  borderRadius: '30px', // Matches card roundness
  textAlign: 'center', 
  maxWidth: '360px', 
  width: '100%',
  boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
  border: `2px solid ${COLORS.border}`
};

const iconCircleStyle = {
  width: '70px', height: '70px', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0 auto', fontSize: '35px'
};



function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);
  const [view, setView] = useState('dashboard'); 
  const [healthData, setHealthData] = useState({ heart_rate: 0, resp_rate: 0, lung_status: "Waiting..." });
  const [history, setHistory] = useState([]);
  const [isDeviceOnline, setIsDeviceOnline] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [historyData, setHistoryData] = React.useState([]);
  const [filterDate, setFilterDate] = useState(""); // Stores selected YYYY-MM-DD
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true); // Open the theme-colored warning modal
  };

  const confirmDelete = async () => {
    try {
      await axios.delete('http://localhost:5001/api/history');
      setHistoryData([]); // Clear the history table in real-time
      setShowDeleteModal(false); // Close warning modal
      setShowSuccessModal(true); // Open theme-colored success modal

      // Success modal auto-fades after 2.5 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2500);

    } catch (err) {
      console.error("Delete failed:", err);
      // You could also add a theme-colored Error modal here
    }
  };

  const deleteAllHistory = async () => {
      // 1. Popup Confirmation
      const isConfirmed = window.confirm("Are you sure you want to delete all health records? This action cannot be undone.");

      if (isConfirmed) {
        try {
          // 2. Send DELETE request to your modified backend route
          // Note: No 'userId' is needed since your backend now uses HealthData.deleteMany({})
          await axios.delete('http://localhost:5001/api/history');

          // 3. Update UI state immediately
          setHistoryData([]); 
          alert("All health records have been cleared successfully.");
        } catch (err) {
          console.error("Error deleting history:", err);
          alert("Failed to clear history. Please ensure the server is running.");
        }
      }
    };

    const exportToCSV = () => {
      // 1. Filter the data based on your selected date
      const dataToExport = historyData.filter(item => {
        if (!filterDate) return true;
        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
        return itemDate === filterDate;
      });

      // 2. Alert if no data matches the current filter
      if (dataToExport.length === 0) {
        alert("No data to export for this selection");
        return;
      }

      // 3. Define CSV headers (must match the number of columns in rows)
      const headers = ["Time", "Heart Rate (BPM)", "Respiration (BrPM)", "Lungs Status"];
      
      // 4. Format the rows using the filtered dataToExport
      const rows = dataToExport.map(record => [
        `"${new Date(record.timestamp).toLocaleString()}"`, // Wrap in quotes to handle commas in dates
        record.heart_rate,
        record.resp_rate || 0,
        `"${record.lung_status}"`
      ]);

      // Combine headers and rows into a single string
      const csvContent = [
        headers.join(","), 
        ...rows.map(row => row.join(","))
      ].join("\n");

      // 5. Create a blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
    
    // File name includes the date if a filter is active
    const fileNameDate = filterDate || new Date().toLocaleDateString();
    link.setAttribute("download", `Amuma_Health_History_${fileNameDate}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up memory
  };
    
  useEffect(() => {
    if (token) {
      // 1. Consolidated Data Listener
      socket.on('smart_bra_data', (data) => {
        setHealthData(data);
        setIsDeviceOnline(true);
        
        // Update history with both Heart Rate and Respiration for the graphs
        setHistory(prev => {
          const newData = [
            ...prev, 
            { 
              time: new Date().toLocaleTimeString(), 
              hr: data.heart_rate, 
              resp: data.resp_rate // Essential for the respiration graph to work
            }
          ];
          // Keep last 20-30 points to see the "up and down" wave effect
          return newData.slice(-30); 
        });
      });

      // 2. Device Status Listener
      socket.on('device_status', (status) => {
        setIsDeviceOnline(status.deviceOnline);
      });
    }

    // 3. Clean Cleanup Function
    return () => {
      socket.off('smart_bra_data');
      socket.off('device_status');
    };
  }, [token]); // Runs whenever token changes

  
  useEffect(() => {
    // Only fetch when the user actually clicks the History tab
    if (view === 'history') {
        axios.get('http://localhost:5001/api/history')
            .then(res => {
                console.log("History data received:", res.data); // Log this to check your console
                setHistoryData(res.data);
            })
            .catch(err => console.error("Error fetching history:", err));
    }
  }, [view]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!token) {
    return showRegister ? 
      <Register setShowRegister={setShowRegister} /> : 
      <Login setToken={setToken} setUser={setUser} setShowRegister={setShowRegister} />;
  }

  

  return (
    <div className="app-layout">
      <style>{`
        .app-layout { display: flex; min-height: 100vh; background: ${COLORS.background}; font-family: 'Segoe UI', sans-serif; }
        
        .sidebar { 
          width: 260px; background: ${COLORS.sidebar}; padding: 30px; 
          display: flex; flex-direction: column; position: fixed; height: 100vh;
          box-sizing: border-box; z-index: 1000; transition: 0.3s;
        }

        .main-content { 
          flex: 1; margin-left: 260px; padding: 40px; 
          display: flex; flex-direction: column; align-items: center; 
          width: calc(100% - 260px); 
        }

        .dashboard-wrapper { max-width: 1000px; width: 100%; }

        .mobile-toggle { 
          display: none; position: fixed; top: 20px; left: 20px; z-index: 2000; 
          background: ${COLORS.primary}; color: white; border: none; padding: 10px; border-radius: 8px;
        }

        @media (max-width: 992px) {
          .mobile-toggle { display: block; }
          .sidebar { left: ${isMobileMenuOpen ? '0' : '-100%'}; width: 250px; }
          .main-content { margin-left: 0; width: 100%; padding-top: 80px; }
        }
      `}</style>

      <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      <aside className="sidebar">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {/* <img 
            src={user?.profilePicture ? `http://localhost:5001/uploads/${user.profilePicture}` : "https://i.pravatar.cc/150?u=jane"} 
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white' }} 
            alt="User" 
          /> */}
          <h3 style={{ 
              color: '#8D6E63', // This matches the brown/primary color used in your dashboard cards
              marginTop: '10px',
              fontWeight: 'bold'
          }}>
              Amuma Smart Bra
          </h3>
        </div>

        <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
          <li 
            style={{ cursor: 'pointer', padding: '12px', background: view === 'dashboard' ? 'white' : 'transparent', borderRadius: '12px', color: view === 'dashboard' ? COLORS.primary : COLORS.text }} 
            onClick={() => {
              setView('dashboard');
              setIsMobileMenuOpen(false); // AUTO-CLOSE SIDEBAR
            }}
          >
            <img src={dashboardIcon} alt="Dashboard" style={{ width: '20px', height: '20px' }} /> Dashboard
          </li>

          <li 
            style={{ cursor: 'pointer', padding: '12px', background: view === 'history' ? 'white' : 'transparent', borderRadius: '12px', marginTop: '10px', color: view === 'history' ? COLORS.primary : COLORS.text, display: 'flex', alignItems: 'center', gap: '10px' }} 
            onClick={() => {
              setView('history');
              setIsMobileMenuOpen(false); // AUTO-CLOSE SIDEBAR
            }}
          >
            <img src={historyIcon} alt="History" style={{ width: '20px', height: '20px' }} /> History
          </li>

          <li 
            style={{ cursor: 'pointer', padding: '12px', borderRadius: '12px', marginTop: '10px', color: COLORS.text, display: 'flex', alignItems: 'center', gap: '10px' }} 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
              setIsMobileMenuOpen(false); // AUTO-CLOSE SIDEBAR
            }}
          >
            <img src={logoutIcon} alt="Logout" style={{ width: '20px', height: '20px' }} /> Logout
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="dashboard-wrapper">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            {/* <h1 style={{ color: COLORS.text, margin: 0 }}>Health Data</h1> */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isDeviceOnline ? COLORS.secondary : COLORS.primary }}></div>
              <span style={{ fontSize: '14px' }}>{isDeviceOnline ? 'Online' : 'Offline'}</span>
            </div>
          </header>

          {/* --- CONDITIONAL VIEW RENDERING --- */}
          {view === 'dashboard' && (
            <div style={{ width: '100%' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '20px', 
                width: '100%' 
              }}>
                
                {/* --- Heart Rate Card --- */}
                <div style={{ ...cardStyle, textAlign: 'left', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ background: '#FDF2F0', padding: '8px', borderRadius: '12px' }}>
                      <img src={heartIcon} alt="Heart" style={{ width: '20px', height: '20px' }} />
                    </div>
                    <h4 style={{ margin: 0, color: COLORS.text, fontSize: '14px' }}>Heart Rate</h4>
                  </div>
                  
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>
                    {healthData.heart_rate}<span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>/BPM</span>
                  </div>

                  {/* Real-time Mini Graph for Heart Rate */}
                  {/* --- Heart Rate Card Graph --- */}
                  <div style={{ height: '80px', marginTop: '10px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} /> 
                        <Line 
                          type="linear" // CHANGE THIS: 'linear' creates sharp peaks like a heartbeat
                          dataKey="hr" 
                          stroke={COLORS.primary} 
                          strokeWidth={2.5} // Thinner line looks more like a medical monitor
                          dot={false} 
                          isAnimationActive={true}
                          animationDuration={200} // Faster duration for a "snappy" heart pulse effect
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* --- Lungs Card --- */}
                <div style={{ ...cardStyle, textAlign: 'left', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ background: '#FDF2F0', padding: '8px', borderRadius: '12px' }}>
                      <img src={lungsIcon} alt="Lungs" style={{ width: '24px', height: '24px' }} />
                    </div>
                    <h4 style={{ margin: 0, color: COLORS.text, fontSize: '14px' }}>Lungs</h4>
                  </div>
                  <div style={{ 
                    fontSize: '32px', 
                    color: healthData.lung_status === 'Clear' ? '#4CAF50' : COLORS.secondary, 
                    marginTop: '10px', 
                    fontWeight: 'bold' 
                  }}>
                    {healthData.lung_status || "Waiting..."}
                  </div>
                  {/* Spacer to keep card heights consistent with the graphs */}
                  <div style={{ height: '80px', marginTop: '10px' }}></div>
                </div>

                {/* --- Respiration Card --- */}
                <div style={{ ...cardStyle, textAlign: 'left', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ background: '#FDF2F0', padding: '8px', borderRadius: '12px' }}>
                      <img src={respirationIcon} alt="Respiration" style={{ width: '24px', height: '24px' }} />
                    </div>
                    <h4 style={{ margin: 0, color: COLORS.text, fontSize: '14px' }}>Respiration</h4>
                  </div>
                  
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>
                    {healthData.resp_rate}<span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>/BrPM</span>
                  </div>

                  {/* Real-time Mini Graph for Respiration */}
                  <div style={{ height: '80px', marginTop: '10px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        {/* 1. Dynamic Domain: This 'zooms' the graph to the data's current range */}
                        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} /> 
                        
                        <Line 
                          type="monotone" 
                          dataKey="resp" // CHANGED from "hr" to "resp"
                          stroke="#64B5F6" 
                          strokeWidth={3} 
                          dot={false} 
                          isAnimationActive={true} 
                          animationDuration={400} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          )}

          {view === 'profile' && <Profile user={user} setUser={setUser} setView={setView} />}

          {view === 'history' && (
            <div style={{ 
              background: 'white', 
              padding: isMobile ? '15px' : '30px', 
              borderRadius: '24px', 
              width: '100%', 
              maxWidth: '1000px', 
              boxShadow: '0 10px 20px rgba(0,0,0,0.03)',
              margin: '0 auto' 
            }}>
              
            {/* Header Section with Responsive Buttons */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <h2 style={{ color: COLORS.primary, margin: 0, fontSize: isMobile ? '18px' : '24px' }}>
                Health History
              </h2>

              <div style={{ display: 'flex', gap: '10px' }}>
                {/* Delete All Button */}
                <button 
                  onClick={handleDeleteClick}
                  style={{ 
                    background: '#f7f5f5ff', // Red for danger/delete
                    color: 'black', 
                    border: 'none', 
                    padding: isMobile ? '10px' : '10px 20px', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: isMobile ? '44px' : 'auto'
                  }}
                  title="Delete All Data"
                >
                  <span style={{ fontSize: isMobile ? '18px' : '16px' }}>🗑️</span>
                  {!isMobile && <span>Delete All</span>}
                </button>

                {/* Export Button */}
                <button 
                  onClick={exportToCSV}
                  style={{ 
                    background: '#f7f5f5ff', 
                    color: 'black', 
                    border: 'none', 
                    padding: isMobile ? '10px' : '10px 20px', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: isMobile ? '44px' : 'auto'
                  }}
                  title="Export CSV"
                >
                  <span style={{ fontSize: isMobile ? '18px' : '16px' }}>📥</span>
                  {!isMobile && <span>Export CSV</span>}
                </button>
              </div>
            </div>

              {/* Filter Section */}
              <div style={{ 
                marginBottom: '20px', 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: '10px' 
              }}>
                <label style={{ color: COLORS.text, fontWeight: 'bold' }}>Filter by Date:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
                  <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      border: `2px solid ${COLORS.background}`, 
                      outline: 'none',
                      flex: isMobile ? 1 : 'none',
                      fontSize: '14px'
                    }}
                  />
                  {filterDate && (
                    <button 
                      onClick={() => setFilterDate("")} 
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: COLORS.primary, 
                        cursor: 'pointer',
                        fontSize: '18px' 
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Table Wrapper */}
              <div style={{ 
                maxHeight: isMobile ? '400px' : '500px', 
                overflowX: 'auto', 
                overflowY: 'auto',   
                paddingRight: '5px',
                border: `1px solid ${COLORS.background}`,
                borderRadius: '12px'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  textAlign: 'left', 
                  minWidth: isMobile ? '600px' : 'auto' 
                }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                    <tr style={{ borderBottom: `2px solid ${COLORS.background}`, color: COLORS.lightText }}>
                      <th style={{ padding: isMobile ? '10px' : '15px' }}>Time</th>
                      <th style={{ padding: isMobile ? '10px' : '15px' }}>Heart Rate</th>
                      <th style={{ padding: isMobile ? '10px' : '15px' }}>Respiration</th>
                      <th style={{ padding: isMobile ? '10px' : '15px' }}>Lungs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData
                      .filter(item => {
                        if (!filterDate) return true;
                        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
                        return itemDate === filterDate;
                      })
                      .length > 0 ? historyData
                      .filter(item => {
                        if (!filterDate) return true;
                        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
                        return itemDate === filterDate;
                      })
                      .map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f9f9f9', color: COLORS.text }}>
                          <td style={{ padding: isMobile ? '10px' : '15px', fontSize: isMobile ? '12px' : '14px' }}>
                            {new Date(item.timestamp).toLocaleString()}
                          </td>
                          <td style={{ padding: isMobile ? '10px' : '15px' }}>{item.heart_rate} BPM</td>
                          <td style={{ padding: isMobile ? '10px' : '15px' }}>{item.resp_rate || 0} BrPM</td>
                          <td style={{ padding: isMobile ? '10px' : '15px' }}>{item.lung_status}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: COLORS.lightText }}>
                            No records found for the selected criteria.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Custom Confirmation Modal */}
          {showDeleteModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', zIndex: 3000,
              padding: '20px'
            }}>
              <div style={{
                background: 'white', padding: '30px', borderRadius: '24px',
                maxWidth: '400px', width: '100%', textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: '50px', marginBottom: '20px' }}>⚠️</div>
                <h3 style={{ margin: '0 0 10px 0', color: COLORS.text }}>Clear All History?</h3>
                <p style={{ color: '#666', marginBottom: '30px', lineHeight: '1.5' }}>
                  This will permanently delete all health records from the database. This action cannot be undone.
                </p>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                      background: '#f0f0f0', cursor: 'pointer', fontWeight: 'bold' 
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                      background: '#FF5252', color: 'white', cursor: 'pointer', fontWeight: 'bold' 
                    }}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Success Modal */}
          {showSuccessModal && (
            <div style={modalOverlayStyle}>
              <div style={themeModalBoxStyle}>
                {/* Success Checkmark in Light Green Circle */}
                <div style={{ ...iconCircleStyle, background: '#E8F5E9', color: '#81C784' }}>
                  ✓
                </div>
                
                <h3 style={{ color: '#81C784', margin: '15px 0 5px 0', fontWeight: '600' }}>
                  Success!
                </h3>
                <p style={{ color: COLORS.text, margin: 0, fontSize: '14px' }}>
                  Data cleared successfully.
                </p>
              </div>
            </div>
          )}

        </div>
      </main> 
    </div>
  );
}

const cardStyle = { background: 'white', padding: '25px', borderRadius: '24px', textAlignment: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };

export default App;