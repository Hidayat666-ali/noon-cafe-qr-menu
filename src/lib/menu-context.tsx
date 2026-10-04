'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuData, MenuItem, MenuCategory, Offer, CafeSettings } from './types';
import defaultMenuData from '../../data/menu-data.json';

interface MenuContextType {
  data: MenuData;
  isLoading: boolean;
  error: string | null;
  saveData: (newData: MenuData) => Promise<boolean>;
  resetToDefault: () => Promise<boolean>;
  activeCategory: string;
  setActiveCategory: (id: string) => void;
  selectedItem: MenuItem | null;
  setSelectedItem: (item: MenuItem | null) => void;
}

const STORAGE_KEY = 'noon_cafe_menu_data_v1';

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<MenuData>(defaultMenuData as unknown as MenuData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('cat-crave-corner');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Load from API or localStorage
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Try local storage first for instant render
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.items && parsed.categories) {
              setData(parsed);
            }
          } catch (e) {
            console.warn('Failed parsing local storage menu cache');
          }
        }

        // Fetch from API
        const res = await fetch('/api/menu');
        if (res.ok) {
          const serverData: MenuData = await res.json();
          if (serverData && serverData.items && serverData.categories) {
            // Check version or if localStorage had updates
            if (cached) {
              const parsed = JSON.parse(cached);
              if (parsed.version && parsed.version > (serverData.version || 0)) {
                // LocalStorage is newer (e.g. recent admin edit), sync to server
                await fetch('/api/menu', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(parsed),
                });
                setData(parsed);
                setIsLoading(false);
                return;
              }
            }
            setData(serverData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
          }
        }
      } catch (err: any) {
        console.error('Failed to load menu data:', err);
        setError('Using offline menu version');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const saveData = async (newData: MenuData): Promise<boolean> => {
    try {
      newData.version = Date.now();
      setData(newData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });

      return res.ok;
    } catch (err) {
      console.error('Error saving menu data:', err);
      return false;
    }
  };

  const resetToDefault = async (): Promise<boolean> => {
    const fresh = defaultMenuData as unknown as MenuData;
    fresh.version = Date.now();
    return await saveData(fresh);
  };

  return (
    <MenuContext.Provider
      value={{
        data,
        isLoading,
        error,
        saveData,
        resetToDefault,
        activeCategory,
        setActiveCategory,
        selectedItem,
        setSelectedItem,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
