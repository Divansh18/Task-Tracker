"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { getAnalytics } from "@/lib/api-client";
import { useAuth } from "@/components/providers/AuthProvider";
import { AnalyticsSummary } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const COLORS = ["#2563eb", "#22c55e", "#f97316", "#e11d48"];

export function AnalyticsDashboard() {
  const { token } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", token],
    enabled: Boolean(token),
    queryFn: () => getAnalytics(token as string),
  });

  const summary = data ?? ({} as AnalyticsSummary);

  const priorityData = summary.priorityBreakdown?.map((entry, index) => ({
    name: entry.priority.toUpperCase(),
    completed: entry.completed,
    open: entry.open,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Analytics dashboard</CardTitle>
          <CardDescription>
            Visualize completion trends, uncover bottlenecks, and understand how priority mix affects your progress.
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Loading analytics...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard title="Daily completion trend" description="Completed tasks over the past two weeks.">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={summary.completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Upcoming overdue risk" description="Tasks approaching or past due.">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={summary.overdueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard
              title="Priority balance"
              description="How many tasks are completed vs pending in each priority band."
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#22c55e" name="Completed" stackId="a" />
                  <Bar dataKey="open" fill="#2563eb" name="Open" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

          </div>
        </div>
      )}
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="transition hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">{children}</div>
      </CardContent>
    </Card>
  );
}

