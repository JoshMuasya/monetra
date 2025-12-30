"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Layout from '@/components/Layout';
import { Loader2, AlertCircle, TrendingUp, TrendingDown, DollarSign, Heart, Sparkles } from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { WeeklyBudgetData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

interface WeeklySummary {
  year: number;
  week: number;
  money_in: number;
  daily_expenses: number;
  investments: number;
  big_purchases: number;
  savings: number;
  leisure_development: number;
  charity: number;
  total_out: number;
  balance: number;
}

const COLORS = {
  money_in: '#10b981',
  savings: '#3b82f6',
  investments: '#8b5cf6',
  leisure: '#f59e0b',
  charity: '#ef4444',
  expenses: '#dc2626',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<WeeklySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentYear] = useState(new Date().getFullYear());
  const [lastYear] = useState(currentYear - 1);

  const loadAllWeeklyData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'users', user.uid, 'weekly_budgets'),
        orderBy('year', 'desc'),
        orderBy('week_number', 'desc'),
        limit(104) // Last 2 years (52 weeks each)
      );

      const querySnapshot = await getDocs(q);
      const data: WeeklySummary[] = [];

      querySnapshot.forEach((doc) => {
        const d = doc.data();
        const money_in = Number(d.money_in) || 0;
        const daily_expenses = Number(d.daily_expenses) || 0;
        const investments = Number(d.investments) || 0;
        const big_purchases = Number(d.big_purchases) || 0;
        const savings = Number(d.savings) || 0;
        const leisure_development = Number(d.leisure_development) || 0;
        const charity = Number(d.charity) || 0;

        const total_out = daily_expenses + investments + big_purchases + savings + leisure_development + charity;
        const balance = money_in - total_out;

        data.push({
          year: d.year,
          week: d.week_number,
          money_in,
          daily_expenses,
          investments,
          big_purchases,
          savings,
          leisure_development,
          charity,
          total_out,
          balance,
        });
      });

      // Sort chronologically
      data.sort((a, b) => a.year - b.year || a.week - b.week);
      setWeeklyData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAllWeeklyData();
  }, [loadAllWeeklyData]);

  // Aggregations
  const thisYearData = weeklyData.filter((d) => d.year === currentYear);
  const lastYearData = weeklyData.filter((d) => d.year === lastYear);

  const avgWeeklyIncomeThisYear = thisYearData.length
    ? thisYearData.reduce((sum, w) => sum + w.money_in, 0) / thisYearData.length
    : 0;

  const avgWeeklySavingsThisYear = thisYearData.length
    ? thisYearData.reduce((sum, w) => sum + w.savings, 0) / thisYearData.length
    : 0;

  const totalSavingsThisYear = thisYearData.reduce((sum, w) => sum + w.savings, 0);
  const totalCharityThisYear = thisYearData.reduce((sum, w) => sum + w.charity, 0);
  const totalLeisureThisYear = thisYearData.reduce((sum, w) => sum + w.leisure_development, 0);

  const weeksWithNegativeBalance = thisYearData.filter((w) => w.balance < 0).length;

  // Chart Data
  const monthlyIncomeData = thisYearData.reduce((acc: any[], week) => {
    const month = new Date(currentYear, 0, 1 + (week.week - 1) * 7).toLocaleString('default', { month: 'short' });
    const existing = acc.find((m) => m.month === month);
    if (existing) {
      existing.income += week.money_in;
      existing.savings += week.savings;
    } else {
      acc.push({ month, income: week.money_in, savings: week.savings });
    }
    return acc;
  }, []);

  const categoryPieData = [
    { name: 'Savings', value: totalSavingsThisYear },
    { name: 'Investments', value: thisYearData.reduce((s, w) => s + (Number(w.investments) || 0), 0) },
    { name: 'Leisure & Dev', value: totalLeisureThisYear },
    { name: 'Charity', value: totalCharityThisYear },
    { name: 'Daily Expenses', value: thisYearData.reduce((s, w) => s + (Number(w.daily_expenses) || 0), 0) },
    { name: 'Big Purchases', value: thisYearData.reduce((s, w) => s + (Number(w.big_purchases) || 0), 0) },
  ].filter((c) => c.value > 0);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Your financial overview for {currentYear}</p>
        </div>

        {/* Budget Alerts */}
        {weeksWithNegativeBalance > 2 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Budget Alert</AlertTitle>
            <AlertDescription>
              You had negative balance in {weeksWithNegativeBalance} weeks this year. Consider reviewing spending patterns.
            </AlertDescription>
          </Alert>
        )}

        {avgWeeklySavingsThisYear < avgWeeklyIncomeThisYear * 0.1 && avgWeeklySavingsThisYear > 0 && (
          <Alert>
            <TrendingDown className="h-4 w-4" />
            <AlertTitle>Savings Tip</AlertTitle>
            <AlertDescription>
              Your average weekly savings is only {(avgWeeklySavingsThisYear / avgWeeklyIncomeThisYear * 100).toFixed(1)}% of income.
              Aim for at least 20%!
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Weekly Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-budget-money-in">
                Ksh {avgWeeklyIncomeThisYear.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {thisYearData.length} weeks tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saved This Year</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-budget-savings">
                Ksh {totalSavingsThisYear.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg Ksh {avgWeeklySavingsThisYear.toFixed(0)}/week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Charity Given</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-budget-charity">
                Ksh {totalCharityThisYear.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal Growth Spend</CardTitle>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-budget-leisure">
                Ksh {totalLeisureThisYear.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income vs Savings Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Income & Savings Trend ({currentYear})</CardTitle>
              <CardDescription>Monthly averages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyIncomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number | undefined) =>
                      value != null ? `${Number(value).toLocaleString()}` : '—'
                    }
                  />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke={COLORS.money_in} name="Income" strokeWidth={2} />
                  <Line type="monotone" dataKey="savings" stroke={COLORS.savings} name="Savings" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Spending Breakdown Pie */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Allocation ({currentYear})</CardTitle>
              <CardDescription>Where your money went</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: Ksh ${value.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-Ksh{index}`} fill={
                        entry.name === 'Savings' ? COLORS.savings :
                          entry.name === 'Charity' ? COLORS.charity :
                            entry.name.includes('Leisure') ? COLORS.leisure :
                              entry.name.includes('Investment') ? COLORS.investments :
                                entry.name.includes('Daily') ? COLORS.expenses :
                                  '#94a3b8'
                      } />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined) =>
                      value != null ? `Ksh ${Number(value).toLocaleString()}` : '—'
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Year-over-Year Comparison (if last year has data) */}
        {lastYearData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Comparison</CardTitle>
              <CardDescription>{lastYear} vs {currentYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Weekly Income</p>
                  <p className="text-xl font-bold">
                    Ksh {avgWeeklyIncomeThisYear.toFixed(0)}
                    <Badge variant="outline" className="ml-2">
                      {((avgWeeklyIncomeThisYear / (
                        lastYearData.reduce((s, w) => s + w.money_in, 0) / lastYearData.length || 1
                      ) - 1) * 100).toFixed(1)}%
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-xl font-bold">
                    Ksh {avgWeeklyIncomeThisYear.toFixed(0)}
                    {(() => {
                      if (lastYearData.length === 0) return <Badge variant="outline" className="ml-2 text-muted-foreground">New</Badge>;

                      const lastYearAvgIncome = lastYearData.reduce((s, w) => s + w.money_in, 0) / lastYearData.length;
                      if (lastYearAvgIncome === 0) return <Badge variant="outline" className="ml-2 text-muted-foreground">New</Badge>;

                      const percentageChange = ((avgWeeklyIncomeThisYear / lastYearAvgIncome) - 1) * 100;
                      const isPositive = percentageChange > 0;

                      return (
                        <Badge
                          variant="outline"
                          className={cn(
                            "ml-2 font-medium",
                            isPositive ? "text-green-600 border-green-600" : "text-red-600 border-red-600"
                          )}
                        >
                          {isPositive ? "↑" : "↓"} {Math.abs(percentageChange).toFixed(1)}%
                        </Badge>
                      );
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weeks in Red</p>
                  <p className="text-xl font-bold text-destructive">
                    {weeksWithNegativeBalance}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}