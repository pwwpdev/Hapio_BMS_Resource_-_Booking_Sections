function createSingleSlot(name, startTime, EndTime) {
    if (startTime > EndTime) {
        throw new Error("EndTime should be greater then Start Time");
    }
    return {
        "name": `${name}`,
        "startTime": `${startTime}`,
        "endTime": `${EndTime}`
    }
}


module.exports = { createSingleSlot };