import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useApp } from "../context/AppContext";

const CATEGORIES = ["Bags", "Shoes", "Accessories"];

export default function AddProduct() {
  const { user, addProduct } = useApp();
  const router = useRouter();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  if (!user || user.role !== "admin") {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.lockedTitle}>{!user ? "เข้าสู่ระบบก่อนเพิ่มสินค้า" : "เฉพาะแอดมินเท่านั้น"}</Text>
        <Text style={styles.lockedSubtitle}>{!user ? "คุณต้องล็อกอินก่อนจึงจะเพิ่มสินค้าใหม่ได้" : "บัญชีของคุณไม่มีสิทธิ์เพิ่มสินค้า"}</Text>
        <TouchableOpacity style={styles.lockedButton} onPress={() => router.push("/login")}>
        <Text style={styles.lockedButtonText}>ไปหน้าล็อกอิน</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSubmit = () => {
    if (!name.trim() || !brand.trim() || !price.trim() || !image.trim()) {
      Alert.alert("กรอกข้อมูลไม่ครบ", "กรุณากรอกชื่อ แบรนด์ ราคา และรูปภาพ");
      return;
    }
    addProduct({ name: name.trim(), brand: brand.trim(), price: Number(price), oldPrice: oldPrice.trim() ? Number(oldPrice) : null, rating: 5.0, category, image: image.trim() });
    Alert.alert("สำเร็จ", "เพิ่มสินค้าเรียบร้อยแล้ว", [{ text: "ตกลง", onPress: () => router.push("/") }]);
    setName(""); setBrand(""); setPrice(""); setOldPrice(""); setImage("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.header}>เพิ่มสินค้าใหม่</Text>
        <Text style={styles.label}>ชื่อสินค้า</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="เช่น Prada Bag" />
        <Text style={styles.label}>แบรนด์</Text>
        <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="เช่น Prada" />
        <Text style={styles.label}>หมวดหมู่</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c} style={[styles.catChip, category === c && styles.catChipActive]} onPress={() => setCategory(c)}>
              <Text style={[styles.catChipText, category === c && styles.catChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>ราคา (บาท)</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="เช่น 25000" />
        <Text style={styles.label}>ราคาเดิม (ถ้ามีส่วนลด, ไม่บังคับ)</Text>
        <TextInput style={styles.input} value={oldPrice} onChangeText={setOldPrice} keyboardType="numeric" placeholder="เช่น 30000" />
        <Text style={styles.label}>ลิงก์รูปภาพ (URL)</Text>
        <TextInput style={styles.input} value={image} onChangeText={setImage} placeholder="https://..." autoCapitalize="none" />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>เพิ่มสินค้า</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30, backgroundColor: "#f5f5f5" },
  lockedTitle: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 8 },
  lockedSubtitle: { fontSize: 13, color: "#777", textAlign: "center", marginBottom: 20 },
  lockedButton: { backgroundColor: "#000", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  lockedButtonText: { color: "#fff", fontWeight: "700" },
  form: { padding: 20 },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 20, color: "#222" },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: "#eee", fontSize: 14 },
  categoryRow: { flexDirection: "row", gap: 10 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee" },
  catChipActive: { backgroundColor: "#000", borderColor: "#000" },
  catChipText: { fontSize: 13, color: "#555", fontWeight: "600" },
  catChipTextActive: { color: "#fff" },
  submitButton: { backgroundColor: "#bfa14a", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 28 },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});