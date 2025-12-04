// src/features/news/screens/NewsListScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Linking,
} from "react-native";
import { getNoticias, type Noticia } from "../newsApi";

export default function NewsListScreen() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarNoticias = async () => {
    try {
      setLoading(true);
      const data = await getNoticias();
      setNoticias(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNoticias();
  }, []);

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
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={noticias}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ color: "#6b7280" }}>No hay noticias todavía.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 12 },
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
});
