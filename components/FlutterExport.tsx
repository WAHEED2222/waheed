import React, { useState } from 'react';
import { X, Copy, Check, Smartphone, Code2, FileCode } from 'lucide-react';

const DART_FILES = [
  {
    name: 'main.dart',
    code: `import 'package:flutter/material.dart';
import 'screens/auth_screen.dart';
import 'screens/home_screen.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const JobeeApp());
}

class JobeeApp extends StatelessWidget {
  const JobeeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'JOBEE',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const AuthScreen(),
      routes: {
        '/home': (context) => const HomeScreen(),
        '/auth': (context) => const AuthScreen(),
      },
    );
  }
}`
  },
  {
    name: 'screens/auth_screen.dart',
    code: `import 'package:flutter/material.dart';
import '../widgets/primary_button.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool isLogin = true;
  String selectedRole = 'Seeker';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Left Branding Panel (Hidden on Mobile)
          if (MediaQuery.of(context).size.width > 800)
            Expanded(
              child: Container(
                color: Theme.of(context).primaryColor,
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('JOBEE', style: TextStyle(color: Colors.white, fontSize: 48, fontWeight: FontWeight.bold)),
                      Text('Find your future.', style: TextStyle(color: Colors.white70)),
                    ],
                  ),
                ),
              ),
            ),
            
          // Right Form Panel
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(32.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    isLogin ? 'Welcome Back' : 'Create Account',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 32),
                  TextFormField(
                    decoration: const InputDecoration(
                      labelText: 'Email Address',
                      prefixIcon: Icon(Icons.email_outlined),
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Password',
                      prefixIcon: Icon(Icons.lock_outlined),
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 24),
                  if (!isLogin) ...[
                    // Role Selection
                    Row(
                      children: [
                        Expanded(
                          child: _RoleCard(
                            title: 'Job Hunter',
                            icon: Icons.work_outline,
                            isSelected: selectedRole == 'Seeker',
                            onTap: () => setState(() => selectedRole = 'Seeker'),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _RoleCard(
                            title: 'Recruiter',
                            icon: Icons.business,
                            isSelected: selectedRole == 'Recruiter',
                            onTap: () => setState(() => selectedRole = 'Recruiter'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],
                  PrimaryButton(
                    onPressed: () => Navigator.pushReplacementNamed(context, '/home'),
                    label: isLogin ? 'Sign In' : 'Sign Up',
                  ),
                  TextButton(
                    onPressed: () => setState(() => isLogin = !isLogin),
                    child: Text(isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleCard({required this.title, required this.icon, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? Colors.blue.shade50 : Colors.white,
          border: Border.all(color: isSelected ? Colors.blue : Colors.grey.shade300),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: isSelected ? Colors.blue : Colors.grey),
            const SizedBox(height: 8),
            Text(title, style: TextStyle(color: isSelected ? Colors.blue : Colors.grey, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}`
  },
  {
    name: 'screens/home_screen.dart',
    code: `import 'package:flutter/material.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('JOBEE'),
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: CircleAvatar(
             backgroundColor: Colors.white24,
             child: const Text('J', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ),
        actions: [
          IconButton(icon: const Icon(Icons.person), onPressed: () {}),
        ],
      ),
      body: IndexedStack(
        index: _selectedIndex,
        children: const [
          Center(child: Text("Job Feed")),
          Center(child: Text("Resume Audit")),
          Center(child: Text("Live Interview")),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.search), label: 'Jobs'),
          NavigationDestination(icon: Icon(Icons.description), label: 'Resume'),
          NavigationDestination(icon: Icon(Icons.mic), label: 'Interview'),
        ],
      ),
    );
  }
}`
  },
  {
    name: 'theme/app_theme.dart',
    code: `import 'package:flutter/material.dart';

class AppTheme {
  static final lightTheme = ThemeData(
    primarySwatch: Colors.indigo,
    useMaterial3: true,
    fontFamily: 'Inter',
    scaffoldBackgroundColor: const Color(0xFFF8FAFC), // Slate 50
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF4F46E5), // Indigo 600
      foregroundColor: Colors.white,
      elevation: 0,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
    ),
  );
}`
  }
];

export const FlutterExport: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(DART_FILES[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Code2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Export to Flutter</h2>
              <p className="text-xs text-slate-400">Generated Dart code for Mobile (iOS/Android)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col overflow-y-auto">
            <div className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Project Files
            </div>
            {DART_FILES.map((file, idx) => (
              <button
                key={file.name}
                onClick={() => setActiveFile(idx)}
                className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors ${
                  activeFile === idx 
                    ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileCode className="w-4 h-4" />
                {file.name}
              </button>
            ))}
          </div>

          {/* Code View */}
          <div className="flex-1 flex flex-col bg-[#1E1E1E]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
              <span className="text-sm text-slate-400 font-mono">{DART_FILES[activeFile].name}</span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <pre className="font-mono text-sm leading-relaxed text-blue-100">
                {DART_FILES[activeFile].code}
              </pre>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-sm text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span>Ready for iOS & Android</span>
          </div>
          <p>Copy these files into your <code>lib/</code> folder.</p>
        </div>
      </div>
    </div>
  );
};