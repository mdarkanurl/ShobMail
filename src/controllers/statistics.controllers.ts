import type { Context } from "hono";
import { senderAndSourceInsightsSchema } from "../dto";
import { StatisticsServices } from "../services";
import { CustomError, isValidUUID } from "../utils";

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
                message: response.message,
                data: response.resultId
            });
        } catch (error) {
            return c.json({
                success: false,
                message: "An unexpected error occurred"
            }, 500);
        }
    }

    async senderAndSourceInsightsResults(c: Context) {
        try {
            const userId = c.get("jwtPayload")?.userId as string;
            const resultId = c.req.param("id");

            if (!resultId || !isValidUUID(resultId)) {
                return c.json({
                    success: false,
                    message: "Result ID is required"
                }, 400);
            }

            const result = await this.statisticsServices
                .senderAndSourceInsightsResults(userId, resultId);

            return c.json({
                success: true,
                message: "Result fetched successfully",
                data: result
            });
        } catch (error) {
            if (error instanceof CustomError) {
                return c.json({
                    success: false,
                    message: error.message
                }, error.statusCode as any);
            }
            return c.json({
                success: false,
                message: "An unexpected error occurred"
            }, 500);
        }
    }
}

