const mongoose = require('mongoose');

const Model = mongoose.model('Invoice');
const Product = mongoose.model('Product');

const { calculate } = require('@/helpers');
const { increaseBySettingKey } = require('@/middlewares/settings');
const schema = require('./schemaValidate');

const create = async (req, res) => {
  let body = req.body;

  const { error, value } = schema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  const { items = [], taxRate = 19, discount = 0, laborCost = 0 } = value;

  let subTotal = 0;
  let taxTotal = 0;
  let total = 0;
  let laborTotal = laborCost;

  // Calculate item totals and taxable amounts
  let taxableSubTotal = 0;

  items.map((item) => {
    let itemTotal = calculate.multiply(item['quantity'], item['price']);
    subTotal = calculate.add(subTotal, itemTotal);
    item['total'] = itemTotal;

    // Only add to taxable total if NOT customer-provided material
    if (!item.customerProvided) {
      taxableSubTotal = calculate.add(taxableSubTotal, itemTotal);
    }
  });

  // 19% TVA applies to taxable items + labor cost
  const taxableAmount = calculate.add(taxableSubTotal, laborTotal);
  taxTotal = calculate.multiply(taxableAmount, taxRate / 100);
  total = calculate.add(calculate.add(subTotal, laborTotal), taxTotal);

  body['subTotal'] = subTotal;
  body['laborTotal'] = laborTotal;
  body['taxTotal'] = taxTotal;
  body['total'] = total;
  body['items'] = items;

  let paymentStatus = calculate.sub(total, discount) === 0 ? 'paid' : 'unpaid';

  body['paymentStatus'] = paymentStatus;
  body['createdBy'] = req.admin._id;

  // Create the invoice document
  const result = await new Model(body).save();
  const fileId = 'invoice-' + result._id + '.pdf';
  const updateResult = await Model.findOneAndUpdate(
    { _id: result._id },
    { pdf: fileId },
    { new: true }
  ).exec();

  // Deduct sold quantities from inventory for non-customer-provided items
  for (const item of items) {
    if (item.product && !item.customerProvided) {
      await Product.findOneAndUpdate(
        { _id: item.product, removed: false },
        { $inc: { quantity: -item.quantity }, updated: Date.now() }
      ).exec();
    }
  }

  increaseBySettingKey({
    settingKey: 'last_invoice_number',
  });

  return res.status(200).json({
    success: true,
    result: updateResult,
    message: 'Invoice created successfully',
  });
};

module.exports = create;
