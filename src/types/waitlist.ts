import type { Queue } from ".";

export type WaitlistQueue = Pick<Queue, "queue_id" | "queue_number"> & {
  status: Queue["status"] | number;
};

export type WaitlistSnapshotMessage = {
  type: "snapshot";
  data: WaitlistQueue[];
};

export type WaitlistMutationMessage = {
  type: "mutation";
  data: {
    eventType: "INSERT" | "UPDATE" | "DELETE";
    new: WaitlistQueue | null;
    old: WaitlistQueue | null;
  };
};

export type WaitlistStreamMessage = WaitlistSnapshotMessage | WaitlistMutationMessage;
