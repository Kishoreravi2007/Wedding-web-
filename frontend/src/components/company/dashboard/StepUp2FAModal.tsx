import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StepUp2FAModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function StepUp2FAModal({ open, onOpenChange, onSuccess }: StepUp2FAModalProps) {
    const { verifyStepUp2FA } = useAuth();
    const [otpValue, setOtpValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otpValue.length !== 6) return;

        setError(null);
        setIsSubmitting(true);

        try {
            await verifyStepUp2FA(otpValue);
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            setError(err?.message || "Verification failed. Please check your code.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader className="space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-2">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-serif">Security Verification</DialogTitle>
                    <DialogDescription className="text-center">
                        To enter the Premium Builder, please enter the 6-digit code from your authenticator app.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={6}
                            onChange={(v) => setOtpValue(v)}
                            value={otpValue}
                            autoFocus
                        >
                            <InputOTPGroup className="gap-2">
                                {[0, 1, 2, 3, 4, 5].map((idx) => (
                                    <InputOTPSlot
                                        key={idx}
                                        index={idx}
                                        className="rounded-md border-slate-200 bg-slate-50 w-10 h-12 text-lg font-medium focus:border-rose-500 focus:ring-rose-500"
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium h-12 rounded-lg transition-all"
                        disabled={isSubmitting || otpValue.length !== 6}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                            </div>
                        ) : "Confirm & Enter"}
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="w-full text-slate-500 hover:text-slate-800"
                    >
                        Cancel
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
