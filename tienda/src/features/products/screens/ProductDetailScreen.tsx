// src/features/products/screens/ProductDetailScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Product } from "../api/types";
import { isHttpUrl } from "../../../utils/format";

type RouteParams = {
  product: Product;
};

export default function ProductDetailScreen() {
  const route = useRoute<any>();
  const product = route.params?.product as Product | undefined;

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.meta}>No se pudo cargar el producto.</Text>
      </View>
    );
  }

  const hasMainImage = isHttpUrl(product.imgProd ?? undefined);
  const hasSealLogo = isHttpUrl(product.logoSello ?? undefined);
  const hasGfLogo = isHttpUrl(product.logoGf ?? undefined);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Imagen principal */}
      <View style={styles.imageWrapper}>
        {hasMainImage ? (
          <Image
            source={{ uri: product.imgProd as string }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Text style={styles.noImageText}>Sin imagen</Text>
          </View>
        )}
      </View>

      {/* Marca / Nombre */}
      <View style={styles.header}>
        {product.categoria ? (
          <Text style={styles.category}>{product.categoria}</Text>
        ) : null}
        {product.marca ? (
          <Text style={styles.brand}>{product.marca}</Text>
        ) : null}
        {product.detalle ? (
          <Text style={styles.title}>{product.detalle}</Text>
        ) : null}
      </View>

      {/* Sello + logos */}
      {(product.sello ||
        hasSealLogo ||
        hasGfLogo ||
        product.certifica ||
        product.pol) && (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Sello y certificación</Text>

          <View style={styles.sealRow}>
            {hasSealLogo && (
              <Image
                source={{ uri: product.logoSello as string }}
                style={styles.sealLogo}
                resizeMode="contain"
              />
            )}
            {product.sello ? (
              <View style={styles.sealPill}>
                <Text style={styles.sealText}>{product.sello}</Text>
              </View>
            ) : null}
            {hasGfLogo && (
              <Image
                source={{ uri: product.logoGf as string }}
                style={styles.gfLogo}
                resizeMode="contain"
              />
            )}
          </View>

          {product.certifica ? (
            <Text style={styles.meta}>
              <Text style={styles.label}>Certifica: </Text>
              {product.certifica}
            </Text>
          ) : null}

          {product.pol ? (
            <Text style={styles.meta}>
              <Text style={styles.label}>Política / ley: </Text>
              {product.pol}
            </Text>
          ) : null}
        </View>
      )}

      {/* Info GF / tienda / precio */}
      {(product.gf || product.tienda || product.pesaj) && (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Información del producto</Text>

          {product.gf ? (
            <Text style={styles.meta}>
              <Text style={styles.label}>GF: </Text>
              {product.gf}
            </Text>
          ) : null}
          {product.tienda ? (
            <Text style={styles.meta}>
              <Text style={styles.label}>Tienda: </Text>
              {product.tienda}
            </Text>
          ) : null}
          {product.pesaj && (
            <Text style={styles.meta}>
              <Text style={styles.label}>Precio / pesaj: </Text>
              {product.pesaj}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  imageWrapper: {
    width: "100%",
    height: 260,
    backgroundColor: "#f4f4f5",
  },
  image: {
    flex: 1,
  },
  noImage: {
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    color: "#9ca3af",
    fontSize: 13,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  category: {
    fontSize: 13,
    color: "#6b7280",
  },
  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  title: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  block: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  sealRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    columnGap: 8,
  },
  sealLogo: {
    width: 32,
    height: 32,
  },
  gfLogo: {
    width: 32,
    height: 32,
  },
  sealPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#eef2ff",
  },
  sealText: {
    fontSize: 12,
    color: "#4c1d95",
    fontWeight: "600",
  },
  label: {
    fontWeight: "600",
    color: "#111827",
  },
  meta: {
    fontSize: 14,
    color: "#374151",
    marginTop: 4,
  },
});
