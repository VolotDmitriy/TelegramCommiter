const express = require("express");
const axios = require("axios");
const logger = require("./utils/logger");

require('dotenv').config();

const app = express();
app.use(express.json());

app.use(logger);

app.get("/", async (req, res) => {
    res.send("Server is ready");
})

app.post("/", async (req, res) => {
    const commit = req.body.head_commit;
    if (!commit) return res.sendStatus(400);

    const author = req.body.pusher.name;
    const branch = req.body.ref.split("/").pop();  // Получаем название ветки
    const message = `🛠 *Новый коммит в репозитории!*  
🔹 *Автор:* ${author}  
🔹 *Ветка:* ${branch}  
🔹 *Сообщение:* ${commit.message}  
🔹 [Посмотреть коммит](${commit.url})`;

    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: process.env.CHAT_ID,
        text: message,
        parse_mode: "Markdown"
    });

    res.sendStatus(200);
});

app.listen(3000, () => console.log("Webhook сервер запущен"));
