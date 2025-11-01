const { apiClient } = require('../../apiClient');

/**
 * Get resource ID and details from resource name
 * @param {string} resource_name - The name of the resource
 * @returns {Object} Resource object with ID and other details
 */
async function getResourceByName(resource_name) {
    try {
        // Use the correct filter format with operator
        const encodedName = encodeURIComponent(resource_name);
        const response = await apiClient.get(`/resources?name[eq]=${encodedName}`);

        console.log(`Searching for resource with name: ${resource_name}`);
        console.log(`API URL: /resources?name[eq]=${encodedName}`);

        if (!response.data || !response.data.data || response.data.data.length === 0) {
            throw new Error(`Resource with name '${resource_name}' not found`);
        }

        // Return the first matching resource
        console.log(`Found ${response.data.data.length} resource(s)`);
        const resource = response.data.data[0];
        console.log(`Found resource: ${resource.name} with ID: ${resource.id}`);

        return {
            id: resource.id,
            name: resource.name,
            location_id: resource.location_id,
            category: resource.category,
            capacity: resource.capacity,
            metadata: resource.metadata,
            created_at: resource.created_at,
            updated_at: resource.updated_at
        };
    } catch (err) {
        if (err.response) {
            console.error('Upstream response error while getting resource by name:', err.response.status, err.response.data);
        } else {
            console.error("Error while getting resource by name:", err.message ? err.message : err);
        }
        throw err;
    }
}

module.exports = { getResourceByName };