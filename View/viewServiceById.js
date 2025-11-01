
const { apiClient } = require('../apiClient');
async function viewServiceById(service_id) {
    const response = await apiClient.get(`services/${encodeURIComponent(service_id)}`);
    return response.data;
}

module.exports = { viewServiceById };