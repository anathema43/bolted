// Enterprise Session Validation Service
// Implements robust session validation and permission re-checking

import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

class SessionValidationService {
  constructor() {
    this.sessionCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Re-validate user permissions on every sensitive action
  async validateUserRole(requiredRole = 'admin') {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Check cache first
    const cacheKey = `${currentUser.uid}_${requiredRole}`;
    const cached = this.sessionCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      if (!cached.hasPermission) {
        throw new Error('Insufficient permissions');
      }
      return cached.userData;
    }

    // Re-fetch user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data();

    // Check if user is suspended or deactivated
    if (userData.suspended) {
      throw new Error('User account suspended');
    }

    if (userData.deactivated) {
      throw new Error('User account deactivated');
    }

    // Validate role
    const hasPermission = userData.role === requiredRole;
    
    // Cache result
    this.sessionCache.set(cacheKey, {
      hasPermission,
      userData,
      timestamp: Date.now()
    });

    if (!hasPermission) {
      throw new Error(`Access denied. Required role: ${requiredRole}, current role: ${userData.role}`);
    }

    return userData;
  }

  // Validate session freshness
  async validateSessionFreshness(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Check token freshness
    const tokenResult = await currentUser.getIdTokenResult();
    const tokenAge = Date.now() - new Date(tokenResult.authTime).getTime();
    
    if (tokenAge > maxAge) {
      throw new Error('Session expired. Please log in again.');
    }

    return tokenResult;
  }

  // Enhanced permission checking with granular roles
  async checkPermission(action, resource = null) {
    const userData = await this.validateUserRole();
    
    // Define permission matrix
    const permissions = {
      admin: {
        products: ['create', 'read', 'update', 'delete'],
        orders: ['read', 'update', 'delete'],
        users: ['read', 'update'],
        analytics: ['read'],
        settings: ['read', 'update']
      },
      editor: {
        products: ['create', 'read', 'update'],
        orders: ['read', 'update'],
        analytics: ['read']
      },
      support: {
        orders: ['read', 'update'],
        users: ['read']
      },
      customer: {
        orders: ['read'], // own orders only
        profile: ['read', 'update'] // own profile only
      }
    };

    const userPermissions = permissions[userData.role] || {};
    const resourcePermissions = userPermissions[resource] || [];

    if (!resourcePermissions.includes(action)) {
      throw new Error(`Permission denied: ${userData.role} cannot ${action} ${resource}`);
    }

    return true;
  }

  // Clear cache when user logs out or role changes
  clearCache(userId = null) {
    if (userId) {
      // Clear specific user's cache
      for (const [key] of this.sessionCache) {
        if (key.startsWith(userId)) {
          this.sessionCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.sessionCache.clear();
    }
  }

  // Monitor for role changes
  setupRoleChangeListener(userId, callback) {
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          this.clearCache(userId);
          callback(userData);
        }
      }
    );

    return unsubscribe;
  }
}

export const sessionValidationService = new SessionValidationService();
export default sessionValidationService;