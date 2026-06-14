import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
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
import { useApp, type CommunityPost } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import ScreenHeader from "@/components/ScreenHeader";

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

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { posts, isLoading } = useApp();

  const initials = user?.firstName ? user.firstName[0].toUpperCase() : "?";
  const subLabel = user
    ? `UNIT ${user.unitNumber} · ${user.estateName?.toUpperCase()}`
    : "RESIDENT";
  const titleLabel = user ? `${user.firstName} ${user.lastName}` : "Estavo";

  if (isLoading && posts.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        {Platform.OS !== "web" ? (
          <ScreenHeader title={titleLabel} subtitle={subLabel} showAvatar initials={initials} />
        ) : (
          <View style={styles.webHeaderOffset} />
        )}
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader title={titleLabel} subtitle={subLabel} showAvatar initials={initials} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 20 }}>
          
          {/* ── Events Card ── */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/community/events" as any);
            }}
          >
            {({ pressed }) => (
              <View style={[
                styles.eventsCard, 
                { 
                  backgroundColor: colors.primary, 
                  opacity: pressed ? 0.9 : 1,
                  shadowColor: colors.primary,
                  shadowOpacity: 0.25,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 8,
                }
              ]}>
                <View style={styles.eventsCardContent}>
                  <View style={styles.eventsIconWrapper}>
                    <Ionicons name="calendar" size={24} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventsCardTitle}>EVENTS</Text>
                    <Text style={styles.eventsCardSubtitle}>See what's happening in your estate</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ opacity: 0.8 }} />
                </View>
              </View>
            )}
          </Pressable>

          {/* ── Community Posts Feed ── */}
          <View style={styles.feedHeader}>
            <Text style={[styles.feedTitle, { color: colors.foreground }]}>Recent Activity</Text>
          </View>

          {posts.length === 0 ? (
            <View style={styles.empty}>
              <View style={[styles.emptyIconBg, { backgroundColor: colors.card }]}>
                <Ionicons name="chatbubbles-outline" size={32} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No posts yet. Be the first to share an update!
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {posts.map((p) => <PostCard key={p.id} item={p} />)}
            </View>
          )}

        </View>
      </ScrollView>

      {/* ── Floating Action Button (FAB) ── */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + 80 }]}>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/community/new-post" as any);
          }}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.8 : 1,
              shadowColor: colors.primary,
              shadowOpacity: 0.3,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }
          ]}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Events Card
  eventsCard: {
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
  eventsCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  eventsIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  eventsCardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 1.2,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  eventsCardSubtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },

  // Feed Header
  feedHeader: {
    marginTop: 8,
    marginBottom: 4,
  },
  feedTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
  },

  // Post card
  postCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
  postTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  postAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  postAvatarText: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  postAuthor: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  postTime: { fontFamily: "Inter_400Regular", fontSize: 12 },
  postContent: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22, marginBottom: 16 },
  postFooter: { flexDirection: "row", gap: 18 },
  postStat: { flexDirection: "row", alignItems: "center", gap: 6 },
  postStatText: { fontFamily: "Inter_500Medium", fontSize: 13 },

  // Empty state
  empty: { alignItems: "center", paddingTop: 40, gap: 16 },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 15, textAlign: "center", lineHeight: 22 },

  // FAB
  fabContainer: {
    position: "absolute",
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
