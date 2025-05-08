import {useIntervalFn} from '@vueuse/core'

export function  useNewRegister() {
  const { data: users, refresh: refreshUsers } = useFetch('/api/fingerprint-db')
  const { data: latestUser, refresh: refreshLatestUser } = useFetch('/api/latest-user')

  const newRegister = computed(() => {
    if (!latestUser.value || !users.value) return null
    return users.value?.find(user => user.id > latestUser.value!.id)
  })

  useIntervalFn(() => {
    refreshUsers()
    refreshLatestUser()
  }, 3000)

  return newRegister
}