
const { apiClient } = require('../../apiClient')
async function createRecurringSchedule(bodySchema) {
    try {
        const resource_id = bodySchema.resource_id;
        const location_id = bodySchema.location_id;
        const start_date = bodySchema.start_date;
        console.log("start date is ", start_date);

        console.log("resource id is ", resource_id);
        console.log("location id is ", location_id);
        const RecurringSchedule = await apiClient.post(`resources/${resource_id}/recurring-schedules`, {
            "location_id": `${location_id}`,
            "start_date": `${start_date}`

        });
        return RecurringSchedule;

    }
    catch (err) {
        console.log("Error in creating Recurring Schedule", err.response.data);
    }
}
module.exports = { createRecurringSchedule };
