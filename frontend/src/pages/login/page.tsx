import LoginForm from "@/components/login/LoginForm";
import { useLocation } from "react-router-dom";

const LoginPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const redirectFromQuery = searchParams.get("redirect");
  const stateRedirect = (location.state as { from?: { pathname: string } })?.from?.pathname;
  const redirectTo = redirectFromQuery || stateRedirect || "/couple";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#1b0d3c] to-[#030512] px-4 py-12 text-white">
      <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center gap-10 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)] backdrop-blur-3xl" />
        <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 translate-y-1/3 rounded-full bg-gradient-to-br from-[#ff70d2] to-[#7c3aed] opacity-70 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-60px] h-72 w-72 rounded-full bg-gradient-to-br from-[#f97316] to-[#9333ea] opacity-60 blur-[120px]" />

        <div className="relative z-10 w-full px-6 py-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm uppercase tracking-[0.6em] text-white/60">Wedding Web</p>
              <h1 className="text-4xl font-semibold text-white md:text-5xl">
                Log in to your builder dashboard
              </h1>
              <p className="max-w-2xl text-center text-sm text-white/70 md:text-base">
                Manage your gallery, upload music, customize the story, and publish the website that matches your love story.
              </p>
            </div>

            <LoginForm redirectTo={redirectTo} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

