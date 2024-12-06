<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import ApiServices from '@/services/V3Services';
import Pusher from 'pusher-js';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const apiServices = new ApiServices();
const goToTextColorPage = () => {
    router.push(`/learn/${sectionId}/text-color`);
};

const showActiveStudents = ref(false);
const showInactiveStudents = ref(false);

const isModalOpen = ref(false);
const LearnModal = ref(false);
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

const lockBuzzer = ref(0);
const buzzerLocked = computed(() => {
    const student = activeStudents.value.find(student => student.id === userId.value);
    const isBuzzerLocked = student ? student.is_buzzer_locked : "0";
    const isAdmin = role.value === 'admin';

    return isBuzzerLocked === '1' || isAdmin ? '1' : '0';
});

const sectionId = route.params.id;

watch(buzzerLocked, (newVal) => {
    lockBuzzer.value = newVal;
});

async function fetchSectionNameAndUserIdAndRole() {
    sectionName.value = localStorage.getItem('selectedSectionName');
    userId.value = localStorage.getItem('userId')
    role.value = localStorage.getItem('role');
}

import buzzerSound from '@/assets/audio/buzzer.mp3'; // Import the audio file

const audio = ref(null);

onMounted(() => {
    console.log(role.value);
    audio.value = new Audio(buzzerSound);
    audio.value.load(); // Preload the audio
    console.log("fist", firstBuzzer.value)
});


async function fetchStudentsBySection() {
    const response = await apiServices.getStudentsBySection(sectionId);
    students.value = response;

    // Filter active students
    activeStudents.value = students.value.filter(student => student.is_online === "1");

    // Place the user with `userId` at the top and sort the rest by sequence
    activeStudents.value.sort((a, b) => {
        if (a.id === userId.value) return -1; // User comes first
        if (b.id === userId.value) return 1;

        // Sort `null` sequence values last
        if (a.sequence === null && b.sequence === null) return 0;
        if (a.sequence === null) return 1;
        if (b.sequence === null) return -1;

        // Sort by sequence ascending
        return a.sequence - b.sequence;
    });

    
    console.log(activeStudents.value);
}

const inactiveStudents = ref([]);

async function fetchInactiveStudentsBySection() {
    const response = await apiServices.getStudentsBySection(sectionId);
    students.value = response;

    // Filter active students
    inactiveStudents.value = students.value.filter(student => student.is_online === "0");

    // Place the user with `userId` at the top and sort the rest by sequence
    inactiveStudents.value.sort((a, b) => {
        if (a.id === userId.value) return -1; // User comes first
        if (b.id === userId.value) return 1;

        // Sort `null` sequence values last
        if (a.sequence === null && b.sequence === null) return 0;
        if (a.sequence === null) return 1;
        if (b.sequence === null) return -1;

        // Sort by sequence ascending
        return a.sequence - b.sequence;
    });
}


const currentUserId = ref(localStorage.getItem('userId'));


const handleScoreAwarded = () => {
    fetchStudentsBySection();
    fetchInactiveStudentsBySection();
};

const handleBuzzEvent = () => {
    fetchStudentsBySection();
    fetchInactiveStudentsBySection();

};

const handleUserLoggedIn = () => {
    fetchStudentsBySection();
    fetchInactiveStudentsBySection();

};

const handleLogout = () => {
    fetchStudentsBySection();
    fetchInactiveStudentsBySection();


}


const handleLeave = async () => {
    const data = {
        user_id: userId.value
    }
    const response = await apiServices.logout(data);
    localStorage.clear();
    router.push('/')
}

const openSettings = async () => {
    LearnModal.value = true;
    // isModalOpen.value = true;
}

const pressButton = async () => {
    lockBuzzer.value = 1;
    console.log("value ng buzzer ", lockBuzzer.value)
    console.log("fist", firstBuzzer.value)

    if (audio.value) {
        audio.value.play();
    } else {
        console.error('Audio is not loaded');
    }
    const data = {
        user_id: userId.value
    }

    const response = await apiServices.buzz(data);

}

const resetButton = async () => {
    const response = await apiServices.resetBuzzerState();
}

