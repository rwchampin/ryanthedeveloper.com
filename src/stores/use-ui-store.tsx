import { create } from 'zustand';
import React from 'react';

// Constants for layer names
const CANVAS_LAYER = 'canvas';
const UI_LAYER = 'ui';

// Type definitions for UI layers
type LayerUis = {
  [CANVAS_LAYER]: {
    ui: React.RefObject<HTMLCanvasElement>;
  };
  [UI_LAYER]: {
    ui: React.RefObject<HTMLDivElement>;
  };
};

type UILayers = {
  layers: LayerUis & {
    CANVAS: typeof CANVAS_LAYER;
    UI: typeof UI_LAYER;
  };
};

// Interface for the UI store
interface UiStore {
  ui: Record<string, React.RefObject<any>>;
  activeUiLayer: keyof UILayers['layers'];
  addUi: (key: string, ui: React.RefObject<any>) => void;
  getUi: (key: string) => React.RefObject<any> | undefined;
  removeUi: (key: string) => void;
  clearUis: () => void;
  setActiveUiLayer: (layer: keyof UILayers['layers']) => void;
  clearActiveUiLayer: () => void;
  activateJarvis: () => void;
}

// Create the UI store using Zustand
export const useUiStore = create<UiStore>((set) => ({
  ui: {},
    activeUiLayer: CANVAS_LAYER,
  addUi: (key, ui) => {
    set((state) => {
      console.log(`Adding UI element with key: ${key}`);
      return {
        ui: {
          ...state.ui,
          [key]: ui,
        },
      };
    });
  },
  setActiveUiLayer: (layer) => {
    set({ activeUiLayer: layer });
  },
  clearActiveUiLayer: () => {
    set({ activeUiLayer: CANVAS_LAYER });
  },
  getUi: (key) => {
    console.log(`Getting UI element with key: ${key}`);
    return (state) => state.ui[key];
  },

  removeUi: (key) => {
    set((state) => {
      console.log(`Removing UI element with key: ${key}`);
      const { [key]: _, ...rest } = state.ui;
      return {
        ui: rest,
      };
    });
  },

  clearUis: () => {
    console.log('Clearing all UI elements');
    set({ ui: {} });
  },

  activateJarvis: () => set((state: any) => state.ui['jarvis'] = true as any),

}));

// // Example usage of the UI store in a component
// const CoreCanvas = () => {
//   const { addUi, getUi, removeUi, clearUis } = useUiStore();

//   // Example of adding a UI element
//   const canvasRef = React.createRef<HTMLCanvasElement>();
//   addUi(CANVAS_LAYER, canvasRef);

//   // Example of getting a UI element
//   const retrievedCanvasRef = getUi(CANVAS_LAYER);
//   console.log('Retrieved Canvas Ref:', retrievedCanvasRef);

//   // Example of removing a UI element
//   removeUi(CANVAS_LAYER);

//   // Example of clearing all UI elements
//   clearUis();

//   return (
//     <div>
//       <canvas ref={canvasRef} />
//     </div>
//   );
// };

// export default CoreCanvas;