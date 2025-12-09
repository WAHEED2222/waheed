import React, { useState } from 'react';
import { UserRole, AppMode, JobListing } from './types';
import { ResumeAudit } from './components/ResumeAudit';
import { LiveInterview } from './components/LiveInterview';
import { JobArchitect } from './components/JobArchitect';
import { JobSearch } from './components/JobSearch';
import { Auth } from './components/Auth';
import { FlutterExport } from './components/FlutterExport';
import { 
  Briefcase, 
  Search, 
  UserCircle, 
  FileText, 
  Mic, 
  Users,
  Building2,
  LogOut,
  Menu,
  MoreVertical,
  Code2
} from 'lucide-react';

const SAMPLE_JOBS: JobListing[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'TechFlow Solutions',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    salary: '$140k - $180k',
    description: 'We are looking for a React expert to lead our dashboard team...',
    tags: ['React', 'TypeScript', 'Tailwind'],
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Creative Studio',
    location: 'Remote',
    type: 'Contract',
    salary: '$80/hr',
    description: 'Join our award-winning design team working on mobile-first experiences...',
    tags: ['Figma', 'UI/UX', 'Mobile'],
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.SEEKER);
  const [mode, setMode] = useState<AppMode>(AppMode.JOB_SEARCH);
  const [showExport, setShowExport] = useState(false);
  
  // Shared Job State
  const [jobs, setJobs] = useState<JobListing[]>(SAMPLE_JOBS);

  const handleAuthSuccess = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
    setMode(selectedRole === UserRole.SEEKER ? AppMode.JOB_SEARCH : AppMode.JOB_ARCHITECT);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(UserRole.SEEKER);
    setMode(AppMode.JOB_SEARCH);
  };

  const handleAddJob = (job: JobListing) => {
    setJobs(prev => [job, ...prev]);
    // Optional: Switch back to candidate screen or show success toast
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.JOB_SEARCH:
        return <JobSearch jobs={jobs} />;
      case AppMode.RESUME_AUDIT:
        return <ResumeAudit />;
      case AppMode.INTERVIEW:
        return <LiveInterview />;
      case AppMode.JOB_ARCHITECT:
        return <JobArchitect onPostJob={handleAddJob} />;
      default:
        return <div className="text-center p-12 text-slate-400">Select a tool</div>;
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Auth onAuthSuccess={handleAuthSuccess} />
        {/* Secret trigger for dev mode on auth screen */}
        <button 
          onClick={() => setShowExport(true)}
          className="fixed top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full z-50 transition-colors"
          title="Export Flutter Code"
        >
          <Code2 className="w-5 h-5" />
        </button>
        {showExport && <FlutterExport onClose={() => setShowExport(false)} />}
      </>
    );
  }

  // Define Navigation Items based on Role
  const navItems = role === UserRole.SEEKER ? [
    { mode: AppMode.JOB_SEARCH, label: 'Jobs', icon: Search },
    { mode: AppMode.RESUME_AUDIT, label: 'Resume', icon: FileText },
    { mode: AppMode.INTERVIEW, label: 'Interview', icon: Mic },
  ] : [
    { mode: AppMode.JOB_ARCHITECT, label: 'Post Job', icon: Building2 },
    { mode: AppMode.CANDIDATE_SCREEN, label: 'Candidates', icon: Users },
  ];

  const currentNav = navItems.find(item => item.mode === mode) || navItems[0];

  return (
    // "Scaffold" Layout - 100vh fixed with md:pl-20 to accommodate desktop sidebar
    <div className="h-full w-full flex flex-col bg-slate-50 font-sans md:pl-20">
      
      {/* App Bar - Flutter Style */}
      <header className="h-16 bg-indigo-600 text-white shadow-md flex items-center justify-between px-4 z-30 shrink-0 pt-safe">
        <div className="flex items-center gap-4">
          {/* Leading Icon */}
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="font-bold text-lg">J</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            {currentNav.label}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={() => setShowExport(true)}
             className="p-2 hover:bg-white/10 rounded-full transition-colors hidden md:flex"
             title="Get Flutter Code"
           >
             <Code2 className="w-5 h-5" />
           </button>
           <button 
             onClick={handleLogout}
             className="p-2 hover:bg-white/10 rounded-full transition-colors"
           >
             <LogOut className="w-5 h-5" />
           </button>
           <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
             <UserCircle className="w-6 h-6" />
           </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full scroll-smooth">
        {/* pb-24 ensures content isn't hidden behind mobile bottom nav */}
        <div className="max-w-3xl mx-auto p-4 pb-28 md:pb-8 animate-fade-in">
           {renderContent()}
        </div>
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="md:hidden bg-white border-t border-slate-200 flex justify-around items-center px-2 fixed bottom-0 w-full z-40 pb-safe pt-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = mode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => setMode(item.mode)}
              className={`flex flex-col items-center justify-center w-full gap-1 p-2 transition-all duration-200 ${
                isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-full transition-all ${isActive ? 'bg-indigo-50 transform scale-110' : ''}`}>
                <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Navigation Rail (Desktop) */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-200 z-50 items-center py-6 gap-6 pt-safe">
         <div className="mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">J</div>
         </div>
         
         {navItems.map((item) => {
          const isActive = mode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => setMode(item.mode)}
              className="group relative flex flex-col items-center gap-1"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-indigo-700' : 'text-slate-400'}`}>
                {item.label}
              </span>
              
              {/* Tooltip for rail */}
              <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {item.label}
              </div>
            </button>
          );
        })}
        
        <div className="mt-auto mb-4 flex flex-col gap-4">
          <button 
             onClick={() => setShowExport(true)}
             className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
             title="Get Flutter Code"
           >
             <Code2 className="w-5 h-5" />
           </button>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Modal for Export */}
      {showExport && <FlutterExport onClose={() => setShowExport(false)} />}
    </div>
  );
}