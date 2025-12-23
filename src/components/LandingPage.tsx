'use client';

import Link from 'next/link';
import { User, ClipboardCheck, Settings, ArrowRight, Infinity, HelpCircle, Headphones } from 'lucide-react';

export default function LandingPage() {
    return (
        <div style={{ backgroundColor: '#f6f6f8', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            {/* Background Decor */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'rgba(54, 54, 226, 0.05)', filter: 'blur(120px)' }} />
                <div style={{ position: 'absolute', top: '40%', left: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.05)', filter: 'blur(100px)' }} />
            </div>

            {/* Top Navigation */}
            <header style={{ position: 'relative', zIndex: 10, width: '100%', padding: '20px 40px', borderBottom: '1px solid rgba(229, 231, 235, 0.5)' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(54, 54, 226, 0.1)' }}>
                            <Infinity style={{ width: '24px', height: '24px', color: '#3636e2' }} />
                        </div>
                        <h2 style={{ color: '#0e0e1b', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.025em' }}>RecruitFlow</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <a href="#" style={{ color: '#505095', fontSize: '14px', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <HelpCircle style={{ width: '16px', height: '16px' }} />
                            Help Center
                        </a>
                        <a href="#" style={{ color: '#505095', fontSize: '14px', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Headphones style={{ width: '16px', height: '16px' }} />
                            Contact Support
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '80px 16px' }}>
                <div style={{ maxWidth: '900px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    {/* Hero Text */}
                    <div style={{ marginBottom: '48px', maxWidth: '600px' }}>
                        <h1 style={{ color: '#0e0e1b', fontSize: '48px', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: '24px' }}>
                            Streamline your <br />
                            <span style={{ color: '#3636e2', fontStyle: 'italic' }}>hiring process</span>
                        </h1>
                        <p style={{ color: '#505095', fontSize: '18px', fontWeight: 400, lineHeight: 1.6 }}>
                            Welcome to the RecruitFlow portal. Select your role below to access your dedicated dashboard and tools.
                        </p>
                    </div>

                    {/* Role Selection Cards */}
                    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {/* Card 1: Candidate */}
                        <Link
                            href="/sign-in"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                padding: '32px',
                                borderRadius: '16px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = 'rgba(54, 54, 226, 0.5)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '50%', backgroundColor: '#eff6ff' }}>
                                <User style={{ width: '28px', height: '28px', color: '#3636e2' }} />
                            </div>
                            <h3 style={{ color: '#0e0e1b', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Candidate</h3>
                            <p style={{ color: '#505095', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', textAlign: 'left' }}>
                                Access your application status, complete check-in procedures, and view interview schedules.
                            </p>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: '#3636e2', fontWeight: 600, fontSize: '14px' }}>
                                Enter Portal
                                <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                            </div>
                        </Link>

                        {/* Card 2: Interviewer */}
                        <Link
                            href="/sign-in"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                padding: '32px',
                                borderRadius: '16px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = 'rgba(54, 54, 226, 0.5)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '50%', backgroundColor: '#f3e8ff' }}>
                                <ClipboardCheck style={{ width: '28px', height: '28px', color: '#9333ea' }} />
                            </div>
                            <h3 style={{ color: '#0e0e1b', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Interviewer</h3>
                            <p style={{ color: '#505095', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', textAlign: 'left' }}>
                                Manage live evaluation sessions, access scoring timers, and submit candidate feedback.
                            </p>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: '#3636e2', fontWeight: 600, fontSize: '14px' }}>
                                Launch Tools
                                <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                            </div>
                        </Link>

                        {/* Card 3: Administrator */}
                        <Link
                            href="/sign-in"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                padding: '32px',
                                borderRadius: '16px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = 'rgba(54, 54, 226, 0.5)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '50%', backgroundColor: '#d1fae5' }}>
                                <Settings style={{ width: '28px', height: '28px', color: '#059669' }} />
                            </div>
                            <h3 style={{ color: '#0e0e1b', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Administrator</h3>
                            <p style={{ color: '#505095', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px', textAlign: 'left' }}>
                                Configure system settings, view recruitment analytics, and manage user permissions.
                            </p>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: '#3636e2', fontWeight: 600, fontSize: '14px' }}>
                                System Login
                                <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                            </div>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ position: 'relative', zIndex: 10, width: '100%', padding: '32px 40px', textAlign: 'center', borderTop: '1px solid rgba(229, 231, 235, 0.5)', backgroundColor: '#f6f6f8' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: '#505095', fontSize: '14px' }}>© 2024 RecruitFlow Inc. All rights reserved.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <a href="#" style={{ color: '#505095', fontSize: '14px', textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" style={{ color: '#505095', fontSize: '14px', textDecoration: 'none' }}>Terms of Service</a>
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>v2.4.0</span>
                    </div>
                </div>
            </footer>

            {/* Responsive Styles */}
            <style jsx>{`
        @media (max-width: 768px) {
          main > div > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
}
