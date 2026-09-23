import { gt, eq, and, ne } from "drizzle-orm";
import { db, gmailData, statisticsResults, users } from "../db";
import type { SenderAndSourceInsightsDto } from "../dto";
import { CustomError, queue } from "../utils";
import type { GmailData, ResultType } from "../types";

export class StatisticsServices {
    
    async senderAndSourceInsights(
        data: SenderAndSourceInsightsDto,
        userId: string
    ): Promise<{message: String, resultId: String}> {
        
        try {
            const DaysAgo = new Date();
            DaysAgo.setDate(DaysAgo.getDate() - data.time_limit);

            const gmails = await db
                .select({
                    id: gmailData.id,
                    threadId: gmailData.threadId,
                    userId: gmailData.userId,
                    snippet: gmailData.snippet,
                    from: gmailData.from,
                    to: gmailData.to,
                    subject: gmailData.subject,
                    date: gmailData.date,
                    body: gmailData.body,
                    createdAt: gmailData.createdAt,
                })
                .from(gmailData)
                .innerJoin(users, eq(gmailData.userId, users.id))
                .where(
                    and(
                        gt(gmailData.date, DaysAgo),
                        eq(gmailData.userId, userId),
                        ne(gmailData.from, users.email),
                    )
                )
                .limit(data.gmail_limit);

            const [result] = await db
                .insert(statisticsResults)
                .values({ userId })
                .returning({ id: statisticsResults.id });
            
            if(!result) throw new CustomError("Something went wrong", 500);

            queue.add('sender-source-insights', { gmails, resultId: result.id });
            return {
                message: "Your request is in process",
                resultId: result.id
            }
        } catch (error) {
            throw error;
        }
    }

    async senderAndSourceInsightsResults(userId: string, resultId: string) {
        try {
            const [result] = await db
                .select({
                    id: statisticsResults.id,
                    status: statisticsResults.status,
                    data: statisticsResults.data,
                    createdAt: statisticsResults.createdAt,
                })
                .from(statisticsResults)
                .where(
                    and(
                        eq(statisticsResults.id, resultId),
                        eq(statisticsResults.userId, userId)
                    )
                )
                .limit(1);

            if (!result) throw new CustomError("Result not found", 404);

            return {
                status: result.status,
                data: result.data,
                createdAt: result.createdAt,
            };
        } catch (error) {
            throw error;
        }
    }

    async processSenderAndSourceInsightsRequest(data: { gmails: GmailData[], resultId: string }): Promise<ResultType> {
        try {
            const { gmails, resultId } = data;

            const topSenders = new Map<string, ResultType["topSenders"][number]>();
            const uniqueSenders = new Set<string>();
            const uniqueDomains = new Set<string>();
            const categoryCounts = new Map<string, number>();
            
            for (const gmail of gmails) {          
                // get top senders
                const sender = gmail.from;
                const existing = topSenders.get(sender);

                topSenders.set(sender, {
                    sender: sender,
                    count: (existing?.count ?? 0) + 1,
                });

                // get unique senders
                const matchForUniqueSenders = gmail.from.match(
                    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
                );
                if (matchForUniqueSenders) uniqueSenders.add(matchForUniqueSenders[0]);

                // get unique domains
                const matchForUniqueDomains = gmail.from.match(/@(.+)$/);
                if (matchForUniqueDomains && matchForUniqueDomains[1]) {
                    uniqueDomains.add(matchForUniqueDomains[1]);
                }

                // get top categories
                for (const category of gmail.category) {
                    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
                }
            }

            const sortedTopSenders = new Map(
                [...topSenders.entries()].sort((a, b) => b[1].count - a[1].count)
            );

            const topCategories = [...categoryCounts.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => ({
                    category,
                    count,
                }));

            return {
                uniqueSenders: uniqueSenders.size,
                uniqueDomains: uniqueDomains.size,
                topSenders: Array.from(sortedTopSenders.values()),
                topCategories: topCategories,
                topDomains: [{ domain: "", count: 0 }],
                sourceBreakdown: {
                    companies: 0,
                    jobBoards: 0,
                    newsletters: 0,
                    personal: 0,
                    socialMedia: 0
                },
                newSenders: [{sender: "", firstSeen: new Date()}]
            };
        } catch (error) {
            throw error;
        }
    }
}
