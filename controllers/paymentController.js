const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { sendSuccess, sendError } = require('../utils/responseUtils');
const { delay } = require('../utils/delayUtils');

const paymentsPath = path.join(__dirname, '../data/payments.json');
const getPayments = () => JSON.parse(fs.readFileSync(paymentsPath, 'utf8'));
const savePayments = (data) => fs.writeFileSync(paymentsPath, JSON.stringify(data, null, 2));

const initiatePayment = async (req, res) => {
  const { orderId, amount, cardNumber } = req.body;
  const payments = getPayments();
  
  // Simulate payment processing delay
  await delay(2000);
  
  if (cardNumber.startsWith('4000')) {
    return sendError(res, 402, 'Payment declined by gateway');
  }
  
  const payment = {
    id: uuidv4(),
    userId: req.user.id,
    orderId,
    amount,
    status: 'success',
    createdAt: new Date().toISOString()
  };
  
  payments.push(payment);
  savePayments(payments);
  
  sendSuccess(res, 200, 'Payment successful', payment);
};

module.exports = { initiatePayment };
