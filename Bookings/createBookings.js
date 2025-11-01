const { apiClient } = require('../apiClient');

// ✅ Helper: get recurring schedule blocks for a resource
async function getAllScheduleBlocks(resource_id) {
  const response = await apiClient.get(`/resources/${resource_id}/recurring-schedules`);
  const recurringSchedules = response.data.data;

  const allBlocks = [];
  for (const schedule of recurringSchedules) {
    const scheduleId = schedule.id;
    const blocksResponse = await apiClient.get(
      `/resources/${resource_id}/recurring-schedules/${scheduleId}/schedule-blocks`
    );
    allBlocks.push(...blocksResponse.data.data);
  }
  return allBlocks;
}

// ✅ Helper: check if booking fits within any schedule block
function isWithinScheduleBlock(weekday, startTime, endTime, scheduleBlocks) {
  return scheduleBlocks.some(block => {
    if (block.weekday.toLowerCase() !== weekday.toLowerCase()) return false;
    return startTime >= block.start_time && endTime <= block.end_time;
  });
}

// ✅ Helper: check if booking date is in the past
// (Direct comparison — no timezone conversions)
function isPastDate(dateString) {
  const bookingTime = new Date(dateString).getTime();
  const now = Date.now();

  console.log('🕓 Current system time:', new Date(now).toISOString());
  console.log('📅 Booking time (raw from body):', new Date(bookingTime).toISOString());

  return bookingTime < now;
}

// ✅ Main function
async function createBookings(resource_id, service_id, location_id, price, customer_id, customer_name, starts_at, ends_at, is_temporary) {
  try {
    // Step 1: Use timestamps directly as provided
    const startsAt = starts_at;
    const endsAt = ends_at;

    // Step 2: Prevent booking for past times
    if (isPastDate(startsAt)) {
      console.error(`❌ Cannot create booking in the past. Start time: ${startsAt}`);
      return {
        status: 422,
        message: `Cannot create booking for a past date/time: ${startsAt}`
      };
    }

    // Step 3: Validate against schedule blocks
    const scheduleBlocks = await getAllScheduleBlocks(resource_id);

    const weekday = new Date(startsAt)
      .toLocaleString('en-US', { weekday: 'long' })
      .toLowerCase();

    // const startTime = new Date(startsAt).toISOString().split('T')[1].substring(0, 8);
    // const endTime = new Date(endsAt).toISOString().split('T')[1].substring(0, 8);
    const startTime = new Date(startsAt).toLocaleTimeString('en-GB', {
      hour12: false,
      timeZone: 'Asia/Hong_Kong'
    });
    const endTime = new Date(endsAt).toLocaleTimeString('en-GB', {
      hour12: false,
      timeZone: 'Asia/Hong_Kong'
    });


    // const fits = isWithinScheduleBlock(weekday, startTime, endTime, scheduleBlocks);
    // if (!fits) {
    //   console.error(`❌ Booking time ${startTime}–${endTime} on ${weekday} not within schedule.`);
    //   return {
    //     status: 422,
    //     message: `Booking time ${startTime}–${endTime} on ${weekday} does not match any open schedule block.`
    //   };
    // }

    function isWithinScheduleBlock(weekday, startTime, endTime, scheduleBlocks) {
      return scheduleBlocks.some(block => {
        if (block.weekday.toLowerCase() !== weekday.toLowerCase()) return false;

        // ✅ Allow booking to end exactly at block.end_time
        return (
          startTime >= block.start_time &&
          endTime <= block.end_time
        );
      });
    }


    // Step 4: Create booking directly
    const bookingPayload = {
      resource_id,
      service_id,
      location_id,
      price,
      starts_at: startsAt,
      ends_at: endsAt,
      is_temporary,
      metadata: {
        customer_id,
        customer_name
      }
    };

    console.log('📅 Booking payload (used directly from request):', bookingPayload);

    const response = await apiClient.post('bookings', bookingPayload);
    console.log('✅ Booking created successfully:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ Error in createBooking:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = { createBookings };
