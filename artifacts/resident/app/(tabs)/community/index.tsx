import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, type CommunityPost, type CommunityEvent, type ManagementBroadcast } from "@/context/AppContext";

type Tab = "broadcasts" | "posts" | "events";

function BroadcastItem({ item, onRead }: { item: ManagementBroadcast; onRead: () => void }) {
  const colors = useColors();
  const isUrgent = item.messageType === "urgent" || item.messageType === "emergency";
  return (
    <Pressable
      style={[styles.broadcastCard, {
        backgroundColor: colors.card,
        borderColor: item.isRead ? colors.border : colors.primary + "44",
        borderLeftWidth: item.isRead ? 1 : 4,
        borderLeftColor: item.isRead ? colors.border : isUrgent ? "#ef4444" : colors.primary,
      }]}
      onPress={!item.isRead ? onRead : undefined}
    >
      <View style={styles.broadcastHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.broadcastSubject, { color: colors.foreground }]}>{item.subject ?? "Notice"}</Text>
          <Text style={[styles.broadcastDate, { color: colors.mutedForeground }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {!item.isRead && (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}
      </View>
      <Text style={[styles.broadcastContent, { color: colors.mutedForeground }]} numberOfLines={2}>
        {item.content}
      </Text>
    </Pressable>
  );
}

function PostItem({ item }: { item: CommunityPost }) {
  const colors = useColors();
  return (
    <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.isAnonymous ? "?" : (item as any).authorName?.[0] ?? "R"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.postAuthor, { color: colors.foreground }]}>
            {item.isAnonymous ? "Anonymous" : ((item as any).authorName ?? "Resident")}
          </Text>
          <Text style={[styles.postDate, { color: colors.mutedForeground }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.postTypeBadge, { backgroundColor: colors.muted }]}>
          <Text style={[styles.postTypeText, { color: colors.mutedForeground }]}>{item.postType}</Text>
        </View>
      </View>
      <Text style={[styles.postContent, { color: colors.foreground }]}>{item.content}</Text>
      <View style={styles.postFooter}>
        <View style={styles.postAction}>
          <Ionicons name="heart-outline" size={16} color={colors.mutedForeground} />
          <Text style={[styles.postActionCount, { color: colors.mutedForeground }]}>{(item as any).likeCount ?? 0}</Text>
        </View>
        <View style={styles.postAction}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.mutedForeground} />
          <Text style={[styles.postActionCount, { color: colors.mutedForeground }]}>{item.commentCount ?? 0}</Text>
        </View>
      </View>
    </View>
  );
}

