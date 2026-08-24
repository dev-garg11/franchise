const express = require('express');
const router = express.Router();
const {
    getAdvertisements,
    getAdvertisementById,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement
} = require('../controllers/adController');

router
    .route('/')
    .get(getAdvertisements)
    .post(createAdvertisement);

router
    .route('/:id')
    .get(getAdvertisementById)
    .put(updateAdvertisement)
    .delete(deleteAdvertisement);

module.exports = router;
