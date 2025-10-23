module.exports.config = {
    name: "toilet",
    version: "1.0.1",
    permission: 0,
    credits: "Nayan",
    description: "Sends a toilet meme with user's avatar",
    prefix: true,
    category: "user",
    usages: "@mention",
    cooldowns: 5,
    dependencies: {
        "fs-extra": "",
        "axios": "",
        "canvas": "",
        "jimp": ""
    }
};

const Canvas = require('canvas');
const jimp = require('jimp');
const fs = require('fs-extra');
const axios = require('axios');

module.exports.circle = async (image) => {
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
};

module.exports.onStart = async ({ event, api }) => {
    try {
        const path_toilet = __dirname + '/cache/toilet.png';

        // Ensure cache folder exists
        await fs.ensureDir(__dirname + '/cache');

        // Get user ID: either mentioned or sender
        const id = Object.keys(event.mentions)[0] || event.senderID;

        // Create canvas
        const canvas = Canvas.createCanvas(500, 670);
        const ctx = canvas.getContext('2d');

        // Load background
        const background = await Canvas.loadImage('https://i.imgur.com/Kn7KpAr.jpg');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Fetch avatar using axios
        const avatarRes = await axios.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' });
        const avatarCircular = await module.exports.circle(Buffer.from(avatarRes.data));
        const avatarImage = await Canvas.loadImage(avatarCircular);

        // Draw avatar
        ctx.drawImage(avatarImage, 135, 350, 205, 205);

        // Save and send
        const imageBuffer = canvas.toBuffer();
        fs.writeFileSync(path_toilet, imageBuffer);

        api.sendMessage({
            body: "🚽 Toilet Meme!",
            attachment: fs.createReadStream(path_toilet)
        }, event.threadID, () => fs.unlinkSync(path_toilet), event.messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage(`⚠ Error: ${e.message}`, event.threadID);
    }
};
