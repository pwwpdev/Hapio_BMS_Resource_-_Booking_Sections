const { spawn } = require('child_process');
const path = require('path');

console.log('Starting HAPIO server with monitoring...');

function startServer() {
    const serverProcess = spawn('node', ['index.js'], {
        stdio: 'inherit',
        cwd: __dirname
    });

    serverProcess.on('close', (code) => {
        console.log(`\nServer process exited with code ${code}`);

        if (code !== 0) {
            console.log('Server crashed! Restarting in 3 seconds...');
            setTimeout(() => {
                console.log('Restarting server...');
                startServer();
            }, 3000);
        }
    });

    serverProcess.on('error', (error) => {
        console.error('Failed to start server:', error);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\nShutting down server monitor...');
        serverProcess.kill('SIGTERM');
        process.exit(0);
    });

    return serverProcess;
}

// Start the server
startServer();