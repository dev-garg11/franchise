const express = require('express');
const router = express.Router();
const {
  getInvestors,
  createInvestor
} = require('../controllers/investorController');

router
  .route('/')
  .get(getInvestors)
  .post(createInvestor);

module.exports = router;
