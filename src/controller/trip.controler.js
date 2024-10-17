const axios = require('axios');
const httpStatus = require('http-status');

const fetchTripsData = async () => {
    try {
        const url = process.env.TRIPS_API_URL;
        if (!url) {
            throw new Error('TRIPS_API_URL is not defined');
        }
        const response = await axios.get(url);
        return response.data.trips;
    } catch (error) {
        console.error('Error fetching trips:', error.message);
        throw error;
    }
};

const queryTrips = async (req, res) => {
    try {
        const trips = await fetchTripsData();
        const { keyword, includeCanceled, minDistance, maxDistance, pickupDate } = req.query;

        // If no query parameters are provided, return all trips
        if (!keyword && !includeCanceled && !minDistance && !maxDistance && !pickupDate) {
            return res.status(httpStatus.OK).send({ data: trips });
        }

        let filteredTrips = trips;

        // Keyword search using regex
        if (keyword) {
            const keywordTrimmed = keyword.trim();
            const regex = new RegExp(keywordTrimmed, 'i');
            
            filteredTrips = filteredTrips.filter(trip =>
                regex.test(trip.pickup_location) ||
                regex.test(trip.dropoff_location) ||
                regex.test(trip.type) ||
                regex.test(trip.driver_name) ||
                regex.test(trip.car_make) ||
                regex.test(trip.car_model) ||
                regex.test(trip.car_number)
            );
        }

        // Filter based on the includeCanceled checkbox
        if (includeCanceled === 'true') {
            filteredTrips = filteredTrips.filter(trip => trip.status !== 'COMPLETED');
        } else {
            filteredTrips = filteredTrips.filter(trip => trip.status === 'COMPLETED');
        }

        // Distance filter
        if (minDistance) {
            const minDistanceValue = parseFloat(minDistance); // Convert to float
            if (!isNaN(minDistanceValue)) {
                filteredTrips = filteredTrips.filter(trip => trip.distance >= minDistanceValue);
            }
        }

        if (maxDistance) {
            const maxDistanceValue = parseFloat(maxDistance); // Convert to float
            if (!isNaN(maxDistanceValue)) {
                filteredTrips = filteredTrips.filter(trip => trip.distance <= maxDistanceValue);
            }
        }

        // Pickup date filter
        if (pickupDate) {
            const pickupDateValue = new Date(pickupDate); // Parse date from request
            filteredTrips = filteredTrips.filter(trip => new Date(trip.pickup_date) >= pickupDateValue);
        }

        // Handle case where no trips match the criteria
        if (filteredTrips.length === 0) {
            return res.status(httpStatus.NOT_FOUND).send({ message: "No trips found matching the criteria." });
        }

        res.status(httpStatus.OK).send({ data: filteredTrips });
    
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: "Error fetching trips", error: error.message });
    }
};






    

const getTripById = async (req, res) => {
    try {
        const trips = await fetchTripsData();
        const trip = trips.find(trip => trip.id == req.params.id);
        if (!trip) {
            return res.status(httpStatus.NOT_FOUND).send({ message: 'Trip not found' });
        }
        res.status(httpStatus.OK).send({ data: trip });
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send({ message: "Error fetching trip", error: error.message });
    }
};

module.exports = {
    queryTrips,
    getTripById
};
