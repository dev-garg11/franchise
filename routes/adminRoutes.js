const express = require('express');
const router = express.Router();
const { getAdmins } = require('../controllers/adminController');

router.route('/').get(getAdmins);

module.exports = router;
