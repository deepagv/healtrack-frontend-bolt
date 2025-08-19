import React, { useState } from 'react';
import { ArrowLeft, Share, Save, MessageCircle, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Input } from './ui/input';

interface LabResult {
  test: string;
  value: string;
  unit: string;
  refRange: string;
  flag: 'normal' | 'high' | 'low' | 'critical';
}

export function ReportAnalysisScreen() {
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'ai'; message: string }>>([]);
  const [chatInput, setChatInput] = useState('');

  const labResults: LabResult[] = [
    { test: 'Total Cholesterol', value: '245', unit: 'mg/dL', refRange: '<200', flag: 'high' },
    { test: 'LDL Cholesterol', value: '165', unit: 'mg/dL', refRange: '<100', flag: 'high' },
    { test: 'HDL Cholesterol', value: '42', unit: 'mg/dL', refRange: '>40', flag: 'normal' },
    { test: 'Triglycerides', value: '189', unit: 'mg/dL', refRange: '<150', flag: 'high' },
    { test: 'Glucose (Fasting)', value: '98', unit: 'mg/dL', refRange: '70-99', flag: 'normal' },
    { test: 'HbA1c', value: '5.4', unit: '%', refRange: '<5.7', flag: 'normal' },
  ];

  const getFlagIcon = (flag: LabResult['flag']) => {
    switch (flag) {
      case 'high':
        return <TrendingUp className="w-4 h-4 text-critical" />;
      case 'low':
        return <TrendingDown className="w-4 h-4 text-critical" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-critical" />;
      default:
        return <Minus className="w-4 h-4 text-success" />;
    }
  };

  const getFlagColor = (flag: LabResult['flag']) => {
    switch (flag) {
      case 'high':
      case 'low':
      case 'critical':
        return 'text-critical';
      default:
        return 'text-success';
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    setChatMessages(prev => [...prev, { type: 'user', message: chatInput }]);
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        message: "LDL cholesterol is a type of 'bad' cholesterol. Levels above 100 mg/dL may increase your risk of heart disease. Consider discussing lifestyle changes like diet and exercise with your doctor, as well as potential medication options."
      }]);
    }, 1000);
    
    setChatInput('');
  };

  const suggestedQuestions = [
    "What does high LDL mean?",
    "What should I ask my doctor?",
    "How can I lower my cholesterol?",
    "Are these results concerning?"
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card p-4 border-b border-subtle">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-h3 font-semibold">Lipid Panel Results</h1>
            <p className="text-caption text-low">Analyzed on March 15, 2024</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* AI Summary */}
        <Card className="shadow-card border-l-4 border-l-accent">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                AI Summary
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-body leading-relaxed">
              Your lipid panel shows elevated cholesterol levels. Your total cholesterol (245 mg/dL) and LDL cholesterol (165 mg/dL) are above target ranges, which may increase cardiovascular risk. HDL cholesterol and glucose levels are within normal ranges. Consider discussing lifestyle modifications and potential treatment options with your healthcare provider.
            </p>
          </CardContent>
        </Card>

        {/* Key Findings */}
        <div>
          <h2 className="text-h3 font-semibold mb-3">Key Findings</h2>
          <div className="space-y-3">
            <Card className="shadow-card border-l-4 border-l-warning">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-warning border-warning">
                    High
                  </Badge>
                  <div>
                    <p className="text-body font-medium">Elevated LDL Cholesterol</p>
                    <p className="text-caption text-low">165 mg/dL (target: &lt;100 mg/dL)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-l-4 border-l-warning">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-warning border-warning">
                    High
                  </Badge>
                  <div>
                    <p className="text-body font-medium">Total Cholesterol Above Target</p>
                    <p className="text-caption text-low">245 mg/dL (target: &lt;200 mg/dL)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-l-4 border-l-success">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-success border-success">
                    Normal
                  </Badge>
                  <div>
                    <p className="text-body font-medium">Blood Sugar in Range</p>
                    <p className="text-caption text-low">Glucose and HbA1c within normal limits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lab Results Table */}
        <div>
          <h2 className="text-h3 font-semibold mb-3">Detailed Results</h2>
          <Card className="shadow-card">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {labResults.map((result, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-body font-medium">{result.test}</p>
                        <p className="text-caption text-low">Ref: {result.refRange} {result.unit}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-body font-medium ${getFlagColor(result.flag)}`}>
                            {result.value} {result.unit}
                          </p>
                        </div>
                        {getFlagIcon(result.flag)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div>
          <h2 className="text-h3 font-semibold mb-3">Recommendations</h2>
          <Card className="shadow-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <p className="text-body">Consider a heart-healthy diet low in saturated fats</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <p className="text-body">Aim for 150 minutes of moderate exercise weekly</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <p className="text-body">Discuss medication options with your doctor</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <p className="text-body">Schedule follow-up testing in 6-8 weeks</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save to Records
          </Button>
          <Button variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Ask AI */}
        <Sheet>
          <SheetTrigger asChild>
            <Button className="w-full bg-accent hover:bg-accent/90">
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask AI a Question
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Ask About Your Results</SheetTitle>
              <SheetDescription>
                Get explanations about your lab results. Informational only - not medical advice.
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col h-full mt-4">
              {/* Suggested Questions */}
              {chatMessages.length === 0 && (
                <div className="mb-4">
                  <p className="text-caption text-low mb-2">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setChatInput(question)}
                        className="text-caption"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-surface-subtle text-foreground'
                    }`}>
                      <p className="text-body">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your results..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} size="icon">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Medical Disclaimer */}
        <div className="bg-critical/5 border border-critical/20 rounded-lg p-3">
          <p className="text-caption text-low text-center">
            <strong>Medical Disclaimer:</strong> Information provided by HealTrack is for educational purposes only and is not a medical diagnosis. For concerns, contact a licensed clinician.
          </p>
        </div>
      </div>
    </div>
  );
}