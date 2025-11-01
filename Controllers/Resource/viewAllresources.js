const { apiClient } = require('../../apiClient');

async function viewAllresources() {
    try {
        const resource = await apiClient.get(`/resources`);
        return resource;
    }
    catch (err) {
        console.log("There is an error while viewing the resource ");
        throw err;
    }
}
module.exports = { viewAllresources };