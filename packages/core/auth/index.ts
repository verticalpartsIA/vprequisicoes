/**
 * packages/core/auth/index.ts
 * Authentication stubs — will be replaced by Supabase Auth when connected.
 * Uses Supabase JWT roles: 'requester' | 'buyer' | 'manager_l1' | 'manager_l2' | 'director' | 'admin'
 */

export type UserRole =
  | 'requester'
  | 'buyer'
  | 'manager_level_1'
  | 'manager_level_2'
  | 'director'
  | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  department?: string;
  role: UserRole;
}

/**
 * Returns the current mock user.
 * Replace with: supabase.auth.getUser() after connecting Supabase.
 */
export const getCurrentUser = (): AuthUser => ({
  id: 'mock-user-001',
  email: 'gelson@verticalparts.com.br',
  name: 'Gelson Filho',
  department: 'Engenharia de Software',
  role: 'manager_level_1',
});

/**
 * Checks if a user has a required role.
 */
export const hasRole = (user: AuthUser, required: UserRole): boolean => {
  const hierarchy: UserRole[] = [
    'requester',
    'buyer',
    'manager_level_1',
    'manager_level_2',
    'director',
    'admin',
  ];
  return hierarchy.indexOf(user.role) >= hierarchy.indexOf(required);
};
