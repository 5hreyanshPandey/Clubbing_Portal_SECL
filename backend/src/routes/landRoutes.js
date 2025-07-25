

const express = require('express');
const router = express.Router();
const { getLandRecords, getEmploymentRecords, updateLandEmployment } = require('../controllers/landController');

router.get('/', getLandRecords);
router.get('/employment', getEmploymentRecords);
router.put('/:id/employment', updateLandEmployment);

module.exports = router;
