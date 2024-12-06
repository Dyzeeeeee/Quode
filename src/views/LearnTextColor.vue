<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import ApiServices from '@/services/ApiServices';
import Pusher from 'pusher-js';
import { useRoute, useRouter } from 'vue-router';


const goToBgColorPage = () => {
    router.push(`/learn/${sectionId}/bg-color`);
};

const navigateTo = (styleType) => {
    switch (styleType) {
        case 'textcolor':
            router.push(`/learn/${sectionId}/text-color`); // Example route, adjust as needed
            break;
        case 'bgcolor':
            router.push(`/learn/${sectionId}/bg-color`); // Example route, adjust as needed
            break;
        case 'fontsize':
            router.push(`/learn/${sectionId}/font-size`); // Example route, adjust as needed
            break;
        case 'textalign':
            router.push(`/learn/${sectionId}/text-align`); // Example route, adjust as needed
            break;
        default:
            break;
    }
};


const colors = [
    "black", "white", "red", "green", "blue", "yellow", "cyan", "magenta", "gray", "silver",
    "gainsboro", "lightgray", "darkgray", "dimgray", "slategray", "lightslategray", "indianred",
    "lightcoral", "salmon", "darksalmon", "crimson", "firebrick", "darkred", "coral", "tomato",
    "orangered", "orange", "darkorange", "gold", "lightyellow", "lemonchiffon", "lightgoldenrodyellow",
    "papayawhip", "moccasin", "peachpuff", "lawngreen", "chartreuse", "limegreen", "mediumseagreen",
    "seagreen", "forestgreen", "darkgreen", "greenyellow", "palegreen", "lightgreen", "darkseagreen",
    "lime", "springgreen", "mediumspringgreen", "powderblue", "lightblue", "skyblue", "lightskyblue",
    "deepskyblue", "dodgerblue", "royalblue", "mediumblue", "darkblue", "navy", "lavender", "thistle",
    "plum", "violet", "orchid", "fuchsia", "magenta", "mediumorchid", "mediumpurple", "blueviolet",
    "darkviolet", "darkorchid", "indigo", "pink", "lightpink", "hotpink", "deeppink", "palevioletred",
    "cornsilk", "blanchedalmond", "bisque", "navajowhite", "wheat", "burlywood", "tan", "rosybrown",
    "sandybrown", "goldenrod", "darkgoldenrod", "peru", "chocolate", "saddlebrown", "snow", "honeydew",
    "mintcream", "azure", "aliceblue", "ghostwhite", "whitesmoke", "beige", "oldlace"
];

const route = useRoute();
const router = useRouter();
const apiServices = new ApiServices();

const showActiveStudents = ref(true);
const showInactiveStudents = ref(true);

const colorsModal = ref(false);

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

