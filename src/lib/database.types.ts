export interface Database {
  public: {
    Tables: {
      sensor_data: {
        Row: {
          id: string
          timestamp: string
          co2: number
          pm25: number
          co: number
          temperature: number
          humidity: number
          device_id: string
          alert_level?: 'normal' | 'warning' | 'critical'
          location?: string
          created_at?: string
        }
        Insert: {
          id?: string
          timestamp: string
          co2: number
          pm25: number
          co: number
          temperature: number
          humidity: number
          device_id: string
          alert_level?: 'normal' | 'warning' | 'critical'
          location?: string
          created_at?: string
        }
        Update: {
          id?: string
          timestamp?: string
          co2?: number
          pm25?: number
          co?: number
          temperature?: number
          humidity?: number
          device_id?: string
          alert_level?: 'normal' | 'warning' | 'critical'
          location?: string
          created_at?: string
        }
      }
      
      devices: {
        Row: {
          id: string
          name: string
          device_id: string
          location: string
          user_id: string
          created_at: string
          last_transmission?: string
          status: 'active' | 'inactive' | 'error'
          battery_level?: number
          firmware_version?: string
          sensor_types: string[]
          calibration_data?: {
            [key: string]: {
              slope?: number
              intercept?: number
              r0?: number
            }
          }
        }
        Insert: {
          id?: string
          name: string
          device_id: string
          location: string
          user_id: string
          created_at?: string
          last_transmission?: string
          status?: 'active' | 'inactive' | 'error'
          battery_level?: number
          firmware_version?: string
          sensor_types?: string[]
          calibration_data?: {
            [key: string]: {
              slope?: number
              intercept?: number
              r0?: number
            }
          }
        }
        Update: {
          name?: string
          location?: string
          last_transmission?: string
          status?: 'active' | 'inactive' | 'error'
          battery_level?: number
          firmware_version?: string
          sensor_types?: string[]
          calibration_data?: {
            [key: string]: {
              slope?: number
              intercept?: number
              r0?: number
            }
          }
        }
      }
      
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url?: string
          created_at: string
          last_login?: string
          role: 'user' | 'admin' | 'super_admin'
          devices?: string[]
          preferences?: {
            theme?: 'light' | 'dark'
            notification_settings?: {
              email?: boolean
              sms?: boolean
              push?: boolean
            }
          }
        }
        Insert: {
          id?: string
          name: string
          email: string
          avatar_url?: string
          created_at?: string
          last_login?: string
          role?: 'user' | 'admin' | 'super_admin'
          devices?: string[]
          preferences?: {
            theme?: 'light' | 'dark'
            notification_settings?: {
              email?: boolean
              sms?: boolean
              push?: boolean
            }
          }
        }
        Update: {
          name?: string
          avatar_url?: string
          last_login?: string
          role?: 'user' | 'admin' | 'super_admin'
          devices?: string[]
          preferences?: {
            theme?: 'light' | 'dark'
            notification_settings?: {
              email?: boolean
              sms?: boolean
              push?: boolean
            }
          }
        }
      }

      alert_logs: {
        Row: {
          id: string
          device_id: string
          sensor_type: string
          alert_level: 'warning' | 'critical'
          value: number
          timestamp: string
          resolved?: boolean
          resolution_timestamp?: string
          notes?: string
        }
        Insert: {
          id?: string
          device_id: string
          sensor_type: string
          alert_level: 'warning' | 'critical'
          value: number
          timestamp?: string
          resolved?: boolean
          resolution_timestamp?: string
          notes?: string
        }
        Update: {
          resolved?: boolean
          resolution_timestamp?: string
          notes?: string
        }
      }
    }
  }
}