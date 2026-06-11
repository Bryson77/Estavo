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

export default function DeleteAccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout } = useAuth();

  const [confirmText, setConfirmText] = useState("");

  const topPad = Platform.OS === "web" ? 0 : insets.top;

  const handleDelete = () => {
    if (confirmText !== "DELETE") {
      Alert.alert("Error", "Please type DELETE to confirm.");
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
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Delete Account</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24 }}
      >
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>────────────── DANGER ZONE ──────────────</Text>
          <View style={styles.dangerHeaderRow}>
            <Ionicons name="warning" size={24} color="#EF4444" />
            <Text style={styles.dangerWarning}>Delete account and all associated data</Text>
          </View>
          <Text style={styles.dangerDesc}>
            This action is irreversible. Your account, guest codes, maintenance history, and gate
            logs associated with your identity will be scheduled for deletion within 30 days.
          </Text>

          <View style={styles.confirmBox}>
            <Text style={[styles.confirmPrompt, { color: colors.foreground }]}>
              Type "DELETE" to confirm.
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="characters"
              placeholder="DELETE"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.deleteBtn,
              { opacity: pressed || confirmText !== "DELETE" ? 0.6 : 1 },
            ]}
            onPress={handleDelete}
            disabled={confirmText !== "DELETE"}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  backBtn: {},
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFFFFF" },
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
    fontSize: 12,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 1,
  },
  dangerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  dangerWarning: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#EF4444",
    flex: 1,
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
