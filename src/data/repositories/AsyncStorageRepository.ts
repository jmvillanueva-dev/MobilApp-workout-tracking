import AsyncStorage from "@react-native-async-storage/async-storage";
import { IStorageRepository } from "../../domain/repositories/IStorageRepository";

/**
 * Implementación del repositorio de almacenamiento usando AsyncStorage
 * Concreta la interfaz IStorageRepository
 */
export class AsyncStorageRepository implements IStorageRepository {
  // Keys específicos para la gestión de sesión
  private static readonly _SESSION_USER_KEY = "wtapp_current_user";
  private static readonly _SESSION_REMEMBER_KEY = "wtapp_remember_session";

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Error guardando en storage:", error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error("Error obteniendo del storage:", error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Error eliminando del storage:", error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error limpiando storage:", error);
      throw error;
    }
  }

  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error("Error guardando objeto en storage:", error);
      throw error;
    }
  }

  async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error("Error obteniendo objeto del storage:", error);
      return null;
    }
  }

  async clearSessionData(): Promise<void> {
    try {
      await Promise.all([
        this.removeItem(AsyncStorageRepository._SESSION_USER_KEY),
        this.removeItem(AsyncStorageRepository._SESSION_REMEMBER_KEY),
        this.removeItem("pending_user_role"),
        this.removeItem("pending_user_email"),
      ]);
    } catch (error) {
      console.error("Error limpiando datos de sesión:", error);
      throw error;
    }
  }

  // Métodos públicos para keys específicos
  static get SESSION_USER_KEY(): string {
    return AsyncStorageRepository._SESSION_USER_KEY;
  }

  static get SESSION_REMEMBER_KEY(): string {
    return AsyncStorageRepository._SESSION_REMEMBER_KEY;
  }
}
