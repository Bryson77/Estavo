import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Alert
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import ScreenHeader from "@/components/ScreenHeader";
import { apiClient } from "@/lib/api";

type LevyTransaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
};

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LevyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<LevyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";
  const subLabel = user
    ? `UNIT ${user.unitNumber?.toUpperCase()} · ${user.firstName?.toUpperCase()} ${user.lastName?.[0]?.toUpperCase()}.`
    : "RESIDENT";

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [accRes, transRes] = await Promise.all([
        apiClient.getLevyAccount(token),
        apiClient.getLevyTransactions(token)
      ]);
      setBalance(accRes.balance);
      setTransactions(transRes.transactions);
    } catch (err: any) {
      console.warn("Failed to load levies:", err);
    }
  }, [token]);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSeed = async () => {
    if (!token) return;
    setSeeding(true);
    try {
      await apiClient.seedLevyAccount(token);
      await loadData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to seed data");
    } finally {
      setSeeding(false);
    }
  };

  const handlePayNow = () => {
    Haptics.selectionAsync();
    Alert.alert(
      "Payment Options",
      "In-app payments are coming soon! Please use the EFT banking details provided on your statement.",
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Levies & Accounts" subtitle={subLabel} showAvatar initials={initials} />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  // If no transactions and 0 balance, show the empty state and a button to seed mock data.
  const isEmpty = balance === 0 && transactions.length === 0;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Levies & Accounts" subtitle={subLabel} showAvatar initials={initials} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        
        {/* ── Balance Card ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>CURRENT BALANCE</Text>
            <Text style={[styles.balanceAmount, { color: colors.foreground }]}>
              {balance !== null ? formatCurrency(balance) : "---"}
            </Text>
            
            <View style={styles.balanceActions}>
              <Pressable
                style={({ pressed }) => [styles.payBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
                onPress={handlePayNow}
              >
                <Ionicons name="card" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.payBtnText}>Pay Now</Text>
              </Pressable>
              
              <Pressable
                style={({ pressed }) => [styles.statementBtn, { backgroundColor: colors.muted, opacity: pressed ? 0.8 : 1 }]}
                onPress={() => Haptics.selectionAsync()}
              >
                <Ionicons name="document-text-outline" size={16} color={colors.foreground} style={{ marginRight: 6 }} />
                <Text style={[styles.statementBtnText, { color: colors.foreground }]}>Statement</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Transactions ── */}
        <View style={styles.transactionsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>TRANSACTION HISTORY</Text>
        </View>

        {isEmpty ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No transactions found for your unit.</Text>
            
            <Pressable
              style={[styles.seedBtn, { borderColor: colors.primary }]}
              onPress={handleSeed}
              disabled={seeding}
            >
              {seeding ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Text style={[styles.seedBtnText, { color: colors.primary }]}>Generate Mock Data</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((tx) => {
              const isPositive = tx.amount > 0;
              // In a levy context, a charge increases what you owe (positive amount).
              // A payment decreases what you owe (negative amount).
              const amountColor = isPositive ? colors.foreground : "#22C55E";
              const prefix = isPositive ? "" : "-";
              
              return (
                <View key={tx.id} style={[styles.txCard, { borderBottomColor: colors.border }]}>
                  <View style={[styles.txIconContainer, { backgroundColor: colors.muted }]}>
                    <Ionicons 
                      name={tx.type === 'payment' ? "arrow-down" : "arrow-up"} 
                      size={16} 
                      color={tx.type === 'payment' ? "#22C55E" : colors.mutedForeground} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.txDesc, { color: colors.foreground }]} numberOfLines={1}>
                      {tx.description}
                    </Text>
                    <Text style={[styles.txDate, { color: colors.mutedForeground }]}>
                      {formatDate(tx.createdAt)}
                    </Text>
                  </View>
                  <Text style={[styles.txAmount, { color: amountColor }]}>
                    {prefix}{formatCurrency(Math.abs(tx.amount))}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  
  // Balance Card
  balanceCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  balanceLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  balanceAmount: {
    fontFamily: "Inter_700Bold",
    fontSize: 40,
    marginBottom: 24,
  },
  balanceActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  payBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  payBtnText: {
    color: "#FFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  statementBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  statementBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  
  // Transactions
  transactionsHeader: {
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 1,
  },
  transactionsList: {
    paddingHorizontal: 16,
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  txDesc: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    marginBottom: 4,
  },
  txDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  txAmount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  seedBtn: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  seedBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  }
});
