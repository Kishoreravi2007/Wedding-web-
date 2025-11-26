import { Button } from "@/components/ui/button";
import LoginForm from "@/components/login/LoginForm";
import { Link } from "react-router-dom";

const CompanyLogin = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/60 to-slate-950" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-60 bg-gradient-to-b from-rose-500/40 via-purple-500/20 to-transparent blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-6 sm:px-10">
          <Link
            to="/company"
            className="text-lg font-semibold tracking-wide text-white transition hover:text-rose-300"
          >
            Back to Company
          </Link>
          <Link to="/company/account">
            <Button size="sm" variant="ghost" className="border border-white/20 text-white">
              Go to Account
            </Button>
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 rounded-3xl bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:grid-cols-[1.2fr_1fr]">
            <section className="space-y-6 text-left text-white">
              <p className="text-sm uppercase tracking-[0.5em] text-white/60">Company portal</p>
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                Securely manage events, upload media, and update your guests.
              </h1>
              <p className="text-lg text-white/70">
                Use your WeddingWeb account to access the client dashboard, refresh your gallery,
                and keep the celebration timeline in sync.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/company/account">
                  <Button className="bg-gradient-to-r from-rose-500 to-purple-600 text-white">
                    View Account
                  </Button>
                </Link>
                <Link to="/company/contact">
                  <Button variant="ghost" className="border border-white/30 text-white">
                    Need an invite?
                  </Button>
                </Link>
              </div>
            </section>

            <section className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.4em] text-white/60">
                Client login
              </p>
              <LoginForm redirectTo="/company" />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyLogin;

