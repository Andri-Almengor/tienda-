// src/features/admin/screens/AdminNewsScreen.tsx
import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Pressable,
  TextInput,
  Alert,
  Linking,
  ScrollView,
} from "react-native";
import { useAuth } from "@/app/auth/authStore";
import {
  getNoticias,
  crearNoticia,
  actualizarNoticia,
  eliminarNoticia,
  type Noticia,
} from "@/features/news/newsApi";

export default function AdminNewsScreen() {
  const { isAdmin } = useAuth();

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const cargarNoticias = async () => {
    try {
      setLoading(true);
      const data = await getNoticias();
      setNoticias(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudieron cargar las noticias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNoticias();
  }, []);

  const resetForm = () => {
    setTitulo("");
    setContenido("");
    setImageUrl("");
    setFileUrl("");
    setEditingNoticia(null);
  };

  const handleGuardar = async () => {
    try {
      if (!titulo.trim()) {
        Alert.alert("Campos requeridos", "El título es obligatorio.");
        return;
      }
      setSaving(true);

      const payload = {
        titulo: titulo.trim(),
        contenido: contenido.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        fileUrl: fileUrl.trim() || undefined,
      };

      if (editingNoticia) {
        const actualizada = await actualizarNoticia(editingNoticia.id, payload);
        setNoticias((prev) =>
          prev.map((n) => (n.id === actualizada.id ? actualizada : n))
        );
        Alert.alert("Listo", "Noticia actualizada correctamente.");
      } else {
        const nueva = await crearNoticia(payload);
        setNoticias((prev) => [nueva, ...prev]);
        Alert.alert("Listo", "Noticia creada correctamente.");
      }

      resetForm();
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Error",
        err?.response?.data?.message ?? "No se pudo guardar la noticia"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditarClick = (noticia: Noticia) => {
    setEditingNoticia(noticia);
    setTitulo(noticia.titulo);
    setContenido(noticia.contenido ?? "");
    setImageUrl(noticia.imageUrl ?? "");
    setFileUrl(noticia.fileUrl ?? "");
    setFormOpen(true);
  };

  const handleEliminar = (id: number) => {
    Alert.alert("Eliminar noticia", "¿Seguro que deseas eliminar esta noticia?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await eliminarNoticia(id);
            setNoticias((prev) => prev.filter((n) => n.id !== id));
            if (editingNoticia && editingNoticia.id === id) {
              resetForm();
            }
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "No se pudo eliminar la noticia.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Noticia }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.titulo}</Text>

      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      {item.contenido ? (
        <Text style={styles.body}>{item.contenido}</Text>
      ) : null}

      {item.fileUrl ? (
        <Pressable onPress={() => Linking.openURL(item.fileUrl!)}>
          <Text style={styles.link}>📎 Ver archivo</Text>
        </Pressable>
      ) : null}

      <Text style={styles.meta}>
        {new Date(item.creadoEn).toLocaleString()}
      </Text>

      {isAdmin() && (
        <View style={styles.adminActions}>
          <Pressable
            style={[styles.smallBtn, { backgroundColor: "#4f46e5" }]}
            onPress={() => handleEditarClick(item)}
          >
            <Text style={styles.smallBtnText}>Editar</Text>
          </Pressable>
          <Pressable
            style={[styles.smallBtn, { backgroundColor: "#ef4444" }]}
            onPress={() => handleEliminar(item.id)}
          >
            <Text style={styles.smallBtnText}>Eliminar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  if (!isAdmin()) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Solo administradores</Text>
        <Text style={styles.meta}>
          Inicia sesión como administrador para gestionar noticias.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.adminCard}>
        <Pressable
          style={styles.adminHeader}
          onPress={() => setFormOpen((prev) => !prev)}
        >
          <Text style={styles.sectionTitle}>
            {editingNoticia ? "Editar noticia" : "Crear noticia"}
          </Text>
          <Text style={styles.headerToggle}>{formOpen ? "▲" : "▼"}</Text>
        </Pressable>

        {formOpen && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Título"
              value={titulo}
              onChangeText={setTitulo}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Contenido (opcional)"
              multiline
              value={contenido}
              onChangeText={setContenido}
            />
            <TextInput
              style={styles.input}
              placeholder="URL de imagen (opcional)"
              autoCapitalize="none"
              value={imageUrl}
              onChangeText={setImageUrl}
            />
            <TextInput
              style={styles.input}
              placeholder="URL de archivo/documento (opcional)"
              autoCapitalize="none"
              value={fileUrl}
              onChangeText={setFileUrl}
            />

            <Pressable
              style={[
                styles.btn,
                { backgroundColor: "#22c55e", opacity: saving ? 0.7 : 1 },
              ]}
              onPress={handleGuardar}
              disabled={saving}
            >
              <Text style={styles.btnText}>
                {editingNoticia ? "Guardar cambios" : "Publicar noticia"}
              </Text>
            </Pressable>

            {editingNoticia && (
              <Pressable
                style={[styles.btn, { backgroundColor: "#6b7280", marginTop: 8 }]}
                onPress={resetForm}
                disabled={saving}
              >
                <Text style={styles.btnText}>Cancelar edición</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={noticias}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={{ color: "#6b7280", marginTop: 16 }}>
              No hay noticias todavía.
            </Text>
          }
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 12 },
  adminCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 8,
    backgroundColor: "#f9fafb",
    marginBottom: 12,
  },
  adminHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  headerToggle: { fontSize: 18, color: "#6b7280" },
  form: { marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  btn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: "#fff", fontWeight: "700" },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  body: { fontSize: 14, color: "#374151", marginTop: 4 },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  link: {
    color: "#2563eb",
    marginTop: 6,
    fontWeight: "600",
  },
  meta: { fontSize: 11, color: "#9ca3af", marginTop: 4 },
  adminActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 8,
  },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  smallBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
