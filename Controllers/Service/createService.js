const { apiClient } = require("../../apiClient");
async function createService(Object) {
    // flexible service 
    const name = Object.name;
    const min_duration = Object.min_duration ? Object.min_duration : "PT1M";
    const max_duration = Object.max_duration ? Object.max_duration : "PT10H";
    const duration_step = Object.duration_step ? Object.duration_step : "PT1M";
    try {
        const service = await apiClient.post("/services",
            {
                "name": name,
                "type": "flexible",
                "min_duration": min_duration,
                "max_duration": max_duration,
                "duration_step": duration_step
            }
        );
        return service;
    } catch (err) {
        throw err;
    }
}

module.exports = { createService };
