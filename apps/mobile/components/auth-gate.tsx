import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useApp } from "../contexts/app-context";
import { colors } from "../constants/theme";

export function AuthGate() {
  const { user, loading } = useApp();
  const router = useRouter();
  const segments = useSegments();
  const inAuthGroup = segments[0] === "auth";

  useEffect(() => {
    if (loading) return;
    if (!user && !inAuthGroup) {
      router.replace("/auth/login");
      return;
    }
    if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, loading, inAuthGroup, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream }}>
        <ActivityIndicator color={colors.blue} />
      </View>
    );
  }

  if (!user && !inAuthGroup) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.cream },
        animation: "slide_from_left",
      }}
    />
  );
}
