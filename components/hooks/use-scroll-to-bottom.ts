import { useEffect, useRef, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T | null>,
  RefObject<T | null>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver((mutations) => {
        let shouldScroll = false;
        let scrollElement: HTMLElement | null = null;

        mutations.some(mutation => {
          // Detailed element analysis
          const targetNode = mutation.target;
          if (targetNode.nodeType !== Node.ELEMENT_NODE) {
            return false;
          }
          const targetEl = targetNode as HTMLElement;
          const elementInfo = {
            tag: targetEl.tagName,
            id: targetEl.id ? `#${targetEl.id}` : '',
            classes: targetEl.className?.toString().split(' ').slice(0, 3).join(' ') || '',
            dataAttrs: Array.from(targetEl.attributes || [])
              .filter(attr => attr.name.startsWith('data-'))
              .map(attr => attr.name)
              .join(', ')
          };

          // Check if element is part of copy button component
          const isCopyButton = (
            // Match the copy button itself
            (targetEl.nodeType === Node.ELEMENT_NODE && 
             (targetEl as HTMLElement).closest('button')?.getAttribute('variant') === 'ghost') ||
            // Match the AnimatePresence/motion divs
            (elementInfo.classes.includes('text-green-500') || 
             (targetEl.nodeType === Node.ELEMENT_NODE && targetEl.querySelector('.text-green-500'))) ||
            (elementInfo.tag === 'svg' && 
             targetEl.nodeType === Node.ELEMENT_NODE && 
             (targetEl as HTMLElement).closest('button') !== null) ||
            // Match tooltip elements
            elementInfo.classes.includes('TooltipContent') ||
            (targetEl.nodeType === Node.ELEMENT_NODE && 
             (targetEl as HTMLElement).closest('[role="tooltip"]') !== null) ||
            targetEl.textContent === "Copied!" || 
            targetEl.textContent === "Copy" ||
            // Match framer-motion elements
            (targetEl.nodeType === Node.ELEMENT_NODE && 
             (targetEl as HTMLElement).getAttribute('data-framer-component-type') !== null) ||
            (elementInfo.classes.includes('motion') || 
             (targetEl.nodeType === Node.ELEMENT_NODE && 
              (targetEl as HTMLElement).closest('[style*="transform"]') !== null))
          );
          
          if (isCopyButton) {
            return false;
          }
          
          // UI component patterns (updated with avatar checks)
          const isUI = (
            elementInfo.classes.includes('tooltip') ||
            elementInfo.classes.includes('popover') ||
            elementInfo.classes.includes('opacity-') ||
            elementInfo.classes.includes('group-hover') ||
            elementInfo.classes.includes('z-50') ||
            elementInfo.classes.includes('carousel') ||
            elementInfo.classes.includes('dialog') ||
            elementInfo.classes.includes('object-cover') ||
            elementInfo.classes.includes('object-contain') ||
            
            // Added check for avatar container patterns
            (elementInfo.classes.includes('items-center') && elementInfo.classes.includes('space-x-1')) ||
            targetEl.querySelector('.h-4.w-4') || // Avatar image dimensions
            targetEl.closest('[data-component="avatar"], [data-role="search-results"], [data-component="collapsible"]') || 
            targetEl.hasAttribute('aria-describedby') ||
            targetEl.hasAttribute('data-state') ||
            targetEl.hasAttribute('data-side') ||
            
            // Radix UI specific patterns
            elementInfo.classes.includes('data-[state=closed]') ||
            elementInfo.classes.includes('data-[state=open]') ||
            elementInfo.classes.includes('radix-collapsible') ||
            targetEl.hasAttribute('data-radix-scroll-area-viewport') ||
            
            // Image handling
            (elementInfo.tag === 'img' && (
              targetEl.closest('[data-role="search-images"], [data-component="avatar"]') ||
              elementInfo.classes.includes('aspect-square') // Favicons
            )) ||
            
            // Animation and layout
            elementInfo.classes.includes('data-[state=open]') ||
            elementInfo.classes.includes('data-[state=closed]') ||
            (elementInfo.classes.includes('flex') && elementInfo.classes.includes('justify-between')) ||
            
            // Collapsible animation artifacts
            (mutation.type === 'attributes' && 
             mutation.attributeName === 'style' &&
             targetEl.hasAttribute('data-radix-collapsible-content')) ||
            
            // Specific avatar class patterns
            (elementInfo.classes.includes('relative') && 
             elementInfo.classes.includes('flex') && 
             elementInfo.classes.includes('shrink-0') &&
             elementInfo.classes.includes('overflow-hidden')) ||
            elementInfo.classes.includes('rounded-full') ||
            (elementInfo.classes.includes('h-4') && elementInfo.classes.includes('w-4')) ||
            
            // Critical fix: Detect avatar fallback spans
            (elementInfo.tag === 'span' && elementInfo.classes === 'flex') ||
            
            // Avatar parent checks 
            (targetEl.parentElement && typeof targetEl.parentElement.className === 'string' && targetEl.parentElement.className.includes('rounded-full')) ||
            
            // Detect avatar loading images
            (elementInfo.tag === 'img' && elementInfo.classes.includes('aspect-square')) ||
            
            // Detect search result containers
            targetEl.closest('[class*="rounded-lg border"]') ||
            
            // Detect collapsible animation containers
            targetEl.id?.startsWith('radix-:') ||
            elementInfo.classes.includes('animate-collapse')
          );
          
          if (isUI) {
            return false;
          }
          
          shouldScroll = true;
          scrollElement = targetEl;
          return true;
        });

        if (shouldScroll && scrollElement) {
          end.scrollIntoView({ behavior: 'instant', block: 'end' });
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  return [containerRef, endRef];
}

// Helper function to get DOM path
const getDomPath = (el: HTMLElement): string => {
  const path: string[] = [];
  let currentEl: HTMLElement | null = el;
  while (currentEl && currentEl !== document.body && path.length < 8) {
    const nodeInfo = `${currentEl.tagName}${currentEl.id ? `#${currentEl.id}` : ''}`;
    path.unshift(nodeInfo);
    currentEl = currentEl.parentElement;
  }
  return path.join(' → ');
};