const logoutAll = async () => {
    const response = await apiServices.logoutAll();
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

const getFile = async () => {
    const response = await apiServices.getFile();
}

const awardPoint = async (id) => {
    // Show a confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to award 1 point to this user?");

    if (!isConfirmed) {
        // Exit if the user cancels
        return;
    }

    // Prepare the data
    const data = {
        user_id: id,
        score: 1
    };

    try {
        // Call the API service to award the score
        const response = await apiServices.awardScore(data);

        if (response.status === 200) {
            // Handle successful response (if needed)
            alert("Point awarded successfully.");
        } else {
            // Handle error response (if needed)
            alert("Failed to award point. Please try again.");
        }
    } catch (error) {
        // Handle unexpected errors
        console.error("Error awarding point:", error);
        alert("An error occurred. Please try again later.");
    }
};


let pusher = null;
let buzzChannel = null;
let loginChannel = null;

onMounted(() => {
    fetchSectionNameAndUserIdAndRole();
    fetchStudentsBySection();
    fetchInactiveStudentsBySection();

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
    // Subscribe to login-channel
    
    loginChannel = pusher.subscribe("logout-channel");
    loginChannel.bind("all-players-logged-out", handleLogout);
});
</script>

<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-[#274461]">
        <video autoplay muted playsinline
            class="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none xl:flex hidden">
            <source src="@/assets/images/appbg-flip.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <div
            class="bg-[#1c1f23] xl:bg-black border-white border-2 flex flex-col xl:w-[80%] h-auto w-full rounded-lg p-4">
            <div class="relative flex px-3 pt-2">
                <!-- Left Section -->
                <div class="flex-1 flex justify-start transform text-red-500 opacity-70">
                    <button
                        class="rounded-lg border-red-500 border-2 w-32 h-12 self-center flex gap-2 items-center justify-center font-bold"
                        @click="handleLeave()">
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
                    <div
                        class="text-2xl text-[#274461] p-3 rounded-lg w-full transform transition-all duration-150 ease-in-out text-gray-400">
                        Section: <span class="text-[#0ed494] font-bold">
                            {{ sectionName || 'Loading...' }} <!-- Show "Loading..." if sectionName is not available -->
                        </span>
                    </div>
                </div>

                <!-- Settings Button -->
                <button class="absolute top-0 right-3 text-green-500 rounded-full shadow-md"
                    @click="openSettings">
                    <Icon icon="carbon:settings" class="text-4xl" />
                </button>
            </div>
            <div class="xl:flex h-full gap-3">


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
                        <div v-else
                            class="flex gap-3 text-white font-bold text-xl bg-[#778480] p-2 rounded-lg bg-opacity-50 border-gray-500 opacity-50 border-[3px] border-dashed">
                            <img src="https://media.istockphoto.com/id/1162198273/vector/question-mark-icon-flat-vector-illustration-design.jpg?s=612x612&w=0&k=20&c=MJbd8bw2iewJRd8sEkHxyGMgY3__j9MKA8cXvIvLT9E="
                                alt="User Avatar"
                                class="w-12 h-12 object-cover rounded-full border-gray-500 border-[3px] border-dashed bg-[#a3a6a9]" />
                            <div class="self-center">----</div>
                        </div>
                    </div>

                    <div
                        class="p-4 rounded-lg shadow-lg relative bg-[#274461] bg-opacity-70 h-full flex justify-center">
                        <button :class="['buzzer-btn h-72 w-72 flex self-center', lockBuzzer == '1' ? 'locked' : '']"
                            :disabled="lockBuzzer == '1'" @click="pressButton">
                            <span>{{ lockBuzzer == '1' ? 'LOCKED' : 'BUZZ' }}</span>
                        </button>

                    </div>

                    <div v-if="role === 'admin'"
                        class="p-4 rounded-lg shadow-lg relative bg-[#274461] bg-opacity-70 h-full flex  flex-col justify-center ">
                        <div>

                            <button @click="resetButton" :class="[
                                'text-white rounded-lg p-2 w-full mt-2'
                            ]">
                                Reset
                            </button>

                            <button @click="logoutAll" :class=" 'text-white rounded-lg p-2 w-full mt-2 bg-red-500'">
                                Log out All
                            </button>
                        </div>
                    </div>

                </div>
                <div
                    class="p-4 relative rounded-lg shadow-lg w-full sm:w-full md:w-[60%] lg:w-[40%] relative bg-[#274461] bg-opacity-70 h-full xl:block xl:mt-0 mt-3">
                    <div class="flex">
                        <button class="absolute top-3 right-3 text-white rounded-full hover:text-gray-400"
                            @click="showActiveStudents = !showActiveStudents">
                            <!-- Conditional icon rendering based on showActiveStudents -->
                            <Icon
                                :icon="showActiveStudents ? 'solar:alt-arrow-up-bold-duotone' : 'solar:alt-arrow-down-bold-duotone'"
                                class="text-2xl" height="40" />
                        </button>

                        <div class="flex-1">
                            <div class="flex text-center text-[#0ed494] text-2xl justify-center font-extrabold">
                                <div>ONLINE</div>
                                <!-- <div class="text-white self-center">
                                    <button @click="startSpin">
                                        <Icon icon="tdesign:refresh" height="20" :class="{ spin: spinIcon }" />
                                    </button>
                                </div> -->
                            </div>
                            <div
                                class="flex text-center text-[#0ed494] text-2xl items-center justify-center font-extrabold mb-3 self-center">
                                <Icon icon="ic:baseline-circle" height="15" class="mr-1 text-[#14d049]" />
                                <div class="text-[#0ed494]">{{ activeStudents.length }}/{{
                                    students.length }}</div>
                                    
                            </div>
                        </div>

                    </div>
                    <div class="flex flex-col gap-3 min-h-[55vh] overflow-y-auto hidden-scrollbar"
                        v-if="showActiveStudents">
                        <div class="flex flex-col gap-3 max-h-[55vh] overflow-y-auto hidden-scrollbar">
                            <div v-for="student in activeStudents" :key="student.id"
                                class="flex items-center gap-4 bg-[#295d90] p-4 rounded-lg shadow-md cursor-pointer transition hover:bg-[#3b76ad]"
                                @click="awardPoint(student.id)"
                                :class="[student.id === userId ? 'border-emerald-500 border-[3px]' : 'border-transparent']">
                                <!-- Avatar -->
                                <img :src="student.avatar" alt="Student Avatar"
                                    class="w-14 h-14 object-cover rounded-full border-2 border-[#0ed494]" />
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
                                <div
                                    class="flex items-center justify-center min-w-10 min-h-10 rounded-full bg-white shadow-md">
                                    <span v-if="student.sequence === 1" class="text-yellow-400" title="First Place">
                                        <iconify-icon icon="mdi:trophy" class="text-xl"></iconify-icon>
                                    </span>
                                    <span v-else-if="student.sequence === 2" class="text-gray-300" title="Second Place">
                                        <iconify-icon icon="mdi:medal" class="text-xl"></iconify-icon>
                                    </span>
                                    <span v-else-if="student.sequence === 3" class="text-brown-500" title="Third Place">
                                        <iconify-icon icon="mdi:medal-outline" class="text-xl"></iconify-icon>
                                    </span>
                                    <span v-else class="text-[#295d90] font-bold text-lg" title="Not Ranked">
                                        {{ student.sequence ?? "-" }}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
                <div
                    class="p-4 rounded-lg  relative shadow-lg w-full sm:w-full md:w-[60%] lg:w-[40%]  bg-[#274461] bg-opacity-70 h-full xl:block xl:mt-0 mt-3">
                    <div class="flex">
                        <button class="absolute top-3 right-3 text-white rounded-full hover:text-gray-400"
                            @click="showInactiveStudents = !showInactiveStudents">
                            <!-- Conditional icon rendering based on showInactiveStudents -->
                            <Icon
                                :icon="showInactiveStudents ? 'solar:alt-arrow-up-bold-duotone' : 'solar:alt-arrow-down-bold-duotone'"
                                class="text-2xl" height="40" />
                        </button>
                        <div class="flex-1">
                            <div class="flex text-center text-[#b0efdb] text-2xl justify-center font-extrabold">
                                <div>OFFLINE</div>
                                <!-- <div class="text-white self-center">
                                    <button @click="startSpin">
                                        <Icon icon="tdesign:refresh" height="20" :class="{ spin: spinIcon }" />
                                    </button>
                                </div> -->
                            </div>
                            <div
                                class="flex text-center text-[#b0efdb] text-2xl items-center justify-center font-extrabold mb-3 self-center">
                                <Icon icon="ic:baseline-circle" height="15" class="mr-1 text-[#b0efdb]" />
                                <div class="text-[#b0efdb]">{{ inactiveStudents.length }}/{{
                                    students.length }}</div>
                            </div>
                        </div>

                    </div>
                    <div v-if="showInactiveStudents"
                        class="flex flex-col gap-3 min-h-[55vh] overflow-y-auto hidden-scrollbar">
                        <div class="flex flex-col gap-3 max-h-[55vh] overflow-y-auto hidden-scrollbar">
                            <div v-for="student in inactiveStudents" :key="student.id"
                                class="relative flex items-center gap-4 bg-[#3f566c] p-4 rounded-lg shadow-md cursor-pointer transition"
                                @click="awardPoint(student.id)"
                                :class="[student.id === userId ? 'border-gray-500 border-[3px]' : 'border-transparent']">

                                <!-- Overlay for Inactive Students -->
                                <div v-if="!student.active" class="absolute inset-0 bg-gray-500 opacity-50 rounded-lg">
                                </div>

                                <!-- Avatar -->
                                <img :src="student.avatar" alt="Student Avatar"
                                    class="w-14 h-14 object-cover rounded-full border-2 border-[#b0e0d1]" />

                                <!-- Details -->
                                <div class="flex flex-col flex-grow">
                                    <div class="text-lg font-bold text-white">
                                        {{ student.name }}
                                    </div>
                                </div>

                                <!-- Ranking Icon -->
                                <div
                                    class="flex items-center justify-center min-w-10 min-h-10 rounded-full bg-white shadow-md">
                                    <span v-if="student.sequence === 1" class="text-yellow-400" title="First Place">
                                        <iconify-icon icon="mdi:trophy" class="text-xl"></iconify-icon>
                                    </span>
                                    <span v-else-if="student.sequence === 2" class="text-gray-300" title="Second Place">
                                        <iconify-icon icon="mdi:medal" class="text-xl"></iconify-icon>
                                    </span>
                                    <span v-else-if="student.sequence === 3" class="text-brown-500" title="Third Place">
                                        <iconify-icon icon="mdi:medal-outline" class="text-xl"></iconify-icon>
                                    </span>
                                    <span v-else class="text-[#295d90] font-bold text-lg" title="Not Ranked">
                                        {{ student.sequence ?? "-" }}
                                    </span>
                                </div>
                            </div>


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


    <div v-if="LearnModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div class="bg-gradient-to-r from-[#243b55] to-[#274461] shadow-lg rounded-lg p-6 w-[90%] max-w-md text-white relative">
            <!-- Modal Title -->
            <div class="text-center text-2xl font-extrabold mb-4">
                CSS: Inline Styling
            </div>
            <!-- Download File Button -->
            <button
                @click="getFile"
                class="w-full mt-4 bg-[#10b981] text-white font-semibold px-4 py-3 rounded-md hover:bg-[#0aa96d] transition ease-in-out duration-300 shadow-sm">
                Download File
            </button>
            <!-- Start Learning Button -->
            <button
            @click="goToTextColorPage"
                class="w-full mt-4 bg-[#3b82f6] text-white font-semibold px-4 py-3 rounded-md hover:bg-[#2563eb] transition ease-in-out duration-300 shadow-sm">
                Start Learning
            </button>
            <!-- Close Button -->
            <button
                class="w-full mt-4 border-2 border-red-600 text-red-600 font-semibold px-4 py-3 rounded-md hover:bg-red-600 hover:text-white transition ease-in-out duration-300 shadow-sm"
                @click="LearnModal = false">
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
