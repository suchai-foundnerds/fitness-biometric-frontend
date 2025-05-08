import { useIntervalFn } from '@vueuse/core'

const IDENTIFY_EVENT_CAPTURE_TIME = 10000

export function useNewFingerprintIdentify() {
  const { data: identifyEvent, refresh: refreshIdentifyEvent } = useFetch('/api/fingerprint-identify')
  const newUserIdentify = ref<{
    id: number,
    name: string,
    identifyTimestamp: number,
    attendanceCount: number,
  } | null>(null)

  watch(identifyEvent, async (newIdentifyEvent, prevIdentifyEvent) => {
    const currentTime = Date.now()
    const identifyEventTime = newIdentifyEvent?.identifyTimestamp

    if (!identifyEventTime) return

    if (currentTime - identifyEventTime > IDENTIFY_EVENT_CAPTURE_TIME) return

    if (newIdentifyEvent.id !== prevIdentifyEvent?.id || newIdentifyEvent.identifyTimestamp !== prevIdentifyEvent?.identifyTimestamp) {
      await recordUserAttendance(newIdentifyEvent.id)

      newUserIdentify.value = {
        id: newIdentifyEvent.id,
        name: newIdentifyEvent.name,
        identifyTimestamp: newIdentifyEvent.identifyTimestamp,
        attendanceCount: newIdentifyEvent.attendanceCount,
      }
    }
  }, { immediate: true })

  useIntervalFn(() => {
    refreshIdentifyEvent()
  }, 1000)

  async function recordUserAttendance(userId: number) {
    try {
      await $fetch('/api/user-attendance', {
        method: 'POST',
        body: { userId },
      })
    } catch (error) {
      console.error('Attendance failed:', error)
    }
  }

  return newUserIdentify
}
