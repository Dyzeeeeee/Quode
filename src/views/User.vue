<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import ApiServices from '@/services/V3Services';
import Pusher from 'pusher-js';
import { useRoute, useRouter } from 'vue-router';
import { Avatar } from 'primevue';

const route = useRoute();
const router = useRouter();

const avatar = ref('');

const apiServices = new ApiServices();
const lockScroll = ref(true);
const selectedActivity = ref(null);
const isActivityNotDone = (activityId) => {
    // Check if userActivities is empty
    if (!userActivities.value || userActivities.value.length === 0) {
        return true; // Default to "not done" if no activities are loaded yet
    }

    // Find the activity by activity_id in the data array
    const activity = userActivities.value.find(act => act.activity_id == activityId);

    // Log the activity object and its is_done value
    console.log('Activity:', activity);
    console.log('is_done value:', activity ? activity.is_done : 'Activity not found');

    // If the activity does not exist, assume it is not done
    if (!activity) {
        return true;
    }

    // Check if the activity is not done
    return activity.is_done == '0'; // '0' means not done
};




const userActivities = ref([]);

const getUserActivities = async (userId) => {
    try {
        // userId = userId.value;
        // Make the API call and store the response in userActivities
        const response = await apiServices.getUserActivities(userId);

        // Ensure the data is available
        if (response && response.data) {
            userActivities.value = response.data;
        } else {
            console.error("No activities found for this user.");
        }
    } catch (error) {
        console.error("Error fetching user activities:", error);
    }
};


async function fetchActivities() {
    const response = await apiServices.getActivities();

    // Map over the fetched activities and add the imageUrl based on id
    activities.value = response.data.map(activity => {
        let imageUrl = '';

        // Set the imageUrl based on the id
        switch (activity.id) {
            case "1":
                imageUrl = "https://web.pulsar-edit.dev/public/pulsar_name.svg";
                break;
            case "2":
                imageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnG3kN4_Me43M3PhswT3YgDH7X23ttexfmwg&ss";
                break;
            case "3":
                imageUrl = "https://cdn-icons-png.flaticon.com/256/25/25231.png";
                break;
            default:
                imageUrl = ""; // Provide a default or placeholder image if needed
        }

        // Return the activity with the added imageUrl
        return {
            ...activity,
            imageUrl
        };
    });

    console.log(activities.value);
}

const previewPulsar = ref(false)
const userName = ref(localStorage.getItem('userName') || '');
const sectionName = ref(localStorage.getItem('selectedSectionName') || '');

const isDoneMap = ref({});  // Object to store is_done based on activity_id

const markAsDone = async () => {
    if (loading.value) return; // Prevent duplicate clicks
    loading.value = true; // Set loading state to true

    const data = {
        user_id: userId.value,
        activity_id: selectedActivity.value.id
    };

    console.log('Selected activity ID:', selectedActivity.value.id);

    try {
        // Make the API call and wait for the response
        const response = await apiServices.markAsDone(data);

        // Debugging: log the response to see the actual structure
        console.log('API Response:', response);

        if (response && response.is_done !== undefined) {
            isDoneMap.value[selectedActivity.value.id] = response.is_done;
            console.log("Activity marked as done:", response.is_done);

            await getUserActivities(userId.value);
            loading.value = false; // Reset loading state

        } else {
            console.error('Error: is_done not found in the response.');
        }
    } catch (error) {
        console.error('Error while marking activity as done:', error);
    } finally {
        loading.value = false; // Reset loading state
    }
};



const unmarkLoading = ref(false); // Reactive variable for unmark loading state

const unmarkAsDone = async () => {
    if (unmarkLoading.value) return; // Prevent duplicate clicks
    unmarkLoading.value = true; // Set loading state to true

    const data = {
        user_id: userId.value,
        activity_id: selectedActivity.value.id
    };

    console.log('Selected activity ID:', selectedActivity.value.id);

    try {
        // Make the API call and wait for the response
        const response = await apiServices.unmarkAsDone(data);

        // Debugging: log the response to see the actual structure
        console.log('API Response:', response);

        if (response && response.is_done !== undefined) {
            isDoneMap.value[selectedActivity.value.id] = response.is_done;
            console.log("Activity unmarked, is_done for activity_id:", selectedActivity.value.id, "is_done:", isDoneMap.value[selectedActivity.value.id]);

            await getUserActivities(userId.value);
            unmarkLoading.value = false; // Reset loading state

        } else {
            console.error('Error: is_done not found in the response.');
        }
    } catch (error) {
        console.error('Error while unmarking activity as done:', error);
    } finally {
        unmarkLoading.value = false; // Reset loading state
    }
};


