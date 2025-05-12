<script setup lang="ts">
const route = useRoute();
const memberId = computed(() => Number(route.params.id));
const isUpdating = ref(false);
const updateError = ref('');
const editMode = ref(false);
const editedMember = ref<User | null>(null);

interface User {
  id: number;
  name: string;
  fingerprint: string;
  active: boolean;
  phoneNumber: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
  membershipStartAt: string | null;
  membershipEndAt: string | null;
  memberAttendances: {
    id: number;
    createdAt: string;
    updatedAt: string;
  }[];
}

const { data: member, pending, error, refresh } = await useFetch<User>(`/api/members/${memberId.value}`);

// Format date for better display
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Toggle edit mode
const toggleEditMode = () => {
  if (editMode.value) {
    // Cancel edit
    editedMember.value = null;
  } else {
    // Start edit
    editedMember.value = { ...member.value! };
  }
  editMode.value = !editMode.value;
};

// Save member changes
const saveMemberChanges = async () => {
  if (!editedMember.value) return;
  
  try {
    isUpdating.value = true;
    updateError.value = '';
    
    await $fetch(`/api/members/${memberId.value}`, {
      method: 'PUT',
      body: {
        active: editedMember.value.active,
        membershipStartAt: editedMember.value.membershipStartAt,
        membershipEndAt: editedMember.value.membershipEndAt,
        phoneNumber: editedMember.value.phoneNumber,
        remark: editedMember.value.remark
      }
    });
    
    // Refresh the member data after update
    refresh();
    editMode.value = false;
    editedMember.value = null;
  } catch (error) {
    console.error('Error updating member:', error);
    updateError.value = 'Failed to update member';
  } finally {
    isUpdating.value = false;
  }
};

// Toggle member active status
const toggleMemberStatus = async () => {
  if (!member.value) return;
  
  try {
    isUpdating.value = true;
    updateError.value = '';
    
    await $fetch(`/api/members/${memberId.value}`, {
      method: 'PUT',
      body: {
        active: !member.value.active
      }
    });
    
    // Refresh the member data after update
    refresh();
  } catch (error) {
    console.error('Error updating member status:', error);
    updateError.value = 'Failed to update member status';
  } finally {
    isUpdating.value = false;
  }
};

// Compute attendance statistics
const attendanceStats = computed(() => {
  if (!member.value?.memberAttendances) return null;
  
  const attendances = member.value.memberAttendances;
  
  // Get this month's attendance count
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthCount = attendances.filter(a => 
    new Date(a.createdAt) >= startOfMonth
  ).length;
  
  // Get total attendance count
  const totalCount = attendances.length;
  
  // Get most recent attendance
  const sortedAttendances = [...attendances].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const lastAttendance = sortedAttendances.length > 0 
    ? formatDate(sortedAttendances[0].createdAt) 
    : 'Never';
  
  return {
    thisMonth: thisMonthCount,
    total: totalCount,
    lastAttendance
  };
});

const handleToggleStatus = async () => {
  await toggleMemberStatus();
};
</script>

