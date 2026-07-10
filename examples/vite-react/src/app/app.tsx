import { useState, useSyncExternalStore } from "react";
import { AppProviders } from "@/app/providers";
import { CatalogPage } from "@/features/catalog/public/catalog-page";
import { CheckoutPage } from "@/features/checkout/public/checkout-page";
import {
  addNotification,
  getUnreadCount,
  subscribeNotifications,
} from "@/features/notifications/public/notifications-api";
import { NotificationsPanel } from "@/features/notifications/public/notifications-panel";
import { Profile } from "@/features/profile";
import { getCartItemCount, subscribeCart } from "@/services/cart/public/cart";
import { Badge } from "@/shared/ui/badge";
import "./app.css";

type Section = "catalog" | "checkout" | "notifications" | "profile";

const sections: { id: Section; label: string }[] = [
  { id: "catalog", label: "Catalog" },
  { id: "checkout", label: "Checkout" },
  { id: "notifications", label: "Notifications" },
  { id: "profile", label: "Profile" },
];

export const App = () => {
  const [section, setSection] = useState<Section>("catalog");
  const cartCount = useSyncExternalStore(subscribeCart, getCartItemCount);
  const unreadCount = useSyncExternalStore(
    subscribeNotifications,
    getUnreadCount
  );

  const handleAddedToCart = (productName: string) => {
    addNotification(`Added “${productName}” to cart`);
  };

  return (
    <AppProviders>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header__title">
            <h1>Mini Shop</h1>
            <p className="app-header__tagline">DMA layout reference</p>
          </div>

          <div className="app-header__status">
            {cartCount > 0 ? (
              <Badge variant="accent">{cartCount} in cart</Badge>
            ) : null}
            {unreadCount > 0 ? <Badge>{unreadCount} unread</Badge> : null}
          </div>

          <nav aria-label="Main" className="app-nav">
            <ul>
              {sections.map(({ id, label }) => (
                <li key={id}>
                  <button
                    aria-current={section === id ? "page" : undefined}
                    onClick={() => setSection(id)}
                    type="button"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="app-main">
          {section === "catalog" ? (
            <CatalogPage onAddedToCart={handleAddedToCart} />
          ) : null}
          {section === "checkout" ? <CheckoutPage /> : null}
          {section === "notifications" ? <NotificationsPanel /> : null}
          {section === "profile" ? <Profile /> : null}
        </main>
      </div>
    </AppProviders>
  );
};
