import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useColors } from "@/hooks/useColors";
import { useApp, MaintenanceReport } from "@/context/AppContext";
import { ReportCard } from "@/components/ReportCard";

type Category = "maintenance" | "security" | "urgent" | "general";
type Priority = "low" | "medium" | "high";

const CATEGORIES: { value: Category; label: string; icon: string; color: string }[] = [
  { value: "maintenance", label: "Maintenance", icon: "construct-outline", color: "#3B82F6" },
  { value: "security", label: "Security", icon: "shield-outline", color: "#8B5CF6" },
  { value: "urgent", label: "Urgent", icon: "alert-circle-outline", color: "#EF4444" },
  { value: "general", label: "General", icon: "information-circle-outline", color: "#6B7280" },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "#10B981" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "high", label: "High", color: "#EF4444" },
];

const STATUS_FILTERS = ["all", "open", "in_progress", "resolved"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reports, addReport } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("maintenance");
  const [priority, setPriority] = useState<Priority>("medium");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered =
    statusFilter === "all"
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("maintenance");
    setPriority("medium");
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please provide a short title for the issue.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Required", "Please describe the issue in more detail.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addReport({ title: title.trim(), description: description.trim(), category, priority });
    setShowModal(false);
    resetForm();
  };

  const openTickets = reports.filter((r) => r.status === "open").length;
  const inProgressTickets = reports.filter((r) => r.status === "in_progress").length;

  const inputStyle = {
    backgroundColor: colors.muted,
    borderColor: colors.border,
    color: colors.foreground,
    fontFamily: "Inter_400Regular" as const,
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Maintenance
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {openTickets} open · {inProgressTickets} in progress
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowModal(true);
          }}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color={colors.navy} />
        </TouchableOpacity>
      </View>

      {/* Status filter */}
      <FlatList
        horizontal
        data={STATUS_FILTERS as unknown as StatusFilter[]}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setStatusFilter(item);
            }}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  statusFilter === item ? colors.primary : colors.muted,
                borderColor:
                  statusFilter === item ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color:
                    statusFilter === item ? colors.navy : colors.mutedForeground,
                },
              ]}
            >
              {item === "all"
                ? "All"
                : item === "in_progress"
                ? "In Progress"
                : item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.filterScroll}
        showsHorizontalScrollIndicator={false}
        style={[styles.filterBar, { borderBottomColor: colors.border }]}
        scrollEnabled
      />

      {/* Reports list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReportCard report={item} />}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100,
          },
        ]}
        scrollEnabled
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="construct-outline"
              size={48}
              color={colors.border}
            />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No reports
            </Text>
            <Text
              style={[styles.emptyText, { color: colors.mutedForeground }]}
            >
              Tap + to report a maintenance issue
            </Text>
          </View>
        }
      />

      {/* New report modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <KeyboardAwareScrollView
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={[
            styles.modal,
            { paddingBottom: insets.bottom + 20 },
          ]}
          bottomOffset={20}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Report an Issue
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Category */}
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            CATEGORY
          </Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCategory(cat.value);
                }}
                style={[
                  styles.categoryBtn,
                  {
                    backgroundColor:
                      category === cat.value ? cat.color + "18" : colors.muted,
                    borderColor:
                      category === cat.value ? cat.color : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={18}
                  color={category === cat.value ? cat.color : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color:
                        category === cat.value
                          ? cat.color
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Priority */}
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            PRIORITY
          </Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p.value}
                onPress={() => {
                  Haptics.selectionAsync();
                  setPriority(p.value);
                }}
                style={[
                  styles.priorityBtn,
                  {
                    backgroundColor:
                      priority === p.value ? p.color + "18" : colors.muted,
                    borderColor:
                      priority === p.value ? p.color : colors.border,
                  },
                ]}
              >
                <View
                  style={[styles.priorityDot, { backgroundColor: p.color }]}
                />
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color:
                        priority === p.value
                          ? p.color
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            SHORT TITLE
          </Text>
          <TextInput
            style={[styles.input, inputStyle]}
            placeholder="e.g. Pool pump making strange noise"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            maxLength={80}
          />

          {/* Description */}
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            DESCRIPTION
          </Text>
          <TextInput
            style={[styles.input, inputStyle, styles.textarea]}
            placeholder="Describe the issue in detail — location, when it started, severity..."
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: pressed ? colors.tealDark : colors.primary,
              },
            ]}
          >
            <Text style={[styles.submitBtnText, { color: colors.navy }]}>
              Submit Report
            </Text>
          </Pressable>
        </KeyboardAwareScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 26 },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBar: {
    borderBottomWidth: 1,
    maxHeight: 54,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  listContent: { padding: 20, paddingTop: 16 },
  empty: { alignItems: "center", gap: 10, paddingTop: 60 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
  modal: { padding: 20, paddingTop: 12 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  fieldLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: "47%",
  },
  categoryText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  priorityBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 20,
  },
  textarea: { height: 100, paddingTop: 13 },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  submitBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
