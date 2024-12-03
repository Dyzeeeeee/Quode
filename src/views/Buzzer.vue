<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import axios from 'axios';
import Pusher from 'pusher-js';

const userData = JSON.parse(sessionStorage.getItem('userData'));
const currentUserName = userData ? userData.name : null;

console.log(currentUserName);  // Outputs the name of the user, or null if not found
const route = useRoute();
const point = ref(1);
const router = useRouter();
const section = route.params.section; // Access the 'section' parameter from the route
const students = ref([]);
const buzzerState = ref({
    is_locked: false,
    user: {
        id: null, // Set to null initially or based on actual state
        name: '',
        avatar: ''
    }
});

const getStudents = async () => {
    try {
        const response = await axios.get(`/students/section/${section}`);
        students.value = response.data.students; // Assign the response students array to the students ref
    } catch (error) {
        console.error('Error fetching students:', error.message);
    }
};

const pressButton = async () => {
    const userId = sessionStorage.getItem('userId'); // Retrieve the user ID from sessionStorage
    if (!userId) {
        console.error('User ID not found in sessionStorage');
        return;
    }

    try {
        const response = await axios.post(`/press`, {
            user_id: parseInt(userId)
        });
        console.log('Button pressed:', response.data);
    } catch (error) {
        console.error('Error pressing button:', error.message);
    }
};

const awardPoint = async () => {
    try {
        const response = await axios.post('/award', {
            user_id: buzzerState.value.user.id,
            score: point.value,
            award: true
        });
        console.log('Award points response:', response.data);
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

const getBuzzerState = async () => {
    try {
        const response = await axios.get(`/buzzer-state`);
        buzzerState.value = response.data;
    } catch (error) {
        console.error('Error fetching students:', error.message);
    }
};

const spinIcon = ref(false);

const role = ref('');

onMounted(() => {
    getBuzzerState();
    getStudents();

    role.value = sessionStorage.getItem('role');

    // Initialize Pusher
    const pusher = new Pusher('423a1b2b7b3786d99280', {
        cluster: 'ap1'
    });

    // Subscribe to the primary buzzer channel
    const buzzerChannel = pusher.subscribe('buzzer-channel');
    buzzerChannel.bind('buzzer-pressed', (data) => {
        console.log('Buzzer pressed event:', data);
        getStudents(); // Refresh students list
        getBuzzerState(); // Refresh buzzer state
        startSpin(); // Trigger animation or update UI
    });

    buzzerChannel.bind('buzzer-reset', (data) => {
        console.log('Buzzer reset event:', data);
        getStudents();
        getBuzzerState();
    });

    // Subscribe to the new additional channel
    const newChannel = pusher.subscribe('additional-channel');
    newChannel.bind('buzzer-reset', (data) => {
        console.log('Additional channel event received:', data);
        getStudents();
        getBuzzerState();
    });
});

const handleLeave = async () => {
    router.push('/');
};
</script>


<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-black">
        <video autoplay muted playsinline
            class="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none">
            <source src="@/assets/images/appbg-flip.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <div class="bg-black border-white border-2 flex flex-col w-[80%] h-[9   0vh] rounded-lg p-4">
            <div class="flex px-3 pt-2">
                <div class="flex-1 flex justify-start transform text-red-500 opacity-70">
                    <button
                        class="rounded-lg border-red-500 border-2 w-32 h-12 self-center flex gap-2 items-center justify-center font-bold"
                        @click="handleLeave">
                        <Icon icon="streamline:interface-logout-arrow-exit-frame-leave-logout-rectangle-right" />
                        <div>Leave</div>
                    </button>
                </div>
                <div class="flex-1 flex justify-center transform opacity-70 self-center"><img src="@/assets/images/QuodE.png" alt=""
                        class="h-20" /></div>
                <div class="mt-3 flex-1 flex justify-end text-end">
                    <div
                        class="text-2xl text-[#274461] p-3 rounded-lg w-full transform transition-all duration-150 ease-in-out text-gray-400">
                        Section: <span class="text-[#0ed494] font-bold"> {{ section }}</span>
                    </div>
                </div>
            </div>
            <div class="flex h-full gap-3">
                <div
                    class="p-4 rounded-lg shadow-lg w-full sm:w-full md:w-[60%] lg:w-[40%] relative bg-[#274461] bg-opacity-70 h-full">
                    <div class="flex">
                        <div class="flex-1"></div>
                        <div class="flex-1">
                            <div class="flex text-center text-[#0ed494] text-2xl justify-center font-extrabold">STUDENTS
                            </div>
                            <div class="flex text-center text-[#0ed494] text-2xl justify-center font-extrabold mb-3">{{
                                students.length }}</div>
                        </div>
                        <div class="flex-1 text-white">
                            <button @click="startSpin">
                                <Icon icon="tdesign:refresh" height="20" :class="{ spin: spinIcon }" />
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 max-h-[52vh] overflow-y-auto hidden-scrollbar">
                        <div v-for="student in students" :key="student.name"
                            class="flex gap-3 text-white font-bold text-xl bg-[#295d90] p-2 rounded-lg " :class="[student.name === currentUserName ? 'border-emerald-500 border-[3px]' : 'border-[#0ed494]'
                            ]">
                            <img :src="student.avatar" alt="Student Avatar"
                                class="w-12 h-12 object-cover rounded-full border-[3px] bg-[#274461]" />
                            <div class="self-center">{{ student.name }}</div>
                        </div>

                    </div>
                </div>
                <div class="flex flex-col gap-3 w-full sm:w-full md:w-[60%] lg:w-[60%]">
                    <div class="p-4 rounded-lg shadow-lg relative bg-[#274461] bg-opacity-70 h-[30%]">
                        <div class="flex text-center text-[#0ed494] text-2xl justify-center font-extrabold">STUDENT WHO
                            BUZZED</div>

                        <!-- Conditionally show the user details if buzzer_state.user.id exists -->
                        <div v-if="buzzerState.user?.id"
                            class="flex gap-3 text-white font-bold text-xl bg-[#0ed494] p-2 rounded-lg">
                            <img :src="buzzerState.user.avatar" alt="User Avatar"
                                class="w-12 h-12 object-cover rounded-full border-[#0ed494] border-[3px] bg-[#274461]" />
                            <div class="self-center">{{ buzzerState.user.name }}</div>
                        </div>
                    </div>

                    <div
                        class="p-4 rounded-lg shadow-lg relative bg-[#274461] bg-opacity-70 h-full flex justify-center">
                        <button
                            :class="['buzzer-btn h-72 w-72 flex self-center', buzzerState.is_locked === '1' ? 'locked' : '']"
                            @click="pressButton">
                            <span>{{ buzzerState.is_locked === '1' ? 'LOCKED' : 'BUZZ' }}</span>
                        </button>


                        <div v-if="role === 'admin'">
                            <input v-model="point" type="number" placeholder="Point"
                                class="w-full p-2 border border-gray-300 rounded-md bg-gray-400 bg-opacity-50 font-bold text-white " />
                            <button @click="awardPoint" class="text-white bg-[#0ed494] rounded-lg p-2 w-full mt-2">
                                Award
                            </button>
                        </div>
                    </div>

                </div>
            </div>
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
