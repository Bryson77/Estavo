import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

export default function NewGuestScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addGuestCode, guestStats } = useApp();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isParcel, setIsParcel] = useState(false);
  const [durationHours, setDurationHours] = useState(24);
  const [loading, setLoading] = useState(false);

  const durations = [
    { label: "1h", hours: 1 },
    { label: "6h", hours: 6 },
    { label: "24h", hours: 24 },
    { label: "48h", hours: 48 },
    { label: "1 week", hours: 168 },
  ];

  const handleCreate = async () => {
    if (!isParcel && !firstName.trim()) {
      Alert.alert("Missing Name", "Please enter the guest's name."); return;
    }
    if (guestStats.activeCodes >= guestStats.maxActive) {
      Alert.alert("Limit Reached", `You have reached the maximum of ${guestStats.maxActive} active codes.`); return;
    }

    setLoading(true);
    try {
      const newCode = await addGuestCode({
        guestFirstName: isParcel ? "Parcel" : firstName.trim(),
        guestLastName: isParcel ? "Delivery" : lastName.trim(),
        guestPhone: phone.trim() || undefined,
        isParcel,
        durationHours,
      });
      router.replace(`/(tabs)/guests/${newCode.id}` as any);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not create guest code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          <Text style={[styles.backLabel, { color: colors.foreground }]}>Back</Text>
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>New Guest Code</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.label, { color: colors.foreground }]}>Parcel Delivery</Text>
              <Text style={[styles.subLabel, { color: colors.mutedForeground }]}>1-use code for couriers</Text>
            </View>
            <Switch
              value={isParcel}
              onValueChange={setIsParcel}
              trackColor={{ true: colors.primary }}
            />
          </View>
        </View>

        {!isParcel && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>GUEST NAME</Text>
            <View style={styles.nameRow}>
              <TextInput
                style={[styles.input, styles.halfInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="First name"
                placeholderTextColor={colors.mutedForeground}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              <TextInput
                style={[styles.input, styles.halfInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Last name"
                placeholderTextColor={colors.mutedForeground}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 14 }]}>PHONE (OPTIONAL)</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="+27 82 000 0000"
              placeholderTextColor={colors.mutedForeground}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        )}

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>VALID FOR</Text>
          <View style={styles.durationRow}>
            {durations.map(d => (
              <Pressable
                key={d.hours}
                style={[
                  styles.durationChip,
                  {
                    backgroundColor: durationHours === d.hours ? colors.primary : colors.background,
                    borderColor: durationHours === d.hours ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setDurationHours(d.hours)}
              >
                <Text style={{ color: durationHours === d.hours ? "#fff" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={[styles.createBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.createBtnText}>{loading ? "Creating..." : "Generate Code"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2, width: 60 },
  backLabel: { fontSize: 16 },
  topTitle: { fontSize: 17, fontWeight: "600" },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 16, fontWeight: "600" },
  subLabel: { fontSize: 13, marginTop: 2 },
  fieldLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.8, marginBottom: 8 },
  nameRow: { flexDirection: "row", gap: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  halfInput: { flex: 1 },
  durationRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  createBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  createBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
