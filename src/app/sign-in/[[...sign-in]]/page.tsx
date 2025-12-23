import { SignIn } from "@clerk/nextjs";
import { Infinity } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-[#f6f6f8] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#3636e2]/5 blur-[120px]" />
                <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[100px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 w-full px-6 py-5 md:px-10 lg:px-20 border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#3636e2]/10 text-[#3636e2]">
                            <Infinity className="w-6 h-6" />
                        </div>
                        <h2 className="text-[#0e0e1b] text-xl font-bold tracking-tight">RecruitFlow</h2>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center px-4 py-12 md:py-20">
                <div className="w-full max-w-md">
                    {/* Text */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black text-[#0e0e1b] tracking-tight mb-2">Welcome back</h1>
                        <p className="text-[#505095] text-sm font-medium">Sign in to access your dashboard</p>
                    </div>

                    {/* Sign In Component */}
                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: "mx-auto w-full",
                                card: "bg-white shadow-2xl rounded-[32px] border border-gray-100",
                            }
                        }}
                    />

                    {/* Back Link */}
                    <div className="text-center mt-6">
                        <Link href="/" className="text-[#505095] text-sm hover:text-[#3636e2] transition-colors">
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
