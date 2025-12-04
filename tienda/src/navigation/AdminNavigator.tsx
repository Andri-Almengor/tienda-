// src/navigation/AdminNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminHomeScreen from "../features/admin/screens/AdminHomeScreen";
import AdminProductsScreen from "../features/admin/screens/AdminProductsScreen";
import AdminUsersScreen from "../features/admin/screens/AdminUsersScreen";
import AdminNewsScreen from "../features/admin/screens/AdminNewsScreen";

export type AdminStackParamList = {
  AdminHome: undefined;
  AdminProducts: undefined;
  AdminUsers: undefined;
  AdminNews: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ title: "Administrar" }}
      />
      <Stack.Screen
        name="AdminProducts"
        component={AdminProductsScreen}
        options={{ title: "Productos" }}
      />
      <Stack.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{ title: "Usuarios" }}
      />
      <Stack.Screen
        name="AdminNews"
        component={AdminNewsScreen}
        options={{ title: "Noticias" }}
      />
    </Stack.Navigator>
  );
}
