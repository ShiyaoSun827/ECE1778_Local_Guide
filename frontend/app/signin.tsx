// frontend/app/signin.tsx
import { useState } from "react";
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

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await authClient.signIn.email({
        email,
        password,
      });


      router.replace("/places");
    } catch (err: any) {
      console.log("Sign-in error:", err);
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
