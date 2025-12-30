"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Layout from '@/components/Layout';
import { Loader2 } from 'lucide-react';
import {
    doc,
    getDoc,
    setDoc,
} from 'firebase/firestore';
import { WeeklyBudgetData } from '@/lib/types';
import { db } from '@/lib/firebase/firebase';
import WeekSelector from './WeekSelection';
import BudgetForm from './BudgetForm';
import { toast } from "sonner"

// Helper to get ISO week number (Monday-starting week)
function getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default function Weekly() {
    const { user } = useAuth();

    const currentDate = new Date();
    const [year, setYear] = useState(currentDate.getFullYear());
    const [week, setWeek] = useState(getWeekNumber(currentDate));
    const month = new Date().getMonth().toString();

    const [budgetData, setBudgetData] = useState<WeeklyBudgetData>({
        money_in: 0,
        daily_expenses: 0,
        investments: 0,
        big_purchases: 0,
        savings: 0,
        leisure_development: 0,
        charity: 0,
        notes: '',
        month: '',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Generate document ID
    const getDocId = () => `${user?.uid}_${year}_W${week.toString().padStart(2, '0')}`;

    // Memoize loadBudget to prevent unnecessary re-creation
    const loadBudget = useCallback(async () => {
        if (!user) {
            setBudgetData({
                money_in: 0,
                daily_expenses: 0,
                investments: 0,
                big_purchases: 0,
                savings: 0,
                leisure_development: 0,
                charity: 0,
                notes: '',
                month: ''
            });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const docRef = 
                doc(
                    db,
                    'users',
                    user!.uid,
                    'weekly_budgets',
                    `${year}_W${week.toString().padStart(2, '0')}`
                );
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setBudgetData({
                    money_in: Number(data.money_in) || 0,
                    daily_expenses: Number(data.daily_expenses) || 0,
                    investments: Number(data.investments) || 0,
                    big_purchases: Number(data.big_purchases) || 0,
                    savings: Number(data.savings) || 0,
                    leisure_development: Number(data.leisure_development) || 0,
                    charity: Number(data.charity) || 0,
                    notes: data.notes || '',
                    month: data.month || month
                });
            } else {
                // New week → start fresh
                setBudgetData({
                    money_in: 0,
                    daily_expenses: 0,
                    investments: 0,
                    big_purchases: 0,
                    savings: 0,
                    leisure_development: 0,
                    charity: 0,
                    notes: '',
                    month: ''
                });
            }
        } catch (error) {
            console.error('Error loading weekly budget:', error);
            toast.error("Failed to load budget data.");
        } finally {
            setIsLoading(false);
        }
    }, [user, year, week]); // Now stable dependencies

    // Load data when user, year, or week changes
    useEffect(() => {
        loadBudget();
    }, [loadBudget]);

    // Save handler
    const handleSave = async (data: WeeklyBudgetData) => {
        if (!user) {
            toast.info("You must be logged in to save.");
            return;
        }

        setIsSaving(true);
        try {
            const docRef = doc(
                db,
                'users',
                user.uid,
                'weekly_budgets',
                `${year}_W${week.toString().padStart(2, '0')}`
            );
            await setDoc(docRef, {
                user_id: user.uid,
                year,
                week_number: week,
                ...data,
                updated_at: new Date().toISOString(),
            }, { merge: true });

            // Optimistically update local state
            setBudgetData(data);

            toast(`Budget for week ${week} of ${year} saved successfully.`);
        } catch (error) {
            console.error('Error saving weekly budget:', error);
            toast.error("Could not save your budget. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Weekly Budget</h1>
                        <p className="text-muted-foreground">Track your weekly income and expenses</p>
                    </div>
                    <WeekSelector
                        year={year}
                        week={week}
                        onYearChange={setYear}
                        onWeekChange={setWeek}
                    />
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <BudgetForm
                        data={budgetData}
                        onSave={handleSave}
                        isLoading={isSaving}
                    />
                )}
            </div>
        </Layout>
    );
}