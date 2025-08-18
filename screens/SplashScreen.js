import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home'); // Adjust 'Home' based on your setup
    }, 2000); // 2 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logos/GSE.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome to QuickBill!</Text>
      <Text style={styles.subtitle}>Your billing, simplified.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 18,
  },
  title: {
    color: '#1a237e',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#555555',
    fontSize: 16,
    marginTop: 8,
  },
});
