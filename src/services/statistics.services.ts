import { db, gmailData } from "../db";
import type { SenderAndSourceInsightsDto } from "../dto";

export class StatisticsServices {
    
    async senderAndSourceInsights(
        data: SenderAndSourceInsightsDto
    ) {
        
        try {
            /** 
             * I'm using here lowdb to store gmail. This endpoint returens Top sender, Sender categorization, New vs. recurring senders, Reply rate per sender info.
             * What I want you do is query lowdb to get the gmail. You'll only get the gmail that people send to me.
             * data object sends two fields gmail_limit: number; time_limit: string;
             * You job is right now write code that prioritize time_limit over gmail_limit. It query gmail from lowdb by filterring time.
             **/
            const gmails = db.select().from(gmailData);
            console.log(gmails);
        } catch (error) {
            throw error;
        }
    }
}
