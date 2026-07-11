const express = require('express');
const router = express.Router();
const {
  getInvestors,
  createInvestor,
  assignBrand
} = require('../controllers/investorController');

router
  .route('/')
  .get(getInvestors)
  .post(createInvestor);

router.post('/assign-brand', assignBrand);

module.exports = router;
