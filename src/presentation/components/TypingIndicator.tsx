import React from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { TypingStatus } from "../../domain/models/Message";

interface TypingIndicatorProps {
  typingStatus: TypingStatus | null;
}

/**
 * Componente para mostrar el indicador de "escribiendo"
 */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingStatus,
}) => {
  const dot1Opacity = React.useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = React.useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    if (typingStatus?.is_typing) {
      // Iniciar animación de puntos
      const animateDots = () => {
        const animate = (dot: Animated.Value, delay: number) => {
          Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(dot, {
                toValue: 1,
                duration: 600,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(dot, {
                toValue: 0.3,
                duration: 600,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ])
          ).start();
        };

        animate(dot1Opacity, 0);
        animate(dot2Opacity, 200);
        animate(dot3Opacity, 400);
      };

      animateDots();
    } else {
      // Detener animaciones y resetear opacidad
      dot1Opacity.stopAnimation();
      dot2Opacity.stopAnimation();
      dot3Opacity.stopAnimation();

      dot1Opacity.setValue(0.3);
      dot2Opacity.setValue(0.3);
      dot3Opacity.setValue(0.3);
    }
  }, [typingStatus?.is_typing, dot1Opacity, dot2Opacity, dot3Opacity]);

  if (!typingStatus?.is_typing) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>
          {typingStatus.user_name || "Usuario"} está escribiendo
        </Text>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot1Opacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot2Opacity,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot3Opacity,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bubble: {
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    maxWidth: "75%",
  },
  text: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
  dotsContainer: {
    flexDirection: "row",
    marginLeft: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9ca3af",
    marginHorizontal: 1,
  },
});
