import React, { useState } from 'react';
import { ArrowLeft, Upload, Brain, CheckCircle, AlertTriangle, Share, Save, MessageCircle } from 'lucide-react';
import { Button } from './core/Button';
import { StatusChip } from './core/StatusChip';
import { Progress } from './ui/progress';

interface UploadFlowProps {
  onBack: () => void;
}

type FlowStep = 'upload' | 'analyzing' | 'result';

export function UploadFlow({ onBack }: UploadFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = () => {
    setCurrentStep('analyzing');
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentStep('result'), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const mockAnalysisResult = {
    summary: "Your lipid panel shows elevated cholesterol levels. Your total cholesterol (245 mg/dL) and LDL cholesterol (165 mg/dL) are above target ranges, which may increase cardiovascular risk. HDL cholesterol and glucose levels are within normal ranges.",
    keyFindings: [
      {
        finding: "Elevated LDL Cholesterol",
        value: "165 mg/dL",
        target: "<100 mg/dL",
        risk: "high" as const
      },
      {
        finding: "Total Cholesterol Above Target",
        value: "245 mg/dL",
        target: "<200 mg/dL", 
        risk: "high" as const
      },
      {
        finding: "Blood Sugar in Range",
        value: "Normal",
        target: "Normal",
        risk: "low" as const
      }
    ],
    labResults: [
      { test: "Total Cholesterol", value: "245", unit: "mg/dL", refRange: "<200", flag: "high" as const },
      { test: "LDL Cholesterol", value: "165", unit: "mg/dL", refRange: "<100", flag: "high" as const },
      { test: "HDL Cholesterol", value: "42", unit: "mg/dL", refRange: ">40", flag: "normal" as const },
      { test: "Triglycerides", value: "189", unit: "mg/dL", refRange: "<150", flag: "high" as const },
      { test: "Glucose (Fasting)", value: "98", unit: "mg/dL", refRange: "70-99", flag: "normal" as const }
    ]
  };

  const getFlagColor = (flag: string) => {
    switch (flag) {
      case 'high': return 'text-danger';
      case 'low': return 'text-warning';
      case 'critical': return 'text-danger';
      default: return 'text-success';
    }
  };

  const getRiskVariant = (risk: string) => {
    switch (risk) {
      case 'high': return 'danger' as const;
      case 'moderate': return 'warning' as const;
      case 'low': return 'success' as const;
      default: return 'warning' as const;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 safe-area-top">
        <div className="flex items-center gap-3">
          <Button 
            variant="tertiary" 
            size="sm"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-h2 font-semibold text-foreground">
              {currentStep === 'upload' && 'Upload Report'}
              {currentStep === 'analyzing' && 'Analyzing Report'}
              {currentStep === 'result' && 'Analysis Results'}
            </h1>
            <p className="text-caption text-muted-foreground">
              {currentStep === 'upload' && 'Upload medical documents for AI analysis'}
              {currentStep === 'analyzing' && 'AI is processing your document'}
              {currentStep === 'result' && 'Review your analysis results'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Upload Step */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            <div className="bg-card rounded-card p-8 shadow-card border border-border">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-h3 font-semibold mb-2">Upload Medical Report</h2>
                <p className="text-body text-muted-foreground mb-6">
                  Drag & drop your files or click to browse
                </p>
                
                <Button onClick={handleUpload} size="lg" className="w-full">
                  <Upload className="w-5 h-5 mr-2" />
                  Choose Files
                </Button>
                
                <p className="text-caption text-muted-foreground mt-4">
                  Supports PDF, JPG, PNG up to 10MB
                </p>
              </div>
            </div>

            <div className="bg-accent-600/5 border border-accent-600/20 rounded-card p-4">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-accent-600" />
                <div>
                  <h3 className="text-body font-semibold text-foreground">AI-Powered Analysis</h3>
                  <p className="text-caption text-muted-foreground">
                    Advanced text extraction and intelligent health insights
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analyzing Step */}
        {currentStep === 'analyzing' && (
          <div className="space-y-6">
            <div className="bg-card rounded-card p-8 shadow-card border border-border">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-accent-600 animate-pulse" />
                </div>
                <h2 className="text-h3 font-semibold mb-2">Analyzing Document</h2>
                <p className="text-body text-muted-foreground mb-6">
                  AI is extracting text and analyzing your medical data
                </p>
                
                <Progress value={uploadProgress} className="mb-4" />
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-caption text-muted-foreground">Document uploaded successfully</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-caption text-muted-foreground">Text extracted with OCR</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-caption text-muted-foreground">Analyzing medical content...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result Step */}
        {currentStep === 'result' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-card rounded-card p-6 shadow-card border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-accent-600" />
                <h2 className="text-h3 font-semibold text-foreground">AI Summary</h2>
                <StatusChip variant="ai">
                  AI Generated
                </StatusChip>
              </div>
              <p className="text-body text-muted-foreground leading-relaxed">
                {mockAnalysisResult.summary}
              </p>
            </div>

            {/* Key Findings */}
            <div className="bg-card rounded-card p-6 shadow-card border border-border">
              <h3 className="text-h3 font-semibold text-foreground mb-4">Key Findings</h3>
              <div className="space-y-4">
                {mockAnalysisResult.keyFindings.map((finding, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-surface-subtle rounded-tile">
                    <div className="flex-1">
                      <p className="text-body font-medium text-foreground">{finding.finding}</p>
                      <p className="text-caption text-muted-foreground">
                        {finding.value} (Target: {finding.target})
                      </p>
                    </div>
                    <StatusChip variant={getRiskVariant(finding.risk)}>
                      {finding.risk.charAt(0).toUpperCase() + finding.risk.slice(1)} Risk
                    </StatusChip>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Results Table */}
            <div className="bg-card rounded-card p-6 shadow-card border border-border">
              <h3 className="text-h3 font-semibold text-foreground mb-4">Lab Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-caption font-semibold text-muted-foreground">Test</th>
                      <th className="text-right py-2 text-caption font-semibold text-muted-foreground">Value</th>
                      <th className="text-right py-2 text-caption font-semibold text-muted-foreground">Reference</th>
                      <th className="text-right py-2 text-caption font-semibold text-muted-foreground">Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAnalysisResult.labResults.map((result, index) => (
                      <tr key={index} className="border-b border-border last:border-b-0">
                        <td className="py-3 text-body font-medium text-foreground">{result.test}</td>
                        <td className="py-3 text-right tabular-nums text-body text-foreground">
                          {result.value} {result.unit}
                        </td>
                        <td className="py-3 text-right tabular-nums text-caption text-muted-foreground">
                          {result.refRange} {result.unit}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`text-caption font-medium ${getFlagColor(result.flag)}`}>
                            {result.flag.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Safety Disclaimer */}
            <div className="bg-warning/5 border border-warning/20 rounded-card p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h3 className="text-body font-semibold text-foreground">Important Medical Disclaimer</h3>
                  <p className="text-caption text-muted-foreground mt-1">
                    This AI analysis is for educational purposes only and should not replace professional medical advice. 
                    Always consult with qualified healthcare professionals for medical decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-3">
              <Button size="lg" className="w-full">
                <Save className="w-5 h-5 mr-2" />
                Save to Records
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" size="lg">
                  <Share className="w-5 h-5 mr-2" />
                  Share
                </Button>
                <Button variant="secondary" size="lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Ask Question
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}