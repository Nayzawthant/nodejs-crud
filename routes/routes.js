const express = require("express");
const router = express.Router();
const multer = require('multer');
const User = require('../models/users');
const fs = require('fs').promises;

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
router.get("/", async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render("index", {
            title: "Home Page",
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

// Render the home page
router.get("/", (req, res) => {
    res.render('index', { title: 'Home Page' });
});

// Render the page to add users
router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add Users" });
});

// Edit an user route
router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            return res.redirect('/');
        }

        res.render('edit_users', {
            title: 'Edit User',
            user: user,
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// Update user route
router.post('/update/:id', upload, async (req, res) => {
    try {
        const id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;

            try {
                await fs.unlink(`./uploads/${req.body.old_image}`);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        req.session.message = {
            type: 'success',
            message: 'User updated successfully!',
        };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'error',
            message: 'An error occurred while updating the user.',
        };
        res.redirect('/');
    }
});

// Delete user route
router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await User.findByIdAndDelete(id);

        if (result.image !== '') {
            try {
                await fs.unlink(`./uploads/${result.image}`);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'User deleted successfully'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});

module.exports = router;
