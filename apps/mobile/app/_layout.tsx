import { StatusBar } from "expo-status-bar";
import { AppProvider } from "../contexts/app-context";
import { LocaleProvider } from "../i18n";
import { AuthGate } from "../components/auth-gate";

export default function RootLayout() {
  return (
    <LocaleProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <AuthGate />
      </AppProvider>
    </LocaleProvider>
  );
}
