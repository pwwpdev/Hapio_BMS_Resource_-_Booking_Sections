const axios = require("axios");
require('dotenv').config();
const apiClient = axios.create({
    baseURL: 'https://eu-central-1.hapio.net/v1/',
    headers: {
        // 'Authorization': `Bearer V5sRF5Kidl7CxY2Ihwv2q7ut2AwbnWdqehoSviSTfbf81961`
        'Authorization': `Bearer 3lR8tnBHO4BOqEwlgZg9VwrB8Fua6YIq5VHEABYUa0d70b85`

    }
});

module.exports = { apiClient };