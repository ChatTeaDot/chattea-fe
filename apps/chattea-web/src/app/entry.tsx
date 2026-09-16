import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { CommunityPage } from "@/pages/community";

const root = document.getElementById("root");

if (!root) {
  throw new Error("ROOT_ELEMENT_MISSING");
}

createRoot(root).render(
  <StrictMode>
    <CommunityPage />
  </StrictMode>,
);
