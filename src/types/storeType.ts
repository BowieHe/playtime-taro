// Define store interfaces
export interface CounterStore {
  counter: number;
  counterStore(): void;
  increment(): void;
  decrement(): void;
  incrementAsync(): void;
}