const lockBuzzer = ref(0);
const buzzerLocked = computed(() => {
    const student = activeStudents.value.find(student => student.id === userId.value);
    return student ? student.is_buzzer_locked : "0";
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
    // Create the Audio object with the imported file
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


const currentUserId = ref(sessionStorage.getItem('userId'));


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
    lockBuzzer.value = 1;
    // lockBuzzer.value = 1;
    console.log("value ng buzzer ", lockBuzzer.value)
    console.log("fist", firstBuzzer.value)

    // if (audio.value) {
    // audio.value.play();
    // } else {
    // console.error('Audio is not loaded');
    // }
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
                <button class="absolute top-0 right-3 text-gray-700 rounded-full shadow-md hover:text-gray-400"
                    @click="openSettings">
                    <Icon icon="carbon:settings" class="text-2xl" />
                </button>
            </div>
            <div class="xl:flex h-full gap-3">


                <div class="flex flex-col gap-3 w-full sm:w-full md:w-[60%] lg:w-[100%] bg-[#274461] rounded-lg ">
                    <div class="p-2 rounded-lg  relative bg-opacity-100 flex-1">
                        <div class="flex text-center text-white text-2xl justify-center font-extrabold">CSS: Inline
                            Styling
                        </div>
                        <div class="flex text-center text-[#0ed494] text-xl justify-center font-extrabold">Text Color
                        </div>
                        <div class="h-[55vh] border-2 mt-2 rounded-lg border-gray-500 text-white p-2 flex-col flex">
                            <div class="font-bold">Code:</div>
                            <div class="p-0 text-xs xl:text-lg">
                                &lt;h1 <span class="text-yellow-500 font-bold">style="color:
                                    red;"</span>&gt;Sample&lt;/h1&gt; <br>
                                &lt;h2 <span class="text-yellow-500 font-bold">style="color:
                                    yellow;"</span>&gt;Sample&lt;/h2&gt;
                                <br>
                                &lt;p <span class="text-yellow-500 font-bold">style="color:
                                    green;"</span>&gt;Sample&lt;/p&gt;
                                <br>
                            </div>

                            <div class="font-bold mt-3">Output:</div>
                            <div class="">
                                <p style="color:red" class="text-2xl xl:text-3xl">Sample</p>
                                <p style="color:yellow" class="text-xl xl:text-2xl">Sample</p>
                                <p style="color:green" class="xl:text-xl">Sample</p>
                            </div>

                            <div class="flex flex-col items-center justify-center flex-1">
                                <button class="font-bold rounded-lg border-emerald-500 text-emerald-500 border-2 p-2 "
                                    @click="colorsModal = true">
                                    View all CSS colors
                                </button>
                            </div>

                        </div>
                    </div>
                    <!-- Modal -->

                    <!-- <div
                        class=" p-4 rounded-lg shadow-lg relative bg-[#274461] bg-opacity-70 h-full flex
                                    justify-center">
                                <div class=" h-72 ">

                                </div>
                            </div> -->

                    <div
                        class="p-4 rounded-lg shadow-lg relative  bg-opacity-70 h-full flex  flex-col justify-center  flex-1">
                        <div class="flex gap-2">

                            <button
                                :class="['text-white rounded-lg p-2 w-full mt-2 h-12 bg-[#0ed494] font-bold', lockBuzzer == '1' ? 'bg-gray-500 opacity-80' : '']"
                                @click="pressButton">
                                <span>{{ lockBuzzer == '1' ? 'Marked as Done' : 'Mark as Done' }}</span>
                            </button>
                            <button class="rounded-lg p-2 h-12 font-bold mt-2 bg-gray-500 opacity-80" disabled>
                                <Icon icon="fluent:previous-16-filled" height="20" />
                            </button>
                            <button class="bg-[#0ed494] rounded-lg p-2 h-12 font-bold mt-2" @click="goToBgColorPage">
                                <Icon icon="fluent:next-16-filled" height="20" />
                            </button>
                        </div>
                    </div>

                </div>
                <div
                    class="hidden p-4 relative rounded-lg shadow-lg w-full sm:w-full md:w-[60%] lg:w-[40%] relative bg-[#274461] bg-opacity-70 h-full xl:block xl:mt-0 mt-3">
                    <div class="flex ">
                        <button class="absolute top-3 right-3 text-white rounded-full hover:text-gray-400 xl:hidden"
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
                    <div class="flex flex-col gap-3 min-h-[65vh] overflow-y-auto hidden-scrollbar"
                        v-if="showActiveStudents">
                        <div class="flex flex-col gap-3 max-h-[65vh] overflow-y-auto hidden-scrollbar">
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
                    class="hidden p-4 rounded-lg  relative shadow-lg w-full sm:w-full md:w-[60%] lg:w-[40%]  bg-[#274461] bg-opacity-70 h-full xl:hidden xl:mt-0 mt-3">
                    <div class="flex xl:hidden">
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

    <div v-if="colorsModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-[#274461]  rounded-lg shadow-lg w-full max-w-4xl h-[100vh] text-white">
            <!-- Modal Header -->
            <div class="flex justify-between items-center p-4 border-b">
                <h2 class="text-xl font-bold">CSS Colors</h2>
                <button @click="colorsModal = false" class="text-red-500 font-bold text-3xl">
                    &times;
                </button>
            </div>

            <!-- Modal Content (Scrollable) -->
            <div class="overflow-auto h-[calc(100vh-72px)] p-4">
                <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div v-for="color in colors" :key="color" class="flex flex-col items-center p-2 border rounded-md">
                        <div :style="{ backgroundColor: color }" class="w-16 h-16 rounded-md border">
                        </div>
                        <p class="text-sm mt-2">{{ color }}</p>
                    </div>
                </div>
            </div>

            <!-- Modal Footer -->
            <!-- <div class="flex justify-end p-4 border-t">
                                <button @click="showModal = false" class="bg-red-500 text-white px-4 py-2 rounded-lg">
                                    Close
                                </button>
                            </div> -->
        </div>
    </div>
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-[#274461] bg-opacity-80 rounded-lg p-6 w-[90%] max-w-lg text-white">
            <h2 class="text-2xl font-bold mb-4">Learn CSS Inline Styling</h2>
            <p class="mb-6">Jump to which styling?</p>

            <!-- Buttons for each style category -->
            <div class="space-y-4">
                <button class="w-full bg-emerald-500 text-white px-4 py-2 rounded-lg " @click="navigateTo('textcolor')">
                    Text Color
                </button>
                <button class="w-full bg-emerald-500 text-white px-4 py-2 rounded-lg " @click="navigateTo('bgcolor')">
                    Background Color
                </button>
                <button class="w-full bg-emerald-500 text-white px-4 py-2 rounded-lg " @click="navigateTo('fontsize')">
                    Font Size
                </button>
                <button class="w-full bg-emerald-500 text-white px-4 py-2 rounded-lg " @click="navigateTo('textalign')">
                    Text Align
                </button>
            </div>

            <button class="mt-6 text-red-500 border-red-500 border-2 text-white px-4 py-2 rounded-lg w-full"
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
