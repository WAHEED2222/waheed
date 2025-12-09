import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Copy, Check, Briefcase, Building2, MapPin, Send } from 'lucide-react';
import { JobListing } from '../types';

interface JobArchitectProps {
  onPostJob: (job: JobListing) => void;
}

export const JobArchitect: React.FC<JobArchitectProps> = ({ onPostJob }) => {
  const [roleTitle, setRoleTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [culture, setCulture] = useState('');
  const [salary, setSalary] = useState('');
  const [generatedJD, setGeneratedJD] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateJD = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create a professional, modern, and inclusive Job Description for a ${roleTitle} at ${company || 'our company'}.
        
        Required Skills/Tech Stack: ${skills}
        Company Culture/Vibe: ${culture}
        Location: ${location}
        
        Structure:
        1. Engaging Hook/Intro
        2. Key Responsibilities (Bullet points)
        3. Requirements (Bullet points)
        4. "Nice to Haves"
        5. Why Join Us (Based on culture)
        
        Format using standard Markdown. Do not include placeholders like [Company Name], use the provided data.`,
      });
      
      setGeneratedJD(response.text || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePost = () => {
    if (!roleTitle || !company || !generatedJD) return;
    
    setIsPosting(true);
    
    const newJob: JobListing = {
      id: Date.now().toString(),
      title: roleTitle,
      company: company,
      location: location || 'Remote',
      type: 'Full-time', // Defaulting for now
      salary: salary,
      description: generatedJD,
      tags: skills.split(',').map(s => s.trim()).filter(Boolean),
      postedAt: new Date()
    };

    // Simulate network delay
    setTimeout(() => {
      onPostJob(newJob);
      setIsPosting(false);
      // Reset form
      setRoleTitle('');
      setSkills('');
      setGeneratedJD('');
      alert('Job Posted Successfully!');
    }, 800);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-indigo-600" />
          Create Job Posting
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
            <input 
              type="text" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Senior Product Manager"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Acme Corp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
             <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="New York, NY (Remote)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Salary Range (Optional)</label>
            <input 
              type="text" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. $120k - $150k"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>

           <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Key Skills</label>
            <input 
              type="text" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="React, Node.js, AWS"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Culture</label>
            <input 
              type="text" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Fast-paced, innovative, inclusive"
              value={culture}
              onChange={(e) => setCulture(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
           <button
            onClick={generateJD}
            disabled={!roleTitle || isGenerating}
            className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Sparkles className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate with AI
          </button>
        </div>
      </div>

      {generatedJD && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative animate-fade-in">
           <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
             <h3 className="font-semibold text-slate-700">Preview</h3>
             <button 
               onClick={copyToClipboard}
               className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
             >
               {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
               {copied ? 'Copied' : 'Copy Text'}
             </button>
           </div>
           
           <div className="p-8 md:p-10 max-h-[500px] overflow-y-auto">
             <textarea 
                className="w-full h-full min-h-[400px] outline-none resize-none text-slate-800 whitespace-pre-wrap font-medium font-sans"
                value={generatedJD}
                onChange={(e) => setGeneratedJD(e.target.value)}
             />
           </div>

           <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={handlePost}
                disabled={isPosting}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
              >
                {isPosting ? 'Posting...' : 'Post to Feed'}
                <Send className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};