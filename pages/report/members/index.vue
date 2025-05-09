<script setup lang="ts">
interface User {
  id: number
  name: string
  fingerprint: string
  active: boolean
  createdAt: string
  updatedAt: string
  userAttendances?: {
    id: number
    createdAt: string
  }[]
}

const { data: members, pending, refresh } = await useFetch<User[]>('/api/members')
const searchQuery = ref('')
const isUpdating = ref(false)
const updateError = ref('')

const handleRefresh = () => {
  refresh()
}

const toggleMemberStatus = async (member: User) => {
  try {
    isUpdating.value = true
    updateError.value = ''
    
    await $fetch(`/api/members/${member.id}`, {
      method: 'PUT',
      body: {
        active: !member.active
      }
    })
    
    // Refresh the members list after update
    refresh()
  } catch (error) {
    console.error('Error updating member status:', error)
    updateError.value = 'Failed to update member status'
  } finally {
    isUpdating.value = false
  }
}

const filteredMembers = computed(() => {
  if (!members.value) return []
  
  if (!searchQuery.value) {
    return members.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return members.value.filter(member => 
    member.name.toLowerCase().includes(query) || 
    member.id.toString().includes(query)
  )
})
</script>

<template>
  <div class="flex flex-col min-h-screen p-6 text-white bg-gray-900">
    <div class="flex flex-col justify-between mb-6 md:flex-row md:items-center">
      <h1 class="mb-4 text-3xl font-bold text-blue-400 md:mb-0">Members List</h1>
      
      <!-- Search and refresh controls -->
      <div class="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-3">
        <div class="relative">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search by name or ID" 
            class="w-full px-4 py-2 text-white bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute w-5 h-5 text-gray-400 right-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button 
          @click="handleRefresh"
          class="flex items-center justify-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="updateError" class="p-4 mb-4 text-red-400 bg-red-900 rounded-lg bg-opacity-20">
      {{ updateError }}
      <button 
        @click="updateError = ''" 
        class="float-right text-red-400 hover:text-red-300"
      >
        ×
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="pending || isUpdating" class="flex items-center justify-center py-20">
      <div class="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
    </div>

    <!-- Members Table -->
    <div v-else-if="members && members.length > 0" class="p-6 overflow-hidden bg-gray-800 rounded-lg shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-400 border-b border-gray-700">
              <th class="pb-3 pr-3 font-medium">ID</th>
              <th class="px-3 pb-3 font-medium">Name</th>
              <th class="px-3 pb-3 font-medium">Status</th>
              <th class="px-3 pb-3 font-medium">Created</th>
              <th class="px-3 pb-3 font-medium">Last Updated</th>
              <th class="px-3 pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="member in filteredMembers" 
              :key="member.id"
              class="transition-colors border-b border-gray-700 hover:bg-gray-750"
            >
              <td class="py-4 pr-3 font-medium text-gray-300">{{ member.id }}</td>
              <td class="px-3 py-4 text-white">{{ member.name }}</td>
              <td class="px-3 py-4">
                <span 
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', 
                    member.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ member.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-3 py-4 text-gray-400">
                {{ new Date(member.createdAt).toLocaleDateString() }}
              </td>
              <td class="px-3 py-4 text-gray-400">
                {{ new Date(member.updatedAt).toLocaleDateString() }}
              </td>
              <td class="px-3 py-4 space-x-2">
                <NuxtLink 
                  :to="`/report/members/${member.id}`"
                  class="inline-flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </NuxtLink>
                <button
                  @click="toggleMemberStatus(member)"
                  :class="[
                    'inline-flex items-center px-3 py-1 text-sm rounded',
                    member.active 
                      ? 'text-white bg-red-600 hover:bg-red-700' 
                      : 'text-white bg-green-600 hover:bg-green-700'
                  ]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  {{ member.active ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center justify-center py-20 bg-gray-800 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <p class="mb-2 text-xl font-medium text-gray-400">No members found</p>
      <p class="text-gray-500">Try refreshing or add new members to the system</p>
    </div>
  </div>
</template>