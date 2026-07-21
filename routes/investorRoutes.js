const express = require('express');
const router = express.Router();
const {
  getInvestors,
  createInvestor,
  assignBrand,
  updateInvestor,
  deleteInvestor
} = require('../controllers/investorController');

router
  .route('/')
  .get(getInvestors)
  .post(createInvestor);

router
  .route('/:id')
  .patch(updateInvestor)
  .delete(deleteInvestor);

router.post('/assign-brand', assignBrand);

module.exports = router;
