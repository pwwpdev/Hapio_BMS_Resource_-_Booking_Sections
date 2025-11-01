const { apiClient } = require('../apiClient');

async function viewFilteredBookings(resource_id, service_id, location_id) {
    try {
        // Build query string dynamically based on what is provided
        let query = [];
        if (resource_id) query.push(`resource_id=${resource_id}`);
        if (service_id) query.push(`service_id=${service_id}`);
        if (location_id) query.push(`location_id=${location_id}`);

        const queryString = query.length ? `?${query.join('&')}` : '';

        // Example final URL: bookings?resource_id=xxx&service_id=yyy
        const response = await apiClient.get(`bookings${queryString}`);
        return response.data;
    } catch (error) {
        console.error(
            'Error fetching filtered bookings:',
            error.response ? error.response.data : error.message
        );
        throw error;
    }
}

module.exports = { viewFilteredBookings };
