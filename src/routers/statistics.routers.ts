import { Hono } from "hono";
import { StatisticsControllrs } from "../controllers";
import { isAuthenticated } from "../middlewares";

const statisticsRouter = new Hono();
const statisticsControllrs = new StatisticsControllrs();

// routers
statisticsRouter.get(
    /** query
        1. gmail_limit = 500
        2. time_limit = 30d
    */ 
    "/top-sender",
    isAuthenticated(),
    (c) => statisticsControllrs.senderAndSourceInsights(c)
);

export default statisticsRouter;
