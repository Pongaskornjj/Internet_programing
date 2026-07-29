import { useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useApp } from "../context/AppContext";

export default function Login() {
  const { user, login, register, logout, authError } = useApp();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ออกจากระบบ", style: "destructive", onPress: logout },
    ]);
  };

  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text></View>
          <Text style={styles.profileName}>{user.username}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={{ backgroundColor: user.role === "admin" ? "#bfa14a" : "#e0e0e0", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 20 }}>
            <Text style={{ color: user.role === "admin" ? "#fff" : "#555", fontSize: 11, fontWeight: "700" }}>
              {user.role === "admin" ? "ADMIN" : "USER"}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (mode === "login") {
        const ok = await login(username.trim(), password);
        if (!ok) Alert.alert("เข้าสู่ระบบไม่สำเร็จ", authError ?? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      } else {
        if (!username.trim() || !email.trim() || !password.trim()) {
          Alert.alert("กรอกข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
          return;
        }
        const ok = await register(username.trim(), email.trim(), password);
        if (!ok) Alert.alert("สมัครไม่สำเร็จ", authError ?? "มีชื่อผู้ใช้นี้อยู่แล้ว");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.header}>{mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</Text>
        <Text style={styles.label}>ชื่อผู้ใช้</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" placeholder="username" />
        {mode === "register" && (
          <>
            <Text style={styles.label}>อีเมล</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="email@example.com" />
          </>
        )}
        <Text style={styles.label}>รหัสผ่าน</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••" />
        <TouchableOpacity style={[styles.submitButton, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.submitButtonText}>
            {submitting ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode(mode === "login" ? "register" : "login")}>
          <Text style={styles.switchText}>{mode === "login" ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"}</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>ทดลองใช้: username "admin" / password "1234"</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  form: { padding: 24, paddingTop: 40 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 24, color: "#222", textAlign: "center" },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: "#eee", fontSize: 14 },
  submitButton: { backgroundColor: "#000", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 26 },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  switchText: { color: "#bfa14a", textAlign: "center", marginTop: 18, fontWeight: "600", fontSize: 13 },
  hint: { textAlign: "center", color: "#aaa", fontSize: 11, marginTop: 30 },
  profileCard: { alignItems: "center", padding: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#000", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  avatarText: { color: "#bfa14a", fontSize: 32, fontWeight: "700" },
  profileName: { fontSize: 18, fontWeight: "700", color: "#222" },
  profileEmail: { fontSize: 13, color: "#999", marginTop: 4, marginBottom: 24 },
  logoutButton: { borderWidth: 1, borderColor: "#e63946", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  logoutButtonText: { color: "#e63946", fontWeight: "700" },
});