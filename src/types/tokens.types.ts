
export type UserCredentials = {
    access_token: string
    refresh_token: string
    scope: string
    token_type: string
    refresh_token_expires_in: number
    expiry_date: number
}

export type GmailData = {
    id: string | null | undefined
    threadId: string | undefined | null
    snippet: string
    from: string
    to: string
    subject: string
    date: string
    body: string
}
