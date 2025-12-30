import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WeekSelectorProps {
    year: number;
    week: number;
    onYearChange: (year: number) => void;
    onWeekChange: (week: number) => void;
}

export default function WeekSelector({ year, week, onYearChange, onWeekChange }: WeekSelectorProps) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
    const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

    const handlePrevWeek = () => {
        if (week === 1) {
            onWeekChange(52);
            onYearChange(year - 1);
        } else {
            onWeekChange(week - 1);
        }
    };

    const handleNextWeek = () => {
        if (week === 52) {
            onWeekChange(1);
            onYearChange(year + 1);
        } else {
            onWeekChange(week + 1);
        }
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                <ChevronLeft className="w-4 h-4" />
            </Button>

            <Select value={year.toString()} onValueChange={(v) => onYearChange(parseInt(v))}>
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

            <Select value={week.toString()} onValueChange={(v) => onWeekChange(parseInt(v))}>
                <SelectTrigger className="w-28">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {weeks.map((w) => (
                        <SelectItem key={w} value={w.toString()}>
                            Week {w}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={handleNextWeek}>
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
