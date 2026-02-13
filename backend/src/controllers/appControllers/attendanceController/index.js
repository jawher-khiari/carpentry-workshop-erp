const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Attendance');

const checkIn = require('./checkIn');
const checkOut = require('./checkOut');

methods.checkIn = checkIn;
methods.checkOut = checkOut;

module.exports = methods;
