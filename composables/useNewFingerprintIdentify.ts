import { useIntervalFn } from '@vueuse/core'

const IDENTIFY_EVENT_CAPTURE_TIME = 10000

export function useNewFingerprintIdentify() {
  const { data: identifyEvent, refresh: refreshIdentifyEvent } = useFetch('/api/fingerprint-identify')

  const newUserValid = ref<boolean>()
  const newUserIdentify = ref<{
    id: number,
    name: string,
    identifyTimestamp: number,
    attendanceCount: number,
    membershipStartAt: string | null,
    membershipEndAt: string | null,
    remark: string | null,
  } | null>(null)

  watch(identifyEvent, async (newIdentifyEvent, prevIdentifyEvent) => {
    if (!newIdentifyEvent) return

    const currentTime = Date.now()
    const identifyEventTime = newIdentifyEvent?.identifyTimestamp

    if (!identifyEventTime) return

    if (currentTime - identifyEventTime > IDENTIFY_EVENT_CAPTURE_TIME) return

    if (newIdentifyEvent?.status === 'invalid') {
      newUserValid.value = false
      newUserIdentify.value = null
      return
    }

    if (
      prevIdentifyEvent?.status === 'invalid' ||
      (
        newIdentifyEvent.id !== prevIdentifyEvent?.id ||
        newIdentifyEvent.identifyTimestamp !== prevIdentifyEvent?.identifyTimestamp
      )
    ) {
      newUserValid.value = true
      await recordUserAttendance(newIdentifyEvent.id)

      newUserIdentify.value = {
        id: newIdentifyEvent.id,
        name: newIdentifyEvent.name,
        identifyTimestamp: newIdentifyEvent.identifyTimestamp,
        attendanceCount: newIdentifyEvent.attendanceCount + 1,
        membershipStartAt: newIdentifyEvent.membershipStartAt,
        membershipEndAt: newIdentifyEvent.membershipEndAt,
        remark: newIdentifyEvent.remark,
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

  function clearNewUserIdentify() { 
    newUserIdentify.value = null
    newUserValid.value = undefined
  }

  return { newUserIdentify, newUserValid, clearNewUserIdentify }
}
