"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Grid3x3, List } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api-client"
import { Program } from "@/types"
import { formatCurrency, getSeverityColor } from "@/lib/utils"
import { PublicHeader } from "@/components/layout/public-header"

export default function ProgramsPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [searchQuery, setSearchQuery] = useState("")
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)
    
    // Filter states
    const [programTypes, setProgramTypes] = useState<{public: boolean; private: boolean}>({
        public: true,
        private: false,
    })

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const data = await api.programs.getAll()
                setPrograms(data)
            } catch (error) {
                console.error("Failed to fetch programs:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchPrograms()
    }, [])

    // Apply filters
    const filteredPrograms = programs.filter((program) => {
        // Search filter
        const matchesSearch =
            program.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            program.company?.companyName.toLowerCase().includes(searchQuery.toLowerCase())

        if (!matchesSearch) return false

        // Program type filter
        const typeMatches =
            (programTypes.public && program.programType === 'public') ||
            (programTypes.private && program.programType === 'private')

        if (!typeMatches) return false

        return true
    })

    const resetFilters = () => {
        setSearchQuery("")
        setProgramTypes({ public: true, private: false })
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <PublicHeader />
            {/* Header */}
            <div className="border-b bg-card">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold">Bug Bounty Programs</h1>
                    <p className="mt-2 text-muted-foreground">
                        Discover and participate in active security programs
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filters
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Program Type</label>
                                    <div className="mt-2 space-y-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="rounded"
                                                checked={programTypes.public}
                                                onChange={(e) =>
                                                    setProgramTypes({
                                                        ...programTypes,
                                                        public: e.target.checked,
                                                    })
                                                }
                                            />
                                            <span className="text-sm">Public</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="rounded"
                                                checked={programTypes.private}
                                                onChange={(e) =>
                                                    setProgramTypes({
                                                        ...programTypes,
                                                        private: e.target.checked,
                                                    })
                                                }
                                            />
                                            <span className="text-sm">Private</span>
                                        </label>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full" onClick={resetFilters}>
                                    Reset Filters
                                </Button>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Search and View Controls */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search programs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === "grid" ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <Grid3x3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setViewMode("list")}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Programs Grid/List */}
                        <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2" : "space-y-4"}>
                            {filteredPrograms.map((program) => (
                                <ProgramCard key={program.id} program={program} viewMode={viewMode} />
                            ))}
                        </div>

                        {filteredPrograms.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="text-muted-foreground">No programs found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ProgramCard({ program, viewMode }: { program: Program; viewMode: "grid" | "list" }) {
    return (
        <Link href={`/programs/${program.slug}`}>
            <Card className="group h-full transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            {program.company?.logo && (
                                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                    <img
                                        src={program.company.logo}
                                        alt={program.company.companyName}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            <div>
                                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                    {program.programName}
                                </CardTitle>
                                <CardDescription>{program.company?.companyName}</CardDescription>
                            </div>
                        </div>
                        <Badge
                            variant={program.status === "active" ? "default" : "secondary"}
                            className="capitalize"
                        >
                            {program.status}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {program.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {program.targetTypes.slice(0, 3).map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                                {type}
                            </Badge>
                        ))}
                        {program.targetTypes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{program.targetTypes.length - 3} more
                            </Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <p className="text-xs text-muted-foreground">Max Bounty</p>
                            <p className="text-lg font-bold text-primary">
                                {formatCurrency(program.maximumPayout, program.currency)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Avg Response</p>
                            <p className="text-lg font-semibold">{program.averageTriageTime}h</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">Rating:</span>
                            <span className="text-sm font-medium">{Number(program.researcherRating || 0).toFixed(1)}</span>
                            <span className="text-yellow-500">★</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {program.totalValidReports} valid reports
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
