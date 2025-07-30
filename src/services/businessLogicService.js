// Enterprise Business Logic Service Layer
// Separates business logic from UI components and state management

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { emailService } from './emailService';
import { inventoryService } from './inventoryService';

class BusinessLogicService {
  // Product Management Business Logic
  async createProduct(productData, userRole) {
    // Validate permissions
    if (userRole !== 'admin') {
      throw new Error('Insufficient permissions to create products');
    }

    // Business validation
    this.validateProductData(productData);

    // Create product with business rules
    const product = {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
      featured: false,
      rating: 0,
      reviewCount: 0
    };

    try {
      const docRef = await addDoc(collection(db, 'products'), product);
      
      // Business logic: Update inventory
      await inventoryService.initializeInventory(docRef.id, productData.quantityAvailable);
      
      // Business logic: Sync to search index
      await this.syncProductToSearch(docRef.id, product);
      
      return { id: docRef.id, ...product };
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async updateProduct(productId, updates, userRole) {
    // Re-validate permissions on every action
    await this.validateUserPermissions(userRole, 'admin');

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'products', productId), updateData);
      
      // Business logic: Update search index
      await this.syncProductToSearch(productId, updateData);
      
      return updateData;
    } catch (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  // Order Processing Business Logic
  async processOrder(orderData, userId) {
    // Validate user session
    await this.validateActiveSession(userId);

    // Business validation
    await this.validateOrderData(orderData);

    // Check inventory availability
    await this.validateInventoryAvailability(orderData.items);

    const batch = writeBatch(db);

    try {
      // Create order
      const orderRef = doc(collection(db, 'orders'));
      const order = {
        ...orderData,
        userId,
        orderNumber: this.generateOrderNumber(),
        status: 'processing',
        createdAt: new Date().toISOString()
      };
      
      batch.set(orderRef, order);

      // Update inventory
      for (const item of orderData.items) {
        const productRef = doc(db, 'products', item.id);
        batch.update(productRef, {
          quantityAvailable: item.quantityAvailable - item.quantity
        });
      }

      await batch.commit();

      // Business logic: Send confirmation email
      await emailService.sendOrderConfirmation(order);

      return { id: orderRef.id, ...order };
    } catch (error) {
      throw new Error(`Failed to process order: ${error.message}`);
    }
  }

  // Permission Validation (Re-check on every action)
  async validateUserPermissions(userRole, requiredRole) {
    if (userRole !== requiredRole) {
      throw new Error(`Access denied. Required role: ${requiredRole}`);
    }

    // Additional server-side validation could go here
    // e.g., check if user still has valid session, hasn't been suspended, etc.
  }

  async validateActiveSession(userId) {
    // Check if user session is still valid
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('Invalid user session');
    }

    const userData = userDoc.data();
    if (userData.suspended) {
      throw new Error('User account suspended');
    }

    return userData;
  }

  // Business Validation Logic
  validateProductData(productData) {
    const required = ['name', 'description', 'price', 'category', 'quantityAvailable'];
    
    for (const field of required) {
      if (!productData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (productData.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    if (productData.quantityAvailable < 0) {
      throw new Error('Quantity cannot be negative');
    }
  }

  async validateOrderData(orderData) {
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    if (!orderData.shipping || !orderData.shipping.address) {
      throw new Error('Shipping address is required');
    }

    // Validate each item exists and is available
    for (const item of orderData.items) {
      const productDoc = await getDoc(doc(db, 'products', item.id));
      if (!productDoc.exists()) {
        throw new Error(`Product ${item.id} not found`);
      }

      const product = productDoc.data();
      if (product.quantityAvailable < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
    }
  }

  async validateInventoryAvailability(items) {
    for (const item of items) {
      const available = await inventoryService.checkAvailability(item.id);
      if (available < item.quantity) {
        throw new Error(`Insufficient inventory for product ${item.id}`);
      }
    }
  }

  // Utility Methods
  generateOrderNumber() {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async syncProductToSearch(productId, productData) {
    // Sync to Algolia search index
    try {
      const { searchService } = await import('./searchService');
      await searchService.indexProduct({ id: productId, ...productData });
    } catch (error) {
      console.error('Failed to sync to search:', error);
      // Don't throw - search sync failure shouldn't break product creation
    }
  }
}

export const businessLogicService = new BusinessLogicService();
export default businessLogicService;