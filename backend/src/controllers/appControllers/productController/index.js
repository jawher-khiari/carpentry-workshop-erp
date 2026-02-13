const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Product');

const create = require('./create');

methods.create = create;

module.exports = methods;
