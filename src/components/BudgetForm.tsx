import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, TrendingUp, ShoppingCart, PiggyBank, Briefcase, ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BudgetFormProps, WeeklyBudgetData } from '@/lib/types';


const categories = [
    { key: 'money_in', label: 'Money In', icon: TrendingUp, colorClass: 'bg-budget-money-in/10 text-budget-money-in' },
    { key: 'daily_expenses', label: 'Daily Expenses', icon: ShoppingCart, colorClass: 'bg-budget-daily-expenses/10 text-budget-daily-expenses' },
    { key: 'investments', label: 'Investments', icon: Briefcase, colorClass: 'bg-budget-investments/10 text-budget-investments' },
    { key: 'big_purchases', label: 'Big Purchases', icon: ShoppingBag, colorClass: 'bg-budget-big-purchases/10 text-budget-big-purchases' },
    { key: 'savings', label: 'Savings', icon: PiggyBank, colorClass: 'bg-budget-savings/10 text-budget-savings' },
    { key: 'leisure_development', label: 'Leisure / Personal Development', icon: Sparkles, colorClass: 'bg-budget-leisure/10 text-budget-leisure' },
    { key: 'charity', label: 'Charity', icon: Heart, colorClass: 'bg-budget-charity/10 text-budget-charity' },
] as const;

export default function BudgetForm({ data, onSave, isLoading }: BudgetFormProps) {
    const [formData, setFormData] = useState<WeeklyBudgetData>(data);

    useEffect(() => {
        setFormData(data);
    }, [data]);

    const handleChange = (key: keyof WeeklyBudgetData, value: string) => {
        if (key === 'notes') {
            setFormData((prev) => ({ ...prev, notes: value }));
        } else {
            const numValue = value === '' ? 0 : parseFloat(value) || 0;
            setFormData((prev) => ({ ...prev, [key]: numValue }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);

        console.log("Save Date", formData)
    };

    const totalOut = formData.daily_expenses + formData.investments + formData.big_purchases +
        formData.savings + formData.leisure_development + formData.charity;
    const balance = formData.money_in - totalOut;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                                        value={formData[cat.key] || ''}
                                        onChange={(e) => handleChange(cat.key, e.target.value)}
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
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">Total In</p>
                            <p className="text-xl font-bold text-budget-money-in font-mono">
                                Ksh {formData.money_in.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Out</p>
                            <p className="text-xl font-bold text-budget-daily-expenses font-mono">
                                Ksh {totalOut.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Balance</p>
                            <p className={cn(
                                "text-xl font-bold font-mono",
                                balance >= 0 ? "text-budget-money-in" : "text-budget-daily-expenses"
                            )}>
                                Ksh {balance.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Add any notes for this week..."
                    rows={3}
                />
            </div>

            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Budget'}
            </Button>
        </form>
    );
}
