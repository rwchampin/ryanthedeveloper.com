// useCanvasStore.tsx
import { create } from 'zustand';

const useCanvasStore = create( ( set, get ) => ( {
    views: [],
    removeView: ( id ) => set( ( state ) => ( {
        views: state.views.filter( ( view ) => view.id !== id ),
    } ) ),
    addView: ( view ) => set( ( state ) => ( {
        views: [ ...state.views, view ],
    } ) ),
} ) );

export default useCanvasStore;