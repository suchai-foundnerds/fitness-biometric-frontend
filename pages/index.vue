<script setup lang="ts">
type AppState = "IDLE" | "USER_IDENTIFIED" | "USER_INVALID" | "NEW_USER";

const newRegister = useNewRegister()
const { newUserIdentify, newUserValid } = useNewFingerprintIdentify()

const newRegisterUser = ref({
  id: 0,
  name: '',
  fingerprint: '',
})

const isRegistering = ref(false)
const showSuccessPopup = ref(false)
const currentState = ref<AppState>("IDLE")
const timeoutRef = ref<NodeJS.Timeout | null>(null)

watch(newRegister, (newUser, prevUser) => {
  if (newUser?.id === prevUser?.id) return

  if (newUser) {
    currentState.value = "NEW_USER"

    newRegisterUser.value = {
      id: newUser.id,
      name: '',
      fingerprint: newUser.fingerprint,
    }
  } else {
    currentState.value = "IDLE"
  }
}, { immediate: true })

watch([newUserIdentify, newUserValid, currentState], async ([newUserIdentify, newUserValid, newCurrentState]) => {
  if (newCurrentState === "NEW_USER") {
    return
  }

  if (newUserIdentify && newUserValid) {
    currentState.value = "USER_IDENTIFIED"

  } else if (newUserValid === false) {
    currentState.value = "USER_INVALID"
  }
  
  if (timeoutRef.value) {
    clearTimeout(timeoutRef.value)
  }
  
  timeoutRef.value = setTimeout(() => {
      currentState.value = "IDLE"
    }, 4000)
}, { immediate: true })

async function registerUser() {
  if (!newRegisterUser.value.name) return

  try {
    isRegistering.value = true
    await $fetch('/api/user', {
      method: 'POST',
      body: newRegisterUser.value,
    })

    showSuccessPopup.value = true
    currentState.value = "IDLE"

    setTimeout(() => {
      showSuccessPopup.value = false
    }, 3000)
  } catch (error) {
    console.error('Registration failed:', error)
  } finally {
    isRegistering.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 text-white bg-gray-900">
    <div class="w-full max-w-md p-8 text-center bg-gray-800 rounded-lg shadow-xl">
      <!-- IDLE State -->
      <div v-if="currentState === 'IDLE'" class="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 mb-6 text-blue-400" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.246.99-4.659.99-7.132A8 8 0 008 4a8 8 0 00-5.932 13.035A13.916 13.916 0 008 11c0 1.017-.07 2.019-.203 3m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3" />
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M19.5 12c0-3.866-3.134-7-7-7s-7 3.134-7 7c0 1.933.784 3.683 2.05 4.95M12 12a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
        <h1 class="mb-2 text-3xl font-bold text-blue-400">Ready to Scan</h1>
        <p class="text-gray-400">Please place your finger on the scanner.</p>
      </div>

      <!-- USER_IDENTIFIED State -->
      <div v-if="currentState === 'USER_IDENTIFIED'" :key="newUserIdentify?.id"
        class="flex flex-col items-center animate-fade-in-scale">
        <div class="flex items-center justify-center w-32 h-32 mb-6 bg-gray-700 border-4 border-green-500 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-green-400" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="mb-2 text-3xl font-bold text-green-400">
          User Validated
        </h1>
        <p class="mb-1 text-lg text-gray-300">
          {{ newUserIdentify?.name }}
        </p>
        <p class="mb-4 text-sm text-gray-400">
          User ID: {{ newUserIdentify?.id }}
        </p>
        <div class="w-full mt-6">
          <div class="flex items-center justify-between p-4 bg-gray-700 rounded-lg shadow">
            <span class="text-lg font-medium text-gray-300">Attendance Count</span>
            <span class="text-2xl font-bold text-blue-400">{{ newUserIdentify?.attendanceCount }}</span>
          </div>
        </div>
      </div>

      <!-- USER_INVALID State -->
      <div v-if="currentState === 'USER_INVALID'" class="flex flex-col items-center">
        <div class="flex items-center justify-center w-32 h-32 mb-6 bg-gray-700 border-4 border-red-500 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-red-400" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="mb-2 text-3xl font-bold text-red-400">
          User Not Recognized
        </h1>
        <p class="text-gray-400">Please try again or contact support.</p>
      </div>

      <!-- NEW_USER State - Registration Form -->
      <div v-if="currentState === 'NEW_USER'" class="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 mb-6 text-yellow-400" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
        <h1 class="mb-6 text-3xl font-bold text-yellow-400">New User Registration</h1>

        <form class="w-full space-y-6" @submit.prevent="registerUser">
          <div>
            <label for="userId" class="block mb-2 text-sm font-medium text-gray-400">User ID</label>
            <input type="text" id="userId" v-model="newRegisterUser.id" disabled
              class="w-full p-3 text-gray-300 bg-gray-700 border border-gray-600 rounded-lg cursor-not-allowed focus:ring-yellow-500 focus:border-yellow-500">
          </div>

          <div>
            <label for="userName" class="block mb-2 text-sm font-medium text-gray-400">Full Name</label>
            <input type="text" id="userName" v-model="newRegisterUser.name" placeholder="Enter your full name"
              class="w-full p-3 text-white placeholder-gray-500 bg-gray-700 border border-gray-600 rounded-lg focus:ring-yellow-500 focus:border-yellow-500">
          </div>

          <div>
            <label for="fingerprint" class="block mb-2 text-sm font-medium text-gray-400">Fingerprint</label>
            <div class="flex items-center p-3 bg-gray-700 border border-gray-600 rounded-lg cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.698 9.668L7.5 21m3.955-3.27A9.012 9.012 0 0019.5 10.5c0-1.093-.232-2.13-.635-3.079M12 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
              </svg>
              <span class="text-gray-500 truncate max-w-[200px]">{{ newRegisterUser.fingerprint }}</span>
            </div>
          </div>

          <button type="submit"
            class="w-full px-4 py-3 font-semibold text-gray-900 bg-yellow-400 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
            :disabled="isRegistering || !newRegisterUser.name">
            <div v-if="isRegistering" class="flex items-center justify-center">
              <svg class="w-5 h-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Registering...
            </div>
            <span v-else>Register User</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Success Popup -->
    <div v-if="showSuccessPopup" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="flex flex-col items-center p-8 bg-gray-800 rounded-lg shadow-xl animate-bounce-in">
        <div class="flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="mb-2 text-2xl font-bold text-green-400">Registration Successful</h2>
        <p class="mb-4 text-gray-300">User has been registered successfully!</p>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }

  50% {
    opacity: 1;
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes fade-in-scale {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.5s;
}

.animate-fade-in-scale {
  animation: fade-in-scale 0.3s ease-out;
}
</style>