const express = require('express');
const multer = require('multer');
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const fs = require('fs');

const ENCRYPTED_DISCORD_TOKEN = 'UFdMOFJXZjRQbUQ0UEdqM1BXXHxQR1h8UEQxSmxueERcMX1WRjQ8U2ldOEluU3pmfDVtfFNJVm52ZjNVNzxcXHJpMzlxOE16';
const CHANNEL_ID = '1299754851391115316'; // Replace with your actual channel ID

function decryptToken(encryptedToken) {
    const base64Decoded = Buffer.from(encryptedToken, 'base64').toString('utf-8');
    const decryptedToken = base64Decoded.split('').map(char => {
        return String.fromCharCode(char.charCodeAt(0) - 3);
    }).join('');
    return decryptedToken;
}

const DISCORD_TOKEN = decryptToken(ENCRYPTED_DISCORD_TOKEN);

const app = express();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 25 * 1024 * 1024 } });

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

async function sendFileToChannel(filePath, fileName) {
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (!channel) throw new Error('Channel not found.');
    await channel.send({ files: [{ attachment: filePath, name: fileName }] });
}

app.get('/', (req, res) => res.send('Welcome to the Discord File Upload Bot!'));

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    const filePath = path.join(__dirname, req.file.path);
    const fileName = req.file.originalname;

    try {
        await sendFileToChannel(filePath, fileName);
        res.status(200).send('File uploaded and sent to Discord!');
    } catch (error) {
        console.error('Error sending file to Discord:', error);
        res.status(500).send('Failed to send file to Discord.');
    } finally {
        fs.unlink(filePath, (err) => err && console.error('Error deleting file:', err));
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

client.on('ready', () => {
    console.log('Bot is online!');

    async function sendAndDelayedDeleteMessage() {
        try {
            const channel = await client.channels.fetch(CHANNEL_ID);
            const message = await channel.send('Keeping the bot awake!');
            console.log('Message sent at', new Date());

            // Wait 1 second before deleting the message
            setTimeout(async () => {
                await message.delete();
                console.log('Message deleted at', new Date());
            }, 10000); // 1 second in milliseconds
        } catch (error) {
            console.error('Error sending or deleting message:', error);
        }
    }

    console.log('Setting interval to send message every 1 second for testing.');

    // Start interval if not already started
    if (!global.messageInterval) {
        global.messageInterval = setInterval(sendAndDelayedDeleteMessage, 10000); // 1 second in milliseconds for testing
    }
});

client.login(DISCORD_TOKEN);
