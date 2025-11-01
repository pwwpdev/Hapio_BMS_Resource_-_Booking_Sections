const { getResourceByName } = require('../Resource/getResourceByName');
const { getRecurringScheduleByResource } = require('./getRecurringScheduleByResource');
const { getScheduleBlockByWeekday } = require('./getScheduleBlockByWeekday');

/**
 * Get all schedule block IDs by resource name and weekday
 * @param {string} resource_name - Resource name
 * @param {string} weekday - Weekday (e.g. 'monday', 'tuesday')
 * @returns {Array} List of schedule block objects (id, start_time, end_time)
 */
async function getScheduleBlockIdByResourcename(resource_name, weekday) {
    try {
        console.log(`🕓 Fetching all schedule blocks for resource: ${resource_name} (${weekday})`);

        // Step 1: Get resource info
        const resource = await getResourceByName(resource_name);
        if (!resource?.id) throw new Error(`Resource '${resource_name}' not found.`);

        // Step 2: Get recurring schedule
        const recurringSchedule = await getRecurringScheduleByResource(resource.id);
        if (!recurringSchedule?.id) throw new Error(`No recurring schedule found for resource '${resource_name}'.`);

        // Step 3: Get all schedule blocks for that weekday
        const scheduleBlocks = await getScheduleBlockByWeekday(resource.id, recurringSchedule.id, weekday);

        // Handle single or multiple results
        let formattedBlocks = [];
        if (Array.isArray(scheduleBlocks)) {
            formattedBlocks = scheduleBlocks.map(block => ({
                id: block.id,
                start_time: block.start_time,
                end_time: block.end_time
            }));
        } else if (scheduleBlocks && scheduleBlocks.id) {
            formattedBlocks.push({
                id: scheduleBlocks.id,
                start_time: scheduleBlocks.start_time,
                end_time: scheduleBlocks.end_time
            });
        }

        if (formattedBlocks.length === 0) {
            console.log(`⚠️ No schedule blocks found for ${resource_name} on ${weekday}`);
            return [];
        }

        console.log(`✅ Found ${formattedBlocks.length} schedule block(s) for ${resource_name} on ${weekday}`);
        return formattedBlocks;
    } catch (err) {
        console.error("❌ Error in getScheduleBlockIdByResourcename:", err.message);
        throw err;
    }
}

module.exports = { getScheduleBlockIdByResourcename };
