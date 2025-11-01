const { apiClient } = require("../apiClient");

async function getService(service_id) {
    try {
        const response = await apiClient.get(`/services/${service_id}`);
        return response.data;
    } catch (error) {
        if (error.response) {
            // Hapio returned an error (e.g. 403, 404)
            throw new Error(JSON.stringify({
                status: error.response.status,
                message: error.response.data?.error || "Failed to fetch service"
            }));
        }
        throw new Error("Network or server error while fetching service");
    }
}

module.exports = { getService };
