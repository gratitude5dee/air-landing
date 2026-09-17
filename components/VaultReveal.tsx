"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import styles from "./VaultReveal.module.css";

type RevealStyle = CSSProperties & { "--vault-delay": string };

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section";
};

export function VaultReveal({ children, className = "", delay = 0, as = "div" }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setReady(true);
    const node = rootRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Component = as;
  const style: RevealStyle = { "--vault-delay": `${delay}ms` };

  return (
    <Component
      ref={rootRef as never}
      className={`${styles.reveal} ${className}`}
      data-ready={ready ? "true" : "false"}
      data-visible={visible ? "true" : "false"}
      style={style}
    >
      {children}
    </Component>
  );
}
