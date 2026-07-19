import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice: number | null;
  rating: number;
  category: string;
  image: string;
};

export type Role = "admin" | "user";
export type User = { username: string; email: string; role: Role };
export type CartItem = { productId: string; quantity: number };
export type Receipt = {
  id: string;
  date: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
};

type AppContextType = {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (username: string, email: string, password: string) => boolean;
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;
  cart: CartItem[];
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
  checkout: () => Receipt | null;
  receipts: Receipt[];
  favorites: string[];
  toggleFavorite: (productId: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const PRODUCTS_URL =
  "https://raw.githubusercontent.com/Pongaskornjj/Internet_programing/main/products.json";

const MOCK_USERS = [{ username: "admin", password: "1234", email: "admin@brandname.com", role: "admin" as Role }];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState(MOCK_USERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetch(PRODUCTS_URL)
      .then((res) => res.json())
      .then((data: Product[]) => setProducts(data))
      .catch((err) => console.error("โหลดข้อมูลสินค้าไม่สำเร็จ:", err));
  }, []);

  const login = (username: string, password: string) => {
    const found = users.find((u) => u.username === username && u.password === password);
    if (found) { setUser({ username: found.username, email: found.email, role: found.role }); return true; }
    return false;
  };

  const register = (username: string, email: string, password: string) => {
    if (users.some((u) => u.username === username)) return false;
    setUsers((prev) => [...prev, { username, email, password, role: "user" }]);
    setUser({ username, email, role: "user" });
    return true;
  };

  const logout = () => { setUser(null); setCart([]); };

  const addProduct = (product: Omit<Product, "id">) => {
    setProducts((prev) => [{ ...product, id: Date.now().toString() }, ...prev]);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((c) => c.productId !== id));
  };

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (existing) return prev.map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + 1 } : c));
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, quantity } : c)));
  };

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartTotal = cart.reduce((sum, c) => {
    const p = products.find((p) => p.id === c.productId);
    return sum + (p ? p.price * c.quantity : 0);
  }, 0);

  const checkout = (): Receipt | null => {
    if (cart.length === 0) return null;
    const items = cart.map((c) => {
      const p = products.find((p) => p.id === c.productId);
      return { name: p?.name ?? "สินค้าไม่ทราบชื่อ", price: p?.price ?? 0, quantity: c.quantity };
    });
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const receipt: Receipt = { id: Date.now().toString(), date: new Date().toLocaleString("th-TH"), items, total };
    setReceipts((prev) => [receipt, ...prev]);
    setCart([]);
    return receipt;
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((f) => f !== productId) : [...prev, productId]));
  };

  return (
    <AppContext.Provider
      value={{
        user, login, logout, register,
        products, addProduct, deleteProduct,
        cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount, checkout, receipts,
        favorites, toggleFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}