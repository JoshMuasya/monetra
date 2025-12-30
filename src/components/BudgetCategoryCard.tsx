import { BudgetCategoryCardProps } from '@/lib/types';
import { cn } from '@/lib/utils';


export default function BudgetCategoryCard({
    title,
    amount,
    icon: Icon,
    colorClass,
    subtitle,
}: BudgetCategoryCardProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-start justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorClass)}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground font-mono">
                {formatCurrency(amount)}
            </p>
            {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
        </div>
    );
}
