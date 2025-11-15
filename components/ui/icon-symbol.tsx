// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<
  SymbolViewProps["name"],
  ComponentProps<typeof MaterialIcons>["name"]
>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // --- Navegación general ---
  "house.fill": "home",
  "person.fill": "person", // perfil usuario
  "person.2.fill": "groups", // entrenadores/usuarios
  "bell.fill": "notifications", // notificaciones

  // --- Rutinas y ejercicios ---
  "dumbbell.fill": "fitness-center", // rutinas
  "list.bullet.clipboard.fill": "assignment", // plan de entrenamiento
  calendar: "calendar-month", // calendario de rutinas
  "clock.fill": "access-time", // duración de rutina

  // --- Progreso ---
  "chart.bar.fill": "bar-chart",
  "chart.line.uptrend.xyaxis": "show-chart",

  // --- Fotos y videos ---
  "camera.fill": "photo-camera",
  "video.fill": "videocam",
  "photo.fill.on.rectangle.fill": "photo-library",
  "square.and.arrow.up": "upload", // subir foto/video

  // --- Acciones ---
  "plus.circle.fill": "add-circle",
  "pencil.circle.fill": "edit",
  "trash.fill": "delete",

  // --- Comunicación ---
  "message.fill": "chat",

  // --- Contacto ---
  "envelope.fill": "email",
  "phone.fill": "phone",
  "location.fill": "location-on",
  
  // --- Misceláneo ---
  "gearshape.fill": "settings",
  "paperplane.fill": "send",
  "chevron.right": "chevron-right",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name] }
      style={style}
    />
  );
}
