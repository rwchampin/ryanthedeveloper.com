export const useSpeed = () => {
    // fn to calculate speed of a function
    const calculateSpeed = ( fn ) => {
        const start = performance.now();
        fn();
        const end = performance.now();
        return end - start;
    };
    return { calculateSpeed };
}