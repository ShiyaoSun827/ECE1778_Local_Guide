// frontend/app/signup.tsx
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

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert("Error", "Email, name and password cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        console.log("Sign-up error (Better Auth):", error);
        Alert.alert("Sign up failed", error.message ?? "Unknown error");
        return;
      }


      Alert.alert(
        "Success",
        "Signup successful! Please check your email to verify your account before signing in."
      );

      router.replace("/signin");
    } catch (err: any) {
      console.error("Sign-up error (network):", err);
      console.error("Error details:", {
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
        cause: err?.cause,
      });
      
      // Provide more helpful error messages
      let errorMessage = "Network request failed";
      if (err?.message?.includes("Network request failed")) {
        errorMessage = "Cannot connect to server. Please check:\n1. Your internet connection\n2. The backend is running\n3. Try restarting the app";
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      Alert.alert("Sign up failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your Local Guide account</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

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
        placeholder="Password (min 8 characters)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={loading ? "Signing up..." : "Sign Up"}
        onPress={handleSignUp}
      />

      <View style={{ height: 12 }} />

      <Button
        title="Already have an account? Sign In"
        onPress={() => router.push("/signin")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  title: {
    fontSize: 22,
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
