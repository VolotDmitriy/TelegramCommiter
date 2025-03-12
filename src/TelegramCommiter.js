const express = require("express");
const axios = require("axios");
const logger = require("./utils/logger");


const app = express();
app.use(express.json());

app.use(logger);

app.get("/", async (req, res) => {
    res.send("Server is ready");
})

app.post("/", async (req, res) => {
    const commit = req.body.head_commit;
    if (!commit) return res.sendStatus(400);

    console.log("TELEGRAM_BOT_TOKEN:", process.env.TELEGRAM_BOT_TOKEN);
    console.log("CHAT_ID:", process.env.CHAT_ID);

    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.CHAT_ID) {
        console.error("Ошибка: TELEGRAM_BOT_TOKEN или CHAT_ID не заданы");
        return res.sendStatus(500);
    }

    const author = req.body.pusher.name;
    const branch = req.body.ref.split("/").pop(); 
    const message = `🛠 *Новый коммит в репозитории!*  
🔹 *Автор:* ${author}  
🔹 *Ветка:* ${branch}  
🔹 *Сообщение:* ${commit.message}  
🔹 [Посмотреть коммит](${commit.url})`;


    try {
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: process.env.CHAT_ID,
            text: message,
            parse_mode: "Markdown"
        });
        res.sendStatus(200);
    } catch (error) {
        console.error("Ошибка при отправке в Telegram:", error.response?.data || error.message);
        res.sendStatus(500);
    }

        res.sendStatus(200);
    });

app.listen(3000, () => console.log("Webhook сервер запущен"));
