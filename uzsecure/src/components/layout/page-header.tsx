'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
    title: string;
    description?: string;
    parent?: {
        name: string;
        href: string;
    };
}

export function PageHeader({ title, description, parent }: PageHeaderProps) {
    const router = useRouter();

    return (
        <div className="space-y-6 pb-8 border-b border-border/40">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                {parent && (
                    <>
                        <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push(parent.href)}>
                            {parent.name}
                        </span>
                        <span>/</span>
                    </>
                )}
                <span className="text-foreground">{title}</span>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
            >
                <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    {title}
                </h1>
                {description && (
                    <p className="text-lg text-muted-foreground max-w-3xl">
                        {description}
                    </p>
                )}
            </motion.div>
        </div>
    );
}
