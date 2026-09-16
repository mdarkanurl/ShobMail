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
    "/sender-source-info",
    isAuthenticated(),
    (c) => statisticsControllrs.senderAndSourceInsights(c)
);

statisticsRouter.get(
    /**
        After sending request to /sender-source-info endpoint user start hitting
        this endpoint with resultId.
        QUERY
        1. id = UUID
    */ 
    "/sender-source-info-results/:id",
    isAuthenticated(),
    (c) => statisticsControllrs.senderAndSourceInsightsResults(c)
);

export default statisticsRouter;
