import { View, Text, StyleSheet } from 'react-native'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Queue<Text style={styles.logoAccent}>Zero</Text></Text>
      <Text style={styles.tagline}>No queue. No stress. No problem.</Text>
      <Text style={styles.sub}>🏥 Smart Hospital Booking</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoAccent: {
    color: '#00B4D8',
  },
  tagline: {
    color: '#90E0EF',
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  sub: {
    color: '#7A9BB0',
    fontSize: 12,
    marginTop: 16,
  }
})