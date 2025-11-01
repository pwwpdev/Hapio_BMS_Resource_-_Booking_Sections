const { getResourceByName } = require('./getResourceByName');
const { getRecurringScheduleByResource } = require('../RecurringSchedule/getRecurringScheduleByResource');
const { getScheduleBlockByWeekday } = require('../RecurringSchedule/getScheduleBlockByWeekday');
const { getScheduleBlocksByWeekday } = require('../RecurringSchedule/getScheduleBlocksByWeekday');

/**
 * Normalize schedule API responses into a consistent array
 */
function normalizeBlocks(blocksResponse) {
    if (!blocksResponse) return [];
    if (Array.isArray(blocksResponse)) return blocksResponse;
    if (Array.isArray(blocksResponse.data)) return blocksResponse.data;
    if (blocksResponse.id) return [blocksResponse]; // single block
    return [];
}

/**
 * Normalize recurring schedule response (handles Hapio variations)
 */
function normalizeSchedule(recurringSchedule) {
    if (Array.isArray(recurringSchedule?.data) && recurringSchedule.data.length > 0)
        return recurringSchedule.data[0];
    if (Array.isArray(recurringSchedule) && recurringSchedule.length > 0)
        return recurringSchedule[0];
    if (recurringSchedule?.id)
        return recurringSchedule;
    return null;
}

/**
 * Get complete resource schedule information from resource name and weekday
 */
async function getResourceScheduleInfo(resource_name, weekday = null) {
    try {
        console.log(`🕓 Fetching schedule info for: ${resource_name}${weekday ? ` (${weekday})` : ''}`);

        // Step 1: Get resource
        const resource = await getResourceByName(resource_name);
        if (!resource?.id) throw new Error(`Resource '${resource_name}' not found.`);

        // Step 2: Get recurring schedule
        const recurringSchedule = await getRecurringScheduleByResource(resource.id);
        const scheduleObj = normalizeSchedule(recurringSchedule);
        if (!scheduleObj?.id) throw new Error(`No recurring schedules found for resource: ${resource_name}`);

        const recurringScheduleId = scheduleObj.id;
        console.log(`✅ Using recurring schedule ID: ${recurringScheduleId}`);

        // Step 3: Fetch schedule blocks
        let scheduleBlock = [];
        if (weekday) {
            try {
                const blockData = await getScheduleBlockByWeekday(resource.id, recurringScheduleId, weekday.toLowerCase());
                scheduleBlock = normalizeBlocks(blockData);
                if (scheduleBlock.length)
                    console.log(`✅ Found ${scheduleBlock.length} block(s) for ${weekday}`);
                else
                    console.warn(`⚠️ No schedule blocks found for ${weekday}`);
            } catch (err) {
                console.warn(`⚠️ No schedule blocks for ${weekday}: ${err.message}`);
            }
        } else {
            const allBlocks = await getScheduleBlocksByWeekday(resource.id, recurringScheduleId);
            scheduleBlock = normalizeBlocks(allBlocks);
        }

        // Step 4: Return structured response
        return {
            resource: {
                id: resource.id,
                name: resource.name,
                metadata: resource.metadata ?? {},
                created_at: resource.created_at,
                updated_at: resource.updated_at
            },
            recurring_schedule: {
                id: scheduleObj.id,
                start_date: scheduleObj.start_date ?? null,
                end_date: scheduleObj.end_date ?? null,
                created_at: scheduleObj.created_at,
                updated_at: scheduleObj.updated_at
            },
            weekday: weekday || "all",
            schedule_blocks: scheduleBlock // Always array
        };
    } catch (err) {
        console.error("❌ Error while getting resource schedule info:", err.message);
        throw err;
    }
}

/**
 * Get all schedule blocks for a resource (organized by weekday)
 */
async function getAllResourceScheduleBlocks(resource_name) {
    try {
        console.log(`🗓 Fetching all schedule blocks for resource: ${resource_name}`);

        // Step 1: Get resource
        const resource = await getResourceByName(resource_name);
        if (!resource?.id) throw new Error(`Resource '${resource_name}' not found.`);

        // Step 2: Get recurring schedule
        const recurringSchedule = await getRecurringScheduleByResource(resource.id);
        const scheduleObj = normalizeSchedule(recurringSchedule);
        if (!scheduleObj?.id) throw new Error(`No recurring schedules found for resource: ${resource_name}`);

        // Step 3: Fetch all weekday blocks
        const allBlocks = await getScheduleBlocksByWeekday(resource.id, scheduleObj.id);
        const normalizedBlocks = normalizeBlocks(allBlocks);

        console.log(`✅ Retrieved ${normalizedBlocks.length} total blocks for resource: ${resource_name}`);

        return {
            resource: {
                id: resource.id,
                name: resource.name,
                metadata: resource.metadata ?? {},
            },
            recurring_schedule: {
                id: scheduleObj.id,
                start_date: scheduleObj.start_date ?? null,
                end_date: scheduleObj.end_date ?? null,
                created_at: scheduleObj.created_at,
            },
            schedule_blocks_by_weekday: normalizedBlocks
        };
    } catch (err) {
        console.error("❌ Error while getting all resource schedule blocks:", err.message);
        throw err;
    }
}

module.exports = {
    getResourceScheduleInfo,
    getAllResourceScheduleBlocks,
    getResourceWeeklySchedule: getAllResourceScheduleBlocks
};
