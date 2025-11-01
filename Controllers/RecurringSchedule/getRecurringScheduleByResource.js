const { apiClient } = require('../../apiClient');

/**
 * Get recurring schedule for a resource
 * @param {string} resource_id - The ID of the resource
 * @returns {Object} Recurring schedule object
 */
async function getRecurringScheduleByResource(resource_id) {
    try {
        const response = await apiClient.get(`/resources/${resource_id}/recurring-schedules`);

        if (!response.data || !response.data.data || response.data.data.length === 0) {
            throw new Error(`No recurring schedule found for resource ID: ${resource_id}`);
        }

        // Since you mentioned there's only one recurring schedule per resource
        const recurringSchedule = response.data.data[0];
        console.log(`Found recurring schedule: ${recurringSchedule.id} for resource: ${resource_id}`);

        return {
            id: recurringSchedule.id,
            resource_id: recurringSchedule.resource_id,
            location_id: recurringSchedule.location_id,
            start_date: recurringSchedule.start_date,
            end_date: recurringSchedule.end_date,
            created_at: recurringSchedule.created_at,
            updated_at: recurringSchedule.updated_at
        };
    } catch (err) {
        if (err.response) {
            console.error('Upstream response error while getting recurring schedule:', err.response.status, err.response.data);
        } else {
            console.error("Error while getting recurring schedule by resource:", err.message ? err.message : err);
        }
        throw err;
    }
}

module.exports = { getRecurringScheduleByResource };