<template>
  <div class="flex flex-col min-h-screen p-6 text-white bg-gray-900">
    <!-- Header with back button -->
    <div class="flex items-center mb-6">
      <NuxtLink to="/report/members" class="flex items-center text-blue-400 hover:text-blue-300">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Members
      </NuxtLink>
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
    
    <!-- Error state -->
    <div v-else-if="error" class="p-6 bg-red-900 rounded-lg bg-opacity-20">
      <p class="text-red-400">{{ error.message }}</p>
      <button 
        @click="refresh" 
        class="px-4 py-2 mt-4 text-white bg-red-600 rounded hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
    
    <!-- Member profile -->
    <div v-else-if="member" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Main info card -->
      <div class="p-6 bg-gray-800 rounded-lg shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <div class="flex items-center justify-center w-16 h-16 mr-4 text-2xl font-bold text-white bg-blue-600 rounded-full">
              {{ member.name.charAt(0) }}
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white">{{ member.name }}</h1>
              <p class="text-gray-400">ID: {{ member.id }}</p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button
              @click="toggleEditMode"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              {{ editMode ? 'Cancel' : 'Edit' }}
            </button>
            <button
              v-if="editMode"
              @click="saveMemberChanges"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              v-if="!editMode"
              @click="handleToggleStatus"
              :class="[
                'px-4 py-2 text-sm font-medium rounded',
                member.active 
                  ? 'text-white bg-red-600 hover:bg-red-700' 
                  : 'text-white bg-green-600 hover:bg-green-700'
              ]"
            >
              {{ member.active ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </div>
        
        <div class="mt-6 space-y-4">
          <div class="flex items-center">
            <span class="w-32 text-sm font-medium text-gray-400">Status</span>
            <span 
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', 
                member.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]"
            >
              {{ member.active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          
          <div class="flex">
            <span class="w-32 text-sm font-medium text-gray-400">Start Date</span>
            <input
              v-if="editMode"
              type="datetime-local"
              v-model="editedMember!.membershipStartAt"
              class="px-3 py-1 text-white bg-gray-700 border border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500"
            />
            <span v-else class="text-white">{{ formatDate(member.membershipStartAt) }}</span>
          </div>
          
          <div class="flex">
            <span class="w-32 text-sm font-medium text-gray-400">End Date</span>
            <input
              v-if="editMode"
              type="datetime-local"
              v-model="editedMember!.membershipEndAt"
              class="px-3 py-1 text-white bg-gray-700 border border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500"
            />
            <span v-else class="text-white">{{ formatDate(member.membershipEndAt) }}</span>
          </div>
          
          <div class="flex">
            <span class="w-32 text-sm font-medium text-gray-400">Created</span>
            <span class="text-white">{{ formatDate(member.createdAt) }}</span>
          </div>
          
          <div class="flex">
            <span class="w-32 text-sm font-medium text-gray-400">Last Updated</span>
            <span class="text-white">{{ formatDate(member.updatedAt) }}</span>
          </div>

          <div class="flex">
            <span class="w-32 text-sm font-medium text-gray-400">Phone Number</span>
            <input
              v-if="editMode"
              type="text"
              v-model="editedMember!.phoneNumber"
              class="px-3 py-1 text-white bg-gray-700 border border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500"
            />
            <span v-else class="text-gray-300 truncate">{{ member.phoneNumber }}</span>
          </div>

          <div class="flex">
            <span class="w-32 text-sm font-medium text-gray-400">Remark</span>
            <textarea
              v-if="editMode"
              v-model="editedMember!.remark"
              class="px-3 py-1 text-white bg-gray-700 border border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            ></textarea>
            <span v-else class="text-gray-300 truncate">{{ member.remark }}</span>
          </div>
          
          <div class="flex">
            <span class="w-32 text-sm font-medium text-gray-400">Fingerprint</span>
            <span class="text-gray-300 truncate">{{ member.fingerprint }}</span>
          </div>
        </div>
      </div>
      
      <!-- Attendance stats card -->
      <div class="p-6 bg-gray-800 rounded-lg shadow-xl">
        <h2 class="mb-4 text-xl font-bold text-blue-400">Attendance Statistics</h2>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 rounded-lg bg-gray-750">
            <p class="text-sm font-medium text-gray-400">This Month</p>
            <p class="text-2xl font-bold text-white">{{ attendanceStats?.thisMonth || 0 }}</p>
          </div>
          
          <div class="p-4 rounded-lg bg-gray-750">
            <p class="text-sm font-medium text-gray-400">Total</p>
            <p class="text-2xl font-bold text-white">{{ attendanceStats?.total || 0 }}</p>
          </div>
        </div>
        
        <div class="mt-4">
          <p class="text-sm font-medium text-gray-400">Last Attendance</p>
          <p class="text-white">{{ attendanceStats?.lastAttendance }}</p>
        </div>
      </div>
      
      <!-- Attendance history card -->
      <div class="p-6 bg-gray-800 rounded-lg shadow-xl lg:col-span-3">
        <h2 class="mb-4 text-xl font-bold text-blue-400">Attendance History</h2>
        
        <div v-if="member.memberAttendances?.length === 0" class="py-10 text-center text-gray-500">
          No attendance records found for this member
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-gray-400 border-b border-gray-700">
                <th class="pb-3 pr-3 font-medium">#</th>
                <th class="px-3 pb-3 font-medium">Date</th>
                <th class="px-3 pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(attendance, index) in [...member.memberAttendances].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())" 
                :key="attendance.id"
                class="transition-colors border-b border-gray-700 hover:bg-gray-750"
              >
                <td class="py-4 pr-3 font-medium text-gray-300">{{ index + 1 }}</td>
                <td class="px-3 py-4 text-white">
                  {{ new Date(attendance.createdAt).toLocaleDateString() }}
                </td>
                <td class="px-3 py-4 text-gray-400">
                  {{ new Date(attendance.createdAt).toLocaleTimeString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template> 