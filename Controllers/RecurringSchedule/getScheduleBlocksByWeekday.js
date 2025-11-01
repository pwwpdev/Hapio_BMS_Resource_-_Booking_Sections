const { apiClient } = require("../../apiClient");

/**
 * Get all recurring schedule blocks for a specific resource and recurring schedule.
 * Returns all weekdays’ blocks together.
 */
async function getScheduleBlocksByWeekday(resource_id, recurring_schedule_id) {
    try {
        console.log(`📅 Fetching ALL recurring schedule blocks for resource: ${resource_id}, schedule: ${recurring_schedule_id}`);

        const response = await apiClient.get(
            `/resources/${resource_id}/recurring-schedules/${recurring_schedule_id}/schedule-blocks`
        );

        // Normalize Hapio response (they usually return { data: [...] })
        let blocks = [];
        if (Array.isArray(response.data)) {
            blocks = response.data;
        } else if (Array.isArray(response.data?.data)) {
            blocks = response.data.data;
        } else if (response.data?.id) {
            blocks = [response.data];
        }

        console.log(`✅ Retrieved ${blocks.length} block(s) from Hapio`);
        return blocks;
    } catch (err) {
        console.error("❌ Error in getScheduleBlocksByWeekday:", err.response?.data || err.message);
        throw new Error(
            err.response?.data?.message ||
            "Failed to retrieve recurring schedule blocks."
        );
    }
}

module.exports = { getScheduleBlocksByWeekday };
