type TopSendersType = {
    sender: string
    count: number
}

type TopDomainsType = {
    domain: string
    count: number
}

type TopCategoriesType = {
    categories: "Job Alter" | "Promoational"
    count: number
}

type SourceBreakdownType = {
    jobBoards: number
    companies: number
    newsletters: number
    socialMedia: number
    personal: number
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

