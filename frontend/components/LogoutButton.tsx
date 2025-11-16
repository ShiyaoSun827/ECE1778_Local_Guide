// frontend/components/LogoutButton.tsx
import { Button, Alert } from "react-native";
import { authClient } from "../lib/authClient";
import { useRouter } from "expo-router";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.replace("/signin");
    } catch (err: any) {
      console.log("Sign-out error:", err);
      Alert.alert("Logout failed", err?.message ?? "Unknown error");
    }
  };

  return <Button title="Logout" onPress={handleLogout} />;
}
