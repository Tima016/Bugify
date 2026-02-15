'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
    className?: string;
    label?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function BackButton({ className, label = "Back", variant = "ghost" }: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        // Safe navigation check
        if (window.history.length > 2) {
            router.back();
        } else {
            router.push('/');
        }
    };

    return (
        <Button
            variant={variant as any}
            onClick={handleBack}
            className={cn(
                "gap-2 pl-2 pr-4 hover:bg-white/10 hover:text-white transition-all duration-200 group text-muted-foreground",
                className
            )}
        >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {label && <span>{label}</span>}
        </Button>
    );
}
