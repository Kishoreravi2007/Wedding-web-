import { useState } from "react";
import { Link } from "react-router-dom";
import { WeddingWebHeader } from "@/components/WeddingWebHeader";
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, MessageCircle, Mail, Camera, Globe, Shield } from "lucide-react";

const faqs = [
    {
        category: "Getting Started",
        items: [
            { q: "How do I create my wedding website?", a: "Sign up for a free account, choose from 30+ premium themes, and customize it with your wedding details using our drag-and-drop builder. Your site will be live in minutes!" },
            { q: "Is WeddingWeb free to use?", a: "We offer a free tier with essential features. Premium plans unlock advanced features like AI face detection, live streaming, and unlimited photo storage." },
            { q: "Can I use my own domain name?", a: "Yes! Premium users can connect a custom domain. You can also use our provided subdomain (yourname.weddingweb.co.in) for free." },
        ]
    },
    {
        category: "AI Face Detection",
        items: [
            { q: "How does AI face detection work?", a: "Our AI scans uploaded photos to detect faces. When a guest takes a selfie, our system matches it against all event photos to instantly show them every photo they appear in." },
            { q: "Is face detection data secure?", a: "Absolutely. Face data is encrypted, stored temporarily for the event duration only, and automatically deleted after the event. We never share biometric data with third parties." },
            { q: "What if face detection doesn't recognize someone?", a: "Our AI has a 95%+ accuracy rate. For best results, ensure good lighting in the reference selfie. Guests can also browse the full gallery manually." },
        ]
    },
    {
        category: "For Photographers",
        items: [
            { q: "How do I upload photos as a photographer?", a: "Use the Photographer Portal to bulk upload images. Our system automatically organizes them by timestamp, location, and detected faces." },
            { q: "What image formats are supported?", a: "We support JPEG, PNG, WebP, and HEIC formats. Images are automatically optimized for fast loading while preserving quality." },
            { q: "Can multiple photographers upload simultaneously?", a: "Yes! Multiple photographers can be assigned to an event and upload concurrently without conflicts." },
        ]
    },
    {
        category: "Account & Billing",
        items: [
            { q: "How do I upgrade my plan?", a: "Go to your Dashboard > Settings > Billing to view plans and upgrade. Changes take effect immediately." },
            { q: "Can I cancel my subscription?", a: "Yes, you can cancel anytime from your dashboard. Your data remains accessible until the end of your billing period." },
            { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI, net banking, and popular wallets via Razorpay." },
        ]
    },
];

const quickLinks = [
    { icon: <BookOpen className="w-6 h-6" />, title: "Customer Guide", desc: "Step-by-step setup walkthrough", link: "/company/guide" },
    { icon: <Camera className="w-6 h-6" />, title: "Photographer Guide", desc: "Upload and manage photos", link: "/company/guide" },
    { icon: <Globe className="w-6 h-6" />, title: "Website Builder", desc: "Create your wedding site", link: "/company/services" },
    { icon: <Shield className="w-6 h-6" />, title: "Privacy & Security", desc: "How we protect your data", link: "/privacy" },
];

const HelpCenter = () => {
    const [openFaq, setOpenFaq] = useState<string | null>(null);

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111318] min-h-screen flex flex-col">
            <WeddingWebHeader />

            <main className="w-full flex-grow">
                {/* Hero */}
                <section className="w-full px-6 md:px-20 lg:px-40 py-16 md:py-24">
                    <div className="max-w-[1200px] mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                            <HelpCircle className="w-4 h-4" /> Help Center
                        </div>
                        <h1 className="text-[#111318] dark:text-white text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
                            How Can We <span className="text-primary">Help?</span>
                        </h1>
                        <p className="text-[#636f88] dark:text-gray-400 text-lg md:text-xl max-w-[600px] mx-auto">
                            Find answers to common questions, explore our guides, or reach out to our support team.
                        </p>
                    </div>
                </section>

                {/* Quick Links */}
                <section className="px-6 md:px-20 lg:px-40 pb-16">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickLinks.map((item, i) => (
                                <Link key={i} to={item.link}>
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 text-center border border-[#f0f2f4] dark:border-gray-800 hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer h-full">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3 mx-auto group-hover:scale-110 transition-transform">{item.icon}</div>
                                        <h4 className="font-bold text-[#111318] dark:text-white text-sm mb-1">{item.title}</h4>
                                        <p className="text-[#636f88] dark:text-gray-400 text-xs">{item.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Accordion */}
                <section className="bg-white dark:bg-gray-900 px-6 md:px-20 lg:px-40 py-20">
                    <div className="max-w-[800px] mx-auto">
                        <h2 className="text-primary text-sm font-extrabold uppercase tracking-widest mb-3 text-center">FAQ</h2>
                        <h3 className="text-[#111318] dark:text-white text-3xl font-extrabold tracking-tight mb-12 text-center">Frequently Asked Questions</h3>
                        {faqs.map((category, ci) => (
                            <div key={ci} className="mb-8">
                                <h4 className="text-lg font-bold text-[#111318] dark:text-white mb-4">{category.category}</h4>
                                <div className="space-y-3">
                                    {category.items.map((faq, fi) => {
                                        const key = `${ci}-${fi}`;
                                        const isOpen = openFaq === key;
                                        return (
                                            <div key={fi} className={`bg-[#f8f9fc] dark:bg-gray-800 rounded-xl border border-[#f0f2f4] dark:border-gray-700 transition-shadow ${isOpen ? 'shadow-md' : ''}`}>
                                                <button
                                                    onClick={() => setOpenFaq(isOpen ? null : key)}
                                                    className="w-full p-5 flex items-center justify-between text-left"
                                                >
                                                    <span className="font-medium text-[#111318] dark:text-white pr-4">{faq.q}</span>
                                                    {isOpen ? <ChevronUp className="w-5 h-5 text-[#636f88] flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-[#636f88] flex-shrink-0" />}
                                                </button>
                                                {isOpen && (
                                                    <div className="px-5 pb-5">
                                                        <p className="text-[#636f88] dark:text-gray-400 leading-relaxed">{faq.a}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Still Need Help? */}
                <section className="px-6 md:px-20 lg:px-40 py-20">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-12 md:p-16 text-center">
                            <h3 className="text-[#111318] dark:text-white text-3xl font-extrabold mb-4">Still Need Help?</h3>
                            <p className="text-[#636f88] dark:text-gray-400 text-lg mb-8 max-w-[500px] mx-auto">
                                Our support team is here to assist. Reach out via any of these channels.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href="https://wa.me/917012567978" target="_blank" rel="noopener noreferrer">
                                    <button className="flex items-center justify-center gap-2 min-w-[200px] h-14 rounded-xl bg-[#25D366] text-white font-bold text-lg shadow-xl hover:translate-y-[-2px] transition-all px-6">
                                        <MessageCircle className="w-5 h-5" /> WhatsApp Support
                                    </button>
                                </a>
                                <Link to="/company/contact">
                                    <button className="flex items-center justify-center gap-2 min-w-[180px] h-14 rounded-xl border-2 border-[#dce1e8] dark:border-gray-700 text-[#111318] dark:text-white font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all px-6">
                                        <Mail className="w-5 h-5" /> Contact Form
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-900 border-t border-[#f0f2f4] dark:border-gray-800 px-6 md:px-20 lg:px-40 py-12">
                <div className="max-w-[1200px] mx-auto text-center">
                    <p className="text-xs text-[#636f88] dark:text-gray-400">&copy; 2026 WeddingWeb AI Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HelpCenter;
