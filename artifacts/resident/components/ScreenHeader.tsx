import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenHeaderProps {
  title: string;
  /** Small all-caps line above the title (e.g. "RESIDENT · THANDI M.") */
  subtitle?: string;
  /** Show the avatar circle with initials on the left */
  showAvatar?: boolean;
  initials?: string;
  /** Show a back arrow instead of the avatar */
  showBack?: boolean;
  /** Small label above the title when showBack is true (e.g. "ESTATEHQ") */
  backLabel?: string;
  /** Override header background (default: #1565C0) */
  headerBg?: string;
}

export default function ScreenHeader({
  title,
  subtitle,
  showAvatar = false,
  initials = "?",
  showBack = false,
  backLabel,
  headerBg = "#1565C0",
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 0 : insets.top;

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: headerBg, paddingTop: topPad + 12 },
      ]}
    >
      <View style={styles.left}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
        )}

        {showAvatar && !showBack && (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}

        <View style={styles.titleBlock}>
          {(subtitle || backLabel) ? (
            <Text style={styles.subtitle}>{subtitle ?? backLabel}</Text>
          ) : null}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.push("/(tabs)/settings" as any)}
        hitSlop={12}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  titleBlock: { flex: 1 },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#FFFFFF",
    marginTop: 1,
  },
});
