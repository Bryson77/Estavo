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
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  const handleMagicLink = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    setMagicLoading(true);
    try {
      await apiClient.requestOtp(trimmed);
      Alert.alert(
        "Check your inbox",
        "We've sent a magic link to your email. Click it to log in securely."
      );
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to send magic link.");
    } finally {
      setMagicLoading(false);
    }
  };

  const handleLogin = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Invalid password", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient.login(trimmed, password);
      setTimeout(() => {
        authLogin(data.token, data.user);
      }, 100);
    } catch (err: any) {
      Alert.alert("Login Failed", err.message ?? "Invalid email or password.");
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
          Enter your email to get started
        </Text>

        <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 24 }]}>
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
            returnKeyType="next"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: colors.primary, opacity: pressed || loading || magicLoading ? 0.85 : 1 },
          ]}
          onPress={handleMagicLink}
          disabled={loading || magicLoading}
        >
          {magicLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>Send Magic Link</Text>
          )}
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>OR</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <View style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.card, marginBottom: 8 }]}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Password"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
        </View>

        <Pressable
          style={styles.forgotBtn}
          onPress={() => router.push("/(auth)/setup-password")}
        >
          <Text style={[styles.forgotText, { color: colors.primary }]}>
            Forgot password?
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed || loading || magicLoading ? 0.85 : 1 },
          ]}
          onPress={handleLogin}
          disabled={loading || magicLoading}
        >
          {loading ? (
            <ActivityIndicator color={colors.foreground} />
          ) : (
            <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>Login with password</Text>
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
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgotText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  secondaryBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  footer: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginTop: "auto",
    paddingBottom: 20,
  },
});
