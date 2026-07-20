import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "../contexts/app-context";
import { LocaleProvider } from "../i18n";
import { colors } from "../constants/theme";

export default function RootLayout() {
  return (
    <LocaleProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.cream },
            animation: "slide_from_left",
          }}
        />
      </AppProvider>
    </LocaleProvider>
  );
}
