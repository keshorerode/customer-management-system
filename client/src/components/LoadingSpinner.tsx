"use client";

export default function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-6">
      <div className="relative">
        <span className="loader block"></span>
      </div>
      <p className="text-text-secondary text-sm animate-pulse tracking-wide font-medium">
        {message}
      </p>
    </div>
  );
}
