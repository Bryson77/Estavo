import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { apiClient } from "@/lib/api";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.requestOtp(trimmed);
      router.push({ pathname: "/(auth)/verify", params: { email: trimmed } });
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.safeTop, { paddingTop: insets.top, backgroundColor: colors.primary }]} />

      <View style={styles.logoSection}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={[styles.logoSub, { color: colors.mutedForeground }]}>Resident App</Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Enter your email address to receive a one-time sign-in code
        </Text>

        <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="you@example.com"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={handleContinue}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>Send code</Text>
          )}
        </Pressable>

        <Text style={[styles.footer, { color: colors.mutedForeground }]}>
          Don't have an account? Contact your estate manager to get added.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeTop: { width: "100%" },
  logoSection: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 8,
  },
  logoImage: {
    width: 180,
    height: 100,
  },
  logoSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 28,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  btnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  footer: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
