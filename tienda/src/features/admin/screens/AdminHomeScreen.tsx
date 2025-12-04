// src/features/admin/screens/AdminHomeScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AdminStackParamList } from "@/navigation/AdminNavigator";
import { useAuth } from "@/app/auth/authStore";

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { isAdmin, logout } = useAuth(); // 👈 si en tu store se llama signOut, cámbialo aquí

 if (!isAdmin()) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Zona de administración</Text>
      <Text style={styles.subtitle}>
        Esta sección es solo para administradores. Inicia sesión con tu cuenta
        de administrador.
      </Text>
    </SafeAreaView>
  );
}


  const go = (screen: keyof AdminStackParamList) => () =>
    navigation.navigate(screen);

  const handleLogout = () => {
    // Cambia logout() por signOut() si tu store tiene otro nombre
    logout?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Administrar</Text>
          <Text style={styles.headerSub}>Panel de control</Text>
        </View>

        <Pressable style={styles.logoutChip} onPress={handleLogout}>
          <Text style={styles.logoutChipText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Elige qué deseas gestionar en la aplicación.
      </Text>

      {/* Botones bonitos */}
      <View style={styles.cardsWrapper}>
        <Pressable style={[styles.card, styles.cardBlue]} onPress={go("AdminProducts")}>
          <View style={styles.cardIconCircle}>
            <Text style={styles.cardIconText}>📦</Text>
          </View>
          <Text style={styles.cardTitle}>Productos</Text>
          <Text style={styles.cardDesc}>
            Ver, agregar y actualizar el catálogo.
          </Text>
        </Pressable>

        <Pressable style={[styles.card, styles.cardGreen]} onPress={go("AdminUsers")}>
          <View style={styles.cardIconCircle}>
            <Text style={styles.cardIconText}>👥</Text>
          </View>
          <Text style={styles.cardTitle}>Usuarios</Text>
          <Text style={styles.cardDesc}>
            Crear y administrar cuentas de administradores.
          </Text>
        </Pressable>

        <Pressable style={[styles.card, styles.cardPurple]} onPress={go("AdminNews")}>
          <View style={styles.cardIconCircle}>
            <Text style={styles.cardIconText}>📰</Text>
          </View>
          <Text style={styles.cardTitle}>Noticias</Text>
          <Text style={styles.cardDesc}>
            Publicar avisos, noticias y compartir enlaces.
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  headerSub: {
    fontSize: 13,
    color: "#6b7280",
  },
  logoutChip: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  logoutChipText: {
    color: "#f9fafb",
    fontSize: 12,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },
  cardsWrapper: {
    flex: 1,
    gap: 14,
    paddingVertical: 6,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#111827",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardBlue: {
    backgroundColor: "#0f172a",
  },
  cardGreen: {
    backgroundColor: "#064e3b",
  },
  cardPurple: {
    backgroundColor: "#4c1d95",
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardIconText: {
    fontSize: 20,
  },
  cardTitle: {
    color: "#f9fafb",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardDesc: {
    color: "#e5e7eb",
    fontSize: 13,
  },
});
