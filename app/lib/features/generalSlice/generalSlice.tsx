// features/gallery/gallerySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getCookie } from "../../utils/utils";

const isRedditToken = getCookie("reddit-token");
console.log(!isRedditToken);

interface GalleryState {
  isAuthorized: boolean,
}

const initialState: GalleryState = {
  isAuthorized: !isRedditToken ? false : true
};

export const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    setAuthorized(state, action: PayloadAction<boolean>) {
      state.isAuthorized = action.payload;
    },
  }
});

export const {
  setAuthorized,
} = generalSlice.actions;
export default generalSlice.reducer;

