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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  authError: string | null;
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  cart: CartItem[];
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
  checkout: () => Promise<Receipt | null>;
  receipts: Receipt[];
  favorites: string[];
  toggleFavorite: (productId: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// ⬇️ แก้ตรงนี้ให้ตรงกับพอร์ตของคุณ (จากตอน SSH เข้าเซิร์ฟเวอร์)
const API_BASE_URL = "http://119.59.102.161:3063/api";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // ฟังก์ชันกลางสำหรับยิง API ทุกจุด แนบ token อัตโนมัติถ้ามี
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  };

  const mapProduct = (row: any): Product => ({
    id: String(row.id),
    name: row.name,
    brand: row.brand,
    price: Number(row.price),
    oldPrice: row.old_price != null ? Number(row.old_price) : null,
    rating: Number(row.rating),
    category: row.category,
    image: row.image,
  });

  // โหลดสินค้าตอนเปิดแอป (public, ไม่ต้อง login)
  useEffect(() => {
    apiCall("/products")
      .then((data) => setProducts(data.map(mapProduct)))
      .catch((err) => console.error("โหลดข้อมูลสินค้าไม่สำเร็จ:", err.message));
  }, []);

  // โหลด cart/favorites/receipts ใหม่ทุกครั้งที่ login สำเร็จ
  useEffect(() => {
    if (!user || !token) return;
    apiCall("/cart").then(setCart).catch((err) => console.error("โหลดตะกร้าไม่สำเร็จ:", err.message));
    apiCall("/favorites").then(setFavorites).catch((err) => console.error("โหลดรายการโปรดไม่สำเร็จ:", err.message));
    apiCall("/receipts").then(setReceipts).catch((err) => console.error("โหลดประวัติการสั่งซื้อไม่สำเร็จ:", err.message));
  }, [user, token]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const data = await apiCall("/login", { method: "POST", body: JSON.stringify({ username, password }) });
      setToken(data.token);
      setUser({ username: data.user.username, email: data.user.email, role: data.user.role });
      return true;
    } catch (err: any) {
      setAuthError(err.message);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const data = await apiCall("/register", { method: "POST", body: JSON.stringify({ username, email, password }) });
      setToken(data.token);
      setUser({ username: data.user.username, email: data.user.email, role: data.user.role });
      return true;
    } catch (err: any) {
      setAuthError(err.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCart([]);
    setFavorites([]);
    setReceipts([]);
  };

  const addProduct = async (product: Omit<Product, "id">): Promise<boolean> => {
    try {
      const created = await apiCall("/products", { method: "POST", body: JSON.stringify(product) });
      setProducts((prev) => [{ ...product, id: String(created.id) }, ...prev]);
      return true;
    } catch (err: any) {
      console.error("เพิ่มสินค้าไม่สำเร็จ:", err.message);
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      await apiCall(`/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setCart((prev) => prev.filter((c) => c.productId !== id));
      return true;
    } catch (err: any) {
      console.error("ลบสินค้าไม่สำเร็จ:", err.message);
      return false;
    }
  };

  // ฝั่งตะกร้า: อัปเดต state ทันที (optimistic) แล้วค่อยยิง API ตาม
  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (existing) return prev.map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + 1 } : c));
      return [...prev, { productId, quantity: 1 }];
    });
    apiCall("/cart", { method: "POST", body: JSON.stringify({ productId }) }).catch((err) =>
      console.error("เพิ่มลงตะกร้าไม่สำเร็จ:", err.message)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
    apiCall(`/cart/${productId}`, { method: "DELETE" }).catch((err) =>
      console.error("ลบออกจากตะกร้าไม่สำเร็จ:", err.message)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, quantity } : c)));
    apiCall(`/cart/${productId}`, { method: "PUT", body: JSON.stringify({ quantity }) }).catch((err) =>
      console.error("อัปเดตจำนวนไม่สำเร็จ:", err.message)
    );
  };

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartTotal = cart.reduce((sum, c) => {
    const p = products.find((p) => p.id === c.productId);
    return sum + (p ? p.price * c.quantity : 0);
  }, 0);

  const checkout = async (): Promise<Receipt | null> => {
    if (cart.length === 0) return null;
    try {
      const receipt: Receipt = await apiCall("/checkout", { method: "POST" });
      setReceipts((prev) => [receipt, ...prev]);
      setCart([]);
      return receipt;
    } catch (err: any) {
      console.error("Checkout ไม่สำเร็จ:", err.message);
      return null;
    }
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => (prev.includes(productId) ? prev.filter((f) => f !== productId) : [...prev, productId]));
    apiCall(`/favorites/${productId}`, { method: "POST" }).catch((err) =>
      console.error("อัปเดตรายการโปรดไม่สำเร็จ:", err.message)
    );
  };

  return (
    <AppContext.Provider
      value={{
        user, login, logout, register, authError,
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