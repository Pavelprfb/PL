const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static("views"));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb+srv://MyDatabase:Cp8rNCfi15IUC6uc@cluster0.kjbloky.mongodb.net/login', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define User schema and model
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', userSchema);

// Serve EJS templates
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// /signup route to handle user registration
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.get('/share', (req, res) => {
    res.render('bangla');
});

app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            // Update password if user exists
            existingUser.password = password;
            await existingUser.save();
            res.redirect('/share');
        } else {
            // Create a new user if user does not exist
            const user = new User({ username, password });
            await user.save();
            res.redirect('/share');
        }
    } catch (error) {
        res.status(500).send('Error during signup');
    }
});

// /showdata route to display data
app.get('/showdata', async (req, res) => {
    try {
        const users = await User.find();
        res.render('showdata', { users });
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

// /delete-entry route to delete a specific entry
app.post('/delete-entry', async (req, res) => {
    try {
        const userId = req.body.userId;
        await User.findByIdAndDelete(userId);
        res.redirect('/showdata');
    } catch (error) {
        res.status(500).send('Error deleting data');
    }
});

// /delete route to delete all data
app.get('/delete', async (req, res) => {
    try {
        await User.deleteMany({});
        res.redirect('/showdata');
    } catch (error) {
        res.status(500).send('Error deleting all data');
    }
});

// /download route to download all data as JSON
app.get('/download', async (req, res) => {
    try {
        const users = await User.find();
        const json = JSON.stringify(users, null, 2); // Pretty print JSON
        res.header('Content-Type', 'application/json');
        res.attachment('data.json');
        res.send(json);
    } catch (error) {
        res.status(500).send('Error downloading data');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});