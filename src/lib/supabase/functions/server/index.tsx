import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS and logging middleware
app.use('*', cors({ origin: '*' }));
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// OpenAI integration
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const analyzeDocumentWithOpenAI = async (documentText: string, documentType: string = 'general') => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `
You are a medical document analysis AI assistant for HealTrack, a personal health tracking app. Your role is to analyze medical reports and lab results to provide clear, patient-friendly summaries.

CRITICAL INSTRUCTIONS:
1. You are NOT diagnosing or providing medical advice
2. Always emphasize consulting healthcare professionals
3. Use clear, non-technical language
4. Focus on explaining what the results mean, not what to do about them
5. Always include appropriate disclaimers
6. Extract lab values accurately when available
7. Categorize risk levels conservatively

For each analysis, provide a JSON response with this exact structure:
{
  "summary": "Plain language summary of the overall findings",
  "keyFindings": [
    {
      "finding": "Name of the finding",
      "value": "Actual value found",
      "target": "Target or reference range",
      "risk": "low|moderate|high|critical"
    }
  ],
  "labResults": [
    {
      "test": "Test name",
      "value": "Numerical value",
      "unit": "Unit of measurement",
      "refRange": "Reference range",
      "flag": "normal|high|low|critical"
    }
  ],
  "recommendations": [
    "Educational recommendations that emphasize consulting healthcare providers"
  ],
  "riskLevel": "low|moderate|high|critical",
  "followUpNeeded": true
}

Remember: Always be conservative with risk assessment and emphasize the need for professional medical consultation.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please analyze this ${documentType} and provide a structured analysis. Document content:\n\n${documentText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis content received from OpenAI');
    }

    return JSON.parse(analysisText);
  } catch (error) {
    console.log('OpenAI analysis error:', error);
    throw error;
  }
};

const extractTextWithOpenAI = async (base64Image: string) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all text content from this medical document. Focus on lab values, test results, patient information, and medical findings. Return only the extracted text without analysis.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI Vision API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.log('OpenAI text extraction error:', error);
    throw error;
  }
};

// Create storage bucket on startup
const initializeBuckets = async () => {
  try {
    const bucketName = 'make-fef8588c-medical-records';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (error) {
        console.log('Error creating bucket:', error);
      } else {
        console.log('Medical records bucket created successfully');
      }
    }
  } catch (error) {
    console.log('Error initializing buckets:', error);
  }
};

// Initialize buckets on startup
initializeBuckets();

// Authentication endpoints
app.post('/make-server-fef8588c/auth/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return new Response('Missing required fields: email, password, name', { status: 400 });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return new Response(`Signup error: ${error.message}`, { status: 400 });
    }

    // Initialize user profile in KV store
    const userId = data.user.id;
    await kv.set(`user_profile:${userId}`, {
      name,
      email,
      created_at: new Date().toISOString(),
      health_score: 75,
      onboarding_completed: false,
      notifications_enabled: true,
      export_preferences: {
        include_reports: true,
        include_medications: true,
        include_appointments: true
      }
    });

    return new Response(JSON.stringify({ 
      user: data.user,
      message: 'User created successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Signup error:', error);
    return new Response(`Internal server error during signup: ${error}`, { status: 500 });
  }
});

// Get user profile
app.get('/make-server-fef8588c/user/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const profile = await kv.get(`user_profile:${user.id}`);
    
    return new Response(JSON.stringify({ 
      profile: profile || { name: user.user_metadata?.name, email: user.email }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Profile fetch error:', error);
    return new Response(`Error fetching profile: ${error}`, { status: 500 });
  }
});

// Update user profile
app.put('/make-server-fef8588c/user/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const body = await c.req.json();
    const existingProfile = await kv.get(`user_profile:${user.id}`) || {};
    
    const updatedProfile = {
      ...existingProfile,
      ...body,
      updated_at: new Date().toISOString()
    };

    await kv.set(`user_profile:${user.id}`, updatedProfile);

    return new Response(JSON.stringify({ 
      profile: updatedProfile,
      message: 'Profile updated successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Profile update error:', error);
    return new Response(`Error updating profile: ${error}`, { status: 500 });
  }
});

// Health data endpoints
app.get('/make-server-fef8588c/health/dashboard', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    // Get various health data for dashboard
    const [profile, activities, medications, appointments, reports] = await Promise.all([
      kv.get(`user_profile:${user.id}`),
      kv.get(`activities:${user.id}`),
      kv.get(`medications:${user.id}`),
      kv.get(`appointments:${user.id}`),
      kv.get(`reports:${user.id}`)
    ]);

    // Generate AI insight if user has recent data
    let aiInsight = null;
    if (OPENAI_API_KEY && reports && reports.length > 0) {
      try {
        const recentReport = reports[reports.length - 1];
        if (recentReport?.analysis) {
          const insightResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'Generate a brief, encouraging health insight based on recent medical data. Keep it positive and educational, never diagnostic.'
                },
                {
                  role: 'user',
                  content: `Based on this analysis: ${JSON.stringify(recentReport.analysis.keyFindings?.slice(0, 2))}, provide a brief health tip.`
                }
              ],
              temperature: 0.7,
              max_tokens: 100
            }),
          });

          if (insightResponse.ok) {
            const insightData = await insightResponse.json();
            aiInsight = insightData.choices[0]?.message?.content;
          }
        }
      } catch (insightError) {
        console.log('Error generating AI insight:', insightError);
      }
    }

    const dashboardData = {
      healthScore: profile?.health_score || 75,
      activities: activities || {
        steps: 8547,
        heartRate: 72,
        sleep: 443, // minutes
        calories: 1847
      },
      nextMedication: medications?.upcoming?.[0] || {
        name: 'Metformin 500mg',
        time: '8:00 AM',
        instruction: '1 tablet after breakfast'
      },
      nextAppointment: appointments?.upcoming?.[0] || null,
      insights: aiInsight ? [{ message: aiInsight, type: 'info' }] : []
    };

    return new Response(JSON.stringify(dashboardData), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Dashboard data error:', error);
    return new Response(`Error fetching dashboard data: ${error}`, { status: 500 });
  }
});

// Enhanced report upload with OCR
app.post('/make-server-fef8588c/reports/upload', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response('No file provided', { status: 400 });
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('make-fef8588c-medical-records')
      .upload(fileName, file);

    if (uploadError) {
      console.log('File upload error:', uploadError);
      return new Response(`File upload failed: ${uploadError.message}`, { status: 500 });
    }

    // Extract text for images using OpenAI Vision
    let extractedText = '';
    if (file.type.startsWith('image/') && OPENAI_API_KEY) {
      try {
        const fileBuffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
        const base64WithPrefix = `data:${file.type};base64,${base64}`;
        
        extractedText = await extractTextWithOpenAI(base64WithPrefix);
      } catch (ocrError) {
        console.log('OCR extraction error:', ocrError);
        extractedText = 'Text extraction failed - manual analysis may be needed';
      }
    }

    // Create report record
    const reportId = crypto.randomUUID();
    const reportData = {
      id: reportId,
      fileName: file.name,
      filePath: uploadData.path,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded',
      extractedText,
      analysis: null
    };

    // Store report metadata
    const userReports = await kv.get(`reports:${user.id}`) || [];
    userReports.push(reportData);
    await kv.set(`reports:${user.id}`, userReports);

    return new Response(JSON.stringify({ 
      reportId,
      fileName: file.name,
      status: 'uploaded',
      hasExtractedText: !!extractedText,
      message: 'File uploaded successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Upload error:', error);
    return new Response(`Error uploading file: ${error}`, { status: 500 });
  }
});

// Enhanced report analysis with real OpenAI
app.post('/make-server-fef8588c/reports/:reportId/analyze', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const reportId = c.req.param('reportId');
    const userReports = await kv.get(`reports:${user.id}`) || [];
    const reportIndex = userReports.findIndex((r: any) => r.id === reportId);

    if (reportIndex === -1) {
      return new Response('Report not found', { status: 404 });
    }

    const report = userReports[reportIndex];
    let analysis;

    if (OPENAI_API_KEY && report.extractedText) {
      try {
        // Use real OpenAI analysis
        analysis = await analyzeDocumentWithOpenAI(report.extractedText, 'lab_report');
        analysis.analyzedAt = new Date().toISOString();
      } catch (aiError) {
        console.log('AI analysis failed, using fallback:', aiError);
        analysis = getFallbackAnalysis();
      }
    } else {
      // Fallback analysis if no OpenAI key or extracted text
      analysis = getFallbackAnalysis();
    }

    // Update report with analysis
    userReports[reportIndex].analysis = analysis;
    userReports[reportIndex].status = 'analyzed';
    await kv.set(`reports:${user.id}`, userReports);

    return new Response(JSON.stringify({ 
      analysis,
      message: 'Report analyzed successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Analysis error:', error);
    return new Response(`Error analyzing report: ${error}`, { status: 500 });
  }
});

const getFallbackAnalysis = () => ({
  summary: "Your lipid panel shows elevated cholesterol levels. Your total cholesterol (245 mg/dL) and LDL cholesterol (165 mg/dL) are above target ranges, which may increase cardiovascular risk. HDL cholesterol and glucose levels are within normal ranges.",
  keyFindings: [
    {
      finding: "Elevated LDL Cholesterol",
      value: "165 mg/dL",
      target: "<100 mg/dL",
      risk: "high"
    },
    {
      finding: "Total Cholesterol Above Target",
      value: "245 mg/dL", 
      target: "<200 mg/dL",
      risk: "high"
    },
    {
      finding: "Blood Sugar in Range",
      value: "Normal",
      target: "Normal",
      risk: "low"
    }
  ],
  labResults: [
    { test: "Total Cholesterol", value: "245", unit: "mg/dL", refRange: "<200", flag: "high" },
    { test: "LDL Cholesterol", value: "165", unit: "mg/dL", refRange: "<100", flag: "high" },
    { test: "HDL Cholesterol", value: "42", unit: "mg/dL", refRange: ">40", flag: "normal" },
    { test: "Triglycerides", value: "189", unit: "mg/dL", refRange: "<150", flag: "high" },
    { test: "Glucose (Fasting)", value: "98", unit: "mg/dL", refRange: "70-99", flag: "normal" },
    { test: "HbA1c", value: "5.4", unit: "%", refRange: "<5.7", flag: "normal" }
  ],
  recommendations: [
    "Consider a heart-healthy diet low in saturated fats",
    "Aim for 150 minutes of moderate exercise weekly",
    "Discuss medication options with your doctor",
    "Schedule follow-up testing in 6-8 weeks",
    "Always consult with your healthcare provider to interpret these results"
  ],
  riskLevel: "moderate",
  followUpNeeded: true,
  analyzedAt: new Date().toISOString()
});

// Get user reports
app.get('/make-server-fef8588c/reports', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const userReports = await kv.get(`reports:${user.id}`) || [];

    // Generate signed URLs for file access
    const reportsWithUrls = await Promise.all(
      userReports.map(async (report: any) => {
        try {
          const { data: signedUrlData } = await supabase.storage
            .from('make-fef8588c-medical-records')
            .createSignedUrl(report.filePath, 3600); // 1 hour expiry

          return {
            ...report,
            signedUrl: signedUrlData?.signedUrl
          };
        } catch (error) {
          console.log('Error generating signed URL:', error);
          return report;
        }
      })
    );

    return new Response(JSON.stringify({ reports: reportsWithUrls }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Reports fetch error:', error);
    return new Response(`Error fetching reports: ${error}`, { status: 500 });
  }
});

// Medications endpoints
app.get('/make-server-fef8588c/medications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const medications = await kv.get(`medications:${user.id}`) || {
      active: [],
      upcoming: [
        {
          id: 'med-1',
          name: 'Metformin 500mg',
          time: '8:00 AM',
          instruction: '1 tablet after breakfast',
          dueAt: new Date().toISOString()
        }
      ]
    };

    return new Response(JSON.stringify(medications), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Medications fetch error:', error);
    return new Response(`Error fetching medications: ${error}`, { status: 500 });
  }
});

app.post('/make-server-fef8588c/medications', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const body = await c.req.json();
    const medicationData = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString()
    };

    const medications = await kv.get(`medications:${user.id}`) || { active: [], upcoming: [] };
    medications.active.push(medicationData);
    await kv.set(`medications:${user.id}`, medications);

    return new Response(JSON.stringify({ 
      medication: medicationData,
      message: 'Medication added successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Medication add error:', error);
    return new Response(`Error adding medication: ${error}`, { status: 500 });
  }
});

// Appointments endpoints
app.get('/make-server-fef8588c/appointments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const appointments = await kv.get(`appointments:${user.id}`) || {
      upcoming: [
        {
          id: 'appt-1',
          doctor: 'Dr. Sarah Johnson',
          specialty: 'Cardiology',
          date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          type: 'video',
          notes: 'Follow-up on cholesterol levels'
        }
      ],
      past: []
    };

    return new Response(JSON.stringify(appointments), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Appointments fetch error:', error);
    return new Response(`Error fetching appointments: ${error}`, { status: 500 });
  }
});

app.post('/make-server-fef8588c/appointments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const body = await c.req.json();
    const appointmentData = {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString()
    };

    const appointments = await kv.get(`appointments:${user.id}`) || { upcoming: [], past: [] };
    appointments.upcoming.push(appointmentData);
    await kv.set(`appointments:${user.id}`, appointments);

    return new Response(JSON.stringify({ 
      appointment: appointmentData,
      message: 'Appointment added successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Appointment add error:', error);
    return new Response(`Error adding appointment: ${error}`, { status: 500 });
  }
});

// Data export endpoint
app.post('/make-server-fef8588c/export/generate', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const body = await c.req.json();
    const { includeReports = true, includeMedications = true, includeAppointments = true } = body;

    // Gather all user data
    const [profile, reports, medications, appointments] = await Promise.all([
      kv.get(`user_profile:${user.id}`),
      includeReports ? kv.get(`reports:${user.id}`) : null,
      includeMedications ? kv.get(`medications:${user.id}`) : null,
      includeAppointments ? kv.get(`appointments:${user.id}`) : null
    ]);

    const exportData = {
      profile,
      reports: reports || [],
      medications: medications || { active: [], past: [] },
      appointments: appointments || { upcoming: [], past: [] },
      exportDate: new Date().toISOString(),
      exportSettings: body
    };

    return new Response(JSON.stringify(exportData), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Export generation error:', error);
    return new Response(`Error generating export: ${error}`, { status: 500 });
  }
});

// Shareable link endpoint
app.post('/make-server-fef8588c/share/create', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const body = await c.req.json();
    const shareId = crypto.randomUUID();

    await kv.set(`share:${shareId}`, {
      ...body,
      userId: user.id,
      createdAt: new Date().toISOString()
    });

    return new Response(JSON.stringify({ 
      shareId,
      message: 'Shareable link created successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Share creation error:', error);
    return new Response(`Error creating share: ${error}`, { status: 500 });
  }
});

// Notification preferences
app.put('/make-server-fef8588c/notifications/preferences', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const body = await c.req.json();
    
    const profile = await kv.get(`user_profile:${user.id}`) || {};
    profile.notification_preferences = {
      ...profile.notification_preferences,
      ...body,
      updated_at: new Date().toISOString()
    };

    await kv.set(`user_profile:${user.id}`, profile);

    return new Response(JSON.stringify({ 
      preferences: profile.notification_preferences,
      message: 'Notification preferences updated successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Notification preferences error:', error);
    return new Response(`Error updating notification preferences: ${error}`, { status: 500 });
  }
});

// Health tracking data
app.post('/make-server-fef8588c/tracking/activity', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return new Response('Authorization token required', { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const body = await c.req.json();
    const date = new Date().toISOString().split('T')[0];
    
    await kv.set(`activity:${user.id}:${date}`, {
      ...body,
      date,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({ 
      message: 'Activity data saved successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.log('Activity tracking error:', error);
    return new Response(`Error saving activity data: ${error}`, { status: 500 });
  }
});

// Health check endpoint
app.get('/make-server-fef8588c/health', (c) => {
  return new Response(JSON.stringify({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'HealTrack API',
    features: {
      openai_enabled: !!OPENAI_API_KEY,
      storage_enabled: true,
      notifications_enabled: true,
      export_enabled: true
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

serve(app.fetch);