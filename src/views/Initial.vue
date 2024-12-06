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
                    <img :src="avatarUrl" alt="Random Character"
                        class="w-full h-full object-cover rounded-full border-[#0ed494] border-[5px] bg-emerald-400" />
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
</template>


<script setup>
import { ref, watchEffect, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import V3Services from '@/services/V3Services';

import { useToast } from "primevue/usetoast";
const toast = useToast();

// Services and Router
const apiServices = new V3Services();
const router = useRouter();
const goToGForms = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSfNgm7617fV5wHY7ymXtxPZcslYzaLhzoQf_C_jp9AVNEjZ-w/viewform?usp=sharing', '_blank');
};
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
const avatarUrl = ref('');
const selectedStyle = ref(AVATAR_STYLES.micah);
const selectedSection = ref(localStorage.getItem('selectedSectionId') || null);
const selectedName = ref(localStorage.getItem('userId') || null);

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
    const userData = { id: selectedName.value, avatar: avatarUrl.value };

    // Store user data locally
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userId', selectedName.value);

    try {
        // Call the backend login API
        const response = await apiServices.login(userData);

        // Check if login was successful
        localStorage.setItem('role', response.data.role);

        const selectedSectionId = localStorage.getItem('selectedSectionId');
        if (!selectedSectionId) {
            throw new Error("No section selected.");
        }

        // Navigate to the buzzer page with the selected section ID
        router.push({ name: 'buzzer', params: { id: selectedSectionId } });
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
