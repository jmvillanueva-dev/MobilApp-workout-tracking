import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useSimpleProgressPhotos } from "../../src/presentation/hooks";

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - 48) / 2;

interface PhotoItemProps {
  photo: {
    id: number;
    photo_url: string;
    created_at: string;
  };
  onDelete: (id: number, url: string) => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({ photo, onDelete }) => {
  const [imageError, setImageError] = React.useState(false);

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Foto",
      "¿Estás seguro de que quieres eliminar esta foto de progreso?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDelete(photo.id, photo.photo_url),
        },
      ]
    );
  };

  const handleImageError = () => {
    console.log("❌ Error cargando imagen:", photo.photo_url);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log("✅ Imagen cargada correctamente:", photo.photo_url);
    setImageError(false);
  };

  return (
    <View style={styles.photoContainer}>
      {imageError ? (
        <View style={[styles.photo, styles.photoError]}>
          <MaterialIcons name="broken-image" size={40} color="#ccc" />
          <Text style={styles.errorText}>Error cargando imagen</Text>
        </View>
      ) : (
        <Image
          source={{ uri: photo.photo_url }}
          style={styles.photo}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons name="delete" size={20} color="white" />
      </TouchableOpacity>
      <View style={styles.photoInfo}>
        <Text style={styles.photoDate}>
          {new Date(photo.created_at).toLocaleDateString("es-ES")}
        </Text>
      </View>
    </View>
  );
};

const SimpleProgressScreen: React.FC = () => {
  const { usuario } = useAuth();
  const {
    photos,
    loading,
    uploading,
    error,
    deletePhoto,
    takePhoto,
    pickPhoto,
    fetchPhotos,
  } = useSimpleProgressPhotos(usuario?.id);

  // Debug: log de las fotos
  React.useEffect(() => {
    console.log("📸 Progress Screen - Fotos recibidas:", photos.length, photos);
  }, [photos]);

  const handleAddPhoto = () => {
    Alert.alert("Agregar Foto de Progreso", "¿Cómo quieres agregar la foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Tomar Foto",
        onPress: async () => {
          const result = await takePhoto();
          if (!result.success) {
            Alert.alert("Error", result.error || "No se pudo tomar la foto");
          } else {
            Alert.alert("¡Éxito!", "Foto de progreso guardada correctamente");
          }
        },
      },
      {
        text: "Seleccionar de Galería",
        onPress: async () => {
          const result = await pickPhoto();
          if (!result.success) {
            Alert.alert(
              "Error",
              result.error || "No se pudo seleccionar la foto"
            );
          } else {
            Alert.alert("¡Éxito!", "Foto de progreso guardada correctamente");
          }
        },
      },
    ]);
  };

  const handleDeletePhoto = async (photoId: number, photoUrl: string) => {
    const result = await deletePhoto(photoId, photoUrl);
    if (!result.success) {
      Alert.alert("Error", result.error || "No se pudo eliminar la foto");
    } else {
      Alert.alert("¡Eliminada!", "Foto de progreso eliminada correctamente");
    }
  };

  const renderPhoto = ({ item }: { item: any }) => (
    <PhotoItem photo={item} onDelete={handleDeletePhoto} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Mi Progreso</Text>
      <Text style={styles.subtitle}>
        Registra tu transformación física con fotos
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.addButton, uploading && styles.addButtonDisabled]}
        onPress={handleAddPhoto}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <MaterialIcons name="add-a-photo" size={24} color="white" />
        )}
        <Text style={styles.addButtonText}>
          {uploading ? "Subiendo..." : "Agregar Foto"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="photo-camera" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>¡Comienza tu progreso!</Text>
      <Text style={styles.emptySubtitle}>
        Agrega tu primera foto para comenzar a registrar tu transformación
      </Text>
    </View>
  );

  if (loading && photos.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando fotos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item, index) => `photo-${item.id}-${index}`}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={photos.length > 0 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  flatListContent: {
    padding: 16,
  },
  row: {
    justifyContent: "space-between",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  addButtonDisabled: {
    backgroundColor: "#ccc",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  photoContainer: {
    width: PHOTO_SIZE,
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photo: {
    width: "100%",
    height: PHOTO_SIZE * 1.2,
    backgroundColor: "#f0f0f0",
  },
  photoError: {
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(220, 38, 38, 0.8)",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  photoInfo: {
    padding: 12,
  },
  photoDate: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});

export default SimpleProgressScreen;
