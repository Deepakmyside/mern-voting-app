const express = require('express')
const app = express();
const db = require('./db');
require('dotenv').config();


const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;


//Import routes
const userRoutes = require('./routes/userRoutes.js');
const candidateRoutes = require('./routes/candidateRoutes.js');
// Use the routes 
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);
app.use('/user', userRoutes); // already there most likely

app.listen(PORT, () => {
    console.log('listening on port 3000');
});

