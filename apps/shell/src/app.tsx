import CommunityRoute from "./community-route";
import { COMMUNITY_PATH } from "./constants";

const App = () => {
  if (window.location.pathname.startsWith(COMMUNITY_PATH)) {
    return <CommunityRoute />;
  }
  return (
    <main>
      <h1>ChatTea</h1>
      <a href={COMMUNITY_PATH}>커뮤니티</a>
    </main>
  );
};

export default App;
