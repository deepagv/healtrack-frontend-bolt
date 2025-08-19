import { getUserProfile, getUserReports, getMedications, getAppointments, apiCall } from './supabase/client';

interface HealthRecord {
  profile: any;
  reports: any[];
  medications: any;
  appointments: any;
  activityData?: any;
  exportDate: string;
}

class DataExportService {
  private static instance: DataExportService;

  static getInstance(): DataExportService {
    if (!DataExportService.instance) {
      DataExportService.instance = new DataExportService();
    }
    return DataExportService.instance;
  }

  async gatherUserData(): Promise<HealthRecord> {
    try {
      const [profile, reports, medications, appointments] = await Promise.all([
        getUserProfile(),
        getUserReports(),
        getMedications(),
        getAppointments()
      ]);

      return {
        profile: profile.profile,
        reports: reports.reports || [],
        medications: medications || { active: [], past: [] },
        appointments: appointments || { upcoming: [], past: [] },
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error gathering user data:', error);
      throw new Error('Failed to gather user data for export');
    }
  }

  generateHTMLReport(data: HealthRecord): string {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatTime = (dateString: string) => {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HealTrack Health Summary - ${data.profile?.name || 'Patient'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6;
            color: #0F172A;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #fff;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #0EA5A4;
            padding-bottom: 20px;
        }
        
        .logo {
            color: #0EA5A4;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .export-date {
            color: #64748B;
            font-size: 14px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 22px;
            font-weight: 600;
            color: #0F172A;
            margin-bottom: 20px;
            border-left: 4px solid #0EA5A4;
            padding-left: 16px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .info-item {
            background: #F8FAFC;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #E2E8F0;
        }
        
        .info-label {
            font-size: 13px;
            font-weight: 500;
            color: #64748B;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        
        .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #0F172A;
        }
        
        .card {
            background: #fff;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .card-title {
            font-size: 16px;
            font-weight: 600;
            color: #0F172A;
            margin-bottom: 8px;
        }
        
        .card-subtitle {
            font-size: 14px;
            color: #64748B;
            margin-bottom: 12px;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            margin-right: 8px;
        }
        
        .badge-success {
            background: #DCFCE7;
            color: #16A34A;
        }
        
        .badge-warning {
            background: #FEF3C7;
            color: #F59E0B;
        }
        
        .badge-critical {
            background: #FECACA;
            color: #DC2626;
        }
        
        .badge-info {
            background: #E0F2FE;
            color: #0EA5A4;
        }
        
        .lab-results {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }
        
        .lab-results th,
        .lab-results td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #E2E8F0;
        }
        
        .lab-results th {
            background: #F8FAFC;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
        }
        
        .disclaimer {
            background: #FEF3C7;
            border: 1px solid #F59E0B;
            border-radius: 8px;
            padding: 16px;
            margin-top: 40px;
            font-size: 14px;
            color: #92400E;
        }
        
        .disclaimer strong {
            color: #78350F;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 20px;
            }
            
            .section {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🏥 HealTrack</div>
        <h1>Health Summary Report</h1>
        <div class="export-date">Generated on ${formatDate(data.exportDate)}</div>
    </div>

    <div class="section">
        <h2 class="section-title">Patient Information</h2>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Name</div>
                <div class="info-value">${data.profile?.name || 'Not provided'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${data.profile?.email || 'Not provided'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Age</div>
                <div class="info-value">${data.profile?.age || 'Not provided'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Blood Type</div>
                <div class="info-value">${data.profile?.bloodType || 'Not provided'}</div>
            </div>
        </div>
        
        ${data.profile?.conditions?.length ? `
        <div class="card">
            <div class="card-title">Medical Conditions</div>
            ${data.profile.conditions.map((condition: string) => 
                `<span class="badge badge-warning">${condition}</span>`
            ).join('')}
        </div>
        ` : ''}
        
        ${data.profile?.allergies?.length ? `
        <div class="card">
            <div class="card-title">Allergies</div>
            ${data.profile.allergies.map((allergy: string) => 
                `<span class="badge badge-critical">${allergy}</span>`
            ).join('')}
        </div>
        ` : ''}
    </div>

    <div class="section">
        <h2 class="section-title">Active Medications</h2>
        ${data.medications?.active?.length ? 
            data.medications.active.map((med: any) => `
                <div class="card">
                    <div class="card-title">${med.name} ${med.strength}</div>
                    <div class="card-subtitle">${med.instructions}</div>
                    <div>
                        <span class="badge badge-info">Prescribed: ${formatDate(med.prescribedDate)}</span>
                        ${med.refillsLeft ? `<span class="badge badge-success">${med.refillsLeft} refills left</span>` : ''}
                    </div>
                </div>
            `).join('') : 
            '<p style="color: #64748B; font-style: italic;">No active medications on record.</p>'
        }
    </div>

    <div class="section">
        <h2 class="section-title">Recent Medical Reports</h2>
        ${data.reports?.length ? 
            data.reports.slice(0, 5).map((report: any) => `
                <div class="card">
                    <div class="card-title">${report.fileName}</div>
                    <div class="card-subtitle">Uploaded: ${formatDate(report.uploadedAt)}</div>
                    ${report.analysis ? `
                        <div style="margin-top: 12px;">
                            <strong>AI Summary:</strong>
                            <p style="margin-top: 8px; color: #374151;">${report.analysis.summary}</p>
                        </div>
                        ${report.analysis.labResults?.length ? `
                            <table class="lab-results">
                                <thead>
                                    <tr>
                                        <th>Test</th>
                                        <th>Result</th>
                                        <th>Reference Range</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${report.analysis.labResults.map((result: any) => `
                                        <tr>
                                            <td>${result.test}</td>
                                            <td>${result.value} ${result.unit}</td>
                                            <td>${result.refRange} ${result.unit}</td>
                                            <td>
                                                <span class="badge badge-${result.flag === 'normal' ? 'success' : 'warning'}">
                                                    ${result.flag.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : ''}
                    ` : ''}
                </div>
            `).join('') : 
            '<p style="color: #64748B; font-style: italic;">No medical reports on record.</p>'
        }
    </div>

    <div class="section">
        <h2 class="section-title">Upcoming Appointments</h2>
        ${data.appointments?.upcoming?.length ? 
            data.appointments.upcoming.map((appt: any) => `
                <div class="card">
                    <div class="card-title">${appt.doctor}</div>
                    <div class="card-subtitle">${appt.specialty}</div>
                    <div style="margin-top: 8px;">
                        <span class="badge badge-info">${formatDate(appt.date)} at ${formatTime(appt.date)}</span>
                        <span class="badge badge-${appt.type === 'video' ? 'success' : 'warning'}">${appt.type}</span>
                    </div>
                    ${appt.notes ? `<p style="margin-top: 12px; color: #374151;">${appt.notes}</p>` : ''}
                </div>
            `).join('') : 
            '<p style="color: #64748B; font-style: italic;">No upcoming appointments scheduled.</p>'
        }
    </div>

    <div class="disclaimer">
        <strong>Important Medical Disclaimer:</strong>
        This report is generated from data entered into the HealTrack application and is intended for informational purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals regarding your medical condition and treatment options.
    </div>
</body>
</html>
    `;
  }

  async exportToPDF(data: HealthRecord): Promise<void> {
    const htmlContent = this.generateHTMLReport(data);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please check your popup settings.');
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  async exportToJSON(data: HealthRecord): Promise<void> {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `healtrack-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async shareViaEmail(data: HealthRecord, doctorEmail?: string): Promise<void> {
    const subject = `Health Summary from ${data.profile?.name || 'Patient'}`;
    const body = `
Dear Healthcare Provider,

Please find attached the health summary from HealTrack app for ${data.profile?.name || 'the patient'}.

This report includes:
- Patient information and medical history
- Current medications and dosages
- Recent medical reports and lab results
- Upcoming appointments

This data was exported on ${new Date(data.exportDate).toLocaleDateString()}.

Best regards,
${data.profile?.name || 'Patient'}

---
Generated by HealTrack - Personal Health Companion
This information is for medical consultation purposes only.
    `;

    const mailtoUrl = `mailto:${doctorEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  }

  async generateSharableLink(data: HealthRecord): Promise<string> {
    try {
      // Create a temporary share record in the backend
      const shareData = {
        data: data,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        accessCode: Math.random().toString(36).substr(2, 8).toUpperCase()
      };

      const result = await apiCall('/share/create', {
        method: 'POST',
        body: JSON.stringify(shareData)
      });

      return `${window.location.origin}/share/${result.shareId}?code=${shareData.accessCode}`;
    } catch (error) {
      console.error('Error creating shareable link:', error);
      throw new Error('Failed to create shareable link');
    }
  }
}

export const dataExportService = DataExportService.getInstance();

// Export formats
export type ExportFormat = 'pdf' | 'json' | 'email' | 'share';

export interface ExportOptions {
  format: ExportFormat;
  doctorEmail?: string;
  includeReports?: boolean;
  includeMedications?: boolean;
  includeAppointments?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}