const { apiClient } = require("../../apiClient");

function associateResourcetoService(resource_id, service_id) {
    try {
        const response = apiClient.put(`/services/${service_id}/resources/${resource_id}`, {});
        return response;
    }
    catch (err) {
        throw err;
    }
}

module.exports = { associateResourcetoService };
