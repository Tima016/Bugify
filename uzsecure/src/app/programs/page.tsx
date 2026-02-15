"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Grid3x3, List, Shield, ArrowRight, Zap, Trophy } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api-client"
import { Program } from "@/types"
import { formatCurrency, getSeverityColor } from "@/lib/utils"
import { Input } from '@/components/ui/input';
import { PublicHeader } from "@/components/layout/public-header"
import { motion } from "framer-motion"

export default function ProgramsPage() {
    const [sortBy, setSortBy] = useState('newest');
    const [searchQuery, setSearchQuery] = useState("")
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)

    // Filter states
    const [programTypes, setProgramTypes] = useState<{ public: boolean; private: boolean }>({
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
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-2 border-b-2 border-premium-accent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Shield className="h-8 w-8 text-premium-accent animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-premium-accent/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px]" />
            </div>

            <PublicHeader />

            {/* Header */}
            <div className="relative z-10 pt-32 pb-12 border-b border-border bg-background/50 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none hidden lg:block">
                        <Shield className="h-64 w-64 text-premium-accent rotate-12" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                            Bug Bounty Programs
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Discover active security programs, report vulnerabilities, and earn rewards helping clear the web of threats.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                <div className="mb-8">
                    <BackButton />
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0 space-y-6">
                        <Card className="border-border sticky top-24 bg-card/50 backdrop-blur-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                                    <Filter className="h-5 w-5 text-premium-accent" />
                                    Filter Programs
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Program Type</h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 group cursor-pointer">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${programTypes.public ? 'bg-premium-accent border-premium-accent' : 'border-border group-hover:border-primary/50'}`}>
                                                {programTypes.public && <Zap className="w-3 h-3 text-white" fill="currentColor" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={programTypes.public}
                                                onChange={(e) =>
                                                    setProgramTypes({
                                                        ...programTypes,
                                                        public: e.target.checked,
                                                    })
                                                }
                                            />
                                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Public Programs</span>
                                        </label>
                                        <label className="flex items-center gap-3 group cursor-pointer">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${programTypes.private ? 'bg-premium-accent border-premium-accent' : 'border-border group-hover:border-primary/50'}`}>
                                                {programTypes.private && <Zap className="w-3 h-3 text-white" fill="currentColor" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={programTypes.private}
                                                onChange={(e) =>
                                                    setProgramTypes({
                                                        ...programTypes,
                                                        private: e.target.checked,
                                                    })
                                                }
                                            />
                                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Private Programs</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <Button variant="outline" className="w-full border-border hover:bg-muted text-muted-foreground hover:text-foreground" onClick={resetFilters}>
                                        Reset All Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Search and View Controls */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8 bg-card/50 p-4 rounded-xl border border-border backdrop-blur-sm">
                            <div className="relative w-full sm:max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search programs by name or company..."
                                    value={searchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background border-input text-foreground focus:border-premium-accent h-10"
                                />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="text-foreground font-bold">{filteredPrograms.length}</span> programs
                            </div>
                        </div>

                        {/* Programs Grid/List */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            {filteredPrograms.map((program, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    key={program.id}
                                >
                                    <ProgramCard program={program} />
                                </motion.div>
                            ))}
                        </div>

                        {filteredPrograms.length === 0 && (
                            <div className="py-24 text-center border-2 border-dashed border-border rounded-2xl bg-card/30">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-medium text-foreground">No programs found</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                    Try adjusting your search or filters to find what you're looking for.
                                </p>
                                <Button variant="link" onClick={resetFilters} className="mt-4 text-premium-accent">
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ProgramCard({ program }: { program: Program }) {
    return (
        <Link href={`/programs/${program.slug}`} className="block h-full group">
            <Card className="h-full border-border bg-card/50 hover:bg-card hover:border-premium-accent/30 transition-all duration-500 flex flex-col relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent translate-x-[-100%] group-hover:animate-shimmer z-0" />

                <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-muted to-card border border-border flex-shrink-0 flex items-center justify-center overflow-hidden shadow-lg group-hover:shadow-premium-accent/20 transition-shadow">
                                {/* Logo handled by parent or placeholder */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <div className="text-xl font-bold text-muted-foreground">
                                    {program.programName.substring(0, 2).toUpperCase()}
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <CardTitle className="text-lg text-foreground group-hover:text-premium-accent transition-colors truncate mb-1">
                                    {program.programName}
                                </CardTitle>
                                <CardDescription className="truncate flex items-center gap-2">
                                    <Shield className="h-3 w-3" />
                                    {program.company?.companyName}
                                </CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className={`${program.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted text-muted-foreground border-border'} uppercase text-[10px] tracking-wider px-2 py-0.5`}>
                            {program.status}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col relative z-10">
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] bg-muted/30 p-3 rounded-lg border border-border">
                        {program.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-auto">
                        {program.targetTypes.slice(0, 3).map((type) => (
                            <Badge key={type} variant="secondary" className="font-medium text-xs bg-muted text-muted-foreground hover:bg-muted/80 border-transparent">
                                {type}
                            </Badge>
                        ))}
                        {program.targetTypes.length > 3 && (
                            <Badge variant="secondary" className="font-medium text-xs bg-muted text-muted-foreground hover:bg-muted/80 border-transparent">
                                +{program.targetTypes.length - 3}
                            </Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mt-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Max Bounty</p>
                            <p className="text-lg font-bold text-premium-accent truncate drop-shadow-sm">
                                {formatCurrency(program.maximumPayout, program.currency)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Avg Response</p>
                            <p className="text-lg font-semibold text-foreground truncate">{program.averageTriageTime || 24}h</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">
                            <span className="text-yellow-600 dark:text-yellow-500">★</span>
                            <span className="text-sm font-bold text-yellow-600 dark:text-yellow-500">{Number(program.researcherRating || 0).toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground/60 truncate flex items-center gap-1 group-hover:text-foreground transition-colors">
                            View Details <ArrowRight className="h-3 w-3" />
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
