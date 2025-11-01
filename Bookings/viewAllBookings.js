// View all bookings
// GET /booking

const { apiClient } = require('../apiClient');
async function viewAllBookings() {
    try {
        // Use the shared apiClient for the request
        const response = await apiClient.get('bookings');
        return response.data;
    } catch (error) {
        console.error('Error fetching all bookings:', error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = { viewAllBookings };