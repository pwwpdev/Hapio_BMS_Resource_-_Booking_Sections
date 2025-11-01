// const { apiClient } = require("../../apiClient");

// async function createResource(resource_name, capacity, category, metadata) {
//   try {
//     console.log(`🚀 Checking if resource "${resource_name}" already exists...`);

//     // 1️⃣ Check if a resource with this name already exists
//     const encodedName = encodeURIComponent(resource_name);
//     const existing = await apiClient.get(`/resources?name[eq]=${encodedName}`);

//     if (existing.data && existing.data.length > 0) {
//       const existingResource = existing.data.sort(
//         (a, b) => new Date(b.created_at) - new Date(a.created_at)
//       )[0];

//       console.log(`⚠️ Resource "${resource_name}" already exists (ID: ${existingResource.id})`);
//       return {
//         already_exists: true,
//         message: `Resource "${resource_name}" already exists.`,
//         data: existingResource
//       };
//     }

//     console.log(`✅ Creating new resource: ${resource_name}`);

//     // 2️⃣ Create new resource if not found
//     const payload = {
//       name: resource_name,
//       max_simultaneous_bookings: 1,
//       enabled: true,
//       metadata: {
//         capacity,
//         category,
//         ...metadata
//       }
//     };

//     const response = await apiClient.post("/resources", payload);

//     console.log(`✅ Resource created successfully: ${response.data.id}`);
//     return {
//       already_exists: false,
//       message: "Resource created successfully",
//       data: response.data
//     };
//   } catch (error) {
//     console.error("❌ Error creating resource:", error.response?.data || error.message);
//     throw new Error(error.response?.data?.error || error.message);
//   }
// }

// module.exports = { createResource };






const { apiClient } = require("../../apiClient");

async function createResource(resource_name, metadata = {}) {
  try {
    console.log(`🚀 Checking if resource "${resource_name}" already exists...`);

    // 1️⃣ Check if a resource with this name already exists
    const encodedName = encodeURIComponent(resource_name);
    const existing = await apiClient.get(`/resources?name[eq]=${encodedName}`);

    if (existing.data && existing.data.length > 0) {
      const existingResource = existing.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0];

      console.log(`⚠️ Resource "${resource_name}" already exists (ID: ${existingResource.id})`);
      return {
        already_exists: true,
        message: `Resource "${resource_name}" already exists.`,
        data: existingResource
      };
    }

    console.log(`✅ Creating new resource: ${resource_name}`);

    // ✅ metadata is already flattened and correct
    const payload = {
      name: resource_name,
      max_simultaneous_bookings: 1,
      enabled: true,
      metadata
    };

    const response = await apiClient.post("/resources", payload);

    console.log(`✅ Resource created successfully: ${response.data.id}`);
    return {
      already_exists: false,
      message: "Resource created successfully",
      data: response.data
    };
  } catch (error) {
    console.error("❌ Error creating resource:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message);
  }
}

module.exports = { createResource };
