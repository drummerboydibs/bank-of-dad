import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-6 text-center">
        <Link to="/" aria-label="Bank of Dad home">
          <img
            src={`${import.meta.env.BASE_URL}icon.svg`}
            alt="Bank of Dad"
            className="mx-auto h-14 w-14"
          />
        </Link>
        <h1 className="mt-3 text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      <div className="card">{children}</div>
    </main>
  );
}
