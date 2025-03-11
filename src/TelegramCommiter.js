const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = "7894563183:AAGhVFhM8s5qce6Zb6F_pgNvG4iWMs-xrhs";
const CHAT_ID = "-1002367299235";

app.post("/webhook", async (req, res) => {
    const commit = req.body.head_commit;
    if (!commit) return res.sendStatus(400);

    const author = req.body.pusher.name;
    const branch = req.body.ref.split("/").pop();  // Получаем название ветки
    const message = `🛠 *Новый коммит в репозитории!*  
🔹 *Автор:* ${author}  
🔹 *Ветка:* ${branch}  
🔹 *Сообщение:* ${commit.message}  
🔹 [Посмотреть коммит](${commit.url})`;

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown"
    });

    res.sendStatus(200);
});

app.listen(3000, () => console.log("Webhook сервер запущен"));
