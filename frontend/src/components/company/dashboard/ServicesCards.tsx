import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Edit2 } from "lucide-react";

const services = [
    {
        title: "Wedding Photography",
        price: "₹80,000",
        desc: "Full day coverage with 2 candid photographers and 1 traditional photographer.",
        features: ["Unlimited Digital Photos", "Cinematic Video Highlight", "Hardcover Photo Album"],
        popular: true
    },
    {
        title: "Event Planning",
        price: "₹1,50,000",
        desc: "End-to-end wedding planning service including venue selection and vendor management.",
        features: ["Budget Management", "Vendor Coordination", "On-day Coordination"],
        popular: false
    },
    {
        title: "Pre-Wedding Shoot",
        price: "₹25,000",
        desc: "4-hour outdoor session at a location of your choice with 20 edited highlights.",
        features: ["Location Scouting", "Outfit Styling", "Digital Gallery"],
        popular: false
    },
];

export function ServicesCards() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Services & Pricing</h2>
                    <p className="text-slate-500">Customize your packages and offers.</p>
                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {services.map((service, index) => (
                    <Card key={index} className={`relative flex flex-col border-slate-100 shadow-sm ${service.popular ? 'border-rose-200 shadow-rose-100 ring-1 ring-rose-100' : ''}`}>
                        {service.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <Badge className="bg-gradient-to-r from-rose-500 to-purple-600 border-0">Most Popular</Badge>
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="flex items-baseline justify-between">
                                <span className="text-lg font-semibold">{service.title}</span>
                            </CardTitle>
                            <div className="mt-2">
                                <span className="text-3xl font-bold text-slate-900">{service.price}</span>
                                <span className="text-sm font-medium text-slate-500 ml-1">/Starting</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-slate-500 mb-6">{service.desc}</p>
                            <ul className="space-y-2">
                                {service.features.map((feature) => (
                                    <li key={feature} className="flex items-center text-sm text-slate-600">
                                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full border-slate-200 hover:border-rose-200 hover:text-rose-600">
                                <Edit2 className="h-4 w-4 mr-2" /> Edit Package
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
