import { describe, expect, it } from "vitest";

import { reconcileMessages } from "../src/features/chat/room/utils/reconcile-messages";
import type { Message } from "../src/features/chat/types";

const serverMessage = (id: string): Message => ({
  id,
  roomId: "room-1",
  text: id,
  status: "sent",
  mine: false,
});

describe("chat message reconciliation", () => {
  it("prefers the local temporary message without moving its server list slot", () => {
    const localTemporary: Message = {
      ...serverMessage("temp-1"),
      mine: true,
      status: "sending",
    };

    expect(
      reconcileMessages(
        [serverMessage("message-1"), serverMessage("temp-1"), serverMessage("message-2")],
        [localTemporary],
      ),
    ).toEqual([serverMessage("message-1"), localTemporary, serverMessage("message-2")]);
  });
});
