<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <video autoplay muted playsinline
            class="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none">
            <source src="@/assets/images/appbg.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <div
            class="p-8 rounded-lg shadow-lg w-full sm:w-full md:w-[60%] lg:w-[40%] relative bg-[#274461] bg-opacity-70">
            <div class="flex justify-center mb-5">
                <img src="@/assets/images/QuodE.png" alt="App Logo" class="xl:h-32 h-24" />
            </div>
            <div class="flex flex-col md:flex-row gap-3">
                <div
                    class="mt-4 flex justify-center relative xl:max-w-52 xl:max-h-52 max-h-40 max-w-40 self-center rounded-full p-4 bg-[#274461]">
                    <div v-if="isAvatarLoading"
                        class="absolute inset-0 flex justify-center items-center bg-[#274461] rounded-full w-full h-full p-4">
                        <div
                            class=" border-[#0ed494] border-[5px] w-full h-full rounded-full flex items-center justify-center">
                            <Icon icon="eos-icons:loading" class="h-20 w-20 text-gray-500 animate-spin" />
                        </div>
                    </div>

                    <!-- Avatar Image -->
                    <img :src="avatarUrl" alt="Random Character"
                        class="w-full h-full object-cover rounded-full border-[#0ed494] border-[5px] bg-emerald-400"
                        @load="isAvatarLoading = false" @error="handleAvatarError" />
                    <div v-if="!isAvatarLoading">
                        <button @click="toggleMenu"
                            class="absolute bottom-2 left-0 mb-2 p-1 bg-[#274461] text-white rounded-full">
                            <Icon icon="material-symbols:styler-outline"
                                class="xl:h-[45px] xl:w-[45px] h-[35px] w-[35px]" />
                        </button>
                        <button @click="randomizeSeed"
                            class="absolute bottom-2 right-0 mb-2 p-1 bg-[#274461] text-white rounded-full">
                            <Icon icon="game-icons:perspective-dice-six-faces-random"
                                class="xl:h-[45px] xl:w-[45px] h-[35px] w-[35px]" />
                        </button>
                    </div>
                </div>
                <div class="flex flex-col gap-3 justify-center w-full">
                    <div>
                        <div class="text-white text-xl font-bold">Who are you?</div>
                    </div>
                    <div>
                        <select v-model="selectedSection"
                            class="w-full p-2 border border-gray-300 rounded-md bg-gray-400 bg-opacity-50 text-white text-xl font-bold">
                            <option disabled value="">Select Section</option>
                            <option v-for="(section, index) in sectionGrouped" :key="index" :value="section.section_id"
                                class="text-gray-700">
                                {{ section.section_name }}
                            </option>
                        </select>
                    </div>
                    <div v-if="selectedSection">
                        <select v-model="selectedName"
                            class="w-full p-2 border border-gray-300 rounded-md bg-gray-400 bg-opacity-50 text-white text-xl font-bold">
                            <option disabled value="">Your Name</option>
                            <option v-for="user in sectionGrouped.find(s => s.section_id === selectedSection)?.users"
                                :key="user.id" :value="user.id" class="text-gray-700">
                                {{ user.name }}
                            </option>
                        </select>
                    </div>
                    <div>
                        <div class="font-bold mb-2 text-xl text-white">Device Type</div>
                        <div class="flex gap-2">
                            <button @click="selectDevice('Phone')"
                                class="rounded-full border-2 w-16 h-16 flex items-center justify-center"
                                :class="{ 'bg-blue-500 text-white': deviceType === 'Phone' }">
                                <Icon icon="bx:mobile" height="40" />
                            </button>

                            <!-- Desktop Button -->
                            <button @click="() => { selectDevice('Desktop'); pcModal = true; }"
                                class="rounded-full border-2 w-16 h-16 flex items-center justify-center"
                                :class="{ 'bg-blue-500 text-white': deviceType === 'Desktop' }">
                                <Icon icon="tdesign:desktop" height="40" />
                            </button>

                            <!-- Laptop Button -->
                            <button @click="selectDevice('Laptop')"
                                class="rounded-full border-2 w-16 h-16 flex items-center justify-center"
                                :class="{ 'bg-blue-500 text-white': deviceType === 'Laptop' }">
                                <Icon icon="icon-park-outline:laptop" height="40" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-3">
                <button @click="handleJoin"
                    class="bg-[#0ed494] text-[#274461] p-3 text-xl rounded-lg w-full font-bold shadow-lg active:scale-95">
                    JOIN
                </button>
            </div>
        </div>
        <div v-if="isMenuOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div
                class="bg-[#0ed494] bg-opacity-90 p-6 rounded-lg shadow-lg w-[100vw] h-[100vh] sm:w-[95vw] md:w-[80vw] lg:w-[90vw]">
                <h3 class="text-3xl font-bold mb-4 text-white">Select Avatar Style</h3>
                <div
                    class="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-10 gap-4 lg:gap-2 h-[80vh] overflow-y-auto">
                    <div v-for="(style, key) in AVATAR_STYLES" :key="key" class="flex flex-col items-center gap-2">
                        <div @click="selectStyle(style)"
                            class="cursor-pointer bg-[#274461] xl:w-40 w-24 h-30 rounded-lg p-2">
                            <img :src="`https://api.dicebear.com/9.x/${style}/svg?seed=random`" alt="Sample Avatar"
                                class="xl:w-24 xl:h-24 w-16 h-16 object-cover rounded-full mb-2" />
                            <button class="xl:w-full py-2 text-center text-white">
                                {{ style.charAt(0).toUpperCase() + style.slice(1) }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="showGform" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-[#0ed494] bg-opacity-90 p-6 rounded-lg shadow-lg w-[90vw]  ">
            <div class="font-bold text-xl">Before anything else!</div>
            <div class="text-xl">Answer this <span @click="goToGForms" class="text-blue-800 font-bold underline">Google
                    Form</span> first!
            </div>
            <button class="mt-6 text-gray-500  px-4 py-2 w-full font-bold" @click="showGform = false">
                Already responded
            </button>
        </div>
    </div>
    <div v-if="pwModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-[#274461] bg-opacity-90 p-6 rounded-lg shadow-lg w-[90vw] xl:w-[30%]">
            <!-- Modal Header -->
            <h2 class="text-white text-2xl font-bold mb-4">Accessing an Admin Account</h2>

            <!-- Password Input -->
            <div class="mb-4">
                <label for="password" class="block text-white font-semibold mb-2">Input Password</label>
                <input id="password" type="password" v-model="password"
                    class="w-full p-2 rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0ed494] text-gray-800"
                    placeholder="Enter admin password" />
            </div>

            <button class="border-red-500 text-red-500  rounded-lg p-2 w-full" @click="pwModal = false">Close</button>
        </div>
    </div>

    <div v-if="pcModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-[#274461] bg-opacity-90 p-6 rounded-lg shadow-lg w-[90vw] xl:w-[30%]">
            <!-- Modal Header -->
            <h2 class="text-white text-2xl font-bold mb-4">Which PC are you using?</h2>

            <!-- Password Input -->
            <div class="mb-4">
                <select v-model="selectedPcNumber"
                    class="w-full p-2 border border-gray-300 rounded-md bg-gray-400 bg-opacity-50 text-white text-xl font-bold">
                    <option disabled value="">PC Number</option>
                    <option v-for="n in 40" :key="n" :value="n" class="text-gray-700">
                        {{ n }}
                    </option>
                </select>

            </div>
            <div>
                <button class="bg-emerald-500 rounded-lg p-3 w-full" @click="pcModal = false">Confirm</button>
            </div>

        </div>
    </div>


</template>


<script setup>
import { ref, watchEffect, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import V3Services from '@/services/V3Services';

import { useToast } from "primevue/usetoast";

const selectedPcNumber = ref(null);
const deviceType = ref(null);

function selectDevice(type) {
    deviceType.value = type;
    console.log('Selected device:', type);
} const toast = useToast();
const password = ref('');
const pwModal = ref(false);
const pcModal = ref(false);
// Services and Router
const apiServices = new V3Services();
const router = useRouter();
const goToGForms = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSfNgm7617fV5wHY7ymXtxPZcslYzaLhzoQf_C_jp9AVNEjZ-w/viewform?usp=sharing', '_blank');
};

watch(password, (newPassword) => {
    const selectedSectionId = localStorage.getItem('selectedSectionId');

    if (pwModal.value && newPassword === '0000') {
        pwModal.value = false; // Close the modal
        router.push({ name: 'buzzer', params: { id: selectedSectionId } });
    }
});
// Constants
const AVATAR_STYLES = {
    adventurer: 'adventurer',
    adventurerNeutral: 'adventurer-neutral',
    avataaars: 'avataaars',
    avataaarsNeutral: 'avataaars-neutral',
    bigEars: 'big-ears',
    bigEarsNeutral: 'big-ears-neutral',
    bigSmile: 'big-smile',
    bottts: 'bottts',
    botttsNeutral: 'bottts-neutral',
    croodles: 'croodles',
    croodlesNeutral: 'croodles-neutral',
    dylan: 'dylan',
    funEmoji: 'fun-emoji',
    glass: 'glass',
    icons: 'icons',
    identicon: 'identicon',
    initials: 'initials',
    lorelei: 'lorelei',
    loreleiNeutral: 'lorelei-neutral',
    micah: 'micah',
    miniavs: 'miniavs',
    notionists: 'notionists',
    notionistsNeutral: 'notionists-neutral',
    openPeeps: 'open-peeps',
    personas: 'personas',
    pixelArt: 'pixel-art',
    pixelArtNeutral: 'pixel-art-neutral',
    rings: 'rings',
    shapes: 'shapes',
    thumbs: 'thumbs'
};

const defaultAvatar = 'https://api.dicebear.com/9.x/big-ears-neutral/svg?seed=random';

// State
const name = ref('');
const seeder = ref(name.value);
const avatarUrl = ref(
    localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).avatar : null
);

const selectedStyle = ref(AVATAR_STYLES.micah);
const selectedSection = ref(localStorage.getItem('selectedSectionId') || null);
const selectedName = ref(
    localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).id : null
);

