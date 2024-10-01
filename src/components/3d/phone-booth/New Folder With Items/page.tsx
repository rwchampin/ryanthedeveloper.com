"use client";

import { useEffect } from 'react';
import { render } from './Renderer';

export default function Page() {
    useEffect(() => {
        render()
    }, [])

  return null
}
