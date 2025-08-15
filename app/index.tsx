import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-dark-200 text-5xl">Welcome!</Text>
      <Link href='/onboarding'>Onboarding</Link>
    </View>
  );
}
