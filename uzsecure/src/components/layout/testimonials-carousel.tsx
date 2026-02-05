'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        content: "UzSecure has completely transformed how we handle security. The quality of reports we receive is outstanding, and the triage process is incredibly efficient.",
        author: "Aziz Rakhimov",
        role: "CTO at PayMe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aziz",
        rating: 5
    },
    {
        id: 2,
        content: "Best platform for bug bounty hunters in Central Asia. Fast payouts, clear scope definitions, and a very supportive community.",
        author: "Sardor M.",
        role: "Security Researcher",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sardor",
        rating: 5
    },
    {
        id: 3,
        content: "We launched our public program last month and found 3 critical vulnerabilities in the first week. The ROI is undeniable.",
        author: "Elena Kim",
        role: "CISO at UzTelekom",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
        rating: 4
    },
    {
        id: 4,
        content: "The platform interface is clean and intuitive. I love the dark mode and the real-time notification system when report statuses change.",
        author: "Jamshid K.",
        role: "Top Rated Hunter",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jamshid",
        rating: 5
    }
];

export function TestimonialsCarousel() {
    return (
        <section className="py-24 bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Trusted by Industry Leaders
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Hear from the companies and researchers building a safer Uzbekistan
                    </p>
                </div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full max-w-5xl mx-auto"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {testimonials.map((testimonial) => (
                            <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <Card className="h-full">
                                        <CardContent className="flex flex-col justify-between h-full p-6">
                                            <div className="space-y-4">
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < testimonial.rating
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "fill-muted text-muted"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-6 pt-6 border-t">
                                                <Avatar>
                                                    <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                                                    <AvatarFallback>{testimonial.author[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-semibold">{testimonial.author}</p>
                                                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </section>
    );
}
