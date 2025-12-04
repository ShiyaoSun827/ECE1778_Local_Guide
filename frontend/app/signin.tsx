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

  // If already logged in and accessing /signin, redirect to home page
  useEffect(() => {
    if (!isLoading && session?.user) {
      console.log("Already signed in, redirect to /");
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

      console.log("Sign-in success, data:", data);
      Alert.alert("Success", "Login successful!", [
        {
          text: "OK",
          onPress: () => {
            
            router.replace("/");
          },
        },
      ]);
    } catch (err: any) {
      console.error("Sign-in error (network):", err);
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
      
      Alert.alert("Login failed", errorMessage);
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
