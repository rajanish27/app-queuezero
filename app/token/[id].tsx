import { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ActivityIndicator,
  ScrollView, Alert
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function TokenScreen() {
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>()
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    fetchAppointment()
  }, [])

  const fetchAppointment = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single()

      if (error) throw error
      setAppointment(data)
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E4DB7" />
        <Text style={styles.loadingText}>Generating your token...</Text>
      </View>
    )
  }

  if (!appointment) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Appointment not found</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Success icon */}
        <View style={styles.successCircle}>
          <Text style={styles.successCheck}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>

        {/* Token Ticket Card */}
        <View style={styles.ticketCard}>

          {/* Top half */}
          <View style={styles.ticketTop}>
            <Text style={styles.ticketEmoji}>🎫</Text>
            <Text style={styles.tokenLabel}>YOUR TOKEN</Text>
            <View style={styles.tokenBadge}>
              <Text style={styles.tokenNumber}>
                #{appointment.token_number}
              </Text>
            </View>
          </View>

          {/* Tear line with semicircle cutouts */}
          <View style={styles.tearLineRow}>
            <View style={styles.cutoutLeft} />
            <View style={styles.tearLineDashed} />
            <View style={styles.cutoutRight} />
          </View>

          {/* Bottom half — details */}
          <View style={styles.ticketBottom}>
            {[
              { icon: '👤', label: 'Patient',  value: appointment.patient_name },
              { icon: '🏥', label: 'Service',  value: appointment.service },
              { icon: '📅', label: 'Date',     value: formatDate(appointment.appointment_date) },
              { icon: '⏰', label: 'Time',     value: appointment.time_slot },
              { icon: '💳', label: 'Payment',  value: `Rs. ${appointment.amount}`, highlight: true },
            ].map((row, i) => (
              <View key={i} style={styles.detailRow}>
                <View style={styles.detailLeft}>
                  <Text style={styles.detailIcon}>{row.icon}</Text>
                  <Text style={styles.detailLabel}>{row.label}</Text>
                </View>
                <Text style={[
                  styles.detailValue,
                  row.highlight && styles.detailValueHighlight
                ]}>
                  {row.value}
                </Text>
              </View>
            ))}

            {/* Confirmed badge */}
            <View style={styles.confirmedBadge}>
              <View style={styles.confirmedDot} />
              <Text style={styles.confirmedText}>CONFIRMED</Text>
            </View>

            <Text style={styles.receptionNote}>
              Show this token at the reception desk
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.bookAnotherBtn}
          onPress={() => router.push('/booking/select-service')}
          activeOpacity={0.85}
        >
          <Text style={styles.bookAnotherText}>Book Another</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.downloadBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.downloadIcon}>⬇</Text>
          <Text style={styles.downloadText}>Download Token</Text>
        </TouchableOpacity>

        {/* Reminder info box */}
        <View style={styles.reminderBox}>
          <Text style={styles.reminderIcon}>🔔</Text>
          <Text style={styles.reminderText}>
            You will receive a reminder 1 hour before your appointment.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: { fontSize: 15, color: '#78909C' },

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

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: 'center',
  },

  // Success
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successCheck: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 24,
  },

  // Ticket card
  ticketCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  // Top half
  ticketTop: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  ticketEmoji: { fontSize: 32, marginBottom: 8 },
  tokenLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78909C',
    letterSpacing: 2,
    marginBottom: 12,
  },
  tokenBadge: {
    backgroundColor: '#1E4DB7',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  tokenNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },

  // Tear line
  tearLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cutoutLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
    marginLeft: -10,
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  tearLineDashed: {
    flex: 1,
    height: 2,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderStyle: 'dashed',
    marginHorizontal: 4,
  },
  cutoutRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
    marginRight: -10,
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },

  // Bottom half
  ticketBottom: {
    padding: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon:  { fontSize: 16 },
  detailLabel: { fontSize: 14, color: '#78909C', fontWeight: '500' },
  detailValue: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
  detailValueHighlight: { color: '#1E4DB7' },

  // Confirmed badge
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    gap: 8,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  confirmedDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  confirmedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4CAF50',
    letterSpacing: 1,
  },
  receptionNote: {
    fontSize: 12,
    color: '#78909C',
    textAlign: 'center',
  },

  // Buttons
  bookAnotherBtn: {
    width: '100%',
    backgroundColor: '#1E4DB7',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#1E4DB7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookAnotherText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  downloadBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#1E4DB7',
  },
  downloadIcon: { fontSize: 16, color: '#1E4DB7' },
  downloadText: {
    color: '#1E4DB7',
    fontSize: 16,
    fontWeight: '600',
  },

  // Reminder
  reminderBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  reminderIcon: { fontSize: 22 },
  reminderText: {
    flex: 1,
    fontSize: 13,
    color: '#78909C',
    lineHeight: 20,
  },
})