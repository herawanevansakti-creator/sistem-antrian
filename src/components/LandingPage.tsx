'use client';

import Link from 'next/link';
import { User, ClipboardCheck, Settings, ArrowRight, Infinity, HelpCircle, Headphones } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="relative min-h-screen flex flex-col w-full overflow-hidden bg-[#f6f6f8]">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#3636e2]/5 blur-[120px]" />
                <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[100px]" />
            </div>

            {/* Top Navigation */}
            <header className="relative z-10 w-full px-6 py-5 md:px-10 lg:px-20 border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#3636e2]/10 text-[#3636e2]">
                            <Infinity className="w-6 h-6" />
                        </div>
                        <h2 className="text-[#0e0e1b] text-xl font-bold tracking-tight">RecruitFlow</h2>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <a className="text-[#505095] text-sm font-medium hover:text-[#3636e2] transition-colors flex items-center gap-2" href="#">
                            <HelpCircle className="w-4 h-4" />
                            Help Center
                        </a>
                        <a className="text-[#505095] text-sm font-medium hover:text-[#3636e2] transition-colors flex items-center gap-2" href="#">
                            <Headphones className="w-4 h-4" />
                            Contact Support
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-12 md:py-20">
                <div className="max-w-4xl w-full flex flex-col items-center text-center">
                    {/* Hero Text */}
                    <div className="mb-12 max-w-2xl animate-fade-in">
                        <h1 className="text-[#0e0e1b] text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6">
                            Streamline your <br />
                            <span className="text-[#3636e2] italic">hiring process</span>
                        </h1>
                        <p className="text-[#505095] text-lg md:text-xl font-normal leading-relaxed">
                            Welcome to the RecruitFlow portal. Select your role below to access your dedicated dashboard and tools.
                        </p>
                    </div>

                    {/* Role Selection Cards */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                        {/* Card 1: Candidate */}
                        <Link
                            href="/sign-in"
                            className="group relative flex flex-col items-start p-8 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:border-[#3636e2]/50 transition-all duration-300 ease-out transform hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-[#3636e2]/0 group-hover:bg-[#3636e2]/[0.02] rounded-xl transition-colors duration-300" />
                            <div className="mb-6 p-4 rounded-full bg-blue-50 text-[#3636e2]">
                                <User className="w-7 h-7" />
                            </div>
                            <h3 className="text-[#0e0e1b] text-xl font-bold mb-2 group-hover:text-[#3636e2] transition-colors">Candidate</h3>
                            <p className="text-[#505095] text-sm leading-relaxed mb-6 text-left">
                                Access your application status, complete check-in procedures, and view interview schedules.
                            </p>
                            <div className="mt-auto flex items-center text-[#3636e2] font-semibold text-sm">
                                Enter Portal
                                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>

                        {/* Card 2: Interviewer */}
                        <Link
                            href="/sign-in"
                            className="group relative flex flex-col items-start p-8 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:border-[#3636e2]/50 transition-all duration-300 ease-out transform hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-[#3636e2]/0 group-hover:bg-[#3636e2]/[0.02] rounded-xl transition-colors duration-300" />
                            <div className="mb-6 p-4 rounded-full bg-purple-50 text-purple-600">
                                <ClipboardCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-[#0e0e1b] text-xl font-bold mb-2 group-hover:text-[#3636e2] transition-colors">Interviewer</h3>
                            <p className="text-[#505095] text-sm leading-relaxed mb-6 text-left">
                                Manage live evaluation sessions, access scoring timers, and submit candidate feedback.
                            </p>
                            <div className="mt-auto flex items-center text-[#3636e2] font-semibold text-sm">
                                Launch Tools
                                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>

                        {/* Card 3: Administrator */}
                        <Link
                            href="/sign-in"
                            className="group relative flex flex-col items-start p-8 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:border-[#3636e2]/50 transition-all duration-300 ease-out transform hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-[#3636e2]/0 group-hover:bg-[#3636e2]/[0.02] rounded-xl transition-colors duration-300" />
                            <div className="mb-6 p-4 rounded-full bg-emerald-50 text-emerald-600">
                                <Settings className="w-7 h-7" />
                            </div>
                            <h3 className="text-[#0e0e1b] text-xl font-bold mb-2 group-hover:text-[#3636e2] transition-colors">Administrator</h3>
                            <p className="text-[#505095] text-sm leading-relaxed mb-6 text-left">
                                Configure system settings, view recruitment analytics, and manage user permissions.
                            </p>
                            <div className="mt-auto flex items-center text-[#3636e2] font-semibold text-sm">
                                System Login
                                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 w-full py-8 text-center border-t border-gray-200/50 bg-[#f6f6f8]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[#505095] text-sm">© 2024 RecruitFlow Inc. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a className="text-[#505095] text-sm hover:text-[#3636e2] transition-colors" href="#">Privacy Policy</a>
                        <a className="text-[#505095] text-sm hover:text-[#3636e2] transition-colors" href="#">Terms of Service</a>
                        <span className="text-gray-400 text-xs">v2.4.0</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
