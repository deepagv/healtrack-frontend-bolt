interface AnalysisResult {
  summary: string;
  keyFindings: Array<{
    finding: string;
    value: string;
    target: string;
    risk: 'low' | 'moderate' | 'high' | 'critical';
  }>;
  labResults?: Array<{
    test: string;
    value: string;
    unit: string;
    refRange: string;
    flag: 'normal' | 'high' | 'low' | 'critical';
  }>;
  recommendations: string[];
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  followUpNeeded: boolean;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class OpenAIService {
  private static instance: OpenAIService;

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  private readonly systemPrompt = `
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
  "followUpNeeded": true/false
}

Remember: Always be conservative with risk assessment and emphasize the need for professional medical consultation.
`;

  async analyzeDocument(documentText: string, documentType: 'lab_report' | 'imaging' | 'general' = 'general'): Promise<AnalysisResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: this.systemPrompt
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
        const errorData = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
      }

      const data: OpenAIResponse = await response.json();
      const analysisText = data.choices[0]?.message?.content;

      if (!analysisText) {
        throw new Error('No analysis content received from OpenAI');
      }

      try {
        const analysisResult: AnalysisResult = JSON.parse(analysisText);
        
        // Validate and sanitize the response
        return this.validateAndSanitizeAnalysis(analysisResult);
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        throw new Error('Failed to parse AI analysis results');
      }

    } catch (error) {
      console.error('OpenAI analysis error:', error);
      throw new Error(`Failed to analyze document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateAndSanitizeAnalysis(analysis: any): AnalysisResult {
    // Ensure all required fields are present and properly typed
    const sanitized: AnalysisResult = {
      summary: this.sanitizeString(analysis.summary) || 'Analysis completed. Please consult with your healthcare provider to discuss these results.',
      keyFindings: Array.isArray(analysis.keyFindings) ? analysis.keyFindings.map(this.sanitizeFinding) : [],
      labResults: Array.isArray(analysis.labResults) ? analysis.labResults.map(this.sanitizeLabResult) : [],
      recommendations: Array.isArray(analysis.recommendations) 
        ? analysis.recommendations.map((r: any) => this.sanitizeString(r)).filter(Boolean)
        : ['Discuss these results with your healthcare provider'],
      riskLevel: this.validateRiskLevel(analysis.riskLevel),
      followUpNeeded: Boolean(analysis.followUpNeeded)
    };

    // Always add medical disclaimer to recommendations
    if (!sanitized.recommendations.some(r => r.includes('healthcare provider'))) {
      sanitized.recommendations.push('Always consult with your healthcare provider to interpret these results and determine appropriate next steps.');
    }

    return sanitized;
  }

  private sanitizeFinding = (finding: any) => ({
    finding: this.sanitizeString(finding.finding) || 'Finding',
    value: this.sanitizeString(finding.value) || 'N/A',
    target: this.sanitizeString(finding.target) || 'N/A',
    risk: this.validateRiskLevel(finding.risk)
  });

  private sanitizeLabResult = (result: any) => ({
    test: this.sanitizeString(result.test) || 'Test',
    value: this.sanitizeString(result.value) || 'N/A',
    unit: this.sanitizeString(result.unit) || '',
    refRange: this.sanitizeString(result.refRange) || 'N/A',
    flag: this.validateFlag(result.flag)
  });

  private sanitizeString(value: any): string {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, 500); // Limit length for safety
  }

  private validateRiskLevel(level: any): 'low' | 'moderate' | 'high' | 'critical' {
    const validLevels = ['low', 'moderate', 'high', 'critical'];
    return validLevels.includes(level) ? level : 'moderate';
  }

  private validateFlag(flag: any): 'normal' | 'high' | 'low' | 'critical' {
    const validFlags = ['normal', 'high', 'low', 'critical'];
    return validFlags.includes(flag) ? flag : 'normal';
  }

  async extractTextFromImage(imageFile: File): Promise<string> {
    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || '';

    } catch (error) {
      console.error('Error extracting text from image:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  async generateHealthInsight(userData: {
    recentLabs?: any[];
    medications?: any[];
    activities?: any;
    demographics?: any;
  }): Promise<string> {
    try {
      const contextPrompt = `
Based on the following health data, provide a brief, encouraging health insight or tip. Keep it positive and educational:

Recent Lab Results: ${JSON.stringify(userData.recentLabs?.slice(0, 3) || [])}
Current Medications: ${JSON.stringify(userData.medications?.slice(0, 5) || [])}
Activity Data: ${JSON.stringify(userData.activities || {})}
Demographics: ${JSON.stringify(userData.demographics || {})}

Provide a single, actionable health insight that's encouraging and educational. Do not provide medical advice.
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a health education assistant. Provide brief, positive, educational health insights. Never give medical advice or diagnose conditions.'
            },
            {
              role: 'user',
              content: contextPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Keep up the great work tracking your health!';

    } catch (error) {
      console.error('Error generating health insight:', error);
      return 'Keep up the great work tracking your health!';
    }
  }
}

export const openaiService = OpenAIService.getInstance();
export type { AnalysisResult };