import React, { useState } from 'react';
import axios from 'axios';

const Profile = ({ user, setUser, setView }) => {
    const [formData, setFormData] = useState(user || {});
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(user?.profilePicture ? `http://localhost:5001/uploads/${user.profilePicture}` : null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let profilePicture = formData.profilePicture;
            
            // --- FIX: Form Data Image Upload ---
            if (selectedImage) {
                const imgData = new FormData();
                imgData.append('profileImage', selectedImage);
                const uploadRes = await axios.post('http://localhost:5001/api/upload', imgData);
                profilePicture = uploadRes.data.filename;
            }

            const res = await axios.put('http://localhost:5001/api/profile', { id: user._id, ...formData, profilePicture });
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            alert("Profile Saved!");
        } catch (err) { alert("Error updating profile. Check server console."); }
    };

    return (
        <div style={{ background: 'white', padding: '30px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', maxWidth: '450px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', color: '#E57373' }}>Profile Settings</h2>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img src={preview || "https://i.pravatar.cc/150?u=jane"} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #FDECE9' }} alt="User" />
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="file" onChange={handleImageChange} style={{ fontSize: '12px' }} />
                <input placeholder="Full Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
                <input placeholder="Age" type="number" value={formData.age || ''} onChange={e => setFormData({...formData, age: e.target.value})} style={inputStyle} />
                <input placeholder="Height" value={formData.height || ''} onChange={e => setFormData({...formData, height: e.target.value})} style={inputStyle} />
                <input placeholder="Weight" value={formData.weight || ''} onChange={e => setFormData({...formData, weight: e.target.value})} style={inputStyle} />
                <button type="submit" style={{ background: '#E57373', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
            </form>
        </div>
    );
};

const inputStyle = { padding: '12px', borderRadius: '12px', border: '2px solid #FDECE9', outline: 'none' };
export default Profile;