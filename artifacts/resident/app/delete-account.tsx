import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import ScreenHeader from "@/components/ScreenHeader";

export default function DeleteAccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [confirmText, setConfirmText] = useState("");
  
  const expectedText = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  const topPad = Platform.OS === "web" ? 0 : insets.top;

  const handleDelete = () => {
    if (confirmText.trim().toLowerCase() !== expectedText.toLowerCase()) {
      Alert.alert("Error", `Please type "${expectedText}" to confirm.`);
      return;
    }
    Alert.alert(
      "Deletion Request Submitted",
      "You will receive a confirmation email. Access continues for 7 days, then your account will be deactivated.",
      [
        {
          text: "OK",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Delete Account" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24 }}
      >
        <View style={styles.dangerZone}>
          <View style={styles.dangerHeaderRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning" size={22} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dangerTitle}>Danger Zone</Text>
              <Text style={styles.dangerWarning}>Delete account & all data</Text>
            </View>
          </View>
          <Text style={styles.dangerDesc}>
            This action is irreversible. Your account, guest codes, maintenance history, and gate
            logs associated with your identity will be scheduled for deletion within 30 days.
          </Text>

          <View style={styles.confirmBox}>
            <Text style={[styles.confirmPrompt, { color: colors.foreground }]}>
              Type "{expectedText}" to confirm.
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="words"
              placeholder={expectedText}
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.deleteBtn,
              { opacity: pressed || confirmText.trim().toLowerCase() !== expectedText.toLowerCase() ? 0.6 : 1 },
            ]}
            onPress={handleDelete}
            disabled={confirmText.trim().toLowerCase() !== expectedText.toLowerCase()}
          >
            <Text style={styles.deleteBtnText}>Request Account Deletion</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  dangerZone: {
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#EF4444",
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#FEF2F2",
  },
  dangerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#EF4444",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  dangerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EF444420",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerWarning: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#991B1B",
  },
  dangerDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#7F1D1D",
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmBox: {
    marginBottom: 24,
  },
  confirmPrompt: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  deleteBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
