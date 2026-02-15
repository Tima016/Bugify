"use client";

import { PublicFooter } from "@/components/layout/public-footer"
import { PublicHeader } from "@/components/layout/public-header"
import { motion, useScroll, useTransform } from "framer-motion"
import { Shield, TrendingUp, Users, Zap, CheckCircle2, Lock, Globe, ArrowRight, Award, Target } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useEffect, useState, useRef } from "react"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface PlatformStats {
  totalBountiesPaid: number;
  activePrograms: number;
  totalResearchers: number;
  vulnerabilitiesFixed: number;
}

export default function LandingPage() {
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalBountiesPaid: 0,
    activePrograms: 0,
    totalResearchers: 0,
    vulnerabilitiesFixed: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/platform/stats');
        setPlatformStats(response.data);
      } catch (error) {
        console.error('Failed to fetch platform stats:', error);
        setPlatformStats({
          totalBountiesPaid: 1250000,
          activePrograms: 140,
          totalResearchers: 2500,
          vulnerabilitiesFixed: 850
        })
      }
    };
    fetchStats();
  }, []);

  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-premium-accent/30" ref={targetRef}>
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Premium Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-premium-gradient opacity-20 dark:opacity-10"></div>
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-premium-accent/20 rounded-full blur-[128px] animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-premium-accent/30 bg-premium-accent/10 px-4 py-1.5 text-sm font-medium text-premium-accent mb-8 backdrop-blur-md shadow-premium-glow">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-premium-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-premium-accent"></span>
              </span>
              The #1 Bug Bounty Platform in Central Asia
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9]">
              Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-premium-accent via-purple-500 to-blue-500 animate-text-shimmer">The Future</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed text-balance">
              Connect with an elite community of ethical hackers to secure your digital assets.
              Launch your bug bounty program today and pay only for valid results.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/register?role=COMPANY">
                <Button size="xl" variant="premium">
                  <Shield className="mr-2 h-5 w-5" />
                  Launch Program
                </Button>
              </Link>
              <Link href="/register">
                <Button size="xl" variant="premium-outline">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Hacking
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Stats (Glassmorphism) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto"
          >
            <StatItem label="Bounties Paid" value={`$${(platformStats.totalBountiesPaid / 1000).toFixed(0)}K+`} />
            <StatItem label="Active Programs" value={platformStats.activePrograms.toString()} />
            <StatItem label="Researchers" value={`${(platformStats.totalResearchers / 1000).toFixed(1)}K+`} />
            <StatItem label="Vulns Fixed" value={platformStats.vulnerabilitiesFixed.toString()} />
          </motion.div>
        </motion.div>
      </section>

      {/* Modern Bento Grid Features */}
      <section className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Security moving at <span className="text-premium-accent">lightspeed</span></h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Traditional pentesting is too slow. Crowdsource your security with UzSecure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Large Card */}
            <Card variant="premium" className="md:col-span-2 p-8 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-premium-accent/10 rounded-full blur-3xl group-hover:bg-premium-accent/20 transition-all duration-500" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-premium-accent/10 flex items-center justify-center mb-6 text-premium-accent">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Continuous Global Coverage</h3>
                <p className="text-muted-foreground text-lg max-w-md">
                  24/7 testing by a global community of vetted researchers.
                  Your assets are monitored around the clock, not just during a scheduled pentest.
                </p>
              </div>
            </Card>

            {/* Tall Card */}
            <Card variant="glass" className="md:row-span-2 p-8 flex flex-col relative overflow-hidden">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-500">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Elite Experts</h3>
              <p className="text-muted-foreground mb-8">Access a curated network of ethical hackers with diverse skill sets from web to mobile and crypto.</p>
              <div className="mt-auto relative h-48 w-full bg-gradient-to-t from-premium-accent/20 to-transparent rounded-lg border border-white/5 backdrop-blur-sm p-4">
                {/* Mock Leaderboard UI */}
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded bg-white/5">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <div className="h-2 w-24 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Regular Card */}
            <Card variant="premium" className="p-8 flex flex-col justify-center">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 text-green-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Pay on Results</h3>
              <p className="text-muted-foreground">No wasted budget. You only pay for valid, high-impact vulnerability reports.</p>
            </Card>

            {/* Regular Card */}
            <Card variant="premium" className="p-8 flex flex-col justify-center">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Bank-Grade Ops</h3>
              <p className="text-muted-foreground">Strict vetting, ID checks, and VPN requirements for all researchers on private programs.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section (Premium) */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-premium-accent/5 z-0" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 z-0" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Card variant="glass" className="p-12 md:p-20 border-premium-accent/20 shadow-premium-glow">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Ready to secure your future?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join 100+ forward-thinking companies securing their users with UzSecure.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8 bg-premium-accent hover:bg-premium-accent/90 text-white shadow-premium-glow">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-12 px-8 border-white/20 hover:bg-white/10 text-white">
                  Talk to an Expert
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <Card variant="glass" className="p-6 text-center border-white/5 bg-white/5 hover:bg-white/10">
      <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/50 mb-2">{value}</div>
      <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">{label}</div>
    </Card>
  )
}

