<script setup>
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import ApiServices from '@/services/V3Services';
import Pusher from 'pusher-js';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const lockScroll = ref(true);

onMounted(() => {
    if (lockScroll.value) {
        document.body.style.overflow = 'hidden';  // Lock scrolling
    }
});

onBeforeUnmount(() => {
    document.body.style.overflow = '';
});
</script>

<template>
    <div class="flex gap-4 px-4 items-center justify-center min-h-screen bg-[#274461] text-white">
        <video autoplay muted playsinline
            class="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none xl:flex hidden">
            <source src="@/assets/images/appbg-flip.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        <div
            class="bg-[#1c1f23] xl:bg-black border-white border-2 flex flex-col xl:w-[20%]  w-full rounded-lg p-4  h-[90vh]">

        </div>
        <div
            class="bg-[#1c1f23] xl:bg-black border-white border-2 flex flex-col xl:w-[80%] w-full rounded-lg p-4  h-[90vh]">
            <div class="flex gap-2">
                <div class=" relative w-full bg-[#274461] rounded-lg p-3 flex-1">
                    <div class="flex justify-between">
                        <div
                            class="bg-white bg-opacity-90 rounded-full text-green p-1 text-emerald-700 text-xs flex px-3 items-center">
                            <span>
                                <Icon icon="lets-icons:up" />
                            </span>
                            <span>100%</span>
                        </div>
                        <div class=" rounded-full text-green p-1 text-white text-xs flex px-3 items-center">
                            <span>
                                <Icon icon="fe:elipsis-h" height="20" />
                            </span>
                        </div>
                    </div>
                    <div class="text-lg font-bold pt-2">
                        123456
                    </div>
                    <div class="text-sm opacity-80">
                        Students
                    </div>
                </div>
                <div class=" relative w-full bg-[#274461] rounded-lg p-2 flex-1">
                    Students
                </div>
                <div class=" relative w-full bg-[#274461] rounded-lg p-2 flex-1">
                    Students
                </div>
            </div>
        </div>
    </div>


</template>

<style scoped></style>
