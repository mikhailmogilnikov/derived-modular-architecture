import type { CartItem } from "./cart.types";

export interface CartSeedPort {
	getInitialItems(): readonly CartItem[];
}

let cartSeedPort: CartSeedPort = {
	getInitialItems: () => [],
};

export const provideCartSeed = (port: CartSeedPort): void => {
	cartSeedPort = port;
};

export const getCartSeed = (): CartSeedPort => cartSeedPort;