const loading = ref(false); // Reactive variable to track loading state

const userId = ref(localStorage.getItem('userId'))


// Sample activities data
const activities = ref([]);
const handleLeave = async () => {
    const data = {
        user_id: userId.value
    };

    try {
        // Save the keys you want to preserve
        const selectedSectionId = localStorage.getItem('selectedSectionId');
        const userData = localStorage.getItem('userData');
        const selectedSectionName = localStorage.getItem('selectedSectionName');

        // Clear the localStorage
        localStorage.clear();

        // Restore the preserved keys
        if (selectedSectionId) localStorage.setItem('selectedSectionId', selectedSectionId);
        if (userData) localStorage.setItem('userData', userData);
        if (selectedSectionName) localStorage.setItem('selectedSectionName', selectedSectionName);

        // Call the logout API
        await apiServices.logout(data);

        // Redirect to the initial route
        router.push('/');
    } catch (error) {
        console.error('Error during logout:', error);
    }
};
onMounted(() => {
    const lockScrollForLargeScreens = () => {
        if (window.matchMedia("(min-width: 768px)").matches) {
            // Lock scrolling for screens 768px and above
            document.body.style.overflow = lockScroll.value ? "hidden" : "";
        } else {
            // Allow scrolling for smaller screens
            document.body.style.overflow = "";
        }
    };

    // Run on initial load
    lockScrollForLargeScreens();

    // Listen for screen size changes
    window.addEventListener("resize", lockScrollForLargeScreens);

    getUserActivities(userId.value);
    fetchActivities();

    const userData = localStorage.getItem("userData");
    if (userData) {
        try {
            const parsedData = JSON.parse(userData);
            avatar.value = parsedData.avatar || ""; // Default to an empty string if `avatar` is not set
        } catch (error) {
            console.error("Error parsing userData:", error);
        }
    }
});

onBeforeUnmount(() => {
    document.body.style.overflow = ""; // Reset overflow on unmount
    window.removeEventListener("resize", lockScrollForLargeScreens);
});

</script>


