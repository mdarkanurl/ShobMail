import { Hono } from "hono";
import { StatisticsControllrs } from "../controllers";

const statisticsRouter = new Hono();
const statisticsControllrs = new StatisticsControllrs();

// routers
statisticsRouter.get(
    /** query
        1. gmail_limit = 500
        2. time_limit = 30d
    */ 
    "/top-sender",
    (c) => statisticsControllrs.senderAndSourceInsights(c)
);

export default statisticsRouter;
