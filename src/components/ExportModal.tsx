import React, { useState } from 'react';
import { X, Download, FileText, Database, Mail, Check, Share } from 'lucide-react';
import { Button } from './core/Button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExportModal({ isOpen, onClose, onSuccess }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'json'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [includeSections, setIncludeSections] = useState({
    profile: true,
    medications: true,
    labs: true,
    appointments: true
  });

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsExporting(false);
    onSuccess();
  };

  const toggleSection = (section: keyof typeof includeSections) => {
    setIncludeSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-lg max-h-[90vh] overflow-hidden p-0"
        data-component="export-modal"
      >
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary-600" />
              <DialogTitle className="text-h3">Export Health Data</DialogTitle>
            </div>
            <Button 
              variant="tertiary" 
              size="sm"
              onClick={onClose}
              aria-label="Close export modal"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 overflow-y-auto">
          <Tabs value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                PDF Report
              </TabsTrigger>
              <TabsTrigger value="json" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                JSON Data
              </TabsTrigger>
            </TabsList>

            {/* Data Sections */}
            <div className="space-y-4 mb-6">
              <h3 className="text-body font-semibold text-foreground">What to include:</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="profile"
                    checked={includeSections.profile}
                    onCheckedChange={() => toggleSection('profile')}
                  />
                  <Label htmlFor="profile" className="text-body text-foreground">
                    Profile & medical history
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="medications"
                    checked={includeSections.medications}
                    onCheckedChange={() => toggleSection('medications')}
                  />
                  <Label htmlFor="medications" className="text-body text-foreground">
                    Current medications & prescriptions
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="labs"
                    checked={includeSections.labs}
                    onCheckedChange={() => toggleSection('labs')}
                  />
                  <Label htmlFor="labs" className="text-body text-foreground">
                    Lab results & medical reports
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="appointments"
                    checked={includeSections.appointments}
                    onCheckedChange={() => toggleSection('appointments')}
                  />
                  <Label htmlFor="appointments" className="text-body text-foreground">
                    Appointment history & schedule
                  </Label>
                </div>
              </div>
            </div>

            <TabsContent value="pdf" className="space-y-4 mt-0">
              <div className="bg-surface-subtle rounded-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary-600" />
                  <h4 className="text-body font-semibold text-foreground">PDF Health Report</h4>
                </div>
                <p className="text-caption text-muted-foreground">
                  Generate a comprehensive health summary in PDF format, perfect for sharing with healthcare providers.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="doctor-email" className="text-body font-semibold text-foreground">
                  Email to doctor (optional)
                </Label>
                <Input
                  id="doctor-email"
                  type="email"
                  placeholder="doctor@clinic.com"
                  value={doctorEmail}
                  onChange={(e) => setDoctorEmail(e.target.value)}
                />
                <p className="text-caption text-muted-foreground">
                  Leave empty to download the PDF directly
                </p>
              </div>
            </TabsContent>

            <TabsContent value="json" className="space-y-4 mt-0">
              <div className="bg-surface-subtle rounded-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-primary-600" />
                  <h4 className="text-body font-semibold text-foreground">JSON Data Export</h4>
                </div>
                <p className="text-caption text-muted-foreground">
                  Download your complete health data in JSON format for importing into other health apps or personal records.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Export Button */}
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            loading={isExporting}
            className="w-full"
            size="lg"
            data-action="generate"
          >
            <Download className="w-5 h-5 mr-2" />
            {isExporting ? 'Generating...' : `Export ${exportFormat.toUpperCase()}`}
          </Button>

          {/* Privacy Notice */}
          <div className="mt-4 bg-warning/5 border border-warning/20 rounded-card p-3">
            <p className="text-caption text-muted-foreground">
              <strong>Privacy Notice:</strong> Your health data is processed securely. 
              PDF exports are generated locally and email sharing uses your device's email client.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ExportSuccessModal({ 
  isOpen, 
  onClose, 
  format 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  format: 'pdf' | 'json';
}) {
  const [shareLink] = useState('https://healtrack.app/share/abc123?code=XY89');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      // Would show toast notification in real app
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-success" />
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-foreground">Export Complete!</h2>
              <p className="text-caption text-muted-foreground">
                Your health data has been exported successfully
              </p>
            </div>
          </div>

          {format === 'pdf' && (
            <div className="space-y-4">
              <p className="text-body text-muted-foreground">
                Your PDF health report has been generated and should download automatically. 
                You can now share it with your healthcare provider.
              </p>
              
              <div className="bg-surface-subtle rounded-card p-4">
                <h3 className="text-body font-semibold text-foreground mb-2">Shareable Link</h3>
                <div className="flex gap-2">
                  <Input 
                    value={shareLink} 
                    readOnly 
                    className="font-mono text-xs flex-1"
                  />
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={copyLink}
                    aria-label="Copy shareable link"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-caption text-muted-foreground mt-2">
                  This secure link expires in 7 days
                </p>
              </div>
            </div>
          )}

          {format === 'json' && (
            <p className="text-body text-muted-foreground">
              Your health data has been downloaded as a JSON file. 
              You can now import this data into other health applications or keep it for your personal records.
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <Button onClick={onClose} className="flex-1">
              Done
            </Button>
            {format === 'pdf' && (
              <Button 
                variant="secondary"
                onClick={() => window.open(`mailto:?subject=Health Summary&body=Please find my health summary attached.`)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}