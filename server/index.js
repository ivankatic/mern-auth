const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import Routes
const authRoute = require('./routes/auth');
const postsRoute = require('./routes/posts');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
	console.log('MongoDB database connection established successfully.');
});

// Middleware
app.use(express.json());

// Route Middlewares
app.use('/api/user', authRoute);
app.use('/api/posts', postsRoute);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
