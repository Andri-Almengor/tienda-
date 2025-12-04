// src/features/admin/screens/AdminProductsScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Platform,
  UIManager,
  LayoutAnimation,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";

import { useAuth } from "@/app/auth/authStore";
import { useTheme } from "@/theme/ThemeProvider";
import Input from "@/ui/Input";
import Button from "@/ui/Button";
import Card from "@/ui/Card";
import { api } from "@/lib/api/client";

import type { Product } from "@/features/products/api/types";
import { ProductRepository } from "@/features/products/data/ProductRepository";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type EditableProduct = Product;

export default function AdminProductsScreen() {
  const nav = useNavigation<any>();
  const { isAdmin } = useAuth();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [editingMap, setEditingMap] = useState<Record<string, EditableProduct>>(
    {}
  );
  const [newProduct, setNewProduct] = useState<EditableProduct>({
    id: "",
    categoria: "",
    marca: "",
    detalle: "",
    imgProd: null,
    sello: null,
    certifica: null,
    pol: null,
    logoSello: null,
    gf: null,
    logoGf: null,
    tienda: null,
    pesaj: null,
  });

  useEffect(() => {
    nav.setOptions({
      headerTitle: "Admin productos",
    });
  }, [nav]);

  useEffect(() => {
    if (!isAdmin()) return;
    loadProducts();
  }, [isAdmin]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const items = await ProductRepository.list();
      setProducts(items);
      setEditingMap({});
      setExpandedId(null);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));

    // Inicializar copia editable si no existe
    setEditingMap((prev) => {
      if (prev[id]) return prev;
      const original = products.find((p) => p.id === id);
      if (!original) return prev;
      return {
        ...prev,
        [id]: { ...original },
      };
    });
  };

  const handleEditField = (
    id: string,
    field: keyof EditableProduct,
    value: string
  ) => {
    setEditingMap((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || (products.find((p) => p.id === id) as Product)),
        [field]: value,
      },
    }));
  };

  const handleSave = async (id: string) => {
    const editable = editingMap[id];
    if (!editable) return;

    try {
      setSaving(true);

      await api.put(`/admin/productos/${id}`, {
        categoria: editable.categoria,
        marca: editable.marca,
        detalle: editable.detalle,
        imgProd: editable.imgProd,
        sello: editable.sello,
        certifica: editable.certifica,
        pol: editable.pol,
        logoSello: editable.logoSello,
        gf: editable.gf,
        logoGf: editable.logoGf,
        tienda: editable.tienda,
        pesaj: editable.pesaj,
      });

      Alert.alert("Guardado", "Producto actualizado correctamente.");
      await loadProducts();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Eliminar producto",
      "¿Seguro que deseas eliminar este producto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              await api.delete(`/admin/productos/${id}`);
              Alert.alert("Eliminado", "Producto eliminado correctamente.");
              await loadProducts();
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "No se pudo eliminar el producto.");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleNewField = (field: keyof EditableProduct, value: string) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreate = async () => {
    if (!newProduct.marca || !newProduct.categoria) {
      Alert.alert("Validación", "Marca y categoría son obligatorias.");
      return;
    }

    try {
      setSaving(true);
      await api.post("/admin/productos", {
        categoria: newProduct.categoria,
        marca: newProduct.marca,
        detalle: newProduct.detalle,
        imgProd: newProduct.imgProd,
        sello: newProduct.sello,
        certifica: newProduct.certifica,
        pol: newProduct.pol,
        logoSello: newProduct.logoSello,
        gf: newProduct.gf,
        logoGf: newProduct.logoGf,
        tienda: newProduct.tienda,
        pesaj: newProduct.pesaj,
      });

      Alert.alert("Creado", "Producto creado correctamente.");
      setNewProduct({
        id: "",
        categoria: "",
        marca: "",
        detalle: "",
        imgProd: null,
        sello: null,
        certifica: null,
        pol: null,
        logoSello: null,
        gf: null,
        logoGf: null,
        tienda: null,
        pesaj: null,
      });
      setNewFormOpen(false);
      await loadProducts();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo crear el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleImportExcel = async () => {
    try {
      setImporting(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          "application/vnd.ms-excel", // .xls
          "application/octet-stream", // por si algunos dispositivos lo reportan así
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setImporting(false);
        return;
      }

      const asset = result.assets[0];
      if (!asset || !asset.uri) {
        setImporting(false);
        Alert.alert("Error", "No se pudo obtener el archivo seleccionado.");
        return;
      }

      const uri = asset.uri;
      const name = asset.name || "productos.xlsx";
      const mimeType =
        asset.mimeType ||
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      const formData = new FormData();
      formData.append("file", {
        uri,
        name,
        type: mimeType,
      } as any); // `as any` para evitar problemas de tipos en TS/React Native

      await api.post("/admin/productos/import-excel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Importación", "Archivo importado correctamente.");
      await loadProducts();
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Error",
        "No se pudo importar el archivo. Verifica el formato del Excel."
      );
    } finally {
      setImporting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const s = searchText.trim().toLowerCase();
    if (!s) return products;

    return products.filter((p) => {
      const marca = (p.marca ?? "").toLowerCase();
      const detalle = (p.detalle ?? "").toLowerCase();
      const tienda = (p.tienda ?? "").toLowerCase();
      const categoria = (p.categoria ?? "").toLowerCase();
      const gf = (p.gf ?? "").toLowerCase();

      return (
        marca.includes(s) ||
        detalle.includes(s) ||
        tienda.includes(s) ||
        categoria.includes(s) ||
        gf.includes(s)
      );
    });
  }, [products, searchText]);

  if (!isAdmin()) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Solo administradores</Text>
        <Text style={styles.subtitle}>
          Inicia sesión con una cuenta de administrador para acceder a esta
          sección.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.subtitle}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item, index) =>
          item.id ? String(item.id) : String(index)
        }
        contentContainerStyle={{ paddingBottom: 16 }}
        ListHeaderComponent={
          <>
            {/* BUSCADOR + BOTONES */}
            <View style={styles.searchRow}>
              <Input
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Buscar por marca, detalle, tienda..."
                style={{ flex: 1 }}
                returnKeyType="search"
              />
              <Pressable
                style={styles.iconBtn}
                onPress={loadProducts}
                disabled={loading}
              >
                <Ionicons
                  name="refresh-outline"
                  size={20}
                  color={loading ? "#9CA3AF" : "#4B5563"}
                />
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                onPress={handleImportExcel}
                disabled={importing}
              >
                {importing ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={20} color="#4B5563" />
                )}
              </Pressable>
            </View>

            {/* FORMULARIO NUEVO PRODUCTO (DESPLEGABLE) */}
            <Card style={styles.newCard}>
              <Pressable
                style={styles.newHeader}
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut
                  );
                  setNewFormOpen((prev) => !prev);
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name={newFormOpen ? "chevron-down" : "chevron-forward"}
                    size={18}
                    color="#4B5563"
                  />
                  <Text style={styles.newTitle}>Crear nuevo producto</Text>
                </View>
                {saving && <ActivityIndicator size="small" />}
              </Pressable>

              {newFormOpen && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.label}>Categoría</Text>
                  <Input
                    value={newProduct.categoria}
                    onChangeText={(t) => handleNewField("categoria", t)}
                    placeholder="Categoría"
                  />

                  <Text style={styles.label}>Marca</Text>
                  <Input
                    value={newProduct.marca}
                    onChangeText={(t) => handleNewField("marca", t)}
                    placeholder="Marca"
                  />

                  <Text style={styles.label}>Detalle / Presentación</Text>
                  <Input
                    value={newProduct.detalle ?? ""}
                    onChangeText={(t) => handleNewField("detalle", t)}
                    placeholder="Detalle del producto"
                  />

                  <Text style={styles.label}>URL imagen producto</Text>
                  <Input
                    value={newProduct.imgProd ?? ""}
                    onChangeText={(t) => handleNewField("imgProd", t)}
                    placeholder="https://..."
                  />

                  <Text style={styles.label}>Sello</Text>
                  <Input
                    value={newProduct.sello ?? ""}
                    onChangeText={(t) => handleNewField("sello", t)}
                    placeholder="Sí / No / Otro"
                  />

                  <Text style={styles.label}>Certificado</Text>
                  <Input
                    value={newProduct.certifica ?? ""}
                    onChangeText={(t) => handleNewField("certifica", t)}
                    placeholder="Certificación"
                  />

                  <Text style={styles.label}>Status / POL</Text>
                  <Input
                    value={newProduct.pol ?? ""}
                    onChangeText={(t) => handleNewField("pol", t)}
                    placeholder="Estado"
                  />

                  <Text style={styles.label}>Logo sello (URL)</Text>
                  <Input
                    value={newProduct.logoSello ?? ""}
                    onChangeText={(t) => handleNewField("logoSello", t)}
                    placeholder="https://..."
                  />

                  <Text style={styles.label}>GF</Text>
                  <Input
                    value={newProduct.gf ?? ""}
                    onChangeText={(t) => handleNewField("gf", t)}
                    placeholder="GF"
                  />

                  <Text style={styles.label}>Logo GF (URL)</Text>
                  <Input
                    value={newProduct.logoGf ?? ""}
                    onChangeText={(t) => handleNewField("logoGf", t)}
                    placeholder="https://..."
                  />

                  <Text style={styles.label}>Tienda</Text>
                  <Input
                    value={newProduct.tienda ?? ""}
                    onChangeText={(t) => handleNewField("tienda", t)}
                    placeholder="Nombre de tienda"
                  />

                  <Text style={styles.label}>Pesaj / Marca Pesaj</Text>
                  <Input
                    value={newProduct.pesaj ?? ""}
                    onChangeText={(t) => handleNewField("pesaj", t)}
                    placeholder="Pesaj"
                  />

                  <Button
                    title="Crear producto"
                    onPress={handleCreate}
                    disabled={saving}
                    style={{ marginTop: 10 }}
                  />
                </View>
              )}
            </Card>
          </>
        }
        renderItem={({ item }) => {
          const isExpanded = expandedId === item.id;
          const editable = editingMap[item.id] || item;

          return (
            <Card style={styles.itemCard}>
              {/* HEADER RESUMEN */}
              <Pressable
                style={styles.itemHeader}
                onPress={() => handleToggleExpand(item.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>
                    {item.marca} {item.detalle ? `- ${item.detalle}` : ""}
                  </Text>
                  <Text style={styles.itemSub}>
                    {item.tienda ?? "Sin tienda"} · ID #{item.id}
                  </Text>
                </View>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#4B5563"
                />
              </Pressable>

              {/* FORMULARIO DESPLEGABLE */}
              {isExpanded && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.label}>Categoría</Text>
                  <Input
                    value={editable.categoria}
                    onChangeText={(t) =>
                      handleEditField(item.id, "categoria", t)
                    }
                  />

                  <Text style={styles.label}>Marca</Text>
                  <Input
                    value={editable.marca}
                    onChangeText={(t) =>
                      handleEditField(item.id, "marca", t)
                    }
                  />

                  <Text style={styles.label}>Detalle / Presentación</Text>
                  <Input
                    value={editable.detalle ?? ""}
                    onChangeText={(t) =>
                      handleEditField(item.id, "detalle", t)
                    }
                  />

                  <Text style={styles.label}>URL imagen producto</Text>
                  <Input
                    value={editable.imgProd ?? ""}
                    onChangeText={(t) =>
                      handleEditField(item.id, "imgProd", t)
                    }
                  />

                  <Text style={styles.label}>Sello</Text>
                  <Input
                    value={editable.sello ?? ""}
                    onChangeText={(t) =>
                      handleEditField(item.id, "sello", t)
                    }
                  />

                  <Text style={styles.label}>Certificado</Text>
                  <Input
                    value={editable.certifica ?? ""}
                    onChangeText={(t) =>
                      handleEditField(item.id, "certifica", t)
                    }
                  />

                  <Text style={styles.label}>Status / POL</Text>
                  <Input
                    value={editable.pol ?? ""}
                    onChangeText={(t) => handleEditField(item.id, "pol", t)}
                  />

                  <Text style={styles.label}>Logo sello (URL)</Text>
                  <Input
                    value={editable.logoSello ?? ""}
                    onChangeText={(t) =>
                      handleEditField(item.id, "logoSello", t)
                    }
                  />

                  <Text style={styles.label}>GF</Text>
                  <Input
                    value={editable.gf ?? ""}
                    onChangeText={(t) => handleEditField(item.id, "gf", t)}
                  />

                  <Text style={styles.label}>Logo GF (URL)</Text>
                  <Input
                    value={editable.logoGf ?? ""}
                    onChangeText={(t) =>
                      handleEditField(item.id, "logoGf", t)
                    }
                  />

                  <Text style={styles.label}>Tienda</Text>
                  <Input
                    value={editable.tienda ?? ""}
                    onChangeText={(t) =>
                      handleEditField(item.id, "tienda", t)
                    }
                  />

                  <Text style={styles.label}>Pesaj / Marca Pesaj</Text>
                  <Input
                    value={editable.pesaj ?? ""}
                    onChangeText={(t) =>
                      handleEditField(item.id, "pesaj", t)
                    }
                  />

                  <View style={styles.rowButtons}>
                    <Button
                      title="Guardar"
                      onPress={() => handleSave(item.id)}
                      disabled={saving}
                      style={{ flex: 1, marginRight: 6 }}
                    />
                    <Button
                      title="Eliminar"
                      variant="outline"
                      onPress={() => handleDelete(item.id)}
                      style={{ flex: 1, marginLeft: 6 }}
                    />
                  </View>
                </View>
              )}
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", padding: 12 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  newCard: {
    marginBottom: 10,
    padding: 10,
  },
  newHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newTitle: {
    marginLeft: 4,
    fontSize: 15,
    fontWeight: "600",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 6,
    marginBottom: 2,
  },
  itemCard: {
    marginBottom: 10,
    padding: 10,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemSub: {
    fontSize: 12,
    color: "#6B7280",
  },
  rowButtons: {
    flexDirection: "row",
    marginTop: 10,
  },
});
