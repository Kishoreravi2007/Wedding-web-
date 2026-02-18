import { Link } from "react-router-dom";
import { WeddingWebHeader } from "@/components/WeddingWebHeader";
import { Briefcase, MapPin, Clock, ArrowRight, Sparkles, Heart, Zap, Users } from "lucide-react";

const openPositions = [
    {
        title: "Full-Stack Developer",
        location: "Remote / Kerala, India",
        type: "Full-time",
        department: "Engineering",
        description: "Build and scale our wedding technology platform using React, Node.js, and PostgreSQL.",
    },
    {
        title: "AI/ML Engineer",
        location: "Remote",
        type: "Full-time",
        department: "Engineering",
        description: "Develop and improve our face detection and image recognition algorithms.",
    },
    {
        title: "UI/UX Designer",
        location: "Remote / Kerala, India",
        type: "Full-time",
        department: "Design",
        description: "Create beautiful, intuitive interfaces for couples, guests, and photographers.",
    },
    {
        title: "Marketing Intern",
        location: "Remote",
        type: "Internship",
        department: "Marketing",
        description: "Help spread the word about WeddingWeb through social media and content creation.",
    },
];

const perks = [
    { icon: <Sparkles className="w-6 h-6" />, title: "Work on Cutting-Edge AI", desc: "Push the boundaries of face detection and computer vision." },
    { icon: <Heart className="w-6 h-6" />, title: "Make People Happy", desc: "Your work directly creates joy for couples and their guests." },
    { icon: <Zap className="w-6 h-6" />, title: "Startup Culture", desc: "Move fast, learn faster. Your ideas shape the product." },
    { icon: <Users className="w-6 h-6" />, title: "Small, Mighty Team", desc: "Work closely with the founder and have real impact." },
];

const Careers = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111318] min-h-screen flex flex-col">
            <WeddingWebHeader />

            <main className="w-full flex-grow">
                {/* Hero */}
                <section className="w-full px-6 md:px-20 lg:px-40 py-16 md:py-24">
                    <div className="max-w-[1200px] mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                            <Briefcase className="w-4 h-4" /> We're Hiring
                        </div>
                        <h1 className="text-[#111318] dark:text-white text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
                            Join Our <span className="text-primary">Mission</span>
                        </h1>
                        <p className="text-[#636f88] dark:text-gray-400 text-lg md:text-xl max-w-[600px] mx-auto">
                            Help us transform how the world celebrates love. We're building the future of wedding technology.
                        </p>
                    </div>
                </section>

                {/* Perks */}
                <section className="bg-white dark:bg-gray-900 px-6 md:px-20 lg:px-40 py-20">
                    <div className="max-w-[1200px] mx-auto">
                        <h2 className="text-primary text-sm font-extrabold uppercase tracking-widest mb-3 text-center">Why WeddingWeb</h2>
                        <h3 className="text-[#111318] dark:text-white text-3xl font-extrabold tracking-tight mb-12 text-center">Why You'll Love Working Here</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {perks.map((perk, i) => (
                                <div key={i} className="bg-[#f8f9fc] dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow border border-[#f0f2f4] dark:border-gray-700">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 mx-auto">{perk.icon}</div>
                                    <h4 className="font-bold text-[#111318] dark:text-white mb-2">{perk.title}</h4>
                                    <p className="text-[#636f88] dark:text-gray-400 text-sm">{perk.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Open Positions */}
                <section className="px-6 md:px-20 lg:px-40 py-20">
                    <div className="max-w-[900px] mx-auto">
                        <h2 className="text-primary text-sm font-extrabold uppercase tracking-widest mb-3 text-center">Open Roles</h2>
                        <h3 className="text-[#111318] dark:text-white text-3xl font-extrabold tracking-tight mb-4 text-center">Open Positions</h3>
                        <p className="text-center text-[#636f88] dark:text-gray-400 mb-12">
                            Can't find a role? Send us your resume at <a href="mailto:careers@weddingweb.co.in" className="text-primary font-bold hover:underline">careers@weddingweb.co.in</a>
                        </p>
                        <div className="space-y-4">
                            {openPositions.map((job, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#f0f2f4] dark:border-gray-800 hover:shadow-lg transition-all hover:-translate-y-0.5 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-[#111318] dark:text-white mb-1">{job.title}</h4>
                                        <p className="text-[#636f88] dark:text-gray-400 text-sm mb-3">{job.description}</p>
                                        <div className="flex flex-wrap gap-3 text-xs text-[#636f88] dark:text-gray-500">
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{job.department}</span>
                                        </div>
                                    </div>
                                    <Link to="/company/contact">
                                        <button className="flex items-center justify-center gap-2 min-w-[140px] h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all px-5">
                                            Apply Now <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            ))}
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

export default Careers;
