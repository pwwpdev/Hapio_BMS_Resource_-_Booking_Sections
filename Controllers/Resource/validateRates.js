/**
 * Validate rates array structure
 * @param {Array} rates - Array of rate objects
 * @returns {Object} Validation result
 */
function validateRates(rates) {
    const validRenewalTypes = [
        'every month',
        'every week',
        'every day',
        'every hour',
        'every use'
    ];

    const errors = [];
    const validatedRates = [];

    if (!Array.isArray(rates)) {
        return {
            isValid: false,
            errors: ['Rates must be an array'],
            validatedRates: []
        };
    }

    rates.forEach((rate, index) => {
        const rateErrors = [];

        // Validate required fields
        if (!rate.price_name || typeof rate.price_name !== 'string') {
            rateErrors.push(`Rate ${index + 1}: price_name is required and must be a string`);
        }

        if (!rate.description || typeof rate.description !== 'string') {
            rateErrors.push(`Rate ${index + 1}: description is required and must be a string`);
        }

        if (rate.price === undefined || rate.price === null || typeof rate.price !== 'number' || rate.price < 0) {
            rateErrors.push(`Rate ${index + 1}: price is required and must be a positive number`);
        }

        if (!rate.renewal_type || !validRenewalTypes.includes(rate.renewal_type)) {
            rateErrors.push(`Rate ${index + 1}: renewal_type must be one of: ${validRenewalTypes.join(', ')}`);
        }

        if (rateErrors.length === 0) {
            validatedRates.push({
                price_name: rate.price_name.trim(),
                description: rate.description.trim(),
                price: parseFloat(rate.price),
                renewal_type: rate.renewal_type,
                created_at: new Date().toISOString()
            });
        } else {
            errors.push(...rateErrors);
        }
    });

    return {
        isValid: errors.length === 0,
        errors: errors,
        validatedRates: validatedRates
    };
}

module.exports = { validateRates };