const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Mount routes
app.use('/commercial/customer', require('./routes/commercial.customer.routes'));
app.use('/commercial/property', require('./routes/commercial.property.routes'));
app.use('/customer', require('./routes/customer.routes'));
app.use('/employee', require('./routes/employee.routes'));
app.use('/global/search', require('./routes/global.search.routes'));
app.use('/match', require('./routes/match.service.routes'));
app.use('/otp', require('./routes/otp.routes'));
app.use('/property', require('./routes/property.routes'));
app.use('/residential/property', require('./routes/residential.property.routes'));
app.use('/residential/customer', require('./routes/residential.customer.routes'));
app.use('/reminder', require('./routes/reminder.routes'));
app.use('/user', require('./routes/user.routes'));

// Basic routes that should stay in app.js
app.get('/', (req, res) => res.send('Hello'));
app.get('/health', (req, res) => res.sendStatus(200));
app.get('/error', (req, res) => { throw new Error('Test error'); });

module.exports = app;