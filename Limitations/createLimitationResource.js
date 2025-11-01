const { createRecurringSchedule } = require("../Controllers/RecurringSchedule/createRecurringSchedule");
const { createResource } = require("../Controllers/Resource/createResource");
const { createService } = require("../Controllers/Service/createService");
const { associateResourcetoService } = require("../Controllers/Association/associateResourcetoService");
const { createRecurringScheduleBlock } = require("../Controllers/RecurringSchedule/createRecurringScheduleBlock");
const { validateRates } = require("../Controllers/Resource/validateRates");

async function Limitations({
  defined_timings,
  max_duration,
  min_duration,
  duration_interval,
  resource_name,
  start_date,
  photo_url,
  capacity,
  resource_details,
  email_confirmation,
  resource_plans,
  category,
  location_id,
  metadata = {},
  rates = []
}) {
  console.log("=== 🧩 START: Limitations Function ===");

  // Step 1️⃣ Validate rates
  if (rates && rates.length > 0) {
    const rateValidation = validateRates(rates);
    if (!rateValidation.isValid)
      throw new Error(`Rate validation failed: ${rateValidation.errors.join(", ")}`);
    rates = rateValidation.validatedRates;
  }

  // Step 2️⃣ Merge metadata (flat structure)
  metadata = {
    ...metadata,
    capacity,
    resource_plans,
    category,
    email_confirmation,
    resource_details,
    photo_url,
    rates
  };

  console.log(`🚀 Creating resource: ${resource_name}`);
  const resource = await createResource(resource_name, metadata);
  const resource_id = resource.data.id;
  console.log("✅ Resource created:", resource_id);

  // Step 3️⃣ Create recurring schedule
  const recurringSchedule = await createRecurringSchedule({
    resource_id,
    location_id,
    start_date
  });
  const recurring_schedule_id = recurringSchedule.data.id;
  console.log("✅ Recurring schedule created:", recurring_schedule_id);

  // Step 4️⃣ Create service
  const service = await createService({
    name: `${resource_name}_service`,
    max_duration,
    min_duration,
    duration_step: duration_interval
  });

  // Step 5️⃣ Associate resource to service
  await associateResourcetoService(resource_id, service.data.id);
  console.log("✅ Resource linked with service.");

  // Step 6️⃣ Create recurring schedule blocks
  if (defined_timings && defined_timings.length > 0) {
    console.log("🧱 Creating recurring schedule blocks...");
    const blockResponse = await createRecurringScheduleBlock(
      resource_id,
      recurring_schedule_id,
      defined_timings
    );
    console.log(`✅ Schedule blocks result: ${blockResponse.message}`);
  }

  console.log("=== ✅ END: Limitations Function ===");

  return {
    message: "Resource and schedule setup completed successfully",
    resource_id,
    recurring_schedule_id
  };
}

module.exports = { Limitations };
