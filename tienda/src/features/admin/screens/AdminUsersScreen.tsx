// src/features/admin/screens/AdminUsersScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { api } from "@/lib/api/client";
import { useAuth } from "@/app/auth/authStore";

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol?: { nombre: string } | null;
  activo?: boolean;
};

export default function AdminUsersScreen() {
  const { isAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoPass, setNuevoPass] = useState("");

  const [saving, setSaving] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Usuario[]>("/admin/usuarios");
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarUsuarios();
  }, []);

  const resetForm = () => {
    setNuevoNombre("");
    setNuevoEmail("");
    setNuevoPass("");
    setEditingUserId(null);
  };

  const handleSubmit = async () => {
    if (!nuevoNombre || !nuevoEmail) {
      Alert.alert("Campos requeridos", "Completa nombre y correo.");
      return;
    }

    try {
      setSaving(true);

      if (editingUserId !== null) {
        // EDITAR
        const payload: any = {
          nombre: nuevoNombre,
          email: nuevoEmail,
        };
        if (nuevoPass) {
          payload.password = nuevoPass;
        }

        const { data } = await api.put<Usuario>(
          `/admin/usuarios/${editingUserId}`,
          payload
        );

        setUsuarios((prev) =>
          prev.map((u) => (u.id === editingUserId ? data : u))
        );
        Alert.alert("Listo", "Usuario actualizado correctamente.");
      } else {
        // CREAR
        if (!nuevoPass) {
          Alert.alert(
            "Contraseña requerida",
            "Para crear un administrador debes definir una contraseña."
          );
          setSaving(false);
          return;
        }

        await api.post("/admin/usuarios", {
          nombre: nuevoNombre,
          email: nuevoEmail,
          password: nuevoPass,
        });

        Alert.alert("Listo", "Administrador creado correctamente.");
        await cargarUsuarios();
      }

      resetForm();
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Error",
        err?.response?.data?.message ?? "No se pudo guardar el usuario."
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditUser = (u: Usuario) => {
    setEditingUserId(u.id);
    setNuevoNombre(u.nombre);
    setNuevoEmail(u.email);
    setNuevoPass("");
  };

  const deleteUser = (u: Usuario) => {
    Alert.alert(
      "Eliminar usuario",
      `¿Seguro que deseas eliminar a "${u.nombre}" (${u.email})?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/admin/usuarios/${u.id}`);
              setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
            } catch (err) {
              console.error(err);
              Alert.alert(
                "Error",
                "No se pudo eliminar el usuario. Intenta de nuevo."
              );
            }
          },
        },
      ]
    );
  };

  if (!isAdmin()) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text style={styles.title}>Solo administradores</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator />
      </View>
    );
  }

  const isEditing = editingUserId !== null;

  return (
    <FlatList
      style={styles.container}
      data={usuarios}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>Usuarios administradores</Text>

          {/* FORM CREAR / EDITAR */}
          <View style={styles.formCard}>
            <Text style={styles.subtitle}>
              {isEditing ? "Editar administrador" : "Crear nuevo administrador"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo"
              autoCapitalize="none"
              keyboardType="email-address"
              value={nuevoEmail}
              onChangeText={setNuevoEmail}
            />
            <TextInput
              style={styles.input}
              placeholder={
                isEditing
                  ? "Nueva contraseña (opcional)"
                  : "Contraseña (requerida)"
              }
              secureTextEntry
              value={nuevoPass}
              onChangeText={setNuevoPass}
            />

            <Pressable
              style={[
                styles.btn,
                { backgroundColor: "#22c55e", marginTop: 8 },
                saving && styles.btnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={saving}
            >
              <Text style={styles.btnText}>
                {saving
                  ? "Guardando..."
                  : isEditing
                  ? "Guardar cambios"
                  : "Crear admin"}
              </Text>
            </Pressable>

            {isEditing && (
              <Pressable
                style={[styles.btn, styles.cancelBtn]}
                onPress={resetForm}
                disabled={saving}
              >
                <Text style={[styles.btnText, { color: "#111827" }]}>
                  Cancelar edición
                </Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.listTitle}>Administradores actuales</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.nombre}</Text>
            <Text style={styles.meta}>{item.email}</Text>
            <Text style={styles.meta}>
              Rol: {item.rol?.nombre ?? "sin rol"}
            </Text>
            <Text style={styles.meta}>
              Estado: {item.activo === false ? "Desactivado" : "Activo"}
            </Text>
          </View>

          <View style={styles.actionsCol}>
            <Pressable
              style={[styles.smallBtn, styles.editBtn]}
              onPress={() => startEditUser(item)}
            >
              <Text style={styles.smallBtnText}>Editar</Text>
            </Pressable>
            <Pressable
              style={[styles.smallBtn, styles.deleteBtn]}
              onPress={() => deleteUser(item)}
            >
              <Text style={styles.smallBtnText}>Eliminar</Text>
            </Pressable>
          </View>
        </View>
      )}
      contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
      ListEmptyComponent={
        <Text style={styles.meta}>No hay usuarios administradores.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8, paddingHorizontal: 12 },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 8,
    marginBottom: 6,
    marginHorizontal: 12,
    backgroundColor: "#fff",
  },
  name: { fontWeight: "700" },
  meta: { fontSize: 12, color: "#6b7280" },
  formCard: {
    marginTop: 8,
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  subtitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  btn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelBtn: {
    marginTop: 8,
    backgroundColor: "#e5e7eb",
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  actionsCol: {
    marginLeft: 8,
    alignItems: "flex-end",
    justifyContent: "center",
    rowGap: 4,
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  editBtn: {
    backgroundColor: "#e0f2fe",
  },
  deleteBtn: {
    backgroundColor: "#fee2e2",
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111827",
  },
});
