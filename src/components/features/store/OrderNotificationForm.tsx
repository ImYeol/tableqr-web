"use client";

import { useMemo, useState } from "react";

import { buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type OrderNotificationFormProps = {
  onSubscribed?: (contact: string) => void;
};

export const OrderNotificationForm = ({ onSubscribed }: OrderNotificationFormProps) => {
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "subscribed">("idle");

  const statusLabel = useMemo(() => (status === "subscribed" ? "알림 활성화" : "알림 미등록"), [status]);
  const statusClassName = useMemo(
    () => (status === "subscribed" ? "bg-success/15 text-success" : "bg-surface-muted text-muted-foreground"),
    [status],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = contact.trim();

    if (!trimmed) {
      return;
    }

    setStatus("subscribed");
    onSubscribed?.(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-[var(--radius-lg)] bg-surface px-5 py-6 shadow-[0_24px_56px_-38px_rgba(31,27,22,0.3)]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">푸시 알림</p>
        <span
          className={`inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 text-xs font-semibold ${statusClassName}`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          id="order-notification-contact"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="전화번호 또는 이메일"
          aria-describedby="order-notification-helper"
        />
        <button
          type="submit"
          className={buttonClassName({
            variant: "primary",
            size: "sm",
            className: "shrink-0 rounded-[var(--radius-pill)] px-4",
          })}
        >
          저장
        </button>
      </div>
      <p id="order-notification-helper" className="text-xs text-muted-foreground">
        알림을 허용하면 주문 완료 시 푸시로 알려드려요.
      </p>
    </form>
  );
};
