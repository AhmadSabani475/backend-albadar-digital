import express from "express";
import bodyParser from "body-parser";
import router from "./routes/api";
import db from "./utils/database";

async function init() {
    try {
        const result = await db();
        console.log("Database Status", result);

        const app = express();
        const port = 3000

        app.use(bodyParser.json());
        app.use('/api', router);

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`)
        });
    } catch (error) {
        console.log(error);
    }
}
init()