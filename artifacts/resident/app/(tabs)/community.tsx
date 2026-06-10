import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

type Tab = "security" | "events";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" }) +
    " · " + d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    posts, events, amenities, broadcasts,
    createPost, rsvpEvent, refreshCommunity, isLoading,
  } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>("security");
  const [showAmenities, setShowAmenities] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 90;

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "?";

  const handlePost = async () => {
    if (!postContent.trim()) return;
    setPostLoading(true);
    try {
      await createPost({ content: postContent.trim(), postType: "general", isAnonymous });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPostContent("");
      setShowPostModal(false);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setPostLoading(false);
    }
  };

  const handleRsvp = async (eventId: string, current: string | null) => {
    setRsvpLoading(eventId);
    try {
      const response = current === "yes" ? "no" : "yes";
      await rsvpEvent(eventId, response);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setRsvpLoading(null);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.headerSub}>
              RESIDENT · {user?.firstName?.toUpperCase()} {user?.lastName?.charAt(0)?.toUpperCase()}.
            </Text>
            <Text style={styles.headerTitle}>Community</Text>
          </View>
        </View>
        <Pressable hitSlop={12} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Book an amenity banner */}
        <Pressable
          onPress={() => setShowAmenities(v => !v)}
          style={({ pressed }) => [
            styles.amenityBanner,
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
          <Text style={styles.amenityBannerText}>
            <Text style={{ fontFamily: "Inter_700Bold" }}>Book an amenity</Text>
            {amenities.length > 0
              ? "  " + amenities.map(a => a.name).join(" · ")
              : "  Loading..."}
          </Text>
        </Pressable>

        {/* Amenity list (expanded) */}
        {showAmenities && (
          <View style={[styles.amenityList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {amenities.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No amenities available</Text>
            ) : amenities.map(a => (
              <View key={a.id} style={[styles.amenityRow, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.amenityName, { color: colors.foreground }]}>{a.name}</Text>
                  {a.availableDays && a.availableFrom && (
                    <Text style={[styles.amenitySub, { color: colors.mutedForeground }]}>
                      {a.availableDays.map(d => d.charAt(0).toUpperCase() + d.slice(0, 2)).join("/")} · {a.availableFrom}–{a.availableUntil}
                    </Text>
                  )}
                </View>
                <Pressable
                  style={({ pressed }) => [styles.bookBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => Alert.alert("Coming Soon", "Amenity booking UI coming soon.")}
                >
                  <Text style={styles.bookBtnText}>Book</Text>
                </Pressable>
              </View>
            ))}
            <Text style={[styles.amenityFooter, { color: colors.mutedForeground }]}>
              Amenities available are configured by your estate.
            </Text>
          </View>
        )}

        {/* Tab switcher */}
        <View style={[styles.tabRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          {(["security", "events"] as Tab[]).map(t => (
            <Pressable
              key={t}
              style={[styles.tabBtn, activeTab === t && { backgroundColor: colors.card }]}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabText, { color: activeTab === t ? colors.foreground : colors.mutedForeground }]}>
                {t === "security" ? "Security" : "Events"}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "security" ? (
          <View style={styles.section}>
            {/* New post form */}
            <View style={[styles.postForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.newPostLabel, { color: colors.mutedForeground }]}>NEW POST</Text>
              <Pressable
                style={[styles.postInput, { borderColor: colors.border, backgroundColor: colors.background }]}
                onPress={() => setShowPostModal(true)}
              >
                <Text style={[styles.postPlaceholder, { color: colors.mutedForeground }]}>
                  Share an update with your neighbours...
                </Text>
              </Pressable>
              <Text style={[styles.postAsLabel, { color: colors.mutedForeground }]}>Post as:</Text>
              <View style={styles.postAsRow}>
                <Pressable
                  style={[styles.postAsBtn, isAnonymous && { backgroundColor: colors.primary }]}
                  onPress={() => setIsAnonymous(true)}
                >
                  <Text style={[styles.postAsBtnText, { color: isAnonymous ? "#FFFFFF" : colors.foreground }]}>Anonymous</Text>
                </Pressable>
                <Pressable
                  style={[styles.postAsBtn, !isAnonymous && { backgroundColor: colors.primary }, { borderWidth: 1, borderColor: colors.border }]}
                  onPress={() => setIsAnonymous(false)}
                >
                  <Text style={[styles.postAsBtnText, { color: !isAnonymous ? "#FFFFFF" : colors.mutedForeground }]}>
                    {user?.firstName} {user?.lastName?.charAt(0)}. · Unit {user?.unitNumber}
                  </Text>
                </Pressable>
              </View>
              {isAnonymous && (
                <Text style={[styles.anonNote, { color: colors.mutedForeground }]}>
                  Your identity is visible to estate management only.
                </Text>
              )}
              <Pressable
                style={({ pressed }) => [styles.postBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => setShowPostModal(true)}
              >
                <Text style={styles.postBtnText}>Post</Text>
              </Pressable>
            </View>

            {/* Posts */}
            {isLoading && posts.length === 0 ? (
              <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
            ) : posts.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground, marginTop: 24 }]}>No posts yet. Be the first to share!</Text>
            ) : posts.map(p => (
              <View key={p.id} style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.postHeader}>
                  <View style={[styles.anonBadge, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.anonBadgeText, { color: colors.foreground }]}>
                      {p.isAnonymous ? "Anonymous" : (user?.firstName ?? "Resident")}
                    </Text>
                  </View>
                  <Text style={[styles.postTime, { color: colors.mutedForeground }]}>{formatRelative(p.createdAt)}</Text>
                </View>
                <Text style={[styles.postContent, { color: colors.foreground }]}>{p.content}</Text>
                <View style={styles.postStats}>
                  <View style={styles.statRow}>
                    <Ionicons name="chatbubble-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.statNum, { color: colors.mutedForeground }]}>{p.commentCount}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Ionicons name="eye-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.statNum, { color: colors.mutedForeground }]}>{p.viewCount}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            {isLoading && events.length === 0 ? (
              <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
            ) : events.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground, marginTop: 24 }]}>No upcoming events</Text>
            ) : events.map(e => (
              <View key={e.id} style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.eventTitle, { color: colors.foreground }]}>{e.title}</Text>
                <View style={styles.eventMeta}>
                  <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.eventMetaText, { color: colors.mutedForeground }]}>{formatDate(e.startsAt)}</Text>
                  {e.location && (
                    <>
                      <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
                      <Text style={[styles.eventMetaText, { color: colors.mutedForeground }]}>{e.location}</Text>
                    </>
                  )}
                </View>
                <View style={styles.eventFooter}>
                  <Text style={[styles.eventAttendees, { color: colors.mutedForeground }]}>
                    {e.attendeeCount} attending
                  </Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.rsvpBtn,
                      { backgroundColor: e.userRsvp === "yes" ? colors.primary : colors.primary, opacity: pressed ? 0.8 : 1 },
                    ]}
                    onPress={() => handleRsvp(e.id, e.userRsvp)}
                    disabled={rsvpLoading === e.id}
                  >
                    {rsvpLoading === e.id ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.rsvpBtnText}>{e.userRsvp === "yes" ? "✓ Going" : "RSVP"}</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Post modal */}
      <Modal visible={showPostModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Post</Text>
            <Pressable onPress={() => setShowPostModal(false)} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <TextInput
            style={[styles.modalInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
            placeholder="Share an update with your neighbours..."
            placeholderTextColor={colors.mutedForeground}
            value={postContent}
            onChangeText={setPostContent}
            multiline
            autoFocus
            maxLength={1000}
          />
          <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{postContent.length}/1000</Text>
          <View style={styles.postAsRowModal}>
            {[true, false].map(anon => (
              <Pressable
                key={String(anon)}
                style={[styles.postAsBtn, isAnonymous === anon && { backgroundColor: colors.primary }, { borderWidth: 1, borderColor: colors.border }]}
                onPress={() => setIsAnonymous(anon)}
              >
                <Text style={[styles.postAsBtnText, { color: isAnonymous === anon ? "#FFFFFF" : colors.mutedForeground }]}>
                  {anon ? "Anonymous" : `${user?.firstName} · Unit ${user?.unitNumber}`}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.postBtn,
              { backgroundColor: colors.primary, opacity: pressed || postLoading || !postContent.trim() ? 0.7 : 1 },
            ]}
            onPress={handlePost}
            disabled={postLoading || !postContent.trim()}
          >
            {postLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.postBtnText}>Post</Text>}
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 12, color: "#FFFFFF" },
  headerSub: { fontFamily: "Inter_500Medium", fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: 0.8 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: "#FFFFFF", marginTop: 1 },

  amenityBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 14,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  amenityBannerText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#FFFFFF", flex: 1 },

  amenityList: {
    marginHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 4,
  },
  amenityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  amenityName: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  amenitySub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  bookBtn: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  bookBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#FFFFFF" },
  amenityFooter: { fontFamily: "Inter_400Regular", fontSize: 11, paddingHorizontal: 14, paddingVertical: 10 },

  tabRow: {
    flexDirection: "row",
    marginHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 3,
    marginBottom: 10,
  },
  tabBtn: { flex: 1, paddingVertical: 7, borderRadius: 17, alignItems: "center" },
  tabText: { fontFamily: "Inter_500Medium", fontSize: 13 },

  section: { paddingHorizontal: 14 },

  postForm: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  newPostLabel: { fontFamily: "Inter_500Medium", fontSize: 10, letterSpacing: 1, marginBottom: 8 },
  postInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    minHeight: 56,
  },
  postPlaceholder: { fontFamily: "Inter_400Regular", fontSize: 13 },
  postAsLabel: { fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 6 },
  postAsRow: { flexDirection: "row", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  postAsRowModal: { flexDirection: "row", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  postAsBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  postAsBtnText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  anonNote: { fontFamily: "Inter_400Regular", fontSize: 11, marginBottom: 10 },
  postBtn: { borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  postBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFFFFF" },

  postCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  anonBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  anonBadgeText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  postTime: { fontFamily: "Inter_400Regular", fontSize: 11 },
  postContent: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, marginBottom: 10 },
  postStats: { flexDirection: "row", gap: 14 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  statNum: { fontFamily: "Inter_400Regular", fontSize: 11 },

  eventCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  eventTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 6 },
  eventMeta: { flexDirection: "row", flexWrap: "wrap", gap: 4, alignItems: "center", marginBottom: 10 },
  eventMetaText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  eventFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eventAttendees: { fontFamily: "Inter_400Regular", fontSize: 12 },
  rsvpBtn: { borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, minWidth: 70, alignItems: "center" },
  rsvpBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#FFFFFF" },

  emptyText: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center" },

  modal: { flex: 1, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 17 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
    textAlignVertical: "top",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginBottom: 8,
  },
  charCount: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "right", marginBottom: 14 },
});
