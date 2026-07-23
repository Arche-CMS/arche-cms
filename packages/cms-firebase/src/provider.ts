import type { FirestoreActivityProvider } from "./activity";
import type { FirebaseAuthProvider } from "./auth";
import type { FirestoreContentProvider } from "./content";
import type { FirestoreGlobalsProvider } from "./globals";
import type { FirebaseStorageProvider } from "./media";
import type { FirestoreRolesProvider } from "./roles";
import type { FirestoreUsersProvider } from "./users";

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: string | undefined;
}

export interface AdminProvider {
  auth: {
    login(email: string, password: string): Promise<AdminUser>;
    register(email: string, password: string, name: string): Promise<AdminUser>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<AdminUser | null>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, password: string): Promise<void>;
  };

  collections: {
    listEntries<T>(
      slug: string,
      params?: { limit?: number; offset?: number },
    ): Promise<{ data: T[]; total: number }>;
    getEntry<T>(slug: string, id: string): Promise<T | null>;
    createEntry<T>(slug: string, data: Partial<T>): Promise<T>;
    updateEntry<T>(slug: string, id: string, data: Partial<T>): Promise<T>;
    deleteEntry(slug: string, id: string): Promise<void>;
    bulkDelete(slug: string, ids: string[]): Promise<void>;
    publishEntry(slug: string, id: string): Promise<void>;
    unpublishEntry(slug: string, id: string): Promise<void>;
    restoreEntry(slug: string, id: string): Promise<void>;
  };

  globals: {
    getGlobal<T>(slug: string): Promise<T | null>;
    upsertGlobal<T>(slug: string, data: Partial<T>): Promise<T>;
  };

  media: {
    uploadMedia(file: File, folderId?: string): Promise<import("./media").MediaFile>;
    listMedia(params?: {
      limit?: number;
      offset?: number;
    }): Promise<{ data: import("./media").MediaFile[]; total: number }>;
    getMedia(id: string): Promise<import("./media").MediaFile | null>;
    deleteMedia(id: string): Promise<void>;
    getMediaFile(id: string): Promise<string>;
    listFolders(): Promise<import("./media").MediaFolder[]>;
    createFolder(name: string): Promise<import("./media").MediaFolder>;
    renameFolder(id: string, name: string): Promise<void>;
    deleteFolder(id: string): Promise<void>;
  };

  users: {
    listUsers(params?: {
      limit?: number;
      offset?: number;
    }): Promise<{ data: import("./users").User[]; total: number }>;
    getUser(id: string): Promise<import("./users").User | null>;
    createUser(
      data: Omit<import("./users").User, "id" | "createdAt" | "updatedAt">,
    ): Promise<import("./users").User>;
    updateUser(id: string, data: Partial<import("./users").User>): Promise<import("./users").User>;
    deleteUser(id: string): Promise<void>;
  };

  roles: {
    listRoles(params?: {
      limit?: number;
      offset?: number;
    }): Promise<{ data: import("./roles").Role[]; total: number }>;
    getRole(id: string): Promise<import("./roles").Role | null>;
    createRole(
      data: Omit<import("./roles").Role, "id" | "createdAt" | "updatedAt">,
    ): Promise<import("./roles").Role>;
    updateRole(id: string, data: Partial<import("./roles").Role>): Promise<import("./roles").Role>;
    deleteRole(id: string): Promise<void>;
  };

  activity: {
    recordActivity(
      event: Omit<import("./activity").ActivityEvent, "id" | "timestamp">,
    ): Promise<void>;
    listActivity(params?: {
      limit?: number;
    }): Promise<{ data: import("./activity").ActivityEvent[]; total: number }>;
  };
}

export interface FirebaseProviderOptions {
  auth: FirebaseAuthProvider;
  content: FirestoreContentProvider;
  globals: FirestoreGlobalsProvider;
  storage: FirebaseStorageProvider;
  users: FirestoreUsersProvider;
  roles: FirestoreRolesProvider;
  activity: FirestoreActivityProvider;
}

export function createFirebaseProvider(options: FirebaseProviderOptions): AdminProvider {
  return {
    activity: options.activity,
    auth: options.auth,
    collections: options.content,
    globals: options.globals,
    media: options.storage,
    roles: options.roles,
    users: options.users,
  };
}
