"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider'; // Adjust path as needed
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  TrendingUp,
  TrendingDown,
  Briefcase,
  PiggyBank,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

interface MonthlyBudgetData {
  planned_income: number;
  planned_expenses: number;
  planned_investments: number;
  planned_savings: number;
  notes: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const categories = [
  { key: 'planned_income', label: 'Planned Income', icon: TrendingUp, colorClass: 'bg-budget-money-in/10 text-budget-money-in' },
  { key: 'planned_expenses', label: 'Planned Expenses', icon: TrendingDown, colorClass: 'bg-budget-daily-expenses/10 text-budget-daily-expenses' },
  { key: 'planned_investments', label: 'Planned Investments', icon: Briefcase, colorClass: 'bg-budget-investments/10 text-budget-investments' },
  { key: 'planned_savings', label: 'Planned Savings', icon: PiggyBank, colorClass: 'bg-budget-savings/10 text-budget-savings' },
] as const;

export default function Monthly() {
  const { user } = useAuth();

  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1); // 1-12

  const [budgetData, setBudgetData] = useState<MonthlyBudgetData>({
    planned_income: 0,
    planned_expenses: 0,
    planned_investments: 0,
    planned_savings: 0,
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    if (user) {
      loadBudget();
    } else {
      setIsLoading(false);
    }
  }, [user, year, month]);

  const loadBudget = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const docRef = doc(
        db,
        'users',
        user.uid,
        'monthly_budgets',
        `${year}_${month.toString().padStart(2, '0')}`
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setBudgetData({
          planned_income: Number(data.planned_income) || 0,
          planned_expenses: Number(data.planned_expenses) || 0,
          planned_investments: Number(data.planned_investments) || 0,
          planned_savings: Number(data.planned_savings) || 0,
          notes: data.notes || '',
        });
      } else {
        // No existing budget → reset to zeros
        setBudgetData({
          planned_income: 0,
          planned_expenses: 0,
          planned_investments: 0,
          planned_savings: 0,
          notes: '',
        });
      }
    } catch (error) {
      console.error('Error loading monthly budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: keyof MonthlyBudgetData, value: string) => {
    if (key === 'notes') {
      setBudgetData((prev) => ({ ...prev, notes: value }));
    } else {
      const numValue = value === '' ? 0 : parseFloat(value) || 0;
      setBudgetData((prev) => ({ ...prev, [key]: numValue }));
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const docRef = doc(
        db,
        'users',
        user.uid,
        'monthly_budgets',
        `${year}_${month.toString().padStart(2, '0')}`
      );

      await setDoc(docRef, {
        user_id: user.uid,
        year,
        month,
        ...budgetData,
      });
    } catch (error) {
      console.error('Error saving monthly budget:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const plannedBalance =
    budgetData.planned_income -
    budgetData.planned_expenses -
    budgetData.planned_investments -
    budgetData.planned_savings;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Monthly Budget</h1>
            <p className="text-muted-foreground">Plan your monthly financial goals</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Card key={cat.key} className="border border-border overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cat.colorClass)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {cat.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground">Ksh</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={budgetData[cat.key] || ''}
                          onChange={(e) => handleChange(cat.key as keyof MonthlyBudgetData, e.target.value)}
                          className="pl-8 font-mono"
                          placeholder="0.00"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Summary */}
            <Card className="bg-secondary/50 border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Remaining After Planned</p>
                  <p
                    className={cn(
                      "text-3xl font-bold font-mono",
                      plannedBalance >= 0 ? "text-budget-money-in" : "text-budget-daily-expenses"
                    )}
                  >
                    Ksh {Math.abs(plannedBalance).toLocaleString()}
                    {plannedBalance < 0 && ' (shortfall)'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={budgetData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any notes for this month..."
                rows={3}
              />
            </div>

            <Button onClick={handleSave} className="w-full sm:w-auto" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Monthly Budget'}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}