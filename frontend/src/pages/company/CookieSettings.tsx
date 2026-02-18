import { useState } from "react";
import { WeddingWebHeader } from "@/components/WeddingWebHeader";
import { Cookie, Shield, BarChart3, Target, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CookieSettings = () => {
    const { toast } = useToast();
    const [cookies, setCookies] = useState({
        essential: true,
        analytics: true,
        marketing: false,
        preferences: true,
    });

    const handleSave = () => {
        localStorage.setItem("cookie-preferences", JSON.stringify(cookies));
        toast({ title: "Preferences Saved", description: "Your cookie preferences have been updated." });
    };

    const cookieTypes = [
        {
            key: "essential" as const,
            icon: <Shield className="w-6 h-6" />,
            title: "Essential Cookies",
            description: "These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions you take, such as logging in, setting privacy preferences, or filling in forms.",
            required: true,
        },
        {
            key: "analytics" as const,
            icon: <BarChart3 className="w-6 h-6" />,
            title: "Analytics Cookies",
            description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the site experience for everyone.",
            required: false,
        },
        {
            key: "marketing" as const,
            icon: <Target className="w-6 h-6" />,
            title: "Marketing Cookies",
            description: "These cookies may be set through our site by advertising partners. They may be used to build a profile of your interests and show you relevant adverts on other sites.",
            required: false,
        },
        {
            key: "preferences" as const,
            icon: <Cookie className="w-6 h-6" />,
            title: "Preference Cookies",
            description: "These cookies enable the website to provide enhanced functionality and personalisation, such as remembering your language preference or region.",
            required: false,
        },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111318] min-h-screen flex flex-col">
            <WeddingWebHeader />

            <main className="w-full flex-grow">
                {/* Hero */}
                <section className="w-full px-6 md:px-20 lg:px-40 py-16 md:py-24">
                    <div className="max-w-[1200px] mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                            <Cookie className="w-4 h-4" /> Cookie Preferences
                        </div>
                        <h1 className="text-[#111318] dark:text-white text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-6">
                            Cookie <span className="text-primary">Settings</span>
                        </h1>
                        <p className="text-[#636f88] dark:text-gray-400 text-lg max-w-[600px] mx-auto">
                            We use cookies to enhance your browsing experience. You can manage your preferences below. Essential cookies cannot be disabled.
                        </p>
                    </div>
                </section>

                {/* Cookie Toggles */}
                <section className="px-6 md:px-20 lg:px-40 pb-20">
                    <div className="max-w-[700px] mx-auto space-y-4">
                        {cookieTypes.map((type) => (
                            <div key={type.key} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-[#f0f2f4] dark:border-gray-800 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                        {type.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-lg font-bold text-[#111318] dark:text-white">{type.title}</h4>
                                            {type.required ? (
                                                <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">Always Active</span>
                                            ) : (
                                                <button
                                                    onClick={() => setCookies({ ...cookies, [type.key]: !cookies[type.key] })}
                                                    className={`relative w-12 h-7 rounded-full transition-colors ${cookies[type.key] ? 'bg-primary' : 'bg-[#dce1e8] dark:bg-gray-700'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${cookies[type.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[#636f88] dark:text-gray-400 text-sm leading-relaxed">{type.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-center gap-4 pt-8">
                            <button
                                onClick={() => { setCookies({ essential: true, analytics: true, marketing: true, preferences: true }); handleSave(); }}
                                className="flex items-center justify-center gap-2 min-w-[140px] h-12 rounded-xl border-2 border-[#dce1e8] dark:border-gray-700 text-[#111318] dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all px-5"
                            >
                                Accept All
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center justify-center gap-2 min-w-[180px] h-12 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all px-5"
                            >
                                <Check className="w-5 h-5" /> Save Preferences
                            </button>
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

export default CookieSettings;
