function isValidISO8601(dateString) {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return isoRegex.test(dateString) && !isNaN(Date.parse(dateString));
}

function validateSlots(slots, givenStartTime, givenEndTime) {
    // Validate inputs are ISO 8601
    if (!isValidISO8601(givenStartTime)) {
        throw new Error('givenStartTime must be a valid ISO 8601 timestamp');
    }
    if (!isValidISO8601(givenEndTime)) {
        throw new Error('givenEndTime must be a valid ISO 8601 timestamp');
    }

    // Convert given times to Date objects
    const givenStart = new Date(givenStartTime);
    const givenEnd = new Date(givenEndTime);

    // Validate the given time range first
    if (givenStart >= givenEnd) {
        throw new Error(`Given time range is invalid: start time must be before end time`);
    }

    // Validate slots is an array
    if (!Array.isArray(slots)) {
        throw new Error('Slots must be an array');
    }

    // Validate each slot
    slots.forEach((slot, index) => {
        if (!slot || typeof slot !== 'object' || !slot.starts_at || !slot.ends_at) {
            throw new Error(`Slot ${index + 1} is invalid: must be an object with starts_at and ends_at`);
        }
        const slotStart = new Date(slot.starts_at);
        const slotEnd = new Date(slot.ends_at);

        // Check if slot start time is within range
        if (slotStart < givenStart || slotStart > givenEnd) {
            throw new Error(`Slot ${index + 1} start time (${slot.starts_at}) is outside the allowed range (${givenStartTime} - ${givenEndTime})`);
        }

        // Check if slot end time is within range
        if (slotEnd < givenStart || slotEnd > givenEnd) {
            throw new Error(`Slot ${index + 1} end time (${slot.ends_at}) is outside the allowed range (${givenStartTime} - ${givenEndTime})`);
        }

        // Check if start time is before end time
        if (slotStart >= slotEnd) {
            throw new Error(`Slot ${index + 1} has invalid times: start time (${slot.starts_at}) must be before end time (${slot.ends_at})`);
        }
    });

    return true; // All slots are valid
}

// Infra of the slot is 

// {
//     starts_at: 
//     ends_at:
// }

module.exports = { validateSlots };