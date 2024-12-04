<script setup>
import { ref, onMounted, computed } from 'vue';
import ApiServices from '@/services/ApiServices';
import Pusher from 'pusher-js';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const apiServices = new ApiServices();

const isModalOpen = ref(false);
const settings = ref({
    hawking: false,
    mendeleev: false,
    faraday: false,
    pascal: false,
});
const sectionName = ref(''); 
const userId = ref(null)
const spinIcon = ref(false);
const students = ref([]);
const activeStudents = ref([]);
const role = ref('player');
const firstBuzzer = computed(() => {
    return activeStudents.value.find(student => student.sequence === "1") || null;
});
const buzzerLocked = computed(() => {
    const student = activeStudents.value.find(student => student.id === userId.value);
    return student ? student.is_buzzer_locked : "0";
});
const sectionId = route.params.id;


async function fetchSectionNameAndUserIdAndRole() {
    sectionName.value = sessionStorage.getItem('selectedSectionName');
    userId.value = sessionStorage.getItem('userId')
    role.value = sessionStorage.getItem('role');
}

async function fetchStudentsBySection() {
    const response = await apiServices.getStudentsBySection(sectionId);
    students.value = response;

    // Filter active students and sort by sequence
    activeStudents.value = students.value
        .filter(student => student.is_online === "1")
        .sort((a, b) => {
            // Sort `null` sequence values last
            if (a.sequence === null && b.sequence === null) return 0;
            if (a.sequence === null) return 1;
            if (b.sequence === null) return -1;

            // Sort by sequence ascending
            return a.sequence - b.sequence;
        });
}


const handleScoreAwarded = () => {
    fetchStudentsBySection();
};

const handleBuzzEvent = () => {
    fetchStudentsBySection();
};

const handleUserLoggedIn = () => {
    fetchStudentsBySection();
};


const handleLeave = async () => {
    const data = {
        user_id: userId.value
    }
    const response = await apiServices.logout(data);
    router.push('/')
}

const openSettings = async () => {
    isModalOpen.value = true;
}

const pressButton = async () => {
    const data = {
        user_id: userId.value
    }
    const response = await apiServices.buzz(data);
    
}

const resetButton = async () => {
    const response = await apiServices.resetBuzzerState();
}

const closeSettings = async () => {
    isModalOpen.value = false
}

const startSpin = () => {
    spinIcon.value = true;
    setTimeout(() => {
        spinIcon.value = false;
    }, 1000);
};


let pusher = null;
let buzzChannel = null;
let loginChannel = null;

onMounted(() => {
    fetchSectionNameAndUserIdAndRole();
    fetchStudentsBySection();

    pusher = new Pusher("63b3aef700906222c623", {
        cluster: "ap1",
    });

    // Subscribe to buzz-channel
    buzzChannel = pusher.subscribe("buzz-channel");
    buzzChannel.bind("score-awarded", handleScoreAwarded);
    buzzChannel.bind("buzz-event", handleBuzzEvent);
    buzzChannel.bind("user-logged-out", handleBuzzEvent);

    // Subscribe to login-channel
    loginChannel = pusher.subscribe("login-channel");
    loginChannel.bind("user-logged-in", handleUserLoggedIn);
});
</script>

