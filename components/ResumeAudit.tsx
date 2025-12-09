import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult } from '../types';
import { FileText, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const ResumeAudit: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeResume = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;

    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Use structured JSON output for easy UI rendering
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze this resume against the job description.
        
        RESUME:
        ${resumeText}
        
        JOB DESCRIPTION:
        ${jobDescription}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "Match score out of 100" },
              summary: { type: Type.STRING, description: "Brief summary of the fit" },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of specific improvements" },
              missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Critical keywords missing from resume" }
            }
          }
        }
      });
      
      const data = JSON.parse(response.text || '{}');
      setResult(data);

    } catch (error) {
      console.error(error);
      alert('Failed to analyze. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Paste Your Resume
            </label>
            <textarea
              className="w-full h-48 p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Experience..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Job Description</label>
            <textarea
              className="w-full h-48 p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Responsibilities and requirements..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button
            onClick={analyzeResume}
            disabled={isAnalyzing || !resumeText || !jobDescription}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Analyze Match <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {result ? (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">Analysis Report</h3>
                <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 font-bold text-xl ${
                  (result.score || 0) > 75 ? 'border-green-400 text-green-400' : 
                  (result.score || 0) > 50 ? 'border-yellow-400 text-yellow-400' : 'border-red-400 text-red-400'
                }`}>
                  {result.score}%
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Summary</h4>
                  <p className="text-slate-600 leading-relaxed">{result.summary}</p>
                </div>

                {result.missingKeywords && result.missingKeywords.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-white text-red-700 text-xs font-medium rounded border border-red-200">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" /> Actionable Recommendations
                  </h4>
                  <ul className="space-y-3">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                        <span className="text-blue-500 font-bold">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-12 text-center">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">Ready to Analyze</h3>
              <p className="max-w-xs">Enter your details on the left to get AI-powered insights on how to improve your resume.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};