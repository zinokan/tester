import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const LoadingScreen = () => {
  return (
    <LinearGradient
      colors={['#FF6B6B', '#FF8E8E']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>Zenni</Text>
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
        <Text style={styles.text}>Loading...</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  loader: {
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
});

export default LoadingScreen;