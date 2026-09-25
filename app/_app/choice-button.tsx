"use client";
import type { ReactNode } from "react";

/**
 * A submit button that carries a choice (e.g. approve / reject). vinext server actions
 * build FormData without the submitter, so the choice is mirrored into a hidden input
 * on click; the button keeps name/value for any runtime that does include it.
 */
export function ChoiceButton({ name, value, className, disabled, children }: { name: string; value: string; className: string; disabled?: boolean; children: ReactNode }) {
  return <button className={className} name={name} value={value} disabled={disabled} onClick={e => {
    const form = e.currentTarget.form;
    if (!form) return;
    let input = form.querySelector<HTMLInputElement>(`input[type="hidden"][data-choice="${name}"]`);
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.dataset.choice = name;
      form.insertBefore(input, form.firstChild);
    }
    input.value = value;
  }}>{children}</button>;
}
