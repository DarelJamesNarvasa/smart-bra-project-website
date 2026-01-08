const express = require('express');
const http = require('http');
const mqtt = require('mqtt');
const { Server } = require('socket.io'); 
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Single declaration at the top

// // Add this at the top of your component
// const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

// // Then update your login/signup calls:
// const handleLogin = async (e) => {
//   e.preventDefault();
//   try {
//     // Change this line to use the variable
//     const res = await axios.post(`${API_URL}/api/login`, { username, password });
//     // ... rest of your code
//   } catch (err) { console.error("Login Error:", err); }
// };

const helmet = require('helmet');
app.use(helmet());

const app = express();
app.use(cors({
    // Include BOTH your custom domain and the project-specific Vercel domain
    origin: [
      "https://smart-bra-project-website.vercel.app", 
      "https://smart-bra-project-website-dareljamesnarvasas-projects.vercel.app",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());


// --- AUTO-CREATE UPLOADS FOLDER ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log("Created missing 'uploads' directory.");
}
app.use('/uploads', express.static(uploadDir));

const server = http.createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: [
            "https://smart-bra-project-website.vercel.app", 
            "https://smart-bra-project-website-dareljamesnarvasas-projects.vercel.app",
            "http://localhost:3000"
        ],
        methods: ["GET", "POST"],
        credentials: true
    } 
});

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartbra';

mongoose.connect(mongoURI)
    .then(() => console.log("Connected to MongoDB Successfully"))
    .catch(err => console.error("MongoDB Error:", err));


mongoose.connection.on('error', err => console.error("Mongoose connection error:", err));
mongoose.connection.on('disconnected', () => console.log("Mongoose disconnected"));


// --- Schemas (Models must be defined before use) ---
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, default: "" },
}));

const HealthData = mongoose.model('HealthData', new mongoose.Schema({
    heart_rate: Number,
    resp_rate: Number,
    lung_status: String,
    timestamp: { type: Date, default: Date.now }
}));

// --- MQTT BRIDGE ---
const client = mqtt.connect('mqtt://broker.emqx.io:1883');
client.on('connect', () => {
    console.log("Connected to EMQX Broker");
    client.subscribe('amuma/smartbra/data');
});

client.on('message', async (topic, message) => { 
    try {
        const data = JSON.parse(message.toString());
        // Save to Database
        await new HealthData(data).save(); 
        // Emit to Dashboard
        io.emit('smart_bra_data', { ...data, deviceOnline: true }); 
        console.log("Data saved and sent to UI:", data);
    } catch (e) { console.log("MQTT Error:", e); }
});

// --- Multer Config ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// --- API Routes ---
app.post('/api/upload', upload.single('profileImage'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file" });
    res.json({ filename: req.file.filename });
});

// --- Register Routes ---
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, name, age, height, weight } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await new User({ username, password: hashedPassword, name}).save();
        res.json({ message: "User Registered Successfully" });
    } catch (err) { res.status(500).json({ error: "Registration failed." }); }
});

// --- Login Routes
app.post('/api/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'amuma_secret_key', { expiresIn: '1h' });
        res.json({ token, user });
    } else { res.status(401).json({ message: "Invalid credentials" }); }
});
    
// --- Profile Route ---
app.put('/api/profile', async (req, res) => {
    try {
        const { id, name, age, height, weight, profilePicture } = req.body;
        const updatedUser = await User.findByIdAndUpdate(id, { name, age, height, weight, profilePicture }, { new: true });
        res.json({ message: "Updated", user: updatedUser });
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

// --- History Route ---
app.get('/api/history', async (req, res) => {
    try {
        const data = await HealthData.find().sort({ timestamp: -1 }).limit(50);
        res.json(data);
    } catch (err) { res.status(500).json({ error: "Failed to fetch history" }); }
});

// This route is now protected by authenticateToken
app.delete('/api/history', async (req, res) => {
  try {
    // deleteMany({}) without a filter removes every document in the collection
    const result = await HealthData.deleteMany({}); 
    
    res.json({ 
      message: "All health records cleared successfully", 
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete data: " + err.message });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));