const express = require("express");
const axios = require("axios");
const logger = require("./utils/logger");

const app = express();
app.use(express.json());
app.use(logger);

app.get("/", async (req, res) => {
    res.send("Server is ready");
});

app.post("/", async (req, res) => {
    const commits = req.body.commits; // Массив всех коммитов в пуше
    if (!commits || !Array.isArray(commits)) {
        console.error("Ошибка: commits отсутствует или не является массивом");
        return res.sendStatus(400);
    }

    const branch = req.body.ref.split("/").pop(); // Название ветки
    const author = req.body.pusher?.name || "Неизвестный автор"; // Автор пуша

    // Проверка наличия токена и chat_id
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.CHAT_ID) {
        console.error("Ошибка: TELEGRAM_BOT_TOKEN или CHAT_ID не заданы");
        return res.sendStatus(500);
    }

    // Формируем сообщение для всех коммитов
    let message = `🛠 *Новый пуш в репозитории!*  
🔹 *Автор:* ${author}  
🔹 *Ветка:* ${branch}  
🔹 *Коммиты:*  
`;

    commits.forEach((commit, index) => {
        message += `${index + 1}. *Сообщение:* ${commit.message}  
   [Посмотреть коммит](${commit.url})  
`;
    });

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
});

app.listen(3000, () => console.log("Webhook сервер запущен"));