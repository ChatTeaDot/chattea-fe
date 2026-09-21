import { useSuspenseQuery } from "@tanstack/react-query";

import { communityTitleQuery } from "../api";

import { heading } from "./community-page.css";

const CommunityTitle = () => {
  const { data: title } = useSuspenseQuery(communityTitleQuery());

  return <h1 className={heading}>{title}</h1>;
};

export default CommunityTitle;
