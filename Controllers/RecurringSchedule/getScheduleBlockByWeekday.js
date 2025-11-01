const { apiClient } = require("../../apiClient");

/**
 * Get all schedule blocks for a resource, recurring schedule, and weekday
 * @param {string} resource_id
 * @param {string} recurring_schedule_id
 * @param {string} weekday
 * @returns {Array} List of schedule blocks for that weekday
 */
async function getScheduleBlockByWeekday(resource_id, recurring_schedule_id, weekday) {
    try {
        console.log(`📅 Fetching schedule blocks for resource: ${resource_id}, schedule: ${recurring_schedule_id}, weekday: ${weekday}`);

        const response = await apiClient.get(
            `/resources/${resource_id}/recurring-schedules/${recurring_schedule_id}/schedule-blocks`
        );

        const allBlocks = response.data?.data || response.data || [];

        // Normalize weekday to lowercase
        const filteredBlocks = allBlocks.filter(
            (block) => block.weekday?.toLowerCase() === weekday.toLowerCase()
        );

        if (filteredBlocks.length === 0) {
            console.warn(`⚠️ No schedule blocks found for ${weekday}.`);
        } else {
            console.log(`✅ Found ${filteredBlocks.length} block(s) for ${weekday}.`);
        }

        return filteredBlocks;
    } catch (error) {
        console.error(
            "❌ Error fetching schedule blocks by weekday:",
            error.response?.data || error.message
        );
        throw error;
    }
}

module.exports = { getScheduleBlockByWeekday };
