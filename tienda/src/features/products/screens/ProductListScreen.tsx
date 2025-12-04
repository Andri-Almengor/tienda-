// src/features/products/screens/ProductListScreen.tsx
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  FlatList,
  View,
  Text,
  Alert,
  StyleSheet,
  Pressable,
  Platform,
  UIManager,
  LayoutAnimation,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";

import { ProductRepository } from "../data/ProductRepository";
import { useFavorites } from "@/lib/storage/favoritesStore";
import { ProductCard } from "../components/ProductCard";
import Card from "@/ui/Card";
import Input from "@/ui/Input";
import Button from "@/ui/Button";
import { useTheme } from "@/theme/ThemeProvider";

import type { Product } from "../api/types";
import { useProductFilters } from "../state/filterStore";
import { ProductFilterUtils } from "../data/ProductFilters";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProductListScreen() {
  const nav = useNavigation<any>();
  const fav = useFavorites();
  const { colors } = useTheme();

  // Estado de datos paginados
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store de filtros
  const filterStore = useProductFilters();
  const { setFilter, resetFilters } = filterStore;

  const [searchText, setSearchText] = useState(filterStore.search ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);


  
  const hasMore = products.length < total;

  const toggleFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFiltersOpen((prev) => !prev);
  };

  // Cargar primera página
  useEffect(() => {
    loadFirstPage();
  }, []);

  // Search → filtro global
  useEffect(() => {
    setFilter("search", searchText.trim());
  }, [searchText, setFilter]);

  const loadFirstPage = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      const res = await ProductRepository.listPaged(1, pageSize);
      setProducts(res.items);
      setTotal(res.total);
      setPage(res.page);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los productos.");
      Alert.alert("Error", "No se pudieron cargar los productos.");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
  if (loadingMore || initialLoading || !hasMore) return;

  try {
    setLoadingMore(true);
    const nextPage = page + 1;
    const res = await ProductRepository.listPaged(nextPage, pageSize);

    setProducts((prev) => {
      const ids = new Set(prev.map((p) => p.id));
      const nuevos = res.items.filter((p) => !ids.has(p.id));
      return [...prev, ...nuevos];
    });

    setTotal(res.total);
    setPage(res.page);
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "No se pudieron cargar más productos.");
  } finally {
    setLoadingMore(false);
  }
};


  const onRefresh = () => {
    setRefreshing(true);
    loadFirstPage();
  };

  // Objeto de filtros para el helper
  const filtersObj = useMemo(
  () => ({
    categoria: filterStore.categoria,
    marca: filterStore.marca,
    tienda: filterStore.tienda,
    gf: filterStore.gf,
    search: filterStore.search,
  }),
  [
    filterStore.categoria,
    filterStore.marca,
    filterStore.tienda,
    filterStore.gf,
    filterStore.search,
  ]
);


  // Aplicar filtros sobre los productos cargados
  const filteredProducts = useMemo(
    () => ProductFilterUtils.applyFilters(products, filtersObj),
    [products, filtersObj]
  );

  // Opciones para pickers (se calculan en base a lo que ya se cargó)
  const { categorias, marcas, tiendas, gfs } = useMemo(
    () => ProductFilterUtils.extractOptions(products),
    [products]
  );

  // Header de navegación
  useLayoutEffect(() => {
    nav.setOptions({
      headerTitle: "Productos",
      headerRight: () => (
        <Pressable
          onPress={() => nav.navigate("Favorites")}
          style={{ paddingHorizontal: 8 }}
        >
          <Ionicons
            name="heart-outline"
            size={22}
            color={colors.primaryText}
          />
        </Pressable>
      ),
    });
  }, [nav, colors.primaryText]);

  return (
    <View style={styles.container}>
      {/* BUSCADOR */}
      <View style={styles.searchRow}>
        <Input
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar por marca, detalle, tienda..."
          style={{ flex: 1 }}
          returnKeyType="search"
        />
        <Pressable onPress={toggleFilters} style={styles.filterIconBtn}>
          <Ionicons
            name={filtersOpen ? "options" : "options-outline"}
            size={20}
            color="#4B5563"
          />
        </Pressable>
      </View>

      {/* FILTROS AVANZADOS */}
      {filtersOpen && (
        <Card style={styles.filtersCard}>
          <Text style={styles.filtersTitle}>Filtros</Text>

          {/* Categoría */}
        {/* Categoría */}
          <Text style={styles.filterLabel}>Categoría</Text>
          <Picker
            selectedValue={filterStore.categoria ?? "Todas"}
            onValueChange={(value) => {
              const newVal = value === "Todas" ? undefined : (value as string);

              // guardamos en el store (por si lo quieres leer luego)
              setFilter("categoria", newVal);

              // y usamos la categoría como texto de búsqueda real
              if (newVal) {
                setSearchText(newVal);
              } else {
                setSearchText("");
              }
            }}
          >
            <Picker.Item label="Todas" value="Todas" />
            {categorias.map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>


          {/* Marca */}
          <Text style={styles.filterLabel}>Marca</Text>
          <Picker
            selectedValue={filterStore.marca ?? "Todas"}
            onValueChange={(value) =>
              setFilter("marca", value === "Todas" ? undefined : value)
            }
          >
            <Picker.Item label="Todas" value="Todas" />
            {marcas.map((m) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>

          {/* Tienda */}
          <Text style={styles.filterLabel}>Tienda</Text>
          <Picker
            selectedValue={filterStore.tienda ?? "Todas"}
            onValueChange={(value) =>
              setFilter("tienda", value === "Todas" ? undefined : value)
            }
          >
            <Picker.Item label="Todas" value="Todas" />
            {tiendas.map((t) => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>

          {/* GF */}
          <Text style={styles.filterLabel}>GF</Text>
          <Picker
            selectedValue={filterStore.gf ?? "Todas"}
            onValueChange={(value) =>
              setFilter("gf", value === "Todas" ? undefined : value)
            }
          >
            <Picker.Item label="Todas" value="Todas" />
            {gfs.map((g) => (
              <Picker.Item key={g} label={g} value={g} />
            ))}
          </Picker>

          <Button
            title="Limpiar filtros"
            variant="outline"
            onPress={() => {
              resetFilters();
              setSearchText("");
            }}
            style={{ marginTop: 8 }}
          />
        </Card>
      )}

      {/* LISTA DE PRODUCTOS */}
      {initialLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.helper}>Cargando productos...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.helper}>{error}</Text>
          <Button title="Reintentar" onPress={loadFirstPage} style={{ marginTop: 8 }} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              saved={fav.has(item.id)}
              onToggle={() => fav.toggle(item.id)}
              onPress={() => nav.navigate("ProductDetail", { product: item })}
            />
          )}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator />
                <Text style={styles.footerText}>Cargando más...</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.helper}>
                No se encontraron productos con los filtros actuales.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 12 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  helper: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  filterIconBtn: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  filtersCard: {
    marginBottom: 8,
    padding: 10,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 2,
    color: "#4B5563",
  },
  footerLoading: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },
});
