// features/gallery/gallerySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GalleryState {
  isDarkTheme: boolean,
}

const initialState: GalleryState = {
  isDarkTheme: false,
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setDarkTheme(state, action: PayloadAction<boolean>) {
      state.isDarkTheme = action.payload;
    },
  }
});

export const {
  setDarkTheme,
} = themeSlice.actions;
export default themeSlice.reducer;

