<script setup lang="ts">
type DateFilter = 'today' | 'yesterday' | 'custom';

interface AttendanceRecord {
  id: number;
  name: string;
  time: string;
  userId: string;
}


const selectedDate = ref(new Date());
const dateFilter = ref<DateFilter>('today');
const customDateOpen = ref(false);
const dateString = computed(() => selectedDate.value.toISOString().split('T')[0]);

const { data, status } = await useFetch(`/api/attendance-report`, { query: { date: dateString } });
const isLoading = computed(() => status.value === 'pending')
const stats = computed(() => data.value?.stats || { totalMembers: 0, todayAttendance: 0, newMembersThisMonth: 0 })
const attendanceList = computed(() => data.value?.attendanceList)

const formattedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

function changeDate(filter: DateFilter) {
  dateFilter.value = filter;

  if (filter === 'today') {
    selectedDate.value = new Date();
  } else if (filter === 'yesterday') {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    selectedDate.value = yesterday;
  }
}

function setCustomDate(date: Date) {
  selectedDate.value = date;
  customDateOpen.value = false;
  dateFilter.value = 'custom';
}
</script>

<template>
  <div class="flex flex-col min-h-screen p-6 text-white bg-gray-900">
    <h1 class="mb-6 text-3xl font-bold text-blue-400">Attendance Overview</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
      <!-- Total Members -->
      <div class="p-6 transition-all bg-gray-800 rounded-lg shadow-xl hover:bg-gray-750">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-400">Total Members</p>
            <p class="text-3xl font-bold text-white">{{ stats?.totalMembers }}</p>
          </div>
          <div class="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full bg-opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Today's Attendance -->
      <div class="p-6 transition-all bg-gray-800 rounded-lg shadow-xl hover:bg-gray-750">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-400">Today's Attendance</p>
            <p class="text-3xl font-bold text-white">{{ stats?.todayAttendance }}</p>
          </div>
          <div class="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full bg-opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- New Members This Month -->
      <div class="p-6 transition-all bg-gray-800 rounded-lg shadow-xl hover:bg-gray-750">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-400">New Members This Month</p>
            <p class="text-3xl font-bold text-white">{{ stats.newMembersThisMonth }}</p>
          </div>
          <div class="flex items-center justify-center w-12 h-12 bg-yellow-500 rounded-full bg-opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Table Section -->
    <div class="p-6 bg-gray-800 rounded-lg shadow-xl">
      <div class="flex flex-col justify-between mb-6 md:flex-row md:items-center">
        <h2 class="mb-4 text-xl font-bold text-blue-400 md:mb-0">Attendance Records</h2>

        <!-- Date Filter Controls -->
        <div class="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-3">
          <div class="text-gray-400">{{ formattedDate }}</div>
          <div class="flex space-x-2">
            <button @click="changeDate('today')" :class="[
              'px-3 py-1 text-sm rounded-md focus:outline-none',
              dateFilter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]">
              Today
            </button>
            <button @click="changeDate('yesterday')" :class="[
              'px-3 py-1 text-sm rounded-md focus:outline-none',
              dateFilter === 'yesterday'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]">
              Yesterday
            </button>
            <div class="relative">
              <button @click="customDateOpen = !customDateOpen" :class="[
                'px-3 py-1 text-sm rounded-md focus:outline-none',
                dateFilter === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              ]">
                Custom
              </button>
              <div v-if="customDateOpen" class="absolute right-0 z-10 p-2 mt-1 bg-gray-700 rounded-md">
                <input type="date"
                  class="block w-full px-3 py-2 text-sm bg-gray-600 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  :value="selectedDate.toISOString().split('T')[0]"
                  @change="(e) => setCustomDate(new Date((e.target as HTMLInputElement).value))">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-10">
        <div class="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>

      <!-- Attendance Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-400 border-b border-gray-700">
              <th class="pb-3 pr-3 font-medium">#</th>
              <th class="px-3 pb-3 font-medium">Name</th>
              <th class="px-3 pb-3 font-medium">User ID</th>
              <th class="px-3 pb-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in attendanceList" :key="item.id"
              class="transition-colors border-b border-gray-700 hover:bg-gray-750">
              <td class="py-4 pr-3 font-medium text-gray-300">{{ index + 1 }}</td>
              <td class="px-3 py-4 text-white">{{ item.name }}</td>
              <td class="px-3 py-4 text-gray-400">{{ item.userId }}</td>
              <td class="px-3 py-4 text-gray-400">{{ item.time }}</td>
            </tr>
            <tr v-if="attendanceList?.length === 0">
              <td colspan="4" class="py-6 text-center text-gray-500">
                No attendance records found for this date
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style>
/* Using the same animation from index.vue */
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