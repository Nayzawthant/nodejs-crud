const express = require("express");
const router = express.Router();
const multer = require('multer');
const User = require('../models/users');

// Load environment variables from a .env file
require("dotenv").config();

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({ storage }).single('image');

// Route to add a new user to the database
router.post('/add', upload, async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const user = new User({
            name,
            email,
            phone,
            image: req.file.filename,
        });

        await user.save();
        req.session.message = {
            type: 'success',
            message: 'User added successfully!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Get all users route
router.get("/", (req, res) => {
    User.find().exec((err, users) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.render("index", {
                title: "Home Page",
                users: users,
            });
        }
    })
})

// Render the home page
router.get("/", (req, res) => {
    res.render('index', { title: 'Home Page' });
});

// Render the page to add users
router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add Users" });
});

module.exports = router;
