const { apiClient } = require("../../apiClient");

async function createRecurringScheduleBlock(resource_id, recurring_schedule_id, blocks) {
  try {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      throw new Error("At least one block must be provided.");
    }

    console.log(`⏱ Creating ${blocks.length} recurring schedule block(s) in parallel...`);

    // Run all API calls in parallel for efficiency
    const creationResults = await Promise.all(
      blocks.map(async (block) => {
        const { weekday, start_time, end_time } = block;

        if (!weekday || !start_time || !end_time) {
          return {
            success: false,
            weekday,
            error: "Each block must include weekday, start_time, and end_time."
          };
        }

        try {
          const response = await apiClient.post(
            `/resources/${resource_id}/recurring-schedules/${recurring_schedule_id}/schedule-blocks`,
            { weekday, start_time, end_time }
          );

          console.log(`✅ Created block: ${weekday} (${start_time} - ${end_time})`);
          return { success: true, data: response.data, weekday, start_time, end_time };
        } catch (err) {
          const message =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Unknown error while creating schedule block";
          return { success: false, weekday, start_time, end_time, error: message };
        }
      })
    );

    const successful = creationResults.filter(r => r.success);
    const failed = creationResults.filter(r => !r.success);

    console.log(`✅ Successfully created ${successful.length}/${blocks.length} blocks`);
    if (failed.length > 0) {
      console.warn(`⚠️ Failed to create ${failed.length} blocks:`);
      failed.forEach(f => console.warn(`   - ${f.weekday} (${f.start_time}-${f.end_time}): ${f.error}`));
    }

    return {
      status: 201,
      message: `${successful.length} block(s) created successfully, ${failed.length} failed.`,
      data: successful.map(r => r.data),
      failed
    };
  } catch (error) {
    console.error("❌ Error in createRecurringScheduleBlock:", error.message);
    throw new Error("Failed to create recurring schedule blocks.");
  }
}

module.exports = { createRecurringScheduleBlock };
