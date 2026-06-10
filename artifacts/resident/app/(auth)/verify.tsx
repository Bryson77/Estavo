import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function VerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { login } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    const code = otp.trim();
    if (code.length !== 6) {
      Alert.alert("Invalid code", "Please enter the 6-digit code sent to your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.verifyOtp(email, code);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await login(res.token, res.user);
      router.replace("/(tabs)");
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Invalid code", err.message ?? "Please check your code and try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await apiClient.requestOtp(email);
      Alert.alert("Code sent", `A new code has been sent to ${email}`);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.primary }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.headerTextRow}>
          <Text style={styles.headerLabel}>ESTATEHQ</Text>
          <Text style={styles.headerTitle}>Enter your code</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>
          We sent a 6-digit code to{"\n"}
          <Text style={[styles.emailBold, { color: colors.foreground }]}>{email}</Text>
        </Text>

        {__DEV__ && (
          <View style={[styles.devBanner, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Ionicons name="code-slash-outline" size={14} color={colors.primary} />
            <Text style={[styles.devText, { color: colors.primary }]}>
              Dev mode: use <Text style={{ fontFamily: "Inter_700Bold" }}>123456</Text>
            </Text>
          </View>
        )}

        <Pressable
          style={[styles.otpBox, { borderColor: otp.length > 0 ? colors.primary : colors.border, backgroundColor: colors.card }]}
          onPress={() => inputRef.current?.focus()}
        >
          <Text style={[styles.otpText, { color: otp ? colors.foreground : colors.mutedForeground, letterSpacing: otp ? 12 : 0 }]}>
            {otp || "••••••"}
          </Text>
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={v => setOtp(v.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.hiddenInput}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleVerify}
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: colors.primary, opacity: pressed || loading || otp.length < 6 ? 0.7 : 1 },
          ]}
          onPress={handleVerify}
          disabled={loading || otp.length < 6}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>Verify & sign in</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.resendBtn, { opacity: pressed || resending ? 0.5 : 1 }]}
          onPress={handleResend}
          disabled={resending}
        >
          {resending ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={[styles.resendText, { color: colors.primary }]}>Resend code</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  backText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#FFFFFF",
  },
  headerTextRow: {},
  headerLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  emailBold: {
    fontFamily: "Inter_600SemiBold",
  },
  devBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  devText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  otpBox: {
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
  },
  otpText: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 16,
  },
  btnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  resendBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  resendText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});