function EventItem({ item }: { item: CommunityEvent }) {
  const colors = useColors();
  const { rsvpEvent } = useApp();
  const start = new Date(item.startsAt);
  const isPast = start < new Date();
  const rsvpColors: Record<string, string> = { yes: "#22c55e", no: "#ef4444", maybe: "#f59e0b" };

  return (
    <View style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.eventDateBox, { backgroundColor: colors.primary + "18" }]}>
        <Text style={[styles.eventDay, { color: colors.primary }]}>{start.getDate()}</Text>
        <Text style={[styles.eventMonth, { color: colors.primary }]}>{start.toLocaleString("default", { month: "short" }).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.eventTitle, { color: colors.foreground }]}>{item.title}</Text>
        {item.location ? <Text style={[styles.eventLocation, { color: colors.mutedForeground }]}>{item.location}</Text> : null}
        <Text style={[styles.eventAttendees, { color: colors.mutedForeground }]}>{item.attendeeCount} attending</Text>
        {!isPast && (
          <View style={styles.rsvpRow}>
            {(["yes", "no", "maybe"] as const).map(opt => (
              <Pressable
                key={opt}
                style={[styles.rsvpBtn, {
                  backgroundColor: item.userRsvp === opt ? rsvpColors[opt] + "22" : colors.background,
                  borderColor: item.userRsvp === opt ? rsvpColors[opt] : colors.border,
                }]}
                onPress={() => rsvpEvent(item.id, opt)}
              >
                <Text style={{ color: item.userRsvp === opt ? rsvpColors[opt] : colors.mutedForeground, fontSize: 12, fontWeight: "600" }}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { posts, events, broadcasts, unreadBroadcasts, isLoading, markBroadcastRead, refreshCommunity } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>("broadcasts");

  if (isLoading && posts.length === 0 && broadcasts.length === 0) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "broadcasts", label: "Notices", count: unreadBroadcasts > 0 ? unreadBroadcasts : undefined },
    { key: "posts", label: "Posts" },
    { key: "events", label: "Events" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Community</Text>
        {activeTab === "posts" && (
          <Pressable
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)/community/new-post")}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addBtnText}>Post</Text>
          </Pressable>
        )}
      </View>

      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {tabs.map(t => (
          <Pressable key={t.key} style={styles.tabItem} onPress={() => setActiveTab(t.key)}>
            <View style={styles.tabLabelRow}>
              <Text style={[styles.tabLabel, { color: activeTab === t.key ? colors.primary : colors.mutedForeground, fontWeight: activeTab === t.key ? "700" : "400" }]}>
                {t.label}
              </Text>
              {t.count ? (
                <View style={[styles.tabBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.tabBadgeText}>{t.count}</Text>
                </View>
              ) : null}
            </View>
            {activeTab === t.key && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}>
        {activeTab === "broadcasts" && (
          broadcasts.length === 0 ? (
            <EmptyState icon="megaphone-outline" text="No notices from management yet." colors={colors} />
          ) : (
            broadcasts.map(b => (
              <BroadcastItem key={b.id} item={b} onRead={() => markBroadcastRead(b.id)} />
            ))
          )
        )}
        {activeTab === "posts" && (
          posts.length === 0 ? (
            <EmptyState icon="chatbubbles-outline" text="No community posts yet. Be the first to post!" colors={colors} />
          ) : (
            posts.map(p => <PostItem key={p.id} item={p} />)
          )
        )}
        {activeTab === "events" && (
          events.length === 0 ? (
            <EmptyState icon="calendar-outline" text="No upcoming events." colors={colors} />
          ) : (
            events.map(e => <EventItem key={e.id} item={e} />)
          )
        )}
      </ScrollView>
    </View>
  );
}

function EmptyState({ icon, text, colors }: { icon: string; text: string; colors: any }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon as any} size={48} color={colors.mutedForeground} />
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, paddingHorizontal: 20 },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tabLabel: { fontSize: 14 },
  tabBadge: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  tabBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  tabIndicator: { position: "absolute", bottom: -1, left: 0, right: 0, height: 2, borderRadius: 1 },
  broadcastCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  broadcastHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  broadcastSubject: { fontSize: 15, fontWeight: "600" },
  broadcastDate: { fontSize: 11, marginTop: 1 },
  broadcastContent: { fontSize: 13, lineHeight: 18 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  postCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "700" },
  postAuthor: { fontSize: 14, fontWeight: "600" },
  postDate: { fontSize: 11, marginTop: 1 },
  postTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  postTypeText: { fontSize: 11, fontWeight: "600" },
  postContent: { fontSize: 14, lineHeight: 20, marginBottom: 10 },
  postFooter: { flexDirection: "row", gap: 16 },
  postAction: { flexDirection: "row", alignItems: "center", gap: 4 },
  postActionCount: { fontSize: 13 },
  eventCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, flexDirection: "row", gap: 12 },
  eventDateBox: { width: 48, alignItems: "center", justifyContent: "center", borderRadius: 10, paddingVertical: 8 },
  eventDay: { fontSize: 22, fontWeight: "800" },
  eventMonth: { fontSize: 10, fontWeight: "700" },
  eventTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  eventLocation: { fontSize: 12, marginBottom: 2 },
  eventAttendees: { fontSize: 12, marginBottom: 8 },
  rsvpRow: { flexDirection: "row", gap: 6 },
  rsvpBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  empty: { alignItems: "center", paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
});
