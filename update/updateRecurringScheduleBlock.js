// const { apiClient } = require('../apiClient');
// const { getResourceByName } = require('../Controllers/Resource/getResourceByName');
// const { getRecurringScheduleByResource } = require('../Controllers/RecurringSchedule/getRecurringScheduleByResource');
// const { getScheduleBlockIdByResourcename } = require('../Controllers/RecurringSchedule/getScheduleBlockIdByResourcename');

// async function updateRecurringScheduleBlock(resource_name, weekday, startTime, endTime) {
//     try {
//         console.log(`Updating schedule block for resource: ${resource_name} on ${weekday}`);

//         // Get resource by name
//         const resource = await getResourceByName(resource_name);

//         // Get recurring schedule for the resource
//         const recurringSchedule = await getRecurringScheduleByResource(resource.id);

//         // Get schedule block ID by weekday
//         const scheduleBlockId = await getScheduleBlockIdByResourcename(resource_name, weekday);

//         const response = await apiClient.patch(`resources/${resource.id}/recurring-schedules/${recurringSchedule.id}/schedule-blocks/${scheduleBlockId}`, {
//             "weekday": `${weekday}`,
//             "start_time": startTime,
//             "end_time": endTime
//         });

//         console.log("Recurring schedule block updated successfully", response.data);
//         return response;
//     } catch (err) {
//         console.log("Error while updating recurring schedule block:", err.message ? err.message : err);
//         throw err;
//     }
// }

// module.exports = { updateRecurringScheduleBlock };


























// const { apiClient } = require("../apiClient");

// /**
//  * Update or split an existing recurring schedule block.
//  * Supports:
//  * ✅ Updating a single block (simple time change)
//  * ✅ Splitting an existing block into multiple non-overlapping blocks
//  */
// async function updateRecurringScheduleBlock(resource_id, recurring_schedule_id, schedule_block_id, weekday, newBlocks) {
//     try {
//         if (!Array.isArray(newBlocks) || newBlocks.length === 0) {
//             throw new Error("At least one block configuration is required.");
//         }

//         // If updating only one block → simple PUT
//         if (newBlocks.length === 1) {
//             const { start_time, end_time } = newBlocks[0];
//             const response = await apiClient.put(
//                 `/resources/${resource_id}/recurring-schedules/${recurring_schedule_id}/schedule-blocks/${schedule_block_id}`,
//                 { weekday, start_time, end_time }
//             );

//             return {
//                 status: 200,
//                 message: "Schedule block updated successfully.",
//                 data: response.data
//             };
//         }

//         // If splitting existing block → delete old and create new multiple
//         await apiClient.delete(
//             `/resources/${resource_id}/recurring-schedules/${recurring_schedule_id}/schedule-blocks/${schedule_block_id}`
//         );

//         const createdBlocks = [];
//         for (const block of newBlocks) {
//             const { start_time, end_time } = block;
//             const response = await apiClient.post(
//                 `/resources/${resource_id}/recurring-schedules/${recurring_schedule_id}/schedule-blocks`,
//                 { weekday, start_time, end_time }
//             );
//             createdBlocks.push(response.data);
//         }

//         return {
//             status: 200,
//             message: "Schedule block split successfully into multiple non-overlapping blocks.",
//             data: createdBlocks
//         };
//     } catch (error) {
//         if (error.response) {
//             throw new Error(
//                 JSON.stringify({
//                     status: error.response.status,
//                     message:
//                         error.response.data?.error ||
//                         error.response.data?.message ||
//                         "Failed to update/split schedule block"
//                 })
//             );
//         }
//         throw new Error("Network or server error while updating schedule block.");
//     }
// }

// module.exports = { updateRecurringScheduleBlock };

















const { apiClient } = require("../apiClient");

/**
 * Update or split recurring schedule blocks safely.
 * Deletes all existing weekday blocks before creating new ones
 * to avoid overlapping conflicts.
 */
async function updateRecurringScheduleBlock(resource_id, recurring_schedule_id, schedule_block_id, weekday, newBlocks) {
    try {
        if (!Array.isArray(newBlocks) || newBlocks.length === 0) {
            throw new Error("At least one block configuration is required.");
        }

        // 🧹 1️⃣ Fetch all existing schedule blocks
        const existingRes = await apiClient.get(
            `/resources/${resource_id}/recurring-schedules/${recurring_schedule_id}/schedule-blocks`
        );
        const existingBlocks = existingRes.data.data || [];

        // 🗑️ 2️⃣ Delete all blocks for the same weekday
        for (const block of existingBlocks) {
            if (block.weekday.toLowerCase() === weekday.toLowerCase()) {
                await apiClient.delete(
                    `/resources/${resource_id}/recurring-schedules/${recurring_schedule_id}/schedule-blocks/${block.id}`
                );
            }
        }

        // 🧩 3️⃣ Create new (merged or split) blocks
        const createdBlocks = [];
        for (const block of newBlocks) {
            const { start_time, end_time } = block;
            const response = await apiClient.post(
                `/resources/${resource_id}/recurring-schedules/${recurring_schedule_id}/schedule-blocks`,
                { weekday, start_time, end_time }
            );
            createdBlocks.push(response.data);
        }

        return {
            status: 200,
            message: "Schedule blocks updated successfully (old weekday blocks replaced).",
            data: createdBlocks
        };
    } catch (error) {
        if (error.response) {
            throw new Error(
                JSON.stringify({
                    status: error.response.status,
                    message:
                        error.response.data?.error ||
                        error.response.data?.message ||
                        "Failed to update/split schedule block"
                })
            );
        }
        throw new Error("Network or server error while updating schedule block.");
    }
}

module.exports = { updateRecurringScheduleBlock };