const isAvatarLoading = ref(true); // Loading state for the avatar

const handleAvatarError = () => {
    isAvatarLoading.value = false;
    avatarUrl.value = 'https://via.placeholder.com/150'; // Fallback image
};
const sectionGrouped = ref([]);
const isMenuOpen = ref(false);

// Watchers
watchEffect(() => {
    const seed = seeder.value || selectedName.value || 'random';
    avatarUrl.value = `https://api.dicebear.com/9.x/${selectedStyle.value}/svg?seed=${seed}`;
});

// Methods
const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};

const selectStyle = (style) => {
    selectedStyle.value = style;
    localStorage.setItem('selectedStyle', style);
    isMenuOpen.value = false;
};

const randomizeSeed = () => {
    seeder.value = Math.random().toString(36).substring(2, 10);
};

const showGform = ref(false)

const handleJoin = async () => {
    const userData = { id: selectedName.value, avatar: avatarUrl.value, device: deviceType.value, pc_number: selectedPcNumber.value };

    // Store user data locally
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userId', selectedName.value);

    try {
        // Call the backend login API
        const response = await apiServices.login(userData);

        // Check if login was successful
        localStorage.setItem('role', response.data.role);

        const selectedUser = sectionGrouped.value
            .flatMap(section => section.users)
            .find(user => user.id === selectedName.value);

        if (selectedUser) {
            localStorage.setItem('userName', selectedUser.name);
        } else {
            console.warn('User not found in section grouping.');
        }

        const selectedSectionId = localStorage.getItem('selectedSectionId');
        if (!selectedSectionId) {
            throw new Error("No section selected.");
        }
        if (response.data.role == 'admin') {
            pwModal.value = true;

        } else {
            if (deviceType.value == null) {
                toast.add({
                    severity: 'warn',
                    summary: 'Device type',
                    detail: 'Select the device you are using',
                    life: 3000,
                }); return
            }
            router.push({ name: 'user', params: { id: selectedSectionId } });

        }

        // Navigate to the buzzer page with the selected section ID
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;

        console.error('Error logging in user:', errorMessage);
        // Show error message using toast
        toast.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: errorMessage,
            life: 3000,
        });
    }
};


const getSectionGrouping = async () => {
    try {
        const response = await apiServices.getSectionGrouping();
        sectionGrouped.value = response.map(section => ({
            ...section,
            users: section.users.map(user => ({
                ...user,
                avatar: user.avatar || defaultAvatar,
            })),
        }));
        console.log(sectionGrouped.value)
    } catch (error) {
        console.error('Error fetching section grouping:', error.message);
    }
};

watch(selectedSection, (newSectionId) => {
    const selected = sectionGrouped.value.find(section => section.section_id === newSectionId);
    if (selected) {
        localStorage.setItem('selectedSectionId', selected.section_id);
        localStorage.setItem('selectedSectionName', selected.section_name);
    }
});

// Lifecycle
onMounted(() => {
    getSectionGrouping();
});
</script>


<style>
select {
    max-height: 100px;
    overflow-y: auto;
}
</style>
