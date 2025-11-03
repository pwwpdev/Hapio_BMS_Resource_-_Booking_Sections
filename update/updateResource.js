
const { apiClient } = require('../apiClient');
const { updateService } = require('./updateService');
const { getServiceIdbyResourceId } = require("./getServiceIdbyResourceId");
const { getRecurringScheduleByResource } = require('../Controllers/RecurringSchedule/getRecurringScheduleByResource');
const { getScheduleBlocksByWeekday } = require('../Controllers/RecurringSchedule/getScheduleBlocksByWeekday');
const { createRecurringScheduleBlock } = require('../Controllers/RecurringSchedule/createRecurringScheduleBlock');

async function updateResource(resourceId, updateObj = {}) {
    if (!resourceId) throw new Error('resourceId is required');

    try {
        console.log(`🔹 Updating resource: ${resourceId}`);

        const {
            name,
            capacity,
            max_duration,
            min_duration,
            duration_interval,
            defined_timings,
            metadata = {}
        } = updateObj;

        // Step 1️⃣ Fetch current resource for merging
        const currentRes = await apiClient.get(`resources/${encodeURIComponent(resourceId)}`);
        const existing = currentRes.data;
        const existingMeta = existing.metadata || {};

        // Merge new metadata (flat structure)
        const mergedMetadata = { ...existingMeta, ...metadata };
        if (capacity !== undefined) mergedMetadata.capacity = capacity;

        const resourcePayload = {};
        if (name) resourcePayload.name = name;
        resourcePayload.metadata = mergedMetadata;

        await apiClient.patch(`resources/${encodeURIComponent(resourceId)}`, resourcePayload);
        console.log("✅ Resource metadata updated successfully");

        // Step 2️⃣ Update linked service durations if required
        if (max_duration || min_duration || duration_interval) {
            const serviceId = await getServiceIdbyResourceId(resourceId);
            await updateService(serviceId, {
                max_duration,
                min_duration,
                duration_step: duration_interval
            });
            console.log("✅ Service durations updated.");
        }

        // Step 3️⃣ Update recurring schedule blocks (if defined)
        if (defined_timings && defined_timings.length > 0) {
            const recurringSchedule = await getRecurringScheduleByResource(resourceId);
            const recurring_schedule_id = recurringSchedule.id;
            const existingBlocks = await getScheduleBlocksByWeekday(resourceId, recurring_schedule_id);

            const groupedNewBlocks = defined_timings.reduce((acc, block) => {
                const day = block.weekday.toLowerCase();
                if (!acc[day]) acc[day] = [];
                acc[day].push({
                    weekday: day,
                    start_time: block.start_time,
                    end_time: block.end_time
                });
                return acc;
            }, {});

            for (const weekday of Object.keys(groupedNewBlocks)) {
                const newBlocks = groupedNewBlocks[weekday];
                const existingForDay = existingBlocks.filter(
                    b => b.weekday?.toLowerCase() === weekday
                );

                for (const block of existingForDay) {
                    await apiClient.delete(
                        `/resources/${resourceId}/recurring-schedules/${recurring_schedule_id}/schedule-blocks/${block.id}`
                    );
                }

                await createRecurringScheduleBlock(resourceId, recurring_schedule_id, newBlocks);
            }

            console.log("✅ Recurring schedule updated successfully.");
        }

        return { message: "✅ Resource updated successfully", resource_id: resourceId };
    } catch (err) {
        console.error("❌ Error in updateResource:", err.response?.data || err.message);
        throw err;
    }
}

module.exports = { updateResource };
