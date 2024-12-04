<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <video autoplay muted playsinline
            class="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none">
            <source src="@/assets/images/appbg.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>

        <!-- <img src="@/assets/images/appbg.jpg" alt="Background Image" class="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none" /> -->
        <div
            class="p-8 rounded-lg shadow-lg w-full sm:w-full md:w-[60%] lg:w-[40%] relative bg-[#274461] bg-opacity-70">
            <div class="flex-1 flex justify-center transform opacity self-center mb-5"><img
                    src="@/assets/images/QuodE.png" alt="" class="xl:h-32 h-24" /></div>
            <div class="flex flex-col md:flex-row gap-3">
                <div
                    class="mt-4 flex justify-center relative  xl:max-w-52 xl:max-h-52 max-h-40  max-w-40  self-center rounded-full p-4 bg-[#274461]">
                    <img :src="avatarUrl" alt="Random Character"
                        class="w-full h-full object-cover rounded-full border-[#0ed494] border-[5px] bg-emerald-400" />
                    <button @click="toggleMenu"
                        class="absolute bottom-2 p-1 left-0 mb-2 mr-2 bg-[#274461] text-white rounded-full z-100">
                        <Icon icon="material-symbols:styler-outline"
                            class="xl:h-[45px] xl:w-[45px] h-[35px] w-[35px]" />
                    </button>
                    <button class="absolute bottom-2 right-0 mb-2 mr-2 bg-[#274461] p-1 text-white rounded-full z-100"
                        @click="randomizeSeed">
                        <Icon icon="game-icons:perspective-dice-six-faces-random"
                            class="xl:h-[45px] xl:w-[45px] h-[35px] w-[35px]" />
                    </button>
                </div>

                <div class="flex flex-col gap-3 justify-center w-full">
                    <div class="w-full">
                        <div class="text-white text-xl font-bold">Who are you?</div>
                    </div>

                    <!-- Section Dropdown -->
                    <div class="w-full cursor-pointer">
                        <select v-model="selectedSection"
                            class="w-full p-2 border border-gray-300 rounded-md bg-gray-400 bg-opacity-50 font-bold text-xl text-white cursor-pointer">
                            <option disabled value="">Select Section</option>
                            <option v-for="(section, index) in sectionGrouped" :key="index" :value="section.section_id"
                                class="text-gray-700">
                                {{ section.section_name }}
                            </option>
                        </select>
                    </div>

                    <!-- Name Dropdown -->
                    <div class="w-full cursor-pointer" v-if="selectedSection">
                        <select v-model="selectedName"
                            class="w-full p-2 border border-gray-300 rounded-md bg-gray-400 bg-opacity-50 font-bold text-xl text-white cursor-pointer">
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
                    class="bg-[#0ed494] text-[#274461] p-3 text-xl rounded-lg w-full font-bold transform transition-all duration-150 ease-in-out shadow-[4px_4px_10px_rgba(0,0,0,0.5)] active:scale-95 active:shadow-none">
                    JOIN
                </button>
            </div>
        </div>


        <!-- Avatar Style Selection Modal -->
        <div v-if="isMenuOpen" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div
                class="bg-[#0ed494] bg-opacity-90 p-6 rounded-lg shadow-lg w-[100vw] h-[100vh] sm:w-[95vw] md:w-[80vw] lg:w-[90vw]">
                <h3 class="text-3xl font-bold mb-4 text-white">Select Avatar Style</h3>
                <div
                    class="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-10 gap-4 lg:gap-2 h-[80vh] overflow-y-auto scrollable">
                    <div v-for="(style, key) in AVATAR_STYLES" :key="key" class="flex flex-col items-center gap-2">
                        <!-- Avatar Sample Image -->
                        <div @click="selectStyle(style)"
                            class="justify-center flex flex-col items-center cursor-pointer bg-[#274461] xl:w-40 w-24 h-30 xl:h-auto rounded-lg p-2">
                            <img :src="`https://api.dicebear.com/9.x/${style}/svg?seed=random`" alt="Sample Avatar"
                                class="xl:w-24 xl:h-24 w-16 h-16 object-cover rounded-full mb-2" />
                            <!-- Style Name Button -->
                            <button class="xl:w-full py-2 text-center text-white rounded-md h-[5rem]">
                                {{ style.charAt(0).toUpperCase() + style.slice(1) }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

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

const randomizeSeed = () => {
    seeder.value = Math.random().toString(36).substring(2, 10); // Random seed string
};

const name = ref('');
const seeder = ref(name.value);

const selectedSection = ref('');
const selectedName = ref('');
const avatarUrl = ref('');
const selectedStyle = ref(AVATAR_STYLES.micah); // Default style
const isMenuOpen = ref(false); // Controls the visibility of the modal

// Generate avatar when the component is mounted or name/selectedStyle is changed
watchEffect(() => {
    const seed = seeder.value || selectedName.value || 'random'; // Use name or fallback to 'random'
    avatarUrl.value = `https://api.dicebear.com/9.x/${selectedStyle.value}/svg?seed=${seed}`;
});

// Toggle the visibility of the menu overlay
const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
};

// Set the selected avatar style and close the menu
const selectStyle = (style) => {
    selectedStyle.value = style;  // Update Vue ref
    sessionStorage.setItem('selectedStyle', JSON.stringify(style));  // Store in sessionStorage
    isMenuOpen.value = false;  // Close the menu
};


const handleJoin = async () => {

    const userData = {
        id: selectedName.value,
        avatar: avatarUrl.value
    };

    // Save to sessionStorage
    sessionStorage.setItem('userData', JSON.stringify(userData));
    sessionStorage.setItem('userId', selectedName.value);
    try {
        // Axios POST request to your server
        const response = await axios.post('/login', userData);
        console.log('User added successfully:', response.data);
        // Navigate to /buzzer after successful response
        sessionStorage.setItem('role', response.data.role);

        router.push(`/buzzer/${selectedSection.value}`);
    } catch (error) {
        console.error('Error adding user:', error.response?.data || error.message);
    }
};

// onMounted(() => {
//     const storedData = JSON.parse(sessionStorage.getItem('userData'));
//     if (storedData) {
//         name.value = storedData.name || '';
//         selectedSection.value = storedData.section || '';
//         selectedStyle.value = storedData.avatarStyle || AVATAR_STYLES.micah;
//         seeder.value = storedData.seed || '';
//         avatarUrl.value = storedData.avatarUrl || '';
//     }
//     if (!selectedStyle.value) {
//         const storedStyle = sessionStorage.getItem('selectedStyle');
//         if (storedStyle) {
//             selectedStyle.value = JSON.parse(storedStyle);
//         }
//     }
// });

const sectionGrouped = ref([])

const getSectionGrouping = async () => {
    try {
        const response = await axios.get(`/dropdown`);
        const defaultAvatar = 'https://api.dicebear.com/9.x/big-ears-neutral/svg?seed=random';

        // Process the response to ensure every user has an avatar
        const processedData = response.data.map(section => ({
            ...section,
            users: section.users.map(user => ({
                ...user,
                avatar: user.avatar || defaultAvatar,
            })),
        }));

        sectionGrouped.value = processedData;
    } catch (error) {
        console.error('Error fetching students:', error.message);
    }
};


onMounted(() => {
    getSectionGrouping();
});

</script>

<style>
select {
    max-height: 100px;
    /* Adjust this value to set the dropdown height */
    overflow-y: auto;
    /* Enables scrolling */
}
</style>
