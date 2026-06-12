import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useApp, ManagementBroadcast } from "@/context/AppContext";
import ScreenHeader from "@/components/ScreenHeader";

export default function AnnouncementsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { broadcasts, markBroadcastRead } = useApp();
  
  const [selected, setSelected] = useState<ManagementBroadcast | null>(null);

  const handlePress = (b: ManagementBroadcast) => {
    if (!b.isRead) markBroadcastRead(b.id);
    setSelected(b);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Announcements" showBack />
      <ScrollView contentContainerStyle={styles.body}>
        {broadcasts.length === 0 ? (
          <Text style={[styles.text, { color: colors.foreground, textAlign: "center", marginTop: 40 }]}>
            No announcements at the moment.
          </Text>
        ) : (
          broadcasts.map(b => (
            <Pressable 
              key={b.id}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border }
              ]}
              onPress={() => handlePress(b)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  {!b.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                  <Text style={[styles.title, { color: colors.foreground, fontFamily: b.isRead ? "Inter_500Medium" : "Inter_700Bold" }]}>
                    {b.subject || "Management Notice"}
                  </Text>
                </View>
                <Text style={[styles.date, { color: colors.mutedForeground }]}>
                  {new Date(b.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text 
                style={[styles.content, { color: colors.mutedForeground }]} 
                numberOfLines={3}
              >
                {b.content}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 0 : insets.top }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable onPress={() => setSelected(null)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.modalHeaderText, { color: colors.foreground }]}>Notice Details</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView contentContainerStyle={styles.modalBody}>
            {selected && (
              <>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  {selected.subject || "Management Notice"}
                </Text>
                <View style={styles.modalMeta}>
                  <Ionicons name="calendar-outline" size={14} color={colors.mutedForeground} style={{ marginRight: 4 }} />
                  <Text style={[styles.modalDate, { color: colors.mutedForeground }]}>
                    {new Date(selected.createdAt).toLocaleDateString()} at {new Date(selected.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Text>
                </View>

                {selected.messageType === "levy" && (
                  <View style={[styles.levyBox, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <Ionicons name="card-outline" size={24} color={colors.primary} style={{ marginRight: 12 }} />
                      <Text style={[styles.levyTitle, { color: colors.foreground }]}>Levy Statement Attached</Text>
                    </View>
                    <Pressable style={[styles.payBtn, { backgroundColor: colors.primary }]}>
                      <Text style={styles.payBtnText}>View Statement & Pay</Text>
                    </Pressable>
                  </View>
                )}

                <Text style={[styles.modalContentText, { color: colors.foreground }]}>
                  {selected.content}
                </Text>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { padding: 16, gap: 12 },
  text: { fontSize: 16, fontFamily: "Inter_400Regular" },
  card: { borderRadius: 12, borderWidth: 1, padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 12 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8, marginTop: 2 },
  title: { fontSize: 15 },
  date: { fontSize: 12, fontFamily: "Inter_400Regular" },
  content: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderWidth: 0, borderBottomWidth: 1 },
  closeBtn: { padding: 8, marginLeft: -8 },
  modalHeaderText: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  modalBody: { padding: 24, paddingBottom: 60 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 24, marginBottom: 8 },
  modalMeta: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  modalDate: { fontFamily: "Inter_500Medium", fontSize: 13 },
  modalContentText: { fontFamily: "Inter_400Regular", fontSize: 16, lineHeight: 26 },
  
  levyBox: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 24 },
  levyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  payBtn: { paddingVertical: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  payBtnText: { fontFamily: "Inter_600SemiBold", color: "#FFFFFF", fontSize: 15 },
});
