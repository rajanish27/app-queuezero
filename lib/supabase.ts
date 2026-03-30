import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const supabaseUrl  = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// Custom storage using SecureStore so session persists
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key) // their is alternative
    //  i ) react native MMkv FOR FOR faster data storage but i have to turn on encryption manuuly
    // II )tanstack query uses user name i dont nedd to hit the securestore every time a component re-renders it handles loading states and errors
    //iii) custom encryption using react native crypto to encyrpt data before putting it into a standard database 
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value)// it only accepts string so if we want to store objects we have to stringify them before storing and parse them when retrieving
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key) // it deletes the item associated with the key from secure storage
  },
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,// it tells the supabase client whenther it shoudl automatically check for tokens or not 
  },
})