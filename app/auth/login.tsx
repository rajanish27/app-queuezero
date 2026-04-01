import { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Platform, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView,
  Animated, Keyboard
} from 'react-native'
import LottieView from 'lottie-react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function LoginScreen() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [focusedField, setFocusedField] = useState('idle')
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  const lottieRef  = useRef<LottieView>(null)
  const owlSize    = useRef(new Animated.Value(180)).current
  const owlOpacity = useRef(new Animated.Value(1)).current
  const cardAnim   = useRef(new Animated.Value(0)).current
  const floatAnim  = useRef(new Animated.Value(0)).current

  // ── Card slide-in on mount ──────────────────────────────────────
  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start()
  }, [])

  // ── Gentle float up/down ────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start()
  }, [])

  // ── Keyboard listener — shrink hippo when keyboard opens ────────
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true)
      Animated.parallel([
        Animated.timing(owlSize, {
          toValue: 90,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(owlOpacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start()
    })

    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false)
      Animated.parallel([
        Animated.timing(owlSize, {
          toValue: 180,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(owlOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start()
    })

    return () => { show.remove(); hide.remove() }
  }, [])

  // ── Play correct animation segment based on focused field ───────
  const PRIVATE_FIELDS = ['password', 'confirm', 'phone']
  useEffect(() => {
  if (!lottieRef.current) return

  if (PRIVATE_FIELDS.includes(focusedField)) {
    // Looks away for password, confirm password and phone
    lottieRef.current.play(80, 119)

  } else if (focusedField === 'idle') {
    // Idle bounce
    lottieRef.current.play(40, 79)

  } else {
    // Waves hello for name and email
    lottieRef.current.play(0, 39)
  }
}, [focusedField])
  // ── Login handler ───────────────────────────────────────────────
  const handleLogin = async () => {
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

  // ── Hint text based on state ────────────────────────────────────
  const getHint = () => {
    if (focusedField === 'password') return "🙈 I won't look!"
    if (focusedField === 'email')    return '👋 Hello there!'
    return '🦛 Ready to book!'
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
        bounces={false}
      >
        {/* Top space */}
        <View style={{ height: 50 }} />

        {/* App name */}
        <Animated.View style={{ opacity: cardAnim, alignItems: 'center' }}>
          <Text style={styles.appName}>
            Queue<Text style={styles.appAccent}>Zero</Text>
          </Text>
          <Text style={styles.appTagline}>🏥 Smart Hospital Booking</Text>
        </Animated.View>

        {/* Hippo animation — shrinks on keyboard */}
        <Animated.View style={[
          styles.hippoContainer,
          {
            width:   owlSize,
            height:  owlSize,
            opacity: owlOpacity,
            transform: [{ translateY: floatAnim }]
          }
        ]}>
          <LottieView
            ref={lottieRef}
            source={require('../../assets/animations/hippo.json')}
            autoPlay={false}
            loop={true}
            style={{ width: '100%', height: '100%' }}
            onLayout={() => {
              // Start with idle on load
              lottieRef.current?.play(40, 79)
            }}
          />
        </Animated.View>

        {/* Hint text — hidden when keyboard open */}
        {!keyboardOpen && (
          <Animated.Text style={[styles.hint, { opacity: cardAnim }]}>
            {getHint()}
          </Animated.Text>
        )}

        {/* Card — slides up on mount */}
        <Animated.View style={[
          styles.card,
          {
            opacity: cardAnim,
            transform: [{
              translateY: cardAnim.interpolate({
                inputRange:  [0, 1],
                outputRange: [50, 0],
              })
            }]
          }
        ]}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>

          <View style={styles.divider} />

          {/* Email field */}
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={[
            styles.inputWrapper,
            focusedField === 'email' && styles.inputFocused
          ]}>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#B0BEC5"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('idle')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password field */}
          <View style={styles.passwordHeader}>
            <Text style={styles.label}>PASSWORD</Text>
            <TouchableOpacity>
              <Text style={styles.forgot}>Forgot?</Text>
            </TouchableOpacity>
          </View>
          <View style={[
            styles.inputWrapper,
            focusedField === 'password' && styles.inputFocused
          ]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#B0BEC5"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('idle')}
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

          {/* Sign In button */}
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

          {/* Quick connect divider */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>QUICK CONNECT</Text>
            <View style={styles.orLine} />
          </View>

          {/* Google button */}
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Create account */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>New here?  </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text style={styles.bottomLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* HIPAA badge */}
        <View style={styles.hipaaRow}>
          <Text style={styles.hipaaIcon}>🛡️</Text>
          <Text style={styles.hipaaText}>SECURE HIPAA COMPLIANT PLATFORM</Text>
        </View>

        <View style={{ height: 40 }} />
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

  // App name
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  appAccent: {
    color: '#1E4DB7',
  },
  appTagline: {
    fontSize: 12,
    color: '#78909C',
    marginTop: 2,
    marginBottom: 4,
  },

  // Hippo
  hippoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  hint: {
    fontSize: 13,
    color: '#78909C',
    fontStyle: 'italic',
    marginBottom: 8,
  },

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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#78909C',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
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
    marginBottom: 18,
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
  eyeBtn:  { paddingLeft: 10 },
  eyeIcon: { fontSize: 16 },

  // Password row
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgot: {
    fontSize: 13,
    color: '#1E4DB7',
    fontWeight: '600',
    marginBottom: 8,
  },

  // Button
  signInBtn: {
    backgroundColor: '#1E4DB7',
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
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

  // OR row
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

  // Google
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
  googleG: {
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
  bottomText: { fontSize: 14, color: '#78909C' },
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