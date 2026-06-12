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
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import ScreenHeader from "@/components/ScreenHeader";

const CATEGORIES = [
  { value: "maintenance", label: "Maintenance", icon: "construct-outline" },
  { value: "security", label: "Security", icon: "shield-outline" },
  { value: "urgent", label: "Urgent", icon: "warning-outline" },
  { value: "general", label: "General", icon: "chatbubble-outline" },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "#22c55e" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "high", label: "High", color: "#ef4444" },
];

export default function NewReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addReport } = useApp();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("maintenance");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert("Missing Title", "Please add a brief title."); return; }
    if (description.trim().length < 10) { Alert.alert("More Detail", "Please describe the issue in more detail (at least 10 characters)."); return; }

    setLoading(true);
    try {
      await addReport({ title: title.trim(), description: description.trim(), category, priority });
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not submit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenHeader title="New Report" showBack />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>CATEGORY</Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map(c => (
              <Pressable
                key={c.value}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: category === c.value ? colors.primary + "18" : colors.background,
                    borderColor: category === c.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setCategory(c.value)}
              >
                <Ionicons name={c.icon as any} size={16} color={category === c.value ? colors.primary : colors.mutedForeground} />
                <Text style={{ color: category === c.value ? colors.primary : colors.foreground, fontSize: 13, fontWeight: "600" }}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>TITLE</Text>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="e.g. Broken gate motor"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
          />
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 14 }]}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>PRIORITY</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map(p => (
              <Pressable
                key={p.value}
                style={[
                  styles.priorityChip,
                  {
                    backgroundColor: priority === p.value ? p.color + "18" : colors.background,
                    borderColor: priority === p.value ? p.color : colors.border,
                    flex: 1,
                  },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Text style={{ color: priority === p.value ? p.color : colors.foreground, fontWeight: "600", fontSize: 13, textAlign: "center" }}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={[styles.submitBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>{loading ? "Submitting..." : "Submit Report"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  fieldLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.8, marginBottom: 8 },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  textArea: { height: 120 },
  priorityRow: { flexDirection: "row", gap: 8 },
  priorityChip: { padding: 10, borderRadius: 10, borderWidth: 1 },
  submitBtn: { borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8 },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
