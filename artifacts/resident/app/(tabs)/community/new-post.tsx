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

const POST_TYPES = [
  { value: "general", label: "General" },
  { value: "question", label: "Question" },
  { value: "for_sale", label: "For Sale" },
  { value: "lost_found", label: "Lost & Found" },
  { value: "recommendation", label: "Recommendation" },
];

export default function NewPostScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { createPost } = useApp();

  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("general");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) { Alert.alert("Empty Post", "Please write something first."); return; }

    setLoading(true);
    try {
      await createPost({ content: content.trim(), postType, isAnonymous });
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not publish post.");
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
          <Ionicons name="close" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>New Post</Text>
        <Pressable
          style={[styles.postBtn, { backgroundColor: loading || !content.trim() ? colors.muted : colors.primary }]}
          onPress={handlePost}
          disabled={loading || !content.trim()}
        >
          <Text style={styles.postBtnText}>{loading ? "Posting..." : "Post"}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <TextInput
          style={[styles.contentInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="What's on your mind?"
          placeholderTextColor={colors.mutedForeground}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          autoFocus
        />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>POST TYPE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {POST_TYPES.map(t => (
              <Pressable
                key={t.value}
                style={[styles.typeChip, {
                  backgroundColor: postType === t.value ? colors.primary : colors.card,
                  borderColor: postType === t.value ? colors.primary : colors.border,
                }]}
                onPress={() => setPostType(t.value)}
              >
                <Text style={{ color: postType === t.value ? "#fff" : colors.foreground, fontSize: 13, fontWeight: "600" }}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Post Anonymously</Text>
            <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>Your name won't be shown</Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ true: colors.primary }}
          />
        </View>
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
  backBtn: { width: 40, alignItems: "flex-start" },
  topTitle: { fontSize: 17, fontWeight: "600" },
  postBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  postBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  contentInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 160,
    marginBottom: 20,
  },
  sectionLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.8, marginBottom: 8 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  toggleLabel: { fontSize: 16, fontWeight: "600" },
  toggleSub: { fontSize: 13, marginTop: 2 },
});
