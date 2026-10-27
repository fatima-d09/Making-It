import clsx from "clsx";
import { useEffect, useRef, type ReactNode } from "react";
import { closeModal } from "../../store/gameStore";

export interface ModalButton {
  label: string;
  primary?: boolean;
  onClick?: () => void; // runs before the modal closes
  keepOpen?: boolean;
}

interface Props {
  title: string;
  children: ReactNode;
  buttons?: ModalButton[];
  wide?: boolean;
  dismissable?: boolean; // Escape closes it
}

export default function Modal({ title, children, buttons = [{ label: "Okay", primary: true }], wide, dismissable }: Props) {
  const firstButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstButton.current?.focus();
    if (!dismissable) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismissable]);

  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-black/60 p-4">
      <div role="dialog" aria-modal="true" aria-label={title} className={clsx("flex max-h-[90vh] w-full flex-col gap-3.5 overflow-y-auto border-4 bg-panel p-[18px] shadow-[0_6px_0_rgba(0,0,0,0.5)] [border-color:var(--color-hi)_var(--color-lo)_var(--color-lo)_var(--color-hi)]", wide ? "max-w-[720px]" : "max-w-[480px]")}>
        <h2 className="m-0 font-display text-2xl font-bold">{title}</h2>
        {children}
        <div className="flex flex-wrap justify-end gap-2">
          {buttons.map((b, i) => (
            <button
              key={b.label}
              ref={i === 0 ? firstButton : undefined}
              className={clsx("btn", b.primary && "btn-go")}
              onClick={() => {
                b.onClick?.();
                if (!b.keepOpen) closeModal();
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
