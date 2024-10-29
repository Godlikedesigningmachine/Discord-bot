const express = require('express');
const multer = require('multer');
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const fs = require('fs');

// Encrypted Discord token (Base64 + Caesar cipher with a shift of 3)
// Replace this with your actual token encrypted accordingly
const ENCRYPTED_DISCORD_TOKEN = 'UFdMOFJXZjRQbUQ0UEdqM1BXXHxQR1h8UEQxSmxueERcMX1WRjQ8U2ldOEluU3pmfDVtfFNJVm52ZjNVNzxcXHJpMzlxOE16';
const CHANNEL_ID = '1299754851391115316'; // Replace with your actual channel ID

// Function to decrypt the token
function decryptToken(encryptedToken) {
    // Decode from Base64
    const base64Decoded = Buffer.from(encryptedToken, 'base64').toString('utf-8');
    
    // Reverse Caesar cipher (shift of 3)
    const decryptedToken = base64Decoded.split('').map(char => {
        return String.fromCharCode(char.charCodeAt(0) - 3);
    }).join('');

    return decryptedToken;
}

// Check if the token is loaded correctly (for debugging)
const DISCORD_TOKEN = decryptToken(ENCRYPTED_DISCORD_TOKEN);
console.log('Discord Token:', DISCORD_TOKEN);

// Initialize Express app
const app = express();

// Configure multer for file uploads (limit to 25 MB)
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 25 * 1024 * 1024 } // 25 MB
});

// Initialize Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// Function to send a file to a Discord channel
async function sendFileToChannel(filePath, fileName) {
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (!channel) throw new Error('Channel not found.');

    await channel.send({
        files: [{
            attachment: filePath,
            name: fileName
        }]
    });
}

// Root route to handle requests to '/'
app.get('/', (req, res) => {
    res.send('Welcome to the Discord File Upload Bot!');
});

// Endpoint to handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    const filePath = path.join(__dirname, req.file.path);
    const fileName = req.file.originalname;

    try {
        // Send the file to Discord
        await sendFileToChannel(filePath, fileName);
        res.status(200).send('File uploaded and sent to Discord!');
    } catch (error) {
        console.error('Error sending file to Discord:', error);
        res.status(500).send('Failed to send file to Discord.');
    } finally {
        // Delete the file after sending
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
    }
});

// Start the Express server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Log a message when the bot is ready
client.once('ready', () => {
    console.log('Bot is online!');
});

// Log in to Discord with the decrypted token
client.login(DISCORD_TOKEN).catch(error => {
    console.error('Failed to log in:', error);
});

// prevent roll back hahahahahaha
