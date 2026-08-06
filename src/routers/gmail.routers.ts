import { Hono } from "hono";
import { GmailControllers } from "../controllers";

const gmailRouter = new Hono();
const gmailControllers = new GmailControllers()

// routers
gmailRouter.get(
    "connect",
    (c) => gmailControllers.connect(c)
);


export default gmailRouter;
