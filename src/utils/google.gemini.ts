import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

interface ClassifyEmailRequest {
    from: string;
    subject: string;
    snippet: string;
}

type SourceCategory = "personal" | "business" | "marketing" | "notifications" | "newsletters" | "unknown";

const CLASSIFICATION_PROMPT = `Classify this email into exactly ONE of these categories: personal, business, marketing, notifications, newsletters, unknown.

Email details:
- From: {from}
- Subject: {subject}
- Snippet: {snippet}

Categories:
- personal: Personal emails from friends, family, or individual contacts
- business: Job-related emails, company communications, professional correspondence
- marketing: Promotional emails, sales, deals, advertisements
- notifications: System notifications, alerts, account updates, security alerts
- newsletters: Subscription-based newsletters, digests, curated content
- unknown: Cannot determine category

Return ONLY the category name in lowercase, nothing else.`;

export const classifyEmailWithAI = async (email: ClassifyEmailRequest): Promise<SourceCategory> => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = CLASSIFICATION_PROMPT
            .replace("{from}", email.from)
            .replace("{subject}", email.subject)
            .replace("{snippet}", email.snippet);

        const result = await model.generateContent(prompt);
        const response = result.response;
        const category = response.text().trim().toLowerCase() as SourceCategory;

        const validCategories: SourceCategory[] = ["personal", "business", "marketing", "notifications", "newsletters", "unknown"];
        if (validCategories.includes(category)) {
            return category;
        }

        return "unknown";
    } catch (error) {
        console.error("Error classifying email with AI:", error);
        return "unknown";
    }
};

export const classifyBulkEmails = async (emails: ClassifyEmailRequest[]): Promise<Map<string, SourceCategory>> => {
    const results = new Map<string, SourceCategory>();

    const BATCH_SIZE = 10;
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE);
        const promises = batch.map(async (email) => {
            const category = await classifyEmailWithAI(email);
            results.set(email.from, category);
        });
        await Promise.all(promises);
    }

    return results;
};
