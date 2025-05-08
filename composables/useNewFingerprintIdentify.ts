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

  watch(identifyEvent, (newIdentifyEvent) => {
    const currentTime = Date.now()
    const identifyEventTime = newIdentifyEvent?.identifyTimestamp

    if (!identifyEventTime) return

    if (currentTime - identifyEventTime > IDENTIFY_EVENT_CAPTURE_TIME) return

    newUserIdentify.value = newIdentifyEvent
  }, { immediate: true })

  useIntervalFn(() => {
    refreshIdentifyEvent()
  }, 3000)

  return newUserIdentify
}
