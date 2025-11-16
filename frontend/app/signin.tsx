// frontend/app/signin.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { authClient } from "../lib/authClient";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { data: session, isLoading } = authClient.useSession();

  // 如果已经登录，又访问 /signin，就直接跳回首页
  useEffect(() => {
    if (!isLoading && session?.user) {
      router.replace("/");
    }
  }, [isLoading, session, router]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        console.log("Sign-in error (Better Auth):", error);
        Alert.alert("Login failed", error.message ?? "Unknown error");
        return;
      }

      // ✅ 登录成功 → 回到 layout 的首页
      router.replace("/");
    } catch (err: any) {
      console.log("Sign-in error (network):", err);
      Alert.alert("Login failed", err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In to Local Guide</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={loading ? "Signing in..." : "Sign In"}
        onPress={handleSignIn}
      />

      <View style={{ height: 12 }} />

      <Button
        title="No account? Sign Up"
        onPress={() => router.push("/signup")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
});
