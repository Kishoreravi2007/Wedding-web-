import { Link } from "react-router-dom";
import { WeddingWebHeader } from "@/components/WeddingWebHeader";
import { ArrowRight, Calendar, Clock } from "lucide-react";

const blogPosts = [
    {
        title: "How AI Face Detection is Revolutionizing Wedding Photography",
        excerpt: "Discover how our advanced facial recognition technology helps guests find their photos instantly among thousands of images captured during wedding events.",
        date: "Feb 15, 2026",
        readTime: "5 min read",
        category: "Technology",
        gradient: "from-rose-500 to-purple-600",
        image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=800&auto=format&fit=crop",
    },
    {
        title: "5 Tips for Building the Perfect Wedding Website",
        excerpt: "From choosing the right theme to crafting your love story section, here's everything you need to create a stunning digital presence for your big day.",
        date: "Feb 10, 2026",
        readTime: "4 min read",
        category: "Tips & Tricks",
        gradient: "from-blue-500 to-cyan-500",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
    },
    {
        title: "The Future of Live Streaming Weddings in 4K",
        excerpt: "Learn how real-time streaming technology is making it possible for loved ones across the globe to experience every moment of your celebration.",
        date: "Feb 5, 2026",
        readTime: "6 min read",
        category: "Innovation",
        gradient: "from-purple-500 to-indigo-600",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop",
    },
    {
        title: "Why Every Photographer Needs a Dedicated Upload Portal",
        excerpt: "Professional photographers share why a streamlined upload workflow with automated organization makes all the difference at high-volume weddings.",
        date: "Jan 28, 2026",
        readTime: "3 min read",
        category: "For Photographers",
        gradient: "from-green-500 to-emerald-600",
        image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=800&auto=format&fit=crop",
    },
    {
        title: "Kerala Wedding Traditions Meet Modern Technology",
        excerpt: "How couples in Kerala are blending traditional ceremonies with cutting-edge digital experiences to create unforgettable celebrations.",
        date: "Jan 20, 2026",
        readTime: "7 min read",
        category: "Culture",
        gradient: "from-orange-500 to-red-500",
        image: "https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?q=80&w=800&auto=format&fit=crop",
    },
    {
        title: "Smart Photo Galleries: Auto-Organize Your Wedding Memories",
        excerpt: "Our AI-powered gallery system automatically sorts photos by event stage, location, and people — so you never have to manually organize again.",
        date: "Jan 12, 2026",
        readTime: "4 min read",
        category: "Product Update",
        gradient: "from-pink-500 to-rose-600",
        image: "https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=800&auto=format&fit=crop",
    },
];

const Blog = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111318] min-h-screen flex flex-col">
            <WeddingWebHeader />

            <main className="w-full flex-grow">
                {/* Hero */}
                <section className="w-full px-6 md:px-20 lg:px-40 py-16 md:py-24">
                    <div className="max-w-[1200px] mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                            Our Blog
                        </div>
                        <h1 className="text-[#111318] dark:text-white text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
                            Insights & <span className="text-primary">Stories</span>
                        </h1>
                        <p className="text-[#636f88] dark:text-gray-400 text-lg md:text-xl max-w-[600px] mx-auto">
                            Explore the latest in wedding technology, tips for your big day, and stories from real couples.
                        </p>
                    </div>
                </section>

                {/* Blog Grid */}
                <section className="px-6 md:px-20 lg:px-40 pb-24">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogPosts.map((post, index) => (
                                <div key={index} className="group cursor-pointer">
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-[#f0f2f4] dark:border-gray-800 h-full flex flex-col">
                                        <div className="h-48 relative overflow-hidden">
                                            <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className={`absolute inset-0 bg-gradient-to-t ${post.gradient} opacity-30`}></div>
                                            <span className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                                                {post.category}
                                            </span>
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex items-center gap-4 text-xs text-[#636f88] dark:text-gray-400 mb-3">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-[#636f88] dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                                            <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                                Read More <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
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

export default Blog;
