import { Redirect } from "expo-router";

/** Keep old /feed route working → main tab */
export default function FeedRedirect() {
  return <Redirect href="/(tabs)/feed" />;
}
