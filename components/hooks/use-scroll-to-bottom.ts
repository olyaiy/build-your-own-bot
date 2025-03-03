import { useEffect, useRef, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => {
    console.log('[useScrollToBottom] Setting up scroll observer');
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver((mutations) => {
        // Track mutation counts
        let ignoredCount = 0;
        let unignoredCount = 0;
        const totalCount = mutations.length;
        
        // Log all mutations for debugging
        console.log(`[useScrollToBottom] Mutations detected: ${totalCount}`);
        
        // Enhanced logging for each mutation
        mutations.forEach((mutation, index) => {
          // Get detailed info about the target
          const targetEl = mutation.target as HTMLElement;
          const targetTag = targetEl.tagName?.toLowerCase() || 'unknown';
          const targetId = targetEl.id ? `#${targetEl.id}` : '';
          const targetClasses = typeof targetEl.className === 'string' ? targetEl.className.split(' ').join('.') : '';
          const targetSelector = `${targetTag}${targetId}${targetClasses ? `.${targetClasses}` : ''}`;
          
          // Get DOM path (full hierarchy)
          const getDomPath = (el: HTMLElement): string => {
            const path: string[] = [];
            let currentEl: HTMLElement | null = el;
            
            while (currentEl && currentEl !== document.body && path.length < 5) {
              const tag = currentEl.tagName?.toLowerCase() || 'unknown';
              const id = currentEl.id ? `#${currentEl.id}` : '';
              const classes = typeof currentEl.className === 'string' 
                ? `.${currentEl.className.split(' ')[0]}` // Just first class for brevity
                : '';
              path.unshift(`${tag}${id}${classes}`);
              currentEl = currentEl.parentElement;
            }
            
            return path.join(' > ');
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
              if (currentElement.nodeType === Node.ELEMENT_NODE && 
                  (currentElement as HTMLElement).hasAttribute('data-component')) {
                return (currentElement as HTMLElement).getAttribute('data-component') || '';
              }
              currentElement = currentElement.parentElement;
            }
            return '';
          })();
          
          // Log detailed mutation info
          console.log(
            `  Mutation #${index + 1}:
            - Type: ${mutation.type}${attributeDetail}
            - Target: ${targetSelector}
            - DOM Path: ${getDomPath(targetEl)}
            - Component: ${componentInfo || 'unknown'}${nodeDetails}`
          );
        });
        
        // Check if any mutation is a significant content change that should trigger scrolling
        let triggeringMutation: MutationRecord | null = null;
        let triggeringReason = '';
        
        const shouldScroll = mutations.some(mutation => {
          // Always trigger on text content changes
          if (mutation.type === 'characterData') {
            triggeringMutation = mutation;
            const textContent = mutation.target.nodeType === Node.TEXT_NODE 
              ? (mutation.target as Text).data?.substring(0, 20) 
              : 'unknown text';
            triggeringReason = `Text content changed: ${textContent}...`;
            return true;
          }
          
          // For childList mutations, check if it's a meaningful change
          if (mutation.type === 'childList') {
            // If elements are added or removed, it's likely a content change
            if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
              // Verify it's not a tooltip or UI element
              const isUIElement = (node: Node): boolean => {
                if (node.nodeType !== Node.ELEMENT_NODE) return false;
                
                const element = node as HTMLElement;
                
                // Check the element and its children for UI patterns
                const checkElement = (el: HTMLElement, depth = 0): boolean => {
                  if (depth > 3) return false; // Limit recursion depth
                  
                  const className = el.className?.toString() || '';
                  const tagName = el.tagName?.toLowerCase() || '';
                  
                  // UI component patterns (updated with avatar checks)
                  const isUI = (
                    className.includes('tooltip') ||
                    className.includes('popover') ||
                    className.includes('opacity-') ||
                    className.includes('group-hover') ||
                    className.includes('z-50') ||
                    className.includes('carousel') ||
                    className.includes('dialog') ||
                    className.includes('object-cover') ||
                    className.includes('object-contain') ||
                    
                    // Added check for avatar container patterns
                    (className.includes('items-center') && className.includes('space-x-1')) ||
                    el.querySelector('.h-4.w-4') || // Avatar image dimensions
                    el.closest('[data-component="avatar"], [data-role="search-results"], [data-component="collapsible"]') || 
                    el.hasAttribute('aria-describedby') ||
                    el.hasAttribute('data-state') ||
                    el.hasAttribute('data-side') ||
                    
                    // Radix UI specific patterns
                    className.includes('data-[state=closed]') ||
                    className.includes('data-[state=open]') ||
                    className.includes('radix-collapsible') ||
                    el.hasAttribute('data-radix-scroll-area-viewport') ||
                    
                    // Image handling
                    (tagName === 'img' && (
                      el.closest('[data-role="search-images"], [data-component="avatar"]') ||
                      className.includes('aspect-square') // Favicons
                    )) ||
                    
                    // Animation and layout
                    className.includes('data-[state=open]') ||
                    className.includes('data-[state=closed]') ||
                    (className.includes('flex') && className.includes('justify-between')) ||
                    
                    // Collapsible animation artifacts
                    (mutation.type === 'attributes' && 
                     mutation.attributeName === 'style' &&
                     el.hasAttribute('data-radix-collapsible-content')) ||
                    
                    // Specific avatar class patterns
                    (className.includes('relative') && 
                     className.includes('flex') && 
                     className.includes('shrink-0') &&
                     className.includes('overflow-hidden')) ||
                    className.includes('rounded-full') ||
                    (className.includes('h-4') && className.includes('w-4')) ||
                    
                    // Critical fix: Detect avatar fallback spans
                    (tagName === 'span' && className === 'flex') ||
                    
                    // Avatar parent checks 
                    el.parentElement?.className?.includes('rounded-full') ||
                    
                    // Detect avatar loading images
                    (tagName === 'img' && className.includes('aspect-square')) ||
                    
                    // Detect search result containers
                    el.closest('[class*="rounded-lg border"]') ||
                    
                    // Detect collapsible animation containers
                    el.id?.startsWith('radix-:') ||
                    className.includes('animate-collapse')
                  );
                  
                  if (isUI) {
                    console.log(`  → Identified UI element: ${tagName}.${className.split(' ')[0]}`);
                    return true;
                  }
                  
                  // Check children recursively
                  return Array.from(el.children).some(child => 
                    checkElement(child as HTMLElement, depth + 1)
                  );
                };

                return checkElement(element);
              };

              // Check if any added/removed node is NOT a UI element
              const contentNodes = [...mutation.addedNodes, ...mutation.removedNodes].filter(
                node => !isUIElement(node)
              );
              
              if (contentNodes.length > 0) {
                const node = contentNodes[0] as HTMLElement;
                const nodeInfo = node.nodeType === Node.ELEMENT_NODE 
                  ? (node as HTMLElement).tagName?.toLowerCase() + 
                    (node.className && typeof node.className === 'string' 
                      ? `.${node.className.split(' ')[0]}` : '')
                  : node.nodeType === Node.TEXT_NODE 
                    ? `text: "${(node as unknown as Text).data?.substring(0, 20)}..."` 
                    : node.nodeType;
                
                // DOM path for the content node
                const getNodePath = (n: Node): string => {
                  if (n.nodeType !== Node.ELEMENT_NODE) return 'non-element';
                  
                  const el = n as HTMLElement;
                  const path: string[] = [];
                  let currentEl: HTMLElement | null = el;
                  
                  while (currentEl && currentEl !== document.body && path.length < 5) {
                    const tag = currentEl.tagName?.toLowerCase() || 'unknown';
                    const cls = typeof currentEl.className === 'string' 
                      ? currentEl.className.split(' ')[0] 
                      : '';
                    path.unshift(`${tag}${cls ? `.${cls}` : ''}`);
                    currentEl = currentEl.parentElement;
                  }
                  
                  return path.join(' > ');
                };
                
                const targetElement = mutation.target as HTMLElement;
                triggeringMutation = mutation;
                triggeringReason = `DOM ${mutation.addedNodes.length > 0 ? 'addition' : 'removal'} on ${targetElement.tagName?.toLowerCase()}.${typeof targetElement.className === 'string' ? targetElement.className.split(' ')[0] : ''}: ${nodeInfo} [Path: ${getNodePath(node)}]`;
                unignoredCount++;
                return true;
              } else {
                console.log('  → No content nodes found (all were UI elements)');
                ignoredCount++;
              }
            } else {
              ignoredCount++;
            }
          }
          
          // Ignore attribute changes by default
          if (mutation.type === 'attributes') {
            ignoredCount++;
            return false;
          }
          
          ignoredCount++;
          return false;
        });
        
        if (shouldScroll && triggeringMutation) {
          console.log(`[useScrollToBottom] Content change detected: ${triggeringReason}`);
          console.log(`[useScrollToBottom] Mutation stats: ${totalCount} total, ${unignoredCount} triggered scroll, ${ignoredCount} ignored`);
          
          // Log additional ancestry information
          const triggerTarget = (triggeringMutation as MutationRecord).target as HTMLElement;
          let ancestors = '';
          let currentEl: HTMLElement | null = triggerTarget.parentElement;
          let depth = 0;
          while (currentEl && depth < 5) {
            const tag = currentEl.tagName?.toLowerCase() || 'unknown';
            const classes = typeof currentEl.className === 'string' 
              ? currentEl.className.split(' ').slice(0, 3).join(' ') 
              : '';
            const dataAttrs = Array.from(currentEl.attributes || [])
              .filter(attr => attr.name.startsWith('data-'))
              .map(attr => `[${attr.name}]`)
              .join('');
            ancestors += `\n    ${depth+1}. ${tag}${classes ? `.${classes}` : ''}${dataAttrs}`;
            currentEl = currentEl.parentElement;
            depth++;
          }
          
          console.log(`  Scrolling ancestry:${ancestors || ' none'}`);
        
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