import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useApp } from "../contexts/app-context";
import { colors } from "../constants/theme";

export default function Index() {
  const { user, loading } = useApp();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream }}>
        <ActivityIndicator color={colors.blue} />
      </View>
    );
  }
  if (!user) return <Redirect href="/auth/login" />;
  return <Redirect href="/(tabs)" />;
}
