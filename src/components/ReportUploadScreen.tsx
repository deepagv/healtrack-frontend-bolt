import React, { useState, useCallback } from 'react';
import { Upload, FileText, Camera, Check, AlertCircle, X, ArrowLeft, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { uploadReport, analyzeReport } from '../utils/supabase/client';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  status: 'uploading' | 'processing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  hasExtractedText?: boolean;
}

interface ReportUploadScreenProps {
  user: any;
  onNavigateToAnalysis: () => void;
  onBack: () => void;
}

export function ReportUploadScreen({ user, onNavigateToAnalysis, onBack }: ReportUploadScreenProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [analyzedReportId, setAnalyzedReportId] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  }, []);

  const processFiles = async (fileList: File[]) => {
    for (const file of fileList) {
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.type,
        status: 'uploading',
        progress: 0,
      };

      setFiles(prev => [...prev, newFile]);

      try {
        // Upload file to backend
        const uploadResult = await uploadReport(file);
        
        // Update file status
        setFiles(prev => prev.map(f => 
          f.id === newFile.id 
            ? { 
                ...f, 
                status: 'processing', 
                progress: 100,
                hasExtractedText: uploadResult.hasExtractedText 
              } 
            : f
        ));

        // Simulate processing delay for UX
        setTimeout(() => {
          setFiles(prev => prev.map(f => 
            f.id === newFile.id 
              ? { ...f, status: 'complete' } 
              : f
          ));
        }, 1500);

      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f => 
          f.id === newFile.id 
            ? { ...f, status: 'error', progress: 0 } 
            : f
        ));
      }
    }
  };

  const handleAnalyzeReports = async () => {
    const completeFiles = files.filter(f => f.status === 'complete');
    if (completeFiles.length === 0) return;

    // For demo, analyze the first complete file
    const fileToAnalyze = completeFiles[0];
    
    setFiles(prev => prev.map(f => 
      f.id === fileToAnalyze.id 
        ? { ...f, status: 'analyzing' } 
        : f
    ));

    try {
      // This would use the actual report ID from the backend
      const mockReportId = 'mock-report-id';
      const analysisResult = await analyzeReport(mockReportId);
      
      setFiles(prev => prev.map(f => 
        f.id === fileToAnalyze.id 
          ? { ...f, status: 'complete' } 
          : f
      ));

      setAnalyzedReportId(mockReportId);
      
      // Navigate to analysis screen after a brief delay
      setTimeout(() => {
        onNavigateToAnalysis();
      }, 1000);

    } catch (error) {
      console.error('Analysis error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileToAnalyze.id 
          ? { ...f, status: 'error' } 
          : f
      ));
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getStatusIcon = (status: UploadedFile['status'], hasExtractedText?: boolean) => {
    switch (status) {
      case 'complete':
        return <Check className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-critical" />;
      case 'analyzing':
        return <Brain className="w-4 h-4 text-accent animate-pulse" />;
      default:
        return <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusText = (status: UploadedFile['status'], hasExtractedText?: boolean) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return hasExtractedText ? 'Text extracted with AI' : 'Processing file...';
      case 'analyzing':
        return 'Analyzing with OpenAI...';
      case 'complete':
        return 'Ready for analysis';
      case 'error':
        return 'Upload failed';
      default:
        return '';
    }
  };

  const hasCompleteFiles = files.some(file => file.status === 'complete');
  const isAnalyzing = files.some(file => file.status === 'analyzing');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card p-4 border-b border-subtle">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-h2 font-semibold">Upload Medical Report</h1>
            <p className="text-caption text-low">AI will analyze and summarize key findings</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Enhanced AI Features Notice */}
        <Card className="shadow-card border-accent/20 bg-gradient-to-r from-accent/5 to-primary-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-body font-semibold">Enhanced AI Analysis</h3>
                <p className="text-caption text-low">
                  Powered by OpenAI for accurate text extraction and intelligent health insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Zone */}
        <Card className={`transition-colors ${isDragOver ? 'border-primary-600 bg-primary-600/5' : 'border-dashed border-2'}`}>
          <CardContent className="p-8">
            <div
              className="text-center"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 bg-primary-600/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-h3 font-semibold mb-2">Drag & drop your files here</h3>
              <p className="text-body text-low mb-4">
                Supports PDF, JPG, PNG, HEIC up to 10MB
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-primary-600 hover:bg-primary-700">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.heic"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  Choose Files
                </Button>
                
                <Button variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File List */}
        {files.length > 0 && (
          <div>
            <h2 className="text-h3 font-semibold mb-3">Uploaded Files</h2>
            <div className="space-y-3">
              {files.map((file) => (
                <Card key={file.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-600/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-body font-medium truncate">{file.name}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(file.status, file.hasExtractedText)}
                          <span className="text-caption text-low">
                            {getStatusText(file.status, file.hasExtractedText)}
                          </span>
                          <span className="text-caption text-low">• {file.size}</span>
                          {file.hasExtractedText && (
                            <Badge variant="outline" className="text-accent border-accent">
                              AI OCR
                            </Badge>
                          )}
                        </div>
                        
                        {file.status !== 'complete' && file.status !== 'error' && (
                          <Progress value={file.progress} className="h-1" />
                        )}
                        
                        {file.status === 'complete' && (
                          <Badge variant="outline" className="text-success border-success">
                            Ready for AI analysis
                          </Badge>
                        )}
                        
                        {file.status === 'error' && (
                          <Badge variant="outline" className="text-critical border-critical">
                            Upload failed - try again
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {hasCompleteFiles && (
          <Button 
            onClick={handleAnalyzeReports}
            disabled={isAnalyzing}
            className="w-full bg-accent hover:bg-accent/90" 
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Brain className="w-5 h-5 mr-2 animate-pulse" />
                Analyzing with OpenAI...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        )}

        {/* Enhanced Info Card */}
        <Card className="bg-surface-subtle border-none">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h3 className="text-body font-medium">Enhanced AI Analysis Process</h3>
              <div className="space-y-2 text-caption text-low">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span>Advanced OCR extracts text from images and PDFs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>OpenAI analyzes medical content for key findings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span>Plain-language summary with actionable insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span>Interactive Q&A for deeper understanding</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Disclaimer */}
        <div className="bg-critical/5 border border-critical/20 rounded-lg p-3">
          <p className="text-caption text-low text-center">
            <strong>Important:</strong> AI analysis is for educational purposes only and is not a medical diagnosis. For health concerns, always consult a licensed healthcare provider.
          </p>
        </div>
      </div>
    </div>
  );
}