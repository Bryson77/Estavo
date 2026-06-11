import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, type CommunityPost, type CommunityEvent, type Amenity } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import ScreenHeader from "@/components/ScreenHeader";

type MainTab = "security" | "events";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

function fmtEventDate(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-ZA", { weekday: "short" });
  const date = d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${day} ${date} · ${time}`;
}

// ─── Amenity Panel ─────────────────────────────────────────────────────────────

function AmenityPanel({ amenities, onBook }: { amenities: Amenity[]; onBook: (a: Amenity) => void }) {
  const colors = useColors();

  const fallbackAmenities = amenities.length > 0
    ? amenities
    : [
        { id: "1", name: "Clubhouse", availableDays: ["Sat"], availableFrom: "14:00", availableUntil: "18:00", slotDurationMins: 60 },
        { id: "2", name: "Tennis court", availableDays: ["Sun"], availableFrom: "08:00", availableUntil: "10:00", slotDurationMins: 60 },
        { id: "3", name: "Padel court", availableDays: ["Wed"], availableFrom: "17:00", availableUntil: "18:00", slotDurationMins: 60 },
        { id: "4", name: "Braai area", availableDays: ["Fri"], availableFrom: "18:00", availableUntil: "22:00", slotDurationMins: 60 },
      ] as any;

  return (
    <View style={[styles.amenityPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {fallbackAmenities.map((a: Amenity, idx: number) => {
        const dayLabel = Array.isArray(a.availableDays) && a.availableDays.length > 0
          ? a.availableDays[0]
          : "";
        const timeLabel = a.availableFrom && a.availableUntil
          ? `${a.availableFrom}–${a.availableUntil}`
          : "";
        const slotStr = [dayLabel, timeLabel].filter(Boolean).join(" · ");

        return (
          <View key={a.id} style={[styles.amenityRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.amenityName, { color: colors.foreground }]}>{a.name}</Text>
              {slotStr ? (
                <Text style={[styles.amenitySlot, { color: colors.mutedForeground }]}>{slotStr}</Text>
              ) : null}
            </View>
            <Pressable
              style={({ pressed }) => [styles.bookBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
              onPress={() => { Haptics.selectionAsync(); onBook(a); }}
            >
              <Text style={styles.bookBtnText}>Book</Text>
            </Pressable>
          </View>
        );
      })}
      <Text style={[styles.amenityFootnote, { color: colors.mutedForeground }]}>
        Amenities available are configured by your estate.
      </Text>
    </View>
  );
}

// ─── Post composer ─────────────────────────────────────────────────────────────

function PostComposer({ user, onPost }: { user: any; onPost: (content: string, isAnon: boolean) => Promise<void> }) {
  const colors = useColors();
  const [content, setContent] = useState("");
  const [isAnon, setIsAnon] = useState(true);
  const [posting, setPosting] = useState(false);

  const nameLabel = user ? `${user.firstName} ${user.lastName?.[0]}.  ·  Unit ${user.unitNumber ?? ""}` : "You";

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      await onPost(content.trim(), isAnon);
      setContent("");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to post.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={[styles.composerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.composerLabel, { color: colors.mutedForeground }]}>NEW POST</Text>
      <TextInput
        style={[styles.composerInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
        placeholder="Share an update with your neighbours..."
        placeholderTextColor={colors.mutedForeground}
        multiline
        value={content}
        onChangeText={setContent}
        maxLength={500}
      />
      <Text style={[styles.composerPostAs, { color: colors.foreground }]}>Post as:</Text>
      <View style={styles.anonRow}>
        <Pressable
          style={[styles.anonBtn, { backgroundColor: isAnon ? colors.primary : colors.card, borderColor: isAnon ? colors.primary : colors.border }]}
          onPress={() => { setIsAnon(true); Haptics.selectionAsync(); }}
        >
          <Text style={[styles.anonBtnText, { color: isAnon ? "#FFFFFF" : colors.foreground }]}>Anonymous</Text>
        </Pressable>
        <Pressable
          style={[styles.anonBtn, { backgroundColor: !isAnon ? colors.primary : colors.card, borderColor: !isAnon ? colors.primary : colors.border }]}
          onPress={() => { setIsAnon(false); Haptics.selectionAsync(); }}
        >
          <Text style={[styles.anonBtnText, { color: !isAnon ? "#FFFFFF" : colors.foreground }]}>{nameLabel}</Text>
        </Pressable>
      </View>
      <Text style={[styles.anonNote, { color: colors.mutedForeground }]}>
        Your identity is visible to estate management only.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.postBtn, { backgroundColor: colors.primary, opacity: pressed || posting ? 0.75 : 1 }]}
        onPress={handlePost}
        disabled={posting || !content.trim()}
      >
        {posting
          ? <ActivityIndicator color="#FFFFFF" size="small" />
          : <Text style={styles.postBtnText}>Post</Text>
        }
      </Pressable>
    </View>
  );
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({ item }: { item: CommunityPost }) {
  const colors = useColors();
  const authorName = (item as any).authorName ?? "Resident";
  const firstLetter = item.isAnonymous ? "?" : authorName[0] ?? "R";

  return (
    <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.postTop}>
        <View style={[styles.postAvatar, { backgroundColor: colors.muted }]}>
          <Text style={[styles.postAvatarText, { color: colors.mutedForeground }]}>{firstLetter}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.postAuthor, { color: item.isAnonymous ? colors.mutedForeground : colors.foreground }]}>
            {item.isAnonymous ? "Anonymous" : authorName}
          </Text>
        </View>
        <Text style={[styles.postTime, { color: colors.mutedForeground }]}>{timeAgo(item.createdAt)}</Text>
      </View>
      <Text style={[styles.postContent, { color: colors.foreground }]}>{item.content}</Text>
      <View style={styles.postFooter}>
        <View style={styles.postStat}>
          <Ionicons name="chatbubble-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.postStatText, { color: colors.mutedForeground }]}>{item.commentCount ?? 0}</Text>
        </View>
        <View style={styles.postStat}>
          <Ionicons name="eye-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.postStatText, { color: colors.mutedForeground }]}>{(item as any).viewCount ?? 0}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Event card ───────────────────────────────────────────────────────────────

function EventCard({ item }: { item: CommunityEvent }) {
  const colors = useColors();
  const { rsvpEvent } = useApp();
  const isPast = new Date(item.startsAt) < new Date();

  return (
    <View style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.eventTitle, { color: colors.foreground }]}>{item.title}</Text>
        <View style={styles.eventMeta}>
          <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.eventMetaText, { color: colors.mutedForeground }]}>{fmtEventDate(item.startsAt)}</Text>
          {item.location ? (
            <>
              <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
              <Text style={[styles.eventMetaText, { color: colors.mutedForeground }]}>{item.location}</Text>
            </>
          ) : null}
        </View>
        <Text style={[styles.eventAttendees, { color: colors.mutedForeground }]}>{item.attendeeCount} attending</Text>
      </View>

      {!isPast && (
        <Pressable
          style={({ pressed }) => [
            styles.rsvpBtn,
            {
              backgroundColor: item.userRsvp === "yes" ? "#22C55E" : colors.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={() => {
            rsvpEvent(item.id, item.userRsvp === "yes" ? "no" : "yes");
            Haptics.selectionAsync();
          }}
        >
          <Text style={styles.rsvpBtnText}>{item.userRsvp === "yes" ? "RSVPd ✓" : "RSVP"}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { posts, events, amenities, isLoading, createPost, refreshCommunity, bookAmenity } = useApp();

  const [mainTab, setMainTab] = useState<MainTab>("events");
  const [showAmenities, setShowAmenities] = useState(false);
  const [bookingAmenity, setBookingAmenity] = useState<Amenity | null>(null);
  const [bookingTime, setBookingTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";
  const subLabel = user
    ? `RESIDENT · ${user.firstName?.toUpperCase()} ${user.lastName?.[0]?.toUpperCase()}.`
    : "RESIDENT";

  const amenityNames = amenities.length > 0
    ? amenities.map((a) => a.name).join(" · ")
    : "Clubhouse · Tennis · Padel · Braai";

  if (isLoading && posts.length === 0 && events.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Community" subtitle={subLabel} showAvatar initials={initials} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Community" subtitle={subLabel} showAvatar initials={initials} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* ── Book an amenity banner ── */}
        <Pressable
          style={[styles.amenityBanner, { backgroundColor: colors.primary }]}
          onPress={() => { setShowAmenities(v => !v); Haptics.selectionAsync(); }}
        >
          <Ionicons name="calendar-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.amenityBannerText}>Book an amenity</Text>
          <Text style={styles.amenityBannerNames}> {amenityNames}</Text>
        </Pressable>

        {/* ── Amenity panel (expandable) ── */}
        {showAmenities && (
          <View style={{ paddingHorizontal: 14, paddingTop: 8 }}>
            <AmenityPanel amenities={amenities} onBook={setBookingAmenity} />
          </View>
        )}

        {/* ── Security / Events toggle ── */}
        <View style={[styles.segmentWrapper]}>
          <View style={[styles.segmentControl, { backgroundColor: colors.muted }]}>
            {(["security", "events"] as MainTab[]).map((tab) => (
              <Pressable
                key={tab}
                style={[
                  styles.segmentTab,
                  mainTab === tab && { backgroundColor: colors.card, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
                ]}
                onPress={() => { setMainTab(tab); Haptics.selectionAsync(); }}
              >
                <Text style={[styles.segmentText, { color: mainTab === tab ? colors.foreground : colors.mutedForeground, fontFamily: mainTab === tab ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Security tab (posts + composer) ── */}
        {mainTab === "security" && (
          <View style={{ paddingHorizontal: 14, gap: 10 }}>
            <PostComposer
              user={user}
              onPost={async (content, isAnon) => {
                await createPost({ content, postType: "general", isAnonymous: isAnon });
              }}
            />
            {posts.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="chatbubbles-outline" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No posts yet. Be the first to share an update!
                </Text>
              </View>
            ) : (
              posts.map((p) => <PostCard key={p.id} item={p} />)
            )}
          </View>
        )}

        {/* ── Events tab ── */}
        {mainTab === "events" && (
          <View style={{ paddingHorizontal: 14, gap: 10 }}>
            {events.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="calendar-outline" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No upcoming events.
                </Text>
              </View>
            ) : (
              events.map((e) => <EventCard key={e.id} item={e} />)
            )}
          </View>
        )}
      </ScrollView>

      {/* ── Booking Modal ── */}
      {bookingAmenity && (
        <Modal transparent animationType="fade" visible={!!bookingAmenity}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Book {bookingAmenity.name}</Text>
              <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>Enter your preferred start time (e.g. 14:00)</Text>
              
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                placeholder="14:00"
                placeholderTextColor={colors.mutedForeground}
                value={bookingTime}
                onChangeText={setBookingTime}
                keyboardType="numbers-and-punctuation"
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: colors.muted }]}
                  onPress={() => { setBookingAmenity(null); setBookingTime(""); }}
                  disabled={isBooking}
                >
                  <Text style={[styles.modalBtnText, { color: colors.foreground }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                  onPress={async () => {
                    if (!bookingTime.trim()) return;
                    setIsBooking(true);
                    try {
                      const today = new Date().toISOString().split("T")[0];
                      await bookAmenity(bookingAmenity.id, `${today}T${bookingTime}:00Z`, `${today}T${bookingTime}:00Z`);
                      Alert.alert("Success", `${bookingAmenity.name} booked successfully!`);
                      setBookingAmenity(null);
                      setBookingTime("");
                    } catch (e: any) {
                      Alert.alert("Error", e.message ?? "Could not book amenity.");
                    } finally {
                      setIsBooking(false);
                    }
                  }}
                  disabled={isBooking || !bookingTime.trim()}
                >
                  {isBooking ? <ActivityIndicator color="#fff" /> : <Text style={[styles.modalBtnText, { color: "#FFFFFF" }]}>Confirm</Text>}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Amenity banner
  amenityBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  amenityBannerText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  amenityBannerNames: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    flex: 1,
  },

  // Amenity panel
  amenityPanel: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  amenityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  amenityName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  amenitySlot: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  bookBtn: { borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8 },
  bookBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#FFFFFF" },
  amenityFootnote: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  // Segment control
  segmentWrapper: { paddingHorizontal: 14, paddingVertical: 12 },
  segmentControl: {
    flexDirection: "row",
    borderRadius: 24,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 22,
  },
  segmentText: { fontSize: 14 },

  // Post composer
  composerCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  composerLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 1,
  },
  composerInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 72,
    textAlignVertical: "top",
  },
  composerPostAs: { fontFamily: "Inter_500Medium", fontSize: 13 },
  anonRow: { flexDirection: "row", gap: 8 },
  anonBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: "center",
    borderWidth: 1,
  },
  anonBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  anonNote: { fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16 },
  postBtn: { borderRadius: 10, paddingVertical: 13, alignItems: "center" },
  postBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFFFFF" },

  // Post card
  postCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  postTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  postAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  postAvatarText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  postAuthor: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  postTime: { fontFamily: "Inter_400Regular", fontSize: 12 },
  postContent: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, marginBottom: 10 },
  postFooter: { flexDirection: "row", gap: 14 },
  postStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  postStatText: { fontFamily: "Inter_400Regular", fontSize: 13 },

  // Event card
  eventCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eventTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 6 },
  eventMeta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4, marginBottom: 4 },
  eventMetaText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  eventAttendees: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  rsvpBtn: { borderRadius: 20, paddingHorizontal: 18, paddingVertical: 9 },
  rsvpBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#FFFFFF" },

  // Empty state
  empty: { alignItems: "center", paddingTop: 48, gap: 10 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  modalSub: { fontFamily: "Inter_400Regular", fontSize: 13 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 8 },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
