import { appendFileSync } from "node:fs";
import { createServer } from "node:http";

const me = {
  id: "e2e-user",
  email: "e2e@example.com",
  phone: null,
  userName: "E2E",
  gender: "male",
  intro: "",
  birthDate: "1996-01-01",
  region: "서울",
  interestedGender: "female",
  profileCompleted: true,
  photos: [],
};

const dataFor = (query) => {
  const data = {};
  if (/\bme\b/.test(query)) data.me = me;
  if (query.includes("matchCandidates")) data.matchCandidates = [];
  if (query.includes("communityPosts")) data.communityPosts = [];
  if (query.includes("communityComments")) data.communityComments = [];
  if (query.includes("chatRooms")) data.chatRooms = [];
  if (query.includes("chatMessages")) data.chatMessages = [];
  if (query.includes("likedMeCandidates")) data.likedMeCandidates = [];
  if (query.includes("notifications")) data.notifications = [];
  if (query.includes("consumableBalance"))
    data.consumableBalance = { activeBoostUntil: null, boostCredits: 0, superLikeCredits: 0 };
  if (query.includes("currentSubscription")) data.currentSubscription = { planId: "free" };
  return data;
};

const server = createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(200).end("ok");
    return;
  }
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    if (req.url === "/trace") {
      appendFileSync("/tmp/webview-traces.jsonl", body + "\n");
      res.writeHead(200, { "content-type": "application/json" });
      res.end('{"accepted":true}');
      return;
    }
    let query = "";
    try {
      query = JSON.parse(body).query ?? "";
    } catch {}
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ data: dataFor(query) }));
  });
});

server.listen(4000, () => console.log("stub graphql+trace on :4000"));
