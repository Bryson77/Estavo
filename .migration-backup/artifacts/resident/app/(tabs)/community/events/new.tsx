import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import ScreenHeader from "@/components/ScreenHeader";

export default function CreateEventScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="New Event" showBack />
      <View style={styles.body}>
        <Text style={[styles.text, { color: colors.foreground }]}>Create event form will appear here.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 16 },
});
