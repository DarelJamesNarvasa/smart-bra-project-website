// client/src/components/Dashboard.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Consistent color palette
const COLORS = {
  primary: '#E57373',
  secondary: '#81C784',
  tertiary: '#64B5F6',
  text: '#8D6E63',
  white: '#FFFFFF'
};

const Dashboard = ({ healthData, history, exportToCSV }) => {
  return (
    <div style={dashboardContainerStyle}>
      {/* Header with a personal greeting and the Export button */}
      <div style={headerStyle}>
        <div>
            <h1 style={titleStyle}>Welcome back, Jane!</h1>
            <p style={subtitleStyle}>Here's your health summary for today.</p>
        </div>
        <button onClick={exportToCSV} style={exportButtonStyle}>Export History</button>
      </div>

      {/* Health Data Cards */}
      <div style={cardsContainerStyle}>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Heart Rate</h3>
          <p style={{ ...valueStyle, color: COLORS.primary }}>{healthData.heart_rate} <small style={{fontSize: '14px'}}>BPM</small></p>
          <div style={statusStyle}>● LIVE</div>
        </div>

        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Lungs</h3>
          <p style={{ ...valueStyle, color: COLORS.secondary }}>{healthData.lung_status}</p>
          <div style={statusStyle}>● STABLE</div>
        </div>

        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Respiration</h3>
          <p style={{ ...valueStyle, color: COLORS.tertiary }}>{healthData.resp_rate} <small style={{fontSize: '14px'}}>BrPM</small></p>
          <div style={statusStyle}>● NORMAL</div>
        </div>
      </div>

      {/* Chart Card */}
      <div style={chartCardStyle}>
        <h3 style={cardTitleStyle}>Heart Rate Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEEEEE" />
            <XAxis dataKey="time" stroke="#BDBDBD" fontSize={12} />
            <YAxis stroke="#BDBDBD" fontSize={12} />
            <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
            <Line
              type="monotone"
              dataKey="hr"
              stroke={COLORS.primary}
              strokeWidth={4}
              dot={{ r: 4, fill: COLORS.primary }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Styles ---
const dashboardContainerStyle = {
    flex: 1, // Take up all remaining space next to the sidebar
    padding: '40px',
    marginLeft: '260px', // Add margin equal to the sidebar width
    backgroundColor: '#FDF2F0', // The main soft pink background
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px'
}

const titleStyle = {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: '32px',
    margin: '0'
};

const subtitleStyle = {
    color: '#BDBDBD',
    fontSize: '16px',
    margin: '10px 0 0 0'
}

const exportButtonStyle = {
    padding: '12px 24px',
    backgroundColor: '#B2DFDB',
    color: '#00695C',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: '0 4px 10px rgba(0, 105, 92, 0.1)'
};

const cardsContainerStyle = {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
    marginBottom: '40px'
};

const cardStyle = {
  padding: '30px',
  background: COLORS.white,
  borderRadius: '24px',
  boxShadow: '0 10px 25px rgba(229, 115, 115, 0.1)',
  flex: '1 1 250px', // Allow cards to be responsive
  transition: 'transform 0.2s'
};

const cardTitleStyle = { color: COLORS.text, fontWeight: '400', margin: '0', fontSize: '18px' };
const valueStyle = { fontSize: '38px', fontWeight: '600', margin: '15px 0' };
const statusStyle = { fontSize: '12px', color: '#BDBDBD', fontWeight: '500' };

const chartCardStyle = {
    ...cardStyle,
    padding: '40px',
    maxWidth: 'none' // The chart card should take full width
};

export default Dashboard;