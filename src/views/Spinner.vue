<template>
    <div class="flex justify-center items-center h-screen bg-gray-100">
      <div class="relative">
        <div
          ref="rouletteWheel"
          class="w-96 h-96 rounded-full border-4 border-gray-800 flex items-center justify-center"
          :style="wheelStyle"
          @click="spinWheel"
        >
          <div
            class="absolute inset-0 rounded-full"
            :style="spinnerStyle"
            :class="spinning ? 'spin' : ''"
          >
            <div
              v-for="(name, index) in names"
              :key="index"
              class="absolute w-2/2 text-center transform origin-center"
              :style="getRotationStyle(index)"
            >
              <div
                class="flex justify-center items-center w-full h-full text-white font-semibold"
                :style="getBgColorStyle(index)"
              >
                {{ name }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="spinning" class="mt-6 text-xl text-gray-800">
          Spinning...
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // Random names for the roulette options
  const names = [
    'John', 'Alice', 'Bob', 'Charlie', 'Dana', 'Eve', 'Frank', 'Grace', 'Hannah', 'Isaac'
  ];
  
  // Data for handling wheel animation
  const spinning = ref(false);
  const rotation = ref(0);
  const wheelStyle = ref({
    transform: `rotate(${rotation.value}deg)`
  });
  
  const spinnerStyle = ref({
    transition: spinning.value ? 'transform 5s ease-out' : '',
  });
  
  const spinWheel = () => {
    spinning.value = true;
    const randomDegree = Math.floor(Math.random() * 360) + 3600; // Spin at least 10 full rotations
    rotation.value += randomDegree;
  
    setTimeout(() => {
      spinning.value = false;
      // Find the selected name after the spin
      const selectedIndex = Math.floor(((rotation.value % 360) / 360) * names.length);
      alert(`Winner: ${names[selectedIndex]}`);
    }, 5000);
  };
  
  const getRotationStyle = (index) => {
    const angle = (360 / names.length) * index;
    return {
      transform: `rotate(${angle}deg) translateY(-50%)`,
      top: '50%',
      left: '50%',
      transformOrigin: 'center',
    };
  };
  
  // Assign random background colors for each section
  const getBgColorStyle = (index) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-gray-500'
    ];
    return {
      backgroundColor: colors[index % colors.length]
    };
  };
  </script>
  
  <style scoped>
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .spin {
    animation: spin 5s ease-out;
  }
  </style>
  