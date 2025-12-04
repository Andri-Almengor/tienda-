// src/app/AppNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import ProductListScreen from "../features/products/screens/ProductListScreen";
import ProductDetailScreen from "../features/products/screens/ProductDetailScreen";
import StoreMapScreen from "../features/stores/screens/StoreMapScreen";
import FavoritesScreen from "../features/products/screens/FavoritesScreen";
import LoginScreen from "./auth/LoginScreen";
import { useAuth } from "./auth/authStore";
import AdminManageScreen from "../features/products/screens/AdminManageScreen";
import AdminEditScreen from "../features/products/screens/AdminEditScreen";
import NewsListScreen from "../features/news/screens/NewsListScreen";
import { AdminNavigator } from "@/navigation/AdminNavigator";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const headerCommon: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: "#fff" },
  headerTitleStyle: { fontSize: 18, fontWeight: "700", color: "#111" },
  headerShadowVisible: true,
};

function ProductsStack() {
  return (
    <Stack.Navigator screenOptions={headerCommon}>
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: "Productos" }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Detalle" }}
      />
    </Stack.Navigator>
  );
}

function StoresStack() {
  return (
    <Stack.Navigator screenOptions={headerCommon}>
      <Stack.Screen
        name="StoreMap"
        component={StoreMapScreen}
        options={{ title: "Tiendas" }}
      />
    </Stack.Navigator>
  );
}

function FavoritesStack() {
  return (
    <Stack.Navigator screenOptions={headerCommon}>
      <Stack.Screen
        name="Favs"
        component={FavoritesScreen}
        options={{ title: "Guardados" }}
      />
      <Stack.Screen
        name="FavDetail"
        component={ProductDetailScreen}
        options={{ title: "Detalle" }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={headerCommon}>
      <Stack.Screen
        name="Profile"
        component={LoginScreen}
        options={{ title: "Perfil administrador" }}
      />
    </Stack.Navigator>
  );
}

// Si todavía usas AdminManageScreen/AdminEditScreen para algo:
function AdminProductsStack() {
  return (
    <Stack.Navigator screenOptions={headerCommon}>
      <Stack.Screen
        name="AdminManage"
        component={AdminManageScreen}
        options={{ title: "Administrar productos" }}
      />
      <Stack.Screen
        name="AdminEdit"
        component={AdminEditScreen}
        options={{ title: "Producto" }}
      />
    </Stack.Navigator>
  );
}

function NewsStack() {
  return (
    <Stack.Navigator screenOptions={headerCommon}>
      <Stack.Screen
        name="News"
        component={NewsListScreen}
        options={{ title: "Noticias" }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 12);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const iconMap: Record<
          string,
          React.ComponentProps<typeof Ionicons>["name"]
        > = {
          Productos: "list-outline",
          Tiendas: "map-outline",
          Guardados: "heart-outline",
          Noticias: "newspaper-outline",
          Perfil: "person-outline",
          Admin: "construct-outline",
        };
        return {
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: "#fff",
            height: 56 + bottom,
            paddingBottom: bottom,
            paddingTop: 6,
            borderTopWidth: 0.5,
            borderTopColor: "#ECECEC",
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={iconMap[route.name] ?? "ellipse-outline"}
              size={size}
              color={color}
            />
          ),
        };
      }}
    >
      <Tab.Screen name="Productos" component={ProductsStack} />
      <Tab.Screen name="Tiendas" component={StoresStack} />
      {/* ⭐ Favoritos siempre visible */}
      <Tab.Screen name="Guardados" component={FavoritesStack} />
      <Tab.Screen name="Noticias" component={NewsStack} />
      {/* 🔐 Perfil para login admin */}
      <Tab.Screen name="Perfil" component={ProfileStack} />
      {/* 🔧 Admin solo si es admin */}
      {isAdmin() && (
        <Tab.Screen
          name="Admin"
          component={AdminNavigator}
          options={{ title: "Admin" }}
        />
      )}
    </Tab.Navigator>
  );
}
