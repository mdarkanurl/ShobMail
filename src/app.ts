import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from "hono/cors";
import { gmailRouter, authRouter, statisticsRouter } from "./routers"

const app = new Hono()

// middlewares
app.use('*', logger())
app.use('*', cors())

// router
app.route("/api/gmail", gmailRouter);
app.route("/api/auth", authRouter);
app.route("/api/statistics", statisticsRouter);

app.get("/", (c) => {
    return c.json({
        ok: true,
        message: "App is running!"
    });
});

export default app
