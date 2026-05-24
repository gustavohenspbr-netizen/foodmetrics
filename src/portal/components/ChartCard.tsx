import React from "react";
import { Card, CardHeader } from "./ui/Card";

interface ChartCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  height?: number;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, action, height = 280, className, children }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <div style={{ height }}>{children}</div>
    </Card>
  );
}
