import React, { useState } from 'react';
import { UserRole } from '../types';
import { Mail, Lock, User, ArrowRight, Briefcase, Building2, Loader2, CheckCircle2 } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (role: UserRole) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.SEEKER);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) return;

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess(role);
    }, 1500);
  };

  return (
    <div className="min-h-full w-full bg-slate-50 md:bg-slate-900 flex items-stretch md:items-center justify-center md:p-4 overflow-y-auto">
      {/* Mobile-first: This container fills screen on mobile, becomes card on desktop */}
      <div className="w-full bg-white md:max-w-4xl md:rounded-3xl md:shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-screen md:min-h-[600px]">
        
        {/* Left Side - Brand / Info (Collapses to header on mobile) */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 p-8 md:p-12 text-white flex flex-col justify-between relative shrink-0">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-10 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 md:block mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                 <span className="text-xl md:text-2xl font-bold">J</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold md:mb-4">JOBEE</h1>
            </div>
            
            <p className="text-blue-100 text-sm md:text-lg leading-relaxed opacity-90 hidden md:block">
              Connect with your future. Whether you're finding your dream job or building your dream team.
            </p>
          </div>

          <div className="relative z-10 space-y-3 hidden md:block">
            <div className="flex items-center gap-3 text-sm font-medium bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
              <div className="bg-green-400/20 p-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-green-300" />
              </div>
              AI-Powered Resume Analysis
            </div>
            <div className="flex items-center gap-3 text-sm font-medium bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
              <div className="bg-green-400/20 p-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-green-300" />
              </div>
              Real-time Interview Coaching
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-6 md:p-12 bg-white flex flex-col justify-center animate-fade-in pb-safe">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-500 text-sm md:text-base">
                {isLogin ? 'Enter your details to access your dashboard.' : 'Get started with your AI career companion.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                    <input 
                      type="text" 
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                  <input 
                    type="email" 
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                  <input 
                    type="password" 
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">I am a...</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.SEEKER)}
                      className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border-2 transition-all ${
                        role === UserRole.SEEKER 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-slate-100 hover:border-slate-300 text-slate-500'
                      }`}
                    >
                      <Briefcase className="w-5 h-5 md:w-6 md:h-6 mb-2" />
                      <span className="font-semibold text-xs md:text-sm">Job Hunter</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.RECRUITER)}
                      className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl border-2 transition-all ${
                        role === UserRole.RECRUITER 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-100 hover:border-slate-300 text-slate-500'
                      }`}
                    >
                      <Building2 className="w-5 h-5 md:w-6 md:h-6 mb-2" />
                      <span className="font-semibold text-xs md:text-sm">Recruiter</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-70 mt-4"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-semibold text-blue-600 hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};