<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-black">
        <video autoplay muted playsinline class="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none">
        <source src="@/assets/images/appbg-flip.mp4" type="video/mp4" />
        Your browser does not support the video tag.
        </video>
        <div class="bg-black border-white border-2 flex flex-col xl:w-[80%] h-auto w-full rounded-lg p-4">
        <div class="relative flex px-3 pt-2">
            <!-- Left Section -->
            <div class="flex-1 flex justify-start transform text-red-500 opacity-70">
            <button class="rounded-lg border-red-500 border-2 w-32 h-12 self-center flex gap-2 items-center justify-center font-bold" @click="handleLeave()">
                <Icon icon="streamline:interface-logout-arrow-exit-frame-leave-logout-rectangle-right" />
                <div>Leave</div>
            </button>
            </div>

            <!-- Center Section -->
            <div class="flex-1 flex justify-center transform opacity self-center hidden xl:flex">
            <img src="@/assets/images/QuodE.png" alt="" class="h-20 pb-4" />
            </div>

            <!-- Right Section -->
            <div class="mt-3 flex-1 flex justify-end text-end">
            <div class="text-2xl text-[#274461] p-3 rounded-lg w-full transform transition-all duration-150 ease-in-out text-gray-400">
                Section: <span class="text-[#0ed494] font-bold"> 
                {{ sectionName || 'Loading...' }}  <!-- Show "Loading..." if sectionName is not available -->
                </span>
            </div>
            </div>

            <!-- Settings Button -->
            <button class="absolute top-0 right-3 text-gray-700 rounded-full shadow-md hover:text-gray-400" @click="openSettings">
            <Icon icon="carbon:settings" class="text-2xl" />
            </button>
        </div>
        <div class="flex h-full gap-3">
            <div class="p-4 rounded-lg shadow-lg w-full sm:w-full md:w-[60%] lg:w-[40%] relative bg-[#274461] bg-opacity-70 h-full xl:block hidden">
                <div class="flex">
                    <div class="flex-1"></div>
                    <div class="flex-1">
                        <div class="flex text-center text-[#0ed494] text-2xl justify-center font-extrabold">STUDENTS
                        </div>
                        <div class="flex text-center text-[#0ed494] text-2xl justify-center font-extrabold mb-3">
                            {{ activeStudents.length }}/{{
                                students.length }}</div>
                    </div>
                    <div class="flex-1 text-white">
                        <button @click="startSpin">
                            <Icon icon="tdesign:refresh" height="20" :class="{ spin: spinIcon }" />
                        </button>
                    </div>
                </div>
                <div class="flex flex-col gap-3 max-h-[52vh] overflow-y-auto hidden-scrollbar">
        <div class="flex flex-col gap-3 max-h-[52vh] overflow-y-auto hidden-scrollbar">
                        <div 
                            v-for="student in activeStudents" 
                            :key="student.id"
                            class="flex items-center gap-4 bg-[#295d90] p-4 rounded-lg shadow-md cursor-pointer transition hover:bg-[#3b76ad]"
                            @click="awardPoint(student.id)"
                            :class="[student.id === userId ? 'border-emerald-500 border-[3px]' : 'border-transparent']"
                        >
                            <!-- Avatar -->
                            <img 
                                :src="student.avatar" 
                                alt="Student Avatar"
                                class="w-14 h-14 object-cover rounded-full border-2 border-[#0ed494]" 
                            />
                            <!-- Details -->
                            <div class="flex flex-col flex-grow">
                                <div class="text-lg font-bold text-white">
                                    {{ student.name }}
                                </div>
                                <!-- <div class="text-sm font-medium text-[#0ed494]">
                                    {{ student.sequence ? `Buzzer pressed: Position ${student.sequence}` : "Buzzer not yet pressed" }}
                                </div> -->
                            </div>
                            <!-- Ranking Icon -->
                            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md">
                                <i 
                                    v-if="student.sequence === 1" 
                                    class="text-yellow-400 fas fa-trophy text-xl" 
                                    title="First Place"
                                ></i>
                                <i 
                                    v-else-if="student.sequence === 2" 
                                    class="text-gray-300 fas fa-medal text-xl" 
                                    title="Second Place"
                                ></i>
                                <i 
                                    v-else-if="student.sequence === 3" 
                                    class="text-brown-500 fas fa-medal text-xl" 
                                    title="Third Place"
                                ></i>
                                <span 
                                    v-else 
                                    class="text-[#295d90] font-bold text-lg" 
                                    title="Not Ranked"
                                >
                                    {{ student.sequence ?? "-" }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-3 w-full sm:w-full md:w-[60%] lg:w-[60%]">
                <div class="p-4 rounded-lg shadow-lg relative bg-[#274461] bg-opacity-70 h-[30%]">
                    <div class="flex text-center text-[#0ed494] text-2xl justify-center font-extrabold">FIRST BUZZER
                    </div>
                    <div v-if="firstBuzzer"
                        class="flex gap-3 text-white font-bold text-xl bg-[#0ed494] p-2 rounded-lg">
                        <img :src="firstBuzzer.avatar" alt="User Avatar"
                            class="w-12 h-12 object-cover rounded-full border-[#0ed494] border-[3px] bg-[#274461]" />
                        <div class="self-center">{{ firstBuzzer.name }}</div>
                    </div>
                </div>

                <div
                    class="p-4 rounded-lg shadow-lg relative bg-[#274461] bg-opacity-70 h-full flex justify-center">
                    <button :class="['buzzer-btn h-72 w-72 flex self-center', buzzerLocked === '1' ? 'locked' : '']"
                        @click="pressButton">
                        <span>{{ buzzerLocked === '1' ? 'LOCKED' : 'BUZZ' }}</span>
                    </button>
                </div>

                <div
                    class="p-4 rounded-lg shadow-lg relative bg-[#274461] bg-opacity-70 h-full flex  flex-col justify-center">
                    <div v-if="role === 'admin'">

                        <button @click="resetButton" class="text-white bg-[#0ed494] rounded-lg p-2 w-full mt-2">
                            Reset
                        </button>
                    </div>
                </div>

            </div>
        </div>
        </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-[#274461] bg-opacity-80 rounded-lg p-6 w-[90%] max-w-lg text-white">
            <h2 class="text-2xl font-bold mb-4">Settings</h2>
            <p class="mb-6">Which section is currently online?</p>

            <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                    <span class="text-lg font-semibold">Hawking</span>
                    <label class="inline-flex relative items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.hawking" class="sr-only peer" />
                        <div class="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-[#0ed494] transition-all">
                        </div>
                        <div
                            class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow peer-checked:translate-x-5 transform transition-transform">
                        </div>
                    </label>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-lg font-semibold">Mendeleev</span>
                    <label class="inline-flex relative items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.mendeleev" class="sr-only peer" />
                        <div class="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-[#0ed494] transition-all">
                        </div>
                        <div
                            class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow peer-checked:translate-x-5 transform transition-transform">
                        </div>
                    </label>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-lg font-semibold">Faraday</span>
                    <label class="inline-flex relative items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.faraday" class="sr-only peer" />
                        <div class="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-[#0ed494] transition-all">
                        </div>
                        <div
                            class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow peer-checked:translate-x-5 transform transition-transform">
                        </div>
                    </label>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-lg font-semibold">Pascal</span>
                    <label class="inline-flex relative items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.pascal" class="sr-only peer" />
                        <div class="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-[#0ed494] transition-all">
                        </div>
                        <div
                            class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow peer-checked:translate-x-5 transform transition-transform">
                        </div>
                    </label>
                </div>
            </div>

            <button class="mt-6 bg-[#0ed494] text-white px-4 py-2 rounded hover:bg-[#0db883] w-full"
                @click="closeSettings">
                Close
            </button>
        </div>
    </div>
</template>

<style scoped>
.hidden-scrollbar {
  overflow-y: auto;
  /* Enable scrolling */
  scrollbar-width: none;
  /* For Firefox */
}

.hidden-scrollbar::-webkit-scrollbar {
  display: none;
  /* For Chrome, Safari, and Edge */
}

.buzzer-btn {
  position: relative;
  background: red;
  border-radius: 50%;
  box-shadow:
    inset 0 4px 8px rgba(0, 0, 0, 0.6),
    0 6px 12px rgba(0, 0, 0, 0.4);
  outline: none;
  cursor: pointer;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease;
}

.buzzer-btn:active {
  transform: translateY(2px);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.6),
    0 3px 6px rgba(0, 0, 0, 0.4);
}

.buzzer-btn span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.buzzer-btn.locked {
  background: #803434;
  /* Dimmed color for locked state */
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.4),
    0 3px 6px rgba(0, 0, 0, 0.2);
}

.buzzer-btn.locked span {
  color: #ccc;
  /* Faded text for locked state */
  text-transform: uppercase;
}

.spin {
  animation: spin 1s linear;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
