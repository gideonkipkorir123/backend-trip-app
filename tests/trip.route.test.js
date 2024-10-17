const request = require('supertest');
const app = require('../app');

describe('GET /api/trips', () => {
  it('should return all trips when no query parameters are provided', async () => {
    const response = await request(app).get('/api/trips');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should return trips filtered by keyword', async () => {
    const response = await request(app).get('/api/trips?keyword=Nairobi');
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    response.body.data.forEach(trip => {
      expect(
        trip.pickup_location.includes('Nairobi') ||
        trip.dropoff_location.includes('Nairobi') ||
        trip.driver_name.includes('Nairobi')
      ).toBeTruthy();
    });
  });

  it('should return trips filtered by distance', async () => {
    const response = await request(app).get('/api/trips?minDistance=10&maxDistance=50');
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    response.body.data.forEach(trip => {
      expect(trip.distance).toBeGreaterThanOrEqual(10);
      expect(trip.distance).toBeLessThanOrEqual(50);
    });
  });

  it('should return trips filtered by pickup date', async () => {
    const pickupDate = '2019-07-23 00:00:00';
    const response = await request(app).get(`/api/trips?pickupDate=${pickupDate}`);
  
    expect(response.statusCode).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    response.body.data.forEach(trip => {
      const tripPickupDate = trip.pickup_date;
      expect(new Date(tripPickupDate) >= new Date(pickupDate)).toBeTruthy();
    });
  });

  it('should return only canceled trips when includeCanceled is true', async () => {
    const response = await request(app).get('/api/trips?includeCanceled=true');
    expect(response.statusCode).toBe(200);
    response.body.data.forEach(trip => {
      expect(trip.status).not.toBe('COMPLETED');
    });
  });

  it('should return a 404 when no trips match the criteria', async () => {
    const response = await request(app).get('/api/trips?keyword=NonExistingLocation');
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('No trips found matching the criteria.');
  });
});
