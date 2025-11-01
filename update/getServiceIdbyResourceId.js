const { apiClient } = require('../apiClient');
async function getServiceIdbyResourceId(resourceId) {
  try {
    const response = await apiClient.get(`resources/${encodeURIComponent(resourceId)}/services`);
    return response.data[0].service_id;
  }
  catch (err) {
    console.log("Error in getServiceIdbyResourceId:", err.response ? err.response.data : err.message);
    throw err;
  }
}
module.exports = { getServiceIdbyResourceId };