import { CheckoutPage } from "@/features/checkout/public/checkout-page";
import { Profile } from "@/features/profile";

export const App = () => [CheckoutPage, Profile] as const;
