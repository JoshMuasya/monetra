"use client";

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, CalendarDays, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from './AuthProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
    children: ReactNode;
}

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/weekly', label: 'Weekly Budget', icon: Calendar },
    { path: '/dashboard/monthly', label: 'Monthly Budget', icon: CalendarDays },
];

export default function Layout({ children }: LayoutProps) {
    const { signOut, user } = useAuth();
    const pathname = usePathname(); // Correct way to get current path in Next.js App Router

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="font-bold text-foreground">Budget Book</h1>
                            <p className="text-xs text-muted-foreground">52-Week Tracker</p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link key={item.path} href={item.path}>
                                <Button
                                    variant={pathname === item.path ? "secondary" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "gap-2",
                                        pathname === item.path && "bg-primary/10 text-primary"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground hidden sm:block">
                            {user?.email || 'Guest'}
                        </span>
                        <Button variant="ghost" size="icon" onClick={signOut}>
                            <LogOut className="w-4 h-4" />
                            <span className="sr-only">Sign out</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation (Bottom Bar) */}
                <nav className="md:hidden flex border-t border-border bg-card">
                    {navItems.map((item) => (
                        <Link key={item.path} href={item.path} className="flex-1">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full rounded-none gap-2 py-3 h-auto",
                                    pathname === item.path && "bg-primary/10 text-primary border-b-2 border-primary"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="text-xs">{item.label}</span>
                            </Button>
                        </Link>
                    ))}
                </nav>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
}