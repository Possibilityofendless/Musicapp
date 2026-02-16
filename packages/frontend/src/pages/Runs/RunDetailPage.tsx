import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  ChevronRight,
  RotateCcw,
  FileText,
  Code,
  Diff,
  FolderOpen,
  Zap,
} from "lucide-react";

export function RunDetailPage() {
  const { runId } = useParams();
  const [selectedStep, setSelectedStep] = useState(5); // Frontend step
  const [selectedTab, setSelectedTab] = useState<"markdown" | "json" | "diff" | "files" | "trace">(
    "markdown"
  );
  const [showLogs, setShowLogs] = useState(false);

  // Mock run data
  const run = {
    id: runId || "142",
    project: "E-commerce Redesign",
    workflow: "Full-stack Builder",
    branch: "feature/checkout-redesign",
    author: "John Doe",
    startedAt: "2 hours ago",
    status: "running",
  };

  const steps = [
    { name: "Intake", status: "success", duration: "2.3s", cost: "$0.01" },
    { name: "Manager", status: "success", duration: "5.1s", cost: "$0.05" },
    { name: "PM", status: "success", duration: "8.7s", cost: "$0.12" },
    { name: "UX/UI", status: "success", duration: "12.3s", cost: "$0.18" },
    { name: "Tech Lead", status: "success", duration: "6.8s", cost: "$0.09" },
    { name: "Frontend", status: "running", duration: "45.2s", cost: "$0.32" },
    { name: "Backend", status: "pending", duration: "-", cost: "-" },
    { name: "QA", status: "pending", duration: "-", cost: "-" },
    { name: "DevOps", status: "pending", duration: "-", cost: "-" },
    { name: "Aggregator", status: "pending", duration: "-", cost: "-" },
    { name: "Code Patch", status: "pending", duration: "-", cost: "-" },
    { name: "Test Gate", status: "pending", duration: "-", cost: "-" },
    { name: "PR Created", status: "pending", duration: "-", cost: "-" },
    { name: "Deploy", status: "pending", duration: "-", cost: "-" },
  ];

  const qualityGates = [
    { name: "Schema validation", status: "passed" },
    { name: "Lint check", status: "passed" },
    { name: "Unit tests", status: "running" },
    { name: "Security check", status: "pending" },
  ];

  const mockOutput = `# Frontend Implementation

## Component Structure

Created the following React components for the checkout flow:

\`\`\`typescript
// CheckoutForm.tsx
import React, { useState } from 'react';
import { PaymentMethod } from './PaymentMethod';
import { ShippingAddress } from './ShippingAddress';

export function CheckoutForm() {
  const [step, setStep] = useState(1);
  
  return (
    <div className="checkout-container">
      {step === 1 && <ShippingAddress onNext={() => setStep(2)} />}
      {step === 2 && <PaymentMethod onNext={() => setStep(3)} />}
    </div>
  );
}
\`\`\`

## Key Features
- Multi-step form with progress indicator
- Real-time validation
- Stripe integration for payments
- Responsive design for mobile and desktop

## Next Steps
The Backend agent will need to create the following API endpoints:
- POST /api/checkout/validate-address
- POST /api/checkout/process-payment
- GET /api/checkout/order-status/:id`;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "running":
        return <Clock className="w-5 h-5 text-yellow-400 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-900/30 text-green-400";
      case "running":
        return "bg-yellow-900/30 text-yellow-400";
      case "failed":
        return "bg-red-900/30 text-red-400";
      default:
        return "bg-slate-800/50 text-gray-400";
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-600/30">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link to="/runs" className="hover:text-white transition">
            Runs
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">#{run.id}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{run.project}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{run.workflow}</span>
              <span>•</span>
              <span>{run.branch}</span>
              <span>•</span>
              <span>Started {run.startedAt}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 glass rounded-lg border border-slate-600/30 hover:border-purple-500/50 text-gray-300 hover:text-white transition">
              Compare runs
            </button>
            <button className="px-4 py-2 btn-gradient text-white rounded-lg font-medium hover:scale-[1.02] transition">
              Re-run
            </button>
          </div>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel: Step Timeline */}
        <div className="w-80 border-r border-slate-600/30 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Pipeline Steps
            </h3>
            <div className="space-y-1">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedStep(index)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                    selectedStep === index
                      ? "bg-purple-600/20 border border-purple-500/30"
                      : "hover:bg-slate-700/50"
                  }`}
                >
                  {getStatusIcon(step.status)}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">{step.name}</p>
                    <p className="text-xs text-gray-400">{step.duration}</p>
                  </div>
                  {step.status === "success" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-1.5 hover:bg-slate-700/50 rounded text-gray-400 hover:text-white transition"
                      title="Rerun from here"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel: Output Viewer */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-600/30 bg-slate-800/30">
            {[
              { key: "markdown", label: "Markdown", icon: FileText },
              { key: "json", label: "JSON", icon: Code },
              { key: "diff", label: "Diff", icon: Diff },
              { key: "files", label: "Files", icon: FolderOpen },
              { key: "trace", label: "Trace", icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedTab === tab.key
                      ? "bg-slate-700/50 text-white"
                      : "text-gray-400 hover:text-white hover:bg-slate-700/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedTab === "markdown" && (
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap font-mono text-sm text-gray-300">
                  {mockOutput}
                </div>
              </div>
            )}
            {selectedTab === "json" && (
              <pre className="text-sm text-gray-300 bg-slate-900/50 p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(
                  {
                    step: "frontend",
                    status: "running",
                    output: {
                      components: ["CheckoutForm", "PaymentMethod", "ShippingAddress"],
                      files: 8,
                      linesAdded: 247,
                    },
                  },
                  null,
                  2
                )}
              </pre>
            )}
            {selectedTab === "diff" && (
              <div className="space-y-2">
                <div className="glass rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">
                      src/components/CheckoutForm.tsx
                    </span>
                    <span className="text-xs text-green-400">+125 lines</span>
                  </div>
                  <div className="space-y-1 font-mono text-xs">
                    <div className="text-green-400">+ export function CheckoutForm() {`{`}</div>
                    <div className="text-green-400">+   const [step, setStep] = useState(1);</div>
                    <div className="text-green-400">+   return (...)</div>
                    <div className="text-green-400">+ {`}`}</div>
                  </div>
                </div>
              </div>
            )}
            {selectedTab === "files" && (
              <div className="space-y-2">
                {[
                  "src/components/CheckoutForm.tsx",
                  "src/components/PaymentMethod.tsx",
                  "src/components/ShippingAddress.tsx",
                  "src/styles/checkout.css",
                ].map((file) => (
                  <div
                    key={file}
                    className="flex items-center gap-3 p-3 glass rounded-lg hover:border-purple-500/30 transition"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">{file}</span>
                  </div>
                ))}
              </div>
            )}
            {selectedTab === "trace" && (
              <div className="space-y-3">
                <div className="glass rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Tool Call: file_search</span>
                    <span className="text-xs text-gray-400">1.2s</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Searched for existing checkout components
                  </p>
                </div>
                <div className="glass rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Model: gpt-4</span>
                    <span className="text-xs text-gray-400">$0.32</span>
                  </div>
                  <p className="text-xs text-gray-400">Generated React components</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Context & Controls */}
        <div className="w-96 border-l border-slate-600/30 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Run Settings */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                Run Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Model</label>
                  <p className="text-sm text-white">GPT-4 Turbo</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Temperature</label>
                  <p className="text-sm text-white">0.7</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Max Concurrency</label>
                  <p className="text-sm text-white">3 agents</p>
                </div>
              </div>
            </div>

            {/* Quality Gates */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                Quality Gates
              </h3>
              <div className="space-y-2">
                {qualityGates.map((gate) => (
                  <div
                    key={gate.name}
                    className="flex items-center justify-between p-3 glass rounded-lg"
                  >
                    <span className="text-sm text-white">{gate.name}</span>
                    {gate.status === "passed" && (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    )}
                    {gate.status === "running" && (
                      <Clock className="w-4 h-4 text-yellow-400" />
                    )}
                    {gate.status === "pending" && (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Artifacts */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Artifacts</h3>
              <div className="space-y-2">
                {["PRD.md", "UI_SPEC.md", "API_SPEC.md"].map((artifact) => (
                  <button
                    key={artifact}
                    className="w-full flex items-center gap-3 p-3 glass rounded-lg hover:border-purple-500/30 transition text-left"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">{artifact}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
                Pinned Context
              </h3>
              <div className="space-y-2">
                <div className="p-3 glass rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Repository</p>
                  <p className="text-sm text-white">myorg/ecommerce-app</p>
                </div>
                <div className="p-3 glass rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Branch</p>
                  <p className="text-sm text-white">{run.branch}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel: Logs */}
      {showLogs && (
        <div className="h-64 border-t border-slate-600/30 bg-slate-900/50">
          <div className="flex items-center justify-between px-6 py-2 border-b border-slate-600/30">
            <h3 className="text-sm font-semibold text-gray-400">Logs</h3>
            <button
              onClick={() => setShowLogs(false)}
              className="text-gray-400 hover:text-white text-xs transition"
            >
              Hide
            </button>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-2.5rem)] font-mono text-xs text-gray-300">
            <div>[2024-02-16 12:34:21] Starting Frontend agent...</div>
            <div>[2024-02-16 12:34:23] Loading context and dependencies...</div>
            <div>[2024-02-16 12:34:25] Analyzing requirements...</div>
            <div className="text-green-400">
              [2024-02-16 12:34:30] ✓ Created CheckoutForm.tsx
            </div>
            <div className="text-green-400">
              [2024-02-16 12:34:35] ✓ Created PaymentMethod.tsx
            </div>
            <div>[2024-02-16 12:34:40] Running linter...</div>
          </div>
        </div>
      )}

      {/* Logs Toggle Button */}
      {!showLogs && (
        <button
          onClick={() => setShowLogs(true)}
          className="fixed bottom-4 right-4 px-4 py-2 glass rounded-lg border border-slate-600/30 hover:border-purple-500/50 text-gray-300 hover:text-white transition flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Show Logs
        </button>
      )}
    </div>
  );
}
