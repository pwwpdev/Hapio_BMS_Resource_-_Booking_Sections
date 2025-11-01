const { apiClient } = require('../apiClient');

async function deleteBooking(booking_id) {
    try {
        const response = await apiClient.delete(`bookings/${booking_id}`);
        return response.data || { message: 'Booking deleted successfully.' };
    } catch (error) {
        console.error(
            'Error deleting booking:',
            error.response ? error.response.data : error.message
        );
        throw error;
    }
}

module.exports = { deleteBooking };
