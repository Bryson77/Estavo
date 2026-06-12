import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import ScreenHeader from "@/components/ScreenHeader";

function SettingRow({
  icon,
  label,
  value,
  onPress,
  destructive,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        { borderBottomColor: colors.border, opacity: pressed ? 0.75 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: destructive ? "#EF444420" : colors.secondary }]}>
        <Ionicons name={icon as any} size={18} color={destructive ? "#EF4444" : colors.primary} />
      </View>
      <Text style={[styles.settingLabel, { color: destructive ? "#EF4444" : colors.foreground }]}>
        {label}
      </Text>
      {value ? (
        <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{value}</Text>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const topPad = Platform.OS === "web" ? 0 : insets.top;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Settings" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24 }}
      >
        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.profileAvatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>
          </View>
          <View style={[styles.accountBadge, { backgroundColor: user?.accountStanding === "good" ? "#10B98120" : "#EF444420" }]}>
            <Text style={[styles.accountBadgeText, { color: user?.accountStanding === "good" ? "#10B981" : "#EF4444" }]}>
              {user?.accountStanding === "good" ? "Good Standing" : "Arrears"}
            </Text>
          </View>
        </View>

        {/* Unit info */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>RESIDENCE</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="home-outline" label="Unit" value={user?.unitNumber ?? "-"} />
          <SettingRow icon="business-outline" label="Estate" value={user?.estateName ?? "-"} />
          <SettingRow icon="location-outline" label="Address" value={user?.estateAddress ?? "-"} />
        </View>

        {/* Account */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="call-outline" label="Phone" value={user?.phone ?? "Not set"} />
          <SettingRow icon="notifications-outline" label="Push Notifications" onPress={() => Alert.alert("Notifications", "Notification settings coming soon.")} />
          <SettingRow icon="moon-outline" label="Dark Mode" onPress={() => Alert.alert("Theme", "Theme toggle coming soon.")} />
        </View>

        {/* Support */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SUPPORT</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="help-circle-outline" label="Help & FAQ" onPress={() => Alert.alert("Help", "Support portal coming soon.")} />
          <SettingRow icon="document-text-outline" label="Privacy Policy" onPress={() => Alert.alert("Privacy Policy", "Coming soon.")} />
          <SettingRow icon="document-text-outline" label="Terms of Service" onPress={() => Alert.alert("Terms of Service", "Coming soon.")} />
          <SettingRow icon="trash-outline" label="Request Data Deletion" onPress={() => router.push("/delete-account" as any)} destructive />
        </View>

        {/* Sign out */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 8 }]}>
          <SettingRow icon="log-out-outline" label="Sign Out" onPress={handleLogout} destructive />
        </View>

        <Text style={[styles.version, { color: colors.mutedForeground }]}>
          EstateHQ Resident v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  profileAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#FFFFFF" },
  profileName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  profileEmail: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  accountBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  accountBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  sectionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 1,
    marginHorizontal: 16,
    marginBottom: 6,
    marginTop: 12,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontFamily: "Inter_500Medium", fontSize: 14, flex: 1 },
  settingValue: { fontFamily: "Inter_400Regular", fontSize: 13 },
  version: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center", marginTop: 24 },
});
