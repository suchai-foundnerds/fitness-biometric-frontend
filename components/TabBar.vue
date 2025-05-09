<script setup lang="ts">
const route = useRoute();

const isActive = (path: string) => {
  if (path === '/' && route.path === '/') return true;
  if (path === '/report' && route.path === '/report') return true;
  if (path === '/report/members' && route.path === '/report/members') return true;
  return false;
};
</script>

<template>
  <div>
    <!-- Spacer to prevent content from being hidden under the fixed tabbar -->
    <div class="h-16"></div>
    
    <!-- Fixed TabBar -->
    <div class="fixed bottom-0 left-0 right-0 z-50 flex justify-center w-full px-4 py-2 bg-gray-900 border-t border-gray-800">
      <div class="flex w-full max-w-md">
        <NuxtLink to="/" class="flex flex-col items-center justify-center flex-1 px-2 py-1 transition-colors rounded-md" 
          :class="isActive('/') ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" 
            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.246.99-4.659.99-7.132A8 8 0 008 4a8 8 0 00-5.932 13.035A13.916 13.916 0 008 11c0 1.017-.07 2.019-.203 3" />
          </svg>
          <span class="text-xs font-medium">Scan</span>
        </NuxtLink>
        
        <NuxtLink to="/report" class="flex flex-col items-center justify-center flex-1 px-2 py-1 transition-colors rounded-md"
          :class="isActive('/report') ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="text-xs font-medium">Report</span>
        </NuxtLink>
        
        <NuxtLink to="/report/members" class="flex flex-col items-center justify-center flex-1 px-2 py-1 transition-colors rounded-md"
          :class="isActive('/report/members') ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span class="text-xs font-medium">Members</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template> 