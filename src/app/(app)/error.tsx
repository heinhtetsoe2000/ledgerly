"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApplicationError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section aria-labelledby="application-error-title" className="application-error" role="alert">
      <p className="eyebrow">TEMPORARY ISSUE</p>
      <h1 id="application-error-title">This page could not load</h1>
      <p>Try again. Your saved financial information has not been changed.</p>
      <Button onClick={reset}>
        <RotateCw aria-hidden="true" size={16} />
        Try again
      </Button>
    </section>
  );
}