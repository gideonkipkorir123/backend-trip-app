const express = require('express');
const router = express.Router();
const { queryTrips, getTripById } = require('../controller/trip.controler');


router.get('/', queryTrips); 
router.get('/:id', getTripById); 

module.exports = router;
