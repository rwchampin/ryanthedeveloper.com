"use client";
import { Switch } from '@/app/components/ui/switch';
import { useTheme } from 'next-themes';

import { FaSun, FaMoon } from 'react-icons/fa'; // Import the icons from the 'react-icons/fa' package

export const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <Switch
      checked={ isDark }
      onCheckedChange={ () => setTheme( isDark ? 'light' : 'dark' ) }
    >
      <h1>afdfsf</h1>

    </Switch>
  );
}