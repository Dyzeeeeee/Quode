<script setup>
import { ref, watchEffect, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import axios from 'axios';
import Pusher from 'pusher-js';
const isModalOpen = ref(false); // Modal state

const openSettings = () => {
    isModalOpen.value = true;
};

const closeSettings = () => {
    isModalOpen.value = false;
};
const userData = JSON.parse(sessionStorage.getItem('userData'));
const currentUserName = userData ? userData.name : null;

const firstBuzzer = computed(() => {
    return activeStudents.value.find(student => student.sequence === '1');
});

console.log(currentUserName);  // Outputs the name of the user, or null if not found
const route = useRoute();
const point = ref(1);
const router = useRouter();
const sectionId = route.params.id; // Access the 'section' parameter from the route
const students = ref([]);
const activeStudents = computed(() =>
    students.value.filter(student => student.is_online === "1")
);
// const buzzerState = ref(false);

const settings = ref({
    hawking: false,
    mendeleev: false,
    faraday: false,
    pascal: false,
});

const section = ref('')

const getSection = async () => {
    try {
        const response = await axios.get(`/section/${sectionId}`);
        section.value = response.data;
    } catch (error) {
        console.error('Error fetching students:', error.message);
    }
};


// const userData = JSON.parse(sessionStorage.getItem('userData'));
const currentUserId = userData?.id || null;

const getStudentsBySection = async () => {
    try {
        const response = await axios.get(`/list/${sectionId}`);
        students.value = response.data;
    } catch (error) {
        console.error('Error fetching students:', error.message);
    }
};


const resetButton = async () => {
    try {
        const response = await axios.post(`/reset`, {
            section_id: parseInt(sectionId)
        });
        console.log('Button pressed:', response.data);
    } catch (error) {
        console.error('Error pressing button:', error.message);
    }
}

const buzzerLocked = ref(true);

const pressButton = async () => {
    const userData = JSON.parse(sessionStorage.getItem('userData')); // Retrieve the userdata object from sessionStorage
    const userId = userData?.id; // Access the id property safely
    if (!userId) {
        console.error('User ID not found in sessionStorage');
        return;
    }

    try {
        const response = await axios.post(`/buzz`, {
            user_id: parseInt(userId)
        });
        console.log('Button pressed:', response.data);
        buzzerLocked.value = response.data.is_buzzer_locked;
    } catch (error) {
        console.error('Error pressing button:', error.message);
    }
};

const awardPoint = async (id) => {
    try {
        const response = await axios.post('/award', {
            user_id: id,
            score: 1,
        });
        console.log('Award points response:', response.data);

        // Optionally update student data (e.g., increment score)
        const awardedStudent = activeStudents.value.find(student => student.id === id);
        if (awardedStudent) {
            awardedStudent.score = (awardedStudent.score || 0) + 1; // Assuming `score` exists in the student object
        }
    } catch (error) {
        console.error('Error awarding points:', error.message);
    }
};



const startSpin = () => {
    spinIcon.value = true;
    setTimeout(() => {
        spinIcon.value = false; // Reset spin after animation completes
    }, 1000); // Match the duration of the animation (1 second)
};


const spinIcon = ref(false);

const role = ref('');

// Pusher setup
let pusher = null;
let channel = null;

const handleScoreAwarded = () => {
  getStudentsBySection();
};

const handleBuzzEvent = () => {
  getStudentsBySection();
};

onMounted(async () => {
  await getSection();
  await getStudentsBySection();

  pusher = new Pusher("423a1b2b7b3786d99280", {
    cluster: "ap1",
  });

  channel = pusher.subscribe("buzz-channel");
  channel.bind("score-awarded", handleScoreAwarded);
  channel.bind("buzz-event", handleBuzzEvent);
});


const handleLeave = async () => {
    try {
        const response = await axios.post(`/logout`, {
            user_id: parseInt(currentUserId)
        });
        console.log('Button pressed:', response.data);
    } catch (error) {
        console.error('Error pressing button:', error.message);
    }
    router.push('/')
}


</script>


<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-black">
        <video autoplay muted playsinline
            class="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none">
            <source src="@/assets/images/appbg-flip.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <div class="bg-black border-white border-2 flex flex-col xl:w-[80%] h-auto  w-full rounded-lg p-4">
            <div class="relative flex px-3 pt-2">
                <!-- Left Section -->
                <div class="flex-1 flex justify-start transform text-red-500 opacity-70">
                    <button
                        class="rounded-lg border-red-500 border-2 w-32 h-12 self-center flex gap-2 items-center justify-center font-bold"
                        @click="handleLeave">
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
                        Section: <span class="text-[#0ed494] font-bold"> {{ section.section_name }}</span>
                    </div>
                </div>

                <!-- Settings Button -->
                <button class="absolute top-0 right-3  text-gray-700 rounded-full  shadow-md hover:text-gray-400"
                    @click="openSettings">
                    <Icon icon="carbon:settings" class="text-2xl" />
                </button>
            </div>
            <div class="flex h-full gap-3">
                <div
                    class="p-4 rounded-lg shadow-lg w-full sm:w-full md:w-[60%] lg:w-[40%] relative bg-[#274461] bg-opacity-70 h-full xl:block hidden">
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
                    <div class="flex flex-col gap-2 max-h-[52vh] overflow-y-auto hidden-scrollbar">
                        <div v-for="student in activeStudents" :key="student.id"
                            class="flex gap-3 text-white font-bold text-xl bg-[#295d90] p-2 rounded-lg cursor-pointer"
                            @click="awardPoint(student.id)"
                            :class="[student.id === currentUserId ? 'border-emerald-500 border-[3px]' : 'border-[#0ed494]']">
                            <img :src="student.avatar" alt="Student Avatar"
                                class="w-12 h-12 object-cover rounded-full border-[3px] bg-[#274461]" />
                            <div class="self-center">{{ student.name }}</div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-3 w-full sm:w-full md:w-[60%] lg:w-[60%]">
                    <div class="p-4 rounded-lg shadow-lg relative bg-[#274461] bg-opacity-70 h-[30%]">
                        <div class="flex text-center text-[#0ed494] text-2xl justify-center font-extrabold">FIRST BUZZER
                        </div>

                        <!-- Conditionally show the user details if buzzer_state.user.id exists -->
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


                        <!-- <div v-if="role === 'admin'">
                            <button @click="reset" class="text-white bg-[#0ed494] rounded-lg p-2 w-full mt-2">
                                Reset
                            </button>
                        </div> -->
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
