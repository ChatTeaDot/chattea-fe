import { useQuery } from "@tanstack/react-query";

import { communityTitleQuery } from "../api";

import { heading } from "./community-page.css";

const CommunityPage = () => {
  const { data: title } = useQuery(communityTitleQuery());

  return (
    <main>
      <h1 className={heading}>{title}</h1>
    </main>
  );
};

export default CommunityPage;
