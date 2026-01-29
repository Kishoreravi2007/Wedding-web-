import { motion } from "framer-motion";
import CompanyNavSimple from "@/components/CompanyNavSimple";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const Legal = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const isPrivacy = pathname.includes("privacy");

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <CompanyNavSimple />

            <main className="container max-w-4xl mx-auto px-4 pt-32 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-200"
                >
                    <div className="mb-8 flex gap-4 border-b border-slate-100 pb-4">
                        <Link
                            to="/privacy"
                            className={`pb-2 px-4 font-semibold transition-all ${isPrivacy ? 'text-rose-600 border-b-2 border-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/terms"
                            className={`pb-2 px-4 font-semibold transition-all ${!isPrivacy ? 'text-rose-600 border-b-2 border-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Terms of Service
                        </Link>
                    </div>

                    {isPrivacy ? (
                        <div className="prose prose-slate max-w-none">
                            <h1 className="text-3xl font-bold mb-6 text-slate-900">Privacy Policy</h1>
                            <p className="text-slate-600 mb-4">Last Updated: January 2025</p>

                            <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">1. Information We Collect</h2>
                            <p className="text-slate-600 mb-4">
                                We collect information you provide directly to us, such as when you create an account,
                                fill out a contact form, or upload photos to your wedding gallery.
                                This may include your name, email address, phone number, and media files.
                            </p>

                            <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">2. How We Use Your Information</h2>
                            <p className="text-slate-600 mb-4">
                                We use the information we collect to provide, maintain, and improve our services,
                                including AI face detection features that help guests find their photos more easily.
                                We do not sell your personal data to third parties.
                            </p>

                            <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">3. Data Security</h2>
                            <p className="text-slate-600 mb-4">
                                We implement industry-standard security measures to protect your data.
                                However, no method of transmission over the internet is 100% secure,
                                and we cannot guarantee absolute security.
                            </p>

                            <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">4. Contact Us</h2>
                            <p className="text-slate-600 mb-4">
                                If you have any questions about this Privacy Policy, please contact us at help.weddingweb@gmail.com.
                            </p>
                        </div>
                    ) : (
                        <div className="prose prose-slate max-w-none">
                            <h1 className="text-3xl font-bold mb-6 text-slate-900">Terms of Service</h1>
                            <p className="text-slate-600 mb-4">Last Updated: January 2025</p>

                            <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">1. Acceptance of Terms</h2>
                            <p className="text-slate-600 mb-4">
                                By accessing or using WeddingWeb, you agree to be bound by these Terms of Service
                                and all applicable laws and regulations.
                            </p>

                            <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">2. Use of Service</h2>
                            <p className="text-slate-600 mb-4">
                                You are responsible for any content you upload even if it involves AI processing.
                                You must have the necessary rights to share and process the media you upload
                                to our platform.
                            </p>

                            <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">3. Intellectual Property</h2>
                            <p className="text-slate-600 mb-4">
                                The WeddingWeb platform, brand, and technology are property of WeddingWeb Inc.
                                Your wedding photos remain your property, but you grant us a license to
                                host and process them to provide our services.
                            </p>

                            <h2 className="text-xl font-bold mt-8 mb-4 text-slate-800">4. Limitation of Liability</h2>
                            <p className="text-slate-600 mb-4">
                                WeddingWeb shall not be liable for any indirect, incidental, or consequential
                                damages resulting from the use or inability to use our services.
                            </p>
                        </div>
                    )}
                </motion.div>

                <div className="mt-12 text-center">
                    <Link to="/" className="text-rose-600 font-semibold hover:underline">
                        Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Legal;
