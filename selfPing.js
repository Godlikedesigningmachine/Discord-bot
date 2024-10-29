const http = require('http');

function selfPing() {
    const options = {
        hostname: 'https://discord-bot-z883.onrender.com', // replace with your app's Render URL
        path: '/',
        method: 'GET',
    };

    const req = http.request(options, (res) => {
        console.log(`Self-ping status: ${res.statusCode}`);
    });

    req.on('error', (error) => {
        console.error(`Self-ping error: ${error.message}`);
    });

    req.end();
}

// Ping every 10 minutes (600,000 ms)
setInterval(selfPing, 600000);