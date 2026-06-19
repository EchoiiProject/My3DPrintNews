function shortCommitHash(value?: string): string | null {
  if (!value) {
    return null;
  }

  return value.slice(0, 7);
}

export function BuildVersionBadge() {
  const commitHash = shortCommitHash(process.env.VERCEL_GIT_COMMIT_SHA);
  const commitMessage = process.env.VERCEL_GIT_COMMIT_MESSAGE;
  const label = commitHash ? `Build ${commitHash}` : "DEV BUILD LOCAL";

  return (
    <div className="flex justify-center">
      <span
        className="inline-flex rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 shadow-sm shadow-blue-950/5 backdrop-blur"
        title={commitMessage ? `Commit: ${commitMessage}` : undefined}
      >
        {label}
      </span>
    </div>
  );
}
