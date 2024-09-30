'use client';

import { type ElementRef, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dialogRef = useRef<ElementRef<'dialog'>>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    
    return () => {
      if (dialog) {
        dialog.removeEventListener('close', onDismiss);
      }
    };
  }, []);

  function onDismiss() {
    router.back();
  }

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <dialog 
        ref={dialogRef} 
        className="m-0 max-w-full h-full overflow-auto" 
        onClose={onDismiss}
      >
        <div className="relative w-full h-full">
          {children}
          <button 
            className="absolute top-2 right-2" 
            onClick={onDismiss}
          >
            X
          </button>
        </div>
      </dialog>
    </div>,
    document.getElementById('root')!
  );
}
