// Enterprise Code Splitting Implementation
// Implements route-based lazy loading for optimal performance

import { lazy, Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy load admin components (largest bundle)
export const AdminLazy = lazy(() => 
  import('../pages/Admin').then(module => ({
    default: module.default
  }))
);

export const OrdersLazy = lazy(() => 
  import('../pages/Orders').then(module => ({
    default: module.default
  }))
);

export const CheckoutLazy = lazy(() => 
  import('../pages/Checkout').then(module => ({
    default: module.default
  }))
);

// Lazy load artisan components
export const ArtisansDirectoryLazy = lazy(() => 
  import('../pages/ArtisansDirectory').then(module => ({
    default: module.default
  }))
);

export const ArtisanProfileLazy = lazy(() => 
  import('../pages/ArtisanProfile').then(module => ({
    default: module.default
  }))
);

// Lazy load development roadmap
export const DevelopmentRoadmapLazy = lazy(() => 
  import('../pages/DevelopmentRoadmap').then(module => ({
    default: module.default
  }))
);

// Higher-order component for lazy loading with error boundary
export const withLazyLoading = (LazyComponent, fallback = <LoadingSpinner />) => {
  return function LazyWrapper(props) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

// Preload components for better UX
export const preloadComponent = (importFunction) => {
  const componentImport = importFunction();
  return componentImport;
};

// Preload admin components when user has admin role
export const preloadAdminComponents = () => {
  preloadComponent(() => import('../pages/Admin'));
  preloadComponent(() => import('../pages/Orders'));
};

// Preload checkout when user adds items to cart
export const preloadCheckoutComponents = () => {
  preloadComponent(() => import('../pages/Checkout'));
};

export default {
  AdminLazy,
  OrdersLazy,
  CheckoutLazy,
  ArtisansDirectoryLazy,
  ArtisanProfileLazy,
  DevelopmentRoadmapLazy,
  withLazyLoading,
  preloadComponent,
  preloadAdminComponents,
  preloadCheckoutComponents
};