import { useState, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, SafeAreaView, StatusBar
} from 'react-native'
import { router } from 'expo-router'
import { SERVICES } from '../../constants/services'

export default function SelectServiceScreen() {
  const [selected, setSelected]     = useState<string | null>(null)
  const [search, setSearch]         = useState('')

  const filtered = SERVICES.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedService = SERVICES.find(s => s.id === selected)

  const handleContinue = () => {
    if (!selected) return
    router.push({
      pathname: '/booking/select-slot',
      params: { serviceId: selected }
    })
  }

  const renderService = useCallback(({ item }: any) => {
    const isSelected = selected === item.id
    return (
      <TouchableOpacity
        style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
        onPress={() => setSelected(item.id)}
        activeOpacity={0.85}
      >
        <Text style={styles.serviceIcon}>{item.icon}</Text>
        <Text style={[
          styles.serviceName,
          isSelected && styles.serviceNameSelected
        ]}>
          {item.name}
        </Text>
        <Text style={[
          styles.servicePrice,
          isSelected && styles.servicePriceSelected
        ]}>
          Rs. {item.price}
        </Text>
      </TouchableOpacity>
    )
  }, [selected])

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
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>What do you need today?</Text>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          placeholderTextColor="#B0BEC5"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Services Grid */}
      <FlatList
        data={filtered}
        renderItem={renderService}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No services found</Text>
        }
        ListFooterComponent={
          /* AI Consultation Card */
          <View style={styles.aiCard}>
            <View style={styles.aiCardContent}>
              <Text style={styles.aiTitle}>Need advice first?</Text>
              <Text style={styles.aiSubtitle}>
                Chat with our AI wellness assistant to find the right
                service for your current health goals.
              </Text>
              <TouchableOpacity style={styles.aiBtn} activeOpacity={0.85}>
                <Text style={styles.aiBtnText}>Start Consultation</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      {/* Bottom sticky bar — only shows when service selected */}
      {selectedService && (
        <View style={styles.stickyBar}>
          <View style={styles.stickyLeft}>
            <Text style={styles.stickyLabel}>SELECTED</Text>
            <View style={styles.stickyService}>
              <Text style={styles.stickyIcon}>{selectedService.icon}</Text>
              <Text style={styles.stickyName}>{selectedService.name}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: '#1A1A1A',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },

  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  clearBtn: {
    fontSize: 14,
    color: '#B0BEC5',
    paddingLeft: 8,
  },

  // Grid
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // Service card
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceCardSelected: {
    borderColor: '#1E4DB7',
    backgroundColor: '#F0F4FF',
  },
  serviceIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 6,
  },
  serviceNameSelected: {
    color: '#1E4DB7',
  },
  servicePrice: {
    fontSize: 13,
    color: '#78909C',
    fontWeight: '600',
  },
  servicePriceSelected: {
    color: '#1E4DB7',
  },

  emptyText: {
    textAlign: 'center',
    color: '#B0BEC5',
    marginTop: 40,
    fontSize: 15,
  },

  // AI consultation card
  aiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  aiCardContent: {
    padding: 20,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  aiSubtitle: {
    fontSize: 13,
    color: '#78909C',
    lineHeight: 20,
    marginBottom: 16,
  },
  aiBtn: {
    backgroundColor: '#1E4DB7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  aiBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Sticky bottom bar
  stickyBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  stickyLeft: { flex: 1 },
  stickyLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B0BEC5',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  stickyService: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stickyIcon: { fontSize: 18 },
  stickyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  continueBtn: {
    backgroundColor: '#1E4DB7',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
})