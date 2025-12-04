import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useAuth } from "./authStore";

export default function LoginScreen() {
  const { user, role, loginAs, logout } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");

  if (user) {
    return (
      <View style={s.container}>
        <Text style={s.title}>Perfil</Text>
        <Text style={s.meta}>Email: {user.email}</Text>
        <Text style={s.meta}>Rol: {user.role}</Text>

        <Pressable style={[s.btn, { backgroundColor: "#111" }]} onPress={logout}>
          <Text style={s.btnText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Iniciar sesión</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="tu@correo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        style={s.input}
      />
      <View style={{ height: 8 }} />
      <Pressable style={[s.btn, { backgroundColor: "#111" }]} onPress={() => loginAs(email || "anon@local", "user")}>
        <Text style={s.btnText}>Entrar como Usuario</Text>
      </Pressable>
      <View style={{ height: 8 }} />
      <Pressable style={[s.btn, { backgroundColor: "#0a7d44" }]} onPress={() => loginAs(email || "admin@local", "admin")}>
        <Text style={s.btnText}>Entrar como Admin</Text>
      </Pressable>
      <Text style={{ color: "#666", marginTop: 10, fontSize: 12 }}>
        (Local-only por ahora. Cuando conectemos API, esto validará credenciales reales y roles del servidor.)
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  meta: { color: "#333", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  btn: { paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" }
});
