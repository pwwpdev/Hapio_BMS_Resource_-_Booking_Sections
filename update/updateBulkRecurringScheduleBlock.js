// const { updateRecurringScheduleBlock } = require('./updateRecurringScheduleBlock');

// async function updateBulkRecurringScheduleBlock(resource_id, recurringSchedule_id, scheduleBlocks) {
//     try {
//         const results = [];

//         for (const block of scheduleBlocks) {
//             const { weekday, startTime, endTime } = block;

//             try {
//                 const result = await updateRecurringScheduleBlock(
//                     resource_id,
//                     recurringSchedule_id,
//                     weekday,
//                     startTime,
//                     endTime
//                 );
//                 results.push({ success: true, weekday, result: result.data });
//             } catch (error) {
//                 console.log(`Failed to update schedule block for weekday ${weekday}:`, error.message);
//                 results.push({ success: false, weekday, error: error.message });
//             }
//         }

//         console.log("Bulk recurring schedule block update completed", results);
//         return results;
//     } catch (err) {
//         console.log("Error in bulk update recurring schedule blocks:", err.message ? err.message : err);
//         throw err;
//     }
// }

// module.exports = { updateBulkRecurringScheduleBlock };


















// const { updateRecurringScheduleBlock } = require("./updateRecurringScheduleBlock");

// /**
//  * Bulk update multiple recurring schedule blocks.
//  * Supports both:
//  * ✅ Single-block updates
//  * ✅ Splitting one block into multiple non-overlapping blocks
//  */
// async function updateBulkRecurringScheduleBlock(resource_id, recurring_schedule_id, scheduleBlocks) {
//     try {
//         const results = [];

//         for (const block of scheduleBlocks) {
//             const { schedule_block_id, weekday, newBlocks } = block;

//             if (!schedule_block_id || !weekday || !Array.isArray(newBlocks)) {
//                 results.push({
//                     success: false,
//                     error: "Missing required fields (schedule_block_id, weekday, or newBlocks).",
//                     block
//                 });
//                 continue;
//             }

//             try {
//                 const result = await updateRecurringScheduleBlock(
//                     resource_id,
//                     recurring_schedule_id,
//                     schedule_block_id,
//                     weekday,
//                     newBlocks
//                 );

//                 results.push({
//                     success: true,
//                     schedule_block_id,
//                     weekday,
//                     result: result.data
//                 });
//             } catch (error) {
//                 console.error(`Failed to update schedule block ${schedule_block_id}:`, error.message);
//                 let errorMessage;
//                 try {
//                     const parsed = JSON.parse(error.message);
//                     errorMessage = parsed.message;
//                 } catch {
//                     errorMessage = error.message;
//                 }
//                 results.push({
//                     success: false,
//                     schedule_block_id,
//                     weekday,
//                     error: errorMessage
//                 });
//             }
//         }

//         return results;
//     } catch (err) {
//         console.error("Error in bulk update recurring schedule blocks:", err.message);
//         throw err;
//     }
// }

// module.exports = { updateBulkRecurringScheduleBlock };









const { updateRecurringScheduleBlock } = require("./updateRecurringScheduleBlock");

/**
 * Bulk update multiple recurring schedule blocks.
 * Supports:
 * ✅ Single-block updates
 * ✅ Split updates (1 block → multiple non-overlapping)
 * ✅ Auto-skip on 422 overlap errors (doesn't stop whole batch)
 */
async function updateBulkRecurringScheduleBlock(resource_id, recurring_schedule_id, scheduleBlocks) {
    try {
        const results = [];

        for (const block of scheduleBlocks) {
            const { schedule_block_id, weekday, newBlocks } = block;

            // Validate inputs
            if (!schedule_block_id || !weekday || !Array.isArray(newBlocks)) {
                results.push({
                    success: false,
                    error: "Missing required fields (schedule_block_id, weekday, or newBlocks).",
                    block
                });
                continue;
            }

            try {
                const result = await updateRecurringScheduleBlock(
                    resource_id,
                    recurring_schedule_id,
                    schedule_block_id,
                    weekday,
                    newBlocks
                );

                results.push({
                    success: true,
                    schedule_block_id,
                    weekday,
                    message: "Updated successfully.",
                    result: result.data
                });
            } catch (error) {
                let errorMessage;
                let status = 500;

                if (error.response) {
                    status = error.response.status;
                    errorMessage = error.response.data?.message || "Unknown API error";
                } else {
                    try {
                        const parsed = JSON.parse(error.message);
                        status = parsed.status;
                        errorMessage = parsed.message;
                    } catch {
                        errorMessage = error.message;
                    }
                }

                // 🟡 Skip 422 overlap errors (continue with others)
                if (status === 422) {
                    console.warn(`⚠️ Skipping block ${schedule_block_id} (422 overlap): ${errorMessage}`);
                    results.push({
                        success: false,
                        schedule_block_id,
                        weekday,
                        skipped: true,
                        reason: "Overlapping schedule block (422)",
                        error: errorMessage
                    });
                    continue;
                }

                // Log other failures normally
                console.error(`❌ Failed to update block ${schedule_block_id}:`, errorMessage);
                results.push({
                    success: false,
                    schedule_block_id,
                    weekday,
                    error: errorMessage
                });
            }
        }

        return {
            message: "Bulk recurring schedule block update completed.",
            results
        };
    } catch (err) {
        console.error("💥 Error in bulk update recurring schedule blocks:", err.message);
        throw err;
    }
}

module.exports = { updateBulkRecurringScheduleBlock };
