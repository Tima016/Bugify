'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/ui/back-button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Search, Crown, Zap, Flame, Shield } from 'lucide-react';

// Mock data for MVP
const leaderboardData = [
    { rank: 1, username: "bug_hunter_99", points: 15420, reports: 142, impact: "Critical", avatar: "/avatars/1.png" },
    { rank: 2, username: "secure_ninja", points: 12150, reports: 98, impact: "High", avatar: "/avatars/2.png" },
    { rank: 3, username: "whitehat_dev", points: 9840, reports: 85, impact: "High", avatar: "/avatars/3.png" },
    { rank: 4, username: "cyber_ghost", points: 8750, reports: 72, impact: "Medium", avatar: "/avatars/4.png" },
    { rank: 5, username: "net_warden", points: 7200, reports: 65, impact: "Medium", avatar: "/avatars/5.png" },
    { rank: 6, username: "crypto_expert", points: 6500, reports: 58, impact: "Low", avatar: "/avatars/6.png" },
    { rank: 7, username: "vuln_seeker", points: 5900, reports: 52, impact: "High", avatar: "/avatars/7.png" },
    { rank: 8, username: "packet_sniffer", points: 5120, reports: 48, impact: "Medium", avatar: "/avatars/8.png" },
    { rank: 9, username: "code_auditor", points: 4800, reports: 45, impact: "Low", avatar: "/avatars/9.png" },
    { rank: 10, username: "zero_day", points: 4200, reports: 40, impact: "Critical", avatar: "/avatars/10.png" },
];

