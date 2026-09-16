import { db, statisticsResults } from "./db";
import { users } from "./db";

async function seedStatisticsResults() {
    try {
        const allUsers = await db.select({ id: users.id }).from(users);

        if (allUsers.length === 0) {
            console.log("No users found. Please seed users first.");
            return;
        }

        const sampleData = [
            {
                status: "Completed" as const,
                data: {
                    uniqueSenders: 42,
                    uniqueDomains: 28,
                    topSenders: [
                        { sender: "LinkedIn Jobs", email: "jobs@linkedin.com", count: 85 },
                        { sender: "Indeed Careers", email: "careers@indeed.com", count: 62 },
                        { sender: "Google Recruiters", email: "recruiting@google.com", count: 45 },
                        { sender: "Amazon HR", email: "hr@amazon.com", count: 38 },
                        { sender: "Microsoft Careers", email: "careers@microsoft.com", count: 33 },
                    ],
                    topCategories: [
                        { categories: "Job Alter" as const, count: 180 },
                        { categories: "Promoational" as const, count: 45 },
                    ],
                    topDomains: [
                        { domain: "linkedin.com", count: 95 },
                        { domain: "indeed.com", count: 72 },
                        { domain: "google.com", count: 50 },
                        { domain: "amazon.com", count: 42 },
                        { domain: "microsoft.com", count: 35 },
                    ],
                    sourceBreakdown: {
                        jobBoards: 167,
                        companies: 98,
                        newsletters: 30,
                        socialMedia: 15,
                        personal: 10,
                    },
                    newSenders: [
                        { sender: "Netflix Recruiting", firstSeen: new Date("2026-09-01") },
                        { sender: "Meta Careers", firstSeen: new Date("2026-09-05") },
                        { sender: "Stripe Jobs", firstSeen: new Date("2026-09-10") },
                    ],
                },
            },
            {
                status: "Completed" as const,
                data: {
                    uniqueSenders: 15,
                    uniqueDomains: 12,
                    topSenders: [
                        { sender: "Startup Weekly", email: "hello@startupweekly.io", count: 20 },
                        { sender: "Tech Jobs Daily", email: "jobs@techjobsdaily.com", count: 15 },
                    ],
                    topCategories: [
                        { categories: "Job Alter" as const, count: 35 },
                        { categories: "Promoational" as const, count: 10 },
                    ],
                    topDomains: [
                        { domain: "startupweekly.io", count: 22 },
                        { domain: "techjobsdaily.com", count: 18 },
                    ],
                    sourceBreakdown: {
                        jobBoards: 30,
                        companies: 8,
                        newsletters: 5,
                        socialMedia: 2,
                        personal: 0,
                    },
                    newSenders: [
                        { sender: "Startup Weekly", firstSeen: new Date("2026-08-20") },
                    ],
                },
            },
            {
                status: "Pending" as const,
                data: null,
            },
            {
                status: "Failed" as const,
                data: null,
            },
        ];

        const rows = allUsers.slice(0, 2).flatMap((user) =>
            sampleData.map((item) => ({
                userId: user.id,
                ...item,
            }))
        );

        const inserted = await db
            .insert(statisticsResults)
            .values(rows)
            .returning({ id: statisticsResults.id });

        console.log(`Seeded ${inserted.length} statistics results.`);
    } catch (error) {
        console.error("Failed to seed statistics results:", error);
        throw error;
    }
}

seedStatisticsResults();
