"use client"

import { use, useState, useEffect } from "react"
import { Shield, Clock, DollarSign, Star, Users, ExternalLink, Copy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api-client"
import { formatCurrency, getSeverityColor } from "@/lib/utils"
// import { notFound } from "next/navigation" 
import { Program } from "@/types"

export default function ProgramDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const [program, setProgram] = useState<Program | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                const data = await api.programs.getBySlug(slug)
                setProgram(data)
            } catch (error) {
                console.error("Failed to fetch program:", error)
                // Optionally handle redirect to 404 here or just show not found state
            } finally {
                setLoading(false)
            }
        }

        fetchProgram()
    }, [slug])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!program) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-bold">Program not found</h2>
                <Link href="/programs">
                    <Button>Back to Programs</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="border-b bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-4">
                            {program.company?.logo && (
                                <div className="h-20 w-20 rounded-lg bg-white p-2 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={program.company.logo}
                                        alt={program.company.companyName}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-white">{program.programName}</h1>
                                <p className="mt-1 text-blue-100">{program.company?.companyName}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Badge className="bg-white/20 text-white border-white/30">
                                        {program.programType}
                                    </Badge>
                                    <Badge className="bg-green-500/20 text-green-100 border-green-500/30">
                                        {program.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link href={`/dashboard/submit?program=${program.id}`}>
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                                    <Shield className="mr-2 h-5 w-5" />
                                    Submit Report
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard
                            icon={<DollarSign className="h-5 w-5" />}
                            label="Max Bounty"
                            value={formatCurrency(program.maximumPayout, program.currency)}
                        />
                        <StatCard
                            icon={<Clock className="h-5 w-5" />}
                            label="Avg Response"
                            value={`${program.averageTriageTime}h`}
                        />
                        <StatCard
                            icon={<Users className="h-5 w-5" />}
                            label="Valid Reports"
                            value={program.totalValidReports?.toString() || "0"}
                        />
                        <StatCard
                            icon={<Star className="h-5 w-5" />}
                            label="Rating"
                            value={Number(program.researcherRating || 0).toFixed(1)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs Content */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Program Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">{program.description}</p>

                                <div>
                                    <h3 className="font-semibold mb-2">Target Types</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {program.targetTypes.map((type) => (
                                            <Badge key={type} variant="outline">{type}</Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">Accepted Vulnerabilities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {program.vulnerabilityTypes.map((type) => (
                                            <Badge key={type} variant="secondary">{type}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scope */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Scope</CardTitle>
                                <CardDescription>Assets eligible for testing</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {program.scope.map((asset, index) => (
                                        <div key={index} className="flex items-start justify-between gap-4 rounded-lg border p-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                                        {asset.url}
                                                    </code>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(asset.url)}
                                                        className="text-muted-foreground hover:text-foreground"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">{asset.type}</p>
                                            </div>
                                            {asset.eligibleForBounty && (
                                                <Badge variant="default" className="shrink-0">Bounty Eligible</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {program.outOfScope.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="font-semibold mb-3">Out of Scope</h4>
                                        <ul className="space-y-2">
                                            {program.outOfScope.map((item, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <span className="text-red-500">✗</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Rewards */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Rewards</CardTitle>
                                <CardDescription>Bounty ranges by severity</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { severity: "Critical", min: program.maximumPayout * 0.7, max: program.maximumPayout },
                                        { severity: "High", min: program.maximumPayout * 0.4, max: program.maximumPayout * 0.7 },
                                        { severity: "Medium", min: program.maximumPayout * 0.2, max: program.maximumPayout * 0.4 },
                                        { severity: "Low", min: program.minimumPayout, max: program.maximumPayout * 0.2 },
                                    ].map((reward) => (
                                        <div key={reward.severity} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center gap-3">
                                                <Badge className={getSeverityColor(reward.severity)}>
                                                    {reward.severity}
                                                </Badge>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">
                                                    {formatCurrency(reward.min, program.currency)} - {formatCurrency(reward.max, program.currency)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 rounded-lg bg-muted p-4">
                                    <p className="text-sm">
                                        <strong>Average Payout:</strong> {formatCurrency(program.averagePayout, program.currency)}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Based on {program.totalValidReports} valid reports
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Company Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Company Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Industry</p>
                                    <p className="font-medium">{program.company?.industry}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Website</p>
                                    <a
                                        href={program.company?.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                                    >
                                        {program.company?.website}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Paid Out</p>
                                    <p className="font-medium">{formatCurrency(program.totalPaidOut, program.currency)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Program Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Program Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Reports</span>
                                    <span className="font-medium">{program.totalReports}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Valid Reports</span>
                                    <span className="font-medium text-green-600">{program.totalValidReports}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Success Rate</span>
                                    <span className="font-medium">
                                        {((program.totalValidReports / program.totalReports) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Avg Triage Time</span>
                                    <span className="font-medium">{program.averageTriageTime}h</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/dashboard/submit?program=${program.id}`}>
                                    <Button className="w-full">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Submit Report
                                    </Button>
                                </Link>
                                <Button variant="outline" className="w-full">
                                    <Star className="mr-2 h-4 w-4" />
                                    Bookmark Program
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-blue-100">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        </div>
    )
}
