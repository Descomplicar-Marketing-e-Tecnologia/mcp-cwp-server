/**
 * Simple Cache Implementation with TTL Support
 * MCP Guide compliant cache for reducing API calls
 * 
 * @author Descomplicar - Agência de Aceleração Digital
 */

import { logger } from '../utils/logger.js';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

/**
 * Simple in-memory cache with TTL support
 * Implements MCP Guide recommendation for performance optimization
 */
export class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number;
  
  constructor(defaultTTL: number = 300000) { // 5 minutes default
    this.defaultTTL = defaultTTL;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
    
    logger.info('Cache initialized', { defaultTTL: this.defaultTTL });
  }
  
  /**
   * Get an item from cache
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      logger.debug(`Cache miss: ${key}`);
      return null;
    }
    
    if (Date.now() > entry.expiry) {
      logger.debug(`Cache expired: ${key}`);
      this.cache.delete(key);
      return null;
    }
    
    logger.debug(`Cache hit: ${key}`);
    return entry.data as T;
  }
  
  /**
   * Set an item in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds (optional)
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      data: value,
      expiry
    });
    
    logger.debug(`Cache set: ${key}`, { ttl: ttl || this.defaultTTL });
  }
  
  /**
   * Delete an item from cache
   * @param key - Cache key
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      logger.debug(`Cache delete: ${key}`);
    }
    return result;
  }
  
  /**
   * Clear all cached items
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`Cache cleared`, { itemsRemoved: size });
  }
  
  /**
   * Clear items matching a pattern
   * @param pattern - Pattern to match keys against
   */
  clearPattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let cleared = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      logger.debug(`Cache pattern clear: ${pattern}`, { itemsRemoved: cleared });
    }
    
    return cleared;
  }
  
  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug(`Cache cleanup completed`, { itemsRemoved: cleaned });
    }
  }
}

// Singleton instance
export const cache = new SimpleCache();

/**
 * Cache key generators for consistent key formatting
 */
export const cacheKeys = {
  account: (username: string) => `account:${username}`,
  accountList: (params?: Record<string, any>) => 
    `account:list:${params ? JSON.stringify(params) : 'all'}`,
  package: (name: string) => `package:${name}`,
  packageList: () => 'package:list',
  autossl: (domain: string) => `autossl:${domain}`,
  autosslList: (username?: string) => `autossl:list:${username || 'all'}`,
  ftp: (username: string, ftpUser: string) => `ftp:${username}:${ftpUser}`,
  ftpList: (username: string) => `ftp:list:${username}`,
  mysql: (username: string, dbName: string) => `mysql:${username}:${dbName}`,
  mysqlList: (username: string) => `mysql:list:${username}`,
};

/**
 * Cache TTL values for different operations (in milliseconds)
 */
export const cacheTTL = {
  short: 60000,    // 1 minute - for frequently changing data
  medium: 300000,  // 5 minutes - default
  long: 900000,    // 15 minutes - for stable data
  veryLong: 3600000 // 1 hour - for very stable data like packages
};