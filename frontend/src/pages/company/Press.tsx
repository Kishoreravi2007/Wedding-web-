import { Link } from "react-router-dom";
import { WeddingWebHeader } from "@/components/WeddingWebHeader";
import { Newspaper, Mail, ExternalLink, Calendar, ArrowRight } from "lucide-react";

const pressReleases = [
    {
        date: "February 2026",
        title: "WeddingWeb Launches AI-Powered Face Detection for Wedding Photo Galleries",
        excerpt: "WeddingWeb introduces industry-first AI face recognition technology that allows wedding guests to instantly find their photos across thousands of event images.",
    },
    {
        date: "January 2026",
        title: "WeddingWeb Announces Premium Wedding Website Builder with 30+ Themes",
        excerpt: "Couples can now create stunning, personalized wedding websites with a drag-and-drop builder featuring over 30 professionally designed premium themes.",
    },
    {
        date: "December 2025",
        title: "Kerala-Based Startup WeddingWeb Enters the Wedding Tech Market",
        excerpt: "WeddingWeb AI Inc. officially launches, bringing cutting-edge technology solutions to the multi-billion dollar wedding industry in India.",
    },
];

const mediaHighlights = [
    { stat: "AI-Powered", label: "Face Detection Engine" },
    { stat: "30+", label: "Premium Themes" },
    { stat: "4K", label: "Live Streaming" },
    { stat: "500+", label: "Guests Served" },
];

const Press = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111318] min-h-screen flex flex-col">
            <WeddingWebHeader />

            <main className="w-full flex-grow">
                {/* Hero */}
                <section className="w-full px-6 md:px-20 lg:px-40 py-16 md:py-24">
                    <div className="max-w-[1200px] mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                            <Newspaper className="w-4 h-4" /> Press & Media
                        </div>
                        <h1 className="text-[#111318] dark:text-white text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
                            In the <span className="text-primary">News</span>
                        </h1>
                        <p className="text-[#636f88] dark:text-gray-400 text-lg md:text-xl max-w-[600px] mx-auto">
                            Stay up to date with WeddingWeb's latest announcements, press releases, and media coverage.
                        </p>
                    </div>
                </section>

                {/* Key Stats */}
                <section className="bg-white dark:bg-gray-900 px-6 md:px-20 lg:px-40 py-16">
                    <div className="max-w-[900px] mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {mediaHighlights.map((item, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl md:text-4xl font-extrabold text-primary mb-1">{item.stat}</div>
                                    <div className="text-[#636f88] dark:text-gray-400 text-sm font-medium">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Press Releases */}
                <section className="px-6 md:px-20 lg:px-40 py-20">
                    <div className="max-w-[900px] mx-auto">
                        <h2 className="text-primary text-sm font-extrabold uppercase tracking-widest mb-3 text-center">Announcements</h2>
                        <h3 className="text-[#111318] dark:text-white text-3xl font-extrabold tracking-tight mb-12 text-center">Press Releases</h3>
                        <div className="space-y-6">
                            {pressReleases.map((pr, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-[#f0f2f4] dark:border-gray-800 hover:shadow-lg transition-all group cursor-pointer">
                                    <div className="flex items-center gap-2 text-sm text-[#636f88] dark:text-gray-400 mb-3">
                                        <Calendar className="w-4 h-4" /> {pr.date}
                                    </div>
                                    <h4 className="text-xl font-bold text-[#111318] dark:text-white mb-3 group-hover:text-primary transition-colors">{pr.title}</h4>
                                    <p className="text-[#636f88] dark:text-gray-400 leading-relaxed mb-4">{pr.excerpt}</p>
                                    <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Read Full Release <ExternalLink className="w-4 h-4" />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Media Contact CTA */}
                <section className="px-6 md:px-20 lg:px-40 pb-24">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-12 md:p-16 text-center">
                            <h3 className="text-[#111318] dark:text-white text-3xl font-extrabold mb-4">Media Inquiries</h3>
                            <p className="text-[#636f88] dark:text-gray-400 text-lg mb-8 max-w-[500px] mx-auto">
                                For press inquiries, interviews, or media kit access, reach out to our communications team.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href="mailto:press@weddingweb.co.in">
                                    <button className="flex items-center justify-center gap-2 min-w-[200px] h-14 rounded-xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/25 hover:translate-y-[-2px] transition-all px-6">
                                        <Mail className="w-5 h-5" /> Contact Press Team
                                    </button>
                                </a>
                                <Link to="/company/about">
                                    <button className="flex items-center justify-center gap-2 min-w-[180px] h-14 rounded-xl border-2 border-[#dce1e8] dark:border-gray-700 text-[#111318] dark:text-white font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all px-6">
                                        Company Info <ArrowRight className="w-5 h-5" />
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

export default Press;
