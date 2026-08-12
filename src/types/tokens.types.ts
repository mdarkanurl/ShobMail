
export type UserCredentials = {
    access_token: string
    refresh_token: string
    scope: string
    token_type: string
    refresh_token_expires_in: number
    expiry_date: number
}

export type GmailData = {
    userId: string
    id: string
    threadId: string | undefined | null
    snippet: string
    from: string
    to: string
    subject: string
    date: string
    body: string
}
