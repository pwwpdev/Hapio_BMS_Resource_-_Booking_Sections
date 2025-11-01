const { createRecurringScheduleBlock } = require('./createRecurringScheduleBlock');

async function createWeeklyScheduleBlocks(resourceId, recurringScheduleId, startTime, endTime) {
  try {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const results = [];

    for (const weekday of daysOfWeek) {
      try {
        const result = await createRecurringScheduleBlock(
          resourceId,
          recurringScheduleId,
          weekday,
          startTime,
          endTime
        );
        results.push({
          weekday,
          success: true,
          data: result.data
        });
        console.log(`✅ Schedule block created for ${weekday}`);
      } catch (error) {
        results.push({
          weekday,
          success: false,
          error: error.message
        });
        console.log(`❌ Failed to create schedule block for ${weekday}:`, error.message);
      }
    }

    return results;
  } catch (err) {
    console.log("There is an error while creating weekly schedule blocks", err.message ? err.message : err);
    throw err;
  }
}

module.exports = { createWeeklyScheduleBlocks };