type TopSendersType = {
    sender: string
    count: number
}

type TopDomainsType = {
    domain: string
    count: number
}

type TopCategoriesType = {
    category: string
    count: number
}

type SourceBreakdownType = {
    "personal": number,
    "business": number,
    "marketing": number,
    "notifications": number,
    "newsletters": number,
    "unknown": number
}

type NewSendersType = {
    sender: string,
    firstSeen: Date
}

export type ResultType = {
    uniqueSenders: number
    uniqueDomains: number
    topSenders: TopSendersType[]
    topCategories: TopCategoriesType[]
    topDomains: TopDomainsType[]
    sourceBreakdown: SourceBreakdownType
    newSenders: NewSendersType[]
}

