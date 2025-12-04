// src/app/auth/LoginScreen.tsx
import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useAuth } from "./authStore";

export default function LoginScreen() {
  const { user, role, login, logout, isAdmin } = useAuth();

  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Campos requeridos", "Ingresa correo y contraseña.");
        return;
      }

      await login(email, password);
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Error",
        err?.response?.data?.message ?? "No se pudo iniciar sesión"
      );
    }
  };

  // ───────────────── PERFIL ─────────────────
  if (user) {
    return (
      <View style={s.container}>
        <Text style={s.title}>
          {isAdmin() ? "Perfil administrador" : "Perfil"}
        </Text>
        <Text style={s.meta}>Nombre: {user.name}</Text>
        <Text style={s.meta}>Email: {user.email}</Text>
        <Text style={s.meta}>Rol: {role}</Text>

        <Pressable
          style={[s.btn, { backgroundColor: "#e11d48", marginTop: 16 }]}
          onPress={logout}
        >
          <Text style={s.btnText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    );
  }

  // ───────────────── LOGIN ─────────────────
  return (
    <View style={s.container}>
      <Text style={s.title}>Iniciar sesión</Text>

      <TextInput
        style={s.input}
        placeholder="Correo"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={s.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={[s.btn, { backgroundColor: "#4f46e5", marginTop: 8 }]}
        onPress={handleLogin}
      >
        <Text style={s.btnText}>Iniciar sesión</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  meta: { color: "#4b5563", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  btn: { paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
