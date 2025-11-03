const { apiClient } = require('../apiClient');

async function viewAllBookings() {
    try {
        // Retrieve ALL bookings (temporary + finalized + canceled + active)
        const response = await apiClient.get('bookings?temporary=include&canceled=include');
        return response.data;
    } catch (error) {
        console.error(
            'Error fetching all bookings:',
            error.response ? error.response.data : error.message
        );
        throw error;
    }
}

module.exports = { viewAllBookings };
