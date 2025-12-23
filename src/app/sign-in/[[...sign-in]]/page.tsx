'use client';

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Infinity, QrCode, Timer, BarChart3, ArrowLeft, Lock } from 'lucide-react';

export default function SignInPage() {
    return (
        <div style={{
            backgroundColor: '#F3F4F6',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background Pattern */}
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundImage: 'radial-gradient(#4F46E5 0.5px, transparent 0.5px), radial-gradient(#4F46E5 0.5px, transparent 0.5px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
                opacity: 0.03,
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Gradient Blurs */}
            <div style={{
                position: 'fixed',
                top: '-10%',
                left: '-10%',
                width: '40%',
                height: '40%',
                borderRadius: '50%',
                background: 'rgba(79, 70, 229, 0.1)',
                filter: 'blur(100px)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed',
                bottom: '-10%',
                right: '-10%',
                width: '40%',
                height: '40%',
                borderRadius: '50%',
                background: 'rgba(96, 165, 250, 0.1)',
                filter: 'blur(100px)',
                pointerEvents: 'none'
            }} />

            {/* Main Container */}
            <div style={{
                width: '100%',
                maxWidth: '1152px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '32px',
                zIndex: 10,
                alignItems: 'center'
            }}>
                {/* Left Side - Login Form */}
                <div style={{ width: '100%', maxWidth: '448px', marginLeft: 'auto' }}>
                    {/* Mobile Logo */}
                    <div style={{ marginBottom: '32px', textAlign: 'center', display: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4F46E5' }}>
                            <Infinity style={{ width: '32px', height: '32px' }} />
                            <span style={{ fontWeight: 700, fontSize: '24px', color: '#111827' }}>RecruitFlow</span>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                        border: '1px solid #E5E7EB',
                        padding: '40px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '24px', color: '#111827', marginBottom: '8px' }}>
                                Sign in to RecruitFlow
                            </h2>
                            <p style={{ color: '#6B7280', fontSize: '14px' }}>
                                Welcome back. Please sign in to continue.
                            </p>
                        </div>

                        {/* Clerk SignIn Component */}
                        <SignIn
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    card: "shadow-none p-0 border-0 bg-transparent",
                                    header: "hidden",
                                    footer: "hidden",
                                    socialButtonsBlockButton: "w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 transition-all",
                                    socialButtonsBlockButtonText: "text-sm font-medium text-gray-700",
                                    dividerRow: "my-6",
                                    dividerLine: "bg-gray-200",
                                    dividerText: "text-xs text-gray-400 font-medium uppercase tracking-wider",
                                    formFieldLabel: "text-sm font-medium text-gray-700 mb-1.5",
                                    formFieldInput: "w-full rounded-xl border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:ring-indigo-600 text-sm py-2.5 transition-shadow",
                                    formButtonPrimary: "w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]",
                                    footerActionLink: "font-medium text-indigo-600 hover:text-indigo-700 transition-colors",
                                    footerActionText: "text-sm text-gray-500",
                                    identityPreview: "bg-gray-50 rounded-xl border border-gray-200",
                                    formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-600",
                                    alertText: "text-sm text-red-600",
                                    formFieldAction: "text-sm text-indigo-600 hover:text-indigo-700",
                                }
                            }}
                        />

                        {/* Secured by Clerk */}
                        <div style={{
                            marginTop: '32px',
                            paddingTop: '24px',
                            borderTop: '1px solid #E5E7EB',
                            textAlign: 'center'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9CA3AF' }}>
                                    <Lock style={{ width: '14px', height: '14px' }} />
                                    <span>Secured by Clerk</span>
                                </div>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 500,
                                    color: '#D97706',
                                    backgroundColor: '#FEF3C7',
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    border: '1px solid #FDE68A'
                                }}>
                                    Development mode
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                        <Link
                            href="/"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#6B7280',
                                textDecoration: 'none'
                            }}
                        >
                            <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                            Back to home
                        </Link>
                    </div>
                </div>

                {/* Right Side - Branding */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingLeft: '48px',
                    position: 'relative'
                }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4F46E5', marginBottom: '24px' }}>
                        <Infinity style={{ width: '40px', height: '40px' }} />
                        <span style={{ fontWeight: 700, fontSize: '28px', color: '#111827' }}>RecruitFlow</span>
                    </div>

                    {/* Welcome Text */}
                    <div style={{ maxWidth: '512px' }}>
                        <h1 style={{
                            fontWeight: 700,
                            fontSize: '48px',
                            lineHeight: 1.1,
                            color: '#111827',
                            marginBottom: '24px'
                        }}>
                            Welcome back
                        </h1>
                        <p style={{
                            fontSize: '18px',
                            color: '#4B5563',
                            lineHeight: 1.6,
                            marginBottom: '32px'
                        }}>
                            Manage your recruitment pipeline, track interview times, and verify candidates effortlessly.
                        </p>

                        {/* Feature Badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(8px)',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                <QrCode style={{ width: '20px', height: '20px', color: '#4F46E5' }} />
                                <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>QR Check-in</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(8px)',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                <Timer style={{ width: '20px', height: '20px', color: '#4F46E5' }} />
                                <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Interview Timer</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                backdropFilter: 'blur(8px)',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                <BarChart3 style={{ width: '20px', height: '20px', color: '#4F46E5' }} />
                                <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Analytics</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Responsive Styles */}
            <style jsx>{`
                @media (max-width: 1024px) {
                    div[style*="gridTemplateColumns"] {
                        grid-template-columns: 1fr !important;
                    }
                    div[style*="paddingLeft: '48px'"] {
                        display: none !important;
                    }
                    div[style*="marginLeft: 'auto'"] {
                        margin: 0 auto !important;
                    }
                }
            `}</style>
        </div>
    );
}