<template>
    <div class="flex gap-4 xl:px-4 items-center justify-center min-h-screen bg-[#274461] text-white">
        <video autoplay muted playsinline
            class="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none xl:flex hidden">
            <source src="@/assets/images/appbg-flip.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <!-- <div
            class="bg-[#1c1f23] xl:bg-black border-white border-2 flex flex-col xl:w-[20%]  w-full rounded-lg p-4  h-[90vh]">

        </div> -->
        <div
            class="bg-[#1c1f23] xl:bg-black border-white border-2 flex flex-col xl:w-[100%] w-full rounded-lg p-4  xl:h-[90vh] gap-3">
            <div class="flex gap-2 justify-between bg-[#274461] relative rounded-lg">
                <div class="relative w-full bg-[#274461] rounded-lg p-3 flex-1 flex gap-2">
                    <img :src="avatar" alt="User Avatar"
                        class="self-center w-12 h-12 object-cover rounded-full border-[#0ed494] border-[3px] bg-[#274461]" />
                    <div class="flex flex-col">
                        <div class="self-center text-xl font-bold"> {{ userName }}</div>
                        <div class=" text-sm">{{ sectionName }}</div>
                    </div>
                </div>
                <div class="p-3 text-red-400">
                    <button
                        class="rounded-lg border-red-500 border-2 xl:w-32 xl:h-12 h-auto w-auto p-2 xl:p-0 self-center flex gap-2 items-center justify-center font-bold "
                        @click="handleLeave()">
                        <Icon icon="streamline:interface-logout-arrow-exit-frame-leave-logout-rectangle-right" />
                        <div class="xl:flex hidden">Leave</div>
                    </button>
                </div>
            </div>
            <div class="flex gap-3 h-auto xl:h-full flex-wrap">
                <div class="h-auto xl:h-full bg-[#274461] relative rounded-lg xl:w-[30%] p-3 w-[100%]">
                    <div class="text-2xl font-bold px-3 py-1">Activities</div>
                    <div class="border-white border-2 border-opacity-40 rounded-lg p-3 space-y-2">
                        <!-- Loop through activities -->
                        <div v-for="activity in activities" :key="activity.title"
                            :class="`bg-[#435b72] p-3 rounded flex justify-between cursor-pointer  ${selectedActivity === activity ? 'border-2 border-emerald-500 bg-[#648eb6]' : ''}`"
                            @click="selectedActivity = activity">
                            <div>
                                <div class="text-lg font-medium">{{ activity.name }}</div>
                                <div class="text-sm">{{ activity.description }}</div>
                            </div>
                            <div class="self-center">
                                <img :src="activity.imageUrl" alt=""
                                    class="rounded-full h-12 w-12 bg-white border-[${activity.borderColor}] border-2">
                            </div>
                        </div>

                    </div>
                </div>
                <div class="xl:h-full h-auto bg-[#274461] relative rounded-lg flex-1"
                    v-if="selectedActivity && selectedActivity.id === '1'">
                    <div class="p-3  rounded">
                        <div class="text-3xl font-bold">Pulsar Setup
                        </div>
                        <div class="">Connecting my Github Account to Pulsar
                        </div>
                    </div>
                    <div class="p-3 flex justify-between flex-col xl:flex-row">
                        <div class="flex gap-2 flex-col xl:flex-row">
                            <button class="flex gap-2 rounded-lg bg-yellow-600 p-2 items-center">
                                <Icon icon="mdi:help-outline" height="20" />
                                <div>Request for Help</div>
                            </button>
                            <button class="flex gap-2 rounded-lg bg-emerald-500 p-2 items-center" @click="markAsDone"
                                :disabled="loading" v-if="isActivityNotDone(1) || !userActivities">
                                <Icon v-if="!loading" icon="iconamoon:check-bold" height="20" />
                                <Icon v-else icon="eos-icons:loading" height="20" class="animate-spin" />
                                <div v-if="!loading">Mark as Done</div>
                                <div v-else>Loading...</div>
                            </button>
                            <button class="flex gap-2 rounded-lg bg-red-500 p-2 items-center" @click="unmarkAsDone"
                                :disabled="unmarkLoading" v-else>
                                <Icon v-if="!unmarkLoading" icon="material-symbols:undo" height="20" />
                                <Icon v-else icon="eos-icons:loading" height="20" class="animate-spin" />
                                <div v-if="!unmarkLoading">Unmark as Done</div>
                                <div v-else>Loading...</div>
                            </button>


                        </div>
                        <div class="flex gap-2 flex-col xl:flex-row mt-2 xl:mt-0">
                            <button class="flex gap-2 rounded-lg bg-blue-500 p-2 items-center w-full">
                                <a href="/src/assets/files/pulsar.pdf" download="pulsar-guide.pdf"
                                    class="flex gap-2 items-center text-white">
                                    <Icon icon="material-symbols:download-sharp" height="20" />
                                    <div>Download guide</div>
                                </a>
                            </button>

                            <button @click="previewPulsar = !previewPulsar"
                                class=" gap-2 rounded-lg border-2 border-blue-500  text-blue-500 p-2 items-center xl:flex hidden">
                                <Icon icon="lets-icons:view-fill" height="20" />
                                <div>Preview </div>
                            </button>
                        </div>
                    </div>
                    <div class="p-3  h-[55vh]xl:block hidden rounded-rounded">
                        <iframe src="/src/assets/files/pulsar.pdf" width="100%" height="100%" class="rounded"
                            v-if="previewPulsar"></iframe>
                    </div>

                </div>
                <div class="xl:h-full h-auto bg-[#274461] relative rounded-lg flex-1"
                    v-else-if="selectedActivity && selectedActivity.id === '2'">
                    <div class="p-3  rounded">
                        <div class="text-3xl font-bold">My Lyrics Pages </div>
                        <div class="">Application of HTML and CSS
                        </div>
                    </div>
                    <div class="p-3 flex justify-between flex-col xl:flex-row">
                        <div class="flex gap-2 flex-col xl:flex-row">
                            <button class="flex gap-2 rounded-lg bg-yellow-600 p-2 items-center">
                                <Icon icon="mdi:help-outline" height="20" />
                                <div>Request for Help</div>
                            </button>
                            <button class="flex gap-2 rounded-lg bg-emerald-500 p-2 items-center" @click="markAsDone"
                                :disabled="loading" v-if="isActivityNotDone(2) || !userActivities">
                                <Icon v-if="!loading" icon="iconamoon:check-bold" height="20" />
                                <Icon v-else icon="eos-icons:loading" height="20" class="animate-spin" />
                                <div v-if="!loading">Mark as Done</div>
                                <div v-else>Loading...</div>
                            </button>
                            <button class="flex gap-2 rounded-lg bg-red-500 p-2 items-center" @click="unmarkAsDone"
                                :disabled="unmarkLoading" v-else>
                                <Icon v-if="!unmarkLoading" icon="material-symbols:undo" height="20" />
                                <Icon v-else icon="eos-icons:loading" height="20" class="animate-spin" />
                                <div v-if="!unmarkLoading">Unmark as Done</div>
                                <div v-else>Loading...</div>
                            </button>


                        </div>
                        <div class="flex gap-2 flex-col xl:flex-row mt-2 xl:mt-0">
                            <!-- <button class="flex gap-2 rounded-lg bg-blue-500 p-2 items-center w-full">
                                <a href="/src/assets/files/pulsar.pdf" download="pulsar-guide.pdf"
                                    class="flex gap-2 items-center text-white">
                                    <Icon icon="material-symbols:download-sharp" height="20" />
                                    <div>Download guide</div>
                                </a>
                            </button> -->
                            <!-- 
                            <button @click="previewPulsar = !previewPulsar"
                                class=" gap-2 rounded-lg border-2 border-blue-500  text-blue-500 p-2 items-center xl:flex hidden">
                                <Icon icon="lets-icons:view-fill" height="20" />
                                <div>Preview </div>
                            </button> -->
                        </div>
                    </div>
                    <div class="p-3  h-[55vh]xl:block hidden rounded-rounded">
                        <iframe src="/src/assets/files/pulsar.pdf" width="100%" height="100%" class="rounded"
                            v-if="previewPulsar"></iframe>
                    </div>

                </div>
                <div class="xl:h-full h-auto bg-[#274461] relative rounded-lg flex-1"
                    v-else-if="selectedActivity && selectedActivity.id === '3'">
                    <div class="p-3  rounded">
                        <div class="text-3xl font-bold">Github Deployment
                        </div>
                        <div class="">Deploying my lyrics page into Github
                        </div>
                    </div>
                    <div class="p-3 flex justify-between flex-col xl:flex-row">
                        <div class="flex gap-2 flex-col xl:flex-row">
                            <button class="flex gap-2 rounded-lg bg-yellow-600 p-2 items-center">
                                <Icon icon="mdi:help-outline" height="20" />
                                <div>Request for Help</div>
                            </button>
                            <button class="flex gap-2 rounded-lg bg-emerald-500 p-2 items-center" @click="markAsDone"
                                :disabled="loading" v-if="isActivityNotDone(3) || !userActivities">
                                <Icon v-if="!loading" icon="iconamoon:check-bold" height="20" />
                                <Icon v-else icon="eos-icons:loading" height="20" class="animate-spin" />
                                <div v-if="!loading">Mark as Done</div>
                                <div v-else>Loading...</div>
                            </button>
                            <button class="flex gap-2 rounded-lg bg-red-500 p-2 items-center" @click="unmarkAsDone"
                                :disabled="unmarkLoading" v-else>
                                <Icon v-if="!unmarkLoading" icon="material-symbols:undo" height="20" />
                                <Icon v-else icon="eos-icons:loading" height="20" class="animate-spin" />
                                <div v-if="!unmarkLoading">Unmark as Done</div>
                                <div v-else>Loading...</div>
                            </button>


                        </div>
                        <div class="flex gap-2 flex-col xl:flex-row mt-2 xl:mt-0">
                            <button class="flex gap-2 rounded-lg bg-blue-500 p-2 items-center w-full">
                                <a href="/src/assets/files/github.pdf" download="pulsar-guide.pdf"
                                    class="flex gap-2 items-center text-white">
                                    <Icon icon="material-symbols:download-sharp" height="20" />
                                    <div>Download guide</div>
                                </a>
                            </button>

                            <button @click="previewPulsar = !previewPulsar"
                                class=" gap-2 rounded-lg border-2 border-blue-500  text-blue-500 p-2 items-center xl:flex hidden">
                                <Icon icon="lets-icons:view-fill" height="20" />
                                <div>Preview </div>
                            </button>
                        </div>
                    </div>
                    <div class="p-3  h-[55vh]xl:block hidden rounded-rounded">
                        <iframe src="/src/assets/files/github.pdf" width="100%" height="100%" class="rounded"
                            v-if="previewPulsar"></iframe>
                    </div>

                </div>
                <div class="h-full bg-[#274461] relative rounded-lg flex-1 gap-3 text-3xl justify-center flex items-center"
                    v-else>
                    <Icon icon="tdesign:gesture-click-filled" height="40" />
                    Select an activity
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
