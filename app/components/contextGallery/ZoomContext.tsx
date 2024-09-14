import { createContext, useContext, useState } from 'react';

const ZoomContext = createContext<{ imgZoomed: string | null; setImgZoomed: (key: string | null) => void } | undefined>(undefined);

export const ZoomProvider = ({ children }: { children: React.ReactNode }) => {
    const [imgZoomed, setImgZoomed] = useState<string | null>(null);

    return (
        <ZoomContext.Provider value={{ imgZoomed, setImgZoomed }}>
            {children}
        </ZoomContext.Provider>
    );
};

export const useZoom = () => {
    const context = useContext(ZoomContext);
    if (!context) {
        throw new Error('useZoom must be used within a ZoomProvider');
    }
    return context;
};
