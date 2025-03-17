const axios = require("axios");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed",
        };
    }

    try {
        const body = JSON.parse(event.body);
        const commits = body.commits;
        const branch = body.ref?.split("/").pop() || "Неизвестная ветка";
        const author = body.pusher?.name || "Неизвестный автор";

        if (!commits || !Array.isArray(commits)) {
            console.error("Ошибка: commits отсутствует или не является массивом");
            return { statusCode: 400, body: "Invalid payload" };
        }

        if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.CHAT_ID) {
            console.error("Ошибка: TELEGRAM_BOT_TOKEN или CHAT_ID не заданы");
            return { statusCode: 500, body: "Missing Telegram credentials" };
        }

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

        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: process.env.CHAT_ID,
            text: message,
            parse_mode: "Markdown",
        });

        return { statusCode: 200, body: "Message sent successfully" };
    } catch (error) {
        console.error("Ошибка при обработке запроса:", error);
        return { statusCode: 500, body: "Internal Server Error" };
    }
};
