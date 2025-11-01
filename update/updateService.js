const { apiClient } = require('../apiClient');
async function updateService(serviceId, updateData) {
   try {
      const response = await apiClient.patch(`services/${encodeURIComponent(serviceId)}`, updateData);
      return response
   }
   catch (err) {
      console.log("Error in updateService:", err.response ? err.response.data : err.message);
      throw err;
   }
}

module.exports = { updateService };
