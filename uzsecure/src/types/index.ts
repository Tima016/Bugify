export interface User {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    profilePicture?: string
    bio?: string
    role: "researcher" | "company" | "admin" | "moderator"
    reputationScore: number
    totalEarnings: number
    isVerified: boolean
    country: string
    skills: string[]
    createdAt: string
}

export interface Company {
    id: string
    companyName: string
    legalName: string
    website: string
    industry: string
    logo?: string
    description: string
    verificationStatus: "pending" | "verified" | "rejected"
    totalPrograms: number
    totalPaidOut: number
    averageResponseTime: number
}

export interface Program {
    id: string
    companyId: string
    company?: Company
    programName: string
    slug: string
    description: string
    programType: "public" | "private" | "invite_only"
    status: "active" | "paused" | "closed"
    launchDate: string
    scope: Asset[]
    outOfScope: string[]
    targetTypes: string[]
    vulnerabilityTypes: string[]
    minimumPayout: number
    maximumPayout: number
    averagePayout: number
    currency: string
    totalReports: number
    totalValidReports: number
    totalPaidOut: number
    averageTriageTime: number
    researcherRating: number
    hallOfFameEnabled: boolean
}

export interface Asset {
    url: string
    type: string
    eligibleForBounty: boolean
    description?: string
}

export interface Report {
    id: string
    reportNumber: string
    programId: string
    program?: Program
    researcherId: string
    researcher?: User
    title: string
    vulnerabilityType: string
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL" | "critical" | "high" | "medium" | "low" | "informational"
    cvssScore?: number
    description: string
    impactAnalysis: string
    impact?: string
    reproductionSteps: string
    proofOfConcept?: string
    attachments: string[]
    discoveredDate: string
    submittedDate: string
    status: "NEW" | "TRIAGED" | "NEEDS_MORE_INFO" | "ACCEPTED" | "DUPLICATE" | "INFORMATIVE" | "NOT_APPLICABLE" | "RESOLVED" | "CLOSED" | "new" | "triaged" | "needs_more_info" | "accepted" | "duplicate" | "informative" | "not_applicable" | "resolved" | "closed"
    bountyAmount?: number
    paymentStatus: "pending" | "approved" | "paid" | "rejected"
    timeToTriage?: number
    timeToResolution?: number
    createdAt?: string
    updatedAt?: string
}

export interface Payment {
    id: string
    reportId: string
    researcherId: string
    companyId: string
    amount: number
    currency: string
    paymentMethod: string
    status: "pending" | "processing" | "completed" | "failed"
    paidAt?: string
    createdAt: string
}

export interface LeaderboardEntry {
    rank: number
    researcher: User
    totalReports: number
    validReports: number
    criticalReports: number
    highReports: number
    totalEarnings: number
    reputationPoints: number
}

export interface Notification {
    id: string
    userId: string
    type: string
    title: string
    message: string
    link?: string
    isRead: boolean
    createdAt: string
}

export interface Activity {
    id: string
    type: "report_submitted" | "comment_added" | "status_changed" | "bounty_awarded" | "payment_completed"
    description: string
    timestamp: string
    icon: string
    color: string
}

export interface PayoutRequest {
    id: string;
    amount: number;
    currency: string;
    method: "UZCARD" | "HUMO" | "PAYPAL" | "CRYPTOCURRENCY";
    destination: Record<string, string>;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";
    createdAt: string;
}
