import React from "react";
import {
  Plus,
  FileText,
  Calendar,
  Pill,
  Activity,
  Upload,
} from "lucide-react";
import { Button } from "./core/Button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 ${className}`}
    >
      <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-h3 font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-body text-muted-foreground mb-6 max-w-sm">
        {description}
      </p>
      <Button onClick={onAction} size="lg">
        <Plus className="w-5 h-5 mr-2" />
        {actionLabel}
      </Button>
    </div>
  );
}

export function DashboardEmptyState({
  onUpload,
}: {
  onUpload: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 safe-area-top">
        <h1 className="text-h2 font-semibold text-foreground">
          Welcome to HealTrack
        </h1>
        <p className="text-caption text-muted-foreground">
          Your personal health companion
        </p>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          {/* Icon with warm accent highlight */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative"
            style={{
              background: `linear-gradient(135deg, var(--color-primary-600) 0%, rgba(${
                getComputedStyle(document.documentElement)
                  .getPropertyValue("--color-accent-warm-600")
                  .replace("#", "")
                  .match(/.{2}/g)
                  ?.map((hex) => parseInt(hex, 16))
                  .join(", ") || "168, 68, 49"
              }, 0.24) 100%)`,
            }}
          >
            <Activity className="w-10 h-10 text-primary-600" />
            {/* Subtle warm accent dot */}
            <div
              className="absolute top-2 right-2 w-3 h-3 rounded-full"
              style={{
                backgroundColor: "var(--color-accent-warm-600)",
                opacity: 0.24,
              }}
            />
          </div>

          <h2 className="text-h2 font-semibold text-foreground mb-3">
            Let's get started with your health journey
          </h2>

          <p className="text-body text-muted-foreground mb-8">
            Upload your first medical report to begin tracking
            your health with AI-powered insights.
          </p>

          <div className="space-y-3">
            <Button
              onClick={onUpload}
              size="lg"
              className="w-full"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload First Report
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => console.log("Add medication")}
              >
                <Pill className="w-4 h-4 mr-1" />
                Add Medication
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  console.log("Schedule appointment")
                }
              >
                <Calendar className="w-4 h-4 mr-1" />
                Book Appointment
              </Button>
            </div>
          </div>

          <div className="mt-8 bg-surface-subtle rounded-card p-4">
            <h3 className="text-body font-semibold text-foreground mb-2">
              Getting Started Tips
            </h3>
            <ul className="text-caption text-muted-foreground space-y-1 text-left">
              <li>• Upload lab results for AI analysis</li>
              <li>• Add your current medications</li>
              <li>• Schedule upcoming appointments</li>
              <li>• Track daily health metrics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MedicationsEmptyState({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 safe-area-top">
        <h1 className="text-h2 font-semibold text-foreground">
          Medications
        </h1>
        <p className="text-caption text-muted-foreground">
          Track your prescriptions and dosages
        </p>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center p-4">
        <EmptyState
          icon={
            <Pill className="w-8 h-8 text-muted-foreground" />
          }
          title="No medications added yet"
          description="Start by adding your current medications to get reminders and track your dosages."
          actionLabel="Add Medication"
          onAction={onAdd}
        />
      </div>
    </div>
  );
}

export function AppointmentsEmptyState({
  onSchedule,
}: {
  onSchedule: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 safe-area-top">
        <h1 className="text-h2 font-semibold text-foreground">
          Appointments
        </h1>
        <p className="text-caption text-muted-foreground">
          Manage your healthcare appointments
        </p>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center p-4">
        <EmptyState
          icon={
            <Calendar className="w-8 h-8 text-muted-foreground" />
          }
          title="No appointments scheduled"
          description="Schedule your next healthcare appointment and get reminders before your visit."
          actionLabel="Schedule Appointment"
          onAction={onSchedule}
        />
      </div>
    </div>
  );
}

export function ReportsEmptyState({
  onUpload,
}: {
  onUpload: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <EmptyState
        icon={
          <FileText className="w-8 h-8 text-muted-foreground" />
        }
        title="No medical reports yet"
        description="Upload your lab results, imaging reports, or other medical documents for AI analysis."
        actionLabel="Upload Report"
        onAction={onUpload}
      />
    </div>
  );
}