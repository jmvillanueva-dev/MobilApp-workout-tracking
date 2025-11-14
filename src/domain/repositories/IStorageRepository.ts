/**
 * Interfaz del repositorio de almacenamiento
 * Define las operaciones abstractas de persistencia local
 * independientes de la implementación específica (AsyncStorage, localStorage, etc.)
 */
export interface IStorageRepository {
  /**
   * Guardar un valor string
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Obtener un valor string
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Eliminar un valor
   */
  removeItem(key: string): Promise<void>;

  /**
   * Limpiar todo el storage
   */
  clear(): Promise<void>;

  /**
   * Guardar un objeto como JSON
   */
  setObject<T>(key: string, value: T): Promise<void>;

  /**
   * Obtener un objeto desde JSON
   */
  getObject<T>(key: string): Promise<T | null>;

  /**
   * Limpiar datos específicos de sesión
   */
  clearSessionData(): Promise<void>;
}
