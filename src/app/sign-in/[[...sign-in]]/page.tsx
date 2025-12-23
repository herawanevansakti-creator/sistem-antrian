import { SignIn } from "@clerk/nextjs";
import { TrendingUp } from "lucide-react";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-indigo-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl rotate-3 mb-4">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-indigo-950 tracking-tighter italic">RecruitFlow</h1>
                    <p className="text-gray-400 text-sm font-medium mt-1">Smart Queue Management System</p>
                </div>

                {/* Sign In Component */}
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto w-full",
                            card: "bg-white shadow-2xl rounded-[32px] border-0",
                        }
                    }}
                />
            </div>
        </div>
    );
}
