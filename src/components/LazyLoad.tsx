import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import Lenis from "@studio-freight/lenis";

type LazyLoadProps = {
    children: React.ReactNode;
    threshold?: number; // Percentage of the element's visibility required to trigger loading
    rootMargin?: string; // Margin around the root
    root?: Element | null; // The element that is used as the viewport for checking visibility
    placeholder?: React.ReactNode; // Placeholder content while loading
    onVisible?: () => void; // Callback when the element becomes visible
};

const LazyLoad: React.FC<LazyLoadProps> = ({
    children,
    threshold = 0.1,
    rootMargin = "0px",
    root = null,
    placeholder = <div>Loading...</div>,
    onVisible,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        if (onVisible) onVisible();
                        observer.disconnect();
                    }
                });
            },
            {
                root,
                rootMargin,
                threshold,
            }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [root, rootMargin, threshold, onVisible]);

    useEffect(() => {
        if (isVisible && elementRef.current) {
            gsap.fromTo(
                elementRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 1 }
            );
        }
    }, [isVisible]);

    return <div ref={elementRef}>{isVisible ? children : placeholder}</div>;
};

export default LazyLoad;