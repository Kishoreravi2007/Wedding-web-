import { Button } from "@/components/ui/button";
import LoginForm from "@/components/login/LoginForm";
import { Link } from "react-router-dom";

const CompanyLogin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-6 sm:px-10">
          <Link
            to="/"
            className="text-lg font-semibold tracking-wide text-slate-700 transition hover:text-rose-500"
          >
            Back to Home
          </Link>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-10 rounded-3xl bg-white p-8 shadow-xl border border-slate-200 md:grid-cols-[1.2fr_1fr]">
            <section className="space-y-6 text-left">
              <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Company portal</p>
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                Securely manage events, upload media, and update your guests.
              </h1>
              <p className="text-lg text-slate-600">
                Use your WeddingWeb account to access the client dashboard, refresh your gallery,
                and keep the celebration timeline in sync.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/company/contact">
                  <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                    Need an invite?
                  </Button>
                </Link>
              </div>
            </section>

            <section className="space-y-4">
              <LoginForm redirectTo="/company" />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyLogin;

