"use client";

import { TestimonialsCarousel } from "@/components/layout/testimonials-carousel"
import { PublicFooter } from "@/components/layout/public-footer"
import { PublicHeader } from "@/components/layout/public-header"
import { motion } from "framer-motion"
import { Shield, TrendingUp, Users, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

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
      }
    };
    fetchStats();
  }, []);
  return (
    <div className="min-h-screen">
      <PublicHeader />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 dark:from-blue-900 dark:via-blue-950 dark:to-black">
        {/* ... existing hero code ... */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Secure Uzbekistan's
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Digital Future
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100 sm:text-xl">
              Join the leading bug bounty platform connecting security researchers with companies across Uzbekistan
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/programs">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50">
                  <Shield className="mr-2 h-5 w-5" />
                  Browse Programs
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Start Hunting
                </Button>
              </Link>
            </div>

            {/* Animated Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4"
            >
              <StatCard
                icon={<TrendingUp className="h-6 w-6" />}
                value={`$${(platformStats.totalBountiesPaid / 1000).toFixed(0)}K+`}
                label="Bounties Paid"
              />
              <StatCard
                icon={<Shield className="h-6 w-6" />}
                value={platformStats.activePrograms}
                label="Active Programs"
              />
              <StatCard
                icon={<Users className="h-6 w-6" />}
                value={`${(platformStats.totalResearchers / 1000).toFixed(1)}K+`}
                label="Researchers"
              />
              <StatCard
                icon={<Zap className="h-6 w-6" />}
                value={platformStats.vulnerabilitiesFixed}
                label="Bugs Fixed"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 h-96 w-96 rounded-full bg-green-500/20 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Choose UzSecure?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The most trusted bug bounty platform in Central Asia
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Trusted Platform"
              description="Verified companies and researchers. All programs are vetted for legitimacy and security."
              delay={0.1}
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Fast Payouts"
              description="Get paid quickly through multiple payment methods including UzCard, Humo, and international options."
              delay={0.2}
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Expert Community"
              description="Join a growing community of security researchers and learn from the best in the field."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start earning rewards in three simple steps
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <StepCard
              number="01"
              title="Find Vulnerabilities"
              description="Browse active programs and test applications for security vulnerabilities"
              delay={0.1}
            />
            <StepCard
              number="02"
              title="Submit Reports"
              description="Document your findings and submit detailed reports through our platform"
              delay={0.2}
            />
            <StepCard
              number="03"
              title="Get Rewarded"
              description="Receive bounties for valid vulnerabilities and build your reputation"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of researchers protecting Uzbekistan's digital infrastructure
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50">
                  Create Account
                </Button>
              </Link>
              <Link href="/programs">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  View Programs
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
      <div className="text-white">{icon}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-blue-100">{label}</div>
    </div>
  )
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="group relative overflow-hidden rounded-lg border bg-card p-8 transition-all hover:shadow-lg hover:scale-105"
    >
      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}

function StepCard({ number, title, description, delay }: { number: string; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="relative"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
          {number}
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}
