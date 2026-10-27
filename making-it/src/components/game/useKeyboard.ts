import { useEffect } from "react";
import { interact, keys, openGoMenu } from "../../engine/input";
import { pushModal, store, type Tab } from "../../store/gameStore";

const TAB_KEYS: Tab[] = ["do", "go", "stuff", "log"];

// arrow keys / A D to walk, E to use, G to travel, M mood tracker, 1-4 tabs
export function useKeyboard() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea")) return;
      if (store.getState().modals.length) return; // the modal handles its own keys
      const k = e.key.toLowerCase();
      const onButton = !!target?.closest("button");
      if (k === "arrowleft" || k === "a") {
        keys.left = true;
        e.preventDefault();
      } else if (k === "arrowright" || k === "d") {
        keys.right = true;
        e.preventDefault();
      } else if (k === "e" || ((k === " " || k === "enter") && !onButton)) {
        e.preventDefault();
        if (!e.repeat) interact();
      } else if (k === "g") {
        e.preventDefault();
        openGoMenu();
      } else if (k === "m") {
        e.preventDefault();
        pushModal({ kind: "mood" });
      } else if (k >= "1" && k <= "4") {
        store.setState({ tab: TAB_KEYS[Number(k) - 1] });
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") keys.left = false;
      if (k === "arrowright" || k === "d") keys.right = false;
    };
    const blur = () => {
      keys.left = keys.right = false;
      keys.touch = 0;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
}
