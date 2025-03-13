import { useEffect, useRef, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const DEBUG = true; // Toggle logging

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver((mutations) => {
        if (DEBUG) {
          console.groupCollapsed(`📜 MutationObserver: ${mutations.length} mutations`);
          console.log('Container:', container);
          console.table(mutations.map(m => ({
            type: m.type,
            target: m.target.nodeName,
            added: m.addedNodes.length,
            removed: m.removedNodes.length,
            attribute: m.attributeName || 'N/A'
          })));
        }

        let shouldScroll = false;
        let scrollReason = '';
        let scrollElement: HTMLElement | null = null;

        mutations.some(mutation => {
          const logPrefix = `🔍 Mutation [${mutation.type}] on ${mutation.target.nodeName}:`;

          // Detailed element analysis
          const targetNode = mutation.target;
          if (targetNode.nodeType !== Node.ELEMENT_NODE) {
            // Handle text node case, perhaps skip or handle differently
            // For example, check if it's a text node and if its parent is a copy button
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

          if (DEBUG) {
            console.log(`${logPrefix}`, {
              ...elementInfo,
              textSnippet: targetEl.textContent?.slice(0, 40).replace(/\n/g, ' ') + '...',
              parent: targetEl.parentElement?.tagName
            });
          }

          // Get DOM path (full hierarchy)
          const getDomPath = (el: HTMLElement): string => {
            const path: string[] = [];
            let currentEl: HTMLElement | null = el;
            
            while (currentEl && currentEl !== document.body && path.length < 8) {
              const tag = currentEl.tagName?.toLowerCase() || 'unknown';
              const id = currentEl.id ? `#${currentEl.id}` : '';
              const classes = typeof currentEl.className === 'string' 
                ? `.${currentEl.className.split(' ')[0]}` // Just first class for brevity
                : '';
              path.unshift(`${tag}${id}${classes}`);
              currentEl = currentEl.parentElement;
            }
            
            return path.join(' → ');
          };
          
          // Detailed attribute change info
          let attributeDetail = '';
          if (mutation.type === 'attributes' && mutation.attributeName) {
            const oldValue = mutation.oldValue || 'unknown';
            const newValue = targetEl.getAttribute(mutation.attributeName) || 'unknown';
            attributeDetail = ` (${mutation.attributeName}: "${oldValue}" → "${newValue}")`;
          }
          
          // Detailed node info
          const getNodeInfo = (node: Node): string => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              const tag = el.tagName?.toLowerCase() || 'unknown';
              const classes = typeof el.className === 'string' ? el.className.split(' ')[0] : '';
              const nodeId = el.id ? `#${el.id}` : '';
              const dataAttrs = Array.from(el.attributes || [])
                .filter(attr => attr.name.startsWith('data-'))
                .map(attr => `[${attr.name}="${attr.value}"]`)
                .join('');
              return `${tag}${nodeId}${classes ? `.${classes}` : ''}${dataAttrs}`;
            } else if (node.nodeType === Node.TEXT_NODE) {
              const text = (node as Text).data?.trim().substring(0, 20);
              return text ? `"${text}${text.length > 20 ? '...' : ''}"` : 'empty text';
            }
            return `node-type-${node.nodeType}`;
          };
          
          // Node addition/removal details
          let nodeDetails = '';
          if (mutation.type === 'childList') {
            if (mutation.addedNodes.length) {
              const addedDetails = Array.from(mutation.addedNodes)
                .map(getNodeInfo)
                .join(', ');
              nodeDetails += ` Added: [${addedDetails}]`;
            }
            
            if (mutation.removedNodes.length) {
              const removedDetails = Array.from(mutation.removedNodes)
                .map(getNodeInfo)
                .join(', ');
              nodeDetails += ` Removed: [${removedDetails}]`;
            }
          }
          
          // Get component information if available (by looking for data-component attribute)
          const componentInfo = ((): string => {
            let currentElement: Node | null = targetEl;
            while (currentElement && currentElement !== document.body) {
              if (currentElement.nodeType === Node.ELEMENT_NODE) {
                const el = currentElement as HTMLElement;
                if (el.hasAttribute('data-component')) {
                  return el.getAttribute('data-component') || '';
                }
              }
              currentElement = currentElement.parentElement;
            }
            return '';
          })();

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
            if (DEBUG) console.log('🚫 Ignored copy button mutation:', elementInfo);
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
            if (DEBUG) console.log('🚧 Ignored UI mutation:', elementInfo);
            return false;
          }
          
          shouldScroll = true;
          scrollReason = `📢 Content change detected on ${elementInfo.tag}${elementInfo.id} (${elementInfo.classes})`;
          scrollElement = targetEl;
          if (DEBUG) {
            console.log('💥 SCROLL TRIGGERED:', {
              reason: scrollReason,
              element: scrollElement,
              mutationType: mutation.type,
              addedNodes: mutation.addedNodes.length,
              removedNodes: mutation.removedNodes.length
            });
          }
          return true;
        });

        if (shouldScroll && scrollElement) {
          if (DEBUG) {
            console.log('🎯 Scrolling to bottom because:', scrollReason);
            console.log('🔗 Element path:', getDomPath(scrollElement));
          }
          end.scrollIntoView({ behavior: 'instant', block: 'end' });
        }

        if (DEBUG) console.groupEnd();
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