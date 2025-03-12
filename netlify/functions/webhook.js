const axios = require("axios");

exports.handler = async (event) => {
    if (event.httpMethod === "GET") {
        return {
            statusCode: 200,
            body: "Server is ready",
        };
    }

    if (event.httpMethod === "POST") {
        const body = JSON.parse(event.body);
        const commit = body.head_commit;

        if (!commit) {
            return { statusCode: 400, body: "No commit data" };
        }

        if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.CHAT_ID) {
            return { statusCode: 500, body: "Missing Telegram credentials" };
        }

        const author = body.pusher.name;
        const branch = body.ref.split("/").pop();
        const message = `🛠 *Новый коммит в репозитории!*  
🔹 *Автор:* ${author}  
🔹 *Ветка:* ${branch}  
🔹 *Сообщение:* ${commit.message}  
🔹 [Посмотреть коммит](${commit.url})`;

        try {
            await axios.post(
                `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
                {
                    chat_id: process.env.CHAT_ID,
                    text: message,
                    parse_mode: "Markdown",
                }
            );
            return { statusCode: 200, body: "Message sent" };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify(error.response?.data || error.message),
            };
        }
    }

    return { statusCode: 405, body: "Method Not Allowed" };
};
