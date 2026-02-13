const mongoose = require('mongoose');

const Model = mongoose.model('Product');

const { calculate } = require('@/helpers');

const create = async (req, res) => {
  const body = req.body;

  const { reference, price, quantity } = body;

  // Smart Stock Update (User Story 1.2):
  // Check if a product with the same reference already exists and is not removed
  const existingProduct = await Model.findOne({
    reference: reference,
    removed: false,
  }).exec();

  if (existingProduct) {
    if (existingProduct.price === price) {
      // Same reference AND same price -> update quantity by adding to the existing stock
      const newQuantity = calculate.add(existingProduct.quantity, quantity);

      const updatedProduct = await Model.findOneAndUpdate(
        { _id: existingProduct._id },
        { quantity: newQuantity, updated: Date.now() },
        { new: true }
      ).exec();

      return res.status(200).json({
        success: true,
        result: updatedProduct,
        message: 'Product quantity updated successfully',
      });
    }

    // Same reference but different price -> create a new product record
  }

  // No existing product found OR price differs -> create a new product
  body['createdBy'] = req.admin._id;

  const result = await new Model(body).save();

  return res.status(200).json({
    success: true,
    result,
    message: 'Product created successfully',
  });
};

module.exports = create;
