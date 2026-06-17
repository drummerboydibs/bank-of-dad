import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FullPageSpinner } from "../components/ui";

export default function Landing() {
  const { loading, session, member } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (session && member) return <Navigate to="/app" replace />;
  if (session && !member) return <Navigate to="/setup" replace />;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="text-center">
        <img
          src={`${import.meta.env.BASE_URL}icon.svg`}
          alt="Bank of Dad"
          className="mx-auto h-20 w-20"
        />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Bank of Dad</h1>
        <p className="mt-2 text-slate-600">
          A simple family bank. Track your kids' savings, allowance, and gift-card balances — with a
          tidy, date-stamped ledger.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <Link to="/signup" className="btn btn-primary w-full">
          Create a parent account
        </Link>
        <Link to="/login" className="btn btn-secondary w-full">
          Log in
        </Link>
      </div>

      <ul className="mt-8 space-y-2 text-sm text-slate-600">
        <li>
          <span aria-hidden="true">💰</span> Multiple accounts per kid (Savings, Amazon, …)
        </li>
        <li>
          <span aria-hidden="true">🧾</span> Every deposit &amp; withdrawal logged with a note
        </li>
        <li>
          <span aria-hidden="true">👀</span> Kids can log in to see their own balances
        </li>
      </ul>
    </main>
  );
}
