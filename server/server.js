const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');

// Config .env
require('dotenv').config({
	path: './config/config.env',
});

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

// Config development
if (process.env.NODE_ENV === 'development') {
	app.use(
		cors({
			origin: process.env.CLIENT_URL,
		})
	);

	app.use(morgan('dev'));
}

// Connect to DB
connectDB();

// Load routes
const authRouter = require('./routes/auth.route');

// Use Routes
app.use('/api', authRouter);

app.use((req, res, next) => {
	res.status(404).json({
		success: false,
		message: '404: Page Not Found',
	});
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
