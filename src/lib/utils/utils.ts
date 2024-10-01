import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function whichIsFaster(fn1: Function, fn2: Function) {
  // run each function 10,000 times and measure the time
  let time1 = 0;
  let time2 = 0;
  const count = 10000;

  // measure time of fn1
  let start = Date.now();
  for (let i = 0; i < count; i++) fn1();
  time1 = Date.now() - start;

  // measure time of fn2
  start = Date.now();
  for (let i = 0; i < count; i++) fn2();
  time2 = Date.now() - start;

  // output the result
  console.log(`Time of first function: ${time1}ms`);
  console.log(`Time of second function: ${time2}ms`);
  

  /// return 1 if the first function is faster, 2 if the second one is faster
  return time1 < time2 ? 1 : 2;
}
