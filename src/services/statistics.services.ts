import { gt, eq, and } from "drizzle-orm";
import { db, gmailData, statisticsResults } from "../db";
import type { SenderAndSourceInsightsDto } from "../dto";
import { queue } from "../utils";

export class StatisticsServices {
    
    async senderAndSourceInsights(
        data: SenderAndSourceInsightsDto,
        userId: string
    ): Promise<String> {
        
        try {
            const DaysAgo = new Date();
            DaysAgo.setDate(DaysAgo.getDate() - data.time_limit);

            const gmails = await db
                .select()
                .from(gmailData)
                .where(
                    and(
                        gt(gmailData.date, DaysAgo),
                        eq(gmailData.userId, userId),
                    )
                )
                .limit(data.gmail_limit);

            const [result] = await db
                .insert(statisticsResults)
                .values({ userId })
                .returning({ id: statisticsResults.id });

            queue.add('sender-source-insights', { userId, gmails, resultId: result?.id });
            return "Your request is in process"
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async processSenderAndSourceInsightsRequest() {
        try {
            console.log("This is from processSenderAndSourceInsightsRequest!");
            // What does it return?
                // 1. top sender
                // 2. top recipients
                // 3. category
                // 4. Top domains sender
                // 5. Unread email trends
                // 6. Meeting/calendar-invite frequency and response patterns
                // 7. Follow-up tracker
        } catch (error) {
            
        }
    }
}
