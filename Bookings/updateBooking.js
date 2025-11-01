const { apiClient } = require('../apiClient');

// ✅ Helper: check if booking date is in the past (same as createBookings.js)
function isPastDate(dateString) {
    const bookingTime = new Date(dateString).getTime();
    const now = Date.now();

    console.log('🕓 Current system time:', new Date(now).toISOString());
    console.log('📅 Booking time (raw from body):', new Date(bookingTime).toISOString());

    return bookingTime < now;
}

// ✅ Main function — fully aligned with createBookings.js logic
async function updateBooking(booking_id, starts_at, ends_at, price, is_temporary, is_canceled) {
    try {
        // Step 1: Fetch current booking details
        const existingBooking = await apiClient.get(`/bookings/${booking_id}`);
        const bookingData = existingBooking.data;

        // Step 2: Prevent updates after booking starts (if not canceled)
        if (!is_canceled && isPastDate(bookingData.starts_at)) {
            throw new Error("Cannot update booking after it has started or ended.");
        }

        // Step 3: Ensure at least one field is provided
        if (
            !starts_at &&
            !ends_at &&
            price === undefined &&
            is_temporary === undefined &&
            is_canceled === undefined
        ) {
            throw new Error(
                "Please provide at least one of 'starts_at', 'ends_at', 'price', 'is_temporary', or 'is_canceled' to update."
            );
        }

        // Step 4: Use provided timestamps directly (no timezone conversion)
        const startsAt = starts_at || bookingData.starts_at;
        const endsAt = ends_at || bookingData.ends_at;

        // Log times for consistency
        const startTimeHK = new Date(startsAt).toLocaleTimeString('en-GB', {
            hour12: false,
            timeZone: 'Asia/Hong_Kong'
        });
        const endTimeHK = new Date(endsAt).toLocaleTimeString('en-GB', {
            hour12: false,
            timeZone: 'Asia/Hong_Kong'
        });

        console.log(`🕒 Updating booking time (HK): ${startTimeHK}–${endTimeHK}`);

        // Step 5: Construct payload (same structure as createBookings.js)
        const payload = {
            starts_at: startsAt,
            ends_at: endsAt,
            price: price !== undefined ? price : bookingData.price,
            is_temporary:
                is_temporary !== undefined
                    ? is_temporary
                    : bookingData.is_temporary || false,
            is_canceled:
                is_canceled !== undefined
                    ? is_canceled
                    : bookingData.is_canceled || false,
            ignore_schedule: false,
            ignore_fully_booked: false,
            ignore_bookable_slots: false,
            ignore_booking_window: false,
            ignore_cancelation_threshold: false
        };

        console.log("📦 Update payload (used directly from request):", payload);

        // Step 6: Send PATCH request
        const response = await apiClient.patch(`/bookings/${booking_id}`, payload);
        console.log("✅ Booking updated successfully:", response.data);
        return response.data;

    } catch (error) {
        console.error(
            "❌ Error updating booking:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
}

module.exports = { updateBooking };
