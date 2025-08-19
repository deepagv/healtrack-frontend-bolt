import React, { useState } from 'react';
import { Download, Mail, Share2, FileText, Check, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { dataExportService } from '../utils/dataExport';

interface DataExportModalProps {
  user: any;
  onClose: () => void;
}

export function DataExportModal({ user, onClose }: DataExportModalProps) {
  const [loading, setLoading] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  
  const [exportOptions, setExportOptions] = useState({
    includeReports: true,
    includeMedications: true,
    includeAppointments: true,
    includeActivityData: true,
    doctorEmail: '',
    format: 'pdf' as 'pdf' | 'json' | 'email' | 'share'
  });

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = await dataExportService.gatherUserData();

      switch (exportOptions.format) {
        case 'pdf':
          await dataExportService.exportToPDF(userData);
          setExportComplete(true);
          break;

        case 'json':
          await dataExportService.exportToJSON(userData);
          setExportComplete(true);
          break;

        case 'email':
          if (!exportOptions.doctorEmail) {
            setError('Please enter a doctor\'s email address');
            return;
          }
          await dataExportService.shareViaEmail(userData, exportOptions.doctorEmail);
          setExportComplete(true);
          break;

        case 'share':
          const link = await dataExportService.generateSharableLink(userData);
          setShareLink(link);
          setExportComplete(true);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = async () => {
    if (shareLink) {
      try {
        await navigator.clipboard.writeText(shareLink);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  if (exportComplete) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-success" />
              </div>
              <CardTitle className="text-h3">Export Complete!</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {exportOptions.format === 'share' && shareLink ? (
              <div className="space-y-4">
                <p className="text-body">Your shareable link has been generated:</p>
                <div className="flex gap-2">
                  <Input 
                    value={shareLink} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button onClick={copyShareLink} size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                  <p className="text-caption text-warning">
                    This link will expire in 7 days and requires the access code shown in the URL.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-body">
                {exportOptions.format === 'pdf' && 'Your health report has been generated and should open in a new window for printing or saving.'}
                {exportOptions.format === 'json' && 'Your health data has been downloaded as a JSON file.'}
                {exportOptions.format === 'email' && 'Your email client should open with the health summary prepared.'}
              </p>
            )}
            
            <div className="flex gap-2 mt-6">
              <Button onClick={onClose} className="flex-1">
                Done
              </Button>
              {exportOptions.format !== 'share' && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setExportComplete(false);
                    setShareLink(null);
                  }}
                >
                  Export Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary-600" />
              <CardTitle className="text-h3">Export Health Data</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto">
          <Tabs value={exportOptions.format} onValueChange={(value: any) => 
            setExportOptions({ ...exportOptions, format: value })
          }>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pdf" className="text-xs">PDF</TabsTrigger>
              <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
              <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
              <TabsTrigger value="share" className="text-xs">Share</TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-body font-medium mb-3">What to include:</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reports"
                      checked={exportOptions.includeReports}
                      onCheckedChange={(checked) => 
                        setExportOptions({ ...exportOptions, includeReports: checked as boolean })
                      }
                    />
                    <Label htmlFor="reports" className="text-body">
                      Medical reports and lab results
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medications"
                      checked={exportOptions.includeMedications}
                      onCheckedChange={(checked) => 
                        setExportOptions({ ...exportOptions, includeMedications: checked as boolean })
                      }
                    />
                    <Label htmlFor="medications" className="text-body">
                      Current medications and prescriptions
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="appointments"
                      checked={exportOptions.includeAppointments}
                      onCheckedChange={(checked) => 
                        setExportOptions({ ...exportOptions, includeAppointments: checked as boolean })
                      }
                    />
                    <Label htmlFor="appointments" className="text-body">
                      Appointment history and schedule
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="activity"
                      checked={exportOptions.includeActivityData}
                      onCheckedChange={(checked) => 
                        setExportOptions({ ...exportOptions, includeActivityData: checked as boolean })
                      }
                    />
                    <Label htmlFor="activity" className="text-body">
                      Activity and health tracking data
                    </Label>
                  </div>
                </div>
              </div>

              <TabsContent value="pdf" className="mt-4">
                <div className="bg-surface-subtle rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary-600" />
                    <h4 className="text-body font-medium">PDF Report</h4>
                  </div>
                  <p className="text-caption text-low">
                    Generate a comprehensive health summary in PDF format, perfect for printing or sharing with healthcare providers.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="json" className="mt-4">
                <div className="bg-surface-subtle rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-primary-600" />
                    <h4 className="text-body font-medium">JSON Export</h4>
                  </div>
                  <p className="text-caption text-low">
                    Download your complete health data in JSON format for importing into other health apps or personal records.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="email" className="mt-4">
                <div className="space-y-4">
                  <div className="bg-surface-subtle rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-primary-600" />
                      <h4 className="text-body font-medium">Email to Doctor</h4>
                    </div>
                    <p className="text-caption text-low">
                      Send a health summary directly to your healthcare provider via email.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="doctorEmail" className="text-body font-medium">
                      Doctor's Email Address
                    </Label>
                    <Input
                      id="doctorEmail"
                      type="email"
                      placeholder="doctor@clinic.com"
                      value={exportOptions.doctorEmail}
                      onChange={(e) => 
                        setExportOptions({ ...exportOptions, doctorEmail: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="share" className="mt-4">
                <div className="bg-surface-subtle rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-4 h-4 text-primary-600" />
                    <h4 className="text-body font-medium">Shareable Link</h4>
                  </div>
                  <p className="text-caption text-low">
                    Generate a secure, temporary link that you can share with healthcare providers. The link expires in 7 days and requires an access code.
                  </p>
                </div>
              </TabsContent>

              {error && (
                <div className="bg-critical/10 border border-critical/20 rounded-lg p-3">
                  <p className="text-caption text-critical">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleExport}
                  disabled={loading}
                  className="flex-1 bg-primary-600 hover:bg-primary-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          </Tabs>

          {/* Disclaimer */}
          <div className="mt-6 bg-warning/5 border border-warning/20 rounded-lg p-3">
            <p className="text-caption text-low">
              <strong>Privacy Notice:</strong> Your health data is processed securely. Shareable links are temporary and access-controlled. Email exports are sent through your device's email client.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}