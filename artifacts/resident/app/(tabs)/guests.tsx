import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { GuestCodeCard } from "@/components/GuestCodeCard";

const DURATION_OPTIONS = [
  { label: "2h", hours: 2 },
  { label: "6h", hours: 6 },
  { label: "12h", hours: 12 },
  { label: "24h", hours: 24 },
  { label: "48h", hours: 48 },
];

export default function GuestsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { guestCodes, addGuestCode, deactivateGuestCode } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [isParcel, setIsParcel] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(24);
  const [filter, setFilter] = useState<"active" | "all">("active");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const activeCodes = guestCodes.filter(
    (g) => g.isActive && new Date(g.validUntil).getTime() > Date.now()
  );
  const expiredCodes = guestCodes.filter(
    (g) => !g.isActive || new Date(g.validUntil).getTime() <= Date.now()
  );
  const displayed = filter === "active" ? activeCodes : guestCodes;

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setPhone("");
    setSelectedDuration(24);
    setIsParcel(false);
  };

  const handleCreate = () => {
    if (!isParcel && (!firstName.trim() || !lastName.trim())) {
      Alert.alert("Required", "Please enter guest first and last name.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const validUntil = new Date(
      Date.now() + selectedDuration * 3600000
    ).toISOString();
    addGuestCode({
      guestFirstName: isParcel ? "Parcel" : firstName.trim(),
      guestLastName: isParcel ? "Delivery" : lastName.trim(),
      guestPhone: phone.trim(),
      isParcel,
      pinCode: "",
      validFrom: new Date().toISOString(),
      validUntil,
      usesTotal: isParcel ? 1 : 3,
      usesRemaining: isParcel ? 1 : 3,
      isActive: true,
    });
    setShowModal(false);
    resetForm();
  };

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
            Guest Access
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {activeCodes.length} active · {expiredCodes.length} expired
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

      {/* Filter tabs */}
      <View
        style={[
          styles.filterRow,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        {(["active", "all"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => {
              Haptics.selectionAsync();
              setFilter(f);
            }}
            style={[
              styles.filterTab,
              filter === f && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    filter === f ? colors.primary : colors.mutedForeground,
                },
              ]}
            >
              {f === "active" ? "Active" : "All Codes"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GuestCodeCard code={item} onDeactivate={deactivateGuestCode} />
        )}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 100,
          },
        ]}
        scrollEnabled={!!displayed.length}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No guest codes
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Tap + to create a guest access code
            </Text>
          </View>
        }
      />

      {/* Modal */}
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
          {/* Modal handle */}
          <View
            style={[styles.handle, { backgroundColor: colors.border }]}
          />

          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              New Guest Code
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

          {/* Type toggle */}
          <View
            style={[styles.typeRow, { backgroundColor: colors.muted, borderColor: colors.border }]}
          >
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setIsParcel(false);
              }}
              style={[
                styles.typeBtn,
                !isParcel && { backgroundColor: colors.card },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={16}
                color={!isParcel ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  {
                    color: !isParcel ? colors.primary : colors.mutedForeground,
                  },
                ]}
              >
                Guest
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setIsParcel(true);
              }}
              style={[
                styles.typeBtn,
                isParcel && { backgroundColor: colors.card },
              ]}
            >
              <Ionicons
                name="cube-outline"
                size={16}
                color={isParcel ? colors.amber : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  {
                    color: isParcel ? colors.amber : colors.mutedForeground,
                  },
                ]}
              >
                Parcel
              </Text>
            </TouchableOpacity>
          </View>

          {!isParcel && (
            <>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                FIRST NAME
              </Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="e.g. Sarah"
                placeholderTextColor={colors.mutedForeground}
                value={firstName}
                onChangeText={setFirstName}
                returnKeyType="next"
                autoCapitalize="words"
              />
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                LAST NAME
              </Text>
              <TextInput
                style={[styles.input, inputStyle]}
                placeholder="e.g. Thompson"
                placeholderTextColor={colors.mutedForeground}
                value={lastName}
                onChangeText={setLastName}
                returnKeyType="next"
                autoCapitalize="words"
              />
            </>
          )}

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            PHONE (OPTIONAL — FOR WHATSAPP CODE)
          </Text>
          <TextInput
            style={[styles.input, inputStyle]}
            placeholder="+27 82 000 0000"
            placeholderTextColor={colors.mutedForeground}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
            VALID FOR
          </Text>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.hours}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedDuration(opt.hours);
                }}
                style={[
                  styles.durationBtn,
                  {
                    backgroundColor:
                      selectedDuration === opt.hours
                        ? colors.primary
                        : colors.muted,
                    borderColor:
                      selectedDuration === opt.hours
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.durationText,
                    {
                      color:
                        selectedDuration === opt.hours
                          ? colors.navy
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Pressable
            onPress={handleCreate}
            style={({ pressed }) => [
              styles.createBtn,
              {
                backgroundColor: pressed ? colors.tealDark : colors.primary,
              },
            ]}
          >
            <Text style={[styles.createBtnText, { color: colors.navy }]}>
              Create Code
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
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
  },
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
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  filterTab: {
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  listContent: {
    padding: 20,
    paddingTop: 16,
  },
  empty: {
    alignItems: "center",
    gap: 10,
    paddingTop: 60,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
  modal: {
    padding: 20,
    paddingTop: 12,
  },
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
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  typeRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  typeBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  fieldLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 20,
  },
  durationRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 28,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  durationText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  createBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  createBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
