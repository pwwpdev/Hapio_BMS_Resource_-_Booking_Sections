const { apiClient } = require('../../apiClient');

async function deleteResource(resource_id) {
   try {
      const response = await apiClient.delete(`/resources/${resource_id}`);
   }
   catch (err) {
      throw err;
   }
}
module.exports = { deleteResource };