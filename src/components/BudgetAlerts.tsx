import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Alert {
  message: string;
}

export default function BudgetAlerts({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return null;

  return (
    <Card className="border-yellow-500/30 bg-yellow-500/5">
      <CardContent className="pt-4 space-y-2">
        {alerts.map((alert, i) => (
          <div key={i} className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{alert.message}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
