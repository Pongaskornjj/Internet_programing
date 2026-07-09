import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useApp } from "../context/AppContext";

const STORES = [
  { name: "BRAND NAME.J - สาขาสยามพารากอน", address: "991 ถ.พระราม 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330", hours: "10:00 - 22:00 น. ทุกวัน", phone: "02-123-4567" },
  { name: "BRAND NAME.J - สาขาเซ็นทรัลเวิลด์", address: "4 ถ.ราชดำริ แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330", hours: "10:00 - 22:00 น. ทุกวัน", phone: "02-234-5678" },
];

export default function Brand() {
  const { products } = useApp();
  const brands = useMemo(() => {
    const map = {};
    products.forEach((p) => { map[p.brand] = (map[p.brand] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [products]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.sectionTitle}>แบรนด์ทั้งหมด</Text>
        <View style={styles.brandGrid}>
          {brands.map(([brand, count]) => (
            <View key={brand} style={styles.brandCard}>
              <Text style={styles.brandName}>{brand}</Text>
              <Text style={styles.brandCount}>{count} รายการ</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>สาขาร้านค้า</Text>
        {STORES.map((store) => (
          <View key={store.name} style={styles.storeCard}>
            <View style={styles.storeIconWrap}><Ionicons name="storefront" size={20} color="#bfa14a" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>{store.name}</Text>
              <Text style={styles.storeDetail}>{store.address}</Text>
              <Text style={styles.storeDetail}>เวลาเปิด: {store.hours}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${store.phone}`)}>
                <Text style={styles.storePhone}>โทร {store.phone}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#222", marginBottom: 12 },
  brandGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  brandCard: { backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: "#eee" },
  brandName: { fontWeight: "700", color: "#222", fontSize: 14 },
  brandCount: { fontSize: 11, color: "#999", marginTop: 2 },
  storeCard: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, gap: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  storeIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#f8f3e7", alignItems: "center", justifyContent: "center" },
  storeName: { fontWeight: "700", fontSize: 14, color: "#222", marginBottom: 4 },
  storeDetail: { fontSize: 12, color: "#777", marginBottom: 2 },
  storePhone: { fontSize: 12, color: "#bfa14a", fontWeight: "700", marginTop: 4 },
});