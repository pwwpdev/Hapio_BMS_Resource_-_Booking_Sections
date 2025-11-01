const { apiClient } = require('../../apiClient');

async function deleteRecurringScheduleBlock(resource_id, recurring_schedule_id, schedule_block_id) {
    try {
        const response = await apiClient.delete(
            `/resources/${resource_id}/recurring-schedules/${recurring_schedule_id}/schedule-blocks/${schedule_block_id}`
        );
        return response;
    } catch (error) {
        console.error("Error in deleteRecurringScheduleBlock:", error.message);
        throw error;
    }
}

module.exports = { deleteRecurringScheduleBlock };
