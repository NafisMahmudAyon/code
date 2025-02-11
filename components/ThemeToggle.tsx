'use client'
import { useCode } from "@/context/codeContext";
import { Switch } from "aspect-ui/Switch";
import { memo } from "react";

const ThemeToggle = memo(function ThemeToggle() { 
  const { theme, toggleTheme } = useCode()
  return (<Switch checked={theme === 'dark'} onChange={toggleTheme} className='absolute top-4 right-4 z-[999999]' switchIconEnabled={true} />) })

export default ThemeToggle