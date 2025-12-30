"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ComparisonItem {
  planned: number;
  actual: number;
  diff: number;
  met: boolean;
  percent: number;
}

interface Props {
  title: string;
  data: ComparisonItem;
}

export default function BudgetComparison({ title, data }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          {title}
          <Badge variant={data.met ? "default" : "destructive"}>
            {data.met ? "Within Budget" : "Over Budget"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground">
          Planned: Ksh{data.planned.toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground">
          Actual: Ksh{data.actual.toLocaleString()}
        </div>

        <Progress value={data.percent} />

        <div
          className={`text-sm font-medium ${
            data.met ? "text-green-500" : "text-red-500"
          }`}
        >
          {data.met
            ? `Saved Ksh ${Math.abs(data.diff).toLocaleString()}`
            : `Exceeded by Ksh ${Math.abs(data.diff).toLocaleString()}`}
        </div>
      </CardContent>
    </Card>
  );
}
