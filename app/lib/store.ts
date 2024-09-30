import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { gallerySlice } from "./features/gallery/gallerySlice";
import { userGallerySlice } from "./features/userGallery/userGallerySlice";
import { mobileSlice } from "./features/mobileSlice/mobileSlice";

// `combineSlices` automáticamente combina los reductores usando
// sus `reducerPath`, por lo que ya no necesitamos llamar a `combineReducers`.
const rootReducer = combineSlices( gallerySlice, userGallerySlice, mobileSlice);

// Inferimos el tipo `RootState` a partir del `rootReducer`
export type RootState = ReturnType<typeof rootReducer>;

// `makeStore` encapsula la configuración de la tienda para permitir
// crear instancias únicas de la tienda, lo que es particularmente
// importante para el renderizado del lado del servidor (SSR).
export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    // Modificamos los middleware predeterminados
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Deshabilitar el chequeo de serialización para mejorar el rendimiento
        serializableCheck: false,
        // Deshabilitar el chequeo de inmutabilidad para mejorar el rendimiento
        immutableCheck: false,
      })
  });
};

// Inferimos el tipo de retorno de `makeStore`
export type AppStore = ReturnType<typeof makeStore>;
// Inferimos el tipo `AppDispatch` a partir de la tienda
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
