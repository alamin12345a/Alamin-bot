const a = require("axios");
const b = require("fs");
const c = require("path");
const g = require("os");
const h = c.join(__dirname, "cache", `${Date.now()}.png`);

module.exports = {
  config: {
    name: "edit",
    aliases: ["geminiedit"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 30,
    role: 0,
    shortDescription: "Edit or generate an image using EditV2 API",
    category: "AI",
    guide: {
      en: "{pn} <text> (reply to an image)",
    },
  },

  onStart: async function ({ message, event, args, api }) {
    const p = args.join(" ");
    if (!p) return message.reply("⚠️ Please provide some text for the image.");

    const u = "http://65.109.80.126:20409/aryan/editv2";
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      let q = { prompt: p };
      if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0]) {
        q.imgurl = event.messageReply.attachments[0].url;
      }

      const r = await a.get(u, { params: q });
      const d = r.data?.image_data;

      if (!d) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(`❌ API Error: ${r.data?.message || "Failed to get image data."}`);
      }

      const f = Buffer.from(d.replace(/^data:image\/\w+;base64,/, ""), "base64");
      b.writeFileSync(h, f);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await message.reply(
        {
          body: "✅ Image generated successfully!",
          attachment: b.createReadStream(h),
        },
        event.threadID,
        () => {
          b.unlinkSync(h);
        },
        event.messageID
      );

    } catch (e) {
      console.error("❌ API ERROR:", e.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("❌ An error occurred while creating or editing the image.");
    }
  }
};
