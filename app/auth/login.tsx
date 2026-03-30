import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert, Image
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused, setPassFocused]   = useState(false)

  const handleLogin = async () => {
    // Validation 
    //.trim removes whitespace 
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address')
      return
    }
    if (!password) {
      Alert.alert('Missing Password', 'Please enter your password')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) throw error

      // Success — navigate to main app
      router.replace('/(tabs)')

    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message === 'Invalid login credentials'
          ? 'Wrong email or password. Please try again.'
          : error.message
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      })
      if (error) throw error
    } catch (error: any) {
      Alert.alert('Google Sign In Failed', error.message)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top spacing */}
        <View style={styles.topSpace} />

        {/* Card */}
        <View style={styles.card}>

          {/* Header */}
          <Text style={styles.title}>Queuezero</Text>
          <Text style={styles.subtitle}>Welcome back</Text>

          <View style={styles.divider} />

          {/* Email */}
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={[
            styles.inputWrapper,
            emailFocused && styles.inputFocused
          ]}>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#B0BEC5"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.passwordHeader}>
            <Text style={styles.label}>PASSWORD</Text>
            <TouchableOpacity>
              <Text style={styles.forgot}>Forgot?</Text>
            </TouchableOpacity>
          </View>
          <View style={[
            styles.inputWrapper,
            passFocused && styles.inputFocused
          ]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#B0BEC5"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity
              onPress={() => setShowPass(!showPass)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeIcon}>
                {showPass ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.signInText}>Sign In  →</Text>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>QUICK CONNECT</Text>
            <View style={styles.orLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Create account */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>New here?  </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text style={styles.bottomLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* HIPAA Badge */}
        <View style={styles.hipaaRow}>
          <Text style={styles.hipaaIcon}>🛡️</Text>
          <Text style={styles.hipaaText}>SECURE HIPAA COMPLIANT PLATFORM</Text>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F5',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  topSpace: { height: 80 },
  bottomSpace: { height: 40 },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
  },

  // Header
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#78909C',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 24,
  },

  // Labels
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78909C',
    letterSpacing: 1,
    marginBottom: 8,
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: '#FAFAFA',
    marginBottom: 20,
  },
  inputFocused: {
    borderColor: '#1E4DB7',
    backgroundColor: '#F0F4FF',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  eyeBtn: {
    paddingLeft: 10,
  },
  eyeIcon: {
    fontSize: 16,
  },

  // Password row
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgot: {
    fontSize: 13,
    color: '#1E4DB7',
    fontWeight: '600',
  },

  // Sign in button
  signInBtn: {
    backgroundColor: '#1E4DB7',
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#1E4DB7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },

  // OR divider
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    fontSize: 10,
    color: '#B0BEC5',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginHorizontal: 12,
  },

  // Google button
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    height: 52,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },

  // Bottom
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  bottomText: {
    fontSize: 14,
    color: '#78909C',
  },
  bottomLink: {
    fontSize: 14,
    color: '#1E4DB7',
    fontWeight: 'bold',
  },

  // HIPAA
  hipaaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  hipaaIcon: { fontSize: 12 },
  hipaaText: {
    fontSize: 10,
    color: '#B0BEC5',
    fontWeight: '600',
    letterSpacing: 1,
  },
})