const express = require('express');
const router = express.Router();
const {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
} = require('../controllers/brandController');

router
    .route('/')
    .get(getBrands)
    .post(createBrand);

router
    .route('/:id')
    .get(getBrandById)
    .put(updateBrand)
    .delete(deleteBrand);

module.exports = router;
