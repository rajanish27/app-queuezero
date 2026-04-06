import { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, SafeAreaView,
  StatusBar, ActivityIndicator, Alert
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { SERVICES, TIME_SLOTS } from '../../constants/services'

const GENDERS = ['Male', 'Female', 'Other']

export default function SelectSlotScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>()
  const service = SERVICES.find(s => s.id === serviceId)!

  // Dates — tomorrow and day after
  const tomorrow  = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter  = new Date(); dayAfter.setDate(dayAfter.getDate() + 2)

  const formatDate    = (d: Date) => d.toISOString().split('T')[0]
  const formatDisplay = (d: Date) => d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  })
  const formatShort = (d: Date) => d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })
  const formatDay = (d: Date) => d.toLocaleDateString('en-US', {
    weekday: 'long'
  })

  const [selectedDate, setSelectedDate] = useState(formatDate(tomorrow))
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [bookedSlots, setBookedSlots]   = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Patient details
  const [patientName,   setPatientName]   = useState('')
  const [patientPhone,  setPatientPhone]  = useState('')
  const [patientAge,    setPatientAge]    = useState('')
  const [patientGender, setPatientGender] = useState('')
  const [showGender,    setShowGender]    = useState(false)
  const [submitting,    setSubmitting]    = useState(false)

  // Fetch booked slots when date changes
  useEffect(() => {
    fetchBookedSlots()
    setSelectedSlot(null)
  }, [selectedDate])

  const fetchBookedSlots = async () => {
    setLoadingSlots(true)
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('time_slot')
        .eq('appointment_date', selectedDate)
        .eq('service', service.name)
        .eq('status', 'confirmed')

      if (error) throw error
      setBookedSlots(data?.map(d => d.time_slot) || [])
    } catch (err) {
      console.error('Error fetching slots:', err)
    } finally {
      setLoadingSlots(false)
    }
  }

  const availableCount = TIME_SLOTS.filter(
    s => !bookedSlots.includes(s)
  ).length

  const generateToken = () => {
    const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const random = Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('')
    return `QZ-${random}`
  }

  const validate = () => {
    if (!selectedSlot) {
      Alert.alert('No Slot Selected', 'Please select a time slot')
      return false
    }
    if (!patientName.trim()) {
      Alert.alert('Missing Name', 'Please enter patient full name')
      return false
    }
    if (!patientPhone.trim() || patientPhone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number')
      return false
    }
    if (!patientAge.trim()) {
      Alert.alert('Missing Age', 'Please enter patient age')
      return false
    }
    if (!patientGender) {
      Alert.alert('Missing Gender', 'Please select patient gender')
      return false
    }
    return true
  }

  const handleGenerateToken = async () => {
    if (!validate()) return
    if (submitting) return

    setSubmitting(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      // Double check slot still available
      const { data: existing } = await supabase
        .from('appointments')
        .select('id')
        .eq('appointment_date', selectedDate)
        .eq('time_slot', selectedSlot)
        .eq('service', service.name)
        .eq('status', 'confirmed')

      if (existing && existing.length > 0) {
        Alert.alert(
          'Slot Taken',
          'This slot was just booked. Please select another time.'
        )
        fetchBookedSlots()
        setSelectedSlot(null)
        return
      }

      // Generate unique token
      const tokenNumber = generateToken()

      // Insert appointment
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          user_id:         user.id,
          service:         service.name,
          service_icon:    service.icon,
          department:      service.department,
          appointment_date: selectedDate,
          time_slot:       selectedSlot,
          token_number:    tokenNumber,
          status:          'confirmed',
          payment_status:  'unpaid',
          amount:          service.price,
          patient_name:    patientName.trim(),
          patient_phone:   patientPhone.trim(),
          patient_age:     patientAge.trim(),
          patient_gender:  patientGender,
        })
        .select()
        .single()

      if (error) throw error

      // Navigate to token screen
      router.push({
        pathname: '/booking/token',
        params: { appointmentId: appointment.id }
      })

    } catch (error: any) {
      Alert.alert('Booking Failed', error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title + service pill */}
        <Text style={styles.title}>Choose Your Slot</Text>
        <View style={styles.servicePill}>
          <Text style={styles.servicePillIcon}>{service.icon}</Text>
          <Text style={styles.servicePillText}>
            {service.name} • Rs. {service.price}
          </Text>
        </View>

        {/* Date Selection */}
        <Text style={styles.sectionLabel}>DATE SELECTION</Text>
        <View style={styles.dateRow}>
          {[tomorrow, dayAfter].map((date, i) => {
            const dateStr   = formatDate(date)
            const isSelected = selectedDate === dateStr
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.dateCard,
                  isSelected && styles.dateCardSelected
                ]}
                onPress={() => setSelectedDate(dateStr)}
                activeOpacity={0.85}
              >
                <Text style={[
                  styles.dateLabel,
                  isSelected && styles.dateLabelSelected
                ]}>
                  {i === 0 ? 'TOMORROW' : 'DAY AFTER'}
                </Text>
                <Text style={[
                  styles.dateNumber,
                  isSelected && styles.dateNumberSelected
                ]}>
                  {formatShort(date)}
                </Text>
                <Text style={[
                  styles.dateDayName,
                  isSelected && styles.dateDayNameSelected
                ]}>
                  {formatDay(date)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Time Slots */}
        <View style={styles.timesHeader}>
          <Text style={styles.sectionLabel}>AVAILABLE TIMES</Text>
          {!loadingSlots && (
            <View style={styles.slotCountBadge}>
              <Text style={styles.slotCountText}>
                {availableCount} SLOTS AVAILABLE
              </Text>
            </View>
          )}
        </View>

        {loadingSlots ? (
          <ActivityIndicator
            color="#1E4DB7"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <View style={styles.slotsGrid}>
            {TIME_SLOTS.map((slot, i) => {
              const isBooked   = bookedSlots.includes(slot)
              const isSelected = selectedSlot === slot
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.slotPill,
                    isBooked   && styles.slotPillFull,
                    isSelected && styles.slotPillSelected,
                  ]}
                  onPress={() => !isBooked && setSelectedSlot(slot)}
                  disabled={isBooked}
                  activeOpacity={0.85}
                >
                  <Text style={[
                    styles.slotText,
                    isBooked   && styles.slotTextFull,
                    isSelected && styles.slotTextSelected,
                  ]}>
                    {isBooked ? 'FULL' : slot}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Patient Details */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
          PATIENT DETAILS
        </Text>
        <View style={styles.detailsCard}>

          {/* Full Name */}
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="John Doe"
            placeholderTextColor="#B0BEC5"
            value={patientName}
            onChangeText={setPatientName}
            autoCapitalize="words"
          />

          {/* Phone + Age row */}
          <View style={styles.rowFields}>
            <View style={{ flex: 1.5 }}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View style={styles.phoneWrapper}>
                <Text style={styles.phoneFlag}>🇳🇵</Text>
                <TextInput
                  style={[styles.fieldInput, styles.phoneInput]}
                  placeholder="98XXXXXXXX"
                  placeholderTextColor="#B0BEC5"
                  value={patientPhone}
                  onChangeText={setPatientPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.fieldLabel}>Age</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="24"
                placeholderTextColor="#B0BEC5"
                value={patientAge}
                onChangeText={setPatientAge}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>

          {/* Gender */}
          <Text style={styles.fieldLabel}>Gender</Text>
          <TouchableOpacity
            style={styles.genderDropdown}
            onPress={() => setShowGender(!showGender)}
            activeOpacity={0.85}
          >
            <Text style={[
              styles.genderText,
              !patientGender && { color: '#B0BEC5' }
            ]}>
              {patientGender || 'Select Gender'}
            </Text>
            <Text style={styles.dropdownArrow}>
              {showGender ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showGender && (
            <View style={styles.genderOptions}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderOption,
                    patientGender === g && styles.genderOptionSelected
                  ]}
                  onPress={() => {
                    setPatientGender(g)
                    setShowGender(false)
                  }}
                >
                  <Text style={[
                    styles.genderOptionText,
                    patientGender === g && styles.genderOptionTextSelected
                  ]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Bottom spacing for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Generate Token sticky button */}
      <View style={styles.stickyBottom}>
        <TouchableOpacity
          style={[styles.generateBtn, submitting && styles.generateBtnDisabled]}
          onPress={handleGenerateToken}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting
            ? <ActivityIndicator color="#FFFFFF" />
            : <>
                <Text style={styles.generateBtnText}>Generate Token</Text>
                <Text style={styles.generateBtnIcon}>🎫</Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn:     { width: 40, height: 40, justifyContent: 'center' },
  backArrow:   { fontSize: 22, color: '#1A1A1A', fontWeight: 'bold' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#1A1A1A' },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },

  // Service pill
  servicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginBottom: 24,
    gap: 6,
  },
  servicePillIcon: { fontSize: 16 },
  servicePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78909C',
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  // Date cards
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dateCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  dateCardSelected: {
    backgroundColor: '#1E4DB7',
    borderColor: '#1E4DB7',
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#78909C',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateLabelSelected: { color: '#FFFFFF', opacity: 0.8 },
  dateNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  dateNumberSelected: { color: '#FFFFFF' },
  dateDayName: { fontSize: 13, color: '#78909C' },
  dateDayNameSelected: { color: '#FFFFFF', opacity: 0.85 },

  // Times
  timesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  slotCountBadge: {
    backgroundColor: '#E8F0FE',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  slotCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E4DB7',
    letterSpacing: 0.5,
  },

  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  slotPill: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
  },
  slotPillSelected: {
    backgroundColor: '#1E4DB7',
    borderColor: '#1E4DB7',
  },
  slotPillFull: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E8ECF0',
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  slotTextSelected: { color: '#FFFFFF' },
  slotTextFull: {
    color: '#B0BEC5',
    textDecorationLine: 'line-through',
  },

  // Patient details card
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#78909C',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  fieldInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  rowFields: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  phoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  phoneFlag: { fontSize: 18, marginRight: 6 },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
    backgroundColor: 'transparent',
    paddingLeft: 0,
  },

  // Gender dropdown
  genderDropdown: {
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  genderText: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#78909C',
  },
  genderOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    overflow: 'hidden',
    marginBottom: 8,
  },
  genderOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
  },
  genderOptionSelected: { backgroundColor: '#F0F4FF' },
  genderOptionText: { fontSize: 15, color: '#1A1A1A' },
  genderOptionTextSelected: {
    color: '#1E4DB7',
    fontWeight: '600',
  },

  // Sticky bottom
  stickyBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  generateBtn: {
    backgroundColor: '#1E4DB7',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#1E4DB7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  generateBtnIcon: { fontSize: 20 },
})