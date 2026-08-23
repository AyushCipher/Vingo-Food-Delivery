import { describe, it, expect, vi, beforeEach } from "vitest";

// Chat history endpoints used to have no ownership check at all — anyone who
// learned/guessed a sessionId could read or delete another logged-in user's
// conversation. These tests lock in the fix: a session tied to a real userId
// can only be touched by that same user; anonymous sessions (userId null)
// stay reachable by sessionId, matching the pre-login chat flow.

const { ChatMessageMock, ChatMessageCtor } = vi.hoisted(() => {
  const ChatMessageMock = { findOne: vi.fn(), deleteOne: vi.fn(), find: vi.fn() };
  function ChatMessageCtor(data) {
    Object.assign(this, data);
    this.save = () => Promise.resolve(this);
  }
  ChatMessageCtor.findOne = ChatMessageMock.findOne;
  ChatMessageCtor.deleteOne = ChatMessageMock.deleteOne;
  ChatMessageCtor.find = ChatMessageMock.find;
  return { ChatMessageMock, ChatMessageCtor };
});

vi.mock("../models/chat.model.js", () => ({ default: ChatMessageCtor }));

vi.mock("../config/knowledgeBase.js", () => ({
  findRuleBasedResponse: vi.fn().mockReturnValue({ response: "rule based reply", source: "rule-based", category: "test" }),
  generateFallbackResponse: vi.fn().mockReturnValue({ response: "fallback", source: "fallback" }),
}));

const { getChatHistory, clearChatHistory, sendMessage } = await import("../controllers/chat.controller.js");

const makeRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("getChatHistory ownership", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 403 when the session belongs to a different logged-in user", async () => {
    ChatMessageMock.findOne.mockResolvedValueOnce({ userId: "owner_1", messages: [] });
    const req = { params: { sessionId: "s1" }, userId: "someone_else" };
    const res = makeRes();

    await getChatHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("allows the owning user to read their own session", async () => {
    ChatMessageMock.findOne.mockResolvedValueOnce({ userId: "owner_1", messages: [], lastInteraction: new Date() });
    const req = { params: { sessionId: "s1" }, userId: "owner_1" };
    const res = makeRes();

    await getChatHistory(req, res);

    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("allows anonymous (unauthenticated) access to an anonymous session", async () => {
    ChatMessageMock.findOne.mockResolvedValueOnce({ userId: null, messages: [], lastInteraction: new Date() });
    const req = { params: { sessionId: "s1" }, userId: undefined };
    const res = makeRes();

    await getChatHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("clearChatHistory ownership", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 403 and does not delete when the session belongs to someone else", async () => {
    ChatMessageMock.findOne.mockResolvedValueOnce({ userId: "owner_1" });
    const req = { params: { sessionId: "s1" }, userId: "someone_else" };
    const res = makeRes();

    await clearChatHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(ChatMessageMock.deleteOne).not.toHaveBeenCalled();
  });
});

describe("sendMessage ownership + identity trust", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects appending to a session owned by a different user", async () => {
    ChatMessageMock.findOne.mockResolvedValueOnce({ userId: "owner_1" });
    const req = {
      body: { sessionId: "s1", userMessage: "hi" },
      userId: "someone_else",
    };
    const res = makeRes();

    await sendMessage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("ties a new session to req.userId from the verified cookie, ignoring any client-supplied userId", async () => {
    ChatMessageMock.findOne.mockResolvedValueOnce(null);
    const req = {
      body: { sessionId: "s1", userMessage: "hi", userId: "spoofed_user_id" },
      userId: "real_verified_user",
      headers: {},
      ip: "127.0.0.1",
    };
    const res = makeRes();

    await sendMessage(req, res);

    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