export default function LeaderboardPage() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = leaderboardData.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]" />;
        if (rank === 3) return <Medal className="h-6 w-6 text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.5)]" />;
        return <span className="text-muted-foreground font-mono font-bold text-lg">#{rank}</span>;
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[0%] left-[20%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[128px]" />
            </div>

            <div className="container mx-auto py-10 px-4 space-y-8 relative z-10">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-12"
                >
                    <motion.div variants={item} className="text-center space-y-4 pt-8">
                        <div className="absolute left-4 top-8 lg:left-0">
                            <BackButton />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-premium-accent via-purple-500 to-blue-600">Hall of Fame</span>
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                            Recognizing the elite security researchers verifying the resilience of Uzbekistan's digital infrastructure.
                        </p>
                    </motion.div>

                    {/* Top 3 Cards - Hidden on mobile, visible on md+ */}
                    <motion.div variants={item} className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-16 max-w-5xl mx-auto">
                        {/* Rank 2 */}
                        <div className="transform translate-y-4">
                            <div className="text-center mb-4">
                                <div className="text-2xl font-bold text-gray-500 dark:text-gray-300">2nd Place</div>
                                <div className="text-sm text-muted-foreground">The Silver Hunter</div>
                            </div>
                            <Card className="border-border bg-card/80 backdrop-blur-xl hover:scale-105 transition-all duration-300 relative overflow-hidden shadow-lg">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gray-400 shadow-[0_0_10px_rgba(156,163,175,0.5)]" />
                                <CardHeader className="text-center pb-2 pt-8">
                                    <div className="mx-auto w-24 h-24 rounded-full border-4 border-gray-400 shadow-md flex items-center justify-center bg-background mb-4 text-3xl font-bold overflow-hidden relative">
                                        <Avatar className="w-full h-full">
                                            <AvatarImage src={leaderboardData[1].avatar} />
                                            <AvatarFallback className="bg-muted text-muted-foreground">SN</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <CardTitle className="text-2xl text-foreground">{leaderboardData[1].username}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center pb-8">
                                    <div className="text-3xl font-bold mb-3 text-gray-500 dark:text-gray-300">{leaderboardData[1].points.toLocaleString()}</div>
                                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border px-3 py-1">
                                        {leaderboardData[1].reports} Valid Reports
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Rank 1 */}
                        <div className="transform -translate-y-4 z-10">
                            <div className="text-center mb-4">
                                <div className="text-3xl font-bold text-yellow-500 animate-pulse">Champion</div>
                                <div className="text-sm text-yellow-600/70 dark:text-yellow-500/70">Top Validator</div>
                            </div>
                            <Card className="border-yellow-500/30 bg-card/90 backdrop-blur-xl scale-110 shadow-[0_0_50px_rgba(234,179,8,0.2)] hover:shadow-[0_0_60px_rgba(234,179,8,0.3)] transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.8)]" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent pointer-events-none" />
                                <CardHeader className="text-center pb-2 pt-8">
                                    <div className="relative mx-auto">
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] animate-bounce-slow">
                                            👑
                                        </div>
                                        <div className="mx-auto w-32 h-32 rounded-full border-4 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.4)] flex items-center justify-center bg-background mb-4 text-4xl overflow-hidden">
                                            <Avatar className="w-full h-full">
                                                <AvatarImage src={leaderboardData[0].avatar} />
                                                <AvatarFallback className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500">BH</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                    <CardTitle className="text-3xl text-foreground font-black tracking-wide">{leaderboardData[0].username}</CardTitle>
                                    <CardDescription className="text-yellow-600/80 dark:text-yellow-500/80 font-medium tracking-widest uppercase text-xs mt-1">Grand Master</CardDescription>
                                </CardHeader>
                                <CardContent className="text-center pb-10">
                                    <div className="text-5xl font-extrabold mb-4 bg-gradient-to-b from-yellow-400 to-yellow-700 bg-clip-text text-transparent filter drop-shadow-sm">
                                        {leaderboardData[0].points.toLocaleString()}
                                    </div>
                                    <div className="flex justify-center gap-2">
                                        <Badge className="bg-yellow-500 text-black font-bold hover:bg-yellow-400 px-4 py-1.5 text-sm">
                                            <Trophy className="w-3 h-3 mr-1" />
                                            {leaderboardData[0].reports} Reports
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Rank 3 */}
                        <div className="transform translate-y-4">
                            <div className="text-center mb-4">
                                <div className="text-2xl font-bold text-amber-700 dark:text-amber-600">3rd Place</div>
                                <div className="text-sm text-muted-foreground">Bronze Striker</div>
                            </div>
                            <Card className="border-border bg-card/80 backdrop-blur-xl hover:scale-105 transition-all duration-300 relative overflow-hidden shadow-lg">
                                <div className="absolute top-0 inset-x-0 h-1 bg-amber-700 shadow-[0_0_10px_rgba(180,83,9,0.5)]" />
                                <CardHeader className="text-center pb-2 pt-8">
                                    <div className="mx-auto w-24 h-24 rounded-full border-4 border-amber-700 shadow-md flex items-center justify-center bg-background mb-4 text-3xl overflow-hidden">
                                        <Avatar className="w-full h-full">
                                            <AvatarImage src={leaderboardData[2].avatar} />
                                            <AvatarFallback className="bg-amber-100 dark:bg-amber-900/20 text-amber-700">WD</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <CardTitle className="text-2xl text-foreground">{leaderboardData[2].username}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center pb-8">
                                    <div className="text-3xl font-bold mb-3 text-amber-700 dark:text-amber-600">{leaderboardData[2].points.toLocaleString()}</div>
                                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border px-3 py-1">
                                        {leaderboardData[2].reports} Valid Reports
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                    {/* Filter & Table */}
                    <motion.div variants={item} className="max-w-5xl mx-auto">
                        <Card className="border-border bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div>
                                        <CardTitle className="text-2xl text-foreground">Global Rankings</CardTitle>
                                        <CardDescription className="text-base text-muted-foreground/80">Real-time stats from the community.</CardDescription>
                                    </div>
                                    <div className="relative w-full md:w-80 group">
                                        <div className="absolute inset-0 bg-premium-accent/20 rounded-lg blur-xl group-hover:bg-premium-accent/30 transition-colors opacity-0 group-hover:opacity-100" />
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                        <Input
                                            placeholder="Search researchers..."
                                            className="pl-10 bg-background border-input text-foreground focus:border-premium-accent h-11 relative z-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-xl border border-border overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow className="hover:bg-transparent border-border">
                                                <TableHead className="w-[100px] text-foreground">Rank</TableHead>
                                                <TableHead className="text-foreground">Researcher</TableHead>
                                                <TableHead className="text-right text-foreground">Reputation Points</TableHead>
                                                <TableHead className="text-right text-foreground">Valid Reports</TableHead>
                                                <TableHead className="text-right hidden md:table-cell text-foreground">Highest Impact</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredData.map((user, index) => (
                                                <TableRow key={user.rank} className="hover:bg-muted/50 border-border transition-colors group">
                                                    <TableCell className="font-medium text-lg">
                                                        <div className="flex items-center gap-2 pl-2">
                                                            {getRankIcon(user.rank)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-4">
                                                            <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-premium-accent/50 transition-all">
                                                                <AvatarImage src={user.avatar} />
                                                                <AvatarFallback className="bg-muted text-muted-foreground">
                                                                    {user.username[0].toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="font-semibold text-foreground text-base group-hover:text-premium-accent transition-colors">{user.username}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-bold text-premium-accent text-lg">
                                                        {user.points.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground group-hover:text-foreground transition-colors">
                                                        {user.reports}
                                                    </TableCell>
                                                    <TableCell className="text-right hidden md:table-cell">
                                                        <Badge
                                                            variant="outline"
                                                            className={`
                                                                ${user.impact === 'Critical' ? 'border-red-500/50 text-red-600 dark:text-red-400 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : ''}
                                                                ${user.impact === 'High' ? 'border-orange-500/50 text-orange-600 dark:text-orange-400 bg-orange-500/10' : ''}
                                                                ${user.impact === 'Medium' ? 'border-yellow-500/50 text-yellow-600 dark:text-yellow-500 bg-yellow-500/10' : ''}
                                                                ${user.impact === 'Low' ? 'border-blue-500/50 text-blue-600 dark:text-blue-400 bg-blue-500/10' : ''}
                                                                uppercase tracking-wider text-[10px] px-2 py-0.5
                                                            `}
                                                        >
                                                            {user.impact}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
