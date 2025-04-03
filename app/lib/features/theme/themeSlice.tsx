// features/gallery/gallerySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getCookie } from "../../utils/utils";

const isDarkTheme = getCookie("dark-theme");
console.log(!isDarkTheme);

interface GalleryState {
  isDarkTheme: boolean,
}

const initialState: GalleryState = {
  isDarkTheme: !isDarkTheme ? false : true,
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

