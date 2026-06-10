import * as Haptics from "expo-haptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, GateActivity } from "@/context/AppContext";
import { HoldButton } from "@/components/HoldButton";
import { StatusBadge } from "@/components/StatusBadge";

interface Gate {
  id: string;
  label: string;
  type: "vehicle" | "pedestrian";
  icon: string;
  holdSeconds: number;
}

const GATES: Gate[] = [
  {
    id: "main_vehicle",
    label: "Main Vehicle Gate",
    type: "vehicle",
    icon: "car-outline",
    holdSeconds: 3,
  },
  {
    id: "pedestrian",
    label: "Pedestrian Gate",
    type: "pedestrian",
    icon: "walk-outline",
    holdSeconds: 3,
  },
];

function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return `Today ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityItem({ item }: { item: GateActivity }) {
  const colors = useColors();
  return (
    <View
      style={[
        actStyles.row,
        { borderBottomColor: colors.border },
      ]}
    >
      <View
        style={[
          actStyles.dirIcon,
          {
            backgroundColor:
              item.direction === "entry" ? colors.secondary : colors.muted,
          },
        ]}
      >
        <Ionicons
          name={item.direction === "entry" ? "log-in-outline" : "log-out-outline"}
          size={16}
          color={item.direction === "entry" ? colors.primary : colors.mutedForeground}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[actStyles.gate, { color: colors.foreground }]}>
          {item.gateLabel}
        </Text>
        <Text style={[actStyles.time, { color: colors.mutedForeground }]}>
          {formatActivityTime(item.triggeredAt)}
        </Text>
      </View>
      <StatusBadge status={item.status} small />
    </View>
  );
}

export default function GateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { gateActivity, addGateActivity } = useApp();
  const [selectedGate, setSelectedGate] = useState<Gate>(GATES[0]);
  const [lastOpened, setLastOpened] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleGateOpen = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLastOpened(selectedGate.id);
    addGateActivity({
      gateLabel: selectedGate.label,
      direction: "entry",
      triggeredAt: new Date().toISOString(),
      status: "success",
    });
    setTimeout(() => setLastOpened(null), 3000);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top section — dark navy */}
      <View
        style={[
          styles.topSection,
          {
            backgroundColor: colors.navy,
            paddingTop: topPad + 16,
          },
        ]}
      >
        <Text style={styles.screenTitle}>Gate Access</Text>
        <Text style={[styles.screenSub, { color: "#FFFFFF66" }]}>
          Hold to open · 3 seconds
        </Text>

        {/* Gate selector */}
        <View style={[styles.gateSelector, { borderColor: "#FFFFFF18" }]}>
          {GATES.map((gate) => (
            <TouchableOpacity
              key={gate.id}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedGate(gate);
              }}
              style={[
                styles.gateTab,
                selectedGate.id === gate.id && {
                  backgroundColor: colors.teal,
                },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={gate.icon as any}
                size={15}
                color={
                  selectedGate.id === gate.id
                    ? colors.navy
                    : "#FFFFFF99"
                }
              />
              <Text
                style={[
                  styles.gateTabText,
                  {
                    color:
                      selectedGate.id === gate.id
                        ? colors.navy
                        : "#FFFFFF99",
                  },
                ]}
              >
                {gate.type === "vehicle" ? "Vehicle" : "Pedestrian"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hold button */}
        <View style={styles.holdArea}>
          <HoldButton
            label="HOLD TO OPEN"
            sublabel={selectedGate.label}
            holdDuration={3000}
            onComplete={handleGateOpen}
            size="large"
          />
          {lastOpened === selectedGate.id && (
            <View style={[styles.openedBanner, { backgroundColor: colors.tealDark }]}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.openedText}>Gate command sent</Text>
            </View>
          )}
        </View>
      </View>

      {/* Activity log */}
      <View style={[styles.logSection, { backgroundColor: colors.background }]}>
        <Text style={[styles.logTitle, { color: colors.foreground }]}>
          My Activity
        </Text>
        <FlatList
          data={gateActivity}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ActivityItem item={item} />}
          scrollEnabled={!!gateActivity.length}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 80,
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name="gate"
                size={40}
                color={colors.border}
              />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No gate activity yet
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topSection: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  screenTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  screenSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginBottom: 20,
  },
  gateSelector: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 32,
    backgroundColor: "#FFFFFF0A",
  },
  gateTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 9,
  },
  gateTabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  holdArea: {
    alignItems: "center",
    gap: 16,
  },
  openedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  openedText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  logSection: {
    flex: 1,
    padding: 20,
    paddingTop: 16,
  },
  logTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginBottom: 12,
  },
  empty: {
    alignItems: "center",
    gap: 10,
    paddingTop: 40,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
});

const actStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dirIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  gate: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  time: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 1,
  },
});
