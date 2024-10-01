import { create } from 'zustand';

type RefMap = Record<string, React.RefObject<any>>;

interface DebugStore {
    debugData: any;
    setDebugData: (value: any,key:any) => void;
    removeDebugData: (key: string) => void;
    clearDebugData: () => void;
    debugMode: boolean;
    showAxesHelper: boolean;
    toggleAxesHelper: () => void;
    showGridHelper: boolean;
    toggleGridHelper: () => void;
    showStats: boolean;
    toggleStats: () => void;
    useOrbitControls: boolean;
    toggleOrbitControls: () => void;
    usePointerLockControls: boolean;
    togglePointerLockControls: () => void;


    toggleDebugMode: () => void;
    setDebugMode: (value: boolean) => void;
    initDebugEventListeners: () => void;
    clearDebugEventListeners: () => void;
    debugPanelVisible: boolean;
    toggleDebugPanel: () => void;
    setDebugPanel: (value: boolean) => void;
    debugPanelDockPosition: number[];
    isDebugPanelLocked: boolean;
    setDebugPanelDockPosition: (value: number[]) => void;
    toggleDebugPanelLock: () => void;
}

export const useDebugStore = create<DebugStore>((set) => ({
    debugData: {},
    setDebugData: (key:any,value:any) => {
        set((state) => ({
            debugData: {
                ...state.debugData,
                [key]: value,
            },
        }));
    },
    removeDebugData: (key) => {
        set((state) => {
            const { [key]: _, ...rest } = state.debugData;
            return {
                debugData: rest,
            };
        });
    },
    clearDebugData: () => {
        set({ debugData: {} });
    },
    debugMode: false,
    showAxesHelper: false,
    showGridHelper: false,
    showStats: false,
    useOrbitControls: false,
    usePointerLockControls: false,
    debugPanelVisible: false,
    debugPanelDockPosition: [0, 0],
    isDebugPanelLocked: false,
    clearDebugEventListeners: () => {
        document.removeEventListener('keydown', () => { });
    },
    initDebugEventListeners: () => {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'd') {
                set((state) => ({
                    debugMode: !state.debugMode,
                }));
            }
            if (e.key === 'p') {
                set((state) => ({
                    debugPanelVisible: !state.debugPanelVisible,
                }));
            }
        });
    },
    toggleDebugMode: () => {
        set((state) => ({
            debugMode: !state.debugMode,
        }));
    },
    setDebugMode: (value: boolean) => {
        set((state) => ({
            debugMode: value,
        }));
    },
    toggleDebugPanel: () => {
        set((state) => ({
            debugPanelVisible: !state.debugPanelVisible,
        }));
    },
    setDebugPanel: (value: boolean) => {
        set((state) => ({
            debugPanelVisible: value,
        }));
    },
    setDebugPanelDockPosition: (value: number[]) => {
        set((state) => ({
            debugPanelDockPosition: value,
        }));
    },
    toggleDebugPanelLock: () => {
        set((state) => ({
            isDebugPanelLocked: !state.isDebugPanelLocked,
        }));
    },
    toggleAxesHelper: () => {
        set((state) => ({
            showAxesHelper: !state.showAxesHelper,
        }));
    },
    toggleGridHelper: () => {
        set((state) => ({
            showGridHelper: !state.showGridHelper,
        }));
    },
    toggleStats: () => {
        set((state) => ({
            showStats: !state.showStats,
        }));
    },
    toggleOrbitControls: () => {
        set((state) => ({
            useOrbitControls: !state.useOrbitControls,
        }));
    },
    togglePointerLockControls: () => {
        set((state) => ({
            usePointerLockControls: !state.usePointerLockControls,
        }));
    },
    toggleDeviceOrientationControls: () => {
        set((state) => ({
            useDeviceOrientationControls: !state.useDeviceOrientationControls,
        }));
    },
    toggleDragControls: () => {
        set((state) => ({
            useDragControls: !state.useDragControls,
        }));
    },
    toggleTransformControls: () => {
        set((state) => ({
            useTransformControls: !state.useTransformControls,
        }));
    },

    usePresentationControls: false,
    togglePresentationControls: () => {
        set((state) => ({
            usePresentationControls: !state.usePresentationControls,
        }));
    },

    useTransformControls: false,
    toggleTransformControls: () => {
        set((state) => ({
            useTransformControls: !state.useTransformControls,
        }));
    },


}));
