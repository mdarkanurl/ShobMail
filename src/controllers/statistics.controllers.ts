import type { Context } from "hono";
import { senderAndSourceInsightsSchema } from "../dto";
import { StatisticsServices } from "../services";
import { CustomError } from "../utils";

export class StatisticsControllrs {
    private statisticsServices;

    constructor() {
        this.statisticsServices = new StatisticsServices();
    }
    
    async senderAndSourceInsights(c: Context) {
        try {
            const userId = c.get("jwtPayload")?.userId as string;
            const { success, data, error} = senderAndSourceInsightsSchema.safeParse(c.req.query());

            if(!success) return c.json({
                success: false,
                message: "Bad request",
                error
            }, 400);

            const response = await this.statisticsServices.senderAndSourceInsights(data, userId);

            return c.json({
                success: true,
                message: "",
                data: response
            });
        } catch (error) {
            return c.json({
                success: false,
                message: "An unexpected error occurred"
            }, 500);
        }
    }
}

