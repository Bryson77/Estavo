import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

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
  /** Optional icon to show on the right */
  rightIcon?: string;
  /** Optional press handler for the right icon */
  onRightPress?: () => void;
}

export default function ScreenHeader({
  title,
  subtitle,
  showAvatar = false,
  initials = "?",
  showBack = false,
  backLabel,
  headerBg = "#1565C0",
  rightIcon = "settings-outline",
  onRightPress,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const topPad = Platform.OS === "web" ? 0 : insets.top;

  const handleRightPress = () => {
    if (onRightPress) onRightPress();
    else router.push("/settings" as any);
  };

  if (showBack) {
    return (
      <View style={[styles.backHeader, { paddingTop: topPad + 12, backgroundColor: headerBg, borderBottomWidth: 0 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtnWrapper}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          <Text style={[styles.backLabelText, { color: "#FFFFFF" }]}>Back</Text>
        </Pressable>
        <View style={styles.backTitleWrapper}>
          {backLabel ? <Text style={[styles.subtitle, { color: "rgba(255,255,255,0.75)", textAlign: "center" }]}>{backLabel}</Text> : null}
          <Text style={[styles.backTitleText, { color: "#FFFFFF" }]}>{title}</Text>
        </View>
        <View style={styles.rightPlaceholder}>
          {rightIcon ? (
            <Pressable onPress={handleRightPress} hitSlop={12} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, alignItems: "flex-end" })}>
              <Ionicons name={rightIcon as any} size={22} color="#FFFFFF" />
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: headerBg, paddingTop: topPad + 12 },
      ]}
    >
      <View style={styles.left}>
        {showAvatar && (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}

        <View style={styles.titleBlock}>
          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      {rightIcon ? (
        <Pressable
          onPress={handleRightPress}
          hitSlop={12}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Ionicons name={rightIcon as any} size={22} color="#FFFFFF" />
        </Pressable>
      ) : null}
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
  backHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtnWrapper: { flexDirection: "row", alignItems: "center", gap: 2, width: 70 },
  backLabelText: { fontSize: 16 },
  backTitleWrapper: { flex: 1, alignItems: "center" },
  backTitleText: { fontSize: 17, fontWeight: "600" },
  rightPlaceholder: { width: 70, alignItems: "flex-end" },
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
