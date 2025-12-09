import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Search, MapPin, Briefcase, ExternalLink, Loader2, Globe, Clock, DollarSign, Building, Filter, ChevronDown, Bell, Mail, Smartphone, Check, X } from 'lucide-react';
import { JobListing } from '../types';

interface JobSearchProps {
  jobs: JobListing[];
}

export const JobSearch: React.FC<JobSearchProps> = ({ jobs }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'web'>('feed');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [webResults, setWebResults] = useState<{ text: string; chunks: any[] } | null>(null);

  // Filters State
  const [jobType, setJobType] = useState('All');
  const [dateRange, setDateRange] = useState('any');
  const [salaryRange, setSalaryRange] = useState('any');

  // Alert State
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertPreference, setAlertPreference] = useState<'email' | 'push' | 'both'>('email');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const isWithinDateRange = (date: Date, range: string) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    switch (range) {
      case '24h': return diffDays <= 1;
      case '3d': return diffDays <= 3;
      case '7d': return diffDays <= 7;
      case '30d': return diffDays <= 30;
      default: return true;
    }
  };

  const filteredLocalJobs = jobs.filter(job => {
    const matchesQuery = query === '' || 
      job.title.toLowerCase().includes(query.toLowerCase()) || 
      job.company.toLowerCase().includes(query.toLowerCase()) ||
      job.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
      
    const matchesLocation = location === '' || 
      job.location.toLowerCase().includes(location.toLowerCase());

    const matchesType = jobType === 'All' || job.type.toLowerCase() === jobType.toLowerCase();
    
    const matchesDate = isWithinDateRange(job.postedAt, dateRange);

    // Simple heuristic for local salary filtering
    const matchesSalary = salaryRange === 'any' || (!!job.salary);

    return matchesQuery && matchesLocation && matchesType && matchesDate && matchesSalary;
  });

  const handleWebSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setActiveTab('web');
    setIsSearching(true);
    setWebResults(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const filterContext = `
      Apply the following filters strictly:
      - Job Type: ${jobType !== 'All' ? jobType : 'Any'}
      - Posted Date: ${dateRange !== 'any' ? `Within the last ${dateRange}` : 'Any time'}
      - Salary Range: ${salaryRange !== 'any' ? salaryRange : 'Not specified'}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find active, recent job listings for "${query}" in "${location || 'Remote'}". 
        ${filterContext}
        
        Provide a consolidated summary of the top 5-7 distinct opportunities found that match these criteria.
        For each opportunity, strictly follow this format in Markdown:
        
        ### [Job Title] at [Company Name]
        **Location:** [Location]
        **Type:** [Job Type]
        **Key Details:** [1 sentence summary including salary if available]
        
        After listing them, provide a brief advice on how to apply for this specific type of role.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      setWebResults({
        text: response.text || "No results found.",
        chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      });

    } catch (error) {
      console.error(error);
      setWebResults({ text: "Error fetching jobs. Please try again.", chunks: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateAlert = () => {
    // Simulate API call to save alert
    setShowAlertModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in border border-slate-700">
          <div className="bg-green-500 rounded-full p-1">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Alert Created Successfully</h4>
            <p className="text-xs text-slate-400">We'll notify you when new jobs match your criteria.</p>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="ml-4 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Hero Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">Find Your Next Opportunity</h2>
          <button 
            onClick={() => setShowAlertModal(true)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            Create Alert
          </button>
        </div>
        
        {/* Main Inputs */}
        <form onSubmit={handleWebSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
          <div className="md:col-span-5 relative">
            <Briefcase className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="md:col-span-5 relative">
            <MapPin className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="City, state, or 'Remote'"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="md:col-span-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span className="md:hidden lg:inline">Search Web</span>
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100 items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mr-2">
              <Filter className="w-4 h-4" /> Filters:
            </div>
            
            {/* Job Type Select */}
            <div className="relative">
              <select 
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-full py-2 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="All">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>

            {/* Date Posted Select */}
            <div className="relative">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-full py-2 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="any">Date Posted: Any</option>
                <option value="24h">Past 24 hours</option>
                <option value="3d">Past 3 days</option>
                <option value="7d">Past week</option>
                <option value="30d">Past month</option>
              </select>
               <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>

            {/* Salary Select */}
            <div className="relative">
              <select 
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-full py-2 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <option value="any">Salary: Any</option>
                <option value="$50k+">$50k+</option>
                <option value="$80k+">$80k+</option>
                <option value="$100k+">$100k+</option>
                <option value="$150k+">$150k+</option>
              </select>
               <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>
        </div>

        <div className="mt-6 flex border-b border-slate-100">
           <button 
             onClick={() => setActiveTab('feed')}
             className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 ${
               activeTab === 'feed' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
             }`}
           >
             Latest Feed
           </button>
           <button 
             onClick={() => setActiveTab('web')}
             className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 ${
               activeTab === 'web' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
             }`}
           >
             Web Results (AI)
           </button>
        </div>
      </div>

      {/* Local Job Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-4 animate-fade-in">
           {filteredLocalJobs.length > 0 ? (
             filteredLocalJobs.map(job => (
               <div key={job.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-2 text-slate-600 text-sm font-medium mt-1">
                        <Building className="w-4 h-4" /> {job.company}
                      </div>
                    </div>
                    {job.salary && (
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {job.salary}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 my-3">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {getTimeAgo(job.postedAt)}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.type}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                      View Details & Apply &rarr;
                    </button>
                  </div>
               </div>
             ))
           ) : (
             <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
               <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                 <Search className="w-6 h-6 text-slate-400" />
               </div>
               <h3 className="text-lg font-medium text-slate-900">No jobs found</h3>
               <p className="text-slate-500">Try adjusting your filters or search terms.</p>
               <button onClick={() => {setJobType('All'); setDateRange('any'); setSalaryRange('any'); setQuery('');}} className="mt-4 text-blue-600 font-medium hover:underline">
                 Clear all filters
               </button>
             </div>
           )}
        </div>
      )}

      {/* Web Search Results Area */}
      {activeTab === 'web' && (
        <div className="animate-fade-in">
          {webResults ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content (AI Summary) */}
              <div className="lg:col-span-2 space-y-6">
                 <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                   <div className="prose prose-slate max-w-none">
                     <div className="markdown-content" dangerouslySetInnerHTML={{ 
                       // Basic markdown to HTML conversion for the list
                       __html: webResults.text
                         .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-900 mt-6 mb-2">$1</h3>')
                         .replace(/^\*\*Location:\*\* (.*$)/gim, '<p class="text-sm text-slate-500 mb-1 flex items-center gap-1"><span class="font-semibold">Location:</span> $1</p>')
                         .replace(/^\*\*Type:\*\* (.*$)/gim, '<p class="text-sm text-slate-500 mb-1 flex items-center gap-1"><span class="font-semibold">Type:</span> $1</p>')
                         .replace(/^\*\*Key Details:\*\* (.*$)/gim, '<p class="text-slate-700 mb-4">$1</p>') 
                     }} />
                   </div>
                 </div>
              </div>

              {/* Sources / Apply Links Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 sticky top-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    Sources & Apply
                  </h3>
                  
                  {webResults.chunks && webResults.chunks.length > 0 ? (
                    <div className="space-y-3">
                      {webResults.chunks.map((chunk, idx) => {
                        if (chunk.web?.uri && chunk.web?.title) {
                          return (
                            <a 
                              key={idx}
                              href={chunk.web.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group"
                            >
                              <div className="text-xs font-semibold text-blue-600 mb-1 truncate">
                                {new URL(chunk.web.uri).hostname.replace('www.', '')}
                              </div>
                              <div className="text-sm text-slate-800 font-medium leading-tight group-hover:text-blue-700">
                                {chunk.web.title}
                              </div>
                              <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                                Visit Site <ExternalLink className="w-3 h-3" />
                              </div>
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No direct links available. Try searching the specific company names.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 opacity-60">
               {isSearching ? (
                 <div className="flex flex-col items-center">
                   <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                   <p className="text-slate-600 font-medium">Scouring the web for opportunities...</p>
                 </div>
               ) : (
                 <>
                   <Globe className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                   <h3 className="text-lg font-medium text-slate-500">Search the entire web</h3>
                   <p className="text-slate-400">Use the search bar above to find jobs outside our network.</p>
                 </>
               )}
            </div>
          )}
        </div>
      )}

      {/* Alert Subscription Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAlertModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create Job Alert</h3>
                <p className="text-sm text-slate-500">Get notified for new opportunities</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Search:</span>
                  <span className="font-semibold text-slate-900">{query || 'All Jobs'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-900">{location || 'Anywhere'}</span>
                </div>
                {jobType !== 'All' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Type:</span>
                    <span className="font-semibold text-slate-900">{jobType}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Notification Method</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setAlertPreference('email')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      alertPreference === 'email' 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Mail className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">Email</span>
                  </button>
                  <button 
                    onClick={() => setAlertPreference('push')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      alertPreference === 'push' 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">Push</span>
                  </button>
                  <button 
                    onClick={() => setAlertPreference('both')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      alertPreference === 'both' 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex gap-1 mb-1">
                      <Mail className="w-4 h-4" />
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">Both</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateAlert}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-slate-900/10"
            >
              Activate Alert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};