import { motion } from "framer-motion";
import { CompanyNavbar } from "@/components/company/dashboard/CompanyNavbar";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Heart } from "lucide-react";

const Legal = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const isPrivacy = pathname.includes("privacy");

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <CompanyNavbar />

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

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-16 px-4">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <img src="/logo.png" alt="WeddingWeb Logo" className="w-10 h-10 rounded-xl object-contain bg-white" />
                                <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">WeddingWeb</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed">
                                Making weddings memorable with cutting-edge technology.
                                Built with love in Kerala.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-6 text-white">Product</h3>
                            <ul className="space-y-3 text-slate-400">
                                <li><Link to="/company/services" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link to="/company/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link to="/company/portfolio" className="hover:text-white transition-colors">Portfolio</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-6 text-white">Company</h3>
                            <ul className="space-y-3 text-slate-400">
                                <li><Link to="/company/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link to="/company/contact" className="hover:text-white transition-colors">Contact</Link></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-6 text-white">Support</h3>
                            <ul className="space-y-3 text-slate-400">
                                <li>
                                    <a
                                        href="https://github.com/Kishoreravi2007/Wedding-web-"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        Documentation
                                    </a>
                                </li>
                                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                                <li><Link to="/company/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 text-center text-slate-400 space-y-2">
                        <p>&copy; 2025 WeddingWeb. All rights reserved.</p>
                        <p className="text-sm flex items-center justify-center gap-2">
                            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> in Kerala
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Legal;
