

const express = require("express");
const cors = require("cors");

// ----------------------
// 🔹 Process Error Handlers
// ----------------------
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Graceful shutdown...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Graceful shutdown...');
    process.exit(0);
});

// ----------------------
// 🔹 Imports
// ----------------------
const { updateBulkRecurringScheduleBlock } = require("./update/updateBulkRecurringScheduleBlock");
const { Limitations } = require("./Limitations/createLimitationResource");
const { createResource } = require("./Controllers/Resource/createResource");
const { viewResource } = require("./Controllers/Resource/viewResource");
const { viewAllresources } = require("./Controllers/Resource/viewAllresources");
const { deleteResource } = require("./Controllers/Resource/deleteResource");
const { getResourceByName } = require("./Controllers/Resource/getResourceByName");
const { getRecurringScheduleByResource } = require("./Controllers/RecurringSchedule/getRecurringScheduleByResource");
const { getScheduleBlockByWeekday } = require("./Controllers/RecurringSchedule/getScheduleBlockByWeekday");
const { getResourceScheduleInfo, getAllResourceScheduleBlocks, getResourceWeeklySchedule } = require("./Controllers/Resource/getResourceScheduleInfo");
const { getScheduleBlockIdByResourcename } = require("./Controllers/RecurringSchedule/getScheduleBlockIdByResourcename");
const { updateRecurringScheduleBlock } = require("./update/updateRecurringScheduleBlock");
const { updateResource } = require("./update/updateResource");
const { createRecurringSchedule } = require("./Controllers/RecurringSchedule/createRecurringSchedule");
const { createRecurringScheduleBlock } = require("./Controllers/RecurringSchedule/createRecurringScheduleBlock");
const { getServiceIdbyResourceId } = require("./update/getServiceIdbyResourceId");
const { viewServiceById } = require("./View/viewServiceById");
const { viewAllBookings } = require("./Bookings/viewAllBookings");
const { createBookings } = require("./Bookings/createBookings");
const { viewBooking } = require("./Bookings/viewBooking");
const { deleteBooking } = require("./Bookings/deleteBooking");
const { viewFilteredBookings } = require("./Bookings/viewFilteredBookings");
const { updateBooking } = require("./Bookings/updateBooking");
const { getService } = require("./View/getService");
const { deleteRecurringScheduleBlock } = require("./Controllers/RecurringSchedule/deleteRecurringScheduleBlock");




const app = express();
const router = express.Router();

// ----------------------
// 🔹 Middleware
// ----------------------
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Timeout middleware
app.use((req, res, next) => {
    req.setTimeout(30000, () => {
        console.log('Request timeout for:', req.method, req.url);
        if (!res.headersSent) {
            res.status(408).json({ error: 'Request timeout' });
        }
    });
    next();
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    if (!res.headersSent) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// ----------------------
// 🔹 Health & Root Endpoints
// ----------------------
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'HAPIO API Server',
        version: '1.0.0',
        status: 'running'
    });
});


