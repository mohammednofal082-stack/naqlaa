import { Text, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../constants/theme";
import { useI18n } from "../i18n";

export function LanguageSwitch({ style }: { style?: ViewStyle }) {
  const { locale, toggleLocale } = useI18n();
  const target = locale === "ar" ? "English" : "العربية";

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={toggleLocale}
      activeOpacity={0.85}
      accessibilityLabel={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Ionicons name="language" size={16} color={colors.blue} />
      <Text style={styles.label}>{target}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.blue,
  },
});
