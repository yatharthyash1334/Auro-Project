require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Import Models
const internModel = require('./Models/intern');
const studentModel = require('./Models/student');
const applicationModel = require('./Models/application');
const companyModel = require('./Models/company');

// Import Middlewares
const { authenticateUser, authenticateCompany } = require('./middlewares/auth');

// Environment Validation
const { MONGODB_URL, CLOUDNAME, APIKEY, APISECRET, ACCESS_TOKEN_SECRET } = process.env;
if (!MONGODB_URL || !CLOUDNAME || !APIKEY || !APISECRET || !ACCESS_TOKEN_SECRET) {
  throw new Error('Missing critical environment variables.');
}

// Database Connection
mongoose
  .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Cloudinary Config
cloudinary.config({
  cloud_name: CLOUDNAME,
  api_key: APIKEY,
  api_secret: APISECRET,
});

// Multer Config
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper: File Upload to Cloudinary
const handleUpload = async (file) => {
  try {
    const res = await cloudinary.uploader.upload(file, { resource_type: 'auto' });
    return res.url;
  } catch (error) {
    throw new Error('File upload failed');
  }
};

// Routes

/** Register a Student */
app.post('/register', async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new studentModel({ userName, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Student registered successfully.' });
  } catch (error) {
    console.error('Error during student registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/** Register a Company */
app.post('/registerCompany', async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCompany = new companyModel({ username: userName, password: hashedPassword });
    await newCompany.save();

    res.status(201).json({ message: 'Company registered successfully.' });
  } catch (error) {
    console.error('Error during company registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/** Add New Internship */
app.post('/internships', async (req, res) => {
  try {
    const { companyName, jobRole, stipend, cutoff } = req.body;

    if (!companyName || !jobRole || !stipend || !cutoff) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newInternship = new internModel({ CompanyName: companyName, JobRole: jobRole, Stipend: stipend, CutOff: cutoff });
    await newInternship.save();

    res.status(201).json({ message: 'Internship added successfully.' });
  } catch (error) {
    console.error('Error adding internship:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/** Apply for Internship */
app.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, branch, role } = req.body;

    if (!name || !email || !branch || !role || !req.file) {
      return res.status(400).json({ message: 'All fields and resume file are required.' });
    }

    const resumeUrl = await handleUpload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`);
    const newApplication = new applicationModel({ Name: name, Email: email, Branch: branch, Role: role, Resume: resumeUrl });

    await newApplication.save();
    res.status(201).json({ message: 'Application submitted successfully.' });
  } catch (error) {
    console.error('Error during application submission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/** View Internships */
app.get('/internships', authenticateUser, async (req, res) => {
  try {
    const internships = await internModel.find({});
    res.status(200).json(internships);
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/** View Applications */
app.get('/applications', authenticateCompany, async (req, res) => {
  try {
    const applications = await applicationModel.find({});
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Authentication Routes: Login for Students and Companies
const loginHandler = async (req, res, model, isUser) => {
  try {
    const { userName, password } = req.body;
    const user = await model.findOne({ username: userName });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id, isUser }, ACCESS_TOKEN_SECRET);
    res.status(200).json({ user, token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

app.post('/login', (req, res) => loginHandler(req, res, studentModel, true));
app.post('/loginCompany', (req, res) => loginHandler(req, res, companyModel, false));

// Start Server
app.listen(3001, () => console.log('Server running on port 3001.'));
