"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3 } from "lucide-react";

export default function WelcomePage() {
    const { user, loading } = useAuth();

    if (loading) return null;

    return (
        <main className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-xl text-center space-y-6 p-6 animate-fade-in">
                <div className="flex justify-center">
                    <BarChart3 className="h-12 w-12 text-primary" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight">
                    Welcome to Your Monetra
                </h1>

                <h3 className="text-4xl font-bold tracking-tight">
                    Your financial partner
                </h3>

                <p className="text-muted-foreground text-lg">
                    Track your income, savings, investments, and spending habits — all in one place.
                </p>

                <div className="flex justify-center gap-4 pt-4">
                    <Button asChild size="lg">
                        <Link href="/dashboard">
                            Go to Dashboard
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
