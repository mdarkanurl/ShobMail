import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from "hono/cors";

const app = new Hono()

// middlewares
app.use('*', logger())
app.use('*', cors())

// router

app.get("/", (c) => {
    return c.json({
        ok: true,
        message: "App is running!"
    });
});

export default app
