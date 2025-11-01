const { apiClient } = require('../apiClient');

async function viewBooking(booking_id) {
    try {
        const response = await apiClient.get(`bookings/${booking_id}`);
        return response.data;
    } catch (error) {
        console.error(
            'Error fetching booking:',
            error.response ? error.response.data : error.message
        );
        throw error;
    }
}

module.exports = { viewBooking };
