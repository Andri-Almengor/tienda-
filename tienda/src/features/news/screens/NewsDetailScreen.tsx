import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";

type Params = {
  id?: string;
  title?: string;
  body?: string;
  createdAt?: string; // ISO u otro texto
  author?: string;
  category?: string;
};

export default function NewsDetailScreen() {
  const route = useRoute<any>();
  const p: Params = route.params ?? {};

  const title = p.title ?? "Noticia";
  const body = p.body ?? "Sin contenido.";
  const when =
    p.createdAt ? new Date(p.createdAt).toLocaleString() : "Fecha no disponible";
  const meta = [p.author, p.category].filter(Boolean).join(" · ");

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.meta}>{when}{meta ? ` · ${meta}` : ""}</Text>
      <Text style={s.body}>{body}</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "800", color: "#111" },
  meta: { marginTop: 6, color: "#6B7280" },
  body: { marginTop: 14, fontSize: 16, lineHeight: 22, color: "#111" },
});
