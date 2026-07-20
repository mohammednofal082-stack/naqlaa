import { Redirect } from "expo-router";
import { useApp } from "../contexts/app-context";

export default function Index() {
  const { user } = useApp();
  if (!user) return <Redirect href="/auth/login" />;
  return <Redirect href="/(tabs)" />;
}
