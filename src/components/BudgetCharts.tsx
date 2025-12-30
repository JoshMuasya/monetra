"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
    data: {
        category: string;
        Planned: number;
        Actual: number;
    }[];
}

export default function BudgetChart({ data }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Planned vs Actual</CardTitle>
            </CardHeader>
            <CardContent className="h-75">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Planned" />
                        <Bar dataKey="Actual" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
