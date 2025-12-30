import { User } from "@firebase/auth";
import { LucideIcon } from "lucide-react";

export interface BudgetCategoryCardProps {
    title: string;
    amount: number;
    icon: LucideIcon;
    colorClass: string;
    trend?: 'up' | 'down' | 'neutral';
    subtitle?: string;
}

export interface WeeklyBudgetData {
    money_in: number;
    daily_expenses: number;
    investments: number;
    big_purchases: number;
    savings: number;
    leisure_development: number;
    charity: number;
    notes: string;
    month: string;
}

export interface BudgetFormProps {
    data: WeeklyBudgetData;
    onSave: (data: WeeklyBudgetData) => void;
    isLoading?: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}