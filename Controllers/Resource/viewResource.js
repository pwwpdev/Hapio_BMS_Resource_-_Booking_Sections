const { apiClient } = require('../../apiClient');

async function viewResource(resource_name) {
    try {
        // Encode the resource name for URL safety
        const encodedName = encodeURIComponent(resource_name);
        console.log(`Viewing resource with name: ${resource_name}`);
        console.log(`API URL: /resources?name[eq]=${encodedName}`);

        const resource = await apiClient.get(`/resources?name[eq]=${encodedName}`);

        // Check if resource was found
        if (!resource.data || !resource.data.data || resource.data.data.length === 0) {
            throw new Error(`Resource with name '${resource_name}' not found`);
        }

        console.log(`Found ${resource.data.data.length} resource(s) with name: ${resource_name}`);
        return resource;
    }
    catch (err) {
        console.log("There is an error while viewing the resource:", err.message ? err.message : err);
    }
}
module.exports = { viewResource };