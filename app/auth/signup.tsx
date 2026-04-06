import { router } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator, Alert,
  Animated, Keyboard,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native'
import { supabase } from '../../lib/supabase'

export default function SignupScreen() {
  const [FullName, setFullName] = useState('')
  const [phone, setPhone]       = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const [focusedField, setFocusedField] = useState('')
   const cardAnim   = useRef(new Animated.Value(0)).current
  /*
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
     }, [])*/
  const validate = () => {
    if (!FullName.trim()) {
      Alert.alert('Missing Name', 'Please enter your full name')
      return false
    }
    if (!phone.trim() || phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number')
      return false
    }
    if (!phone.startsWith('98') && !phone.startsWith('97')) {
      Alert.alert('Invalid Phone', 'Please enter a valid Nepal phone number starting with 98 or 97')
      return false
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address')
      return false
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters')
      return false
    }
    return true
  }

  const handleSignup = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: FullName.trim(),
            phone: phone.trim(),
          }
        }
      })

      if (error) throw error

      Alert.alert(
        '🎉 Account Created!',
        'Welcome to QueueZero! You can now book your appointments.',
        [{ text: 'Get Started', onPress: () => router.replace('booking/select-service') }]
      )

    } catch (error: any) {
      Alert.alert(
        'Signup Failed',
        error.message === 'User already registered'
          ? 'An account with this email already exists. Please login instead.'
          : error.message
      )
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field: string) => ([
    styles.inputWrapper,
    focusedField === field && styles.inputFocused
  ])

  function getHint(): string {
    throw new Error('Function not implemented.')
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
        {/* Top space */}
                <View style={{ height: 50 }} />
        
                {/* App name */}
                <Animated.View style={{ opacity: cardAnim, alignItems: 'center' }}>
                  <Text style={styles.appName}>
                    Queue<Text style={styles.appAccent}>Zero</Text>
                  </Text>
                  <Text style={styles.appTagline}>queuezerogit </Text>
                </Animated.View>
        
                {/* Hippo animation — shrinks on keyboard 
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
                </Animated.View>*/}
        
                {/* Hint text — hidden when keyboard open */}
                {!setKeyboardOpen && (
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
                ]}></Animated.View>
        <View style={styles.topSpace} />

        {/* Card */}
        <View style={styles.card}>

          {/* Header */}
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Queuezero</Text>

          <View style={styles.divider} />

          {/* Full Name */}
          <Text style={styles.label}>FULL NAME</Text>
          <View style={inputStyle('name')}>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#B0BEC5"
              value={FullName}
              onChangeText={setFullName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField('')}
              autoCapitalize="words"
            />
          </View>

          {/* Phone */}
          <Text style={styles.label}>PHONE NUMBER</Text>
          <View style={inputStyle('phone')}>
            <Text style={styles.phonePrefix}>🇳🇵 +977  </Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="98XXXXXXXX"
              placeholderTextColor="#B0BEC5"
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField('')}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={inputStyle('email')}>
            <TextInput
              style={styles.input}
              placeholder="name@email.com"
              placeholderTextColor="#B0BEC5"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>PASSWORD</Text>
          <View style={inputStyle('password')}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Min. 6 characters"
              placeholderTextColor="#B0BEC5"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity
              onPress={() => setShowPass(!showPass)}
              style={styles.eyeBtn}
            >
              <Text>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          {/* <Text style={styles.label}>CONFIRM PASSWORD</Text> 
          <View style={inputStyle('confirm')}>
            <TextInput
              style={styles.input}
              placeholder="Repeat your password"
              placeholderTextColor="#B0BEC5"
              value={confirm}
              onChangeText={setConfirm}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField('')}
              secureTextEntry={!showPass}
            />*/}
            {/* Match indicator 
            {confirm.length > 0 && (
              <Text style={styles.matchIcon}>
                {password === confirm ? '✅' : '❌'}
              </Text>
            )}
          </View>*/} 

          {/* Password strength indicator */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={[
                styles.strengthBar,
                { backgroundColor: password.length < 6 ? '#E63946' : password.length < 10 ? '#FFD60A' : '#22C55E' }
              ]} />
              <Text style={styles.strengthText}>
                {password.length < 6 ? 'Too short' : password.length < 10 ? 'Good' : 'Strong 💪'}
              </Text>
            </View>
          )}

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpBtn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.signUpText}>Sign Up  →</Text>
            }
          </TouchableOpacity>

          {/* Login link */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account?  </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.bottomLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* HIPAA Badge */}
        <View style={styles.hipaaRow}>
          <Text style={styles.hipaaIcon}>🛡️</Text>
          <Text style={styles.hipaaText}>SECURE HIPAA COMPLIANT PLATFORM</Text>
        </View>

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
  topSpace:    { height: 60 },
  bottomSpace: { height: 40 },
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
    fontSize: 24,
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
    marginVertical: 20,
  },

  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78909C',
    letterSpacing: 1,
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
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
  eyeBtn:     { paddingLeft: 10 },
  phonePrefix:{ fontSize: 14, color: '#78909C', marginRight: 4 },
  matchIcon:  { fontSize: 16 },

  // Password strength
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 16,
    gap: 10,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    color: '#78909C',
    fontWeight: '600',
  },

  

  signUpBtn: {
    backgroundColor: '#1E4DB7',
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#1E4DB7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  signUpText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  bottomText: { fontSize: 14, color: '#78909C' },
  bottomLink: { fontSize: 14, color: '#1E4DB7', fontWeight: 'bold' },

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

function setKeyboardOpen(arg0: boolean) {
  throw new Error('Function not implemented.')
}