// ===================================================
// ✅ All routes below are automatically prefixed with /booking_system
// ===================================================
// View all resources
router.get('/viewAllBookings', async (req, res) => {
    try {
        const bookings = await viewAllBookings();
        res.status(200).json(bookings);
    } catch (err) {
        console.error('Error in viewAllBookings:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update booking (PATCH)
// router.patch('/updateBooking/:booking_id', async (req, res) => {
//     try {
//         const { booking_id } = req.params;
//         const { starts_at, ends_at } = req.body;

//         // ✅ allow updating either or both
//         if (!starts_at && !ends_at) {
//             return res.status(400).json({
//                 error: "Please provide at least 'starts_at' or 'ends_at' to update."
//             });
//         }

//         const updatedBooking = await updateBooking(booking_id, starts_at, ends_at);

//         res.status(200).json({
//             message: "Booking updated successfully",
//             data: updatedBooking
//         });
//     } catch (err) {
//         console.error("Error in updateBooking route:", err);
//         const status = err.response ? err.response.status : 500;
//         res.status(status).json({
//             error: err.response ? err.response.data : err.message
//         });
//     }
// });




// router.patch('/updateBooking/:booking_id', async (req, res) => {
//     try {
//         const { booking_id } = req.params;
//         const { starts_at, ends_at, price } = req.body;

//         if (!starts_at && !ends_at && price === undefined) {
//             return res.status(400).json({
//                 error: "Please provide at least 'starts_at', 'ends_at', or 'price' to update."
//             });
//         }

//         const updatedBooking = await updateBooking(booking_id, starts_at, ends_at, price);

//         res.status(200).json({
//             message: "Booking updated successfully",
//             data: updatedBooking
//         });
//     } catch (err) {
//         console.error("Error in updateBooking route:", err);
//         const status = err.response ? err.response.status : 500;
//         res.status(status).json({
//             error: err.response ? err.response.data : err.message
//         });
//     }
// });


router.patch('/updateBooking/:booking_id', async (req, res) => {
    try {
        const { booking_id } = req.params;
        const { starts_at, ends_at, price, is_temporary, is_canceled } = req.body; // ✅ Added is_canceled

        if (
            !starts_at &&
            !ends_at &&
            price === undefined &&
            is_temporary === undefined &&
            is_canceled === undefined
        ) {
            return res.status(400).json({
                error: "Please provide at least 'starts_at', 'ends_at', 'price', 'is_temporary', or 'is_canceled' to update."
            });
        }

        const updatedBooking = await updateBooking(
            booking_id,
            starts_at,
            ends_at,
            price,
            is_temporary,
            is_canceled // ✅ Pass to controller
        );

        res.status(200).json({
            message: "Booking updated successfully",
            data: updatedBooking
        });
    } catch (err) {
        console.error("Error in updateBooking route:", err);
        const status = err.response ? err.response.status : 500;
        res.status(status).json({
            error: err.response ? err.response.data : err.message
        });
    }
});




// Get bookings filtered by resource_id, service_id, or location_id
router.get('/viewFilteredBookings', async (req, res) => {
    try {
        const { resource_id, service_id, location_id } = req.query;

        if (!resource_id && !service_id && !location_id) {
            return res.status(400).json({
                error: 'At least one of resource_id, service_id, or location_id is required.'
            });
        }

        const bookings = await viewFilteredBookings(resource_id, service_id, location_id);
        res.status(200).json(bookings);
    } catch (err) {
        console.error('Error fetching filtered bookings:', err);
        const status = err.response ? err.response.status : 500;
        res.status(status).json({
            error: err.response ? err.response.data : err.message
        });
    }
});


// Retrieve a specific booking by ID
router.get('/viewBooking/:booking_id', async (req, res) => {
    try {
        const { booking_id } = req.params;
        const booking = await viewBooking(booking_id);
        res.status(200).json(booking);
    } catch (err) {
        console.error('Error retrieving booking:', err);
        const status = err.response ? err.response.status : 500;
        res.status(status).json({ error: err.response ? err.response.data : err.message });
    }
});

//create booking
app.post('/booking_system/createBookings', async (req, res) => {
    try {
        const { resource_id, service_id, location_id, price, customer_id, customer_name, starts_at, ends_at, is_temporary } = req.body;
        const result = await createBookings(resource_id, service_id, location_id, price, customer_id, customer_name, starts_at, ends_at, is_temporary);

        // If createBookings returned a validation error
        if (result && result.status === 422) {
            return res.status(422).json({ error: result.message });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/viewAllresources', async (req, res) => {
    try {
        const resource = await viewAllresources();
        res.json(resource.data);
    } catch (err) {
        console.error('Error in viewAllresources:', err);
        res.status(500).send({ error: err.message });
    }
});

// Delete a specific booking by ID
router.delete('/deleteBooking/:booking_id', async (req, res) => {
    try {
        const { booking_id } = req.params;
        const response = await deleteBooking(booking_id);
        res.status(200).json({
            message: 'Booking deleted successfully',
            data: response
        });
    } catch (err) {
        console.error('Error deleting booking:', err);
        const status = err.response ? err.response.status : 500;
        res.status(status).json({
            error: err.response ? err.response.data : err.message
        });
    }
});


// Delete resource
router.delete('/deleteResource/:resource_id', async (req, res) => {
    try {
        const { resource_id } = req.params;
        await deleteResource(resource_id);
        res.status(200).send({ message: "Resource deleted successfully" });
    } catch (error) {
        console.error("Error deleting resource:", error);
        res.status(500).send({ error: error.message });
    }
});
router.get('/viewServiceByServiceId/:service_id', async (req, res) => {
    // View resource by name
    const response = await viewServiceById(req.params.service_id);
    res.status(200).json(response);
});

// Retrieve a specific service by service_id (from Hapio directly)
router.get('/getService/:service_id', async (req, res) => {
    try {
        const { service_id } = req.params;
        const service = await getService(service_id);
        res.status(200).json(service);
    } catch (error) {
        console.error("Error retrieving service:", error.message);
        let errorData;
        try {
            errorData = JSON.parse(error.message);
        } catch {
            errorData = { status: 500, message: "Internal server error" };
        }
        res.status(errorData.status).json({ error: errorData.message });
    }
});


router.get('/viewResource/:resource_name', async (req, res) => {
    try {
        const { resource_name } = req.params;
        const resource = await viewResource(resource_name);
        res.status(200).json(resource.data);
    } catch (error) {
        console.error("Error viewing resource:", error);
        res.status(500).send({ error: error.message });
    }
});

// Get resource by name (processed)
router.get('/getResourceByName/:resource_name', async (req, res) => {
    try {
        const { resource_name } = req.params;
        const resource = await getResourceByName(resource_name);
        res.status(200).json(resource);
    } catch (error) {
        console.error("Error getting resource by name:", error);
        res.status(500).send({ error: error.message });
    }
});

// Get recurring schedule by resource ID
router.get('/getRecurringSchedule/:resource_id', async (req, res) => {
    try {
        const { resource_id } = req.params;
        const recurringSchedule = await getRecurringScheduleByResource(resource_id);
        res.status(200).json(recurringSchedule);
    } catch (error) {
        console.error("Error getting recurring schedule:", error);
        res.status(500).send({ error: error.message });
    }
});

// Get schedule block by weekday
router.get('/getScheduleBlock/:resource_id/:recurring_schedule_id/:weekday', async (req, res) => {
    try {
        const { resource_id, recurring_schedule_id, weekday } = req.params;
        const scheduleBlock = await getScheduleBlockByWeekday(resource_id, recurring_schedule_id, weekday);
        res.status(200).json(scheduleBlock);
    } catch (error) {
        console.error("Error getting schedule block:", error);
        res.status(500).send({ error: error.message });
    }
});

// Get complete resource schedule info
router.get('/getResourceScheduleInfo/:resource_name', async (req, res) => {
    try {
        const { resource_name } = req.params;
        const { weekday } = req.query;
        const scheduleInfo = await getResourceScheduleInfo(resource_name, weekday);
        res.status(200).json(scheduleInfo);
    } catch (error) {
        console.error("Error getting resource schedule info:", error);
        res.status(500).send({ error: error.message });
    }
});

// Get all resource schedule blocks
router.get('/getAllResourceScheduleBlocks/:resource_name', async (req, res) => {
    try {
        const { resource_name } = req.params;
        const resourceSchedule = await getAllResourceScheduleBlocks(resource_name);
        res.status(200).json(resourceSchedule);
    } catch (error) {
        console.error("Error getting all resource schedule blocks:", error);
        res.status(500).send({ error: error.message });
    }
});

// Get weekly schedule
router.get('/getResourceWeeklySchedule/:resource_name', async (req, res) => {
    try {
        const { resource_name } = req.params;
        const weeklySchedule = await getResourceWeeklySchedule(resource_name);
        res.status(200).json(weeklySchedule);
    } catch (error) {
        console.error("Error getting resource weekly schedule:", error);
        res.status(500).send({ error: error.message });
    }
});

// Get schedule block ID by resource name and weekday
router.get('/getScheduleBlockIds/:resource_name/:weekday', async (req, res) => {
    try {
        const { resource_name, weekday } = req.params;
        const scheduleBlocks = await getScheduleBlockIdByResourcename(resource_name, weekday);

        if (!scheduleBlocks.length) {
            return res.status(404).json({
                message: `No schedule blocks found for ${resource_name} on ${weekday}`
            });
        }

        res.status(200).json({
            resource_name,
            weekday,
            total_blocks: scheduleBlocks.length,
            schedule_blocks: scheduleBlocks
        });
    } catch (error) {
        console.error("Error fetching schedule block IDs:", error.message);
        res.status(500).json({ error: error.message });
    }
});



// Create recurring schedule for a resource (local endpoint)
router.post('/resources/:resource_id/recurring-schedules', async (req, res) => {
    try {
        const { resource_id } = req.params;
        const { location_id, start_date } = req.body;

        if (!location_id || !start_date) {
            return res.status(400).json({ error: 'location_id and start_date are required' });
        }

        const response = await createRecurringSchedule({ resource_id, location_id, start_date });
        res.status(response.status || 201).json(response.data);
    } catch (error) {
        console.error('Error creating recurring schedule:', error.response ? error.response.data : error.message);
        const status = error.response ? error.response.status : 500;
        res.status(status).json({ error: error.response ? error.response.data : error.message });
    }
});

// Create a schedule block for a recurring schedule (local endpoint)
// router.post('/resources/:resource_id/recurring-schedules/:recurring_schedule_id/schedule-blocks', async (req, res) => {
//     try {
//         const { resource_id, recurring_schedule_id } = req.params;
//         const { weekday, start_time, end_time } = req.body;

//         if (!weekday || !start_time || !end_time) {
//             return res.status(400).json({ error: 'weekday, start_time and end_time are required' });
//         }

//         const response = await createRecurringScheduleBlock(resource_id, recurring_schedule_id, weekday, start_time, end_time);
//         res.status(response.status || 201).json(response.data);
//     } catch (error) {
//         console.error('Error creating schedule block:', error.response ? error.response.data : error.message);
//         const status = error.response ? error.response.status : 500;
//         res.status(status).json({ error: error.response ? error.response.data : error.message });
//     }
// });


// ✅ Create one or multiple schedule blocks (non-overlapping)
router.post('/createScheduleBlocks/:resource_id/:recurring_schedule_id', async (req, res) => {
    try {
        const { resource_id, recurring_schedule_id } = req.params;
        const { blocks } = req.body;

        if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
            return res.status(400).json({ error: "Array 'blocks' is required in the request body." });
        }

        const response = await createRecurringScheduleBlock(resource_id, recurring_schedule_id, blocks);
        res.status(response.status || 201).json({
            message: "Schedule blocks created successfully",
            data: response
        });
    } catch (error) {
        console.error("Error creating schedule blocks:", error.message);
        let errorData;
        try {
            errorData = JSON.parse(error.message);
        } catch {
            errorData = { status: 500, message: "Internal server error." };
        }
        res.status(errorData.status).json({ error: errorData.message });
    }
});


// Update recurring schedule block
// router.patch('/updateBulkScheduleBlocks/:resource_name/:recurring_schedule_id', async (req, res) => {
//     try {
//         const { resource_id, recurringSchedule_id } = req.params;
//         const { scheduleBlocks } = req.body;
//         const response = await updateBulkRecurringScheduleBlock(resource_id, recurringSchedule_id, scheduleBlocks);
//         res.status(200).json({
//             message: "Recurring schedule block updated successfully",
//             data: response.data
//         });
//     }
//     catch (error) {
//         console.error("Error updating recurring schedule block:", error);
//         res.status(500).send({ error: error.message });
//     }
// });

// // ✅ Bulk update multiple schedule blocks (single or split updates)
// router.patch('/resources/:resource_id/recurring-schedules/:recurring_schedule_id/bulk-schedule-blocks', async (req, res) => {
//     try {
//         const { resource_id, recurring_schedule_id } = req.params;
//         const { scheduleBlocks } = req.body;

//         if (!Array.isArray(scheduleBlocks) || scheduleBlocks.length === 0) {
//             return res.status(400).json({ error: "scheduleBlocks array is required in the request body." });
//         }

//         const response = await updateBulkRecurringScheduleBlock(resource_id, recurring_schedule_id, scheduleBlocks);

//         res.status(200).json({
//             message: "Bulk recurring schedule blocks update completed.",
//             data: response
//         });
//     } catch (error) {
//         console.error("Error in bulk updating schedule blocks:", error.message);
//         res.status(500).json({ error: error.message });
//     }
// });



// ✅ Bulk update multiple schedule blocks (single or split updates)
router.patch('/updateBulkScheduleBlocks/:resource_id/:recurring_schedule_id', async (req, res) => {
    try {
        const { resource_id, recurring_schedule_id } = req.params;
        const { scheduleBlocks } = req.body;

        if (!Array.isArray(scheduleBlocks) || scheduleBlocks.length === 0) {
            return res.status(400).json({ error: "scheduleBlocks array is required in the request body." });
        }

        const response = await updateBulkRecurringScheduleBlock(resource_id, recurring_schedule_id, scheduleBlocks);

        res.status(200).json({
            message: "Bulk recurring schedule block update completed.",
            data: response
        });
    } catch (error) {
        console.error("Error in bulk updating schedule blocks:", error.message);
        res.status(500).json({ error: error.message });
    }
});



// router.patch('/updateScheduleBlock/:resource_name/:weekday', async (req, res) => {
//     try {
//         const { resource_name, weekday } = req.params;
//         const { start_time, end_time } = req.body;

//         const response = await updateRecurringScheduleBlock(resource_name, weekday, start_time, end_time);
//         res.status(200).json({
//             message: "Schedule block updated successfully",
//             data: response.data
//         });
//     } catch (error) {
//         console.error("Error updating schedule block:", error);
//         res.status(500).send({ error: error.message });
//     }
// });

// ✅ Update a schedule block (single or split into multiple)
router.put('/updateScheduleBlock/:resource_id/:recurring_schedule_id/:schedule_block_id', async (req, res) => {
    try {
        const { resource_id, recurring_schedule_id, schedule_block_id } = req.params;
        const { weekday, newBlocks } = req.body;

        if (!weekday || !Array.isArray(newBlocks)) {
            return res.status(400).json({
                error: "Both 'weekday' and 'newBlocks' array are required in the request body."
            });
        }

        const result = await updateRecurringScheduleBlock(
            resource_id,
            recurring_schedule_id,
            schedule_block_id,
            weekday,
            newBlocks
        );

        res.status(result.status || 200).json({
            message: result.message,
            data: result.data
        });
    } catch (error) {
        console.error("❌ Error updating schedule block:", error.message);
        let errorData;
        try {
            errorData = JSON.parse(error.message);
        } catch {
            errorData = { status: 500, message: "Internal server error." };
        }
        res.status(errorData.status).json({ error: errorData.message });
    }
});




// ✅ Delete a specific schedule block
router.delete('/deleteScheduleBlock/:resource_id/:recurring_schedule_id/:schedule_block_id', async (req, res) => {
    try {
        const { resource_id, recurring_schedule_id, schedule_block_id } = req.params;

        if (!resource_id || !recurring_schedule_id || !schedule_block_id) {
            return res.status(400).json({ error: "resource_id, recurring_schedule_id, and schedule_block_id are required." });
        }

        const response = await deleteRecurringScheduleBlock(resource_id, recurring_schedule_id, schedule_block_id);

        res.status(response.status || 200).json({
            message: "Schedule block deleted successfully",
            data: response.data
        });
    } catch (error) {
        console.error("Error deleting schedule block:", error.message);
        const status = error.response ? error.response.status : 500;
        res.status(status).json({ error: error.response ? error.response.data : error.message });
    }
});




// ✅ Create resource (with full setup)
router.post("/createResource", async (req, res) => {
    try {
        const {
            defined_timings,
            max_duration,
            min_duration,
            duration_interval,
            resource_details,
            email_confirmation,
            resource_name,
            start_date,
            startTime,
            endTime,
            capacity,
            resource_plans,
            category,
            location_id,
            metadata,
            photo_url,
            rates
        } = req.body;

        if (!resource_name || !start_date || !location_id) {
            return res.status(400).json({
                error: "resource_name, start_date, and location_id are required"
            });
        }

        const resourceSetup = await Limitations({
            defined_timings,
            max_duration,
            min_duration,
            duration_interval,
            resource_details,
            email_confirmation,
            resource_name,
            start_date,
            startTime,
            endTime,
            capacity,
            resource_plans,
            category,
            location_id,
            metadata,
            photo_url,
            rates
        });

        if (resourceSetup.already_exists) {
            return res.status(200).json({
                message: `⚠️ Resource "${resource_name}" already exists.`,
                resource_details: resourceSetup
            });
        }

        res.status(201).json({
            message: "✅ Resource created and fully configured successfully.",
            resource_details: resourceSetup
        });
    } catch (error) {
        console.error("❌ Error creating resource:", error.message);
        res.status(500).json({ error: error.message });
    }
});



// router.get('/service/:serviceId', async (req, res) => {
//     const { serviceId } = req.params;
//     const service = await viewServiceById(serviceId);
//     res.json(service);
// })

router.post('/getServiceIdbyResourceId', async (req, res) => {
    try {
        const { resource_id } = req.body;
        if (!resource_id) {
            return res.status(400).json({ error: "resource_id is required" });
        }
        const response = await getServiceIdbyResourceId(resource_id);
        res.status(200).send(response);
    } catch (error) {
        console.error("Error getting service ID by resource ID:", error);
        res.status(500).send({ error: error.message });
    }
});

// ✅ Update resource (single route only)
router.patch("/updateResource/:resource_id", async (req, res) => {
    try {
        const { resource_id } = req.params;
        const updatePayload = req.body;

        if (!updatePayload || Object.keys(updatePayload).length === 0) {
            return res.status(400).json({ error: "No update fields provided." });
        }

        const response = await updateResource(resource_id, updatePayload);

        res.status(200).json({
            message: "Resource updated successfully",
            data: response
        });
    } catch (error) {
        console.error("Error updating resource:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.message });
    }
});


// router.post('/updateResource/:resource_id', async (req, res) => {
//     try {
//         const { resource_id } = req.params;
//         const updatePayload = req.body;
//         const response = await updateResource(resource_id, updatePayload);
//         res.status(200).json({ message: 'Resource updated successfully', data: response.data });
//     } catch (error) {
//         console.error('Error updating resource (POST fallback):', error.response ? error.response.data : error.message);
//         res.status(500).send({ error: error.message });
//     }
// });

// Mount all routes under /booking_system
app.use('/booking_system', router);

// ===================================================
// ✅ Start Server
// ===================================================
const server = app.listen(4012, () => {
    console.log("✅ Server is running on port 4012");
    console.log("Process ID:", process.pid);
    console.log("Node.js version:", process.version);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error('Port 4012 is already in use');
        process.exit(1);
    }
});

// Graceful shutdown
const gracefulShutdown = () => {
    console.log('\nStarting graceful shutdown...');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

