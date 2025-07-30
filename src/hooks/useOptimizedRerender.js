// Enterprise React Performance Optimization
// Implements memo, useCallback, and useMemo patterns for optimal re-rendering

import { useCallback, useMemo, useRef, useEffect } from 'react';

// Custom hook for optimized event handlers
export const useOptimizedCallback = (callback, dependencies) => {
  return useCallback(callback, dependencies);
};

// Custom hook for expensive computations
export const useOptimizedMemo = (factory, dependencies) => {
  return useMemo(factory, dependencies);
};

// Custom hook for preventing unnecessary re-renders
export const useStableReference = (value) => {
  const ref = useRef(value);
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
};

// Custom hook for debounced values (search, etc.)
export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [value, delay]);
  
  return debouncedValue;
};

// Custom hook for optimized list rendering
export const useVirtualizedList = (items, itemHeight = 50, containerHeight = 400) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);
  
  const totalHeight = items.length * itemHeight;
  
  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);
  
  return {
    visibleItems,
    totalHeight,
    handleScroll,
    startIndex: Math.floor(scrollTop / itemHeight)
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times in ${renderTime}ms`);
    }
    
    startTime.current = Date.now();
  });
  
  return renderCount.current;
};

export default {
  useOptimizedCallback,
  useOptimizedMemo,
  useStableReference,
  useDebouncedValue,
  useVirtualizedList,
  usePerformanceMonitor
};