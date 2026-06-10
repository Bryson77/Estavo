import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Notice {
  id: string;
  title: string;
  body: string;
  date: string;
  isUnread: boolean;
  type: "info" | "warning" | "event";
}

const SAMPLE_NOTICES: Notice[] = [
  {
    id: "1",
    title: "Water maintenance scheduled",
    body: "Water supply will be interrupted on Saturday 14 June from 08:00 to 12:00. Please store water in advance.",
    date: "2 hours ago",
    isUnread: true,
    type: "warning",
  },
  {
    id: "2",
    title: "Gate 2 maintenance complete",
    body: "The pedestrian gate at the east entrance has been repaired and is fully operational.",
    date: "Yesterday",
    isUnread: true,
    type: "info",
  },
  {
    id: "3",
    title: "Community braai — 21 June",
    body: "Join us for the quarterly residents' braai at the clubhouse. RSVP to management by Friday.",
    date: "3 days ago",
    isUnread: true,
    type: "event",
  },
  {
    id: "4",
    title: "Levy statements issued",
    body: "June levy statements have been emailed to all unit owners. Please ensure payment by 30 June.",
    date: "1 week ago",
    isUnread: false,
    type: "info",
  },
  {
    id: "5",
    title: "Speed limit reminder",
    body: "Please observe the 15 km/h speed limit within the estate at all times. Children's safety depends on it.",
    date: "2 weeks ago",
    isUnread: false,
    type: "warning",
  },
];

const TYPE_ICON: Record<Notice["type"], string> = {
  info: "information-circle-outline",
  warning: "alert-circle-outline",
  event: "calendar-outline",
};

const TYPE_COLOR: Record<Notice["type"], string> = {
  info: "#1565C0",
  warning: "#F59E0B",
  event: "#10B981",
};

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [notices, setNotices] = useState(SAMPLE_NOTICES);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

  const topPad = Platform.OS === "web" ? 0 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 90;

  const unreadCount = notices.filter((n) => n.isUnread).length;
  const filtered = activeFilter === "unread" ? notices.filter((n) => n.isUnread) : notices;

  const markRead = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
    );
  };

  const markAllRead = () => {
    setNotices((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.primary, paddingTop: topPad + 12 },
        ]}
      >
        <View>
          <Text style={styles.headerLabel}>MANAGEMENT UPDATES</Text>
          <Text style={styles.headerTitle}>Community</Text>
        </View>
        {unreadCount > 0 && (
          <Pressable
            onPress={markAllRead}
            style={({ pressed }) => [styles.markAllBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {/* Filter pills */}
      <View style={[styles.filterRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["all", "unread"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[
              styles.filterPill,
              activeFilter === f && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: activeFilter === f ? "#FFFFFF" : colors.mutedForeground,
                },
              ]}
            >
              {f === "all" ? "All" : `Unread (${unreadCount})`}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              All caught up!
            </Text>
          </View>
        ) : (
          filtered.map((notice) => (
            <Pressable
              key={notice.id}
              onPress={() => markRead(notice.id)}
              style={({ pressed }) => [
                styles.noticeCard,
                {
                  backgroundColor: colors.card,
                  borderColor: notice.isUnread ? colors.primary + "40" : colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              {notice.isUnread && (
                <View style={[styles.unreadBar, { backgroundColor: colors.primary }]} />
              )}
              <View
                style={[
                  styles.noticeIcon,
                  { backgroundColor: TYPE_COLOR[notice.type] + "18" },
                ]}
              >
                <Ionicons
                  name={TYPE_ICON[notice.type] as any}
                  size={20}
                  color={TYPE_COLOR[notice.type]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.noticeTitleRow}>
                  <Text
                    style={[
                      styles.noticeTitle,
                      {
                        color: colors.foreground,
                        fontFamily: notice.isUnread ? "Inter_600SemiBold" : "Inter_500Medium",
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {notice.title}
                  </Text>
                  {notice.isUnread && (
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <Text
                  style={[styles.noticeBody, { color: colors.mutedForeground }]}
                  numberOfLines={2}
                >
                  {notice.body}
                </Text>
                <Text style={[styles.noticeDate, { color: colors.mutedForeground }]}>
                  {notice.date}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  headerLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1,
    marginBottom: 3,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
  },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  markAllText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#FFFFFF",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  filterText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  list: { padding: 14, gap: 10 },
  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    overflow: "hidden",
  },
  unreadBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  noticeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginLeft: 4,
  },
  noticeTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
  },
  noticeTitle: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
  noticeBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  noticeDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
});
